"""
Model configuration — single source of truth for all Gemini model strings.
Change here to upgrade all agents at once.

Current models (August 2026):
  gemini-3.5-flash  → Frontier-speed, cost-efficient (released May 19, 2026)
  gemini-3.7-flash  → Latest workhorse (released Aug 13, 2026) - use if 3.5 deprecated
  gemini-3.1-pro    → Best available Pro-tier reasoning (Pro 3.5 delayed)

Reference: https://ai.google.dev/models
"""

# ── Primary Models ────────────────────────────────────────────────────────────

# Used by Triage Agent — deepest clinical reasoning, most important decision
TRIAGE_MODEL = "gemini-3.1-pro"

# Used by all other agents — fast, frontier-level, cost-efficient
DEFAULT_MODEL = "gemini-3.5-flash"

# Fallback if 3.5-flash has issues (next-gen workhorse)
FALLBACK_MODEL = "gemini-3.7-flash"

# ── Per-Agent Assignment ──────────────────────────────────────────────────────
AGENT_MODELS = {
    "triage_agent":       TRIAGE_MODEL,    # gemini-3.1-pro  (critical reasoning)
    "bed_matching_agent": DEFAULT_MODEL,   # gemini-3.5-flash (matching + ranking)
    "routing_agent":      DEFAULT_MODEL,   # gemini-3.5-flash (format OSRM output)
    "briefing_agent":     DEFAULT_MODEL,   # gemini-3.5-flash (one summary call)
    "reporting_agent":    DEFAULT_MODEL,   # gemini-3.5-flash (daily intelligence & NL Q&A)
    "issue_classifier_agent": DEFAULT_MODEL, # gemini-3.5-flash (issue classification)
}
