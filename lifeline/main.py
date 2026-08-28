"""
FastAPI app — exposes POST /dispatch, deployed to Cloud Run.
See docs/05-environment-setup.md for the deploy command.
"""
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from lifeline.schemas import Case, Location
from lifeline.orchestrator import run_dispatch

app = FastAPI(title="LifeLine Agent")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"], # For hackathon demo, allow all
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


@app.get("/health")
def health():
    return {"status": "ok"}


@app.post("/dispatch")
def dispatch(case: Case, patient_location: Location):
    """TODO: call run_dispatch(case, patient_location), return the full record."""
    result = run_dispatch(case, patient_location)
    return result


