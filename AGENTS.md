# Agent Architecture & Claude Code Guidelines

## 1. Directory & File Organization
- **Documentation Directories**: Folders dedicated to documentation (e.g. `my-agent/`, `docs/`) must ONLY contain `.md` markdown files. No python files, test scripts, or executable code in documentation directories.
- **Package Layout**: All application source code must live in a standard installable package layout (e.g. `lifeline/`, `admin/`, `frontend/`, `tests/`, `scripts/`).

## 2. Agent Packaging & CLI Standards
- Projects must be installable via standard package managers (`pyproject.toml` with `pip install -e .`).
- Provide a Typer-powered CLI entrypoint supporting standard operational verbs:
  - `init`: Interactive setup wizard
  - `status`: Live system health and configuration dashboard
  - `run`: Start API backend server
  - `ui`: Launch user frontend
  - `dispatch`: Execute agent pipeline directly from terminal
  - `logs`: Stream recent audit database records
  - `test`: Run test suite with pytest
  - `version`: Display version and runtime info
- Support module execution via `python -m <package>`.

## 3. Secret Management & Security
- Never hardcode API keys, service account credentials, or access tokens in source code or default configuration files.
- Store sensitive credentials using AES-256 encrypted configuration at rest or Firebase Authentication.
- Always support direct environment variable overrides (`os.environ`) for Cloud Run / CI/CD deployments.

## 4. Cross-Platform Windows & Terminal Invariants
- For console output, configure UTF-8 encoding (`sys.stdout.reconfigure(encoding="utf-8")`) to prevent Windows `cp1252` encoding errors with rich text or emojis.
- When creating Windows batch scripts (`start.bat`), use `start /B` to run backend and frontend concurrently in a single terminal window.

## 5. Multi-Agent Pipeline Pattern
- Ground LLM decisions in validated deterministic calculations before prompting where applicable.
- Use structured Pydantic schemas for all agent inputs and outputs.
- Maintain immutable, timestamped audit logging for every decision lifecycle.
