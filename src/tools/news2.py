"""
NEWS2 (National Early Warning Score 2) — public clinical scoring standard.
Pure function, no LLM, no external API. Grounds the Triage Agent's
reasoning in a real clinical formula rather than invented numbers.

Reference: Royal College of Physicians. National Early Warning Score (NEWS) 2.
           Updated report of a working party. London: RCP, 2017.
           https://www.rcplondon.ac.uk/projects/outputs/national-early-warning-score-news-2
"""

from src.schemas import Vitals, News2Result


def news2_score(vitals: Vitals) -> News2Result:
    """
    Compute a NEWS2 score from a Vitals object.

    Scoring table (each parameter scored 0–3, total 0–20):
    ┌──────────────────┬────┬────┬────┬────┬────┬────┬────┐
    │ Parameter        │  3 │  2 │  1 │  0 │  1 │  2 │  3 │
    ├──────────────────┼────┼────┼────┼────┼────┼────┼────┤
    │ RR (breaths/min) │≤8  │    │9-11│12-20│   │21-24│≥25│
    │ SpO2 (%)         │≤91 │92-93│94-95│≥96│   │    │   │
    │ Systolic BP(mmHg)│≤90 │91-100│101-110│111-219│  │  │≥220│
    │ Heart rate (bpm) │≤40 │    │41-50│51-90│91-110│111-130│≥131│
    │ Temperature (°C) │≤35.0│   │35.1-36.0│36.1-38.0│38.1-39.0│≥39.1││
    │ Consciousness    │    │    │    │Alert│   │    │CVPU│
    └──────────────────┴────┴────┴────┴────┴────┴────┴────┘

    Risk bands:
      0–4   → low
      5–6   → medium  (or any single parameter scoring 3 → medium)
      ≥7    → high
    """
    score = 0
    max_single = 0  # track highest single-parameter score for escalation rule

    # ── Respiratory Rate ──────────────────────────────────────────────────────
    rr = vitals.respiratory_rate
    if rr <= 8 or rr >= 25:
        p = 3
    elif 21 <= rr <= 24:
        p = 2
    elif 9 <= rr <= 11:
        p = 1
    else:  # 12-20
        p = 0
    score += p
    max_single = max(max_single, p)

    # ── SpO2 ──────────────────────────────────────────────────────────────────
    spo2 = vitals.spo2
    if spo2 <= 91:
        p = 3
    elif spo2 <= 93:
        p = 2
    elif spo2 <= 95:
        p = 1
    else:  # ≥96
        p = 0
    score += p
    max_single = max(max_single, p)

    # ── Systolic BP ───────────────────────────────────────────────────────────
    sbp = vitals.systolic_bp
    if sbp <= 90:
        p = 3
    elif sbp <= 100:
        p = 2
    elif sbp <= 110:
        p = 1
    elif sbp <= 219:
        p = 0
    else:  # ≥220
        p = 3
    score += p
    max_single = max(max_single, p)

    # ── Heart Rate ────────────────────────────────────────────────────────────
    hr = vitals.heart_rate
    if hr <= 40 or hr >= 131:
        p = 3
    elif 111 <= hr <= 130:
        p = 2
    elif 41 <= hr <= 50 or 91 <= hr <= 110:
        p = 1
    else:  # 51-90
        p = 0
    score += p
    max_single = max(max_single, p)

    # ── Temperature ───────────────────────────────────────────────────────────
    temp = vitals.temperature_c
    if temp <= 35.0:
        p = 3
    elif temp >= 39.1:
        p = 2
    elif temp <= 36.0:  # 35.1 – 36.0
        p = 1
    elif temp >= 38.1:  # 38.1 – 39.0
        p = 1
    else:  # 36.1 – 38.0
        p = 0
    score += p
    max_single = max(max_single, p)

    # ── Consciousness (CVPU) ──────────────────────────────────────────────────
    # NEWS2 uses: Alert=0, Confusion/Voice/Pain/Unresponsive=3
    if vitals.consciousness != "alert":
        p = 3
    else:
        p = 0
    score += p
    max_single = max(max_single, p)

    # ── Risk Band ─────────────────────────────────────────────────────────────
    # NEWS2 escalation: if ANY single parameter scores 3 → at least "medium"
    if score >= 7:
        band = "high"
    elif score >= 5 or max_single == 3:
        band = "medium"
    else:
        band = "low"

    return News2Result(score=score, risk_band=band)
