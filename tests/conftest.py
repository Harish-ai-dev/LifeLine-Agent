"""
Pytest configuration for LifeLine Agent test suite.
Automatically loads environment variables from .env file before running any test.
"""

import os
import sys
from dotenv import load_dotenv

# Ensure project root is on sys.path
PROJECT_ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
if PROJECT_ROOT not in sys.path:
    sys.path.insert(0, PROJECT_ROOT)

# Load environment variables
load_dotenv(os.path.join(PROJECT_ROOT, ".env"))
