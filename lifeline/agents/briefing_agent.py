"""
Briefing Agent — ADK LlmAgent powered by Gemini 3.5 Flash.
Generates a concise, clinical pre-arrival brief for the receiving ER team.
Contract: docs/04-agent-contracts.md#briefing-agent-stretch
"""

import json
from typing import Optional
from google.adk.agents import LlmAgent
from google.adk.runners import Runner
from google.adk.sessions import InMemorySessionService
from google.genai import types as genai_types
from lifeline.async_utils import run_async
from lifeline.models import AGENT_MODELS
from lifeline.schemas import (
    Case,
    TriageOutput,
    BedMatchingOutput,
    RoutingOutput,
    BriefingOutput,
)

APP_NAME = "lifeline_briefing"

BRIEFING_SYSTEM_PROMPT = """\
You are an expert emergency medical communications agent for the LifeLine dispatch system.

Your job is to generate a concise, professional pre-arrival briefing (SBAR format or 3-4 sentence clinical paragraph)
for the emergency department resuscitation team at the destination hospital.

Include:
- Patient demographics & chief complaint
- Vitals and severity summary (NEWS2, critical indicators)
- Mechanism of injury (if trauma/accident)
- Expected ETA and immediate equipment/team preparation needed (e.g. trauma bay, cath lab, airway team)

Output ONLY valid JSON matching this schema:
{
  "pre_arrival_brief": "<3-4 sentence clinical briefing for ER team>"
}
"""

def _get_briefing_agent():
    return LlmAgent(
        name="briefing_agent",
        model=AGENT_MODELS["briefing_agent"],
        instruction=BRIEFING_SYSTEM_PROMPT,
        output_schema=BriefingOutput,
        output_key="briefing_result",
    )


def _build_briefing_prompt(
    case: Case,
    triage: TriageOutput,
    bed_match: BedMatchingOutput,
    routing: Optional[RoutingOutput] = None,
) -> str:
    eta_text = (
        f"{routing.eta_minutes} minutes ({routing.distance_km} km)"
        if routing
        else f"{bed_match.chosen_hospital.eta_minutes or 'TBD'} minutes"
    )
    return f"""\
PATIENT SUMMARY:
  Age: {case.patient_age}
  Chief Complaint: {case.chief_complaint}
  Mechanism of Injury: {case.mechanism_of_injury or "None"}
  Vitals: HR {case.vitals.heart_rate}, RR {case.vitals.respiratory_rate}, BP {case.vitals.systolic_bp} mmHg, SpO2 {case.vitals.spo2}%, Temp {case.vitals.temperature_c}°C, Neuro {case.vitals.consciousness}

TRIAGE ASSESSMENT:
  Severity: {triage.severity_label.upper()}
  Required Specialty: {triage.required_specialty}
  Clinical Notes: {triage.notes}

DESTINATION & ETA:
  Destination Hospital: {bed_match.chosen_hospital.name}
  Estimated Arrival: {eta_text}

Generate the urgent pre-arrival briefing for the receiving emergency room staff.
"""


def run_briefing(
    case: Case,
    triage: TriageOutput,
    bed_match: BedMatchingOutput,
    routing: Optional[RoutingOutput] = None,
    max_loops: int = 3,
) -> BriefingOutput:
    """
    Invoke Briefing Agent synchronously via ADK Runner.
    Returns structured BriefingOutput.
    """
    if max_loops > 0:
        try:
            agent = _get_briefing_agent()
            session_service = InMemorySessionService()
            runner = Runner(
                agent=agent,
                app_name=APP_NAME,
                session_service=session_service,
            )

            session = run_async(
                session_service.create_session(app_name=APP_NAME, user_id="dispatch")
            )

            prompt_text = _build_briefing_prompt(case, triage, bed_match, routing)
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
                return BriefingOutput(**data)
        except Exception:
            pass

    # Graceful fallback briefing
    eta_val = (
        routing.eta_minutes
        if routing
        else bed_match.chosen_hospital.eta_minutes or 10
    )
    return BriefingOutput(
        pre_arrival_brief=(
            f"INCOMING EN ROUTE to {bed_match.chosen_hospital.name}: {case.patient_age}yo patient presenting with {case.chief_complaint}. "
            f"Triage classified as {triage.severity_label.upper()} ({triage.required_specialty}). "
            f"Vitals: HR {case.vitals.heart_rate}, BP {case.vitals.systolic_bp}, SpO2 {case.vitals.spo2}%. "
            f"ETA is approximately {eta_val} minutes. Please prepare receiving resuscitation bay."
        )
    )
