"""
OpenStreetMap Overpass API wrapper — free, no API key needed.
Fetches real hospital names + coordinates for a given city bounding box.

API docs: https://overpass-api.de/
"""

import requests
import time

OVERPASS_URL = "https://overpass-api.de/api/interpreter"

# Bounding boxes for known demo cities: (south, west, north, east)
CITY_BBOXES = {
    "mumbai":   (18.870, 72.770, 19.270, 72.990),
    "delhi":    (28.400, 76.840, 28.880, 77.350),
    "london":   (51.380, -0.310, 51.680,  0.100),
    "new york": (40.490, -74.280, 40.920, -73.680),
    "seattle":  (47.420, -122.460, 47.740, -122.190),
    "bangalore": (12.830, 77.460, 13.140, 77.780),
}

DEFAULT_CITY = "mumbai"


def fetch_hospitals_overpass(city: str = DEFAULT_CITY, timeout: int = 30) -> list[dict]:
    """
    Query Overpass API for all OSM nodes/ways tagged amenity=hospital
    inside the city's bounding box. Returns a list of dicts with keys:
      name, lat, lng, address (best-effort from OSM tags)
    Caches nothing — callers should persist to data/hospitals_raw.json.
    """
    city_key = city.lower().strip()
    if city_key not in CITY_BBOXES:
        raise ValueError(
            f"City '{city}' not in CITY_BBOXES. Add its bounding box or pick from: "
            + ", ".join(CITY_BBOXES.keys())
        )

    south, west, north, east = CITY_BBOXES[city_key]
    bbox = f"{south},{west},{north},{east}"

    # Overpass QL: fetch nodes AND ways tagged as hospitals, output centre coords
    query = f"""
[out:json][timeout:{timeout}];
(
  node["amenity"="hospital"]({bbox});
  way["amenity"="hospital"]({bbox});
);
out center;
"""

    resp = requests.post(OVERPASS_URL, data={"data": query}, timeout=timeout + 5)
    resp.raise_for_status()
    elements = resp.json().get("elements", [])

    hospitals = []
    for el in elements:
        tags = el.get("tags", {})
        name = tags.get("name") or tags.get("name:en") or "Unknown Hospital"
        # Nodes have lat/lon directly; ways have a 'center' key
        if el["type"] == "node":
            lat, lng = el["lat"], el["lon"]
        else:
            center = el.get("center", {})
            lat, lng = center.get("lat"), center.get("lon")
        if lat is None or lng is None:
            continue
        address_parts = [
            tags.get("addr:street", ""),
            tags.get("addr:city", ""),
        ]
        address = ", ".join(p for p in address_parts if p) or "Address unknown"
        hospitals.append({"name": name, "lat": lat, "lng": lng, "address": address})

    # De-duplicate by name (OSM sometimes has node + way for the same hospital)
    seen_names = set()
    unique = []
    for h in hospitals:
        if h["name"] not in seen_names:
            seen_names.add(h["name"])
            unique.append(h)

    return unique
