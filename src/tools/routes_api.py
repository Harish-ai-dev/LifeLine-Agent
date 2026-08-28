"""
OSRM (Open Source Routing Machine) public demo server wrapper.
Free, no API key. Real driving distance + ETA.

API docs: http://project-osrm.org/docs/v5.5.1/api/
Public server: https://router.project-osrm.org
"""

import requests
from src.schemas import Location

OSRM_BASE = "https://router.project-osrm.org/route/v1/driving"


def get_driving_eta(origin: Location, destination: Location) -> dict:
    """
    Call OSRM public demo server for a driving route between two coordinates.
    Returns:
        {
          "distance_km": float,
          "eta_minutes": float,
          "route_summary": str
        }

    NOTE: The public OSRM instance uses OSM road data and is not SLA-backed.
    Results are cached by the caller (orchestrator) after the first successful
    pull so demo-day outages don't break the run.
    """
    url = f"{OSRM_BASE}/{origin.lng},{origin.lat};{destination.lng},{destination.lat}"
    params = {
        "overview": "false",   # no polyline needed, saves bandwidth
        "steps": "false",
    }

    resp = requests.get(url, params=params, timeout=10)
    resp.raise_for_status()
    data = resp.json()

    if data.get("code") != "Ok" or not data.get("routes"):
        raise RuntimeError(f"OSRM returned no route: {data.get('code')}")

    route = data["routes"][0]
    distance_km = round(route["distance"] / 1000, 2)
    eta_minutes = round(route["duration"] / 60, 1)

    route_summary = (
        f"{distance_km} km drive · approx {eta_minutes} min by road"
    )

    return {
        "distance_km": distance_km,
        "eta_minutes": eta_minutes,
        "route_summary": route_summary,
    }


def get_eta_for_hospitals(
    patient_location: Location, hospitals: list[dict]
) -> list[dict]:
    """
    Enrich a list of hospital dicts with driving ETA/distance from patient.
    Adds 'distance_km' and 'eta_minutes' keys in-place.
    Hospitals where OSRM fails keep distance_km=None, eta_minutes=None.
    """
    enriched = []
    for hospital in hospitals:
        dest = Location(lat=hospital["lat"], lng=hospital["lng"])
        try:
            eta_data = get_driving_eta(patient_location, dest)
            hospital = {**hospital, **eta_data}
        except Exception:
            hospital = {**hospital, "distance_km": None, "eta_minutes": None,
                        "route_summary": "ETA unavailable"}
        enriched.append(hospital)
    return enriched
