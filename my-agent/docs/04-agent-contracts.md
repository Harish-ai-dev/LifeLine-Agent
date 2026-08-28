# 04 — Agent Contracts

Exact input/output JSON for every agent. These map 1:1 to the Pydantic models in `src/schemas.py`. Do not change a shape without updating this file and the schema together.

## Triage Agent

**Input**
```json
{
  "patient_age": 54,
  "vitals": {
    "heart_rate": 118,
    "respiratory_rate": 24,
    "systolic_bp": 88,
    "spo2": 91,
    "temperature_c": 38.6,
    "consciousness": "alert"
  },
  "chief_complaint": "chest pain, shortness of breath",
  "mechanism_of_injury": null,
  "news2_score": {
    "score": 9,
    "risk_band": "high"
  }
}
```

**Output**
```json
{
  "severity_label": "critical",
  "required_specialty": "cardiac",
  "notes": "High NEWS2 score with chest pain and hypoxia strongly suggest acute cardiac event; recommend immediate cardiac-capable ICU."
}
```

## Bed-Matching Agent

**Input** — Triage Agent's output, plus patient location:
```json
{
  "triage_result": { "severity_label": "critical", "required_specialty": "cardiac", "notes": "..." },
  "patient_location": { "lat": 30.9010, "lng": 75.8573 }
}
```

**Output**
```json
{
  "chosen_hospital": {
    "name": "Example Cardiac Care Hospital",
    "lat": 30.912,
    "lng": 75.851,
    "distance_km": 4.2,
    "eta_minutes": 11
  },
  "reasoning": "Only nearby facility with an open cardiac ICU bed and matching specialty; next closest cardiac-capable hospital is 9km further.",
  "alternatives": [
    { "name": "Example General Hospital", "reason_not_chosen": "no cardiac ICU bed available" }
  ]
}
```

## Routing Agent (stretch)

**Input** — chosen hospital + patient location (same as above)

**Output**
```json
{
  "eta_minutes": 11,
  "distance_km": 4.2,
  "route_summary": "Via Ferozepur Road, light traffic"
}
```

## Briefing Agent (stretch)

**Input** — full case + triage result + chosen hospital

**Output**
```json
{
  "pre_arrival_brief": "Incoming 54yo male, suspected acute cardiac event. NEWS2 score 9 (high risk). HR 118, SpO2 91%, BP 88 systolic. ETA 11 minutes. Recommend cardiac team standby."
}
```

## Firestore Audit Record (written after every run)

```json
{
  "case_id": "auto-generated",
  "timestamp": "ISO 8601",
  "input_case": { "...": "raw input" },
  "news2_score": { "score": 9, "risk_band": "high" },
  "triage_output": { "...": "as above" },
  "bed_matching_output": { "...": "as above" },
  "routing_output": { "...": "if stretch built" },
  "briefing_output": { "...": "if stretch built" }
}
```
