"""
LifeLine Agent — Unified Startup Script
========================================
Starts FastAPI backend (8000), Next.js frontend (3000), and Google ADK Web UI (8088) concurrently.

Usage:
    python start.py                          # starts Backend (8000), Frontend (3000), ADK Web (8088)
    python start.py --port 8000              # custom backend port
    python start.py --frontend-port 3000     # custom Next.js port
    python start.py --adk-port 8088          # custom ADK Web port
    python start.py --backend-only           # run API server only
    python start.py --frontend-only          # run Next.js app only
    python start.py --no-adk                 # skip ADK Web server
"""

from __future__ import annotations

import argparse
import os
import shutil
import socket
import subprocess
import sys
import time
from pathlib import Path

# ── Windows UTF-8 Encoding Safety ─────────────────────────────────────────────
if sys.platform == "win32":
    try:
        if sys.stdout and hasattr(sys.stdout, "reconfigure"):
            sys.stdout.reconfigure(encoding="utf-8", errors="replace")
        if sys.stderr and hasattr(sys.stderr, "reconfigure"):
            sys.stderr.reconfigure(encoding="utf-8", errors="replace")
    except Exception:
        pass

PROJECT_ROOT = Path(__file__).resolve().parent
FRONTEND_DIR = PROJECT_ROOT / "frontend"


def find_python() -> str:
    """Return current active Python interpreter."""
    return sys.executable


def is_port_in_use(port: int, host: str = "127.0.0.1") -> bool:
    """Return True if a TCP port is currently listening."""
    with socket.socket(socket.AF_INET, socket.SOCK_STREAM) as s:
        s.settimeout(0.5)
        return s.connect_ex((host, port)) == 0


def wait_for_port(port: int, host: str = "127.0.0.1", timeout: float = 10.0) -> bool:
    """Block until port starts listening or timeout expires."""
    deadline = time.time() + timeout
    while time.time() < deadline:
        if is_port_in_use(port, host):
            return True
        time.sleep(0.3)
    return False


def run_backend(port: int = 8000, reload: bool = False) -> subprocess.Popen:
    """Start the FastAPI backend server."""
    python = find_python()
    cmd = [
        python, "-m", "uvicorn", "lifeline.main:app",
        "--host", "0.0.0.0",
        "--port", str(port),
    ]
    if reload:
        cmd.append("--reload")

    print(f"🚀 [1/3] Starting FastAPI Backend on http://localhost:{port}...")
    proc = subprocess.Popen(
        cmd,
        cwd=str(PROJECT_ROOT),
        env={**os.environ, "PYTHONUNBUFFERED": "1"},
    )
    return proc


def run_frontend(port: int = 3000) -> subprocess.Popen:
    """Start the Next.js frontend server."""
    npm = shutil.which("npm.cmd" if sys.platform == "win32" else "npm") or "npm"
    build_id_path = FRONTEND_DIR / ".next" / "BUILD_ID"
    script = "start" if build_id_path.exists() else "dev"
    cmd = [npm, "run", script]

    print(f"🌐 [2/3] Starting Next.js Frontend ({script} mode) on http://localhost:{port}...")
    proc = subprocess.Popen(
        cmd,
        cwd=str(FRONTEND_DIR),
        shell=(sys.platform == "win32"),
    )
    return proc


def run_adk_web(port: int = 8088) -> subprocess.Popen:
    """Start Google ADK Web UI server."""
    python = find_python()
    adk_script = f"import sys; from google.adk.cli import main; sys.argv=['adk', 'web', '--port', '{port}', 'lifeline_adk']; main()"
    cmd = [python, "-c", adk_script]

    print(f"🤖 [3/3] Starting Google ADK Visual Web UI on http://localhost:{port}...")
    proc = subprocess.Popen(
        cmd,
        cwd=str(PROJECT_ROOT),
        env={**os.environ, "PYTHONUNBUFFERED": "1"},
    )
    return proc


def main():
    parser = argparse.ArgumentParser(
        description="Start LifeLine Agent services concurrently.",
        allow_abbrev=False,
    )
    parser.add_argument("--port", type=int, default=8000, help="FastAPI backend port (default: 8000)")
    parser.add_argument("--frontend-port", dest="frontend_port", type=int, default=3000, help="Next.js frontend port (default: 3000)")
    parser.add_argument("--adk-port", dest="adk_port", type=int, default=8088, help="Google ADK Web port (default: 8088)")
    parser.add_argument("--backend-only", action="store_true", help="Start only the backend")
    parser.add_argument("--frontend-only", action="store_true", help="Start only the frontend")
    parser.add_argument("--reload", action="store_true", help="Enable auto-reload on backend")
    parser.add_argument("--no-browser", action="store_true", help="Do not automatically open the browser")
    parser.add_argument("--no-adk", action="store_true", help="Do not start the ADK Web server")
    args = parser.parse_args()

    print("=" * 70)
    print("🚑 LifeLine Agent — Autonomous Emergency Dispatch & ADK Swarm")
    print("   Next.js (3000) + FastAPI (8000) + Google ADK Web (8088)")
    print("=" * 70)

    procs: list[subprocess.Popen] = []

    try:
        # 1. Start Backend
        if not args.frontend_only:
            backend_proc = run_backend(port=args.port, reload=args.reload)
            procs.append(backend_proc)

        # 2. Start Frontend
        if not args.backend_only and (FRONTEND_DIR / "package.json").exists():
            frontend_proc = run_frontend(port=args.frontend_port)
            procs.append(frontend_proc)

        # 3. Start ADK Web
        if not args.no_adk and not args.frontend_only:
            adk_proc = run_adk_web(port=args.adk_port)
            procs.append(adk_proc)

        # Wait briefly for servers
        time.sleep(2)

        print("\n" + "=" * 70)
        print("✅ LifeLine Agent is now LIVE!")
        print(f"   • Web Showcase:          http://localhost:{args.frontend_port}")
        print(f"   • Secret Admin & Demo:   http://localhost:{args.frontend_port}/og/admin")
        print(f"   • Google ADK Web UI:     http://localhost:{args.adk_port}")
        print(f"   • Login Portal:          http://localhost:{args.frontend_port}/login")
        print(f"   • Backend API:           http://localhost:{args.port}")
        print(f"   • Swagger Docs:          http://localhost:{args.port}/docs")
        print(f"   • Health Check:          http://localhost:{args.port}/health")
        print("=" * 70)
        print("\nPress Ctrl+C to stop all services.\n")

        if not args.no_browser and not args.backend_only:
            try:
                import webbrowser
                webbrowser.open(f"http://localhost:{args.frontend_port}")
            except Exception:
                pass

        # Keep parent alive and monitor child processes
        while True:
            for p in procs:
                if p.poll() is not None:
                    break
            time.sleep(1)

    except KeyboardInterrupt:
        print("\n🛑 Shutting down all services...")
    finally:
        for p in procs:
            try:
                p.terminate()
                p.wait(timeout=2)
            except Exception:
                p.kill()
        print("👋 All services stopped cleanly.")


if __name__ == "__main__":
    main()
