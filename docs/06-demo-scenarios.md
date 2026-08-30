# 06 — Demo Scenarios (scripted, locked)

These 5 cases are the primary inputs used for testing and live demonstration across the platform.

## Scenario 1 — Mild (Control Case)

```json
{
  "patient_age": 29,
  "vitals": {
    "heart_rate": 82,
    "respiratory_rate": 16,
    "systolic_bp": 118,
    "spo2": 98,
    "temperature_c": 37.0,
    "consciousness": "alert"
  },
  "chief_complaint": "minor ankle sprain after fall",
  "mechanism_of_injury": "twisted ankle during sport"
}
```
- **Expected**: Low NEWS2 score (0-2), `severity_label: "mild"`, `required_specialty: "general"`.

## Scenario 2 — Moderate (Abdominal Pain & Fever)

```json
{
  "patient_age": 61,
  "vitals": {
    "heart_rate": 98,
    "respiratory_rate": 20,
    "systolic_bp": 105,
    "spo2": 95,
    "temperature_c": 38.1,
    "consciousness": "alert"
  },
  "chief_complaint": "abdominal pain, fever",
  "mechanism_of_injury": null
}
```
- **Expected**: Moderate NEWS2 score (3-4), `severity_label: "moderate"`, `required_specialty: "general"` or `"surgical"`.

## Scenario 3 — Critical / Cardiac Emergency

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
  "mechanism_of_injury": null
}
```
- **Expected**: High NEWS2 score (7+), `severity_label: "critical"`, `required_specialty: "cardiac"`, Cath Lab / Cardiac ICU matched.

## Scenario 4 — Critical / Major Trauma

```json
{
  "patient_age": 33,
  "vitals": {
    "heart_rate": 130,
    "respiratory_rate": 28,
    "systolic_bp": 80,
    "spo2": 89,
    "temperature_c": 36.2,
    "consciousness": "confused"
  },
  "chief_complaint": "multiple injuries, severe bleeding",
  "mechanism_of_injury": "motorcycle collision"
}
```
- **Expected**: Very high NEWS2 score (8+), `severity_label: "critical"`, `required_specialty: "trauma"`, Level 1 Trauma Bay matched.

## Scenario 5 — Edge Case: Nearest Hospital at Capacity

Same vitals as Scenario 3, but the nearest hospital is marked at 100% capacity (`icu_beds: 0`). The Bed-Matching Agent reasons over availability and routes the patient to the next closest cardiac facility.
