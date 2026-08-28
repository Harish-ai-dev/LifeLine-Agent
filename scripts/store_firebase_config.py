"""
store_firebase_config.py - One-time setup script.

Stores Firebase project config into the AES-256 encrypted .admin_config.enc
file (machine-locked, gitignored). Run this ONCE after cloning the repo.

Usage:
    python scripts/store_firebase_config.py

What it stores:
  - Non-secret metadata automatically (project ID, auth domain, etc.)
  - FIREBASE_WEB_API_KEY  -> prompts you (hidden input, never echoed)
  - FIREBASE_SERVICE_ACCOUNT_JSON -> prompts file path, reads & encrypts it

Nothing is ever written to disk in plaintext or to any file that git tracks.
"""

import sys
import os
import json
import getpass

# Make sure we can import from the project root
sys.path.insert(0, os.path.abspath(os.path.join(os.path.dirname(__file__), "..")))

from admin.config_manager import load_config, save_config, CONFIG_FILE

# Non-secret Firebase project metadata (from your Firebase Console)
FIREBASE_METADATA = {
    "FIREBASE_PROJECT_ID":          "lifeline-3725b",
    "FIREBASE_AUTH_DOMAIN":         "lifeline-3725b.firebaseapp.com",
    "FIREBASE_STORAGE_BUCKET":      "lifeline-3725b.firebasestorage.app",
    "FIREBASE_MESSAGING_SENDER_ID": "413566367910",
    "FIREBASE_APP_ID":              "1:413566367910:web:602159713b9c7f2b5cdc67",
    "FIREBASE_MEASUREMENT_ID":      "G-4WFE47EYLS",
    "GCP_PROJECT_ID":               "lifeline-3725b",
    "CLOUD_RUN_REGION":             "us-central1",
    "FIRESTORE_COLLECTION":         "dispatch_cases",
    "DEMO_CITY":                    "mumbai",
}


def main():
    print("\n   LifeLine - Firebase Secure Config Setup")
    print("=" * 52)
    print(f"   Encrypted store: {CONFIG_FILE}")
    print("   This file is gitignored and machine-locked.\n")

    # Load existing config so we do not overwrite other keys
    config = load_config()

    # Step 1: Store non-secret metadata
    config.update(FIREBASE_METADATA)
    print("[OK] Firebase project metadata stored (project ID, auth domain, etc.)")

    # Step 2: Firebase Web API Key (secret)
    print("\n[?] FIREBASE_WEB_API_KEY")
    print("   (Firebase Console -> Project Settings -> General -> Web API Key)")
    existing = config.get("FIREBASE_WEB_API_KEY", "")
    hint = f" [current: {existing[:8]}...] " if existing else " "
    api_key = getpass.getpass(f"   Paste key{hint}(Enter to skip): ").strip()
    if api_key:
        config["FIREBASE_WEB_API_KEY"] = api_key
        print("   [OK] FIREBASE_WEB_API_KEY saved.")
    else:
        if existing:
            print("   [SKIP] Keeping existing key.")
        else:
            print("   [WARN] Not set - set it later via `lifeline admin`.")

    # Step 3: Service Account JSON (secret)
    print("\n[?] FIREBASE_SERVICE_ACCOUNT_JSON")
    print("   (Firebase Console -> Project Settings -> Service Accounts -> Generate new private key)")
    existing_sa = config.get("FIREBASE_SERVICE_ACCOUNT_JSON", "")
    sa_path = input("   Path to serviceAccountKey.json file (Enter to skip): ").strip()
    if sa_path:
        sa_path = os.path.expanduser(sa_path)
        if os.path.isfile(sa_path):
            with open(sa_path, "r", encoding="utf-8") as f:
                sa_content = f.read()
            try:
                parsed = json.loads(sa_content)
                if "private_key" not in parsed:
                    print("   [WARN] File does not look like a service account key (no private_key field).")
                else:
                    config["FIREBASE_SERVICE_ACCOUNT_JSON"] = sa_content
                    print("   [OK] Service account JSON encrypted and stored.")
                    print("   [TIP] You can now safely delete the original file.")
            except json.JSONDecodeError:
                print("   [ERR] File is not valid JSON. Skipping.")
        else:
            print(f"   [ERR] File not found: {sa_path}")
    else:
        if existing_sa:
            print("   [SKIP] Keeping existing service account.")
        else:
            print("   [SKIP] Set it later via `lifeline admin`.")

    # Save everything
    save_config(config)
    print(f"\n[LOCKED] All config saved to: {CONFIG_FILE}")
    print("   [OK] Gitignored  [OK] AES-256 encrypted  [OK] Machine-locked\n")


if __name__ == "__main__":
    main()
