# LifeLine Agent

Autonomous emergency dispatch matchmaker — built for the All Things Agentic Hackathon ("The Taskmaster" track).

**Start here:** read `docs/` in order (01 → 07) before writing any code. Every decision is already made — this is a coding sprint, not a design sprint.

## Repo Map

```
my-agent/
├── docs/                  ← READ THESE FIRST, in numeric order
│   ├── 01-architecture.md      what we're building and how the pieces connect
│   ├── 02-build-plan.md        day-by-day, step-by-step build order
│   ├── 03-decision-log.md      every locked decision (models, APIs, city, stack)
│   ├── 04-agent-contracts.md   exact input/output JSON for every agent
│   ├── 05-environment-setup.md copy-paste setup checklist (keys, installs, gcloud)
│   ├── 06-demo-scenarios.md    the exact 5 patient cases used in the demo
│   └── 07-scope-lock.md        what's in, what's out, what's stretch
├── data/                  ← seeded + generated datasets (hospitals, demo cases)
├── src/
│   ├── agents/            ← one file per ADK agent
│   ├── tools/              ← NEWS2 scoring, Places API, Routes API, Firestore client
│   ├── schemas.py          ← Pydantic models shared by all agents
│   ├── orchestrator.py     ← chains the agents together (ADK SequentialAgent)
│   └── main.py             ← FastAPI app, exposes POST /dispatch, deploys to Cloud Run
├── ui/
│   └── streamlit_app.py    ← demo front end
├── scripts/                ← one-off scripts (fetch hospital data, seed mock fields)
├── tests/                  ← one test file per module, run before every commit
├── deploy/                 ← Dockerfile + Cloud Run deploy script
├── .env.example             ← copy to .env and fill in real keys (never commit .env)
├── requirements.txt
└── .gitignore
```

## Golden Rule

If you're about to make a decision that isn't already written down in `docs/03-decision-log.md`, **stop and add it there first**, then code. Never decide silently in code — every choice should be traceable to a doc so the whole team (and Claude Code) stays in sync.
