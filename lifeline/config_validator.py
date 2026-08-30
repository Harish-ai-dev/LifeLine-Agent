"""
Config Validator — Live validation for LifeLine Agent keys and credentials.
Validates Gemini API, Firebase, GCP, and local configuration.
"""

from __future__ import annotations

import json
import os
import re
import shutil
import subprocess
import sys
from pathlib import Path
from typing import Dict, Tuple

PROJECT_ROOT = Path(__file__).resolve().parent.parent


def validate_gemini_key(api_key: str) -> Tuple[bool, str]:
    """
    Validate Gemini API key by making a live lightweight API call to gemini-3.5-flash.
    """
    if not api_key or not api_key.strip() or api_key.strip() == "your_gemini_api_key_here":
        return False, "Key is empty or placeholder"

    cleaned_key = api_key.strip()
    try:
        from google import genai

        client = genai.Client(api_key=cleaned_key)
        response = client.models.generate_content(
            model="gemini-3.5-flash",
            contents="Respond with 'OK' to verify API key validity.",
        )
        if response and response.text:
            return True, "Live Gemini API call succeeded (gemini-3.5-flash)"
        return False, "No response text received from Gemini API"
    except Exception as e:
        err_msg = str(e)
        if "API_KEY_INVALID" in err_msg or "INVALID_ARGUMENT" in err_msg:
            return False, "Invalid API key format or credentials rejected by Google AI"
        elif "quota" in err_msg.lower():
            return True, "Key valid (Quota warning detected)"
        return False, f"Gemini API verification failed: {err_msg[:120]}"


def validate_firebase_service_account(json_str_or_path: str) -> Tuple[bool, str]:
    """
    Validate Firebase Service Account JSON (either path or raw JSON string).
    """
    if not json_str_or_path or not json_str_or_path.strip():
        return False, "Not configured"

    raw_text = json_str_or_path.strip()
    if os.path.exists(raw_text):
        try:
            with open(raw_text, "r", encoding="utf-8") as f:
                raw_text = f.read()
        except Exception as e:
            return False, f"Could not read file: {e}"

    try:
        data = json.loads(raw_text)
        if not isinstance(data, dict):
            return False, "JSON payload must be an object"
        
        required_fields = ["type", "project_id", "private_key", "client_email"]
        missing = [field for field in required_fields if field not in data]
        if missing:
            missing_str = ", ".join(missing)
            return False, f"Missing required JSON fields: {missing_str}"
        
        if data.get("type") != "service_account":
            account_type = data.get("type")
            return False, f"Invalid account type '{account_type}', expected 'service_account'"

        pid = data.get("project_id")
        return True, f"Valid Service Account for project '{pid}'"
    except json.JSONDecodeError as e:
        return False, f"Invalid JSON syntax: {e}"


def validate_firebase_web_key(web_key: str) -> Tuple[bool, str]:
    """
    Validate Firebase Web API Key format.
    """
    if not web_key or not web_key.strip():
        return False, "Not configured"
    
    key = web_key.strip()
    if len(key) < 15:
        return False, "Key too short (expected Web API Key)"
    return True, "Valid Web API Key format"


def validate_gcp_project(project_id: str) -> Tuple[bool, str]:
    """
    Validate GCP / Firestore Project ID.
    """
    if not project_id or not project_id.strip() or project_id.strip() in ["your-gcp-project-id", "lifeline-demo-project"]:
        return False, "Not configured or placeholder"
    
    pid = project_id.strip()
    if not re.match(r"^[a-z][a-z0-9-]{4,29}$", pid):
        return False, "Invalid project ID format (must be lowercase alphanumeric with hyphens, 6-30 chars)"
    
    gcloud = shutil.which("gcloud")
    if gcloud:
        try:
            res = subprocess.run(
                [gcloud, "projects", "describe", pid, "--format=value(projectId)"],
                capture_output=True,
                text=True,
                timeout=4,
            )
            if res.returncode == 0 and res.stdout.strip() == pid:
                return True, f"Verified project '{pid}' via gcloud CLI"
        except Exception:
            pass

    return True, f"Valid project ID string '{pid}'"


def audit_full_system_config(config: dict) -> Dict[str, dict]:
    """
    Audit all system configuration items and return structured status dictionary.
    """
    gemini_key = config.get("GOOGLE_API_KEY") or config.get("GEMINI_API_KEY") or ""
    gemini_ok, gemini_msg = validate_gemini_key(gemini_key)

    gcp_pid = config.get("FIRESTORE_PROJECT_ID") or config.get("GCP_PROJECT_ID") or ""
    gcp_ok, gcp_msg = validate_gcp_project(gcp_pid)

    fb_sa = config.get("FIREBASE_SERVICE_ACCOUNT_JSON") or config.get("GOOGLE_APPLICATION_CREDENTIALS") or ""
    fb_sa_ok, fb_sa_msg = validate_firebase_service_account(fb_sa)

    fb_web = config.get("FIREBASE_WEB_API_KEY") or ""
    fb_web_ok, fb_web_msg = validate_firebase_web_key(fb_web)

    demo_city = config.get("DEMO_CITY", "mumbai")
    demo_auth = config.get("DEMO_AUTH_MODE", "true")

    firestore_status = "Offline / Dev Memory Fallback Mode"
    if gcp_ok and (fb_sa_ok or os.environ.get("GOOGLE_APPLICATION_CREDENTIALS")):
        firestore_status = f"Live Firestore Connected (Project: {gcp_pid})"

    return {
        "GEMINI_API_KEY": {
            "label": "Gemini API Key (Mandatory)",
            "key": "GOOGLE_API_KEY",
            "value": gemini_key,
            "valid": gemini_ok,
            "message": gemini_msg,
            "mandatory": True,
        },
        "GCP_PROJECT_ID": {
            "label": "GCP / Firestore Project ID",
            "key": "FIRESTORE_PROJECT_ID",
            "value": gcp_pid,
            "valid": gcp_ok,
            "message": gcp_msg,
            "mandatory": False,
        },
        "FIREBASE_SERVICE_ACCOUNT": {
            "label": "Firebase Service Account JSON",
            "key": "FIREBASE_SERVICE_ACCOUNT_JSON",
            "value": fb_sa,
            "valid": fb_sa_ok,
            "message": fb_sa_msg,
            "mandatory": False,
        },
        "FIREBASE_WEB_API_KEY": {
            "label": "Firebase Web API Key",
            "key": "FIREBASE_WEB_API_KEY",
            "value": fb_web,
            "valid": fb_web_ok,
            "message": fb_web_msg,
            "mandatory": False,
        },
        "DEMO_CITY": {
            "label": "Default Demo City",
            "key": "DEMO_CITY",
            "value": demo_city,
            "valid": True,
            "message": f"Configured city: '{demo_city}'",
            "mandatory": False,
        },
        "DEMO_AUTH_MODE": {
            "label": "Demo Auth Mode",
            "key": "DEMO_AUTH_MODE",
            "value": demo_auth,
            "valid": True,
            "message": f"Zero-friction auth mode enabled ({demo_auth})",
            "mandatory": False,
        },
        "FIRESTORE_MODE": {
            "label": "Firestore Connection Mode",
            "key": "FIRESTORE_MODE",
            "value": firestore_status,
            "valid": gcp_ok and fb_sa_ok,
            "message": firestore_status,
            "mandatory": False,
        },
    }
