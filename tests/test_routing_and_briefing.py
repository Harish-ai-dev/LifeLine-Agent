"""Tests for Routing and Briefing agents."""
from lifeline.schemas import (
    Case,
    Vitals,
    Location,
    TriageOutput,
    BedMatchingOutput,
    HospitalChoice,
    RoutingOutput,
    BriefingOutput,
)
from lifeline.agents.routing_agent import run_routing
from lifeline.agents.briefing_agent import _build_briefing_prompt


def test_routing_agent():
    origin = Location(lat=19.0760, lng=72.8777)
    dest = Location(lat=19.0896, lng=72.8656)
    res = run_routing(origin, dest)
    assert isinstance(res, RoutingOutput)
    assert res.distance_km > 0
    assert res.eta_minutes > 0
    assert len(res.route_summary) > 0


def test_briefing_prompt_builder():
    case = Case(
        patient_age=45,
        vitals=Vitals(heart_rate=110, respiratory_rate=22, systolic_bp=95, spo2=93, temperature_c=37.8, consciousness="alert"),
        chief_complaint="acute chest pressure",
        mechanism_of_injury=None,
    )
    triage = TriageOutput(
        severity_label="critical",
        required_specialty="cardiac",
        notes="High cardiac risk",
    )
    bed_match = BedMatchingOutput(
        chosen_hospital=HospitalChoice(name="Apollo Hospital", lat=19.0728, lng=72.8826, distance_km=2.5, eta_minutes=7.0),
        reasoning="Nearest cath-lab equipped hospital",
        alternatives=[],
    )
    routing = RoutingOutput(eta_minutes=7.0, distance_km=2.5, route_summary="2.5 km drive")

    prompt = _build_briefing_prompt(case, triage, bed_match, routing)
    assert "Apollo Hospital" in prompt
    assert "CRITICAL" in prompt
    assert "acute chest pressure" in prompt
