"""
Auth & Identity routes — Demo/Mock authentication per docs/09-parallel-build-contract.md#51-authentication--identity.
"""

from typing import Optional
from fastapi import APIRouter, Header, HTTPException, status
from lifeline.schemas import LoginRequest, LoginResponse, UserProfile, ErrorResponse
from lifeline.tools.data_store import get_data_store

router = APIRouter()

import logging
from typing import Optional
from fastapi import APIRouter, Header, HTTPException, status
from pydantic import BaseModel
from lifeline.schemas import UserProfile, ErrorResponse
from lifeline.firebase import get_auth, get_db

logger = logging.getLogger(__name__)
router = APIRouter()

@router.get(
    "/me",
    response_model=UserProfile,
    responses={
        401: {"model": ErrorResponse, "description": "Missing or invalid token"},
        403: {"model": ErrorResponse, "description": "No profile found for this account"},
    },
)
async def get_current_user(authorization: Optional[str] = Header(None)):
    """
    Resolve currently authenticated user profile from Firebase Authorization Bearer token.
    """
    if not authorization or not authorization.startswith("Bearer "):
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Missing or malformed Authorization header. Expected 'Bearer <token>'",
        )

    id_token = authorization.split("Bearer ", 1)[1].strip()
    
    # 1. Verify token with Firebase Auth
    firebase_auth = get_auth()
    if not firebase_auth:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Firebase Auth is not initialized on the server.",
        )
        
    try:
        decoded = firebase_auth.verify_id_token(id_token)
    except Exception as e:
        logger.warning(f"Invalid Firebase ID token: {e}")
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid or expired authentication token.",
        )

    uid = decoded["uid"]
    
    # 2. Look up the role & facility scope in the Firestore `users` collection
    db = get_db()
    if not db:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Firestore is not initialized on the server.",
        )
        
    user_ref = db.collection("users").document(uid)
    user_doc = user_ref.get()
    
    if not user_doc.exists:
        logger.warning(f"No user profile found for authenticated UID {uid}")
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="No profile found for this account.",
        )
        
    user_data = user_doc.to_dict() or {}
    role = user_data.get("role")
    
    # Optional facility routing if the user is hospital scoped
    facility_id = user_data.get("hospitalId")
    facility_name = user_data.get("hospitalName")

    return UserProfile(
        id=uid,
        username=user_data.get("email") or decoded.get("email") or uid,
        role=role,
        facility_id=facility_id,
        facility_name=facility_name,
    )
