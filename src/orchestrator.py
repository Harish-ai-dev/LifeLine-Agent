"""
Orchestrator — chains Triage -> Bed-Matching -> (stretch) Routing -> Briefing.
See docs/01-architecture.md for the full diagram and docs/03-decision-log.md
for why SequentialAgent was chosen.
"""
from src.tools.news2 import news2_score
from src.tools.firestore_client import write_audit_record
from src.agents.triage_agent import run_triage
from src.agents.bed_matching_agent import run_bed_matching
from src.schemas import Case, TriageInput, BedMatchingInput, Location


def run_dispatch(case: Case, patient_location: Location) -> dict:
    """
    TODO: full pipeline —
    1. compute news2_score(case.vitals)
    2. run_triage(TriageInput(**case.dict(), news2_score=score))
    3. run_bed_matching(BedMatchingInput(triage_result=..., patient_location=...))
    4. (stretch) run_routing, run_briefing
    5. assemble full record, write_audit_record(record)
    6. return record for the API/UI to display
    """
    raise NotImplementedError
