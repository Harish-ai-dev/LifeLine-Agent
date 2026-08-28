"""
Bed-Matching Agent — ADK LlmAgent, Gemini 2.5 Flash.
Input/output contract: docs/04-agent-contracts.md#bed-matching-agent
"""
import json
from google.adk.agents import LlmAgent
from src.schemas import BedMatchingInput, BedMatchingOutput

BED_MATCHING_SYSTEM_PROMPT = """
You are a hospital bed-matching agent. Given a triage result and patient
location, use the get_hospitals tool to find candidate hospitals, then
choose the best match based on: specialty match, bed availability, and
distance/ETA. Explain your reasoning and list alternatives you rejected
and why.
"""


def get_hospitals() -> list[dict]:
    """Tool function: reads data/hospitals.json, returns the full list.
    TODO: filter by specialty + availability inside the agent's reasoning,
    or pre-filter here and pass a shortlist."""
    with open("data/hospitals.json") as f:
        return json.load(f)


# TODO: instantiate as an ADK LlmAgent with tools=[get_hospitals],
# output_schema=BedMatchingOutput
bed_matching_agent = LlmAgent(
    name="bed_matching_agent",
    model="gemini-2.5-flash",
    instruction=BED_MATCHING_SYSTEM_PROMPT,
    tools=[get_hospitals],
    output_schema=BedMatchingOutput,
)


def run_bed_matching(bed_input: BedMatchingInput) -> BedMatchingOutput:
    """TODO: invoke bed_matching_agent, parse into BedMatchingOutput."""
    raise NotImplementedError
