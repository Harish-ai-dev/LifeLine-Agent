"""
Run once on Day 1: pulls real hospitals for the locked demo city
(see docs/03-decision-log.md) via Google Places API, saves raw results.
Usage: python3 scripts/fetch_hospitals.py
"""
import json
from src.tools.places_api import search_hospitals

DEMO_CITY = "FILL IN FROM docs/03-decision-log.md"  # TODO

if __name__ == "__main__":
    hospitals = search_hospitals(DEMO_CITY, max_results=10)
    with open("data/hospitals_raw.json", "w") as f:
        json.dump(hospitals, f, indent=2)
    print(f"Saved {len(hospitals)} hospitals to data/hospitals_raw.json")
