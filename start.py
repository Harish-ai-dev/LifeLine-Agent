"""
LifeLine Agent — Unified Startup Script
========================================
Starts FastAPI backend (8000), Next.js frontend (3000), and Google ADK Web UI (8088) concurrently.

Usage:
    python start.py                          # starts Backend (8000), Frontend (3000), ADK Web (8088)
    python start.py --frontend next          # explicit frontend target
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


def ensure_frontend_built():
    """Ensure frontend dependencies and production build are present."""
    if not (FRONTEND_DIR / "package.json").exists():
        return

    npm = shutil.which("npm.cmd" if sys.platform == "win32" else "npm") or "npm"

    if not (FRONTEND_DIR / "node_modules").exists():
        print("📦 [INFO] Installing frontend dependencies (node_modules)...")
        subprocess.run([npm, "install"], cwd=str(FRONTEND_DIR), check=True)

    if not (FRONTEND_DIR / ".next" / "BUILD_ID").exists():
        print("🔨 [INFO] Building frontend production bundle...")
        subprocess.run([npm, "run", "build"], cwd=str(FRONTEND_DIR), check=True)


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

    env = {
        **os.environ,
        "PYTHONUNBUFFERED": "1",
        "PYTHONPATH": f"{PROJECT_ROOT}{os.pathsep}{os.environ.get('PYTHONPATH', '')}",
    }

    print(f"🚀 [1/3] Starting FastAPI Backend on http://localhost:{port}...")
    proc = subprocess.Popen(
        cmd,
        cwd=str(PROJECT_ROOT),
        env=env,
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
    """Start Google ADK Web UI server if available."""
    python = find_python()
<<<<<<< HEAD
    # We no longer delete the session_db here so old ADK sessions are preserved.
    
    adk_script = f"import sys; from google.adk.cli import main; sys.argv=['adk', 'web', '--port', '{port}', 'lifeline_adk']; main()"
    cmd = [python, "-W", "ignore", "-c", adk_script]
=======
    adk_script = f"import sys; from google.adk.cli import main; sys.argv=['adk', 'web', '--port', '{port}', '--host', '0.0.0.0', '.']; main()"
    cmd = [python, "-c", adk_script]
>>>>>>> f3a327a5af157b83d5194bf795a927ab93e1fcc2

    env = {
        **os.environ,
        "PYTHONUNBUFFERED": "1",
        "PYTHONPATH": f"{PROJECT_ROOT}{os.pathsep}{os.environ.get('PYTHONPATH', '')}",
    }

    print(f"🤖 [3/3] Starting Google ADK Visual Web UI on http://localhost:{port}...")
    proc = subprocess.Popen(
        cmd,
        cwd=str(PROJECT_ROOT),
        env=env,
    )
    return proc


def main():
    parser = argparse.ArgumentParser(
        description="Start LifeLine Agent services concurrently.",
        allow_abbrev=False,
    )
    parser.add_argument("--port", type=int, default=8000, help="FastAPI backend port (default: 8000)")
    parser.add_argument("--frontend", default="next", help="Frontend type (default: next)")
    parser.add_argument("--frontend-port", dest="frontend_port", type=int, default=3000, help="Next.js frontend port (default: 3000)")
    parser.add_argument("--adk-port", dest="adk_port", type=int, default=8088, help="Google ADK Web port (default: 8088)")
    parser.add_argument("--backend-only", action="store_true", help="Start only the backend")
    parser.add_argument("--frontend-only", action="store_true", help="Start only the frontend")
    parser.add_argument("--reload", action="store_true", help="Enable auto-reload on backend")
    parser.add_argument("--no-browser", action="store_true", help="Do not automatically open the browser")
    parser.add_argument("--no-adk", action="store_true", help="Do not start the ADK Web server")
    args = parser.parse_args()

    print("=" * 70)
    print("🚑 LifeLine Agent — Autonomous Emergency Dispatch & Dashboard")
    print(f"   Next.js ({args.frontend_port}) + FastAPI ({args.port})")
    print("=" * 70)

    # Load configuration
    try:
        from admin.config_manager import get_runtime_config, inject_to_env
        inject_to_env(get_runtime_config())
    except Exception:
        pass

    try:
        from dotenv import load_dotenv
        load_dotenv()
    except Exception:
        pass

    gemini_key = os.environ.get("GEMINI_API_KEY") or os.environ.get("GOOGLE_API_KEY")
    if not gemini_key or gemini_key.strip() in ("", "your_gemini_api_key_here"):
        print("ℹ️ [INFO] GEMINI_API_KEY running in local simulation & deterministic mode.")
        os.environ["GEMINI_API_KEY"] = "mock_key_for_local_development"

    # Ensure frontend build
    if not args.backend_only:
        try:
            ensure_frontend_built()
        except Exception as e:
            print(f"⚠️ Warning during frontend check: {e}")

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

        # 3. Start ADK Web (optional)
        if not args.no_adk and not args.frontend_only:
            try:
                adk_proc = run_adk_web(port=args.adk_port)
                procs.append(adk_proc)
            except Exception:
                pass

        # Wait briefly for servers
        time.sleep(2)

        print("\n" + "=" * 70)
        print("✅ LifeLine Agent is now LIVE!")
        print(f"   • Hospital & Donor Dashboard: http://localhost:{args.frontend_port}")
        print(f"   • Backend API:                http://localhost:{args.port}")
        print(f"   • Swagger Docs:               http://localhost:{args.port}/docs")
        print(f"   • Health Check:               http://localhost:{args.port}/health")
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
