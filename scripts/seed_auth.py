#!/usr/bin/env python3
"""
Seed real Firebase Auth users and Firestore user profiles for the LifeLine hackathon demo.
Replaces the old mock bearer token logic.

Run with: python -m scripts.seed_auth
"""

import os
import sys
import logging
from firebase_admin import auth as firebase_auth
from firebase_admin import firestore

sys.path.insert(0, os.path.abspath(os.path.join(os.path.dirname(__file__), "..")))
from lifeline.firebase import get_db, get_auth

logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

DEMO_PASSWORD = os.environ.get("DEMO_PASSWORD", "password123")

DEMO_USERS = [
    {"name": "Dr. A. Mehta", "email": "director.lilavati@lifelinedemo.app",
     "role": "hospital_director", "hospitalId": "hosp-lilavati", "hospitalName": "Lilavati Hospital & Research Centre"},
    {"name": "Dr. R. Iyer", "email": "director.kem@lifelinedemo.app",
     "role": "hospital_director", "hospitalId": "hosp-kem", "hospitalName": "King Edward Memorial (KEM) Hospital"},
    {"name": "Dr. Mehta (Staff)", "email": "dr_mehta@lifelinedemo.app",
     "role": "hospital_staff", "hospitalId": "hosp-lilavati", "hospitalName": "Lilavati Hospital & Research Centre"},
    {"name": "Nurse Rao", "email": "nurse.rao@lifelinedemo.app",
     "role": "hospital_staff", "hospitalId": "hosp-lilavati", "hospitalName": "Lilavati Hospital & Research Centre"},
    {"name": "Dr. Shah", "email": "dr_shah@lifelinedemo.app",
     "role": "hospital_staff", "hospitalId": "hosp-kem", "hospitalName": "King Edward Memorial (KEM) Hospital"},
    {"name": "Dir. Sharma", "email": "dir_sharma@lifelinedemo.app",
     "role": "government_authority", "hospitalId": None, "hospitalName": None},
    {"name": "Rahul Sharma", "email": "rahul_sharma@lifelinedemo.app",
     "role": "blood_donor", "hospitalId": None, "hospitalName": None},
    {"name": "Priya Nair", "email": "priya_nair@lifelinedemo.app",
     "role": "blood_donor", "hospitalId": None, "hospitalName": None},
    {"name": "System Admin", "email": "admin@lifelinedemo.app",
     "role": "admin", "hospitalId": None, "hospitalName": None},
]

def seed_auth_and_profiles():
    db = get_db()
    auth = get_auth()
    if not db or not auth:
        logger.error("Firebase not configured. Cannot seed real users.")
        return

    logger.info("Seeding real Firebase Auth users and Firestore profiles...")

    for user_data in DEMO_USERS:
        email = user_data["email"]
        
        # 1. Create or get Firebase Auth user
        uid = None
        try:
            # Try to get existing
            existing = auth.get_user_by_email(email)
            uid = existing.uid
            logger.info(f"User {email} already exists (UID: {uid}). Updating password...")
            auth.update_user(uid, password=DEMO_PASSWORD)
        except firebase_auth.UserNotFoundError:
            # Create new
            new_user = auth.create_user(
                email=email,
                password=DEMO_PASSWORD,
                display_name=user_data["name"]
            )
            uid = new_user.uid
            logger.info(f"Created new user {email} (UID: {uid}).")
        
        # 2. Write role data to Firestore `users/{uid}` collection
        if uid:
            user_ref = db.collection("users").document(uid)
            user_ref.set({
                "email": email,
                "name": user_data["name"],
                "role": user_data["role"],
                "hospitalId": user_data["hospitalId"],
                "hospitalName": user_data["hospitalName"],
                "createdAt": firestore.SERVER_TIMESTAMP
            })
            logger.info(f"  -> Wrote Firestore profile for {email} (Role: {user_data['role']})")

    logger.info("Done seeding Firebase Auth users.")

if __name__ == "__main__":
    seed_auth_and_profiles()
