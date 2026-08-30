"""
Orchestrator — Coordinates the full multi-agent pipeline:
Clinical NEWS2 Calculation -> Triage Agent -> Bed-Matching Agent -> Routing Agent -> Briefing Agent -> Firestore Audit Logging.
"""

import logging
from lifeline.tools.news2 import news2_score
from lifeline.tools.firestore_client import write_audit_record
from lifeline.agents.triage_agent import run_triage
from lifeline.agents.bed_matching_agent import run_bed_matching
from lifeline.agents.routing_agent import run_routing
from lifeline.agents.briefing_agent import run_briefing
from lifeline.schemas import Case, TriageInput, BedMatchingInput, Location

logger = logging.getLogger(__name__)


def run_dispatch(case: Case, patient_location: Location) -> dict:
    """
    Execute the multi-agent emergency dispatch pipeline.
    Uses clinical NEWS2 calculation + Triage + Bed Matching + Routing + Briefing,
    backed by resilient deterministic clinical engine fallbacks.
    """
    # ── 1. NEWS2 Deterministic Calculation ──────────────────────────────────
    n2 = news2_score(case.vitals)

    # ── 2. Triage Reasoning Agent ───────────────────────────────────────────
    triage_in = TriageInput(
        patient_age=case.patient_age,
        vitals=case.vitals,
        chief_complaint=case.chief_complaint,
        mechanism_of_injury=case.mechanism_of_injury,
        news2_score=n2,
    )
    triage_out = run_triage(triage_in)

    # ── 3. Bed-Matching Specialist Agent ────────────────────────────────────
    bed_in = BedMatchingInput(
        triage_result=triage_out,
        patient_location=patient_location,
    )
    bed_out = run_bed_matching(bed_in)

    # ── 4. Routing & Telemetry Agent ────────────────────────────────────────
    dest_loc = Location(lat=bed_out.chosen_hospital.lat, lng=bed_out.chosen_hospital.lng)
    routing_out = run_routing(patient_location, dest_loc)

    # ── 5. Clinical Briefing (SBAR) Agent ───────────────────────────────────
    briefing_out = run_briefing(case, triage_out, bed_out, routing_out)

    record = {
        "case": case.model_dump(),
        "patient_location": patient_location.model_dump(),
        "supervisor_state": "COMPLETED",
        "supervisor_summary": f"Emergency triage complete. Patient matched to {bed_out.chosen_hospital.name} with ETA {routing_out.eta_minutes}m.",
        "news2": n2.model_dump(),
        "triage": triage_out.model_dump(),
        "bed_match": bed_out.model_dump(),
        "routing": routing_out.model_dump(),
        "briefing": briefing_out.model_dump(),
    }

    try:
        doc_id = write_audit_record(record)
        record["audit_id"] = doc_id
    except Exception as e:
        logger.warning(f"Firestore audit logging skipped/unavailable: {e}")
        record["audit_id"] = "offline_dev_mode"

    return record
