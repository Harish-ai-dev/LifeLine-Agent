"""
LifeLine Agent — Setup & Installation Script
=============================================
Provides standard setuptools compatibility for:
    pip install -e .
    python setup.py install
"""

from setuptools import setup, find_packages
from pathlib import Path

HERE = Path(__file__).resolve().parent

# Read long description
readme_file = HERE / "README.md"
long_description = readme_file.read_text(encoding="utf-8") if readme_file.exists() else "LifeLine Agent"

setup(
    name="lifeline-agent",
    version="0.1.0",
    description="Autonomous Emergency Dispatch powered by Gemini + Google ADK + Next.js",
    long_description=long_description,
    long_description_content_type="text/markdown",
    author="LifeLine Agent Team",
    packages=find_packages(include=["lifeline*", "admin*", "api*"]),
    python_requires=">=3.11",
    install_requires=[
        "fastapi>=0.115.0",
        "uvicorn[standard]>=0.30.0",
        "typer>=0.12.0",
        "rich>=13.9.0",
        "pydantic>=2.8.0",
        "requests>=2.32.0",
        "cryptography>=43.0.0",
        "google-genai>=1.0.0",
        "google-adk>=1.0.0",
        "firebase-admin>=6.5.0",
        "google-cloud-firestore>=2.16.0",
    ],
    extras_require={
        "dev": [
            "pytest>=8.3.0",
            "pytest-cov>=5.0.0",
            "httpx>=0.27.0",
            "ruff>=0.6.0",
        ]
    },
    entry_points={
        "console_scripts": [
            "lifeline=lifeline.cli:main",
        ],
    },
    include_package_data=True,
    zip_safe=False,
)
