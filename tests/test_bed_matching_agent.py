"""Tests for Bed-Matching Agent schemas and enrichment logic."""
from lifeline.schemas import (
    Location,
    TriageOutput,
    BedMatchingInput,
    BedMatchingOutput,
    HospitalChoice,
)
from lifeline.agents.bed_matching_agent import _haversine_distance, get_enriched_hospitals


def test_haversine_distance():
    loc1 = Location(lat=19.0760, lng=72.8777)
    loc2 = Location(lat=19.0896, lng=72.8656)
    dist = _haversine_distance(loc1, loc2)
    assert dist > 0
    assert dist < 10  # roughly 2 km in Mumbai


def test_get_enriched_hospitals():
    patient_loc = Location(lat=19.0760, lng=72.8777)
    hospitals = get_enriched_hospitals(patient_loc)
    assert len(hospitals) > 0
    first = hospitals[0]
    assert "name" in first
    assert "distance_km" in first
    assert "eta_minutes" in first


def test_bed_matching_output_schema():
    data = {
        "chosen_hospital": {
            "name": "Apollo Hospital",
            "lat": 19.0728,
            "lng": 72.8826,
            "distance_km": 1.2,
            "eta_minutes": 5.0,
        },
        "reasoning": "High ICU capacity and specialized cardiology department.",
        "alternatives": [
            {"name": "City General Hospital", "reason_not_chosen": "Fewer ICU beds available"}
        ],
    }
    out = BedMatchingOutput(**data)
    assert out.chosen_hospital.name == "Apollo Hospital"
    assert len(out.alternatives) == 1
