# Admin module for LifeLine Agent
# Exports the config_manager helpers for use by the orchestrator
from admin.config_manager import get_runtime_config, inject_to_env

__all__ = ["get_runtime_config", "inject_to_env"]

