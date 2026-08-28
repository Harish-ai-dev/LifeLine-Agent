"""
Routing Agent — STRETCH (see docs/07-scope-lock.md).
Formats a real OSRM Routes API result into a clean output.
Contract: docs/04-agent-contracts.md#routing-agent-stretch
"""
from src.schemas import Location, RoutingOutput
from src.tools.routes_api import get_driving_eta


def run_routing(origin: Location, destination: Location) -> RoutingOutput:
    """Call get_driving_eta, wrap into RoutingOutput with a route_summary."""
    # Get driving ETA and distance from the OSRM API
    eta_data = get_driving_eta(
        origin=origin,
        destination=destination
    )

    return RoutingOutput(
        eta_minutes=eta_data["eta_minutes"],
        distance_km=eta_data["distance_km"],
        route_summary=eta_data["route_summary"]
    )
