"""
Firestore audit logging — writes one record per dispatch run.
See docs/04-agent-contracts.md for the exact record shape.
"""
from google.cloud import firestore

_db = None


def get_client():
    global _db
    if _db is None:
        _db = firestore.Client()
    return _db


def write_audit_record(record: dict) -> str:
    """
    TODO: write `record` to the 'dispatch_cases' collection, return doc id.
    """
    db = get_client()
    doc_ref = db.collection("dispatch_cases").document()
    doc_ref.set(record)
    return doc_ref.id
