import pytest
from lifeline.agents.issue_classifier_agent import run_issue_classification

def test_issue_classification_deterministic(monkeypatch):
    """Verify fallback keywords map properly without needing Gemini"""
    # Force the fallback by mocking the agent getter to raise an exception
    monkeypatch.setattr("lifeline.agents.issue_classifier_agent._get_issue_classifier_agent", lambda: (_ for _ in ()).throw(Exception("Force offline fallback")))

    # Test critical parsing (generator)
    res = run_issue_classification("Power failure", "The main generator is offline in ICU.", "hosp_01")
    assert res["severity"] == "critical"
    assert res["category"] == "facility" 

    # Test equipment parsing
    res2 = run_issue_classification("Scanner broken", "CT scanner in radiology is down.", "hosp_01")
    assert res2["severity"] == "high"
    assert res2["category"] == "equipment"
    
    # Test IT parsing
    res3 = run_issue_classification("Network issue", "Login system is failing.", "hosp_01")
    assert res3["severity"] == "high"
    assert res3["category"] == "it"

    # Test Staffing parsing
    res4 = run_issue_classification("Nurse shortage", "We are down 3 nurses.", "hosp_01")
    assert res4["severity"] == "high" # default severity (down matches 'high')
    assert res4["category"] == "staffing"
