# 06 — Demo Scenarios (scripted, locked)

These 5 cases are the only inputs used for testing and the live demo. Do not improvise new cases mid-build — add here first if truly needed.

## Scenario 1 — Mild (control case)

```json
{
  "patient_age": 29,
  "vitals": { "heart_rate": 82, "respiratory_rate": 16, "systolic_bp": 118, "spo2": 98, "temperature_c": 37.0, "consciousness": "alert" },
  "chief_complaint": "minor ankle sprain after fall",
  "mechanism_of_injury": "twisted ankle during sport"
}
```
Expected: low NEWS2, `severity_label: "mild"`, `required_specialty: "general"`.

## Scenario 2 — Moderate

```json
{
  "patient_age": 61,
  "vitals": { "heart_rate": 98, "respiratory_rate": 20, "systolic_bp": 105, "spo2": 95, "temperature_c": 38.1, "consciousness": "alert" },
  "chief_complaint": "abdominal pain, fever",
  "mechanism_of_injury": null
}
```
Expected: moderate NEWS2, `severity_label: "moderate"`, `required_specialty: "general"` or `"surgical"`.

## Scenario 3 — Critical / Cardiac

```json
{
  "patient_age": 54,
  "vitals": { "heart_rate": 118, "respiratory_rate": 24, "systolic_bp": 88, "spo2": 91, "temperature_c": 38.6, "consciousness": "alert" },
  "chief_complaint": "chest pain, shortness of breath",
  "mechanism_of_injury": null
}
```
Expected: high NEWS2, `severity_label: "critical"`, `required_specialty: "cardiac"`.

## Scenario 4 — Critical / Trauma

```json
{
  "patient_age": 33,
  "vitals": { "heart_rate": 130, "respiratory_rate": 28, "systolic_bp": 80, "spo2": 89, "temperature_c": 36.2, "consciousness": "confused" },
  "chief_complaint": "multiple injuries, severe bleeding",
  "mechanism_of_injury": "motorcycle collision"
}
```
Expected: very high NEWS2, `severity_label: "critical"`, `required_specialty: "trauma"`.

## Scenario 5 — Edge case: nearest hospital at capacity

Same vitals as Scenario 3, but used specifically to demo the Bed-Matching Agent skipping the nearest cardiac hospital (mark it as `icu_beds: 0` in `data/hospitals.json` for this hospital) and routing to the next-best option — this shows the reasoning, not just distance-based matching.

**Purpose of this scenario:** proves the Bed-Matching Agent isn't just "nearest hospital" — it's actually reasoning over availability + specialty match, which is the core value prop of the whole pitch.
