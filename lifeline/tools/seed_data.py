"""
Seed Data Loader and Manager for LifeLine Agent.

Loads rich Mumbai Metro operational data across all 7 Firestore collections
and 14 regional hospital facilities into the DataStore or live Firestore.
"""

import json
import logging
import os
from typing import Any, Dict, List, Optional

from lifeline.tools.data_store import DataStore, get_data_store

logger = logging.getLogger(__name__)

DATA_DIR = os.path.join(os.path.dirname(os.path.dirname(os.path.dirname(__file__))), "data")
SEED_DATA_PATH = os.path.join(DATA_DIR, "seed_data.json")
HOSPITALS_DATA_PATH = os.path.join(DATA_DIR, "hospitals.json")


def load_seed_data_file(path: Optional[str] = None) -> Dict[str, Any]:
    """Load the master seed_data.json file."""
    target_path = path or SEED_DATA_PATH
    if os.path.exists(target_path):
        try:
            with open(target_path, "r", encoding="utf-8") as f:
                return json.load(f)
        except Exception as e:
            logger.error(f"Failed to read seed data file at {target_path}: {e}")
    return {}


def load_hospitals_file(path: Optional[str] = None) -> List[Dict[str, Any]]:
    """Load the hospitals.json file."""
    target_path = path or HOSPITALS_DATA_PATH
    if os.path.exists(target_path):
        try:
            with open(target_path, "r", encoding="utf-8") as f:
                return json.load(f)
        except Exception as e:
            logger.error(f"Failed to read hospitals file at {target_path}: {e}")
    return []


def seed_database(
    store: Optional[DataStore] = None,
    overwrite: bool = True,
    seed_file: Optional[str] = None,
    hospitals_file: Optional[str] = None,
) -> Dict[str, int]:
    """
    Seed the DataStore with data from seed_data.json and hospitals.json.
    Returns a dictionary of collection name to seeded document count.
    """
    target_store = store or get_data_store()
    seed_data = load_seed_data_file(seed_file)
    hospitals = load_hospitals_file(hospitals_file)

    if hospitals:
        seed_data["hospitals"] = hospitals

    target_store.seed(seed_data, overwrite=overwrite)

    counts = {}
    for col in [
        "dispatch_cases",
        "donors",
        "requests",
        "patients",
        "issues",
        "inventory",
        "reports",
        "hospitals",
    ]:
        counts[col] = target_store.count(col)

    logger.info(f"Database seeded successfully: {counts}")
    return counts


if __name__ == "__main__":
    result = seed_database()
    print("Database seeding completed:")
    for col, count in result.items():
        print(f"  - {col}: {count} records")
