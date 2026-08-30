"""
Model configuration — single source of truth for all Gemini model strings.
Change here to upgrade all agents at once.
"""

# ── Primary Models ────────────────────────────────────────────────────────────

# Used by Triage Agent — clinical reasoning
TRIAGE_MODEL = "gemini-3.6-flash"

# Used by all other agents — fast, frontier-level, cost-efficient
DEFAULT_MODEL = "gemini-3.6-flash"

# Fallback if needed
FALLBACK_MODEL = "gemini-3.6-flash"

# ── Per-Agent Assignment ──────────────────────────────────────────────────────
AGENT_MODELS = {
    "triage_agent":       TRIAGE_MODEL,
    "bed_matching_agent": DEFAULT_MODEL,
    "routing_agent":      DEFAULT_MODEL,
    "briefing_agent":     DEFAULT_MODEL,
    "reporting_agent":    DEFAULT_MODEL,
}
