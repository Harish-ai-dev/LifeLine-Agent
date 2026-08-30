@echo off
REM Deploy all 5 LifeLine agents to Vertex AI Agent Builder
REM Run this after gcloud is in PATH

set PROJECT_ID=lifeline-3725b
set REGION=us-central1

echo ============================================
echo LifeLine Agent Deployment to Google Cloud
echo ============================================
echo Project: %PROJECT_ID%
echo Region: %REGION%
echo.

REM Set project
echo Setting project...
gcloud config set project %PROJECT_ID%

REM Enable APIs
echo Enabling Vertex AI API...
gcloud services enable aiplatform.googleapis.com

echo.
echo APIs enabled successfully!
echo.
echo Next: Deploy agents via the web console
echo URL: https://console.cloud.google.com/vertex-ai/agents?project=%PROJECT_ID%
echo.
echo Or run: python deploy_vertex_ai.py
echo.
pause
