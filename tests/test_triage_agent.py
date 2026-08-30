"""Tests for Triage Agent schemas and prompt generation."""
from lifeline.schemas import Case, Vitals, TriageInput, News2Result, TriageOutput
from lifeline.agents.triage_agent import _build_triage_prompt


def test_triage_prompt_builder():
    v = Vitals(heart_rate=120, respiratory_rate=26, systolic_bp=85, spo2=90, temperature_c=38.5, consciousness="alert")
    t_input = TriageInput(
        patient_age=55,
        vitals=v,
        chief_complaint="acute crushing chest pain",
        mechanism_of_injury=None,
        news2_score=News2Result(score=10, risk_band="high"),
    )
    prompt = _build_triage_prompt(t_input)
    assert "acute crushing chest pain" in prompt
    assert "Score:     10 / 20" in prompt
    assert "HIGH" in prompt


def test_triage_output_schema():
    data = {
        "severity_label": "critical",
        "required_specialty": "cardiac",
        "notes": "Patient presents with classic STEMI symptoms and high NEWS2.",
    }
    out = TriageOutput(**data)
    assert out.severity_label == "critical"
    assert out.required_specialty == "cardiac"
