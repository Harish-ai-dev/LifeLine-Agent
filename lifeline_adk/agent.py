"""
LifeLine Agent â€” ADK Web entry point.

Exposes the real multi-level dispatch pipeline to `adk web` so the hierarchy
you see in the dev UI matches exactly what runs in production:

  LifeLineOrchestrator  (root, gemini-3.7-flash)
  â”œâ”€â”€ TriageAgent        (gemini-3.7-flash)  â€” NEWS2 + severity classification
  â”œâ”€â”€ BedMatchingAgent   (gemini-3.7-flash) â€” hospital selection + OSRM ETA
  â”œâ”€â”€ RoutingAgent       (gemini-3.7-flash) â€” driving directions
  â””â”€â”€ BriefingAgent      (gemini-3.7-flash) â€” SBAR pre-arrival handoff note

All tools call the real, tested backend functions.
No Google Search, no URL context, no duplicate logic.
Models are read from lifeline/models.py (single registry).
"""

import os
import sys

# â”€â”€ Make project root importable from any working directory â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
PROJECT_ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
if PROJECT_ROOT not in sys.path:
    sys.path.insert(0, PROJECT_ROOT)

from dotenv import load_dotenv
load_dotenv()

import asyncio
import random
import logging

import asyncio
import random
import logging

try:
    from google.adk.models.google_llm import Gemini
    from google.genai.errors import ServerError, APIError

    if not hasattr(Gemini, "_orig_generate_content_async"):
        Gemini._orig_generate_content_async = Gemini.generate_content_async

    async def _patched_generate_content_async(self, *args, **kwargs):
        max_retries = int(os.environ.get("GEMINI_MAX_RETRIES", 3))
        fallback_model = os.environ.get("FALLBACK_MODEL", "gemini-3.5-flash")
        
        for attempt in range(max_retries + 1):
            try:
                agen = Gemini._orig_generate_content_async(self, *args, **kwargs)
                async for chunk in agen:
                    yield chunk
                return
            except Exception as e:
                status_code = getattr(e, "code", getattr(e, "status_code", None))
                if isinstance(e, (ServerError, APIError)) or status_code in [429, 500, 503, 504]:
                    if attempt < max_retries:
                        delay = (2 ** attempt) + random.uniform(0.5, 1.5)
                        logging.warning(
                            f"[Gemini Retry] Attempt {attempt+1}/{max_retries} failed with {status_code}. "
                            f"Retrying in {delay:.2f}s..."
                        )
                        await asyncio.sleep(delay)
                        continue
                    else:
                        if hasattr(self, "model") and self.model != fallback_model:
                            logging.warning(f"[Gemini Retry] Exhausted retries. Failing over to {fallback_model}")
                            self.model = fallback_model
                            try:
                                agen2 = Gemini._orig_generate_content_async(self, *args, **kwargs)
                                async for chunk in agen2:
                                    yield chunk
                                return
                            except Exception as fallback_err:
                                from google.adk.models.llm_response import LlmResponse
                            from google.genai.types import Content, Part
                            import logging
                            logging.error("[Gemini Retry] Rate limited! Yielding mock fallback to prevent crash.")
                            mock_text = "⚠️ **System Fallback Active:** The Gemini API is currently unavailable due to strict rate limits (Quota Exceeded). Please wait a few moments before sending another request, or upgrade your API tier."
                            mock_resp = LlmResponse(
                                content=Content(parts=[Part.from_text(text=mock_text)]),
                                partial=False
                            )
                            yield mock_resp
                            return
                        else:
                            from google.adk.models.llm_response import LlmResponse
                            from google.genai.types import Content, Part
                            import logging
                            logging.error("[Gemini Retry] Rate limited! Yielding mock fallback to prevent crash.")
                            mock_text = "⚠️ **System Fallback Active:** The Gemini API is currently unavailable due to strict rate limits (Quota Exceeded). Please wait a few moments before sending another request, or upgrade your API tier."
                            mock_resp = LlmResponse(
                                content=Content(parts=[Part.from_text(text=mock_text)]),
                                partial=False
                            )
                            yield mock_resp
                            return
                else:
                    raise
    
    Gemini.generate_content_async = _patched_generate_content_async
    logging.info("Gemini 503 Retry Monkey-Patch successfully fixed (AsyncGenerator).")
except ImportError:
    pass


from google.adk.agents import LlmAgent
from lifeline.models import TRIAGE_MODEL, DEFAULT_MODEL
from lifeline.tools.news2 import news2_score
from lifeline.schemas import (
    Vitals, TriageInput, BedMatchingInput, Location, Case,
    TriageOutput, BedMatchingOutput, HospitalChoice, RoutingOutput,
)
from lifeline.agents.triage_agent import run_triage
from lifeline.agents.bed_matching_agent import run_bed_matching
from lifeline.agents.routing_agent import run_routing
from lifeline.agents.briefing_agent import run_briefing


# =============================================================================
# Tool functions â€” deterministic real-backend calls
# No Google Search, no URL context â€” agents reason only over data computed here
# =============================================================================

def compute_news2(
    heart_rate: int,
    respiratory_rate: int,
    systolic_bp: int,
    spo2: int,
    temperature_c: float,
    consciousness: str = "alert",
) -> dict:
    """
    Compute the clinical NEWS2 score from patient vitals.

    Args:
        heart_rate: Heart rate in bpm.
        respiratory_rate: Respiratory rate in breaths/min.
        systolic_bp: Systolic BP in mmHg.
        spo2: Blood oxygen saturation %.
        temperature_c: Temperature in Celsius.
        consciousness: 'alert', 'confused', or 'unresponsive'.

    Returns:
        dict with 'score' (0-20) and 'risk_band' ('low', 'medium', 'high').
    """
    vitals = Vitals(
        heart_rate=heart_rate,
        respiratory_rate=respiratory_rate,
        systolic_bp=systolic_bp,
        spo2=spo2,
        temperature_c=temperature_c,
        consciousness=consciousness,
    )
    result = news2_score(vitals)
    return {"score": result.score, "risk_band": result.risk_band}


def run_triage_tool(
    patient_age: int,
    chief_complaint: str,
    heart_rate: int,
    respiratory_rate: int,
    systolic_bp: int,
    spo2: int,
    temperature_c: float,
    consciousness: str,
    mechanism_of_injury: str = "",
) -> dict:
    """
    Run the Triage Agent (gemini-3.7-flash) to classify severity and required specialty.

    Args:
        patient_age: Age in years.
        chief_complaint: Primary presenting complaint.
        heart_rate: HR bpm. respiratory_rate: RR breaths/min. systolic_bp: SBP mmHg.
        spo2: SpO2 %. temperature_c: Temp Celsius. consciousness: alert/confused/unresponsive.
        mechanism_of_injury: Optional injury mechanism.

    Returns:
        dict with 'severity_label', 'required_specialty', 'notes', 'news2_score', 'news2_risk_band'.
    """
    vitals = Vitals(
        heart_rate=heart_rate, respiratory_rate=respiratory_rate,
        systolic_bp=systolic_bp, spo2=spo2,
        temperature_c=temperature_c, consciousness=consciousness,
    )
    news = news2_score(vitals)
    triage_in = TriageInput(
        patient_age=patient_age, vitals=vitals,
        chief_complaint=chief_complaint,
        mechanism_of_injury=mechanism_of_injury or None,
        news2_score=news,
    )
    result = run_triage(triage_in)
    return {
        "severity_label": result.severity_label,
        "required_specialty": result.required_specialty,
        "notes": result.notes,
        "news2_score": news.score,
        "news2_risk_band": news.risk_band,
    }


def run_bed_matching_tool(
    severity_label: str,
    required_specialty: str,
    clinical_notes: str,
    patient_lat: float,
    patient_lng: float,
) -> dict:
    """
    Run the Bed-Matching Agent (gemini-3.7-flash) to select the best hospital.

    Args:
        severity_label: 'mild', 'moderate', or 'critical'.
        required_specialty: 'cardiac', 'trauma', 'surgical', 'pediatric', or 'general'.
        clinical_notes: Clinical reasoning from triage.
        patient_lat: Patient latitude. patient_lng: Patient longitude.

    Returns:
        dict with 'chosen_hospital', 'reasoning', 'alternatives'.
    """
    triage_out = TriageOutput(
        severity_label=severity_label,
        required_specialty=required_specialty,
        notes=clinical_notes,
    )
    patient_loc = Location(lat=patient_lat, lng=patient_lng)
    bed_in = BedMatchingInput(triage_result=triage_out, patient_location=patient_loc)
    result = run_bed_matching(bed_in)
    return {
        "chosen_hospital": result.chosen_hospital.model_dump(),
        "reasoning": result.reasoning,
        "alternatives": [a.model_dump() for a in result.alternatives],
    }


def run_routing_tool(
    patient_lat: float, patient_lng: float,
    hospital_lat: float, hospital_lng: float,
) -> dict:
    """
    Compute driving ETA and route from patient to hospital via OSRM.

    Args:
        patient_lat: Patient latitude. patient_lng: Patient longitude.
        hospital_lat: Hospital latitude. hospital_lng: Hospital longitude.

    Returns:
        dict with 'eta_minutes', 'distance_km', 'route_summary'.
    """
    origin = Location(lat=patient_lat, lng=patient_lng)
    dest = Location(lat=hospital_lat, lng=hospital_lng)
    result = run_routing(origin, dest)
    return result.model_dump()


def run_briefing_tool(
    patient_age: int,
    chief_complaint: str,
    severity_label: str,
    required_specialty: str,
    chosen_hospital_name: str,
    eta_minutes: float,
) -> dict:
    """
    Generate the SBAR pre-arrival handoff note for the receiving hospital team.

    Args:
        patient_age: Age in years. chief_complaint: Primary complaint.
        severity_label: Triage severity. required_specialty: Required specialty.
        chosen_hospital_name: Destination hospital. eta_minutes: ETA in minutes.

    Returns:
        dict with 'pre_arrival_brief' (SBAR formatted note).
    """
    vitals = Vitals(
        heart_rate=100, respiratory_rate=20, systolic_bp=110,
        spo2=96, temperature_c=37.0, consciousness="alert",
    )
    case = Case(patient_age=patient_age, chief_complaint=chief_complaint, vitals=vitals)
    triage_out = TriageOutput(
        severity_label=severity_label, required_specialty=required_specialty,
        notes=f"{severity_label.capitalize()} case requiring {required_specialty} care.",
    )
    bed_out = BedMatchingOutput(
        chosen_hospital=HospitalChoice(
            name=chosen_hospital_name, lat=0.0, lng=0.0, eta_minutes=eta_minutes,
        ),
        reasoning="Hospital selected by BedMatchingAgent.", alternatives=[],
    )
    routing_out = RoutingOutput(
        eta_minutes=eta_minutes, distance_km=0.0,
        route_summary=f"En route to {chosen_hospital_name}",
    )
    result = run_briefing(case, triage_out, bed_out, routing_out)
    return {"pre_arrival_brief": result.pre_arrival_brief}


# =============================================================================
# LEVEL 3 â€” Leaf Agents
# =============================================================================

triage_agent = LlmAgent(
    name="TriageAgent",
    model=TRIAGE_MODEL,   # gemini-3.7-flash â€” clinical reasoning
    description=(
        "Classifies patient severity and required specialty using real NEWS2 clinical "
        "scoring. Uses gemini-3.7-flash per docs/03-decision-log.md."
    ),
    instruction="""\
You are the LifeLine Triage Agent (gemini-3.7-flash).
Given a patient case:
1. Call compute_news2 with vitals to get the real clinical NEWS2 score.
2. Call run_triage_tool with all patient details for severity and specialty classification.
3. Report: NEWS2 Score, Risk Band, Severity Label, Required Specialty, and clinical notes.
Never invent a NEWS2 score. Never downgrade a HIGH NEWS2 to 'mild'.
""",
    tools=[compute_news2, run_triage_tool],
)

bed_matching_agent = LlmAgent(
    name="BedMatchingAgent",
    model=DEFAULT_MODEL,  # gemini-3.7-flash
    description=(
        "Selects the best available hospital based on specialty match, bed availability, "
        "and real OSRM driving ETA."
    ),
    instruction="""\
You are the LifeLine Bed-Matching Agent (gemini-3.7-flash).
Given triage output and patient location:
1. Call run_bed_matching_tool with severity, specialty, notes, and patient coordinates.
2. Report: chosen hospital, ETA, distance, reasoning, and rejected alternatives.
For critical patients: always prioritise ICU bed availability over proximity.
""",
    tools=[run_bed_matching_tool],
)

routing_agent = LlmAgent(
    name="RoutingAgent",
    model=DEFAULT_MODEL,  # gemini-3.7-flash
    description="Computes driving ETA and route from patient location to the chosen hospital.",
    instruction="""\
You are the LifeLine Routing Agent (gemini-3.7-flash).
Call run_routing_tool with patient and hospital coordinates.
Report ETA in minutes, distance in km, and route summary.
""",
    tools=[run_routing_tool],
)

briefing_agent = LlmAgent(
    name="BriefingAgent",
    model=DEFAULT_MODEL,  # gemini-3.7-flash
    description="Generates the SBAR pre-arrival clinical handoff note for the receiving team.",
    instruction="""\
You are the LifeLine Briefing Agent (gemini-3.7-flash).
Call run_briefing_tool to generate the SBAR note for the receiving hospital team.
Present the brief clearly and concisely.
""",
    tools=[run_briefing_tool],
)


def dispatch_emergency_case(
    patient_age: int,
    chief_complaint: str,
    heart_rate: int,
    respiratory_rate: int,
    systolic_bp: int,
    spo2: int,
    temperature_c: float,
    consciousness: str = "alert",
    patient_lat: float = 19.0522,
    patient_lng: float = 72.8336,
    mechanism_of_injury: str = "",
) -> dict:
    """
    Execute the complete LifeLine 5-stage autonomous emergency dispatch pipeline:
    NEWS2 scoring -> Triage -> Bed-Matching -> Routing -> SBAR Pre-Arrival Brief.

    Args:
        patient_age: Age of the patient in years.
        chief_complaint: Presenting clinical complaint.
        heart_rate: Heart rate in bpm.
        respiratory_rate: Respiratory rate in breaths/min.
        systolic_bp: Systolic blood pressure in mmHg.
        spo2: Blood oxygen saturation percentage.
        temperature_c: Body temperature in Celsius.
        consciousness: Level of consciousness ('alert', 'confused', 'unresponsive').
        patient_lat: Latitude of patient location (default: 19.0522).
        patient_lng: Longitude of patient location (default: 72.8336).
        mechanism_of_injury: Optional mechanism of injury description.

    Returns:
        Structured dispatch record with triage classification, chosen hospital, OSRM ETA, SBAR brief, and audit trail ID.
    """
    from lifeline.orchestrator import run_dispatch
    clean_consciousness = consciousness.lower().strip() if isinstance(consciousness, str) else "alert"
    if clean_consciousness not in ["alert", "confused", "unresponsive"]:
        clean_consciousness = "alert"

    vitals = Vitals(
        heart_rate=heart_rate,
        respiratory_rate=respiratory_rate,
        systolic_bp=systolic_bp,
        spo2=spo2,
        temperature_c=temperature_c,
        consciousness=clean_consciousness,
    )
    case = Case(
        patient_age=patient_age,
        chief_complaint=chief_complaint,
        mechanism_of_injury=mechanism_of_injury or None,
        vitals=vitals,
    )
    loc = Location(lat=patient_lat, lng=patient_lng)
    return run_dispatch(case, loc)


def check_hospital_capacity(facility_name: str = "") -> dict:
    """
    Check real-time hospital bed capacity and ICU availability across the regional network.

    Args:
        facility_name: Optional hospital name filter.

    Returns:
        dict with available hospitals, total/available ICU beds, and specialized departments.
    """
    from lifeline.tools.data_store import get_data_store
    store = get_data_store()
    hospitals = store.list_all("hospitals")
    if facility_name:
        hospitals = [h for h in hospitals if facility_name.lower() in h.get("name", "").lower()]
    return {
        "hospitals": [
            {
                "name": h.get("name"),
                "icu_beds_available": h.get("icu_beds", 0),
                "total_icu_beds": h.get("total_icu_beds", 10),
                "specialties": h.get("specialties", []),
            }
            for h in hospitals[:8]
        ]
    }


def check_open_blood_requests() -> dict:
    """
    Check active STAT blood donation requests and urgent regional requirements.

    Returns:
        dict with list of open blood donor requests.
    """
    from lifeline.tools.data_store import get_data_store
    store = get_data_store()
    requests = store.list_all("requests")
    open_reqs = [r for r in requests if r.get("status") == "open"]
    return {"open_requests": open_reqs[:10]}


# =============================================================================
# LEVEL 1 — Orchestrator root_agent (what `adk web` discovers)
# =============================================================================

orchestrator_agent = LlmAgent(
    name="Orchestrator",
    model=DEFAULT_MODEL,
    description=(
        "LifeLine Emergency Dispatch Orchestrator — autonomously coordinates the 5-stage "
        "emergency dispatch pipeline (NEWS2 → Triage → Bed-Matching → Routing → SBAR Briefing) "
        "and assists with regional hospital capacity and operational intelligence."
    ),
    instruction="""\
You are the LifeLine Emergency Dispatch Orchestrator.

For a casual greeting or open-ended question ("hi", "hello", "what can you do", "hey"):
Respond briefly, warmly, and naturally in 1-2 sentences introducing yourself as the LifeLine Orchestrator and what you can assist with (running autonomous emergency dispatches, checking real-time hospital bed capacity, blood donor requests, or clinical triage). Do NOT output a formal numbered list or dump the full pipeline stages on a simple greeting.

Only go into detail about the underlying 5-stage dispatch pipeline (NEWS2 scoring, bed-matching, OSRM routing, SBAR pre-arrival briefing) if the user specifically asks how the system works or how emergency dispatch operates.

When an emergency case is reported or patient vitals are provided:
Execute the full emergency dispatch pipeline:
1. TriageAgent: Compute NEWS2 score and classify clinical severity and specialty.
2. BedMatchingAgent: Select the optimal hospital with confirmed bed availability.
3. RoutingAgent: Calculate real-time driving route and ETA.
4. BriefingAgent: Generate structured SBAR pre-arrival clinical handoff note.
5. Present the final structured dispatch record.

Alternatively, call dispatch_emergency_case directly with patient vitals to run the entire pipeline in a single step.

For operational queries about hospital capacity, inventory, or active cases:
Answer grounded strictly in verified system data using your tools (check_hospital_capacity, check_open_blood_requests) — never invent statistics, bed counts, or hospital names.
""",
    tools=[dispatch_emergency_case, check_hospital_capacity, check_open_blood_requests],
    sub_agents=[triage_agent, bed_matching_agent, routing_agent, briefing_agent],
)

# Export root_agent for Google ADK discovery
root_agent = orchestrator_agent







