"""
Orchestrator — Coordinates the full multi-agent pipeline:
Clinical NEWS2 Calculation -> Triage Agent -> Bed-Matching Agent -> Routing Agent -> Briefing Agent -> Firestore Audit Logging.
"""

import logging
import os
from dotenv import load_dotenv

load_dotenv()

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
    import time
    t0 = time.time()
    
    n2 = news2_score(case.vitals)
    t1 = time.time()
    print(f"[TIME] NEWS2: {t1-t0:.2f}s")

    # ── 2. Triage Reasoning Agent (Instant Deterministic Path) ──────────────
    triage_in = TriageInput(
        patient_age=case.patient_age,
        vitals=case.vitals,
        chief_complaint=case.chief_complaint,
        mechanism_of_injury=case.mechanism_of_injury,
        news2_score=n2,
    )
    triage_out = run_triage(triage_in, max_loops=0)
    t2 = time.time()
    print(f"[TIME] Triage Agent: {t2-t1:.2f}s")

    # ── 3. Bed-Matching Specialist Agent (Instant Deterministic Path) ───────
    bed_in = BedMatchingInput(
        triage_result=triage_out,
        patient_location=patient_location,
    )
    bed_out = run_bed_matching(bed_in, max_loops=0)
    t3 = time.time()
    print(f"[TIME] Bed Matching Agent: {t3-t2:.2f}s")

    # ── 4. Routing & Telemetry Agent ────────────────────────────────────────
    dest_loc = Location(lat=bed_out.chosen_hospital.lat, lng=bed_out.chosen_hospital.lng)
    routing_out = run_routing(patient_location, dest_loc)
    t4 = time.time()
    print(f"[TIME] Routing Agent: {t4-t3:.2f}s")

    # ── 5. Clinical Briefing (SBAR) Agent (Instant Deterministic Path) ──────
    briefing_out = run_briefing(case, triage_out, bed_out, routing_out, max_loops=0)
    t5 = time.time()
    print(f"[TIME] Briefing Agent: {t5-t4:.2f}s")

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
