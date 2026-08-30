"""
LifeLine Agent — ADK package entry point.
Exposes `root_agent` so `adk web` can discover it.
"""
from lifeline_adk.agent import root_agent

__all__ = ["root_agent"]
