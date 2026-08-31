"""
Model configuration — single source of truth for all Gemini model strings.
Change here to upgrade all agents at once.
"""

import os

# ── Primary Models ────────────────────────────────────────────────────────────

# Used by Triage Agent — clinical reasoning
TRIAGE_MODEL = os.environ.get("TRIAGE_MODEL", "gemini-flash-latest")

# Used by all other agents — fast, frontier-level, cost-efficient
DEFAULT_MODEL = os.environ.get("GEMINI_MODEL", "gemini-flash-latest")

# Fallback if primary unavailable
FALLBACK_MODEL = os.environ.get("FALLBACK_MODEL", DEFAULT_MODEL)

# ── Per-Agent Assignment ──────────────────────────────────────────────────────
AGENT_MODELS = {
    "triage_agent":            TRIAGE_MODEL,   # gemini-flash-latest (clinical)
    "bed_matching_agent":      DEFAULT_MODEL,  # gemini-flash-latest
    "routing_agent":           DEFAULT_MODEL,  # gemini-flash-latest
    "briefing_agent":          DEFAULT_MODEL,  # gemini-flash-latest
    "reporting_agent":         DEFAULT_MODEL,  # gemini-flash-latest
    "issue_classifier_agent":  DEFAULT_MODEL,  # gemini-flash-latest
    "donor_matching_agent":    DEFAULT_MODEL,  # gemini-flash-latest
}

