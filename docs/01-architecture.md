# 01 — Architecture

## System Diagram

```
[React / Streamlit UI: Role Dashboards & Scenario Dispatch]
            |
            v
[FastAPI Gateway: /dispatch, /donors, /patients, /reports]  (lifeline/main.py)
            |
            v
[Orchestrator: ADK SequentialAgent]  (lifeline/orchestrator.py)
            |
            +--> [Triage Agent]        (lifeline/agents/triage_agent.py)
            |        uses: tools/news2.py (real NEWS2 clinical score)
            |        model: Gemini 3.1 Pro (Clinical Flagship)
            |        out: severity_label, required_specialty, notes
            |
            +--> [Bed-Matching Agent]  (lifeline/agents/bed_matching_agent.py)
            |        uses: OpenStreetMap Overpass + OSRM + data/hospitals.json
            |        model: Gemini 3.5 Flash
            |        out: chosen_hospital, reasoning, alternatives[]
            |
            +--> [Routing Agent]       (lifeline/agents/routing_agent.py)
            |        uses: OSRM Routing Engine
            |        model: Gemini 3.5 Flash
            |        out: eta_minutes, distance_km, route_summary
            |
            +--> [Briefing Agent]      (lifeline/agents/briefing_agent.py)
                     model: Gemini 3.5 Flash
                     out: pre_arrival_brief (plain text SBAR paragraph)
            |
            v
[Firestore: Multi-collection storage & immutable audit logs]
            |
            v
[Response streamed back to UI, shown step-by-step]
```

## Why this shape

- **Orchestrator pattern, not a single mega-agent.** Judges look for real multi-agent handoffs. Each agent has one job, one output schema, and is independently testable.
- **Tools do the "real" work, agents do the reasoning.** NEWS2 scoring, hospital data, and routing are deterministic/factual — they live in `lifeline/tools/` as plain functions or API wrappers. Agents call these tools and *reason* over the result (e.g. "NEWS2 score is 7, complaint is chest pain → likely cardiac, needs a cardiac-capable ICU bed"). This keeps agent outputs grounded instead of hallucinated.
- **One shared schema file (`lifeline/schemas.py`).** Every agent's input/output is a Pydantic model defined once, imported everywhere. No agent invents its own ad-hoc JSON shape.

## Data flow for one request

1. UI sends a case payload (JSON) to `/dispatch` or `/sos`.
2. Orchestrator computes NEWS2 score first (deterministic Python calculation, not an LLM call) and attaches it to the case.
3. Triage Agent (`gemini-3.1-pro`) receives case + NEWS2 score, returns severity + required specialty.
4. Bed-Matching Agent (`gemini-3.5-flash`) receives Triage output, filters hospitals by specialty + bed availability, uses OSRM for real ETA, returns a ranked choice with reasoning.
5. Routing Agent formats a clean ETA summary. Briefing Agent writes a pre-arrival SBAR handoff note.
6. Orchestrator writes the full record (input + every agent's output) to Firestore (`dispatch_cases`).
7. Full trace streamed back to the UI so the demo shows each agent's reasoning live.

See `docs/04-agent-contracts.md` and `docs/09-parallel-build-contract.md` for exact JSON shapes.
