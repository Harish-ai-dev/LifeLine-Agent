#!/usr/bin/env python3
"""
Deploy LifeLine Cloud Agents to Google Cloud Vertex AI Agent Builder.

Prerequisites:
  1. Install: pip install google-cloud-aiplatform
  2. Auth: gcloud auth application-default login
  3. Set project: gcloud config set project lifeline-3725b

Usage:
  python deploy_vertex_ai.py
"""

import json
import os
from pathlib import Path


# Configuration
PROJECT_ID = os.getenv("GCP_PROJECT_ID", "lifeline-3725b")
REGION = os.getenv("CLOUD_RUN_REGION", "us-central1")
AGENTS_DIR = Path(__file__).parent


def load_agent_config(agent_file: str) -> dict:
    """Load agent configuration from JSON file."""
    config_path = AGENTS_DIR / agent_file
    with open(config_path) as f:
        return json.load(f)


def main():
    """Display deployment instructions for all cloud agents."""
    print("=" * 60)
    print("LifeLine Cloud Agent Deployment to Vertex AI")
    print("=" * 60)
    print(f"Project: {PROJECT_ID}")
    print(f"Region:  {REGION}")
    print()
    
    # Agent files
    agent_files = [
        "01-triage-agent.json",
        "02-bed-matching-agent.json",
        "03-routing-agent.json",
        "04-briefing-agent.json",
        "05-report-agent.json",
    ]
    
    print("Agents configured for deployment:")
    print()
    
    for agent_file in agent_files:
        config = load_agent_config(agent_file)
        print(f"Agent: {config['name']}")
        print(f"  Model: {config['model']}")
        print(f"  Description: {config['description'][:80]}...")
        print()
    
    print("=" * 60)
    print("DEPLOYMENT INSTRUCTIONS")
    print("=" * 60)
    print()
    print("1. Install Google Cloud SDK:")
    print("   https://cloud.google.com/sdk/docs/install")
    print()
    print("2. Authenticate:")
    print("   gcloud auth login")
    print()
    print("3. Set project:")
    print(f"   gcloud config set project {PROJECT_ID}")
    print()
    print("4. Enable Vertex AI API:")
    print("   gcloud services enable aiplatform.googleapis.com")
    print()
    print("5. Deploy agents via Console:")
    print("   https://console.cloud.google.com/vertex-ai/agents")
    print()
    print("   For each agent, click 'Create Agent' and paste:")
    print("   - Name: from the JSON file")
    print("   - Description: from the JSON file")
    print("   - Instructions: from the JSON file")
    print("   - Model: select the specified model")
    print("   - Tools: leave disabled")
    print()
    print("=" * 60)


if __name__ == "__main__":
    main()
