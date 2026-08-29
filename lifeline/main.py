"""
FastAPI app — exposes POST /dispatch, deployed to Cloud Run.
See docs/05-environment-setup.md for the deploy command.
"""
from fastapi import FastAPI, Body, Request
from fastapi.middleware.cors import CORSMiddleware
from lifeline.schemas import Case, Location, DispatchRequest
from lifeline.orchestrator import run_dispatch

app = FastAPI(
    title="LifeLine Agent API",
    description="Autonomous emergency triage and bed matching agent powered by Google ADK and Gemini",
    version="0.1.0",
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


@app.get("/health")
def health():
    return {"status": "ok", "service": "lifeline-agent", "version": "0.1.0"}


@app.post("/dispatch")
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
