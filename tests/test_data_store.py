"""
Unit and integration tests for DataStore, seed data, and firestore client.

Verifies:
1. In-memory data store initialization and auto-seeding across all 7 collections + hospitals.
2. Standard audit metadata injection (_id, _timestamp, _version, _actor).
3. Synchronous CRUD operations (create, get, update, delete, query, list_all, count).
4. Asynchronous CRUD operations (async_create, async_get, async_update, async_delete, async_query).
5. Querying, filtering (exact match & operators), sorting, and pagination.
6. Rich Mumbai seed dataset structure and invariants (14 hospitals, 10+ donors, 5+ patients, 3+ requests, 4+ issues, 10+ inventory, 2+ reports).
7. Thread-safe concurrent operations.
8. Integration with lifeline.tools.firestore_client.
9. Seed manager utility functions in lifeline.tools.seed_data.
"""

import asyncio
import concurrent.futures
import pytest
from lifeline.tools.data_store import DataStore, get_data_store, reset_data_store
from lifeline.tools.seed_data import (
    load_seed_data_file,
    load_hospitals_file,
    seed_database,
)
from lifeline.tools.firestore_client import (
    write_audit_record,
    get_recent_cases,
    get_case_by_id,
)


@pytest.fixture(autouse=True)
def clean_store():
    """Ensure a clean, freshly seeded DataStore instance for each test."""
    store = reset_data_store()
    yield store


def test_datastore_initialization_and_seeding(clean_store):
    """Verify that DataStore initializes and loads seed data across all collections."""
    store = clean_store
    assert store.count("dispatch_cases") >= 3
    assert store.count("donors") >= 10
    assert store.count("requests") >= 3
    assert store.count("patients") >= 5
    assert store.count("issues") >= 4
    assert store.count("inventory") >= 10
    assert store.count("reports") >= 2
    assert store.count("hospitals") >= 14


def test_audit_metadata_injection(clean_store):
    """Verify that _id, _timestamp, _version, and _actor are automatically injected."""
    store = clean_store
    new_donor = {
        "full_name": "Test Donor",
        "blood_group": "O+",
        "status": "available",
    }
    created = store.create("donors", new_donor, actor="test_runner")
    assert "_id" in created
    assert created["_id"].startswith("donor_")
    assert created["_version"] == "0.1.0"
    assert created["_actor"] == "test_runner"
    assert "_timestamp" in created
    assert created["_timestamp"].endswith("Z")

    # Verify retrieval preserves metadata
    fetched = store.get("donors", created["_id"])
    assert fetched is not None
    assert fetched["full_name"] == "Test Donor"
    assert fetched["_actor"] == "test_runner"


def test_sync_crud_lifecycle(clean_store):
    """Verify full CRUD lifecycle: create, get, update, delete."""
    store = clean_store

    # 1. Create with custom ID
    custom_id = "iss_test_99"
    issue_data = {
        "hospital_id": "hosp_mumbai_01",
        "title": "Generator Failure",
        "severity": "critical",
        "status": "open",
    }
    created = store.create("issues", issue_data, doc_id=custom_id, actor="admin_user")
    assert created["_id"] == custom_id
    assert created["title"] == "Generator Failure"

    # 2. Get
    fetched = store.get("issues", custom_id)
    assert fetched is not None
    assert fetched["severity"] == "critical"

    # 3. Update
    updated = store.update(
        "issues",
        custom_id,
        {"status": "resolved", "resolved_at": "2026-08-29T18:00:00Z"},
        actor="maintenance_bot",
    )
    assert updated is not None
    assert updated["status"] == "resolved"
    assert updated["_actor"] == "maintenance_bot"

    # 4. Confirm update persisted
    fetched_after_update = store.get("issues", custom_id)
    assert fetched_after_update["status"] == "resolved"
    assert fetched_after_update["resolved_at"] == "2026-08-29T18:00:00Z"

    # 5. Delete
    delete_result = store.delete("issues", custom_id)
    assert delete_result is True
    assert store.get("issues", custom_id) is None

    # Deleting non-existent returns False
    assert store.delete("issues", "non_existent_id") is False


def test_async_crud_operations(clean_store):
    """Verify that all async methods function correctly in asyncio loop."""
    async def _run_async_tests():
        store = clean_store
        inv_data = {
            "hospital_id": "hosp_mumbai_02",
            "category": "blood_bank",
            "item_name": "Test Platelets",
            "current_stock": 5,
            "minimum_threshold": 10,
            "is_low_stock": True,
        }

        # Async Create
        created = await store.async_create("inventory", inv_data, doc_id="inv_async_01", actor="async_agent")
        assert created["_id"] == "inv_async_01"
        assert created["item_name"] == "Test Platelets"

        # Async Get
        fetched = await store.async_get("inventory", "inv_async_01")
        assert fetched is not None
        assert fetched["current_stock"] == 5

        # Async Update
        updated = await store.async_update("inventory", "inv_async_01", {"current_stock": 12, "is_low_stock": False})
        assert updated["current_stock"] == 12
        assert updated["is_low_stock"] is False

        # Async Query
        query_results = await store.async_query("inventory", filters={"hospital_id": "hosp_mumbai_02"})
        assert len(query_results) >= 1
        assert any(item["_id"] == "inv_async_01" for item in query_results)

        # Async Count
        cnt = await store.async_count("inventory", filters={"category": "blood_bank"})
        assert cnt >= 1

        # Async Delete
        del_res = await store.async_delete("inventory", "inv_async_01")
        assert del_res is True
        assert await store.async_get("inventory", "inv_async_01") is None

    asyncio.run(_run_async_tests())


def test_query_filtering_and_operators(clean_store):
    """Verify dictionary filters, operator tuples, ordering, and pagination."""
    store = clean_store

    # Exact dictionary match
    open_requests = store.query("requests", filters={"status": "open"})
    assert len(open_requests) >= 3
    for r in open_requests:
        assert r["status"] == "open"

    # Tuple operators: comparison
    critical_patients = store.query("patients", filters=[("news2_score", ">=", 9)])
    assert len(critical_patients) >= 2
    for p in critical_patients:
        assert p["news2_score"] >= 9

    # In operator
    categories = store.query("inventory", filters=[("category", "in", ["blood_bank", "equipment"])])
    assert len(categories) >= 4
    for item in categories:
        assert item["category"] in ["blood_bank", "equipment"]

    # Ordering descending
    sorted_patients = store.query("patients", order_by="news2_score", descending=True)
    scores = [p["news2_score"] for p in sorted_patients]
    assert scores == sorted(scores, reverse=True)

    # Pagination: limit and offset
    page_1 = store.query("hospitals", limit=5, offset=0)
    page_2 = store.query("hospitals", limit=5, offset=5)
    assert len(page_1) == 5
    assert len(page_2) == 5
    assert page_1[0]["_id"] != page_2[0]["_id"]


def test_rich_mumbai_seed_data_invariants():
    """Verify the realistic seed datasets for Mumbai Metro region."""
    hospitals = load_hospitals_file()
    assert len(hospitals) >= 14

    for h in hospitals:
        assert "name" in h
        assert 18.0 <= h["lat"] <= 20.0
        assert 72.0 <= h["lng"] <= 74.0
        assert len(h["specialties"]) > 0
        assert h["icu_beds"] >= 0

    seed = load_seed_data_file()
    assert len(seed["donors"]) >= 10
    blood_groups = {d["blood_group"] for d in seed["donors"]}
    assert {"O+", "O-", "A+", "B+", "AB-"}.issubset(blood_groups)
    assert all("donation_history" in d for d in seed["donors"])

    assert len(seed["patients"]) >= 5
    statuses = {p["admission_status"] for p in seed["patients"]}
    assert "inbound" in statuses
    assert "admitted" in statuses
    assert all("vitals" in p and "news2_score" in p for p in seed["patients"])

    assert len(seed["requests"]) >= 3
    assert all("clinical_indication" in r and "urgency" in r for r in seed["requests"])

    assert len(seed["issues"]) >= 4
    assert any(i["severity"] == "critical" for i in seed["issues"])

    assert len(seed["inventory"]) >= 10
    low_stock_items = [inv for inv in seed["inventory"] if inv.get("is_low_stock")]
    assert len(low_stock_items) >= 3

    assert len(seed["reports"]) >= 2
    assert all("summary_markdown" in rep and "key_metrics" in rep for rep in seed["reports"])


def test_firestore_client_integration(clean_store):
    """Verify that firestore_client.py seamlessly delegates to DataStore."""
    case_record = {
        "case_id": "CASE-TEST-88",
        "news2_score": {"score": 8, "risk_band": "high"},
        "triage_output": {"severity_label": "critical"},
    }
    doc_id = write_audit_record(case_record, actor="orchestrator_test")
    assert doc_id is not None

    recent = get_recent_cases(limit=10)
    assert len(recent) > 0
    found = [c for c in recent if c.get("_id") == doc_id or c.get("case_id") == "CASE-TEST-88"]
    assert len(found) > 0

    single = get_case_by_id(doc_id)
    assert single is not None
    assert single["_actor"] == "orchestrator_test"


def test_thread_safety_concurrency(clean_store):
    """Verify thread-safe in-memory operations under concurrent read/write access."""
    store = clean_store

    def worker_write(i: int):
        store.create("patients", {
            "full_name": f"Concurrent Patient {i}",
            "age": 20 + i,
            "news2_score": i % 10,
        }, doc_id=f"pat_conc_{i}", actor=f"worker_{i}")

    def worker_read(i: int):
        return store.query("patients", filters=[("news2_score", ">=", 5)])

    with concurrent.futures.ThreadPoolExecutor(max_workers=8) as executor:
        write_futures = [executor.submit(worker_write, i) for i in range(50)]
        read_futures = [executor.submit(worker_read, i) for i in range(50)]

        concurrent.futures.wait(write_futures)
        concurrent.futures.wait(read_futures)

    # All 50 writes should be safely recorded without race conditions or index corruption
    assert store.count("patients") >= 50
    for i in range(50):
        doc = store.get("patients", f"pat_conc_{i}")
        assert doc is not None
        assert doc["full_name"] == f"Concurrent Patient {i}"


def test_seed_database_utility():
    """Verify seed_database manager function properly resets and counts collections."""
    store = DataStore(auto_seed=False)
    assert store.count("donors") == 0
    counts = seed_database(store=store, overwrite=True)
    assert counts["donors"] >= 10
    assert counts["hospitals"] >= 14
    assert store.count("donors") == counts["donors"]
