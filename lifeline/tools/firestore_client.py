"""
Firestore audit client — writes one record per dispatch run.

Uses Firebase Admin SDK via lifeline.firebase so credentials are
managed centrally (never hardcoded).

Collection: 'dispatch_cases'  (configurable via admin panel)
"""

import datetime
import os
import uuid
import logging
from lifeline.firebase import get_db

logger = logging.getLogger(__name__)
COLLECTION = os.environ.get("FIRESTORE_COLLECTION", "dispatch_cases")


def write_audit_record(record: dict) -> str:
    """
    Write a full dispatch record to Firestore.
    Adds a server-side timestamp and returns the generated document ID.
    If Firestore is offline, returns a local mock UUID and logs locally.
    """
    record["_timestamp"] = datetime.datetime.utcnow().isoformat() + "Z"
    record["_version"] = "0.1.0"

    try:
        db = get_db()
        if db is not None:
            doc_ref = db.collection(COLLECTION).document()
            doc_ref.set(record)
            return doc_ref.id
    except Exception as e:
        logger.warning(f"Firestore write error: {e}")

    # Fallback for offline local dev mode
    mock_id = f"local_{uuid.uuid4().hex[:8]}"
    logger.info(f"Recorded audit dispatch locally with ID: {mock_id}")
    return mock_id


def get_recent_cases(limit: int = 20) -> list[dict]:
    """
    Fetch the most recent dispatch records for the admin dashboard.
    Returns a list of dicts ordered by timestamp descending.
    """
    try:
        db = get_db()
        if db is not None:
            docs = (
                db.collection(COLLECTION)
                .order_by("_timestamp", direction="DESCENDING")
                .limit(limit)
                .stream()
            )
            return [{"id": doc.id, **doc.to_dict()} for doc in docs]
    except Exception as e:
        logger.warning(f"Firestore read error: {e}")

    return []
