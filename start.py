"""
LifeLine Agent - Unified Startup Script
=======================================
Runs both the FastAPI backend and Frontend (Streamlit) concurrently in a
single terminal window.

Usage:
    python start.py                                 # default: both services
    python start.py --port 8000 --frontend-port 8501
    python start.py --frontend next                 # use Next.js instead
    python start.py --reload                        # hot-reload the backend
"""

from __future__ import annotations

import argparse
import os
import signal
import socket
import subprocess
import sys
import threading
import time
from pathlib import Path

# ── Windows UTF-8 Invariant ─────────────────────────────────────────────────
if sys.platform == "win32":
    try:
        sys.stdout.reconfigure(encoding="utf-8", errors="replace")
        sys.stderr.reconfigure(encoding="utf-8", errors="replace")
    except Exception:
        pass

PROJECT_ROOT = Path(__file__).resolve().parent


# ── Helpers ──────────────────────────────────────────────────────────────────

def is_port_in_use(port: int, host: str = "127.0.0.1") -> bool:
    """Return True if *port* is already bound on *host*."""
    with socket.socket(socket.AF_INET, socket.SOCK_STREAM) as s:
        s.settimeout(0.5)
        return s.connect_ex((host, port)) == 0


def load_config():
    """Push encrypted admin credentials into os.environ (no-op if not set)."""
    try:
        from admin.config_manager import get_runtime_config, inject_to_env
        inject_to_env(get_runtime_config())
    except Exception:
        pass


def _stream_lines(process: subprocess.Popen, prefix: str, stop_event: threading.Event):
    """Read subprocess output line-by-line and forward to stdout with a prefix."""
    try:
        for raw in iter(process.stdout.readline, b""):
            if stop_event.is_set():
                break
            line = raw.decode("utf-8", errors="replace").rstrip()
            if line:
                print(f"{prefix} {line}", flush=True)
    except Exception:
        pass


# ── Main ─────────────────────────────────────────────────────────────────────

def start_services(
    backend_host: str = "0.0.0.0",
    backend_port: int = 8000,
    frontend_type: str = "streamlit",
    frontend_port: int = 8501,
    reload: bool = False,
) -> None:
    load_config()

    # ── Pre-flight port checks ────────────────────────────────────────────────
    for port, name in ((backend_port, "Backend"), (frontend_port, "Frontend")):
        if is_port_in_use(port):
            print(
                f"\n❌  {name} port {port} is already in use.\n"
                f"    Kill the process occupying it, or pass a different port:\n"
                f"    python start.py {'--port' if name=='Backend' else '--frontend-port'} <free_port>\n"
            )
            sys.exit(1)

    print("=" * 65)
    print("  🚑  LifeLine Agent — Autonomous Emergency Dispatch")
    print("=" * 65)
    print(f"  ▶ Backend API  →  http://localhost:{backend_port}")
    print(f"  ▶ API Docs     →  http://localhost:{backend_port}/docs")
    print(f"  ▶ Frontend UI  →  http://localhost:{frontend_port}")
    print("=" * 65)
    print("  Ctrl+C to stop all services.\n")

    processes: list[tuple[str, subprocess.Popen]] = []
    stop_event = threading.Event()
    shutting_down = threading.Event()

    # ── Backend ───────────────────────────────────────────────────────────────
    backend_cmd = [
        sys.executable, "-m", "uvicorn",
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
        env=os.environ.copy(),
    )
    processes.append(("Backend ", backend_proc))
    threading.Thread(
        target=_stream_lines,
        args=(backend_proc, "[Backend ]", stop_event),
        daemon=True,
    ).start()

    # ── Frontend ──────────────────────────────────────────────────────────────
    if frontend_type == "next" and (PROJECT_ROOT / "frontend").exists():
        frontend_cmd = ["npm", "run", "dev", "--", "-p", str(frontend_port)]
        frontend_cwd = str(PROJECT_ROOT / "frontend")
        use_shell = sys.platform == "win32"
    else:
        frontend_cmd = [
            sys.executable, "-m", "streamlit", "run",
            str(PROJECT_ROOT / "ui" / "streamlit_app.py"),  # absolute path
            "--server.port", str(frontend_port),
            "--server.headless", "true",
            "--server.fileWatcherType", "none",  # avoid watchdog conflicts
        ]
        frontend_cwd = str(PROJECT_ROOT)
        use_shell = False

    frontend_proc = subprocess.Popen(
        frontend_cmd,
        cwd=frontend_cwd,
        stdout=subprocess.PIPE,
        stderr=subprocess.STDOUT,
        shell=use_shell,
        env=os.environ.copy(),
    )
    processes.append(("Frontend", frontend_proc))
    threading.Thread(
        target=_stream_lines,
        args=(frontend_proc, "[Frontend]", stop_event),
        daemon=True,
    ).start()

    # ── Shutdown handler ──────────────────────────────────────────────────────
    def cleanup(signum=None, frame=None):
        if shutting_down.is_set():
            return
        shutting_down.set()
        stop_event.set()
        print("\n\n🛑  Shutting down LifeLine Agent services...")
        for name, p in processes:
            try:
                p.terminate()
            except Exception:
                pass
        time.sleep(1.5)
        for name, p in processes:
            try:
                if p.poll() is None:
                    p.kill()
            except Exception:
                pass
        print("✓   All services stopped cleanly.")
        sys.exit(0)

    signal.signal(signal.SIGINT, cleanup)
    signal.signal(signal.SIGTERM, cleanup)

    # ── Monitor loop (non-spinning) ───────────────────────────────────────────
    try:
        while not shutting_down.is_set():
            time.sleep(0.75)
            for name, p in processes:
                code = p.poll()
                if code is not None and not shutting_down.is_set():
                    print(
                        f"\n❌  {name.strip()} service exited unexpectedly "
                        f"(code {code}). Stopping all services."
                    )
                    cleanup()
                    return
    except KeyboardInterrupt:
        cleanup()


def main():
    parser = argparse.ArgumentParser(
        description="LifeLine Agent — start backend + frontend together",
        formatter_class=argparse.ArgumentDefaultsHelpFormatter,
    )
    parser.add_argument("--host", default="0.0.0.0", help="Backend bind host")
    parser.add_argument("--port", type=int, default=8000, help="Backend port")
    parser.add_argument(
        "--frontend", default="streamlit", choices=["streamlit", "next"],
        help="Frontend UI type",
    )
    parser.add_argument("--frontend-port", type=int, default=8501, help="Frontend port")
    parser.add_argument("--reload", action="store_true", help="Enable backend hot-reload (dev)")
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
