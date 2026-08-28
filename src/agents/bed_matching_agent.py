"""
Bed-Matching Agent — ADK LlmAgent, Gemini 2.5 Flash.
Input/output contract: docs/04-agent-contracts.md#bed-matching-agent
"""
import json
import asyncio
from google.adk.agents import LlmAgent
from google.adk.runners import Runner
from google.adk.sessions import InMemorySessionService
from google.genai import types as genai_types
from src.schemas import BedMatchingInput, BedMatchingOutput

BED_MATCHING_SYSTEM_PROMPT = """
You are a hospital bed-matching agent. Given a triage result and patient
location, use the get_hospitals tool to find candidate hospitals, then
choose the best match based on: specialty match, bed availability, and
distance/ETA. Explain your reasoning and list alternatives you rejected
and why.

Hospital data includes: name, lat, lng, specialties (list), icu_beds, general_beds, surgical_beds.

Matching logic:
1. Filter hospitals by required specialty from triage result
2. Filter further by bed availability (>0 beds in relevant category)
3. If multiple options remain, choose the one with shortest distance/ETA
4. Provide clear reasoning for your choice
5. List alternatives that were considered but rejected, with explanations
"""

def get_hospitals() -> list[dict]:
    """Tool function: reads data/hospitals.json, returns the full list."""
    with open("data/hospitals.json") as f:
        return json.load(f)

# Instantiate the ADK LlmAgent
bed_matching_agent = LlmAgent(
    name="bed_matching_agent",
    model="gemini-2.5-flash",
    instruction=BED_MATCHING_SYSTEM_PROMPT,
    tools=[get_hospitals],
    output_schema=BedMatchingOutput,
)

def run_bed_matching(bed_input: BedMatchingInput) -> BedMatchingOutput:
    """Invoke the bed matching agent and return BedMatchingOutput."""
    session_service = InMemorySessionService()
    runner = Runner(
        agent=bed_matching_agent,
        app_name="lifeline_bed_matching",
        session_service=session_service,
    )

    # Build prompt for the agent
    prompt_text = f"""\
TRIAGE RESULT:
  Severity: {bed_input.triage_result.severity_label}
  Specialty Needed: {bed_input.triage_result.required_specialty}
  Notes: {bed_input.triage_result.notes}

PATIENT LOCATION:
  Latitude: {bed_input.patient_location.lat}
  Longitude: {bed_input.patient_location.lng}

Use the get_hospitals tool to access hospital data, then select the best match
based on specialty match, bed availability, and proximity. Explain your reasoning.
"""

    user_message = genai_types.Content(
        role="user",
        parts=[genai_types.Part(text=prompt_text)],
    )

    # Run the agent
    session = asyncio.get_event_loop().run_until_complete(
        session_service.create_session(app_name="lifeline_bed_matching", user_id="dispatch")
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
        raise RuntimeError("Bed matching agent returned no response")

    # Parse JSON response
    try:
        data = json.loads(final_response)
    except json.JSONDecodeError:
        # Strip markdown code fences if present
        cleaned = final_response.strip().strip("```json").strip("```").strip()
        data = json.loads(cleaned)

    return BedMatchingOutput(**data)
