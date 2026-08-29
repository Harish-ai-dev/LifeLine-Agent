# 01 — Architecture

## System Diagram

```
[Streamlit UI: preset scenario dropdown + Dispatch button]
            |
            vn
[FastAPI: POST /dispatch]  (src/main.py)
            |
            v
[Orchestrator: ADK SequentialAgent]  (src/orchestrator.py)
            |
            +--> [Triage Agent]        (src/agents/triage_agent.py)
            |        uses: tools/news2.py (real NEWS2 clinical score)
            |        model: Gemini 2.5 Flash
            |        out: severity_label, required_specialty, notes
            |
            +--> [Bed-Matching Agent]  (src/agents/bed_matching_agent.py)
            |        uses: data/hospitals.json (real locations, simulated beds)
            |        model: Gemini 2.5 Flash
            |        out: chosen_hospital, reasoning, alternatives[]
            |
            +--> [Routing Agent]       (src/agents/routing_agent.py)  [STRETCH]
            |        uses: tools/routes_api.py (Google Routes API)
            |        out: eta_minutes, distance_km
            |
            +--> [Briefing Agent]      (src/agents/briefing_agent.py) [STRETCH]
                     model: Gemini 2.5 Flash
                     out: pre_arrival_brief (plain text paragraph)
            |
            v
[Firestore: full case + all agent outputs written as one audit record]
            |
            v
[Response streamed back to Streamlit UI, shown step-by-step]
```

## Why this shape

- **Orchestrator pattern, not a single mega-agent.** Judges are told to look for real multi-agent handoffs. Each agent has one job, one output schema, and is independently testable.
- **Tools do the "real" work, agents do the reasoning.** NEWS2 scoring, hospital data, and routing are deterministic/factual — they live in `tools/` as plain functions or API wrappers. Agents call these tools and *reason* over the result (e.g. "NEWS2 score is 7, complaint is chest pain → likely cardiac, needs a cardiac-capable ICU bed"). This keeps agent outputs grounded instead of hallucinated.
- **One shared schema file (`src/schemas.py`).** Every agent's input/output is a Pydantic model defined once, imported everywhere. No agent invents its own ad-hoc JSON shape.

## Data flow for one request

1. UI sends a preset case (JSON) to `/dispatch`.
2. Orchestrator computes NEWS2 score first (plain function, not an LLM call) and attaches it to the case.
3. Triage Agent receives case + NEWS2 score, returns severity + required specialty.
4. Bed-Matching Agent receives Triage output, filters `data/hospitals.json` by specialty + bed availability, optionally calls Routes API for real ETA, returns a ranked choice with reasoning.
5. (Stretch) Routing Agent formats a clean ETA summary. Briefing Agent writes a one-paragraph handoff note.
6. Orchestrator writes the full record (input + every agent's output) to Firestore.
7. Full trace streamed back to the UI so the demo shows each agent's reasoning live.

See `docs/04-agent-contracts.md` for the exact JSON shape at every arrow in the diagram above.
