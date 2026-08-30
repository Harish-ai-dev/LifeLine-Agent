"""
Routing Agent — Computes and formats real road routing and driving ETA.
Contract: docs/04-agent-contracts.md#routing-agent-stretch
"""

import math
from lifeline.schemas import Location, RoutingOutput
from lifeline.tools.routes_api import get_driving_eta


def _haversine_distance(loc1: Location, loc2: Location) -> float:
    """Fallback distance calculation in km."""
    R = 6371.0
    dlat = math.radians(loc2.lat - loc1.lat)
    dlng = math.radians(loc2.lng - loc1.lng)
    a = (
        math.sin(dlat / 2) ** 2
        + math.cos(math.radians(loc1.lat))
        * math.cos(math.radians(loc2.lat))
        * math.sin(dlng / 2) ** 2
    )
    c = 2 * math.atan2(math.sqrt(a), math.sqrt(1 - a))
    return round(R * c, 2)


def run_routing(origin: Location, destination: Location) -> RoutingOutput:
    """
    Call OSRM routing engine between patient location and chosen hospital.
    Returns structured RoutingOutput.
    """
    try:
        route_data = get_driving_eta(origin, destination)
        return RoutingOutput(
            eta_minutes=route_data["eta_minutes"],
            distance_km=route_data["distance_km"],
            route_summary=route_data["route_summary"],
        )
    except Exception:
        dist = _haversine_distance(origin, destination)
        eta = round(dist * 2.0, 1)  # ~30 km/h avg in transit
        return RoutingOutput(
            eta_minutes=eta,
            distance_km=dist,
            route_summary=f"{dist} km direct distance · estimated {eta} min in transit",
        )
