"""
Capacity Sync Tool — Deterministic Python Tool.
Performs data-integrity checks across the network to find discrepancies between expected stock/beds and active records.

Contract: docs/09-parallel-build-contract.md
"""

import datetime
from typing import Dict, Any, List
from lifeline.schemas import CapacitySyncResponse, CapacityDiscrepancy

def run_capacity_sync(store) -> CapacitySyncResponse:
    """
    Check for discrepancies in capacity across the network (pure deterministic logic).
    """
    now_iso = datetime.datetime.utcnow().isoformat() + "Z"
    
    # 1. Fetch current data
    all_hospitals = store.list_all("hospitals")
    all_patients = store.list_all("patients")
    all_requests = store.list_all("requests")
    all_inventory = store.list_all("inventory")
    
    discrepancies: List[CapacityDiscrepancy] = []

    # Map patients by hospital
    patients_by_hosp = {}
    for p in all_patients:
        hosp_id = p.get("assigned_hospital_id")
        if hosp_id:
            patients_by_hosp.setdefault(hosp_id, []).append(p)
            
    # Map inventory by hospital
    inv_by_hosp = {}
    for inv in all_inventory:
        hosp_id = inv.get("hospital_id")
        if hosp_id:
            inv_by_hosp.setdefault(hosp_id, []).append(inv)
            
    # Map requests by hospital
    reqs_by_hosp = {}
    for r in all_requests:
        if r.get("status", "open") != "fulfilled":
            hosp_id = r.get("donation_location", {}).get("hospital_id") or r.get("hospital_id")
            if hosp_id:
                reqs_by_hosp.setdefault(hosp_id, []).append(r)

    hospitals_checked = 0

    for hosp in all_hospitals:
        hosp_id = hosp.get("id") or hosp.get("_id")
        if not hosp_id:
            continue
            
        hospitals_checked += 1
        
        # Check 1: ICU Beds vs Active Patients
        total_icu = hosp.get("total_icu_beds", 0)
        available_icu = hosp.get("icu_beds", 0)
        expected_active_icu = total_icu - available_icu
        
        actual_active_icu = 0
        hosp_patients = patients_by_hosp.get(hosp_id, [])
        for p in hosp_patients:
            if p.get("admission_status") in ["admitted", "inbound", "critical"]:
                actual_active_icu += 1
                
        if expected_active_icu != actual_active_icu:
            discrepancies.append(
                CapacityDiscrepancy(
                    hospital_id=hosp_id,
                    resource_type="icu_beds",
                    expected=expected_active_icu,
                    actual=actual_active_icu,
                    delta=abs(expected_active_icu - actual_active_icu),
                    flag="active_patients_mismatch"
                )
            )
            
        # Check 2: Blood Stock vs Requests
        # If a hospital has active open requests for blood, but their reported stock is high, that's a discrepancy.
        hosp_reqs = reqs_by_hosp.get(hosp_id, [])
        active_blood_reqs = [r for r in hosp_reqs if r.get("type", "").lower() == "blood"]
        
        if active_blood_reqs:
            # Let's say we check if reported O- stock is > 5 while they have an open O- request
            # We don't have detailed blood stock in hospitals by default, so we might check general inventory
            hosp_inv = inv_by_hosp.get(hosp_id, [])
            for item in hosp_inv:
                if item.get("category", "").lower() == "blood":
                    qty = item.get("quantity", 0)
                    bg = item.get("item_name", "").split()[-1] # E.g. "Whole Blood O-"
                    
                    # See if there's an open request for this BG
                    for r in active_blood_reqs:
                        if r.get("blood_group_needed") == bg and qty > 5:
                            discrepancies.append(
                                CapacityDiscrepancy(
                                    hospital_id=hosp_id,
                                    resource_type="blood_stock",
                                    expected="<=5",
                                    actual=qty,
                                    delta=qty,
                                    flag="high_stock_with_open_request"
                                )
                            )

    summary_msg = f"Reconciliation complete across {hospitals_checked} facilities. Found {len(discrepancies)} discrepancies."
    if len(discrepancies) == 0:
        summary_msg = f"Reconciliation complete across {hospitals_checked} facilities. All capacity metrics align."
        
    return CapacitySyncResponse(
        synced_at=now_iso,
        hospitals_checked=hospitals_checked,
        discrepancies=discrepancies,
        summary=summary_msg
    )
