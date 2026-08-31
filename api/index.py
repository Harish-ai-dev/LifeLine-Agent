"""
Vercel Serverless Entrypoint for LifeLine Agent API.
Bridges Vercel's Python runtime to the FastAPI application.
"""

import os
import sys

# Ensure root directory is on Python path so 'lifeline', 'admin', and 'data' can be imported
ROOT_DIR = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
if ROOT_DIR not in sys.path:
    sys.path.insert(0, ROOT_DIR)

from fastapi import FastAPI
from lifeline.main import app as lifeline_app

# Master app to handle both /api/* and root path requests
app = FastAPI(
    title="LifeLine Agent API (Vercel)",
    description="Vercel Serverless handler for LifeLine Agent emergency dispatch & healthcare coordination",
    version="0.1.0",
)

# Mount the main application under /api and root
app.mount("/api", lifeline_app)
app.mount("/", lifeline_app)
