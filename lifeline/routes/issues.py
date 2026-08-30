"""
Hospital Operational & Equipment Issues routes per docs/09-parallel-build-contract.md#53-hospital-operations--patient-management.
"""

import datetime
from typing import Optional
from fastapi import APIRouter, HTTPException, Query, status
from lifeline.schemas import (
    IssueCreateRequest,
    IssueRecord,
    IssueUpdateRequest,
    IssuesResponse,
    ErrorResponse,
)
from lifeline.tools.data_store import get_data_store

router = APIRouter()

HOSPITAL_NAMES = {
    "hosp_mumbai_01": "Lilavati Hospital & Research Centre",
    "hosp_mumbai_02": "P. D. Hinduja National Hospital",
    "hosp_mumbai_03": "Breach Candy Hospital Trust",
    "hosp_mumbai_04": "King Edward Memorial (KEM) Hospital",
    "hosp_mumbai_11": "Lokmanya Tilak Municipal General Hospital (Sion Hospital)",
}


@router.get(
    "",
    response_model=IssuesResponse,
    responses={
        200: {"description": "List of hospital operational issues"},
    },
)
async def list_issues(
    hospital_id: Optional[str] = Query(None),
    category: Optional[str] = Query(None),
    status_filter: Optional[str] = Query(None, alias="status"),
):
    """
    Query operational and equipment issues across hospitals.
    """
    store = get_data_store()
    all_issues = await store.async_list_all("issues")

    filtered = []
    for issue in all_issues:
        if hospital_id and issue.get("hospital_id") != hospital_id:
            continue
        if category and category.lower() != "all" and issue.get("category", "").lower() != category.lower():
            continue
        if status_filter and status_filter.lower() != "all" and issue.get("status", "").lower() != status_filter.lower():
            continue

        issue["id"] = issue.get("_id") or issue.get("id")
        filtered.append(IssueRecord(**issue))

    return IssuesResponse(issues=filtered)


@router.post(
    "",
    response_model=IssueRecord,
    status_code=status.HTTP_201_CREATED,
    responses={
        400: {"model": ErrorResponse, "description": "Invalid issue creation payload"},
    },
)
async def create_issue(payload: IssueCreateRequest):
    """
    Log a new operational, equipment, or facility issue for a hospital.
    """
    store = get_data_store()
    issue_dict = payload.model_dump()

    if not issue_dict.get("hospital_name"):
        issue_dict["hospital_name"] = HOSPITAL_NAMES.get(payload.hospital_id, "Hospital Facility")

    now_iso = datetime.datetime.utcnow().isoformat() + "Z"
    issue_dict["created_at"] = now_iso
    issue_dict["resolved_at"] = None

    # Run AI Classification
    try:
        from lifeline.agents.issue_classifier_agent import run_issue_classification
        classification = run_issue_classification(
            title=payload.title,
            description=payload.description,
            hospital_id=payload.hospital_id
        )
        issue_dict["ai_classification"] = classification
        # Overwrite default severity/category with AI's judgment if applicable
        if classification.get("severity"):
            issue_dict["severity"] = classification["severity"]
        if classification.get("category"):
            issue_dict["category"] = classification["category"]
    except Exception:
        pass

    created = await store.async_create("issues", issue_dict, actor=payload.reported_by)
    created["id"] = created["_id"]

    return IssueRecord(**created)


@router.patch(
    "/{id}",
    response_model=IssueRecord,
    responses={
        404: {"model": ErrorResponse, "description": "Issue not found"},
    },
)
async def update_issue(id: str, payload: IssueUpdateRequest):
    """
    Update status, severity, or resolution timestamp for an issue.
    """
    store = get_data_store()
    issue = await store.async_get("issues", id)
    if not issue:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Issue with ID '{id}' not found",
        )

    updates = {k: v for k, v in payload.model_dump().items() if v is not None}
    if updates.get("status") == "resolved" and not updates.get("resolved_at"):
        updates["resolved_at"] = datetime.datetime.utcnow().isoformat() + "Z"

    if updates:
        updated = await store.async_update("issues", id, updates, actor="hospital_staff")
        if updated:
            issue = updated

    issue["id"] = issue.get("_id") or issue.get("id") or id
    return IssueRecord(**issue)
