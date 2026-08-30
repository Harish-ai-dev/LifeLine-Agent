import pytest
from lifeline.agents.capacity_sync_tool import run_capacity_sync

class MockStore:
    def __init__(self):
        self.data = {"hospitals": [], "patients": [], "inventory": [], "requests": []}
    def create(self, collection, doc, **kwargs):
        self.data[collection].append(doc)
    def list_all(self, collection):
        return self.data.get(collection, [])

def test_capacity_sync_tool_deterministic():
    store = MockStore()
    
    # 1. Provide mock hospitals
    store.create("hospitals", {
        "id": "hosp_1",
        "total_icu_beds": 10,
        "icu_beds": 7 # means 3 should be active
    })
    
    # 2. Provide patients (only 2 active for hosp_1, meaning discrepancy of 1)
    store.create("patients", {
        "id": "pat_1",
        "assigned_hospital_id": "hosp_1",
        "admission_status": "admitted"
    })
    store.create("patients", {
        "id": "pat_2",
        "assigned_hospital_id": "hosp_1",
        "admission_status": "admitted"
    })
    
    # 3. Provide inventory (Blood O- is at 10)
    store.create("inventory", {
        "hospital_id": "hosp_1",
        "category": "blood",
        "item_name": "Whole Blood O-",
        "quantity": 10
    })
    
    # 4. Provide requests (Open request for O- blood)
    store.create("requests", {
        "hospital_id": "hosp_1",
        "type": "blood",
        "status": "open",
        "blood_group_needed": "O-"
    })
    
    res = run_capacity_sync(store)
    
    assert res.hospitals_checked == 1
    assert len(res.discrepancies) == 2
    
    types = [d.resource_type for d in res.discrepancies]
    assert "icu_beds" in types
    assert "blood_stock" in types
