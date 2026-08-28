"""
Briefing Agent — STRETCH (see docs/07-scope-lock.md).
One Gemini call generating a plain-language pre-arrival brief.
Contract: docs/04-agent-contracts.md#briefing-agent-stretch
"""
from google.adk.agents import LlmAgent
from lifeline.schemas import BriefingOutput

BRIEFING_SYSTEM_PROMPT = """
You are writing a short pre-arrival brief for a receiving hospital's ER
team. Given the case, triage result, and chosen hospital, write ONE
paragraph (3-4 sentences) summarizing what's coming in and what the team
should prepare for. Plain, clinical, concise language.
"""

# TODO: instantiate as an ADK LlmAgent, output_schema=BriefingOutput
briefing_agent = LlmAgent(
    name="briefing_agent",
    model="gemini-3.5-flash",
    instruction=BRIEFING_SYSTEM_PROMPT,
    output_schema=BriefingOutput,
)


def run_briefing(*args, **kwargs) -> BriefingOutput:
    """TODO: invoke briefing_agent with full case context."""
    raise NotImplementedError



