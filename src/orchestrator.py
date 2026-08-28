"""
Orchestrator — chains Triage -> Bed-Matching -> (stretch) Routing -> Briefing.
See docs/01-architecture.md for the full diagram and docs/03-decision-log.md
for why SequentialAgent was chosen.
"""
from src.tools.news2 import news2_score
from src.tools.firestore_client import write_audit_record
from src.agents.triage_agent import run_triage
from src.agents.bed_matching_agent import run_bed_matching
from src.agents.routing_agent import run_routing
from src.agents.briefing_agent import run_briefing
from src.schemas import Case, TriageInput, BedMatchingInput, Location, RoutingOutput, BriefingOutput
import json
from datetime import datetime


def run_dispatch(case: Case, patient_location: Location) -> dict:
    """
    Full pipeline —
    1. compute news2_score(case.vitals)
    2. run_triage(TriageInput(**case.dict(), news2_score=score))
    3. run_bed_matching(BedMatchingInput(triage_result=..., patient_location=...))
    4. run_routing (if implemented)
    5. run_briefing (if implemented)
    6. assemble full record, write_audit_record(record)
    7. return record for the API/UI to display
    """
    # 1. Compute NEWS2 score
    news2_result = news2_score(case.vitals)

    # 2. Run Triage Agent
    triage_input = TriageInput(**case.dict(), news2_score=news2_result)
    triage_result = run_triage(triage_input)

    # 3. Run Bed-Matching Agent
    bed_matching_input = BedMatchingInput(triage_result=triage_result, patient_location=patient_location)
    bed_matching_result = run_bed_matching(bed_matching_input)

    # 4. Run Routing Agent (stretch feature)
    routing_result = None
    try:
        # Only run if we have a chosen hospital with coordinates
        if bed_matching_result.chosen_hospital.lat and bed_matching_result.chosen_hospital.lng:
            routing_result = run_routing(
                patient_location=patient_location,
                hospital_location=bed_matching_result.chosen_hospital
            )
    except Exception as e:
        # Routing agent might not be implemented yet, continue without it
        pass

    # 5. Run Briefing Agent (stretch feature)
    briefing_result = None
    try:
        briefing_result = run_briefing(
            case=case,
            triage_result=triage_result,
            bed_matching_result=bed_matching_result,
            routing_result=routing_result
        )
    except Exception as e:
        # Briefing agent might not be implemented yet, continue without it
        pass

    # 6. Assemble full record
    record = {
        "case_id": f"dispatch_{datetime.now().strftime('%Y%m%d_%H%M%S%f')}",
        "timestamp": datetime.now().isoformat(),
        "input_case": case.dict(),
        "news2_score": news2_result.dict(),
        "triage_output": triage_result.dict(),
        "bed_matching_output": bed_matching_result.dict(),
    }

    # Add optional stretch outputs if available
    if routing_result:
        record["routing_output"] = routing_result.dict()

    if briefing_result:
        record["briefing_output"] = briefing_result.dict()

    # 7. Write audit record to Firestore
    try:
        doc_id = write_audit_record(record)
        record["firestore_doc_id"] = doc_id
    except Exception as e:
        # If Firestore is not configured, continue without it for local testing
        record["firestore_error"] = str(e)

    return record
