"""
FastAPI app — exposes POST /dispatch, deployed to Cloud Run.
See docs/05-environment-setup.md for the deploy command.
"""
from fastapi import FastAPI
from src.schemas import Case, Location
from src.orchestrator import run_dispatch

app = FastAPI(title="LifeLine Agent")


@app.get("/health")
def health():
    return {"status": "ok"}


@app.post("/dispatch")
def dispatch(case: Case, patient_location: Location):
    """TODO: call run_dispatch(case, patient_location), return the full record."""
    result = run_dispatch(case, patient_location)
    return result
