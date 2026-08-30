"""
Auth & Identity routes — Demo/Mock authentication per docs/09-parallel-build-contract.md#51-authentication--identity.
"""

from typing import Optional
from fastapi import APIRouter, Header, HTTPException, status
from lifeline.schemas import LoginRequest, LoginResponse, UserProfile, ErrorResponse
from lifeline.tools.data_store import get_data_store

router = APIRouter()

VALID_ROLES = {"blood_donor", "hospital_staff", "government_authority"}

FACILITY_NAMES = {
    "hosp_mumbai_01": "Lilavati Hospital & Research Centre",
    "hosp_mumbai_02": "P. D. Hinduja National Hospital",
    "hosp_mumbai_03": "Breach Candy Hospital Trust",
    "hosp_mumbai_04": "King Edward Memorial (KEM) Hospital",
    "hosp_mumbai_11": "Lokmanya Tilak Municipal General Hospital (Sion Hospital)",
    "hosp_mumbai_13": "Fortis Hospital Mulund",
}


@router.post(
    "/login",
    response_model=LoginResponse,
    responses={
        400: {"model": ErrorResponse, "description": "Invalid role or payload"},
    },
)
async def login(payload: LoginRequest):
    """
    Demo/mock login for LifeLine Agent role personas.
    Accepts blood_donor, hospital_staff, or government_authority.
    """
    if payload.role not in VALID_ROLES:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=f"Invalid role '{payload.role}'. Must be one of: {list(VALID_ROLES)}",
        )

    # Generate user ID and session token
    clean_username = payload.username.strip().lower().replace(" ", "_")
    user_id = f"usr_{clean_username[:10]}"
    token = f"lifeline_mock_{payload.role}_{user_id}"

    facility_id = payload.facility_id
    facility_name = None

    if payload.role == "hospital_staff":
        if not facility_id:
            facility_id = "hosp_mumbai_01"
        # Look up hospital name in data store or static map
        store = get_data_store()
        hosp = store.get("hospitals", facility_id)
        if hosp and hosp.get("name"):
            facility_name = hosp["name"]
        else:
            facility_name = FACILITY_NAMES.get(facility_id, "Lilavati Hospital & Research Centre")

    user_profile = UserProfile(
        id=user_id,
        username=payload.username,
        role=payload.role,
        facility_id=facility_id,
        facility_name=facility_name,
    )

    return LoginResponse(
        token=token,
        user=user_profile,
    )


@router.get(
    "/me",
    response_model=UserProfile,
    responses={
        401: {"model": ErrorResponse, "description": "Missing or invalid token"},
    },
)
async def get_current_user(authorization: Optional[str] = Header(None)):
    """
    Resolve currently authenticated user profile from Authorization Bearer token.
    """
    if not authorization or not authorization.startswith("Bearer "):
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Missing or malformed Authorization header. Expected 'Bearer <token>'",
        )

    token = authorization.split("Bearer ", 1)[1].strip()
    # Format: lifeline_mock_<role>_<uid>
    parts = token.split("_")
    if not token.startswith("lifeline_mock_") or len(parts) < 4:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid mock token format. Expected 'lifeline_mock_<role>_<uid>'",
        )

    # Reconstruct role and uid
    # e.g. lifeline_mock_hospital_staff_usr_dr_smith
    # e.g. lifeline_mock_blood_donor_donor_6721
    token_body = token[len("lifeline_mock_"):]
    matched_role = None
    for r in VALID_ROLES:
        if token_body.startswith(r + "_"):
            matched_role = r
            break

    if not matched_role:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Unknown role in token payload.",
        )

    uid = token_body[len(matched_role) + 1:]
    username = uid.replace("usr_", "").replace("donor_", "").replace("gov_", "")

    facility_id = "hosp_mumbai_01" if matched_role == "hospital_staff" else None
    facility_name = "Lilavati Hospital & Research Centre" if matched_role == "hospital_staff" else None

    return UserProfile(
        id=uid,
        username=username,
        role=matched_role,  # type: ignore
        facility_id=facility_id,
        facility_name=facility_name,
    )
