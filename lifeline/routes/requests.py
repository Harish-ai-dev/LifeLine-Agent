"""
Resource & Blood Requests routes per docs/09-parallel-build-contract.md#52-blood--organ-donor-workstream.
"""

import datetime
import uuid
from typing import Optional, Literal
from fastapi import APIRouter, HTTPException, Query, status
from lifeline.schemas import (
    ResourceRequestCreate,
    ResourceRequestItem,
    ResourceRequestsResponse,
    RequestRespondPayload,
    RequestRespondResponse,
    DonationLocation,
    ErrorResponse,
)
from lifeline.tools.data_store import get_data_store

router = APIRouter()

HOSPITAL_DEFAULTS = {
    "hosp_mumbai_01": {
        "name": "Lilavati Hospital & Research Centre",
        "address": "A-791, Bandra Reclamation, Bandra West, Mumbai",
        "lat": 19.0522,
        "lng": 72.8336,
        "phone": "+91-22-2675-1000",
    },
    "hosp_mumbai_02": {
        "name": "P. D. Hinduja National Hospital",
        "address": "Veer Savarkar Marg, Mahim, Mumbai",
        "lat": 19.0330,
        "lng": 72.8384,
        "phone": "+91-22-2445-1515",
    },
    "hosp_mumbai_03": {
        "name": "Breach Candy Hospital Trust",
        "address": "60 A, Bhulabhai Desai Road, Mumbai",
        "lat": 18.9723,
        "lng": 72.8055,
        "phone": "+91-22-2367-1888",
    },
    "hosp_mumbai_04": {
        "name": "King Edward Memorial (KEM) Hospital",
        "address": "Acharya Donde Marg, Parel, Mumbai",
        "lat": 19.0026,
        "lng": 72.8423,
        "phone": "+91-22-2410-7000",
    },
}


@router.get(
    "",
    response_model=ResourceRequestsResponse,
    responses={
        200: {"description": "List of active resource/blood requests"},
    },
)
async def list_requests(
    status_filter: Optional[str] = Query("open", alias="status"),
    type: Optional[str] = Query(None),
    blood_group: Optional[str] = Query(None),
):
    """
    Query open/active resource requests with optional filtering by status, type, and blood group.
    """
    store = get_data_store()
    all_requests = await store.async_list_all("requests")

    filtered = []
    for r in all_requests:
        # Filter by status
        if status_filter and status_filter.lower() != "all":
            if r.get("status", "").lower() != status_filter.lower():
                continue

        # Filter by type
        if type and type.lower() != "all":
            if r.get("type", "").lower() != type.lower():
                continue

        # Filter by blood_group
        if blood_group and blood_group.lower() != "all":
            if r.get("blood_group_needed", "").upper() != blood_group.upper():
                continue

        # Ensure ID consistency
        r["id"] = r.get("_id") or r.get("id")
        filtered.append(ResourceRequestItem(**r))

    return ResourceRequestsResponse(requests=filtered)


@router.post(
    "",
    response_model=ResourceRequestItem,
    status_code=status.HTTP_201_CREATED,
    responses={
        400: {"model": ErrorResponse, "description": "Invalid request payload"},
    },
)
async def create_request(payload: ResourceRequestCreate):
    """
    Hospital raises an urgent resource, blood unit, or organ callout request.
    """
    store = get_data_store()
    req_dict = payload.model_dump()

    # Resolve hospital details
    hosp_info = HOSPITAL_DEFAULTS.get(payload.hospital_id, {})
    if not req_dict.get("hospital_name"):
        req_dict["hospital_name"] = hosp_info.get("name", "Hospital Emergency Department")

    # Generate tracking number
    today_str = datetime.datetime.utcnow().strftime("%Y-%m%d")
    rand_seq = uuid.uuid4().hex[:2].upper()
    req_dict["request_tracking_number"] = f"REQ-{today_str}-{rand_seq}"
    req_dict["status"] = "open"
    req_dict["units_fulfilled"] = 0
    req_dict["matched_donors"] = []

    # Build donation location if missing
    if not req_dict.get("donation_location"):
        req_dict["donation_location"] = {
            "hospital_id": payload.hospital_id,
            "hospital_name": req_dict["hospital_name"],
            "department": "Emergency Blood Bank - 2nd Floor",
            "address": hosp_info.get("address", "Emergency Care Facility"),
            "lat": hosp_info.get("lat", 19.052),
            "lng": hosp_info.get("lng", 72.833),
            "phone": hosp_info.get("phone", "+91-22-2675-1000"),
        }

    created = await store.async_create("requests", req_dict, actor=payload.hospital_id)
    created["id"] = created["_id"]

    return ResourceRequestItem(**created)


@router.post(
    "/{id}/respond",
    response_model=RequestRespondResponse,
    responses={
        404: {"model": ErrorResponse, "description": "Request not found"},
        409: {"model": ErrorResponse, "description": "Request already fulfilled or closed"},
    },
)
async def respond_to_request(id: str, payload: RequestRespondPayload):
    """
    Donor accepts or declines an open blood/organ transit request.
    """
    store = get_data_store()
    req = await store.async_get("requests", id)
    if not req:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Resource request with ID '{id}' not found",
        )

    if req.get("status") in ["fulfilled", "cancelled"]:
        raise HTTPException(
            status_code=status.HTTP_409_CONFLICT,
            detail=f"Request '{id}' is already {req.get('status')}",
        )

    now_iso = datetime.datetime.utcnow().isoformat() + "Z"
    matched_donors = req.get("matched_donors", [])
    matched_donors.append({
        "donor_id": payload.donor_id,
        "status": payload.response_status,
        "travel_mode": payload.travel_mode or "driving",
        "eta_minutes": payload.eta_minutes or 15.0,
        "responded_at": now_iso,
    })

    new_status = "matched" if payload.response_status == "accepted" else req.get("status", "open")
    await store.async_update(
        "requests",
        id,
        {
            "matched_donors": matched_donors,
            "status": new_status,
        },
        actor=payload.donor_id,
    )

    # If accepted, link to donor record
    if payload.response_status == "accepted":
        await store.async_update(
            "donors",
            payload.donor_id,
            {"active_match_request_id": id},
            actor=payload.donor_id,
        )

    return RequestRespondResponse(
        request_id=id,
        donor_id=payload.donor_id,
        status=new_status,
        donor_response_status=payload.response_status,
        eta_minutes=payload.eta_minutes or 14.0,
        updated_at=now_iso,
    )
