"""
Model configuration — single source of truth for all Gemini model strings.
Change here to upgrade all agents at once.
"""

import os

# ── Primary Models ────────────────────────────────────────────────────────────

# Used by Triage Agent — clinical reasoning
TRIAGE_MODEL = os.environ.get("TRIAGE_MODEL", "gemini-3.1-pro")

# Used by all other agents — fast, frontier-level, cost-efficient
DEFAULT_MODEL = os.environ.get("GEMINI_MODEL", "gemini-3.7-flash")

# Fallback if primary unavailable
FALLBACK_MODEL = os.environ.get("FALLBACK_MODEL", DEFAULT_MODEL)

# ── Per-Agent Assignment ──────────────────────────────────────────────────────
AGENT_MODELS = {
    "triage_agent":            TRIAGE_MODEL,   # gemini-3.1-pro (clinical)
    "bed_matching_agent":      DEFAULT_MODEL,  # gemini-3.5-flash
    "routing_agent":           DEFAULT_MODEL,  # gemini-3.5-flash
    "briefing_agent":          DEFAULT_MODEL,  # gemini-3.5-flash
    "reporting_agent":         DEFAULT_MODEL,  # gemini-3.5-flash
    "issue_classifier_agent":  DEFAULT_MODEL,  # gemini-3.5-flash
    "donor_matching_agent":    DEFAULT_MODEL,  # gemini-3.5-flash
}

