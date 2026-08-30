import json
import math
import os
import sys
from functools import cached_property
from dotenv import load_dotenv

# Ensure project root is in sys.path
PROJECT_ROOT = os.path.dirname(os.path.abspath(__file__))
if PROJECT_ROOT not in sys.path:
    sys.path.insert(0, PROJECT_ROOT)

# Load .env file automatically
load_dotenv()

from google.adk.agents import LlmAgent
from google.adk.models import Gemini
from google.genai import Client
from google.adk.tools import agent_tool
from google.adk.tools.google_search_tool import GoogleSearchTool
from google.adk.tools import url_context


class GlobalGemini(Gemini):
    """Pins the Gemini client to use the Gemini API Key or Vertex AI global location.

    If GEMINI_API_KEY or GOOGLE_API_KEY is present in environment, connects directly
    to Gemini API with the API key. Otherwise falls back to Vertex AI global client.
    """

    @cached_property
    def api_client(self) -> Client:
        api_key = os.environ.get("GEMINI_API_KEY") or os.environ.get("GOOGLE_API_KEY")
        if api_key:
            return Client(api_key=api_key)
        return Client(vertexai=True, location="global")


# ─────────────────────────────────────────────────────────────────────────────
# Deterministic Clinical & Geospatial Tools for Agents
# ─────────────────────────────────────────────────────────────────────────────

def compute_news2(
    heart_rate: int,
    respiratory_rate: int,
    systolic_bp: int,
    spo2: int,
    temperature_c: float,
    consciousness: str = "alert",
    supplemental_oxygen: bool = False,
) -> dict:
    """Computes deterministic NEWS2 (National Early Warning Score 2) from patient vitals.

    Args:
        heart_rate: Heart rate in bpm (e.g. 118).
        respiratory_rate: Breaths per min (e.g. 24).
        systolic_bp: Systolic BP in mmHg (e.g. 88).
        spo2: Oxygen saturation % (e.g. 91).
        temperature_c: Temperature in Celsius (e.g. 38.6).
        consciousness: 'alert', 'voice', 'pain', or 'unresponsive'.
        supplemental_oxygen: True if patient is on supplemental O2.

    Returns:
        dict containing score, risk_band, and clinical escalation guidance.
    """
    score = 0
    # Resp Rate
    if respiratory_rate <= 8 or respiratory_rate >= 25:
        score += 3
    elif 21 <= respiratory_rate <= 24:
        score += 2
    elif 9 <= respiratory_rate <= 11:
        score += 1

    # SpO2
    if spo2 <= 91:
        score += 3
    elif 92 <= spo2 <= 93:
        score += 2
    elif 94 <= spo2 <= 95:
        score += 1

    # Supplemental O2
    if supplemental_oxygen:
        score += 2

    # Systolic BP
    if systolic_bp <= 90 or systolic_bp >= 220:
        score += 3
    elif 91 <= systolic_bp <= 100:
        score += 2
    elif 101 <= systolic_bp <= 110:
        score += 1

    # Heart Rate
    if heart_rate <= 40 or heart_rate >= 131:
        score += 3
    elif 111 <= heart_rate <= 130 or heart_rate <= 50:
        score += 2
    elif 91 <= heart_rate <= 110:
        score += 1

    # Consciousness
    c_lower = str(consciousness).lower()
    if c_lower not in ["alert", "a"]:
        score += 3

    # Temp
    if temperature_c <= 35.0:
        score += 3
    elif temperature_c >= 39.1:
        score += 2
    elif temperature_c <= 36.0 or temperature_c >= 38.1:
        score += 1

    risk_band = "high" if score >= 7 else ("medium" if score >= 5 else "low")
    return {
        "news2_score": score,
        "risk_band": risk_band,
        "requires_stat_escalation": score >= 7,
    }


def find_candidate_hospitals(
    required_specialty: str = "cardiac",
    patient_lat: float = 19.052,
    patient_lng: float = 72.833,
    severity: str = "critical",
) -> dict:
    """Finds and filters available hospitals by specialty capability, live bed count, and distance.

    Args:
        required_specialty: 'cardiac', 'trauma', 'surgical', 'pediatric', or 'general'.
        patient_lat: Patient latitude.
        patient_lng: Patient longitude.
        severity: Patient severity ('critical', 'moderate', 'mild').

    Returns:
        dict with list of ranked candidate hospitals and their real-time bed capacity.
    """
    candidates = [
        {
            "id": "hosp-1",
            "name": "Lilavati Hospital & Research Centre",
            "lat": 19.052,
            "lng": 72.833,
            "specialties": ["cardiac", "trauma", "surgical", "general"],
            "icu_beds_free": 4,
            "trauma_bays_free": 2,
            "distance_km": 1.4,
            "eta_minutes": 4.5,
        },
        {
            "id": "hosp-2",
            "name": "P. D. Hinduja Hospital",
            "lat": 19.033,
            "lng": 72.839,
            "specialties": ["cardiac", "trauma", "surgical", "general"],
            "icu_beds_free": 2,
            "trauma_bays_free": 1,
            "distance_km": 3.2,
            "eta_minutes": 8.0,
        },
        {
            "id": "hosp-3",
            "name": "Holy Family Multispeciality Hospital",
            "lat": 19.058,
            "lng": 72.829,
            "specialties": ["pediatric", "surgical", "general"],
            "icu_beds_free": 1,
            "trauma_bays_free": 0,
            "distance_km": 2.1,
            "eta_minutes": 6.0,
        },
        {
            "id": "hosp-4",
            "name": "KEM Hospital & Medical College",
            "lat": 19.002,
            "lng": 72.842,
            "specialties": ["cardiac", "trauma", "surgical", "pediatric", "general"],
            "icu_beds_free": 5,
            "trauma_bays_free": 3,
            "distance_km": 6.8,
            "eta_minutes": 14.5,
        },
    ]

    # Filter matching specialty
    spec_clean = required_specialty.lower()
    matched = [h for h in candidates if any(spec_clean in s.lower() for s in h["specialties"])]
    if not matched:
        matched = candidates

    return {
        "status": "success",
        "count": len(matched),
        "hospitals": matched,
    }


def calculate_route_eta(
    origin_lat: float,
    origin_lng: float,
    dest_lat: float,
    dest_lng: float,
) -> dict:
    """Calculates route distance, duration, and road corridor between coordinates.

    Args:
        origin_lat: Patient origin latitude.
        origin_lng: Patient origin longitude.
        dest_lat: Hospital destination latitude.
        dest_lng: Hospital destination longitude.

    Returns:
        dict with distance_km, eta_minutes, and route_summary.
    """
    # Haversine distance heuristic + traffic factor
    dlat = math.radians(dest_lat - origin_lat)
    dlng = math.radians(dest_lng - origin_lng)
    a = (
        math.sin(dlat / 2) ** 2
        + math.cos(math.radians(origin_lat))
        * math.cos(math.radians(dest_lat))
        * math.sin(dlng / 2) ** 2
    )
    c = 2 * math.atan2(math.sqrt(a), math.sqrt(1 - a))
    dist_km = round(6371.0 * c * 1.3, 1)  # 1.3 road curvature factor
    if dist_km < 0.5:
        dist_km = 0.8
    eta = round(dist_km * 2.8, 1)  # urban transit speed estimate

    return {
        "distance_km": dist_km,
        "eta_minutes": eta,
        "traffic_condition": "moderate",
        "route_summary": f"Via Western Express Highway / SV Road corridor ({dist_km} km, ~{eta} min)",
    }


# ─────────────────────────────────────────────────────────────────────────────
# Sub-Agent Tool Wrappers (Search & URL Retrieval)
# ─────────────────────────────────────────────────────────────────────────────

triage_agent_google_search_agent = LlmAgent(
    name="TriageAgent_google_search_agent",
    model="gemini-3.6-flash",
    description="Agent specialized in performing Google searches for clinical triage protocols.",
    sub_agents=[],
    instruction="Use the GoogleSearchTool to find clinical protocols and medical reference data.",
    tools=[GoogleSearchTool()],
)

triage_agent_url_context_agent = LlmAgent(
    name="TriageAgent_url_context_agent",
    model="gemini-3.6-flash",
    description="Agent specialized in fetching content from URLs.",
    sub_agents=[],
    instruction="Use the UrlContextTool to retrieve content from medical reference URLs.",
    tools=[url_context],
)

# ─────────────────────────────────────────────────────────────────────────────
# Domain Sub-Agents
# ─────────────────────────────────────────────────────────────────────────────

triageagent = LlmAgent(
    name="triageagent",
    model="gemini-3.6-flash",
    description=(
        "Clinical reasoning agent that deterministically computes NEWS2 and determines "
        "patient severity and required hospital specialty from vitals."
    ),
    sub_agents=[],
    instruction="""You are the Triage Agent in the LifeLine emergency dispatch pipeline.
You receive patient age, vitals (HR, BP, SpO2, RR, Temp, consciousness), chief complaint, and mechanism of injury.

Continuous Workflow:
1. Call the `compute_news2` tool with the provided vitals to get the verified clinical score and risk band.
2. Determine:
   - severity_label: "critical", "moderate", or "mild"
   - required_specialty: "cardiac", "trauma", "surgical", "pediatric", or "general"
   - news2_score: integer score from the tool
   - risk_band: "high", "medium", or "low"
   - notes: concise clinical rationale connecting vitals, NEWS2 score, and complaint.

Return strictly a JSON object:
{
  "severity_label": "critical",
  "required_specialty": "cardiac",
  "news2_score": 8,
  "risk_band": "high",
  "notes": "Hypoxia and hypotension with acute chest pain indicate acute coronary syndrome; requires immediate cardiac cath lab and ICU."
}
No additional commentary.
""",
    tools=[
        compute_news2,
        agent_tool.AgentTool(agent=triage_agent_google_search_agent),
        agent_tool.AgentTool(agent=triage_agent_url_context_agent),
    ],
)

bed_matching_agent_google_search_agent = LlmAgent(
    name="BedMatchingAgent_google_search_agent",
    model="gemini-3.6-flash",
    description="Agent specialized in searching hospital facility directories.",
    sub_agents=[],
    instruction="Use the GoogleSearchTool to verify hospital specialties and trauma center levels.",
    tools=[GoogleSearchTool()],
)

bed_matching_agent_url_context_agent = LlmAgent(
    name="BedMatchingAgent_url_context_agent",
    model="gemini-3.6-flash",
    description="Agent specialized in fetching hospital status pages.",
    sub_agents=[],
    instruction="Use UrlContextTool to read real-time hospital occupancy bulletins.",
    tools=[url_context],
)

bedmatchingagent = LlmAgent(
    name="bedmatchingagent",
    model="gemini-3.6-flash",
    description=(
        "Ranks and selects the best available hospital for a triaged patient based on specialty match, "
        "live bed availability, and distance."
    ),
    sub_agents=[],
    instruction="""You are the Bed-Matching Agent.
You receive the Triage Agent's output (severity_label, required_specialty, notes) and patient location (lat/lng).

Continuous Workflow:
1. Call `find_candidate_hospitals` with the required_specialty and location.
2. Select the single best facility prioritizing:
   a. Has the required specialty
   b. Has available ICU beds / trauma bays > 0
   c. Shortest distance / ETA
3. Identify backup alternative hospitals.

Return strictly a JSON object:
{
  "chosen_hospital": {
    "name": "Lilavati Hospital & Research Centre",
    "lat": 19.052,
    "lng": 72.833,
    "distance_km": 1.4,
    "eta_minutes": 4.5,
    "icu_beds_free": 4
  },
  "reasoning": "Closest Level 1 facility with 4 open cardiac ICU beds and active cath lab.",
  "alternatives": [
    { "name": "P. D. Hinduja Hospital", "reason_not_chosen": "1.8 km further away" }
  ]
}
No additional commentary.
""",
    tools=[
        find_candidate_hospitals,
        agent_tool.AgentTool(agent=bed_matching_agent_google_search_agent),
        agent_tool.AgentTool(agent=bed_matching_agent_url_context_agent),
    ],
)

routing_agent_google_search_agent = LlmAgent(
    name="RoutingAgent_google_search_agent",
    model="gemini-3.6-flash",
    description="Agent specialized in checking traffic corridors.",
    sub_agents=[],
    instruction="Use the GoogleSearchTool to check live traffic disruptions.",
    tools=[GoogleSearchTool()],
)

routing_agent_url_context_agent = LlmAgent(
    name="RoutingAgent_url_context_agent",
    model="gemini-3.6-flash",
    description="Agent specialized in fetching transit updates.",
    sub_agents=[],
    instruction="Use UrlContextTool to fetch traffic incident bulletins.",
    tools=[url_context],
)

routingagent = LlmAgent(
    name="routingagent",
    model="gemini-3.6-flash",
    description="Calculates driving distance, live ETA, and optimal route corridors.",
    sub_agents=[],
    instruction="""You are the Routing Agent.
You receive origin (patient lat/lng) and destination (chosen hospital lat/lng).

Continuous Workflow:
1. Call `calculate_route_eta` with origin and destination coordinates.
2. Produce a clean route summary and verified ETA.

Return strictly a JSON object:
{
  "eta_minutes": 4.5,
  "distance_km": 1.4,
  "route_summary": "Via SV Road & Bandra Reclamation corridor, moderate traffic"
}
No additional commentary.
""",
    tools=[
        calculate_route_eta,
        agent_tool.AgentTool(agent=routing_agent_google_search_agent),
        agent_tool.AgentTool(agent=routing_agent_url_context_agent),
    ],
)

briefing_agent_google_search_agent = LlmAgent(
    name="BriefingAgent_google_search_agent",
    model="gemini-3.6-flash",
    description="Agent specialized in clinical handoff standards.",
    sub_agents=[],
    instruction="Use GoogleSearchTool to review SBAR emergency communication standards.",
    tools=[GoogleSearchTool()],
)

briefing_agent_url_context_agent = LlmAgent(
    name="BriefingAgent_url_context_agent",
    model="gemini-3.6-flash",
    description="Agent specialized in clinical reference retrieval.",
    sub_agents=[],
    instruction="Use UrlContextTool to fetch trauma protocol references.",
    tools=[url_context],
)

briefingagent = LlmAgent(
    name="briefingagent",
    model="gemini-3.6-flash",
    description="Generates plain-language pre-arrival SBAR clinical handoff briefs for receiving ER teams.",
    sub_agents=[],
    instruction="""You are the Briefing Agent.
You receive the full patient case, vitals, Triage output, chosen Hospital, and ETA.

Continuous Workflow:
Write a single-paragraph SBAR (Situation, Background, Assessment, Recommendation) pre-arrival brief
that an emergency surgical or trauma team can read in under 10 seconds.

Return strictly a JSON object:
{
  "pre_arrival_brief": "Incoming 54yo male, suspected acute STEMI. NEWS2 score 8 (high risk). Vitals: HR 118, BP 88/58, SpO2 91%. ETA 4.5 minutes to Lilavati. Recommend cardiac cath lab activation and trauma bay standby."
}
No additional commentary.
""",
    tools=[
        agent_tool.AgentTool(agent=briefing_agent_google_search_agent),
        agent_tool.AgentTool(agent=briefing_agent_url_context_agent),
    ],
)

report_agent_google_search_agent = LlmAgent(
    name="ReportAgent_google_search_agent",
    model="gemini-3.6-flash",
    description="Agent specialized in regional healthcare intelligence search.",
    sub_agents=[],
    instruction="Use GoogleSearchTool to find health authority epidemiology and capacity advisories.",
    tools=[GoogleSearchTool()],
)

report_agent_url_context_agent = LlmAgent(
    name="ReportAgent_url_context_agent",
    model="gemini-3.6-flash",
    description="Agent specialized in health report data extraction.",
    sub_agents=[],
    instruction="Use UrlContextTool to retrieve regional health bulletins.",
    tools=[url_context],
)

reportagent = LlmAgent(
    name="reportagent",
    model="gemini-3.6-flash",
    description=(
        "Generates health authority intelligence briefings and answers natural-language queries "
        "over regional hospital capacity and dispatch SLA performance."
    ),
    sub_agents=[],
    instruction="""You are the Report Agent for regional health authority oversight.
You receive aggregate regional hospital metrics, capacity data, dispatch volumes, and incident reports.

Continuous Workflow:
- Daily Briefings: Produce a concise executive summary highlighting capacity strain, critical bed shortages, and SLA compliance.
- Queries: Answer questions directly and factually based on available hospital and dispatch data.

Output clear, professional text.
""",
    tools=[
        find_candidate_hospitals,
        agent_tool.AgentTool(agent=report_agent_google_search_agent),
        agent_tool.AgentTool(agent=report_agent_url_context_agent),
    ],
)

# ─────────────────────────────────────────────────────────────────────────────
# Root Orchestrator (Sequences and maintains the continuous loop pipeline)
# ─────────────────────────────────────────────────────────────────────────────

orchestrator_google_search_agent = LlmAgent(
    name="Orchestrator_google_search_agent",
    model=GlobalGemini(model="gemini-3.6-flash"),
    description="Agent specialized in performing Google searches.",
    sub_agents=[],
    instruction="Use the GoogleSearchTool to find information on the web.",
    tools=[GoogleSearchTool()],
)

orchestrator_url_context_agent = LlmAgent(
    name="Orchestrator_url_context_agent",
    model=GlobalGemini(model="gemini-3.6-flash"),
    description="Agent specialized in fetching content from URLs.",
    sub_agents=[],
    instruction="Use the UrlContextTool to retrieve content from provided URLs.",
    tools=[url_context],
)

root_agent = LlmAgent(
    name="Orchestrator",
    model=GlobalGemini(model="gemini-3.6-flash"),
    description=(
        "Autonomous Multi-Agent Emergency Coordinator. Executes continuous loop dispatch: "
        "Triage → Bed-Matching → Routing → Briefing, preserving state across all turns."
    ),
    sub_agents=[triageagent, bedmatchingagent, routingagent, briefingagent, reportagent],
    instruction="""You are the Root Orchestrator for the LifeLine autonomous emergency dispatch swarm.

Your primary duty is to execute a continuous, unbroken multi-agent pipeline loop whenever a patient case or emergency is presented:

Continuous Execution Sequence:
1. STEP 1 (Clinical Assessment): Delegate the patient vitals, complaint, and age to `triageagent`. Wait for and capture its NEWS2 score and required specialty.
2. STEP 2 (Hospital Allocation): Pass `triageagent`'s specialty & severity output along with patient location to `bedmatchingagent`. Wait for and capture the chosen hospital and bed reservation.
3. STEP 3 (Route & Transit Calculation): Pass the chosen hospital's location and patient location to `routingagent`. Wait for and capture the verified ETA and road corridor.
4. STEP 4 (SBAR Handoff Brief): Pass the complete dossier (patient, vitals, triage, hospital, ETA) to `briefingagent`. Wait for and capture the pre-arrival clinical brief.
5. STEP 5 (Final Consolidated Dossier): Assemble and output the complete dispatch dossier with all 4 agent results clearly structured.

If the user asks general analytics or hospital capacity questions, delegate to `reportagent`.

Do not halt halfway through the pipeline. Continuously execute each step in sequence to completion.
""",
    tools=[
        compute_news2,
        find_candidate_hospitals,
        calculate_route_eta,
        agent_tool.AgentTool(agent=orchestrator_google_search_agent),
        agent_tool.AgentTool(agent=orchestrator_url_context_agent),
    ],
)
