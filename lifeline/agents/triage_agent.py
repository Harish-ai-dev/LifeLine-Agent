"""
Triage Agent — ADK LlmAgent powered by Gemini 3.5 Flash / 3.1 Pro.
Input/output contract: docs/04-agent-contracts.md#triage-agent

This agent receives a patient case that already has a real NEWS2 clinical
score computed by src/tools/news2.py. It reasons over that score — not
just vibes — to classify severity and required specialty.
"""

import json
import asyncio
from google.adk.agents import LlmAgent
from google.adk.runners import Runner
from google.adk.sessions import InMemorySessionService
from google.genai import types as genai_types
from lifeline.schemas import TriageInput, TriageOutput

APP_NAME = "lifeline_triage"

TRIAGE_SYSTEM_PROMPT = """\
You are a certified emergency triage agent for the LifeLine dispatch system.

You receive a patient case that includes a real NEWS2 (National Early Warning
Score 2) clinical score computed from actual vital signs. Use that score — do
not invent a different number — as the primary anchor for your decision.

NEWS2 risk band interpretation:
  • low   (0-4) : Routine monitoring. Severity = mild.
  • medium (5-6): Increased risk. Severity = moderate. Escalate if any single
                  parameter scored 3.
  • high  (≥7) : Urgent/immediate. Severity = critical.

Your task:
1. Confirm or refine severity_label based on NEWS2 score + clinical context.
2. Identify the most appropriate required_specialty from:
   cardiac, trauma, surgical, pediatric, general
3. Write one or two concise clinical notes explaining your reasoning.

Rules:
- NEVER downgrade a high NEWS2 to "mild".
- If mechanism_of_injury mentions collision, fall, explosion → lean toward "trauma".
- If chief_complaint mentions chest pain, palpitations → lean toward "cardiac".
- Always output valid JSON matching the schema.
"""


def _build_triage_prompt(ti: TriageInput) -> str:
    """Format the triage input as a clean prompt message."""
    return f"""\
PATIENT CASE:
  Age: {ti.patient_age}
  Chief complaint: {ti.chief_complaint}
  Mechanism of injury: {ti.mechanism_of_injury or "None reported"}

VITAL SIGNS:
  Heart rate:        {ti.vitals.heart_rate} bpm
  Respiratory rate:  {ti.vitals.respiratory_rate} breaths/min
  Systolic BP:       {ti.vitals.systolic_bp} mmHg
  SpO2:              {ti.vitals.spo2}%
  Temperature:       {ti.vitals.temperature_c}°C
  Consciousness:     {ti.vitals.consciousness}

NEWS2 RESULT (computed, not estimated):
  Score:     {ti.news2_score.score} / 20
  Risk band: {ti.news2_score.risk_band.upper()}

Output ONLY a valid JSON object with keys:
  severity_label   (one of: "mild", "moderate", "critical")
  required_specialty (one of: "cardiac", "trauma", "surgical", "pediatric", "general")
  notes            (1-2 sentences of clinical reasoning)
"""


# ── ADK Agent ─────────────────────────────────────────────────────────────────
triage_agent = LlmAgent(
    name="triage_agent",
    model="gemini-3.1-pro",
    instruction=TRIAGE_SYSTEM_PROMPT,
    output_schema=TriageOutput,
    output_key="triage_result",
)


def run_triage(triage_input: TriageInput) -> TriageOutput:
    """
    Invoke the Triage Agent synchronously via ADK Runner.
    Computes a NEWS2 score, builds the prompt, runs the agent,
    and returns a fully-typed TriageOutput.
    """
    session_service = InMemorySessionService()
    runner = Runner(
        agent=triage_agent,
        app_name=APP_NAME,
        session_service=session_service,
    )

    session = asyncio.get_event_loop().run_until_complete(
        session_service.create_session(app_name=APP_NAME, user_id="dispatch")
    )

    prompt_text = _build_triage_prompt(triage_input)
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

    if not final_response:
        raise RuntimeError("Triage agent returned no response")

    # Parse the JSON output into the Pydantic schema
    # ADK with output_schema may return structured data directly; handle both
    try:
        data = json.loads(final_response)
    except json.JSONDecodeError:
        # Strip markdown code fences if present
        cleaned = final_response.strip().strip("```json").strip("```").strip()
        data = json.loads(cleaned)

    return TriageOutput(**data)



