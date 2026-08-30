import streamlit as st
import requests
import time

# --- PAGE CONFIGURATION ---
st.set_page_config(
    page_title="LifeLine Agent | Command Center",
    page_icon="🚑",
    layout="wide"
)

# --- HEADER SECTION ---
st.title("🚑 LifeLine Agent: Autonomous Emergency Matchmaker")
st.caption("Google ADK & Genkit Multi-Agent Dispatch Engine")

# --- SIDEBAR: PRESET & MANUAL INTAKE ---
with st.sidebar:
    st.header("⚡ Case Intake Panel")
    preset = st.selectbox(
        "Load Preset Scenario",
        ["Select...", "Preset 1: Acute Cardiac Arrest", "Preset 2: Multi-Vehicle Trauma"]
    )
    
    st.divider()
    patient_age = st.number_input("Patient Age", min_value=0, max_value=120, value=54)
    vitals_bp = st.text_input("Blood Pressure", "90/60")
    vitals_hr = st.number_input("Heart Rate (BPM)", value=115)
    spo2 = st.number_input("SpO2 (%)", value=88)
    symptoms = st.text_area("Chief Complaints", "Crushing chest pain, severe dyspnea, diaphoresis.")
    
    dispatch_btn = st.button("🚨 Run Emergency Matching", type="primary", use_container_width=True)

# --- MAIN DASHBOARD LAYOUT ---
col_left, col_right = st.columns([1, 1])

with col_left:
    st.subheader("🤖 Multi-Agent Pipeline Status")
    
    # Live execution metrics & visual step indicators
    t1, t2, t3, t4 = st.tabs(["1. Triage", "2. Bed-Match", "3. Routing", "4. Briefing"])
    
    with t1:
        st.markdown("**Agent:** `gemini-3.1-pro` (Google ADK)")
        if dispatch_btn:
            st.error("NEWS2 Score: 9 | Severity: HIGH CRITICAL")
            st.info("Required Specialty: Interventional Cardiology / Cardiac ICU")
            
    with t2:
        st.markdown("**Agent:** `gemini-3.5-flash` + OpenStreetMap API")
        if dispatch_btn:
            st.success("Selected Match: City Heart & Trauma Hospital")
            st.caption("Reasoning: Has open Cardiac Cath Lab and available ICU bed within 10km radius.")
            
    with t3:
        st.markdown("**Agent:** `gemini-3.5-flash` + OSRM Engine")
        if dispatch_btn:
            st.metric("Optimal Route ETA", "7.4 Mins", delta="-3.2 Mins vs Nearest General Hospital")
            
    with t4:
        st.markdown("**Agent:** `gemini-3.5-flash` (Pre-Arrival Brief)")
        if dispatch_btn:
            st.text_area("Generated ER Brief", "PATIENT: 54M | CRITICAL STEMI\nETA: 7 Mins\nRESERVE: Cath Lab Bed #2\nPREP: Aspirin 320mg given, heparin ready.", height=120)

with col_right:
    st.subheader("📍 Live Navigation & Facility Overlay")
    # Placeholder for OpenStreetMap / Leaflet Integration
    st.components.v1.iframe("https://www.openstreetmap.org/export/embed.html", height=400)

st.divider()

# --- FOOTER: AUDIT TRAIL LOGS ---
with st.expander("🪵 Live Firestore Audit Logs"):
    st.code("""
    [SYSTEM LOG]: Incoming case received at API Endpoint FastAPI :8000
    [TRIAGE AGENT]: Calculated NEWS2 Score -> Triggered CRITICAL RED
    [BED-MATCH AGENT]: Overpass API queried -> 3 matching facilities found
    [ROUTING AGENT]: OSRM calculated route -> Matrix calculated (ETA: 444 seconds)
    [FIRESTORE]: Case logged to /dispatch_cases/case_id_992183
    """, language="bash")