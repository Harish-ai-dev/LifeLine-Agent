"""
Firestore audit client — writes one record per dispatch run.

Uses Firebase Admin SDK via lifeline.firebase so credentials are
managed centrally (never hardcoded).

Collection: 'dispatch_cases'  (configurable via admin panel)
"""

import datetime
import os
from lifeline.firebase import get_db

COLLECTION = os.environ.get("FIRESTORE_COLLECTION", "dispatch_cases")


def write_audit_record(record: dict) -> str:
    """
    Write a full dispatch record to Firestore.
    Adds a server-side timestamp and returns the generated document ID.

    record shape:
      {
        case: {...},
        news2: {...},
        triage: {...},
        bed_match: {...},
        routing: {...},   # optional
        briefing: {...},  # optional
      }
    """
    db = get_db()
    record["_timestamp"] = datetime.datetime.utcnow().isoformat() + "Z"
    record["_version"] = "0.1.0"

    doc_ref = db.collection(COLLECTION).document()
    doc_ref.set(record)
    return doc_ref.id


def get_recent_cases(limit: int = 20) -> list[dict]:
    """
    Fetch the most recent dispatch records for the admin dashboard.
    Returns a list of dicts ordered by timestamp descending.
    """
    db = get_db()
    docs = (
        db.collection(COLLECTION)
        .order_by("_timestamp", direction="DESCENDING")
        .limit(limit)
        .stream()
    )
    return [{"id": doc.id, **doc.to_dict()} for doc in docs]

