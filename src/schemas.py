"""
Shared Pydantic models for every agent's input/output.
See docs/04-agent-contracts.md for the JSON examples these map to.
Do not change a shape here without updating that doc too.
"""
from pydantic import BaseModel
from typing import Optional, Literal


class Vitals(BaseModel):
    heart_rate: int
    respiratory_rate: int
    systolic_bp: int
    spo2: int
    temperature_c: float
    consciousness: Literal["alert", "confused", "unresponsive"]


class News2Result(BaseModel):
    score: int
    risk_band: Literal["low", "medium", "high"]


class Case(BaseModel):
    patient_age: int
    vitals: Vitals
    chief_complaint: str
    mechanism_of_injury: Optional[str] = None


class TriageInput(Case):
    news2_score: News2Result


class TriageOutput(BaseModel):
    severity_label: Literal["mild", "moderate", "critical"]
    required_specialty: str
    notes: str


class Location(BaseModel):
    lat: float
    lng: float


class BedMatchingInput(BaseModel):
    triage_result: TriageOutput
    patient_location: Location


class HospitalChoice(BaseModel):
    name: str
    lat: float
    lng: float
    distance_km: Optional[float] = None
    eta_minutes: Optional[float] = None


class AlternativeHospital(BaseModel):
    name: str
    reason_not_chosen: str


class BedMatchingOutput(BaseModel):
    chosen_hospital: HospitalChoice
    reasoning: str
    alternatives: list[AlternativeHospital] = []


class RoutingOutput(BaseModel):
    eta_minutes: float
    distance_km: float
    route_summary: str


class BriefingOutput(BaseModel):
    pre_arrival_brief: str
