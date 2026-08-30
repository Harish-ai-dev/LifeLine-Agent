"""
Supervisor Agent — The autonomous AI Task Manager that supervises the emergency dispatch pipeline.
Uses Gemini function calling to decide when to run triage, bed matching, and routing, and when to pause for Human-In-The-Loop (HITL) approval.
"""
import json
import logging
from typing import Dict, Any, Optional
from google import genai
from google.genai import types as genai_types

from lifeline.schemas import Case, Location
from lifeline.agents.triage_agent import run_triage
from lifeline.agents.bed_matching_agent import run_bed_matching
from lifeline.agents.routing_agent import run_routing
from lifeline.tools.news2 import news2_score
from lifeline.schemas import TriageInput, BedMatchingInput

logger = logging.getLogger(__name__)

# State constants
STATE_IN_PROGRESS = "IN_PROGRESS"
STATE_NEEDS_HUMAN = "NEEDS_HUMAN_APPROVAL"
STATE_COMPLETED = "COMPLETED"
STATE_FAILED = "FAILED"

def execute_triage(patient_age: int, chief_complaint: str, mechanism_of_injury: str, hr: int, rr: int, sbp: int, spo2: int, temp: float, consciousness: str) -> str:
    """Execute the clinical Triage Agent. Must be run first."""
    try:
        from lifeline.schemas import Vitals
        vitals = Vitals(
            heart_rate=hr, respiratory_rate=rr, systolic_bp=sbp,
            spo2=spo2, temperature_c=temp, consciousness=consciousness
        )
        case = Case(patient_age=patient_age, chief_complaint=chief_complaint, mechanism_of_injury=mechanism_of_injury, vitals=vitals)
        news = news2_score(vitals)
        t_input = TriageInput(**case.model_dump(), news2_score=news)
        res = run_triage(t_input)
        return res.model_dump_json()
    except Exception as e:
        return json.dumps({"error": str(e)})

def execute_bed_matching(triage_json: str, patient_lat: float, patient_lng: float) -> str:
    """Execute the Bed Matching Agent. Pass the JSON string output from triage."""
    try:
        from lifeline.schemas import TriageOutput
        triage_out = TriageOutput.model_validate_json(triage_json)
        loc = Location(lat=patient_lat, lng=patient_lng)
        b_input = BedMatchingInput(triage_result=triage_out, patient_location=loc)
        res = run_bed_matching(b_input)
        return res.model_dump_json()
    except Exception as e:
        return json.dumps({"error": str(e)})

def execute_routing(patient_lat: float, patient_lng: float, dest_lat: float, dest_lng: float) -> str:
    """Execute the Routing Agent to get ETA and directions."""
    try:
        loc = Location(lat=patient_lat, lng=patient_lng)
        dest = Location(lat=dest_lat, lng=dest_lng)
        res = run_routing(loc, dest)
        return res.model_dump_json()
    except Exception as e:
        return json.dumps({"error": str(e)})

def request_human_approval(reason: str, summary: str) -> str:
    """
    Pause execution and ask the human dispatcher for approval or input.
    Always call this at the end of the pipeline with the final summary.
    """
    return json.dumps({"status": "PAUSED", "reason": reason, "summary": summary})

class SupervisorAgent:
    """
    Stateful AI Task Manager that uses Gemini to orchestrate other specialized agents.
    """
    def __init__(self, api_key: Optional[str] = None):
        self.client = genai.Client(api_key=api_key) if api_key else genai.Client()
        self.model_name = "gemini-3.5-flash"
        self.context = {} # Store results for backward compatibility with main.py
        
    def _get_system_instruction(self) -> str:
        return """
        You are the Chief Dispatch Supervisor (AI Task Manager) for the LifeLine Emergency System.
        Your job is to autonomously manage a patient's emergency case from start to finish with 100% accuracy.
        
        You have access to specialized tools to do this:
        1. `execute_triage`: Use this FIRST to get the clinical severity and specialty.
        2. `execute_bed_matching`: Use this SECOND to find an appropriate hospital bed.
        3. `execute_routing`: Use this THIRD to calculate ETA and driving directions.
        4. `request_human_approval`: Use this if a decision is highly critical, if confidence is low, or if no beds are available, OR if you are finished and need final sign-off.
        
        Follow this strict sequence. Verify the output of each step. 
        Always finish by calling `request_human_approval` with your final summary so the human dispatcher can review it.
        """

    def run_case(self, case: Case, patient_location: Location) -> Dict[str, Any]:
        prompt = f"""
        New Patient Case Received:
        Age: {case.patient_age}
        Complaint: {case.chief_complaint}
        MOI: {case.mechanism_of_injury}
        Vitals: {case.vitals.model_dump_json()}
        Location: {patient_location.model_dump_json()}
        
        Begin processing this case using your tools.
        """

        tools = [execute_triage, execute_bed_matching, execute_routing, request_human_approval]

        chat = self.client.chats.create(
            model=self.model_name,
            config=genai_types.GenerateContentConfig(
                system_instruction=self._get_system_instruction(),
                tools=tools,
                temperature=0.0
            )
        )

        logger.info("Supervisor Agent started processing case.")
        
        # We will loop to handle multi-turn function calls manually to intercept the human approval
        response = chat.send_message(prompt)
        
        while response.function_calls:
            for function_call in response.function_calls:
                fn_name = function_call.name
                args = function_call.args
                logger.info(f"Supervisor decided to call: {fn_name}")
                
                if fn_name == "request_human_approval":
                    reason = args.get("reason", "Needs review")
                    summary = args.get("summary", "")
                    return {
                        "state": STATE_NEEDS_HUMAN,
                        "human_prompt": reason,
                        "context_summary": summary,
                        "case_data": case.model_dump(),
                        "context": self.context
                    }
                
                # Execute the tool
                try:
                    if fn_name == "execute_triage":
                        res_str = execute_triage(**args)
                        self.context["triage"] = json.loads(res_str) if not res_str.startswith("Error") else None
                    elif fn_name == "execute_bed_matching":
                        res_str = execute_bed_matching(**args)
                        self.context["bed_match"] = json.loads(res_str) if not res_str.startswith("Error") else None
                    elif fn_name == "execute_routing":
                        res_str = execute_routing(**args)
                        self.context["routing"] = json.loads(res_str) if not res_str.startswith("Error") else None
                    else:
                        res_str = json.dumps({"error": "Unknown function"})
                except Exception as e:
                    res_str = json.dumps({"error": str(e)})

                # Send function response back to the model
                response = chat.send_message(
                    genai_types.Content(
                        role="user",
                        parts=[
                            genai_types.Part.from_function_response(
                                name=fn_name,
                                response={"result": res_str}
                            )
                        ]
                    )
                )

        return {
            "state": STATE_COMPLETED,
            "final_text": response.text,
            "context": self.context
        }
