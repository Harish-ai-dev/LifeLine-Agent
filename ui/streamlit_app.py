"""
LifeLine Agent — Streamlit Demo UI
===================================
Dropdown of 5 preset emergency scenarios + Dispatch button.
Each click POSTs the case to the FastAPI backend and renders the full
multi-agent pipeline output (triage → bed-match → routing → briefing).

Run with:
    streamlit run ui/streamlit_app.py
or via the CLI:
    python -m lifeline ui
"""

import json
import sys
import os
from pathlib import Path
import streamlit as st
import requests

# ── Windows UTF-8 ────────────────────────────────────────────────────────────
if sys.platform == "win32":
    try:
        sys.stdout.reconfigure(encoding="utf-8", errors="replace")
        sys.stderr.reconfigure(encoding="utf-8", errors="replace")
    except Exception:
        pass

# ── Resolve paths absolutely so the app works from any working directory ─────
PROJECT_ROOT = Path(__file__).resolve().parent.parent
DEMO_CASES_PATH = PROJECT_ROOT / "data" / "demo_cases.json"

# ── Page Config ──────────────────────────────────────────────────────────────
st.set_page_config(
    page_title="🚑 LifeLine Agent",
    page_icon="🚑",
    layout="wide",
)

st.title("🚑 LifeLine Agent — Emergency Dispatch Demo")
st.caption("Powered by Google ADK · Gemini · OpenStreetMap · OSRM")

# ── Load Scenarios ────────────────────────────────────────────────────────────
if not DEMO_CASES_PATH.exists():
    st.error(
        f"❌ Demo cases file not found: `{DEMO_CASES_PATH}`\n\n"
        "Run `python -m lifeline fetch-hospitals mumbai` and `python -m lifeline seed` first."
    )
    st.stop()

with open(DEMO_CASES_PATH, encoding="utf-8") as f:
    scenarios = json.load(f)

# ── Sidebar: Config ───────────────────────────────────────────────────────────
with st.sidebar:
    st.header("⚙️ Configuration")
    API_URL = st.text_input(
        "Backend API URL",
        value="http://localhost:8000/dispatch",
        help="The FastAPI backend endpoint. Run `python start.py` to start it.",
    )
    st.markdown("---")
    st.subheader("📍 Patient Location")
    st.caption("Mumbai coordinates used for hospital matching")
    patient_lat = st.number_input("Latitude", value=19.0760, format="%.4f")
    patient_lng = st.number_input("Longitude", value=72.8777, format="%.4f")
    st.markdown("---")
    st.info(
        "💡 **Tip**: Make sure the backend is running at the URL above.\n\n"
        "Start all services with:\n```\npython start.py\n```"
    )

# ── Main: Scenario Picker ─────────────────────────────────────────────────────
scenario_name = st.selectbox(
    "📋 Choose an emergency scenario",
    list(scenarios.keys()),
    help="5 pre-defined emergency cases covering mild → critical severity levels",
)

case = scenarios[scenario_name]

col1, col2 = st.columns(2)
with col1:
    st.subheader("🩺 Case Details")
    st.json(case)

# ── Dispatch Button ───────────────────────────────────────────────────────────
with col2:
    st.subheader("🚀 Dispatch")
    st.write(f"**Scenario:** {scenario_name}")
    st.write(f"**Patient Location:** {patient_lat}°N, {patient_lng}°E")

    if st.button("⚡ Run Dispatch Pipeline", type="primary", use_container_width=True):
        # Build the full payload — case data + required patient_location
        payload = {
            **case,
            "patient_location": {"lat": patient_lat, "lng": patient_lng},
        }

        with st.spinner("🔄 Running multi-agent pipeline (Triage → Bed-Match → Routing → Briefing)..."):
            try:
                resp = requests.post(API_URL, json=payload, timeout=120)
                resp.raise_for_status()
                result = resp.json()

                st.success("✅ Dispatch complete!")

                # ── Render results ────────────────────────────────────────────
                tabs = st.tabs(["🏥 Bed Match", "🩺 Triage", "🗺️ Routing", "📋 Briefing", "📊 Full JSON"])

                with tabs[0]:
                    bm = result.get("bed_match", {})
                    chosen = bm.get("chosen_hospital", {})
                    st.metric("🏥 Chosen Hospital", chosen.get("name", "—"))
                    c1, c2 = st.columns(2)
                    c1.metric("📍 Distance", f"{chosen.get('distance_km', '—')} km")
                    c2.metric("⏱️ ETA", f"{chosen.get('eta_minutes', '—')} min")
                    st.write("**Reasoning:**", bm.get("reasoning", "—"))
                    if bm.get("alternatives"):
                        st.write("**Alternatives considered:**")
                        for alt in bm["alternatives"]:
                            st.write(f"- **{alt['name']}**: {alt['reason_not_chosen']}")

                with tabs[1]:
                    tr = result.get("triage", {})
                    severity = tr.get("severity_label", "—").upper()
                    color = {"CRITICAL": "🔴", "MODERATE": "🟡", "MILD": "🟢"}.get(severity, "⚪")
                    st.metric("Severity", f"{color} {severity}")
                    st.metric("Required Specialty", tr.get("required_specialty", "—").capitalize())
                    st.write("**Clinical Notes:**", tr.get("notes", "—"))
                    news2 = result.get("news2", {})
                    st.write(f"**NEWS2 Score:** {news2.get('score', '—')} / 20 — Risk Band: **{news2.get('risk_band', '—').upper()}**")

                with tabs[2]:
                    rt = result.get("routing", {})
                    st.metric("Route Summary", rt.get("route_summary", "—"))
                    st.json(rt)

                with tabs[3]:
                    br = result.get("briefing", {})
                    st.write("**Pre-Arrival Brief:**")
                    st.write(br.get("brief", br.get("briefing_text", json.dumps(br, indent=2))))

                with tabs[4]:
                    st.json(result)

            except requests.exceptions.ConnectionError:
                st.error(
                    "❌ **Cannot connect to the backend.**\n\n"
                    f"Make sure the API is running at `{API_URL}`.\n\n"
                    "Start all services with:\n```\npython start.py\n```"
                )
            except requests.exceptions.Timeout:
                st.error(
                    "⏰ **Request timed out** (120s).\n\n"
                    "The agent pipeline is taking longer than expected. "
                    "Check that your `GEMINI_API_KEY` is set via `python -m lifeline init`."
                )
            except requests.exceptions.HTTPError as e:
                st.error(f"❌ **API Error {resp.status_code}**")
                st.code(resp.text, language="json")
            except Exception as e:
                st.error(f"❌ **Unexpected error:** {e}")
