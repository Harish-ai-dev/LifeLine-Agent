# Cloud Agent Builder Configurations

This directory contains the 5 cloud agent configurations for deployment to Google Cloud Vertex AI Agent Builder.

## Agent Overview

| Agent | Model | Purpose |
|-------|-------|---------|
| TriageAgent | gemini-3.1-pro | Clinical reasoning for severity and specialty determination |
| BedMatchingAgent | gemini-3.5-flash | Hospital selection based on specialty, beds, and distance |
| RoutingAgent | gemini-3.5-flash | ETA and route summary from OSRM data |
| BriefingAgent | gemini-3.5-flash | Pre-arrival SBAR clinical handoff |
| ReportAgent | gemini-3.5-flash | Daily intelligence briefing and NL queries |

## Files

- `01-triage-agent.json` - Triage Agent configuration
- `02-bed-matching-agent.json` - Bed Matching Agent configuration
- `03-routing-agent.json` - Routing Agent configuration
- `04-briefing-agent.json` - Briefing Agent configuration
- `05-report-agent.json` - Report Agent configuration
- `deploy.sh` - Shell script for deployment setup
- `deploy_vertex_ai.py` - Python deployment script

## Deployment to Vertex AI Agent Builder

### Prerequisites

1. Install Google Cloud SDK: https://cloud.google.com/sdk/docs/install
2. Authenticate: `gcloud auth application-default login`
3. Set project: `gcloud config set project lifeline-3725b`

### Quick Start

```bash
cd cloud-agents
chmod +x deploy.sh
./deploy.sh
```

### Manual Deployment

1. Go to: https://console.cloud.google.com/vertex-ai/agents
2. Click "Create Agent"
3. For each agent, paste from the JSON files:
   - **Name**: Agent name from JSON
   - **Description**: Agent description from JSON
   - **Instructions**: Agent instructions from JSON
   - **Model**: Select the specified model (gemini-3.1-pro or gemini-3.5-flash)
   - **Tools**: Leave disabled (agents reason over pre-computed data)

## Integration with FastAPI Backend

These cloud agents are designed to be invoked via API calls. The backend should:

1. Pre-compute all necessary data (NEWS2 scores, OSRM routes, hospital capacity)
2. Pass data as structured input matching the agent's `input_schema`
3. Receive JSON responses matching the agent's `output_schema`

## Local vs Cloud Agents

The `lifeline/agents/` directory contains Python ADK agents that can run locally.
These cloud agent configs are for deploying to Vertex AI Agent Builder.

**Key difference**: Cloud agents receive pre-computed data and reason over it; local agents may compute data themselves.
