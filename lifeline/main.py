"""
FastAPI app — LifeLine Agent Multi-Role Emergency Healthcare Coordination API.
Deployed to Cloud Run. Conforms to docs/09-parallel-build-contract.md.
"""

import uuid
from fastapi import FastAPI, Body, Request, status
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse
from fastapi.exceptions import RequestValidationError
from starlette.exceptions import HTTPException as StarletteHTTPException

from lifeline.schemas import Case, Location, DispatchRequest
from lifeline.orchestrator import run_dispatch
from lifeline.tools.data_store import get_data_store

# Import modular route handlers
from lifeline.routes import (
    auth,
    donors,
    requests as req_routes,
    patients,
    transfers,
    issues,
    inventory,
    reports,
    chat,
)

app = FastAPI(
    title="LifeLine Agent API",
    description="Autonomous emergency triage, hospital matchmaking, and healthcare coordination platform powered by Google ADK and Gemini",
    version="0.1.0",
)

# ── CORS Middleware ────────────────────────────────────────────────────────────

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


# ── Standard Error Handlers ────────────────────────────────────────────────────

@app.exception_handler(StarletteHTTPException)
async def custom_http_exception_handler(request: Request, exc: StarletteHTTPException):
    """
    Ensure all HTTP error responses conform to {"detail": "...", "code": "..."}.
    """
    code_map = {
        400: "BAD_REQUEST",
        401: "UNAUTHORIZED",
        403: "FORBIDDEN",
        404: "RESOURCE_NOT_FOUND",
        409: "CONFLICT",
        422: "VALIDATION_ERROR",
        500: "INTERNAL_ERROR",
    }
    error_code = getattr(exc, "code", code_map.get(exc.status_code, "HTTP_ERROR"))
    return JSONResponse(
        status_code=exc.status_code,
        content={"detail": str(exc.detail), "code": error_code},
    )


@app.exception_handler(RequestValidationError)
async def validation_exception_handler(request: Request, exc: RequestValidationError):
    """
    Validation error handler conforming to standard error schema.
    """
    return JSONResponse(
        status_code=400,
        content={"detail": str(exc), "code": "VALIDATION_ERROR"},
    )


# ── Core Health & Dispatch Endpoints (Preserved with Zero Regressions) ────────

@app.get("/health", tags=["System Health"])
def health():
    """Service health and version probe."""
    return {"status": "ok", "service": "lifeline-agent", "version": "0.1.0"}


@app.post("/dispatch", tags=["Core Dispatch"])
async def dispatch(payload: dict = Body(...)):
    """
    Execute multi-agent emergency dispatch workflow.
    Accepts either:
      1. {"case": {...}, "patient_location": {...}}
      2. {"patient_age": ..., "vitals": {...}, "chief_complaint": ..., "patient_location": {...}}
    """
    if "case" in payload and "patient_location" in payload:
        case_obj = Case(**payload["case"])
        loc_obj = Location(**payload["patient_location"])
    elif "patient_location" in payload:
        loc_data = payload.get("patient_location")
        loc_obj = Location(**loc_data)
        case_data = {k: v for k, v in payload.items() if k != "patient_location"}
        case_obj = Case(**case_data)
    else:
        raise ValueError("Missing 'patient_location' or 'case' in payload")

    result = run_dispatch(case_obj, loc_obj)
    return result


@app.post("/sos", tags=["Emergency SOS"])
async def emergency_sos(payload: dict = Body(...)):
    """
    Trigger immediate emergency dispatch intake from hospital or field mobile client.
    Runs full multi-agent pipeline and automatically creates an inbound patient dossier.
    """
    if "case" in payload and "patient_location" in payload:
        case_obj = Case(**payload["case"])
        loc_obj = Location(**payload["patient_location"])
    elif "patient_location" in payload:
        loc_data = payload.get("patient_location")
        loc_obj = Location(**loc_data)
        case_data = {k: v for k, v in payload.items() if k != "patient_location"}
        case_obj = Case(**case_data)
    else:
        raise ValueError("Missing 'patient_location' or 'case' in payload")

    # Run dispatch pipeline
    dispatch_result = run_dispatch(case_obj, loc_obj)

    # Register inbound patient in data store
    store = get_data_store()
    alert_id = f"ALERT-{uuid.uuid4().hex[:6].upper()}"
    case_id = dispatch_result.get("case_id", f"CASE-{uuid.uuid4().int % 9000 + 1000}")
    dest_hospital = dispatch_result.get("bed_match", {}).get("chosen_hospital", {})
    triage_info = dispatch_result.get("triage", {})
    briefing_info = dispatch_result.get("briefing", {})
    news2_info = dispatch_result.get("news2", {})

    patient_record = {
        "tracking_number": case_id,
        "full_name": f"Emergency Patient ({case_obj.patient_age}yo)",
        "age": case_obj.patient_age,
        "gender": "Unknown",
        "severity": triage_info.get("severity_label", "critical"),
        "assigned_hospital_id": dest_hospital.get("id", "hosp_mumbai_01"),
        "admission_status": "inbound",
        "reserved_bed_type": f"{triage_info.get('required_specialty', 'general')}_icu",
        "reserved_bay_id": "BAY-EM1",
        "eta_minutes": dest_hospital.get("eta_minutes", 5.0),
        "vitals": case_obj.vitals.model_dump(),
        "news2_score": news2_info.get("score", 7),
        "chief_complaint": case_obj.chief_complaint,
        "sbar_brief": briefing_info.get("pre_arrival_brief"),
    }

    try:
        created_patient = await store.async_create("patients", patient_record, actor="sos_intake")
        dispatch_result["patient_id"] = created_patient["_id"]
    except Exception:
        dispatch_result["patient_id"] = "pat_sos_local"

    dispatch_result["alert_id"] = alert_id
    return dispatch_result


# ── Register Modular Sub-Agent Routers ────────────────────────────────────────

app.include_router(auth.router, prefix="/auth", tags=["Authentication & Identity"])
app.include_router(donors.router, prefix="/donors", tags=["Blood & Organ Donors"])
app.include_router(req_routes.router, prefix="/requests", tags=["Resource & Blood Requests"])
app.include_router(patients.router, tags=["Hospital Operations & Beds"])
app.include_router(transfers.router, tags=["Patient Transfers & Diversion"])
app.include_router(issues.router, prefix="/issues", tags=["Hospital Issues Logging"])
app.include_router(inventory.router, prefix="/inventory", tags=["Medicine & Equipment Inventory"])
app.include_router(reports.router, tags=["Regional Intelligence & Executive Reports"])
app.include_router(chat.router, tags=["AI Co-Pilot & Supervisor Assistance"])
