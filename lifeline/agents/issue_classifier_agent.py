"""
Issue Classifier Agent — ADK LlmAgent powered by Gemini 3.5 Flash.
Classifies hospital operational issues (severity, category) and recommends actions.

Contract: docs/09-parallel-build-contract.md
"""

import json
import logging
from typing import Dict, Any
from google.adk.agents import LlmAgent
from google.adk.runners import Runner
from google.adk.sessions import InMemorySessionService
from google.genai import types as genai_types
from lifeline.async_utils import run_async
from lifeline.models import AGENT_MODELS

logger = logging.getLogger(__name__)

APP_NAME = "lifeline_issue_classifier"

ISSUE_CLASSIFIER_SYSTEM_PROMPT = """\
You are an AI Hospital Operations & Infrastructure Analyst for the LifeLine emergency response network.

Your job is to classify hospital operational, equipment, and facility issues reported by staff, and recommend immediate actions.

Categories available: equipment, facility, staffing, supplies, it
Severities available: low, moderate, high, critical

Output ONLY valid JSON matching this schema:
{
  "severity": "<low|moderate|high|critical>",
  "category": "<equipment|facility|staffing|supplies|it>",
  "recommended_action": "<A short, actionable instruction for resolution>",
  "estimated_resolution_hours": <int or float>
}
"""

def _get_issue_classifier_agent():
    return LlmAgent(
        name="issue_classifier_agent",
        model=AGENT_MODELS.get("issue_classifier_agent", "gemini-3.5-flash"),
        instruction=ISSUE_CLASSIFIER_SYSTEM_PROMPT,
        output_key="issue_classification_result",
    )


def run_issue_classification(title: str, description: str, hospital_id: str) -> Dict[str, Any]:
    """
    Classify an issue using Gemini 3.5 Flash with a deterministic fallback.
    """
    prompt_text = f"""\
ISSUE REPORT:
Title: {title}
Description: {description}
Hospital ID: {hospital_id}

Classify this issue and recommend an action.
"""

    try:
        agent = _get_issue_classifier_agent()
        session_service = InMemorySessionService()
        runner = Runner(
            agent=agent,
            app_name=APP_NAME,
            session_service=session_service,
        )

        session = run_async(
            session_service.create_session(app_name=APP_NAME, user_id="system")
        )

        user_message = genai_types.Content(
            role="user",
            parts=[genai_types.Part(text=prompt_text)],
        )

        final_response = None
        for event in runner.run(
            user_id="system",
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
            return data
    except Exception as e:
        logger.debug(f"LLM issue classification fallback invoked: {e}")

    # Deterministic Structured Fallback
    text = (title + " " + description).lower()
    
    severity = "moderate"
    if any(w in text for w in ["critical", "offline", "failure", "power", "generator", "stat", "urgent"]):
        severity = "critical"
    elif any(w in text for w in ["broken", "down", "issue", "leak", "damage"]):
        severity = "high"

    category = "facility"
    if any(w in text for w in ["scanner", "ventilator", "monitor", "ct", "mri"]):
        category = "equipment"
    elif any(w in text for w in ["nurse", "doctor", "shortage", "shift"]):
        category = "staffing"
    elif any(w in text for w in ["blood", "oxygen", "meds", "drugs", "gauze"]):
        category = "supplies"
    elif any(w in text for w in ["network", "server", "login", "app", "system"]):
        category = "it"

    return {
        "severity": severity,
        "category": category,
        "recommended_action": "Dispatch maintenance team to investigate immediately.",
        "estimated_resolution_hours": 4
    }
