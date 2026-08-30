"""
Real Gemini Co-Pilot Chat endpoint with role-based system prompts and token streaming.
"""

import os
from typing import List, Dict, Any, Optional
from fastapi import APIRouter, HTTPException, status
from fastapi.responses import StreamingResponse
from pydantic import BaseModel
from google import genai
from google.genai import types as genai_types

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

def get_role_system_prompt(role: str, title: Optional[str], facility: Optional[str]) -> str:
    """
    Get customized emergency system instructions for the LLM based on user's role.
    """
    base_instructions = (
        "You are the LifeLine Emergency System Co-Pilot. You assist users in high-stakes clinical, "
        "operations, and logistics environments. Keep your answers concise, clear, and direct. Use markdown. "
        "Always sound professional, clinical, and authoritative. Never make up patient names or data."
    )

    if role == "hospital_staff":
        facility_info = f" at {facility}" if facility else ""
        return (
            f"You are the Chief Clinical Operations Co-Pilot assisting Hospital Staff ({title or 'ER Clinician'}{facility_info}).\n"
            "Your interface shows live emergency triage queues, ICU bed capacities, blood bank stock, and incident lists.\n"
            "Assist with explaining NEWS2 rules (0-4 low, 5-6 medium, 7+ high risk), bed coordination, triage logic, or logging operational issues. "
            "Prioritize patient stabilization, protocol compliance, and operational efficiency."
        )
    elif role == "blood_donor":
        return (
            "You are the LifeLine Blood Donor Navigator.\n"
            "Your interface helps citizen donors check active STAT blood requests, manage their donation history, "
            "and check eligibility (minimum 56 days between whole blood donations).\n"
            "Focus on explaining donation protocols, eligibility criteria, matching blood groups (e.g., O- is universal donor), "
            "and encouraging them to accept emergency STAT requests from local hospitals. Be warm, supportive, and clear."
        )
    elif role == "government_authority":
        return (
            f"You are the Health Authority Executive Director Co-Pilot ({title or 'Regional Health Analyst'}).\n"
            "Your interface focuses on state-level jurisdiction load-balancing, network grid mapping, cross-hospital diversion logs, "
            "and AI daily reports.\n"
            "Help analyze resource distribution, find bottlenecks (e.g., which hospital is under strain), view compliance stats, "
            "and generate intelligence briefs. Do not focus on micro-level patient treatment, focus on systems level coordination."
        )
    
    return base_instructions

@router.post("/chat")
async def chat_copilot(payload: ChatRequest):
    """
    Streaming chat endpoint proxying to Gemini API using google-genai.
    """
    api_key = os.environ.get("GOOGLE_API_KEY")
    if not api_key or api_key == "your_gemini_api_key_here":
        # Fallback to local mock response if no key is configured, to avoid complete failure
        async def fallback_stream():
            yield "data: [MOCK] LifeLine Agent Co-Pilot (Live Gemini Key not configured in .env):\n\n"
            yield f"Understood query from role: **{payload.context.role}**.\n"
            yield "To enable real-time Gemini, please configure `GOOGLE_API_KEY` in the backend `.env` file."
            yield "\n[DONE]\n"
        return StreamingResponse(fallback_stream(), media_type="text/event-stream")

    try:
        client = genai.Client(api_key=api_key)
        system_instruction = get_role_system_prompt(
            payload.context.role,
            payload.context.title,
            payload.context.facility_name
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

        def generate():
            try:
                response = client.models.generate_content_stream(
                    model="gemini-2.5-flash",
                    contents=contents,
                    config=config
                )
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
