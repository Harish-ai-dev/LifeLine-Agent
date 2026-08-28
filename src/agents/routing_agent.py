"""
Routing Agent — STRETCH (see docs/07-scope-lock.md).
Formats a real Google Routes API result into a clean output.
Contract: docs/04-agent-contracts.md#routing-agent-stretch
"""
from src.schemas import Location, RoutingOutput
from src.tools.routes_api import get_driving_eta


def run_routing(origin: Location, destination: Location) -> RoutingOutput:
    """TODO: call get_driving_eta, wrap into RoutingOutput with a route_summary."""
    raise NotImplementedError
