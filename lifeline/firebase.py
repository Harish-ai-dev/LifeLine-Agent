"""
Firebase Admin SDK bootstrap — single initialisation point for the whole app.

Loads the service account from the admin encrypted config (set via
`lifeline admin`) or from the GOOGLE_APPLICATION_CREDENTIALS env var
(standard GCP default credentials for Cloud Run).

Gracefully falls back to offline/dev mode if credentials are not configured yet.
"""

import os
import json
import logging
import firebase_admin
from firebase_admin import credentials, firestore, auth as firebase_auth

logger = logging.getLogger(__name__)

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
            logger.info("Firebase initialized via admin panel config.")
            return
    except Exception as e:
        logger.debug(f"Option 1 Firebase init skipped: {e}")

    # ── Option 2: path to service account file via env var ────────────────────
    try:
        sa_path = os.environ.get("GOOGLE_APPLICATION_CREDENTIALS")
        if sa_path and os.path.exists(sa_path):
            cred = credentials.Certificate(sa_path)
            _app = firebase_admin.initialize_app(cred)
            db = firestore.client()
            auth = firebase_auth
            logger.info("Firebase initialized via GOOGLE_APPLICATION_CREDENTIALS.")
            return
    except Exception as e:
        logger.debug(f"Option 2 Firebase init skipped: {e}")

    # ── Option 3: GCP default credentials (Cloud Run, GKE, etc.) ─────────────
    try:
        _app = firebase_admin.initialize_app()
        db = firestore.client()
        auth = firebase_auth
        logger.info("Firebase initialized via GCP Application Default Credentials.")
        return
    except Exception as e:
        logger.warning(
            "Firebase credentials not detected. Running in offline/dev audit mode. "
            "Configure via 'lifeline admin' to enable live Firestore."
        )
        db = None
        auth = None


# Safe initialise on import
try:
    _init()
except Exception as e:
    logger.warning(f"Firebase background init deferred: {e}")
    db = None
    auth = None


def get_db():
    """Return the Firestore client or None if offline."""
    if db is None:
        _init()
    return db


def get_auth():
    """Return the Firebase Auth client or None if offline."""
    if auth is None:
        _init()
    return auth
