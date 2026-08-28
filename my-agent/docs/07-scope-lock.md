# 07 — Scope Lock

## In scope (must build)

- Triage Agent (ADK + Gemini, real NEWS2 scoring)
- Bed-Matching Agent (ADK + Gemini, real hospital locations via Google Places, simulated bed data)
- Orchestrator chaining the two above
- Cloud Run deployment
- Firestore audit logging
- Streamlit demo UI with 5 preset scenarios

## Stretch (only if ahead of schedule after Day 2 morning)

- Routing Agent (Google Routes API for real ETA)
- Briefing Agent (Gemini-generated pre-arrival paragraph)

## Explicitly out of scope (do not build, mention only in README "future work")

- Real HL7/FHIR hospital EHR integration
- Real-time bed availability from live hospital systems
- Authentication / user accounts
- Multi-region or multi-city support
- Predictive capacity planning / discharge forecasting
- Human-in-the-loop override UI (mention it as the intended production design, don't build it)
- Any compliance/HIPAA/GDPR implementation (name-check the requirement in README only)

## Rule

If a build task isn't listed under "in scope" or "stretch," it doesn't get built, no matter how good the idea sounds mid-sprint. Add it to the README's future-work section instead.
