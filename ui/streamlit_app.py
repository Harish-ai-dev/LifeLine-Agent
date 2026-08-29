"""
LifeLine Agent — Clinical Emergency Dispatch Command UI
========================================================
Clean, modern hospital-themed interface for autonomous emergency triage,
bed-matching, intelligent ambulance routing, and pre-arrival ER handover.

Run with:
    streamlit run ui/streamlit_app.py
or via CLI:
    python -m lifeline ui
"""

import json
import os
import sys
import time
from pathlib import Path
import streamlit as st
import requests

# ── Windows UTF-8 Invariant ──────────────────────────────────────────────────
if sys.platform == "win32":
    try:
        sys.stdout.reconfigure(encoding="utf-8", errors="replace")
        sys.stderr.reconfigure(encoding="utf-8", errors="replace")
    except Exception:
        pass

# ── Resolve Paths ────────────────────────────────────────────────────────────
PROJECT_ROOT = Path(__file__).resolve().parent.parent
DEMO_CASES_PATH = PROJECT_ROOT / "data" / "demo_cases.json"

# ── Page Configuration ───────────────────────────────────────────────────────
st.set_page_config(
    page_title="LifeLine — Clinical Emergency Command",
    page_icon="🏥",
    layout="wide",
    initial_sidebar_state="collapsed",
)

# ── Hospital / Medical Clinical Theme CSS ────────────────────────────────────
st.markdown(
    """
    <style>
    /* Google Fonts */
    @import url('https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@400;500;600;700;800&family=JetBrains+Mono:wght@400;500;700&display=swap');

    html, body, [class*="css"] {
        font-family: 'Plus Jakarta Sans', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
    }

    /* Background and containers */
    .stApp {
        background: linear-gradient(180deg, #f0f6fc 0%, #f8fafc 100%);
    }

    /* Main Header Card */
    .hospital-header {
        background: linear-gradient(135deg, #092c4c 0%, #0f3d68 50%, #0369a1 100%);
        color: white;
        padding: 24px 32px;
        border-radius: 16px;
        box-shadow: 0 10px 25px -5px rgba(3, 105, 161, 0.2), 0 8px 10px -6px rgba(3, 105, 161, 0.1);
        margin-bottom: 24px;
        display: flex;
        align-items: center;
        justify-content: space-between;
        border-left: 6px solid #38bdf8;
    }

    .hospital-title {
        font-size: 26px;
        font-weight: 800;
        letter-spacing: -0.5px;
        margin: 0;
        display: flex;
        align-items: center;
        gap: 12px;
    }

    .hospital-subtitle {
        font-size: 14px;
        color: #bae6fd;
        margin-top: 4px;
        font-weight: 500;
    }

    /* Status Pill */
    .status-pill {
        display: inline-flex;
        align-items: center;
        gap: 6px;
        padding: 6px 14px;
        border-radius: 9999px;
        font-size: 12px;
        font-weight: 700;
        letter-spacing: 0.5px;
        text-transform: uppercase;
    }
    .status-online {
        background-color: rgba(16, 185, 129, 0.15);
        color: #10b981;
        border: 1px solid rgba(16, 185, 129, 0.3);
    }
    .status-offline {
        background-color: rgba(239, 68, 68, 0.15);
        color: #ef4444;
        border: 1px solid rgba(239, 68, 68, 0.3);
    }

    /* Medical Card Containers */
    .med-card {
        background: #ffffff;
        border-radius: 14px;
        padding: 20px;
        border: 1px solid #e2e8f0;
        box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.05), 0 2px 4px -2px rgba(0, 0, 0, 0.03);
        margin-bottom: 20px;
    }

    .med-card-header {
        font-size: 16px;
        font-weight: 700;
        color: #0f172a;
        margin-bottom: 14px;
        display: flex;
        align-items: center;
        gap: 8px;
        border-bottom: 1px solid #f1f5f9;
        padding-bottom: 10px;
    }

    /* Vitals Grid */
    .vitals-grid {
        display: grid;
        grid-template-columns: repeat(3, 1fr);
        gap: 12px;
        margin-top: 10px;
    }

    .vital-box {
        background: #f8fafc;
        border: 1px solid #e2e8f0;
        border-radius: 10px;
        padding: 12px;
        text-align: center;
    }

    .vital-label {
        font-size: 11px;
        font-weight: 600;
        color: #64748b;
        text-transform: uppercase;
        letter-spacing: 0.5px;
    }

    .vital-value {
        font-size: 18px;
        font-weight: 800;
        color: #0f172a;
        margin-top: 2px;
        font-family: 'JetBrains Mono', monospace;
    }

    .vital-unit {
        font-size: 11px;
        color: #94a3b8;
        font-weight: 500;
    }

    /* Severity Badges */
    .badge-critical {
        background: #fee2e2;
        color: #991b1b;
        border: 1px solid #f87171;
        padding: 4px 10px;
        border-radius: 6px;
        font-weight: 700;
        font-size: 13px;
        display: inline-block;
    }
    .badge-moderate {
        background: #fef3c7;
        color: #92400e;
        border: 1px solid #fbbf24;
        padding: 4px 10px;
        border-radius: 6px;
        font-weight: 700;
        font-size: 13px;
        display: inline-block;
    }
    .badge-mild {
        background: #d1fae5;
        color: #065f46;
        border: 1px solid #34d399;
        padding: 4px 10px;
        border-radius: 6px;
        font-weight: 700;
        font-size: 13px;
        display: inline-block;
    }

    /* Destination Hospital Hero Banner */
    .dest-hero {
        background: linear-gradient(135deg, #0284c7 0%, #0369a1 100%);
        color: white;
        border-radius: 12px;
        padding: 20px;
        margin-bottom: 20px;
        box-shadow: 0 8px 16px -4px rgba(2, 132, 199, 0.3);
    }
    .dest-hospital-name {
        font-size: 22px;
        font-weight: 800;
        letter-spacing: -0.3px;
    }
    .dest-meta {
        display: flex;
        gap: 20px;
        margin-top: 12px;
        font-size: 15px;
        font-weight: 600;
    }
    .dest-meta-item {
        background: rgba(255, 255, 255, 0.15);
        padding: 6px 14px;
        border-radius: 8px;
        display: inline-flex;
        align-items: center;
        gap: 6px;
    }

    /* Clinical Brief SBAR */
    .sbar-container {
        background: #f8fafc;
        border-left: 4px solid #0284c7;
        border-radius: 0 10px 10px 0;
        padding: 16px 20px;
        font-size: 14px;
        line-height: 1.6;
        color: #1e293b;
        margin-top: 10px;
    }

    /* Buttons */
    .stButton>button {
        border-radius: 10px;
        font-weight: 700;
        font-size: 15px;
        padding: 12px 24px;
        transition: all 0.2s ease;
    }
    </style>
    """,
    unsafe_allow_html=True,
)

# ── Health Check Helper ──────────────────────────────────────────────────────
API_BASE = os.environ.get("LIFELINE_API_URL", "http://localhost:8000")
DISPATCH_URL = f"{API_BASE}/dispatch"


@st.cache_data(ttl=5)
def check_backend_status(url: str) -> bool:
    try:
        r = requests.get(f"{url}/health", timeout=2)
        return r.status_code == 200
    except Exception:
        return False


backend_alive = check_backend_status(API_BASE)

# ── Top Header ───────────────────────────────────────────────────────────────
status_class = "status-online" if backend_alive else "status-offline"
status_text = "🟢 System Ready" if backend_alive else "🔴 API Offline (run start.py)"

st.markdown(
    f"""
    <div class="hospital-header">
        <div>
            <h1 class="hospital-title">🏥 LifeLine Clinical Command</h1>
            <div class="hospital-subtitle">Autonomous Emergency Triage, Bed Allocation & Pre-Arrival Hospital Handover</div>
        </div>
        <div class="status-pill {status_class}">
            {status_text}
        </div>
    </div>
    """,
    unsafe_allow_html=True,
)

# ── Load Preset Scenarios ────────────────────────────────────────────────────
if not DEMO_CASES_PATH.exists():
    st.error(
        f"❌ Demo scenarios file not found at `{DEMO_CASES_PATH}`.\n\n"
        "Run `python -m lifeline fetch-hospitals mumbai` and `python -m lifeline seed`."
    )
    st.stop()

with open(DEMO_CASES_PATH, encoding="utf-8") as f:
    scenarios = json.load(f)

# ── Layout: Two Columns (Intake on Left, Results on Right) ───────────────────
col_intake, col_display = st.columns([1, 1.4], gap="large")

# ══════════════════════════════════════════════════════════════════════════════
# LEFT COLUMN: Patient Intake & Telemetry
# ══════════════════════════════════════════════════════════════════════════════
with col_intake:
    st.markdown(
        """
        <div class="med-card-header" style="font-size: 18px; color: #0284c7;">
            📋 Emergency Patient Intake
        </div>
        """,
        unsafe_allow_html=True,
    )

    # Preset Selector with clinical descriptions
    scenario_keys = list(scenarios.keys())
    selected_scenario = st.selectbox(
        "Select Emergency Preset",
        scenario_keys,
        index=2,  # Default to Critical Cardiac
        help="Select a clinical scenario to automatically populate patient vitals and symptoms",
    )

    current_case = scenarios[selected_scenario]
    vitals = current_case.get("vitals", {})

    # Display Vitals in Medical Monitor format
    st.markdown(
        f"""
        <div class="med-card" style="background: #0f172a; color: white; border: 1px solid #1e293b;">
            <div style="display: flex; justify-content: space-between; align-items: center; border-bottom: 1px solid #334155; padding-bottom: 8px; margin-bottom: 12px;">
                <span style="font-weight: 700; color: #38bdf8; font-size: 13px; text-transform: uppercase; letter-spacing: 1px;">
                    🫀 Live Patient Monitor
                </span>
                <span style="font-size: 13px; color: #94a3b8;">Age: <strong>{current_case.get('patient_age', '—')} yrs</strong></span>
            </div>
            <div class="vitals-grid">
                <div class="vital-box" style="background: #1e293b; border-color: #334155;">
                    <div class="vital-label" style="color: #f87171;">Heart Rate</div>
                    <div class="vital-value" style="color: #fca5a5;">{vitals.get('heart_rate', '—')}</div>
                    <div class="vital-unit">bpm</div>
                </div>
                <div class="vital-box" style="background: #1e293b; border-color: #334155;">
                    <div class="vital-label" style="color: #60a5fa;">Blood Pressure</div>
                    <div class="vital-value" style="color: #93c5fd;">{vitals.get('systolic_bp', '—')}</div>
                    <div class="vital-unit">mmHg (Sys)</div>
                </div>
                <div class="vital-box" style="background: #1e293b; border-color: #334155;">
                    <div class="vital-label" style="color: #34d399;">SpO2 Sat</div>
                    <div class="vital-value" style="color: #6ee7b7;">{vitals.get('spo2', '—')}</div>
                    <div class="vital-unit">%</div>
                </div>
                <div class="vital-box" style="background: #1e293b; border-color: #334155;">
                    <div class="vital-label" style="color: #fbbf24;">Resp Rate</div>
                    <div class="vital-value" style="color: #fde68a;">{vitals.get('respiratory_rate', '—')}</div>
                    <div class="vital-unit">breaths/min</div>
                </div>
                <div class="vital-box" style="background: #1e293b; border-color: #334155;">
                    <div class="vital-label" style="color: #c084fc;">Temperature</div>
                    <div class="vital-value" style="color: #e9d5ff;">{vitals.get('temperature_c', '—')}</div>
                    <div class="vital-unit">°C</div>
                </div>
                <div class="vital-box" style="background: #1e293b; border-color: #334155;">
                    <div class="vital-label" style="color: #38bdf8;">Consciousness</div>
                    <div class="vital-value" style="color: #bae6fd; font-size: 14px; text-transform: uppercase;">
                        {vitals.get('consciousness', 'ALERT')}
                    </div>
                    <div class="vital-unit">AVPU scale</div>
                </div>
            </div>
            <div style="margin-top: 14px; padding-top: 10px; border-top: 1px solid #334155; font-size: 13px;">
                <div style="color: #94a3b8;">Chief Complaint: <strong style="color: #f1f5f9;">{current_case.get('chief_complaint', 'None')}</strong></div>
                <div style="color: #94a3b8; margin-top: 4px;">Mechanism: <strong style="color: #f1f5f9;">{current_case.get('mechanism_of_injury') or 'Non-traumatic / Medical'}</strong></div>
            </div>
        </div>
        """,
        unsafe_allow_html=True,
    )

    # Location & Dispatch Controls
    st.markdown(
        """
        <div class="med-card">
            <div class="med-card-header">
                📍 Incident Coordinates & Dispatch Settings
            </div>
        """,
        unsafe_allow_html=True,
    )

    loc_presets = {
        "Mumbai — Dadar Central (Default)": (19.0178, 72.8478),
        "Mumbai — Bandra Kurla Complex (BKC)": (19.0657, 72.8687),
        "Mumbai — Andheri East Hub": (19.1136, 72.8697),
        "Mumbai — South Mumbai / Colaba": (18.9067, 72.8147),
        "Mumbai — Custom Coordinates": (
            current_case.get("patient_location", {}).get("lat", 19.0760),
            current_case.get("patient_location", {}).get("lng", 72.8777),
        ),
    }

    selected_loc_name = st.selectbox(
        "Incident Location Landmark",
        list(loc_presets.keys()),
        index=0,
    )
    def_lat, def_lng = loc_presets[selected_loc_name]

    c_lat, c_lng = st.columns(2)
    with c_lat:
        p_lat = st.number_input("Latitude (°N)", value=def_lat, format="%.4f")
    with c_lng:
        p_lng = st.number_input("Longitude (°E)", value=def_lng, format="%.4f")

    st.markdown("</div>", unsafe_allow_html=True)

    # Dispatch Trigger Button
    dispatch_clicked = st.button(
        "🚑 INITIATE EMERGENCY DISPATCH",
        type="primary",
        use_container_width=True,
    )


# ══════════════════════════════════════════════════════════════════════════════
# RIGHT COLUMN: Multi-Agent Decision Hub
# ══════════════════════════════════════════════════════════════════════════════
with col_display:
    st.markdown(
        """
        <div class="med-card-header" style="font-size: 18px; color: #0284c7;">
            ⚡ Autonomous Agent Decision Trail
        </div>
        """,
        unsafe_allow_html=True,
    )

    if not dispatch_clicked and "last_result" not in st.session_state:
        # Default placeholder when awaiting dispatch
        st.markdown(
            """
            <div class="med-card" style="text-align: center; padding: 48px 24px; border: 2px dashed #cbd5e1;">
                <div style="font-size: 48px; margin-bottom: 12px;">🚑</div>
                <div style="font-size: 18px; font-weight: 700; color: #334155;">Ready for Emergency Dispatch</div>
                <div style="font-size: 14px; color: #64748b; max-width: 420px; margin: 8px auto;">
                    Select an emergency scenario on the left and click <strong>Initiate Emergency Dispatch</strong> to run the multi-agent pipeline:
                </div>
                <div style="display: flex; justify-content: center; gap: 10px; margin-top: 20px; flex-wrap: wrap;">
                    <span style="background: #e0f2fe; color: #0369a1; padding: 6px 12px; border-radius: 6px; font-size: 12px; font-weight: 600;">1. Clinical NEWS2</span>
                    <span style="background: #e0f2fe; color: #0369a1; padding: 6px 12px; border-radius: 6px; font-size: 12px; font-weight: 600;">2. Triage Reasoning</span>
                    <span style="background: #e0f2fe; color: #0369a1; padding: 6px 12px; border-radius: 6px; font-size: 12px; font-weight: 600;">3. Bed-Match & ETA</span>
                    <span style="background: #e0f2fe; color: #0369a1; padding: 6px 12px; border-radius: 6px; font-size: 12px; font-weight: 600;">4. ER SBAR Handover</span>
                </div>
            </div>
            """,
            unsafe_allow_html=True,
        )

    else:
        # Execute or retrieve cached dispatch
        if dispatch_clicked:
            payload = {
                **current_case,
                "patient_location": {"lat": p_lat, "lng": p_lng},
            }

            with st.spinner("🏥 Engaging Multi-Agent Network (NEWS2 → Triage → Bed-Match → Routing → Briefing)..."):
                try:
                    resp = requests.post(DISPATCH_URL, json=payload, timeout=120)
                    resp.raise_for_status()
                    st.session_state["last_result"] = resp.json()
                except requests.exceptions.ConnectionError:
                    st.error(
                        f"❌ **Connection Refused**: Cannot reach backend at `{DISPATCH_URL}`.\n\n"
                        "Make sure the backend server is running via `python start.py`."
                    )
                    st.stop()
                except requests.exceptions.HTTPError as e:
                    st.error(f"❌ **API Error {resp.status_code}**: {resp.text}")
                    st.stop()
                except Exception as ex:
                    st.error(f"❌ **Unexpected Error**: {ex}")
                    st.stop()

        result = st.session_state.get("last_result", {})

        if result:
            triage_data = result.get("triage", {})
            bed_match_data = result.get("bed_match", {})
            chosen_hospital = bed_match_data.get("chosen_hospital", {})
            news2_data = result.get("news2", {})
            routing_data = result.get("routing", {})
            briefing_data = result.get("briefing", {})

            # ── Destination Hospital Hero ─────────────────────────────────────
            eta_val = chosen_hospital.get("eta_minutes") or routing_data.get("eta_minutes", "—")
            dist_val = chosen_hospital.get("distance_km") or routing_data.get("distance_km", "—")
            hosp_name = chosen_hospital.get("name", "Nearest Facility")

            st.markdown(
                f"""
                <div class="dest-hero">
                    <div style="font-size: 12px; font-weight: 700; text-transform: uppercase; letter-spacing: 1px; color: #bae6fd;">
                        🎯 Allocated Primary Receiving Facility
                    </div>
                    <div class="dest-hospital-name">
                        🏥 {hosp_name}
                    </div>
                    <div class="dest-meta">
                        <div class="dest-meta-item">⏱️ Driving ETA: <strong>{eta_val} mins</strong></div>
                        <div class="dest-meta-item">📍 Distance: <strong>{dist_val} km</strong></div>
                        <div class="dest-meta-item">🩺 Specialty: <strong>{triage_data.get('required_specialty', 'Emergency').upper()}</strong></div>
                    </div>
                </div>
                """,
                unsafe_allow_html=True,
            )

            # ── Tabs for Clean Hospital Information Breakdown ────────────────
            tab_bed, tab_triage, tab_sbar, tab_route, tab_audit = st.tabs([
                "🏥 Bed Allocation",
                "🩺 Clinical Triage",
                "📋 ER Handover (SBAR)",
                "🗺️ Live Navigation",
                "🔒 Audit Trail",
            ])

            # TAB 1: BED MATCHING
            with tab_bed:
                st.markdown(
                    f"""
                    <div class="med-card">
                        <div class="med-card-header">💡 Allocation Rationale & Reasoning</div>
                        <div style="font-size: 14px; line-height: 1.6; color: #334155;">
                            {bed_match_data.get('reasoning', 'Selected based on optimal balance of specialized clinical capability and lowest transit ETA.')}
                        </div>
                    </div>
                    """,
                    unsafe_allow_html=True,
                )

                # Alternative Hospitals Table
                alts = bed_match_data.get("alternatives", [])
                if alts:
                    st.markdown("<div style='font-weight: 700; font-size: 14px; margin-bottom: 8px; color: #475569;'>Alternative Facilities Evaluated</div>", unsafe_allow_html=True)
                    for alt in alts:
                        st.markdown(
                            f"""
                            <div style="background: #ffffff; border: 1px solid #e2e8f0; border-radius: 8px; padding: 10px 14px; margin-bottom: 8px; font-size: 13px;">
                                <strong style="color: #0f172a;">{alt.get('name', 'Hospital')}</strong>: <span style="color: #64748b;">{alt.get('reason_not_chosen', 'Higher ETA / Specialty mismatch')}</span>
                            </div>
                            """,
                            unsafe_allow_html=True,
                        )

            # TAB 2: CLINICAL TRIAGE
            with tab_triage:
                severity = triage_data.get("severity_label", "moderate").upper()
                badge_class = {
                    "CRITICAL": "badge-critical",
                    "MODERATE": "badge-moderate",
                    "MILD": "badge-mild",
                }.get(severity, "badge-moderate")

                score_val = news2_data.get("score", "—")
                risk_band = news2_data.get("risk_band", "—").upper()

                st.markdown(
                    f"""
                    <div class="med-card">
                        <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 14px;">
                            <div>
                                <span class="{badge_class}">{severity} SEVERITY</span>
                                <span style="margin-left: 8px; font-size: 13px; font-weight: 600; color: #475569;">
                                    Target Dept: <strong>{triage_data.get('required_specialty', 'General').upper()}</strong>
                                </span>
                            </div>
                            <div style="background: #f1f5f9; padding: 4px 12px; border-radius: 6px; font-size: 13px; font-weight: 700; color: #0f172a;">
                                NEWS2: {score_val}/20 ({risk_band})
                            </div>
                        </div>
                        <div class="med-card-header" style="border: none; padding: 0; margin-bottom: 6px;">🩺 Clinical Assessment Notes</div>
                        <div style="font-size: 14px; line-height: 1.6; color: #334155; background: #f8fafc; padding: 12px; border-radius: 8px; border: 1px solid #e2e8f0;">
                            {triage_data.get('notes', 'Patient requires prioritized intake based on calculated vital parameters.')}
                        </div>
                    </div>
                    """,
                    unsafe_allow_html=True,
                )

            # TAB 3: ER SBAR BRIEFING
            with tab_sbar:
                brief_text = briefing_data.get("pre_arrival_brief") or briefing_data.get("brief") or "Incoming patient en route."
                st.markdown(
                    f"""
                    <div class="med-card">
                        <div class="med-card-header">📋 Emergency Department Pre-Arrival Radio Protocol</div>
                        <div class="sbar-container">
                            <strong>[SBAR ER INCOMING BRIEF]</strong><br><br>
                            {brief_text}
                        </div>
                        <div style="margin-top: 12px; font-size: 12px; color: #64748b;">
                            ⚡ Broadcast automatically to destination resuscitation trauma bay ahead of ambulance arrival.
                        </div>
                    </div>
                    """,
                    unsafe_allow_html=True,
                )

            # TAB 4: LIVE ROUTING
            with tab_route:
                st.markdown(
                    f"""
                    <div class="med-card">
                        <div class="med-card-header">🗺️ Road Navigation & Traffic Summary</div>
                        <div style="font-size: 15px; font-weight: 700; color: #0284c7; margin-bottom: 6px;">
                            {routing_data.get('route_summary', f'{dist_val} km drive · approx {eta_val} min by road')}
                        </div>
                        <div style="font-size: 13px; color: #64748b;">
                            Source: OpenStreetMap + OSRM Real-Time Road Driving Matrix
                        </div>
                    </div>
                    """,
                    unsafe_allow_html=True,
                )

            # TAB 5: AUDIT TRAIL
            with tab_audit:
                audit_id = result.get("audit_id", "offline_dev_mode")
                st.markdown(
                    f"""
                    <div class="med-card">
                        <div class="med-card-header">🔒 Immutable Clinical Audit Record</div>
                        <div style="font-size: 13px; color: #475569; margin-bottom: 12px;">
                            Record ID: <code style="background: #f1f5f9; padding: 2px 8px; border-radius: 4px; color: #0369a1;">{audit_id}</code>
                        </div>
                    </div>
                    """,
                    unsafe_allow_html=True,
                )
                with st.expander("View Complete Raw JSON Telemetry"):
                    st.json(result)
