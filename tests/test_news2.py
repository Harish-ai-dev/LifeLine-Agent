"""Run against the 5 scenarios in docs/06-demo-scenarios.md."""
from src.tools.news2 import news2_score
from src.schemas import Vitals


def test_mild_case_low_score():
    v = Vitals(heart_rate=82, respiratory_rate=16, systolic_bp=118, spo2=98, temperature_c=37.0, consciousness="alert")
    result = news2_score(v)
    assert result.risk_band == "low"


def test_critical_cardiac_high_score():
    v = Vitals(heart_rate=118, respiratory_rate=24, systolic_bp=88, spo2=91, temperature_c=38.6, consciousness="alert")
    result = news2_score(v)
    assert result.risk_band == "high"


def test_critical_trauma_high_score():
    v = Vitals(heart_rate=130, respiratory_rate=28, systolic_bp=80, spo2=89, temperature_c=36.2, consciousness="confused")
    result = news2_score(v)
    assert result.risk_band == "high"
