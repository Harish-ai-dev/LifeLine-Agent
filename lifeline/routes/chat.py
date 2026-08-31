"""
Real Gemini Co-Pilot Chat endpoint with role-based system prompts, live telemetry grounding,
and streaming token responses powered by the LifeLine Multi-Agent Orchestrator.
"""

import os
import json
from typing import List, Dict, Any, Optional
from fastapi import APIRouter, HTTPException, status
from fastapi.responses import StreamingResponse
from pydantic import BaseModel
from google import genai
from google.genai import types as genai_types

from lifeline.models import DEFAULT_MODEL, TRIAGE_MODEL
from lifeline.tools.data_store import get_data_store

router = APIRouter()

class ChatMessage(BaseModel):
    role: str  # "user" or "assistant"/"model"
    content: str

class ChatContext(BaseModel):
    role: str
    facility_name: Optional[str] = None
    title: Optional[str] = None
    additional_data: Optional[Dict[str, Any]] = None

class ChatRequest(BaseModel):
    messages: List[ChatMessage]
    context: ChatContext

def get_role_system_prompt(role: str, title: Optional[str], facility: Optional[str], live_summary: Dict[str, Any]) -> str:
    """
    Get customized emergency system instructions for the Orchestrator Co-Pilot based on user's role and live telemetry.
    """
    base_instructions = f"""\
You are the LifeLine Operations Co-Pilot — the assistant a hospital clinician, dispatcher, or authority user talks to inside the LifeLine emergency dispatch system.

For a casual greeting or open-ended question ("hi", "hello", "what can you do", "hey"):
Respond briefly, warmly, and naturally — a sentence or two introducing yourself and what you can help with (checking active emergency cases, hospital bed capacity, blood donor requests, or running emergency dispatch). Do NOT output a rigid formal numbered list of internal pipeline stages on a simple greeting.

Only go into detail about the underlying dispatch pipeline (NEWS2 scoring, bed-matching, routing, briefing) if the person specifically asks how the system works, or if it's directly relevant to answering their question.

CURRENT REGIONAL LIVE TELEMETRY & NETWORK STATE:
{telemetry_snippet}

Keep your answers direct, clinically and operationally precise, and professional. Use clean markdown formatting.
Always ground your answers in the real live telemetry above when asked about hospitals, beds, donors, issues, or patients — never invent statistics or hospital names.
"""

    if role == "hospital_staff":
        facility_info = f" at {facility}" if facility else ""
        return (
            base_instructions + f"\n\nROLE-SPECIFIC FOCUS: Hospital Staff / Clinician ({title or 'ER Clinician'}{facility_info}).\n"
            "You assist with explaining NEWS2 scoring (0-4 Low, 5-6 Medium, 7+ High Risk), current inbound cases, bed reservations, "
            "blood bank requirements, and logging operational issues. Prioritize patient stabilization and protocol compliance."
        )
    elif role == "blood_donor":
        return (
            base_instructions + "\n\nROLE-SPECIFIC FOCUS: Blood & Organ Donor Navigator.\n"
            "You assist citizen donors in checking active STAT blood requests, explaining donation eligibility (56-day whole blood interval), "
            "matching blood types (e.g. O- universal donor), and coordinating donor responses to critical emergency hospital requests."
        )
    elif role == "government_authority":
        return (
            base_instructions + f"\n\nROLE-SPECIFIC FOCUS: Regional Health Ministry & Disaster Authority Director ({title or 'Regional Health Analyst'}).\n"
            "You provide high-level network surveillance, district bed capacity percentages, cross-hospital diversion logs, "
            "SLA compliance metrics, and executive daily intelligence summaries."
        )
    
    return base_instructions

@router.post("/chat")
async def chat_copilot(payload: ChatRequest):
    """
    Streaming chat endpoint proxying to Gemini API using google-genai and LifeLine Multi-Agent context.
    """
    api_key = os.environ.get("GEMINI_API_KEY") or os.environ.get("GOOGLE_API_KEY")
    if not api_key or api_key == "your_gemini_api_key_here":
        # Fallback to local mock response if no key is configured
        async def fallback_stream():
            yield "data: [OFFLINE] LifeLine Orchestrator Co-Pilot (Live Gemini Key not configured in .env):\n\n"
            yield f"data: Received query for role: **{payload.context.role}**.\n\n"
            yield "data: To enable live Gemini 3.5 Flash streaming, configure `GEMINI_API_KEY` in the environment.\n\n"
            yield "data: [DONE]\n\n"
        return StreamingResponse(fallback_stream(), media_type="text/event-stream")

    try:
        # Gather live telemetry from data store to ground the response
        store = get_data_store()
        hospitals = await store.async_list_all("hospitals")
        patients = await store.async_list_all("patients")
        requests = await store.async_list_all("requests")
        issues = await store.async_list_all("issues")

        live_summary = {
            "total_hospitals": len(hospitals),
            "hospitals": [
                {
                    "id": h.get("id"),
                    "name": h.get("name"),
                    "icu_beds_available": h.get("icu_beds", 0),
                    "total_icu_beds": h.get("total_icu_beds", 10),
                    "specialties": h.get("specialties", [])
                }
                for h in hospitals[:6]
            ],
            "active_inbound_patients": len([p for p in patients if p.get("admission_status") == "inbound"]),
            "open_blood_requests": len([r for r in requests if r.get("status") == "open"]),
            "unresolved_issues": len([i for i in issues if i.get("status") != "resolved"]),
        }

        client = genai.Client(api_key=api_key)
        system_instruction = get_role_system_prompt(
            payload.context.role,
            payload.context.title,
            payload.context.facility_name,
            live_summary
        )

        # Convert conversation messages
        contents = []
        for msg in payload.messages:
            role = "user" if msg.role == "user" else "model"
            contents.append(
                genai_types.Content(
                    role=role,
                    parts=[genai_types.Part(text=msg.content)]
                )
            )

        config = genai_types.GenerateContentConfig(
            system_instruction=system_instruction,
            temperature=0.2,
        )

        # Build message history for Chat session
        history = contents[:-1] if len(contents) > 1 else None
        latest_message = contents[-1].parts[0].text if contents and contents[-1].parts else "Hello"

        chat = client.chats.create(
            model=DEFAULT_MODEL,
            config=config,
            history=history,
        )

        def generate():
            try:
                response = chat.send_message_stream(latest_message)
                for chunk in response:
                    if chunk.text:
                        # Yield standard SSE format
                        yield f"data: {chunk.text}\n\n"
                yield "data: [DONE]\n\n"
            except Exception as e:
                yield f"data: Error during stream generation: {str(e)}\n\n"

        return StreamingResponse(generate(), media_type="text/event-stream")

    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to communicate with Gemini API: {str(e)}"
        )

