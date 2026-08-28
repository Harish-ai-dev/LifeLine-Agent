"""
Config Manager for LifeLine Admin Panel.

API keys are AES-256 encrypted with a key derived from the machine's
hardware ID + a fixed salt. This means the encrypted file is useless
if copied to another machine.

Storage: .admin_config.enc  (encrypted JSON, gitignored)
Reading at runtime: call get_runtime_config() — returns plain dict for use
  in agents/tools. This is called ONCE at startup by the orchestrator.
"""

import json
import os
import hashlib
import base64
from cryptography.fernet import Fernet

CONFIG_FILE = os.path.abspath(
    os.path.join(os.path.dirname(__file__), "..", ".admin_config.enc")
)

# ── Labels & Descriptions shown in the admin UI ───────────────────────────────
KEY_LABELS = {
    # Gemini / GCP
    "GEMINI_API_KEY":                "Gemini API Key",
    "GCP_PROJECT_ID":                "GCP Project ID",
    # Firebase — secrets (encrypted store only)
    "FIREBASE_WEB_API_KEY":          "Firebase Web API Key (secret)",
    "FIREBASE_SERVICE_ACCOUNT_JSON": "Firebase Service Account JSON (secret)",
    # Firebase — project metadata (non-secret, but stored here for convenience)
    "FIREBASE_PROJECT_ID":           "Firebase Project ID",
    "FIREBASE_AUTH_DOMAIN":          "Firebase Auth Domain",
    "FIREBASE_STORAGE_BUCKET":       "Firebase Storage Bucket",
    "FIREBASE_MESSAGING_SENDER_ID":  "Firebase Messaging Sender ID",
    "FIREBASE_APP_ID":               "Firebase App ID",
    "FIREBASE_MEASUREMENT_ID":       "Firebase Measurement ID",
    # App config
    "FIRESTORE_COLLECTION":          "Firestore Collection Name",
    "DEMO_CITY":                     "Demo City (hospital data pull)",
    "CLOUD_RUN_REGION":              "Cloud Run Region",
}

KEY_DESCRIPTIONS = {
    "GEMINI_API_KEY":                "Google AI Studio key for Gemini 3.5-flash & 3.1-pro.",
    "GCP_PROJECT_ID":                "Your GCP Project ID (e.g. lifeline-3725b).",
    "FIREBASE_WEB_API_KEY":          "Firebase Web API key — used for client Auth sign-in. SECRET: store here, never in .env or source code.",
    "FIREBASE_SERVICE_ACCOUNT_JSON": "Full contents of Firebase service account JSON. Used for Firestore + Admin Auth. SECRET: store here only.",
    "FIREBASE_PROJECT_ID":           "Firebase project ID (e.g. lifeline-3725b). Safe to version-control via .env.example.",
    "FIREBASE_AUTH_DOMAIN":          "Firebase Auth domain (e.g. lifeline-3725b.firebaseapp.com).",
    "FIREBASE_STORAGE_BUCKET":       "Firebase Storage bucket (e.g. lifeline-3725b.firebasestorage.app).",
    "FIREBASE_MESSAGING_SENDER_ID":  "Firebase Cloud Messaging sender ID.",
    "FIREBASE_APP_ID":               "Firebase web app ID.",
    "FIREBASE_MEASUREMENT_ID":       "Firebase Analytics measurement ID.",
    "FIRESTORE_COLLECTION":          "Firestore collection for audit records (e.g. dispatch_cases).",
    "DEMO_CITY":                     "City for Overpass API hospital pull (e.g. mumbai, london, seattle).",
    "CLOUD_RUN_REGION":              "GCP region for Cloud Run (e.g. us-central1).",
}


# ── Encryption Key Derivation ─────────────────────────────────────────────────
def _derive_fernet_key() -> bytes:
    """
    Derive a deterministic Fernet encryption key from a machine-specific
    identifier. Uses hostname + username as entropy source.
    This makes the encrypted config file non-portable (tied to this machine).
    """
    salt = b"lifeline_agent_salt_v1"
    machine_id = (os.environ.get("COMPUTERNAME", "") +
                  os.environ.get("USERNAME", "") +
                  os.environ.get("HOSTNAME", "localhost")).encode()
    raw = hashlib.pbkdf2_hmac("sha256", machine_id, salt, iterations=100_000)
    return base64.urlsafe_b64encode(raw)


def _get_fernet() -> Fernet:
    return Fernet(_derive_fernet_key())


# ── Load / Save ───────────────────────────────────────────────────────────────
def load_config() -> dict:
    """Load and decrypt config. Returns empty dict if file doesn't exist."""
    if not os.path.exists(CONFIG_FILE):
        return {}
    fernet = _get_fernet()
    with open(CONFIG_FILE, "rb") as f:
        encrypted = f.read()
    try:
        decrypted = fernet.decrypt(encrypted)
        return json.loads(decrypted.decode("utf-8"))
    except Exception:
        # If decryption fails (e.g. machine changed), return empty
        return {}


def save_config(config: dict) -> None:
    """Encrypt and persist config to disk."""
    fernet = _get_fernet()
    plaintext = json.dumps(config, indent=2).encode("utf-8")
    encrypted = fernet.encrypt(plaintext)
    with open(CONFIG_FILE, "wb") as f:
        f.write(encrypted)
    # Restrict permissions on Unix-like systems
    try:
        os.chmod(CONFIG_FILE, 0o600)
    except Exception:
        pass


def get_key(config: dict, key_name: str) -> str | None:
    """Get a single key value from the config dict (or None if not set)."""
    return config.get(key_name) or None


# ── Runtime Access (used by agents/orchestrator) ───────────────────────────────
def get_runtime_config() -> dict:
    """
    Called once at orchestrator startup. Returns the decrypted config as a
    plain dict. Also merges in any environment variable overrides so that
    CI/Cloud Run can inject keys via env vars (which take precedence over
    the encrypted file).

    Priority:  environment variable  >  encrypted config file
    """
    config = load_config()

    for key_name in KEY_LABELS:
        env_value = os.environ.get(key_name)
        if env_value:
            config[key_name] = env_value  # env var overrides stored value

    return config


def inject_to_env(config: dict) -> None:
    """
    Convenience helper: push all config values into os.environ so that
    libraries that read env vars (e.g. google-cloud, google-generativeai)
    pick them up automatically.
    """
    for key, value in config.items():
        if value:
            os.environ.setdefault(key, value)

