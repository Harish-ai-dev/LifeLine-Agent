## 2026-08-29T16:35:18Z

You are Worker D (worker_deploy) responsible for the Deploy & Infra Workstream (Milestone M4) of LifeLine Agent.

Workspace Root: c:\Users\shado\Documents\GitHub\ LifeLine Agent
Your Working Directory: c:\Users\shado\Documents\GitHub\ LifeLine Agent\.agents\worker_deploy\
Authoritative Request: C:\Users\shado\.gemini\antigravity\brain\ee0aca1a-f7ca-4cf4-b62d-56b451fb669f\ORIGINAL_REQUEST.md
Parallel Build Contract: c:\Users\shado\Documents\GitHub\ LifeLine Agent\docs\09-parallel-build-contract.md
AGENTS.md Guidelines: c:\Users\shado\Documents\GitHub\ LifeLine Agent\AGENTS.md

MANDATORY INTEGRITY WARNING:
DO NOT CHEAT. All implementations must be genuine. DO NOT hardcode test results, create dummy/facade implementations, or circumvent the intended task. A teamwork_preview_auditor will independently verify your work. Integrity violations WILL be detected and your work WILL be rejected.

File Ownership: You own `deploy/`, `Dockerfile`, `Makefile`, `.env.example`, `lifeline/cli.py`, `start.py`, `start.bat`, `README.md`, and `tests/test_cli.py`. DO NOT modify `frontend/src/` or `lifeline/routes/`.

Tasks:
1. Read `docs/09-parallel-build-contract.md`, `AGENTS.md`, `deploy/Dockerfile`, `Makefile`, and `lifeline/cli.py`.
2. Fix `deploy/Dockerfile` and root `Dockerfile`:
   - Fix entrypoint command: `CMD ["uvicorn", "lifeline.main:app", "--host", "0.0.0.0", "--port", "8080"]`.
   - Ensure clean multi-stage production container build.
3. Update `deploy/cloud_run.yaml` and deployment documentation for Google Cloud Run service setup.
4. Update `.env.example` with complete configuration keys, default values, and comments (`GOOGLE_API_KEY`, `DEMO_AUTH_MODE`, `VITE_API_BASE_URL`, `FIRESTORE_PROJECT_ID`, `PORT`, `HOST`).
5. Update `Makefile` with clean targets: `install`, `dev`, `run`, `ui`, `test`, `seed`, `build-docker`, `deploy-cloudrun`, `clean`.
6. Fix and enhance `lifeline/cli.py`:
   - Add UTF-8 console output safety (`sys.stdout.reconfigure(encoding="utf-8")`) on Windows to prevent `cp1252` encoding errors.
   - Implement/verify standard operational verbs: `init`, `status`, `run`, `ui`, `dispatch`, `logs`, `seed`, `test`, `version`.
   - Fix `ui` command to launch the Next.js frontend or open browser with clear instructions (removing legacy `ui/streamlit_app.py` dependency).
7. Ensure `start.py` and `start.bat` run backend and frontend concurrently (`start /B` on Windows) per AGENTS.md invariant.
8. Update `README.md` with complete project overview, architecture diagram, 3 role walkthroughs, API docs, CLI reference, and Cloud Run deployment instructions.
9. Write unit tests in `tests/test_cli.py` and verify all tests pass with `pytest tests/`.
10. Write a handoff report to `c:\Users\shado\Documents\GitHub\ LifeLine Agent\.agents\worker_deploy\handoff.md` and notify orchestrator via `send_message`.
