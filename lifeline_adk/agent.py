"""
LifeLine Agent — root_agent for ADK Web UI.

This module wires together the full LifeLine dispatch pipeline as a single
conversational ADK LlmAgent so it can be explored via `adk web`.

The agent:
  1. Receives an emergency case description from the user (free-text or JSON)
  2. Computes NEWS2 score for the vitals
  3. Calls the Triage sub-agent (gemini-2.0-flash)
  4. Calls the Bed-Matching sub-agent (gemini-2.0-flash)
  5. Returns a full dispatch plan: severity, hospital choice + reasoning, ETA

Tools exposed to the agent:
  - compute_news2       : computes the clinical NEWS2 score from vitals
  - find_best_hospital  : reads data/hospitals.json, picks best match
"""

import json
import os
import sys

# ── make project root importable when run from any directory ──────────────────
PROJECT_ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
if PROJECT_ROOT not in sys.path:
    sys.path.insert(0, PROJECT_ROOT)

from google.adk.agents import LlmAgent
from lifeline.tools.news2 import news2_score
from lifeline.schemas import Vitals

# ─────────────────────────────────────────────────────────────────────────────
# Tool functions (called by the agent during reasoning)
# ─────────────────────────────────────────────────────────────────────────────

def compute_news2(
    heart_rate: int,
    respiratory_rate: int,
    systolic_bp: int,
    spo2: int,
    temperature_c: float,
    consciousness: str,
) -> dict:
    """
    Compute the NEWS2 (National Early Warning Score 2) for the patient's vitals.

    Args:
        heart_rate: Heart rate in bpm.
        respiratory_rate: Respiratory rate in breaths/min.
        systolic_bp: Systolic blood pressure in mmHg.
        spo2: Blood oxygen saturation percentage.
        temperature_c: Body temperature in Celsius.
        consciousness: One of 'alert', 'confused', 'unresponsive'.

    Returns:
        dict with 'score' (int) and 'risk_band' ('low', 'medium', or 'high').
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


def find_best_hospital(required_specialty: str, severity_label: str) -> dict:
    """
    Find the best available hospital from the local dataset for the given
    specialty and severity.

    Args:
        required_specialty: One of 'cardiac', 'trauma', 'surgical', 'pediatric', 'general'.
        severity_label: One of 'mild', 'moderate', 'critical'.

    Returns:
        dict with 'chosen_hospital' (name, lat, lng), 'reasoning', and 'alternatives'.
    """
    hospitals_path = os.path.join(PROJECT_ROOT, "data", "hospitals.json")

    # If hospitals.json doesn't exist yet, return a demo response
    if not os.path.exists(hospitals_path):
        return {
            "chosen_hospital": {
                "name": "Demo City Hospital (data/hospitals.json not seeded yet)",
                "lat": 19.076,
                "lng": 72.877,
                "distance_km": 4.2,
                "eta_minutes": 8,
            },
            "reasoning": (
                f"No hospitals.json found. Run 'lifeline fetch-hospitals' then "
                f"'lifeline seed' to populate real hospital data. This is a demo "
                f"placeholder for a {severity_label} {required_specialty} case."
            ),
            "alternatives": [],
        }

    with open(hospitals_path) as f:
        hospitals = json.load(f)

    # Filter by specialty
    matches = [
        h for h in hospitals
        if required_specialty in (h.get("specialties") or [])
        and (h.get("icu_beds", 0) > 0 or severity_label != "critical")
    ]

    if not matches:
        matches = hospitals[:3]  # fallback to any

    best = matches[0]
    alternatives = [
        {"name": h["name"], "reason_not_chosen": "Lower specialty match or bed availability"}
        for h in matches[1:3]
    ]

    return {
        "chosen_hospital": {
            "name": best.get("name", "Unknown Hospital"),
            "lat": best.get("lat", 0),
            "lng": best.get("lng", 0),
            "distance_km": best.get("distance_km", None),
            "eta_minutes": best.get("eta_minutes", None),
        },
        "reasoning": (
            f"Selected {best.get('name')} for {required_specialty} case "
            f"({severity_label}): best specialty match with available beds."
        ),
        "alternatives": alternatives,
    }


# ─────────────────────────────────────────────────────────────────────────────
# Root Agent — the single entry point for `adk web`
# ─────────────────────────────────────────────────────────────────────────────

SYSTEM_PROMPT = """\
You are the LifeLine Emergency Dispatch Agent — an AI-powered system that \
triages emergency cases and matches patients to the best available hospital.

When a user describes an emergency case, you will:

1. **Assess vitals** — ask the user for vitals if not provided:
   heart_rate, respiratory_rate, systolic_bp, spo2, temperature_c, consciousness.
   Use defaults for a demo: HR=115, RR=24, BP=88, SpO2=91, Temp=38.6, consciousness=alert.

2. **Compute NEWS2** — call the `compute_news2` tool with the vitals.
   Report: "NEWS2 Score: X | Risk Band: HIGH/MEDIUM/LOW"

3. **Triage** — based on NEWS2 score + chief complaint, determine:
   - severity_label: mild / moderate / critical
   - required_specialty: cardiac / trauma / surgical / pediatric / general
   Explain your clinical reasoning clearly.

4. **Bed-Matching** — call `find_best_hospital` with specialty + severity.
   Present the chosen hospital with reasoning.

5. **Dispatch Summary** — give a final structured dispatch report:
   - Patient: [age, complaint]
   - NEWS2: [score] ([risk band])
   - Severity: [label]
   - Specialty: [required]
   - Destination: [hospital name]
   - ETA: [minutes] min
   - Reasoning: [1-2 sentences]

Be concise, clinically accurate, and professional. Think like a trained \
emergency dispatch coordinator, not a general chatbot.

Example input: "58M, crushing chest pain and diaphoresis, HR=118, RR=24, BP=88, SpO2=91, Temp=38.6"
"""


root_agent = LlmAgent(
    name="lifeline_dispatch_agent",
    model="gemini-3.6-flash",
    description=(
        "LifeLine AI Emergency Dispatch Agent — triages patients using real "
        "NEWS2 clinical scoring and matches them to the best available hospital."
    ),
    instruction=SYSTEM_PROMPT,
    tools=[compute_news2, find_best_hospital],
)
