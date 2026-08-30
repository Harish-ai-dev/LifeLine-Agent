"""
Universal DataStore for LifeLine Agent.

Provides thread-safe in-memory and live Google Cloud Firestore data storage
with seamless offline/dev fallback, standard audit metadata injection,
and comprehensive async and sync CRUD operations across all collections.

Supported collections:
- dispatch_cases: Multi-agent emergency dispatch trace and audit log
- donors: Registered blood & organ donor profiles and history
- requests: Open and matched emergency blood/organ requests
- patients: Active emergency patient medical dossiers & bay admissions
- issues: Hospital operational and equipment issues
- inventory: Medicine, blood units, and equipment stock levels
- reports: Daily AI intelligence executive reports
- hospitals: Regional facility coordinates, specialties, and bed stats
"""

import asyncio
import copy
import datetime
import json
import logging
import os
import threading
import uuid
from typing import Any, Dict, List, Optional, Tuple, Union

from lifeline.firebase import get_db

logger = logging.getLogger(__name__)

CURRENT_VERSION = "0.1.0"
COLLECTION_PREFIXES = {
    "dispatch_cases": "CASE-",
    "donors": "donor_",
    "requests": "req_",
    "patients": "pat_",
    "issues": "iss_",
    "inventory": "inv_",
    "reports": "rep_",
    "hospitals": "hosp_",
}

ALL_COLLECTIONS = [
    "dispatch_cases",
    "donors",
    "requests",
    "patients",
    "issues",
    "inventory",
    "reports",
    "hospitals",
]


def _get_utc_now_iso() -> str:
    """Return ISO 8601 formatted UTC timestamp string with Z suffix."""
    return datetime.datetime.now(datetime.timezone.utc).strftime("%Y-%m-%dT%H:%M:%SZ")


def _generate_doc_id(collection: str) -> str:
    """Generate a readable document ID with collection prefix."""
    prefix = COLLECTION_PREFIXES.get(collection, f"{collection[:4]}_")
    if prefix.endswith("-"):
        return f"{prefix}{uuid.uuid4().int % 9000 + 1000}"
    hex_suffix = uuid.uuid4().hex[:6]
    return f"{prefix}{hex_suffix}"


class DataStore:
    """
    Universal DataStore supporting both Firestore and in-memory storage.
    
    When Firestore credentials are valid, reads/writes are routed to GCP.
    Otherwise, operations use an in-memory dictionary protected by an RLock
    and automatically seeded from `data/seed_data.json`.
    """

    def __init__(self, auto_seed: bool = True, seed_file_path: Optional[str] = None):
        self._lock = threading.RLock()
        self._memory_db: Dict[str, Dict[str, Dict[str, Any]]] = {
            col: {} for col in ALL_COLLECTIONS
        }
        self._seed_file_path = seed_file_path or os.path.join(
            os.path.dirname(os.path.dirname(os.path.dirname(__file__))),
            "data",
            "seed_data.json",
        )
        self._hospitals_file_path = os.path.join(
            os.path.dirname(os.path.dirname(os.path.dirname(__file__))),
            "data",
            "hospitals.json",
        )

        if auto_seed:
            self._load_seed_if_needed()

    @property
    def is_live_firestore(self) -> bool:
        """Check if live Firestore client is connected."""
        try:
            return get_db() is not None
        except Exception:
            return False

    def _load_seed_if_needed(self) -> None:
        """Load initial seed data if in-memory store is empty."""
        with self._lock:
            total_items = sum(len(docs) for docs in self._memory_db.values())
            if total_items == 0:
                self.seed_from_file(self._seed_file_path, overwrite=False)
                self._load_hospitals_from_file()

    def _load_hospitals_from_file(self) -> None:
        """Load hospitals from hospitals.json if available."""
        if os.path.exists(self._hospitals_file_path):
            try:
                with open(self._hospitals_file_path, "r", encoding="utf-8") as f:
                    hospitals = json.load(f)
                with self._lock:
                    for h in hospitals:
                        doc_id = h.get("id") or h.get("_id") or _generate_doc_id("hospitals")
                        record = copy.deepcopy(h)
                        record["_id"] = doc_id
                        record["id"] = doc_id
                        record["_timestamp"] = record.get("_timestamp") or _get_utc_now_iso()
                        record["_version"] = record.get("_version") or CURRENT_VERSION
                        record["_actor"] = record.get("_actor") or "seed"
                        self._memory_db["hospitals"][doc_id] = record
            except Exception as e:
                logger.warning(f"Failed to load hospitals.json into DataStore: {e}")

    def seed_from_file(self, file_path: Optional[str] = None, overwrite: bool = False) -> None:
        """Seed the data store from a JSON file."""
        target_path = file_path or self._seed_file_path
        if not os.path.exists(target_path):
            logger.info(f"Seed file not found at {target_path}, skipping seed_from_file.")
            return

        try:
            with open(target_path, "r", encoding="utf-8") as f:
                data = json.load(f)
            self.seed(data, overwrite=overwrite)
        except Exception as e:
            logger.warning(f"Error loading seed file {target_path}: {e}")

    def seed(self, seed_data: Dict[str, Any], overwrite: bool = False) -> None:
        """
        Seed memory database with provided dictionary mapping collection -> list of items.
        """
        with self._lock:
            for collection, items in seed_data.items():
                if collection not in self._memory_db:
                    self._memory_db[collection] = {}
                if overwrite:
                    self._memory_db[collection].clear()

                if isinstance(items, list):
                    for item in items:
                        if not isinstance(item, dict):
                            continue
                        doc_id = item.get("_id") or item.get("id") or _generate_doc_id(collection)
                        record = copy.deepcopy(item)
                        record["_id"] = doc_id
                        if "id" not in record:
                            record["id"] = doc_id
                        record["_timestamp"] = record.get("_timestamp") or _get_utc_now_iso()
                        record["_version"] = record.get("_version") or CURRENT_VERSION
                        record["_actor"] = record.get("_actor") or "seed"
                        self._memory_db[collection][doc_id] = record

    def clear(self, collection: Optional[str] = None) -> None:
        """Clear all records from a specific collection or all collections."""
        with self._lock:
            if collection:
                if collection in self._memory_db:
                    self._memory_db[collection].clear()
            else:
                for col in self._memory_db:
                    self._memory_db[col].clear()

    # ── Standard Synchronous CRUD Operations ──────────────────────────────────

    def create(
        self,
        collection: str,
        data: Dict[str, Any],
        doc_id: Optional[str] = None,
        actor: str = "system",
    ) -> Dict[str, Any]:
        """
        Create a new document in the specified collection.
        Injects standard audit metadata: _id, _timestamp, _version, _actor.
        """
        record = copy.deepcopy(data)
        determined_id = doc_id or record.get("_id") or record.get("id") or _generate_doc_id(collection)
        timestamp = _get_utc_now_iso()

        record["_id"] = str(determined_id)
        if "id" not in record:
            record["id"] = str(determined_id)
        record["_timestamp"] = timestamp
        record["_version"] = CURRENT_VERSION
        record["_actor"] = actor

        # Firestore write if live
        db = get_db()
        if db is not None:
            try:
                doc_ref = db.collection(collection).document(str(determined_id))
                doc_ref.set(record)
                return copy.deepcopy(record)
            except Exception as e:
                logger.warning(f"Firestore create error in {collection}: {e}, falling back to in-memory.")

        # In-memory storage
        with self._lock:
            if collection not in self._memory_db:
                self._memory_db[collection] = {}
            self._memory_db[collection][str(determined_id)] = copy.deepcopy(record)

        return copy.deepcopy(record)

    def get(self, collection: str, doc_id: str) -> Optional[Dict[str, Any]]:
        """
        Retrieve a single document by collection and document ID.
        """
        db = get_db()
        if db is not None:
            try:
                doc_ref = db.collection(collection).document(str(doc_id))
                snap = doc_ref.get()
                if snap.exists:
                    doc_dict = snap.to_dict() or {}
                    doc_dict["_id"] = snap.id
                    if "id" not in doc_dict:
                        doc_dict["id"] = snap.id
                    return doc_dict
                return None
            except Exception as e:
                logger.warning(f"Firestore get error for {collection}/{doc_id}: {e}")

        # In-memory fallback
        with self._lock:
            col_dict = self._memory_db.get(collection, {})
            doc = col_dict.get(str(doc_id))
            if doc is not None:
                return copy.deepcopy(doc)
            return None

    def update(
        self,
        collection: str,
        doc_id: str,
        updates: Dict[str, Any],
        actor: str = "system",
    ) -> Optional[Dict[str, Any]]:
        """
        Update fields on an existing document in the specified collection.
        Updates _timestamp and _actor metadata.
        """
        timestamp = _get_utc_now_iso()
        safe_updates = copy.deepcopy(updates)
        safe_updates["_timestamp"] = timestamp
        safe_updates["_actor"] = actor

        db = get_db()
        if db is not None:
            try:
                doc_ref = db.collection(collection).document(str(doc_id))
                doc_ref.update(safe_updates)
                snap = doc_ref.get()
                if snap.exists:
                    doc_dict = snap.to_dict() or {}
                    doc_dict["_id"] = snap.id
                    if "id" not in doc_dict:
                        doc_dict["id"] = snap.id
                    return doc_dict
            except Exception as e:
                logger.warning(f"Firestore update error for {collection}/{doc_id}: {e}")

        # In-memory fallback
        with self._lock:
            col_dict = self._memory_db.get(collection, {})
            if str(doc_id) not in col_dict:
                return None
            current_doc = col_dict[str(doc_id)]
            current_doc.update(safe_updates)
            return copy.deepcopy(current_doc)

    def delete(self, collection: str, doc_id: str) -> bool:
        """
        Delete a document by collection and document ID.
        """
        db = get_db()
        if db is not None:
            try:
                db.collection(collection).document(str(doc_id)).delete()
                return True
            except Exception as e:
                logger.warning(f"Firestore delete error for {collection}/{doc_id}: {e}")

        with self._lock:
            col_dict = self._memory_db.get(collection, {})
            if str(doc_id) in col_dict:
                del col_dict[str(doc_id)]
                return True
            return False

    def query(
        self,
        collection: str,
        filters: Optional[Union[Dict[str, Any], List[Tuple[str, str, Any]]]] = None,
        order_by: Optional[str] = None,
        descending: bool = False,
        limit: Optional[int] = None,
        offset: int = 0,
    ) -> List[Dict[str, Any]]:
        """
        Query documents in a collection with filtering, ordering, and pagination.
        
        filters can be:
        - Dict of field=value (e.g. {"status": "open", "hospital_id": "hosp_mumbai_01"})
        - List of tuples: [(field, op, val), ...] (e.g. [("age", ">=", 50), ("status", "==", "open")])
        """
        db = get_db()
        if db is not None:
            try:
                query_ref = db.collection(collection)
                if filters:
                    if isinstance(filters, dict):
                        for field, val in filters.items():
                            if val is not None:
                                query_ref = query_ref.where(field, "==", val)
                    elif isinstance(filters, list):
                        for field, op, val in filters:
                            query_ref = query_ref.where(field, op, val)

                if order_by:
                    from firebase_admin import firestore as fb_fs
                    direction = fb_fs.Query.DESCENDING if descending else fb_fs.Query.ASCENDING
                    query_ref = query_ref.order_by(order_by, direction=direction)

                if offset > 0:
                    query_ref = query_ref.offset(offset)
                if limit is not None:
                    query_ref = query_ref.limit(limit)

                docs = query_ref.stream()
                results = []
                for doc in docs:
                    d = doc.to_dict() or {}
                    d["_id"] = doc.id
                    if "id" not in d:
                        d["id"] = doc.id
                    results.append(d)
                return results
            except Exception as e:
                logger.warning(f"Firestore query error in {collection}: {e}, falling back to in-memory.")

        # In-memory query logic
        with self._lock:
            col_dict = self._memory_db.get(collection, {})
            items = list(col_dict.values())

            # Apply filtering
            if filters:
                filtered_items = []
                for item in items:
                    matches = True
                    if isinstance(filters, dict):
                        for field, expected_val in filters.items():
                            if expected_val is None:
                                continue
                            actual_val = item.get(field)
                            if actual_val != expected_val:
                                matches = False
                                break
                    elif isinstance(filters, list):
                        for field, op, expected_val in filters:
                            actual_val = item.get(field)
                            if not self._evaluate_operator(actual_val, op, expected_val):
                                matches = False
                                break
                    if matches:
                        filtered_items.append(item)
                items = filtered_items

            # Apply ordering
            if order_by:
                def sort_key(doc: Dict[str, Any]) -> Any:
                    val = doc.get(order_by)
                    if val is None:
                        return "" if isinstance(val, str) else 0
                    return val

                try:
                    items = sorted(items, key=sort_key, reverse=descending)
                except Exception as e:
                    logger.debug(f"Sorting error on key {order_by}: {e}")

            # Apply pagination / limits
            if offset > 0:
                items = items[offset:]
            if limit is not None:
                items = items[:limit]

            return [copy.deepcopy(item) for item in items]

    def _evaluate_operator(self, actual: Any, op: str, expected: Any) -> bool:
        """Evaluate a binary comparison operator for in-memory querying."""
        try:
            if op == "==":
                return actual == expected
            elif op == "!=":
                return actual != expected
            elif op == "<":
                return actual < expected
            elif op == "<=":
                return actual <= expected
            elif op == ">":
                return actual > expected
            elif op == ">=":
                return actual >= expected
            elif op == "in":
                return actual in expected if expected is not None else False
            elif op == "array_contains":
                if isinstance(actual, (list, tuple, set)):
                    return expected in actual
                return False
            return False
        except Exception:
            return False

    def list_all(self, collection: str) -> List[Dict[str, Any]]:
        """List all documents in a collection."""
        return self.query(collection)

    def count(
        self,
        collection: str,
        filters: Optional[Union[Dict[str, Any], List[Tuple[str, str, Any]]]] = None,
    ) -> int:
        """Count the number of documents matching the given filters."""
        return len(self.query(collection, filters=filters))

    # ── Asynchronous CRUD Operations ──────────────────────────────────────────

    async def async_create(
        self,
        collection: str,
        data: Dict[str, Any],
        doc_id: Optional[str] = None,
        actor: str = "system",
    ) -> Dict[str, Any]:
        """Asynchronous create operation."""
        return await asyncio.to_thread(self.create, collection, data, doc_id, actor)

    async def async_get(self, collection: str, doc_id: str) -> Optional[Dict[str, Any]]:
        """Asynchronous get operation."""
        return await asyncio.to_thread(self.get, collection, doc_id)

    async def async_update(
        self,
        collection: str,
        doc_id: str,
        updates: Dict[str, Any],
        actor: str = "system",
    ) -> Optional[Dict[str, Any]]:
        """Asynchronous update operation."""
        return await asyncio.to_thread(self.update, collection, doc_id, updates, actor)

    async def async_delete(self, collection: str, doc_id: str) -> bool:
        """Asynchronous delete operation."""
        return await asyncio.to_thread(self.delete, collection, doc_id)

    async def async_query(
        self,
        collection: str,
        filters: Optional[Union[Dict[str, Any], List[Tuple[str, str, Any]]]] = None,
        order_by: Optional[str] = None,
        descending: bool = False,
        limit: Optional[int] = None,
        offset: int = 0,
    ) -> List[Dict[str, Any]]:
        """Asynchronous query operation."""
        return await asyncio.to_thread(
            self.query,
            collection,
            filters,
            order_by,
            descending,
            limit,
            offset,
        )

    async def async_list_all(self, collection: str) -> List[Dict[str, Any]]:
        """Asynchronous list all operation."""
        return await asyncio.to_thread(self.list_all, collection)

    async def async_count(
        self,
        collection: str,
        filters: Optional[Union[Dict[str, Any], List[Tuple[str, str, Any]]]] = None,
    ) -> int:
        """Asynchronous count operation."""
        return await asyncio.to_thread(self.count, collection, filters)


# ── Global Singleton Access ───────────────────────────────────────────────────

_DATA_STORE_INSTANCE: Optional[DataStore] = None
_INSTANCE_LOCK = threading.Lock()


def get_data_store() -> DataStore:
    """Get or create the universal DataStore singleton instance."""
    global _DATA_STORE_INSTANCE
    with _INSTANCE_LOCK:
        if _DATA_STORE_INSTANCE is None:
            _DATA_STORE_INSTANCE = DataStore(auto_seed=True)
        return _DATA_STORE_INSTANCE


def reset_data_store() -> DataStore:
    """Reset the singleton instance (useful for test isolation)."""
    global _DATA_STORE_INSTANCE
    with _INSTANCE_LOCK:
        _DATA_STORE_INSTANCE = DataStore(auto_seed=True)
        return _DATA_STORE_INSTANCE
