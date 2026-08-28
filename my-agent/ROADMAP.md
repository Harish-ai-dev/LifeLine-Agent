# LifeLine Agent — Detailed Build Roadmap
### All Things Agentic Hackathon — "The Taskmaster" track
**Deadline:** Aug 31, 2026, 5:00 PM PDT

## 1. Locked Architecture

```
[Preset Scenario / UI input]
        │
        ▼
┌───────────────────┐     real formula: NEWS2 / qSOFA
│   Triage Agent     │ ── + Gemini reasoning over vitals/complaint/mechanism
│   (ADK LlmAgent)   │     → { pcs_score, severity_label, required_specialty }
└───────────────────┘
        │
        ▼
┌───────────────────┐     real data: OpenStreetMap Overpass API (hospital
│ Bed-Matching Agent │     locations, real coords) + simulated bed/specialty data
│   (ADK LlmAgent)   │     → { chosen_hospital, reasoning, alternatives[] }
└───────────────────┘
        │
        ▼ (stretch only)
┌───────────────────┐     real routing: OSRM public demo server
│  Routing Agent     │     → { eta_minutes, distance_km, route_summary }
└───────────────────┘
        │
        ▼ (stretch only)
┌───────────────────┐
│  Briefing Agent     │  → one Gemini call, plain-language pre-arrival brief
└───────────────────┘
        │
        ▼
   [Streamlit UI: live agent log + final decision]
        │
   [Firestore: persisted case + decision trail = audit log]
        │
   [Deployed on Cloud Run]
```

**What's real vs. simulated:**
| Component | Source | Real or simulated |
|---|---|---|
| Hospital names/locations | OpenStreetMap Overpass API | Real |
| Triage scoring formula | NEWS2 (public clinical standard) | Real |
| Driving ETA/route | OSRM public demo server | Real |
| Bed counts / specialties / ICU availability | Generated | Simulated |
| Agent reasoning/orchestration | Gemini + ADK | Your build |

---

## 2. Open-Source / Free Components to Pull In
- **NEWS2 scoring** — public formula. Implement as a plain Python function.
- **OpenStreetMap Overpass API** — Free, no API key. Returns real hospital names + coordinates.
- **OSRM public routing** — Free public demo instance, no key. Returns real driving distance/duration.
- **ADK sample patterns** — `github.com/google/adk-python`
- **Streamlit** — for the UI.
- **Firestore** — for persisting each case + decision trail.

---

## 3. Day-by-Day Detailed Plan

### Day 1 — Real data + one working agent
- Register, claim GCP credits, set billing alert.
- `pip install google-adk`, get Gemini API key, confirm trivial `LlmAgent` works.
- Pick a demo city and query Overpass API for hospitals. Save to `data/hospitals_raw.json`.
- Enrich with simulated bed data. Save to `data/hospitals.json`.
- Implement `news2_score(vitals: dict) -> dict`.
- Build **Triage Agent**.
- Write 4 hardcoded test cases.
- Push repo to GitHub.

### Day 2 — Orchestration, deployment, real routing
- Build **Bed-Matching Agent**.
- Chain Triage → Bed-Matching using ADK's sequential/coordinator pattern.
- Add OSRM call for ETA/Distance.
- Wrap pipeline in FastAPI app (`POST /dispatch`), deploy to Cloud Run.
- Add Firestore write after each run.
- Build Streamlit front end.

### Day 3 — Polish, docs, video, submit
- Freeze features.
- Architecture diagram & README.
- Record demo video.
- Optional: publish write-up.
- Submit!

---

## 4. Risk Watch-list
- **ADK unfamiliarity** — budget extra time on step 1; use Flash.
- **API flakiness** — Cache results locally after first successful pull.
- **Mock bed data** — Ensure numbers look plausible.
- **Scope creep** — Stick to the numbered build order.
