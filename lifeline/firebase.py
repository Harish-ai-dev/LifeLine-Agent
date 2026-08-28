"""
Firebase Admin SDK bootstrap — single initialisation point for the whole app.

Loads the service account from the admin encrypted config (set via
`lifeline admin`) or from the GOOGLE_APPLICATION_CREDENTIALS env var
(standard GCP default credentials for Cloud Run).

Usage anywhere in the app:
    from lifeline.firebase import db, auth
    db.collection("dispatch_cases").add({...})
    auth.verify_id_token(id_token)
"""

import os
import json
import firebase_admin
from firebase_admin import credentials, firestore, auth as firebase_auth

_app = None
db = None
auth = None


def _init():
    global _app, db, auth
    if _app is not None:
        return  # Already initialised (singleton)

    # ── Option 1: service account JSON stored in admin config ─────────────────
    try:
        from admin.config_manager import get_runtime_config
        config = get_runtime_config()
        sa_json = config.get("FIREBASE_SERVICE_ACCOUNT_JSON")
        if sa_json:
            sa_dict = json.loads(sa_json)
            cred = credentials.Certificate(sa_dict)
            _app = firebase_admin.initialize_app(cred)
            db = firestore.client()
            auth = firebase_auth
            return
    except Exception:
        pass

    # ── Option 2: path to service account file via env var ────────────────────
    sa_path = os.environ.get("GOOGLE_APPLICATION_CREDENTIALS")
    if sa_path and os.path.exists(sa_path):
        cred = credentials.Certificate(sa_path)
        _app = firebase_admin.initialize_app(cred)
        db = firestore.client()
        auth = firebase_auth
        return

    # ── Option 3: GCP default credentials (Cloud Run, Cloud Build, etc.) ─────
    _app = firebase_admin.initialize_app()
    db = firestore.client()
    auth = firebase_auth


# Initialise on import so db/auth are immediately available
_init()


def get_db():
    """Return the Firestore client (initialises if needed)."""
    if db is None:
        _init()
    return db


def get_auth():
    """Return the Firebase Auth client (initialises if needed)."""
    if auth is None:
        _init()
    return auth

