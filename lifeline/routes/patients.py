"""
Hospital Operations & Patient Management routes per docs/09-parallel-build-contract.md#53-hospital-operations--patient-management.
"""

import datetime
from typing import Optional
from fastapi import APIRouter, HTTPException, Query, status
from lifeline.schemas import (
    PatientRecord,
    PatientsResponse,
    PatientUpdateRequest,
    BedReserveRequest,
    BedReserveResponse,
    ErrorResponse,
)
from lifeline.tools.data_store import get_data_store

router = APIRouter()


@router.get(
    "/patients",
    response_model=PatientsResponse,
    responses={
        200: {"description": "List of active emergency patients"},
    },
)
async def list_patients(
    hospital_id: Optional[str] = Query(None),
    status_filter: Optional[str] = Query(None, alias="status"),
):
    """
    Retrieve active emergency patients for a facility or district.
    """
    store = get_data_store()
    all_patients = await store.async_list_all("patients")

    filtered = []
    for p in all_patients:
        if hospital_id and p.get("assigned_hospital_id") != hospital_id:
            continue
        if status_filter and status_filter.lower() != "all":
            if p.get("admission_status", "").lower() != status_filter.lower():
                continue

        p["id"] = p.get("_id") or p.get("id")
        filtered.append(PatientRecord(**p))

    return PatientsResponse(patients=filtered)


@router.patch(
    "/patients/{id}",
    response_model=PatientRecord,
    responses={
        404: {"model": ErrorResponse, "description": "Patient not found"},
    },
)
async def update_patient(id: str, payload: PatientUpdateRequest):
    """
    Update patient admission status, clinical notes, and assigned bed number post-arrival.
    """
    store = get_data_store()
    patient = await store.async_get("patients", id)
    if not patient:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Patient record '{id}' not found",
        )

    updates = {k: v for k, v in payload.model_dump().items() if v is not None}
    if updates:
        updated = await store.async_update("patients", id, updates, actor="hospital_staff")
        if updated:
            patient = updated

    patient["id"] = patient.get("_id") or patient.get("id") or id
    return PatientRecord(**patient)


@router.post(
    "/beds/{id}/reserve",
    response_model=BedReserveResponse,
    responses={
        400: {"model": ErrorResponse, "description": "Invalid bed reservation payload"},
        404: {"model": ErrorResponse, "description": "Patient not found"},
    },
)
async def reserve_bed(id: str, payload: BedReserveRequest):
    """
    Advance bed or trauma bay reservation for incoming critical patient.
    """
    store = get_data_store()
    now_iso = datetime.datetime.utcnow().isoformat() + "Z"

    # Bed ID can come from path parameter or generated from bay
    bed_id = id if id and id != "default" else f"ICU-{payload.bed_type[:4].upper()}-01"

    # Update patient record if patient_id is valid
    if payload.patient_id:
        patient = await store.async_get("patients", payload.patient_id)
        if patient:
            await store.async_update(
                "patients",
                payload.patient_id,
                {
                    "reserved_bed_type": payload.bed_type,
                    "reserved_bay_id": payload.bay_id,
                    "bed_number": bed_id,
                },
                actor=payload.hospital_id,
            )

    return BedReserveResponse(
        bed_id=bed_id,
        bay_id=payload.bay_id,
        status="reserved" if payload.action == "reserve" else "released",
        patient_id=payload.patient_id,
        reserved_at=now_iso,
    )
