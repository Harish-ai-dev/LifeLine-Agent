"""
Run once on Day 1, after fetch_hospitals.py: enriches real hospital
locations with SIMULATED bed/specialty data (real EHR data isn't
publicly available — see docs/03-decision-log.md).
Usage: python3 scripts/seed_mock_data.py
"""
import json
import random

SPECIALTIES = ["cardiac", "trauma", "general", "surgical", "pediatric"]

if __name__ == "__main__":
    with open("data/hospitals_raw.json") as f:
        hospitals = json.load(f)

    for h in hospitals:
        h["icu_beds"] = random.randint(0, 12)
        h["general_beds"] = random.randint(0, 40)
        h["surgical_beds"] = random.randint(0, 8)
        h["specialties"] = random.sample(SPECIALTIES, k=random.randint(1, 3))

    with open("data/hospitals.json", "w") as f:
        json.dump(hospitals, f, indent=2)
    print(f"Enriched {len(hospitals)} hospitals -> data/hospitals.json")
