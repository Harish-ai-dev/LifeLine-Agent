# 02 — Build Plan (3 Days)

Each step is a checkpoint: don't move to the next step until the current one runs and produces sane output. No new decisions during build — if something isn't covered here, check `03-decision-log.md` first; if it's truly not decided, that's the one thing worth pausing for.

## Day 1 — Data + first agent

- [ ] `pip install -r requirements.txt`
- [ ] Copy `.env.example` → `.env`, fill in `GOOGLE_API_KEY` (Gemini), `GOOGLE_MAPS_API_KEY` (Places + Routes), `GOOGLE_CLOUD_PROJECT`
- [ ] Run `scripts/fetch_hospitals.py` → pulls real hospitals for the locked demo city via Google Places API → `data/hospitals_raw.json`
- [ ] Run `scripts/seed_mock_data.py` → enriches raw hospitals with simulated `icu_beds`, `general_beds`, `surgical_beds`, `specialties[]` → `data/hospitals.json`
- [ ] Implement `src/tools/news2.py` — pure function, no LLM, no API. Test against 4 known vitals combos.
- [ ] Implement `src/schemas.py` — all Pydantic models from `04-agent-contracts.md`
- [ ] Implement `src/agents/triage_agent.py` per its contract
- [ ] Write `tests/test_news2.py` and `tests/test_triage_agent.py`, run against the 5 scenarios in `06-demo-scenarios.md`
- [ ] Commit + push. Confirm repo is public.

**Day 1 exit bar:** Triage Agent takes a case from `06-demo-scenarios.md`, returns valid structured output, test passes.

## Day 2 — Second agent, orchestration, deployment

- [ ] Implement `src/tools/places_api.py` (already used by the fetch script, but also exposed as a callable tool if the agent needs live lookups) and `src/tools/routes_api.py`
- [ ] Implement `src/agents/bed_matching_agent.py` per its contract, using `data/hospitals.json` as a tool source
- [ ] Implement `src/orchestrator.py` chaining Triage → Bed-Matching (ADK SequentialAgent or coordinator — see `03-decision-log.md` for which)
- [ ] Implement `src/tools/firestore_client.py`, wire a write after every orchestrator run
- [ ] Implement `src/main.py` (FastAPI, `POST /dispatch`), test locally
- [ ] Write `deploy/Dockerfile`, deploy to Cloud Run via `deploy/deploy.sh`
- [ ] Implement `ui/streamlit_app.py` — dropdown of the 5 scenarios, Dispatch button, live-updating log of each agent's output
- [ ] **Stretch only if on schedule:** `src/agents/routing_agent.py`, `src/agents/briefing_agent.py`, wire into orchestrator

**Day 2 exit bar:** Full pipeline runs on Cloud Run, judge can watch it live via Streamlit, Firestore has a record after each run.

## Day 3 — Polish, docs, video, submit

- [ ] Freeze features by mid-morning — no new code after this
- [ ] Finalize architecture diagram image (export from `01-architecture.md`'s ASCII version into a clean Excalidraw/draw.io diagram)
- [ ] Update root `README.md` with final setup instructions someone else could follow cold
- [ ] Record demo video: run all 5 scenarios live, unedited, plus a Cloud Run dashboard screenshot
- [ ] Add a "what's real vs simulated" section and a "future work" section to the README
- [ ] Submit with buffer time before the deadline
