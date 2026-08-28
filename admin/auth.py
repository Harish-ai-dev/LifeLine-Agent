"""
Firebase Authentication module for LifeLine Admin Panel.

Replaces the old bcrypt approach with Firebase Auth (email + password).

Flow:
  1. First-run: Admin creates email/password via Firebase Auth REST API
     (we create the user in Firebase using Admin SDK)
  2. Login: Signs in via Firebase Auth REST API → gets ID token
  3. Verification: Admin SDK verifies ID token server-side → session is valid

No passwords are ever stored locally. Firebase handles all credential storage.
"""

import os
import requests
from lifeline.firebase import get_auth

# Firebase Auth REST API (sign-in with email/password)
FIREBASE_AUTH_REST = (
    "https://identitytoolkit.googleapis.com/v1/accounts:signInWithPassword"
)
FIREBASE_SIGNUP_REST = (
    "https://identitytoolkit.googleapis.com/v1/accounts:signUp"
)


def _get_web_api_key() -> str:
    """
    The Firebase Web API key (NOT the service account key).
    Required for REST Auth endpoints. Set via admin panel or env var.
    """
    try:
        from admin.config_manager import get_runtime_config
        config = get_runtime_config()
        key = config.get("FIREBASE_WEB_API_KEY")
        if key:
            return key
    except Exception:
        pass
    key = os.environ.get("FIREBASE_WEB_API_KEY", "")
    if not key:
        raise RuntimeError(
            "FIREBASE_WEB_API_KEY not set. Open 'lifeline admin' to configure."
        )
    return key


def admin_exists() -> bool:
    """
    Check if any admin user exists in Firebase Auth.
    We store a marker in Firestore to track this.
    """
    try:
        from lifeline.firebase import get_db
        db = get_db()
        doc = db.collection("_admin_meta").document("setup").get()
        return doc.exists and doc.to_dict().get("admin_created", False)
    except Exception:
        return False


def create_admin(email: str, password: str) -> str:
    """
    Create the super admin Firebase Auth user and mark setup complete.
    Returns the Firebase UID.
    """
    auth = get_auth()

    # Create user in Firebase Auth via Admin SDK
    user = auth.create_user(
        email=email,
        password=password,
        display_name="LifeLine Super Admin",
        email_verified=True,
    )

    # Set custom claim so we can gate access
    auth.set_custom_user_claims(user.uid, {"role": "superadmin"})

    # Write marker to Firestore
    from lifeline.firebase import get_db
    db = get_db()
    db.collection("_admin_meta").document("setup").set({
        "admin_created": True,
        "admin_uid": user.uid,
        "admin_email": email,
    })

    return user.uid


def sign_in(email: str, password: str) -> dict:
    """
    Sign in with email/password via Firebase Auth REST API.
    Returns { id_token, refresh_token, uid, email } or raises on failure.
    """
    api_key = _get_web_api_key()
    resp = requests.post(
        FIREBASE_AUTH_REST,
        params={"key": api_key},
        json={"email": email, "password": password, "returnSecureToken": True},
        timeout=10,
    )
    data = resp.json()
    if not resp.ok:
        error_msg = data.get("error", {}).get("message", "Login failed")
        raise ValueError(error_msg)
    return {
        "id_token": data["idToken"],
        "refresh_token": data["refreshToken"],
        "uid": data["localId"],
        "email": data["email"],
    }


def verify_id_token(id_token: str) -> dict:
    """
    Verify a Firebase ID token server-side using Admin SDK.
    Returns the decoded token dict (includes uid, email, custom claims).
    Raises if the token is invalid or expired.
    """
    auth = get_auth()
    decoded = auth.verify_id_token(id_token)
    # Enforce superadmin claim
    if decoded.get("role") != "superadmin":
        raise PermissionError("User does not have superadmin privileges.")
    return decoded


def change_password(uid: str, new_password: str) -> None:
    """Update password for an existing Firebase Auth user via Admin SDK."""
    auth = get_auth()
    auth.update_user(uid, password=new_password)

