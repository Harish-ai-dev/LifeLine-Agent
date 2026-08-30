"""
Blood & Organ Donor routes — registration and donor dossiers per docs/09-parallel-build-contract.md#52-blood--organ-donor-workstream.
"""

from fastapi import APIRouter, HTTPException, status
from lifeline.schemas import DonorCreateRequest, DonorSummary, DonorDetail, ErrorResponse
from lifeline.tools.data_store import get_data_store

router = APIRouter()


@router.post(
    "",
    response_model=DonorSummary,
    status_code=status.HTTP_201_CREATED,
    responses={
        400: {"model": ErrorResponse, "description": "Invalid donor registration payload"},
    },
)
async def register_donor(payload: DonorCreateRequest):
    """
    Register a new blood/organ donor or update donor profile.
    """
    store = get_data_store()
    donor_data = payload.model_dump()
    donor_data["total_donations"] = 0
    donor_data["badge_title"] = "Lifesaver"
    donor_data["active_match_request_id"] = None
    donor_data["donation_history"] = []

    created = await store.async_create("donors", donor_data, actor="blood_donor")

    return DonorSummary(
        id=created["_id"],
        full_name=created["full_name"],
        blood_group=created["blood_group"],
        is_organ_donor=created.get("is_organ_donor", False),
        donor_category=created.get("donor_category", "Blood"),
        status=created.get("status", "available"),
        eligibility_status=created.get("eligibility_status", "eligible"),
        total_donations=created.get("total_donations", 0),
        badge_title=created.get("badge_title", "Lifesaver"),
        _timestamp=created.get("_timestamp"),
    )


@router.get(
    "/{id}",
    response_model=DonorDetail,
    responses={
        404: {"model": ErrorResponse, "description": "Donor not found"},
    },
)
async def get_donor_by_id(id: str):
    """
    Fetch comprehensive donor dossier including past donation history.
    """
    store = get_data_store()
    donor = await store.async_get("donors", id)
    if not donor:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Donor with ID '{id}' not found",
        )

    # Ensure id field is set
    donor["id"] = donor.get("_id") or donor.get("id") or id
    return DonorDetail(**donor)
