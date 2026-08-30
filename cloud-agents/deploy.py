#!/usr/bin/env python3
"""
Deploy LifeLine Cloud Agents to Google Cloud Vertex AI Agent Builder.
"""

import json
import os
from pathlib import Path

# Configuration
PROJECT_ID = "lifeline-agent-3725b"
REGION = "us-central1"
AGENTS_DIR = Path(__file__).parent


def load_agent_config(agent_file: str) -> dict:
    """Load agent configuration from JSON file."""
    config_path = AGENTS_DIR / agent_file
    with open(config_path) as f:
        return json.load(f)


def deploy_agents():
    """Deploy all agents to Vertex AI Agent Builder."""
    
    print("=" * 60)
    print("Deploying LifeLine Cloud Agents to Vertex AI")
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
    
    for agent_file in agent_files:
        config = load_agent_config(agent_file)
        print(f"✓ Loaded: {config['name']} ({config['model']})")
    
    print()
    print("=" * 60)
    print("Agent configurations ready!")
    print("=" * 60)
    print()
    print("To deploy via web console:")
    print(f"1. Go to: https://console.cloud.google.com/vertex-ai/agents?project={PROJECT_ID}")
    print("2. Click '+ New agent' → 'Agent Studio'")
    print("3. Create each agent with the configurations from the JSON files")
    print()
    print("Or deploy using the Python SDK (requires pip install google-cloud-aiplatform)")
    print()


if __name__ == "__main__":
    deploy_agents()
