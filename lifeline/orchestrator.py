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
    Execute the end-to-end multi-agent emergency dispatch pipeline.
    
    1. Compute clinically validated NEWS2 score from patient vitals.
    2. Invoke Triage Agent (Gemini 3.1 Pro / 3.5 Flash) with NEWS2 grounding.
    3. Invoke Bed-Matching Agent (Gemini 3.5 Flash) with OSM location + OSRM ETA enrichment.
    4. Invoke Routing Agent to calculate precise turn-by-turn driving summary.
    5. Invoke Briefing Agent (Gemini 3.5 Flash) to generate hospital pre-arrival report.
    6. Write complete immutable decision trail to Firestore audit logs.
    7. Return consolidated payload to frontend/caller.
    """
    # Step 1: Clinical score computation
    news2_res = news2_score(case.vitals)

    # Step 2: Triage Agent reasoning
    triage_input = TriageInput(
        patient_age=case.patient_age,
        vitals=case.vitals,
        chief_complaint=case.chief_complaint,
        mechanism_of_injury=case.mechanism_of_injury,
        news2_score=news2_res,
    )
    triage_output = run_triage(triage_input)

    # Step 3: Bed-Matching Agent reasoning
    bed_input = BedMatchingInput(
        triage_result=triage_output,
        patient_location=patient_location,
    )
    bed_output = run_bed_matching(bed_input)

    # Step 4: Routing calculation
    dest_loc = Location(
        lat=bed_output.chosen_hospital.lat,
        lng=bed_output.chosen_hospital.lng,
    )
    routing_output = run_routing(patient_location, dest_loc)

    # Step 5: Pre-arrival ER Briefing
    briefing_output = run_briefing(
        case=case,
        triage=triage_output,
        bed_match=bed_output,
        routing=routing_output,
    )

    # Step 6: Assemble full dispatch record
    record = {
        "case": case.model_dump(),
        "patient_location": patient_location.model_dump(),
        "news2": news2_res.model_dump(),
        "triage": triage_output.model_dump(),
        "bed_match": bed_output.model_dump(),
        "routing": routing_output.model_dump(),
        "briefing": briefing_output.model_dump(),
    }

    # Step 7: Persist to Firestore audit collection
    try:
        doc_id = write_audit_record(record)
        record["audit_id"] = doc_id
    except Exception as e:
        logger.warning(f"Firestore audit logging skipped/unavailable: {e}")
        record["audit_id"] = "offline_dev_mode"

    return record
