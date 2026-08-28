"""
Briefing Agent — STRETCH (see docs/07-scope-lock.md).
One Gemini call generating a plain-language pre-arrival brief.
Contract: docs/04-agent-contracts.md#briefing-agent-stretch
"""
import json
import asyncio
from google.adk.agents import LlmAgent
from google.adk.runners import Runner
from google.adk.sessions import InMemorySessionService
from google.genai import types as genai_types
from src.schemas import BriefingOutput

BRIEFING_SYSTEM_PROMPT = """
You are writing a short pre-arrival brief for a receiving hospital's ER
team. Given the case, triage result, and chosen hospital, write ONE
paragraph (3-4 sentences) summarizing what's coming in and what the team
should prepare for. Plain, clinical, concise language.
"""

# Instantiate the ADK LlmAgent
briefing_agent = LlmAgent(
    name="briefing_agent",
    model="gemini-2.5-flash",
    instruction=BRIEFING_SYSTEM_PROMPT,
    output_schema=BriefingOutput,
)

def run_briefing(case: dict, triage_result: dict, bed_matching_result: dict, routing_result: dict = None) -> BriefingOutput:
    """Invoke the briefing agent with full case context."""
    session_service = InMemorySessionService()
    runner = Runner(
        agent=briefing_agent,
        app_name="lifeline_briefing",
        session_service=session_service,
    )

    # Build prompt for the agent
    patient_age = case.get('patient_age', 'unknown')
    chief_complaint = case.get('chief_complaint', 'unknown')
    severity = triage_result.get('severity_label', 'unknown')
    specialty = triage_result.get('required_specialty', 'unknown')
    notes = triage_result.get('notes', '')
    hospital_name = bed_matching_result.get('chosen_hospital', {}).get('name', 'unknown')
    eta_minutes = bed_matching_result.get('chosen_hospital', {}).get('eta_minutes', 'unknown')

    routing_info = ""
    if routing_result:
        routing_info = f" ETA: {routing_result.get('eta_minutes', 'unknown')} minutes via {routing_result.get('route_summary', 'optimal route')}."

    prompt_text = f"""\
PATIENT CASE:
  Age: {patient_age}
  Chief Complaint: {chief_complaint}

TRIAGE ASSESSMENT:
  Severity: {severity}
  Required Specialty: {specialty}
  Clinical Notes: {notes}

HOSPITAL ASSIGNMENT:
  Destination: {hospital_name}
  Estimated Arrival: {eta_minutes} minutes{routing_info}

Write a concise pre-arrival brief (3-4 sentences) for the ER team at {hospital_name}.
Include: patient demographics, chief complaint, severity assessment, suspected condition,
and any specific preparations needed based on the specialty and clinical findings.
"""

    user_message = genai_types.Content(
        role="user",
        parts=[genai_types.Part(text=prompt_text)],
    )

    # Run the agent
    session = asyncio.get_event_loop().run_until_complete(
        session_service.create_session(app_name="lifeline_briefing", user_id="dispatch")
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

    if not final_response:
        raise RuntimeError("Briefing agent returned no response")

    # Parse JSON response
    try:
        data = json.loads(final_response)
    except json.JSONDecodeError:
        # Strip markdown code fences if present
        cleaned = final_response.strip().strip("```json").strip("```").strip()
        data = json.loads(cleaned)

    return BriefingOutput(**data)
