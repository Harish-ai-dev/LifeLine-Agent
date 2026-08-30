"""
Firestore audit client — writes one record per dispatch run and retrieves case logs.

Powered by the universal DataStore (lifeline.tools.data_store), providing
seamless integration with live Google Cloud Firestore and robust in-memory
fallback when offline.

Collection: 'dispatch_cases' (configurable via FIRESTORE_COLLECTION env var)
"""

import logging
import os
from typing import Any, Dict, List, Optional

from lifeline.tools.data_store import get_data_store

logger = logging.getLogger(__name__)
COLLECTION = os.environ.get("FIRESTORE_COLLECTION", "dispatch_cases")


def write_audit_record(record: Dict[str, Any], actor: str = "orchestrator") -> str:
    """
    Write a full dispatch record to Firestore via DataStore.
    Injects standard audit metadata (_id, _timestamp, _version, _actor)
    and returns the generated document ID.
    """
    store = get_data_store()
    doc_id = record.get("_id") or record.get("id")
    created = store.create(COLLECTION, record, doc_id=doc_id, actor=actor)
    doc_id = created.get("_id") or created.get("id", "")
    logger.info(f"Recorded audit dispatch record: {doc_id}")
    return doc_id


def get_recent_cases(limit: int = 20) -> List[Dict[str, Any]]:
    """
    Fetch the most recent dispatch records for the admin dashboard.
    Returns a list of dicts ordered by _timestamp descending.
    """
    store = get_data_store()
    return store.query(COLLECTION, order_by="_timestamp", descending=True, limit=limit)


def get_case_by_id(case_id: str) -> Optional[Dict[str, Any]]:
    """Fetch a single dispatch case record by its document ID."""
    store = get_data_store()
    return store.get(COLLECTION, case_id)
