# 04 — Agent Contracts

Exact input/output JSON for every core agent. These map 1:1 to the Pydantic models in `lifeline/schemas.py`. Do not change a shape without updating this file, `docs/09-parallel-build-contract.md`, and the schema together.

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
  "patient_location": { "lat": 19.055, "lng": 72.840 }
}
```

**Output**
```json
{
  "chosen_hospital": {
    "name": "Lilavati Hospital & Research Centre",
    "lat": 19.052,
    "lng": 72.833,
    "distance_km": 1.4,
    "eta_minutes": 4.5
  },
  "reasoning": "Closest Level 1 facility with 3 available cardiac ICU beds and active cath lab.",
  "alternatives": [
    { "name": "Hinduja Hospital", "reason_not_chosen": "1.8 km further away" }
  ]
}
```

## Routing Agent

**Input** — chosen hospital + patient location:
```json
{
  "origin": { "lat": 19.055, "lng": 72.840 },
  "destination": { "lat": 19.052, "lng": 72.833 }
}
```

**Output**
```json
{
  "eta_minutes": 4.5,
  "distance_km": 1.4,
  "route_summary": "Via Bandra Reclamation Rd, light traffic"
}
```

## Briefing Agent

**Input** — full case + triage result + chosen hospital

**Output**
```json
{
  "pre_arrival_brief": "Incoming 54yo male, suspected acute cardiac event. NEWS2 score 9 (high risk). HR 118, SpO2 91%, BP 88 systolic. ETA 4.5 minutes. Recommend cardiac team standby."
}
```

## Firestore Audit Record (`dispatch_cases` collection)

```json
{
  "_id": "CASE-9021",
  "_timestamp": "2026-08-29T16:30:00Z",
  "_version": "0.1.0",
  "_actor": "orchestrator",
  "input_case": {
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
    "mechanism_of_injury": null
  },
  "news2_score": { "score": 9, "risk_band": "high" },
  "triage_output": {
    "severity_label": "critical",
    "required_specialty": "cardiac",
    "notes": "High NEWS2 score..."
  },
  "bed_matching_output": {
    "chosen_hospital": {
      "name": "Lilavati Hospital & Research Centre",
      "lat": 19.052,
      "lng": 72.833,
      "distance_km": 1.4,
      "eta_minutes": 4.5
    },
    "reasoning": "...",
    "alternatives": []
  },
  "routing_output": {
    "eta_minutes": 4.5,
    "distance_km": 1.4,
    "route_summary": "Via Bandra Reclamation Rd"
  },
  "briefing_output": {
    "pre_arrival_brief": "Incoming 54yo male..."
  }
}
```
