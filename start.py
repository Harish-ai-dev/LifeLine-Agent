"""
LifeLine Agent — Unified Startup Script
========================================
Starts both the FastAPI backend and the Streamlit UI in one terminal.

Usage:
    python start.py                          # default: both services
    python start.py --port 8000              # custom backend port
    python start.py --frontend-port 8502     # custom UI port
    python start.py --frontend next          # use Next.js instead of Streamlit
    python start.py --reload                 # hot-reload backend
"""

from __future__ import annotations

import argparse
import os
import shutil
import signal
import socket
import subprocess
import sys
import threading
import time
from pathlib import Path

# ── Windows UTF-8 ─────────────────────────────────────────────────────────────
if sys.platform == "win32":
    try:
        sys.stdout.reconfigure(encoding="utf-8", errors="replace")
        sys.stderr.reconfigure(encoding="utf-8", errors="replace")
    except Exception:
        pass

PROJECT_ROOT = Path(__file__).resolve().parent


# ─────────────────────────────────────────────────────────────────────────────
# Interpreter detection
# ─────────────────────────────────────────────────────────────────────────────

def _can_import(python: str, *packages: str) -> bool:
    """Return True if *python* can import all *packages*."""
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
    """
    Return the path to a Python interpreter that has uvicorn AND streamlit.

    Priority:
      1. sys.executable (the Python that launched this script) — if it works
      2. `python` / `python3` on PATH
      3. Common Anaconda / conda install locations on Windows
      4. sys.executable as final fallback (will fail loudly at runtime)
    """
    candidates = [sys.executable]

    # Add every `python` / `python3` visible on PATH
    for name in ("python", "python3", "py"):
        p = shutil.which(name)
        if p and p not in candidates:
            candidates.append(p)

    # Common Windows Anaconda paths
    home = Path.home()
    for rel in (
        "anaconda3/python.exe",
        "anaconda/python.exe",
        "miniconda3/python.exe",
        "miniconda/python.exe",
        "AppData/Local/Programs/Python/Python311/python.exe",
        "AppData/Local/Programs/Python/Python312/python.exe",
        "AppData/Local/Programs/Python/Python313/python.exe",
    ):
        p = str(home / rel)
        if Path(p).exists() and p not in candidates:
            candidates.append(p)

    for python in candidates:
        if _can_import(python, "uvicorn", "streamlit"):
            return python

    # Nothing works — return sys.executable; errors will surface in subprocesses
    return sys.executable


def find_exe(name: str) -> str | None:
    """Return the full path to a console-script executable if it exists."""
    return shutil.which(name)


# ─────────────────────────────────────────────────────────────────────────────
# Helpers
# ─────────────────────────────────────────────────────────────────────────────

def is_port_in_use(port: int, host: str = "127.0.0.1") -> bool:
    with socket.socket(socket.AF_INET, socket.SOCK_STREAM) as s:
        s.settimeout(0.5)
        return s.connect_ex((host, port)) == 0


def load_config() -> None:
    try:
        from admin.config_manager import get_runtime_config, inject_to_env
        inject_to_env(get_runtime_config())
    except Exception:
        pass


def _stream(proc: subprocess.Popen, prefix: str, stop: threading.Event) -> None:
    try:
        for raw in iter(proc.stdout.readline, b""):
            if stop.is_set():
                break
            line = raw.decode("utf-8", errors="replace").rstrip()
            if line:
                print(f"{prefix} {line}", flush=True)
    except Exception:
        pass


# ─────────────────────────────────────────────────────────────────────────────
# Main
# ─────────────────────────────────────────────────────────────────────────────

def start_services(
    backend_host: str = "0.0.0.0",
    backend_port: int = 8000,
    frontend_type: str = "streamlit",
    frontend_port: int = 8501,
    reload: bool = False,
) -> None:
    load_config()

    # ── Resolve the correct Python interpreter ────────────────────────────────
    PYTHON = find_python()

    print("=" * 65)
    print("  🚑  LifeLine Agent — Autonomous Emergency Dispatch")
    print("=" * 65)
    print(f"  Python       →  {PYTHON}")
    print(f"  Backend API  →  http://localhost:{backend_port}")
    print(f"  API Docs     →  http://localhost:{backend_port}/docs")
    print(f"  Frontend UI  →  http://localhost:{frontend_port}")
    print("=" * 65)
    print("  Ctrl+C to stop all services.\n")

    # ── Port pre-flight ───────────────────────────────────────────────────────
    for port, name in ((backend_port, "Backend"), (frontend_port, "Frontend")):
        if is_port_in_use(port):
            print(
                f"\n❌  {name} port {port} is already in use.\n"
                f"    Free it or pass a different port:\n"
                f"    python start.py {'--port' if name == 'Backend' else '--frontend-port'} <free_port>\n"
            )
            sys.exit(1)

    env = {**os.environ, "PYTHONUNBUFFERED": "1"}
    processes: list[tuple[str, subprocess.Popen]] = []
    stop_event = threading.Event()
    shutting_down = threading.Event()

    # ── Backend ───────────────────────────────────────────────────────────────
    # Prefer the uvicorn console-script if it's on PATH (avoids python -m)
    uvicorn_exe = find_exe("uvicorn")
    if uvicorn_exe:
        backend_cmd = [
            uvicorn_exe,
            "lifeline.main:app",
            "--host", backend_host,
            "--port", str(backend_port),
        ]
    else:
        backend_cmd = [
            PYTHON, "-m", "uvicorn",
            "lifeline.main:app",
            "--host", backend_host,
            "--port", str(backend_port),
        ]
    if reload:
        backend_cmd.append("--reload")

    backend_proc = subprocess.Popen(
        backend_cmd,
        cwd=str(PROJECT_ROOT),
        stdout=subprocess.PIPE,
        stderr=subprocess.STDOUT,
        env=env,
    )
    processes.append(("Backend ", backend_proc))
    threading.Thread(
        target=_stream, args=(backend_proc, "[Backend ]", stop_event), daemon=True
    ).start()

    # ── Frontend ──────────────────────────────────────────────────────────────
    if frontend_type == "next" and (PROJECT_ROOT / "frontend").exists():
        frontend_cmd = ["npm", "run", "dev", "--", "-p", str(frontend_port)]
        frontend_cwd = str(PROJECT_ROOT / "frontend")
        use_shell = sys.platform == "win32"
    else:
        ui_script = str(PROJECT_ROOT / "ui" / "streamlit_app.py")
        streamlit_exe = find_exe("streamlit")
        if streamlit_exe:
            frontend_cmd = [
                streamlit_exe, "run", ui_script,
                "--server.port", str(frontend_port),
                "--server.headless", "true",
                "--server.fileWatcherType", "none",
            ]
        else:
            frontend_cmd = [
                PYTHON, "-m", "streamlit", "run", ui_script,
                "--server.port", str(frontend_port),
                "--server.headless", "true",
                "--server.fileWatcherType", "none",
            ]
        frontend_cwd = str(PROJECT_ROOT)
        use_shell = False

    frontend_proc = subprocess.Popen(
        frontend_cmd,
        cwd=frontend_cwd,
        stdout=subprocess.PIPE,
        stderr=subprocess.STDOUT,
        shell=use_shell,
        env=env,
    )
    processes.append(("Frontend", frontend_proc))
    threading.Thread(
        target=_stream, args=(frontend_proc, "[Frontend]", stop_event), daemon=True
    ).start()

    # ── Cleanup / signal handling ─────────────────────────────────────────────
    def cleanup(signum=None, frame=None) -> None:
        if shutting_down.is_set():
            return
        shutting_down.set()
        stop_event.set()
        print("\n\n🛑  Shutting down LifeLine Agent services...")
        for _, p in processes:
            try:
                p.terminate()
            except Exception:
                pass
        time.sleep(1.5)
        for _, p in processes:
            try:
                if p.poll() is None:
                    p.kill()
            except Exception:
                pass
        print("✓   All services stopped cleanly.")
        sys.exit(0)

    signal.signal(signal.SIGINT, cleanup)
    signal.signal(signal.SIGTERM, cleanup)

    # ── Monitor loop ──────────────────────────────────────────────────────────
    try:
        while not shutting_down.is_set():
            time.sleep(0.75)
            for name, p in processes:
                code = p.poll()
                if code is not None and not shutting_down.is_set():
                    print(
                        f"\n❌  {name.strip()} service exited unexpectedly (code {code}).\n"
                        "    Check the output above for error details.\n"
                        "    Stopping all services."
                    )
                    cleanup()
                    return
    except KeyboardInterrupt:
        cleanup()


def main() -> None:
    parser = argparse.ArgumentParser(
        description="LifeLine Agent — start backend + frontend together",
        formatter_class=argparse.ArgumentDefaultsHelpFormatter,
    )
    parser.add_argument("--host", default="0.0.0.0", help="Backend bind host")
    parser.add_argument("--port", type=int, default=8000, help="Backend port")
    parser.add_argument(
        "--frontend", default="streamlit",
        choices=["streamlit", "next"],
        help="Frontend UI type",
    )
    parser.add_argument("--frontend-port", type=int, default=8501, help="Frontend port")
    parser.add_argument("--reload", action="store_true", help="Backend hot-reload (dev)")
    args = parser.parse_args()

    start_services(
        backend_host=args.host,
        backend_port=args.port,
        frontend_type=args.frontend,
        frontend_port=args.frontend_port,
        reload=args.reload,
    )


if __name__ == "__main__":
    main()
