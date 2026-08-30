#!/bin/bash
# Deploy LifeLine Cloud Agents to Google Cloud Vertex AI Agent Builder
set -e

# Configuration
PROJECT_ID="${GCP_PROJECT_ID:-lifeline-3725b}"
REGION="${CLOUD_RUN_REGION:-us-central1}"
SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"

echo "============================================================"
echo "LifeLine Cloud Agent Deployment to Vertex AI"
echo "============================================================"
echo "Project: $PROJECT_ID"
echo "Region:  $REGION"
echo ""

# Check prerequisites
echo "Checking prerequisites..."
command -v gcloud >/dev/null 2>&1 || { echo "Error: gcloud CLI not found. Install: https://cloud.google.com/sdk/docs/install"; exit 1; }

# Set project
echo "Setting GCP project..."
gcloud config set project "$PROJECT_ID"

# Enable required APIs
echo "Enabling Vertex AI API..."
gcloud services enable aiplatform.googleapis.com --project="$PROJECT_ID"

echo ""
echo "============================================================"
echo "Agent Configurations Ready"
echo "============================================================"
echo ""
echo "The following agents are configured for deployment:"
echo ""

# List agent configs
for config_file in "$SCRIPT_DIR"/0*-*.json; do
    if [ -f "$config_file" ]; then
        name=$(python3 -c "import json; print(json.load(open('$config_file'))['name'])" 2>/dev/null || basename "$config_file" .json)
        model=$(python3 -c "import json; print(json.load(open('$config_file'))['model'])" 2>/dev/null || echo "unknown")
        echo "  - $name ($model)"
    fi
done

echo ""
echo "============================================================"
echo "Manual Deployment Steps"
echo "============================================================"
echo ""
echo "To deploy these agents to Vertex AI Agent Builder:"
echo ""
echo "1. Go to: https://console.cloud.google.com/vertex-ai/agents"
echo ""
echo "2. For each agent, click 'Create Agent' and paste:"
echo "   - Name: from the JSON file"
echo "   - Description: from the JSON file"
echo "   - Instructions: from the JSON file"
echo "   - Model: select the specified model"
echo "   - Tools: leave disabled"
echo ""
echo "3. Or run the Python deployment script:"
echo "   cd $SCRIPT_DIR"
echo "   python deploy_vertex_ai.py"
echo ""
echo "============================================================"
