"""
Run once on Day 1: pulls real hospitals for the locked demo city
via OpenStreetMap Overpass API, saves raw results.
Usage: python scripts/fetch_hospitals.py
"""
import json
from lifeline.tools.places_api import fetch_hospitals_overpass

DEMO_CITY = "mumbai"

if __name__ == "__main__":
    hospitals = fetch_hospitals_overpass(DEMO_CITY)
    with open("data/hospitals_raw.json", "w", encoding="utf-8") as f:
        json.dump(hospitals, f, indent=2)
    print(f"Saved {len(hospitals)} hospitals to data/hospitals_raw.json")
