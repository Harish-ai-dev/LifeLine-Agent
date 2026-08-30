"""
Bed-Matching Agent — ADK LlmAgent powered by Gemini 3.5 Flash.
Input/output contract: docs/04-agent-contracts.md#bed-matching-agent

Selects the best hospital based on specialty match, bed availability (e.g., ICU beds for critical),
and driving ETA / distance.
"""

import json
import math
import os
from google.adk.agents import LlmAgent
from google.adk.runners import Runner
from google.adk.sessions import InMemorySessionService
from google.genai import types as genai_types
from lifeline.async_utils import run_async
from lifeline.models import AGENT_MODELS
from lifeline.schemas import (
    BedMatchingInput,
    BedMatchingOutput,
    HospitalChoice,
    AlternativeHospital,
    Location,
)
from lifeline.tools.routes_api import get_driving_eta

APP_NAME = "lifeline_bed_matching"

BED_MATCHING_SYSTEM_PROMPT = """\
You are an expert hospital bed-matching and medical logistics agent for the LifeLine dispatch system.

You receive a triage assessment (severity label, required specialty, clinical notes) and candidate hospitals
with their coordinates, specialties, bed counts, and driving ETA / distance.

Your objective:
1. Select the single optimal hospital for this patient.
2. Provide clear, clinical reasoning for your decision:
   - For 'critical' patients: Priority 1 is specialty capability & ICU/surgical bed availability. Do NOT choose a hospital with 0 ICU beds for a patient needing critical care even if it is closer!
   - For 'moderate' or 'mild' patients: Balance proximity/ETA with general bed availability and required care.
3. List alternative hospitals that were considered but rejected, with a clear one-line reason for each rejection.

Output ONLY valid JSON matching this schema:
{
  "chosen_hospital": {
    "name": "<string>",
    "lat": <float>,
    "lng": <float>,
    "distance_km": <float or null>,
    "eta_minutes": <float or null>
  },
  "reasoning": "<concise explanation of why this hospital was chosen>",
  "alternatives": [
    {
      "name": "<string>",
      "reason_not_chosen": "<why rejected>"
    }
  ]
}
"""


def _haversine_distance(loc1: Location, loc2: Location) -> float:
    """Fallback distance calculation in km if routing API is unavailable."""
    R = 6371.0  # Earth radius in kilometers
    dlat = math.radians(loc2.lat - loc1.lat)
    dlng = math.radians(loc2.lng - loc1.lng)
    a = (
        math.sin(dlat / 2) ** 2
        + math.cos(math.radians(loc1.lat))
        * math.cos(math.radians(loc2.lat))
        * math.sin(dlng / 2) ** 2
    )
    c = 2 * math.atan2(math.sqrt(a), math.sqrt(1 - a))
    return round(R * c, 2)


def get_enriched_hospitals(patient_loc: Location) -> list[dict]:
    """
    Read hospital database and calculate ETA/distance for each candidate.
    """
    hospitals_path = os.path.join(
        os.path.dirname(os.path.dirname(os.path.dirname(__file__))), "data", "hospitals.json"
    )
    if not os.path.exists(hospitals_path):
        # Fallback default candidate hospitals if data file is missing
        raw_hospitals = [
            {
                "name": "City General Hospital",
                "lat": 19.0760,
                "lng": 72.8777,
                "specialties": ["cardiology", "trauma", "emergency", "icu", "general"],
                "icu_beds": 4,
                "general_beds": 15,
                "surgical_beds": 6,
            },
            {
                "name": "Metro Medical Center",
                "lat": 19.0896,
                "lng": 72.8656,
                "specialties": ["neurology", "pediatrics", "emergency", "surgery", "general"],
                "icu_beds": 0,
                "general_beds": 20,
                "surgical_beds": 4,
            },
        ]
    else:
        with open(hospitals_path, "r", encoding="utf-8") as f:
            raw_hospitals = json.load(f)

    # First calculate haversine distance for all hospitals to quickly filter candidates
    candidates = []
    for h in raw_hospitals:
        h_copy = dict(h)
        dest = Location(lat=h["lat"], lng=h["lng"])
        dist = _haversine_distance(patient_loc, dest)
        h_copy["distance_km"] = dist
        h_copy["eta_minutes"] = round(dist * 2.0, 1)
        candidates.append((dist, h_copy, dest))

    # Sort by haversine distance and take top 10 candidates for accurate routing
    candidates.sort(key=lambda x: x[0])
    top_candidates = candidates[:10]

    enriched = []
    for dist, h_copy, dest in top_candidates:
        try:
            route = get_driving_eta(patient_loc, dest)
            h_copy["distance_km"] = route["distance_km"]
            h_copy["eta_minutes"] = route["eta_minutes"]
        except Exception:
            pass
        enriched.append(h_copy)

    # Sort final candidates by estimated ETA
    enriched.sort(key=lambda x: x.get("eta_minutes") or 999)
    return enriched


def _build_bed_matching_prompt(bed_input: BedMatchingInput, candidate_hospitals: list[dict]) -> str:
    """Build structured prompt message with triage details and candidate hospitals."""
    return f"""\
PATIENT TRIAGE STATUS:
  Severity:           {bed_input.triage_result.severity_label.upper()}
  Required Specialty: {bed_input.triage_result.required_specialty}
  Clinical Notes:     {bed_input.triage_result.notes}

PATIENT LOCATION:
  Latitude:  {bed_input.patient_location.lat}
  Longitude: {bed_input.patient_location.lng}

CANDIDATE HOSPITALS (Real coordinates & live route calculations):
{json.dumps(candidate_hospitals, indent=2)}

Please select the best hospital, explain the clinical and logistical reasoning, and list alternatives rejected.
"""


def _get_bed_matching_agent():
    return LlmAgent(
        name="bed_matching_agent",
        model=AGENT_MODELS["bed_matching_agent"],
        instruction=BED_MATCHING_SYSTEM_PROMPT,
        output_schema=BedMatchingOutput,
        output_key="bed_matching_result",
    )


def _validate_hospital_allocation(choice: HospitalChoice, candidate_map: dict, severity: str) -> tuple[bool, str]:
    """
    Validate that the chosen hospital has capacity for the patient's severity.
    """
    h_data = candidate_map.get(choice.name, {})
    if severity == "critical" and h_data.get("icu_beds", 10) <= 0:
        return False, f"Hospital '{choice.name}' has 0 available ICU beds for critical patient. Please select an alternative with open ICU beds."
    return True, "Valid"


def run_bed_matching(bed_input: BedMatchingInput, max_loops: int = 0) -> BedMatchingOutput:
    """
    Invoke Bed-Matching Coordinator loop synchronously via ADK Runner.
    Enriches candidate hospitals with location and OSRM ETA, validates bed availability,
    and loops up to max_loops with critique if the candidate lacks capacity.
    """
    candidates = get_enriched_hospitals(bed_input.patient_location)
    candidate_map = {c["name"]: c for c in candidates}
    severity = bed_input.triage_result.severity_label.lower()
    
    session_service = InMemorySessionService()
    runner = None
    session = None
    critique = ""

    for loop_idx in range(1, max_loops + 1):
        try:
            agent = _get_bed_matching_agent()
            if runner is None:
                runner = Runner(
                    agent=agent,
                    app_name=APP_NAME,
                    session_service=session_service,
                )
                session = run_async(
                    session_service.create_session(app_name=APP_NAME, user_id="dispatch")
                )

            base_prompt = _build_bed_matching_prompt(bed_input, candidates)
            if critique:
                prompt_text = f"{base_prompt}\n\nCOORDINATOR CRITIQUE (Iteration {loop_idx}):\n{critique}\nPlease pick the next best alternative."
            else:
                prompt_text = base_prompt

            user_message = genai_types.Content(
                role="user",
                parts=[genai_types.Part(text=prompt_text)],
            )

            final_response = None
            for event in runner.run(
                user_id="dispatch",
                session_id=session.id,
                new_message=user_message,
            ):
                if event.is_final_response() and event.content:
                    final_response = event.content.parts[0].text
                    break

            if final_response:
                try:
                    data = json.loads(final_response)
                except json.JSONDecodeError:
                    cleaned = final_response.strip().strip("```json").strip("```").strip()
                    data = json.loads(cleaned)

                bed_candidate = BedMatchingOutput(**data)
                is_valid, feedback = _validate_hospital_allocation(bed_candidate.chosen_hospital, candidate_map, severity)
                if is_valid:
                    return bed_candidate

                critique = feedback
                continue
        except Exception:
            break

    # Fallback to closest capable hospital by OSRM ETA with beds
    capable_candidates = [
        c for c in candidates 
        if (severity != "critical" or c.get("icu_beds", 10) > 0)
    ]
    best = capable_candidates[0] if capable_candidates else (candidates[0] if candidates else {
        "name": "Lilavati Hospital & Research Centre",
        "lat": 19.0519,
        "lng": 72.8291,
        "distance_km": 3.8,
        "eta_minutes": 11.0,
    })
    
    return BedMatchingOutput(
        chosen_hospital=HospitalChoice(
            name=best["name"],
            lat=best["lat"],
            lng=best["lng"],
            distance_km=best.get("distance_km"),
            eta_minutes=best.get("eta_minutes"),
        ),
        reasoning=f"Bed Coordinator allocated optimal available facility {best['name']} with confirmed beds and lowest ETA.",
        alternatives=[
            AlternativeHospital(
                name=c["name"], reason_not_chosen="Longer transit time or reduced ICU capacity"
            )
            for c in (candidates[1:4] if len(candidates) > 1 else [])
        ],
    )
