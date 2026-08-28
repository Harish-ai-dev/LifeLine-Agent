"""
Streamlit demo UI — dropdown of preset scenarios (docs/06-demo-scenarios.md)
+ Dispatch button + live log of each agent's output.
Run with: streamlit run ui/streamlit_app.py
"""
import json
import streamlit as st
import requests

st.set_page_config(page_title="LifeLine Agent", layout="wide")
st.title("LifeLine Agent — Emergency Dispatch Demo")

# TODO: load the 5 scenarios from docs/06-demo-scenarios.md (copy into a
# data/demo_cases.json file so this doesn't parse markdown at runtime)
with open("data/demo_cases.json") as f:
    scenarios = json.load(f)

scenario_name = st.selectbox("Choose a scenario", list(scenarios.keys()))
API_URL = st.text_input("API URL", "http://localhost:8000/dispatch")

if st.button("Dispatch"):
    case = scenarios[scenario_name]
    with st.spinner("Running agents..."):
        # TODO: call API_URL, stream/display each agent's output as it
        # completes rather than waiting for the full response
        resp = requests.post(API_URL, json=case)
        st.json(resp.json())
