"""
LifeLine Agent — Unified Startup Script
========================================
Starts both the FastAPI backend and the Next.js frontend concurrently.

Usage:
    python start.py                          # default: FastAPI (8000) + Next.js (3000)
    python start.py --port 8000              # custom backend port
    python start.py --frontend-port 3000     # custom Next.js port
    python start.py --backend-only           # run API server only
    python start.py --frontend-only          # run Next.js app only
    python start.py --reload                 # enable FastAPI auto-reload
"""

from __future__ import annotations

import argparse
import os
import shutil
import signal
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


def _can_import(python: str, *packages: str) -> bool:
    """Return True if python interpreter can import the given packages."""
    check = "; ".join(f"import {p}" for p in packages)
    try:
        result = subprocess.run(
            [python, "-c", check],
            capture_output=True,
            timeout=5,
        )
        return result.returncode == 0
    except Exception:
        return False


def find_python() -> str:
    """Return Python interpreter with uvicorn available."""
    candidates = [sys.executable]
    for name in ("python", "python3", "py"):
        p = shutil.which(name)
        if p and p not in candidates:
            candidates.append(p)

    for py in candidates:
        if _can_import(py, "uvicorn"):
            return py

    return sys.executable


def is_port_in_use(port: int, host: str = "127.0.0.1") -> bool:
    """Return True if a TCP port is currently listening."""
    with socket.socket(socket.AF_INET, socket.SOCK_STREAM) as s:
        s.settimeout(0.5)
        return s.connect_ex((host, port)) == 0


def wait_for_port(port: int, host: str = "127.0.0.1", timeout: float = 15.0) -> bool:
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

    print(f"🚀 Starting FastAPI backend on http://localhost:{port}...")
    proc = subprocess.Popen(
        cmd,
        cwd=str(PROJECT_ROOT),
        env={**os.environ, "PYTHONUNBUFFERED": "1"},
    )
    return proc


def run_frontend(port: int = 3000) -> subprocess.Popen:
    """Start the Next.js frontend server."""
    npm = shutil.which("npm.cmd" if sys.platform == "win32" else "npm") or "npm"
    script = "start" if (FRONTEND_DIR / ".next" / "BUILD_ID").exists() else "dev"
    cmd = [npm, "run", script]

    print(f"🌐 Starting Next.js frontend ({script} mode) on http://localhost:{port}...")
    proc = subprocess.Popen(
        cmd,
        cwd=str(FRONTEND_DIR),
        shell=(sys.platform == "win32"),
    )
    return proc



def main():
    parser = argparse.ArgumentParser(
        description="Start LifeLine Agent services concurrently.",
        allow_abbrev=False,
    )
    parser.add_argument("--port", type=int, default=8000, help="FastAPI backend port (default: 8000)")
    parser.add_argument("--frontend-port", dest="frontend_port", type=int, default=3000, help="Next.js frontend port (default: 3000)")
    parser.add_argument("--backend-only", action="store_true", help="Start only the backend")
    parser.add_argument("--frontend-only", action="store_true", help="Start only the frontend")
    parser.add_argument("--reload", action="store_true", help="Enable auto-reload on backend")
    parser.add_argument("--no-browser", action="store_true", help="Do not automatically open the browser")
    args = parser.parse_args()

    print("=" * 60)
    print("🚑 LifeLine Agent — System Startup")
    print("=" * 60)

    procs: list[subprocess.Popen] = []

    try:
        if not args.frontend_only:
            backend_proc = run_backend(port=args.port, reload=args.reload)
            procs.append(backend_proc)

        if not args.backend_only and (FRONTEND_DIR / "package.json").exists():
            frontend_proc = run_frontend(port=args.frontend_port)
            procs.append(frontend_proc)

        # Wait for backend to be ready
        if not args.frontend_only:
            wait_for_port(args.port, timeout=10)

        print("\n" + "=" * 60)
        print("✅ LifeLine Agent is now LIVE!")
        if not args.backend_only:
            print(f"   • Next.js Frontend: http://localhost:{args.frontend_port}/web")
        if not args.frontend_only:
            print(f"   • FastAPI Backend:  http://localhost:{args.port}")
            print(f"   • API Docs:         http://localhost:{args.port}/docs")
            print(f"   • Health Check:     http://localhost:{args.port}/health")
        print("=" * 60)
        print("\nPress Ctrl+C to terminate all running services.\n")

        if not args.no_browser and not args.backend_only:
            try:
                import webbrowser
                webbrowser.open(f"http://localhost:{args.frontend_port}/web")
            except Exception:
                pass

        # Keep parent alive and monitor child processes
        while True:
            for p in procs:
                if p.poll() is not None:
                    break
            time.sleep(1)

    except KeyboardInterrupt:
        print("\n🛑 Shutting down services...")
    finally:
        for p in procs:
            try:
                p.terminate()
                p.wait(timeout=3)
            except Exception:
                p.kill()
        print("👋 All services stopped cleanly.")


if __name__ == "__main__":
    main()
