# LifeLine Agent — Public Project Website

> **Zero phone calls. Zero hold music. Seconds, not minutes.**  
> Autonomous Multi-Agent Emergency Dispatch & Hospital Coordination on Google Gemini.

[![License: Apache 2.0](https://img.shields.io/badge/License-Apache_2.0-blue.svg)](https://github.com/Harish-ai-dev/LifeLine-Agent/blob/main/LICENSE)
[![Google Gemini Hackathon 2025](https://img.shields.io/badge/Submission-Google_Gemini_AI_Hackathon-cyan)](https://gemini.google.dev)
[![Clinical Protocol: NEWS2](https://img.shields.io/badge/Clinical_Standard-NEWS2_RCP-emerald)](https://www.rcplondon.ac.uk/projects/outputs/national-early-warning-score-news-2)

Official Repository: [https://github.com/Harish-ai-dev/LifeLine-Agent](https://github.com/Harish-ai-dev/LifeLine-Agent)

---

## Overview

LifeLine Agent is an open-source, multi-agent AI system designed to eliminate fatal communication latency in emergency medical dispatch. When acute cardiac, stroke, or polytrauma incidents occur, the golden hour is routinely lost to manual phone calls, scratchpad notes, and hospital capacity uncertainty.

This repository contains the **standalone public marketing and documentation portal** for the LifeLine Agent project, providing hackathon judges, EMS agencies, trauma hospital directors, and open-source contributors with:
1. **Interactive Multi-Agent Scenario Simulator** — step-by-step trace through STEMI, Polytrauma, Sepsis, and Stroke dispatches.
2. **Explicit 6-Agent Roster & Schema Inspector** — model specs, input/output schemas, and system prompt excerpts.
3. **Honest Data Provenance Matrix** — clear documentation of real vs. simulated telemetry.
4. **Systems Architecture & Tech Badges** — Gemini 3.1 Pro, Gemini 3.5 Flash, OSRM, and Cloud Run.
5. **Interactive Demo Video & UI Previews** — 911 Dispatch, EMS Mobile Tablet, and Hospital Trauma Command views.
6. **Live Judge Feedback & Review Board** — real-time evaluation submission backed by PostgreSQL / Supabase.

---

## The 6 Autonomous AI Agents

| Agent Name | Model | Responsibility | Key Input & Output |
| :--- | :--- | :--- | :--- |
| **Triage Agent** | `gemini-3.1-pro` | Deterministic NEWS2 calculation & clinical reasoning | Vitals, ECG, complaint $\rightarrow$ NEWS2 (0-20), Acuity Tier, Required Specialty |
| **Bed-Matching Agent** | `gemini-3.5-flash` | Multi-constraint hospital capability matching | Patient requirements + hospital matrix $\rightarrow$ Ranked facility, bed reservation ID |
| **Routing Agent** | `gemini-3.5-flash` + OSRM | Street network matrices & Code-3 corridor routing | Origin/destination GPS $\rightarrow$ Driving km, siren-adjusted ETA, arrival timestamp |
| **Briefing Agent** | `gemini-3.5-flash` | Plain-language trauma SBAR clinical handoff | Telemetry + NEWS2 + en-route meds $\rightarrow$ Structured SBAR brief & pre-stage checklist |
| **Report Agent** | `gemini-3.5-flash` | Public health & municipal authority daily intel | 24h dispatch logs $\rightarrow$ Hospital stress index, regional diversion analysis |
| **Resource Agent** | `gemini-3.5-flash` | Inter-hospital critical supply & blood bank logistics | Deficit requests $\rightarrow$ Cold-chain transport routing & donor/depot matching |

---

## Real vs. Simulated Data Provenance

| Data Layer | Classification | Live Source | Rationale |
| :--- | :--- | :--- | :--- |
| **Hospital Locations & Coordinates** | 🟢 **100% REAL** | OpenStreetMap Nominatim / Public Registry | Exact GPS coordinates ensure valid geospatial routing. |
| **Road Networks & Travel Times** | 🟢 **100% REAL** | OSRM (Open Source Routing Machine) | Street network turn-by-turn vectors and distance tables. |
| **Clinical NEWS2 Algorithm** | 🟢 **100% REAL** | Royal College of Physicians (UK) | Deterministic scoring conforming to peer-reviewed standard. |
| **AI Agent Reasoning** | 🟢 **100% REAL** | Google Gemini 3.1 Pro & 3.5 Flash | Live API calls returning validated structured JSON schemas. |
| **Hospital Bed Occupancy** | 🟡 **SIMULATED** | Synthetic Hospital State Machine | Protected health operations data modeled via realistic diurnal surge states. |
| **Patient Vitals & Profiles** | 🟣 **SYNTHETIC** | HIPAA-Safe Clinical Scenarios | Zero PHI; textbook emergency scenarios crafted from ATLS/ACLS guidelines. |

---

## Deploying the Public Website

This site is decoupled from the operational product app and has no heavy server dependencies. It can be built and deployed statically or serverlessly.

### Local Development

```bash
# 1. Clone repository
git clone https://github.com/Harish-ai-dev/LifeLine-Agent.git
cd LifeLine-Agent

# 2. Install dependencies
npm install

# 3. Start local development server
npm run dev
```

### Production Build

```bash
# Compile TypeScript and bundle Vite app
npm run build
```

The output files will be created in the `dist/` directory.

### Deploying to Vercel / Netlify / Firebase Hosting

#### Option A: Vercel (Recommended)
```bash
npx vercel --prod
```

---

## License

This project is licensed under the **Apache License 2.0** - see the [LICENSE](https://github.com/Harish-ai-dev/LifeLine-Agent/blob/main/LICENSE) file for details.
