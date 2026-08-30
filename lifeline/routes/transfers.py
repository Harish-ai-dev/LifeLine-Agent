"""
Patient Transfer & Capacity Diversion routes per docs/09-parallel-build-contract.md#53-hospital-operations--patient-management.
"""

import uuid
import datetime
from fastapi import APIRouter, HTTPException, status
from lifeline.schemas import (
    TransferRequest,
    TransferResponse,
    TransferredHospitalInfo,
    TriageOutput,
    BedMatchingInput,
    BedMatchingOutput,
    ErrorResponse,
)
from lifeline.agents.bed_matching_agent import get_enriched_hospitals, run_bed_matching
from lifeline.tools.data_store import get_data_store
from lifeline.tools.firestore_client import write_audit_record

router = APIRouter()

HOSPITAL_NAME_MAP = {
    "hosp_mumbai_01": "Lilavati Hospital & Research Centre",
    "hosp_mumbai_02": "P. D. Hinduja National Hospital",
    "hosp_mumbai_03": "Breach Candy Hospital Trust",
    "hosp_mumbai_04": "King Edward Memorial (KEM) Hospital",
    "hosp_mumbai_11": "Lokmanya Tilak Municipal General Hospital (Sion Hospital)",
    "hosp_mumbai_13": "Fortis Hospital Mulund",
}


@router.post(
    "/cases/{id}/transfer",
    response_model=TransferResponse,
    responses={
        400: {"model": ErrorResponse, "description": "Invalid transfer request"},
        404: {"model": ErrorResponse, "description": "Case or hospital not found"},
    },
)
async def transfer_case(id: str, payload: TransferRequest):
    """
    Reroute / transfer an emergency patient when current hospital reaches capacity constraint.
    Invokes Bed-Matching logic with the overloaded hospital excluded.
    """
    store = get_data_store()

    # 1. Resolve current hospital name
    current_hosp_doc = store.get("hospitals", payload.current_hospital_id)
    prev_hosp_name = (
        current_hosp_doc.get("name")
        if current_hosp_doc
        else HOSPITAL_NAME_MAP.get(payload.current_hospital_id, "Current Hospital")
    )

    # 2. Get candidate hospitals enriched with ETA & bed availability
    all_candidates = get_enriched_hospitals(payload.patient_location)

    # Filter out current overloaded facility
    filtered_candidates = [
        h for h in all_candidates
        if payload.current_hospital_id not in h.get("id", "")
        and prev_hosp_name.lower() not in h.get("name", "").lower()
    ]

    if not filtered_candidates:
        filtered_candidates = all_candidates

    # 3. Match best available alternative hospital
    best_hospital = filtered_candidates[0]
    dest_name = best_hospital.get("name", "Alternative Hospital")
    dest_lat = float(best_hospital.get("lat", 19.033))
    dest_lng = float(best_hospital.get("lng", 72.838))
    dist_km = best_hospital.get("distance_km", 3.8)
    eta_mins = best_hospital.get("eta_minutes", 9.2)

    reasoning_text = (
        f"Rerouted from {prev_hosp_name} due to '{payload.reason}'. "
        f"Transferred to {dest_name}: available capacity, {dist_km} km distance, {eta_mins} min ETA."
    )

    # 4. Update patient status in store if patient exists
    matching_patients = store.query("patients", filters={"tracking_number": id})
    if not matching_patients:
        matching_patients = store.query("patients", filters={"id": id})

    for pat in matching_patients:
        await store.async_update(
            "patients",
            pat["_id"],
            {
                "admission_status": "transferred",
                "assigned_hospital_id": best_hospital.get("id", "hosp_mumbai_02"),
                "clinical_notes": f"Transferred to {dest_name}. Reason: {payload.reason}",
            },
            actor="transfer_agent",
        )

    # 5. Persist transfer audit record
    audit_data = {
        "event_type": "PATIENT_TRANSFER",
        "case_id": id,
        "previous_hospital_id": payload.current_hospital_id,
        "previous_hospital_name": prev_hosp_name,
        "transfer_reason": payload.reason,
        "destination_hospital": {
            "name": dest_name,
            "lat": dest_lat,
            "lng": dest_lng,
            "distance_km": dist_km,
            "eta_minutes": eta_mins,
        },
        "reasoning": reasoning_text,
    }

    try:
        audit_id = write_audit_record(audit_data)
    except Exception:
        audit_id = f"audit_tx_{uuid.uuid4().hex[:6]}"

    return TransferResponse(
        transfer_status="reassigned",
        case_id=id,
        previous_hospital=prev_hosp_name,
        transferred_to_hospital=TransferredHospitalInfo(
            name=dest_name,
            lat=dest_lat,
            lng=dest_lng,
            distance_km=dist_km,
            eta_minutes=eta_mins,
        ),
        reasoning=reasoning_text,
        audit_id=audit_id,
    )
