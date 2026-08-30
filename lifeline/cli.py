"""
LifeLine Agent CLI
==================
Installed as the `lifeline` command when you run:  pip install -e .
Also runnable as:                                   python -m lifeline

Operational Verbs Supported:
----------------------------
  lifeline version          -> show version and runtime info
  lifeline init             -> interactive setup wizard (first-run setup)
  lifeline status           -> live system health and configuration dashboard
  lifeline run              -> start API backend server (or full stack)
  lifeline ui               -> launch Next.js user frontend
  lifeline dispatch         -> execute agent pipeline directly from terminal
  lifeline logs             -> stream recent audit database records
  lifeline seed             -> enrich hospitals with simulated bed & specialty data
  lifeline fetch-hospitals  -> pull real hospital data from OpenStreetMap (Overpass API)
  lifeline test             -> run test suite with pytest
"""

from __future__ import annotations

import json
import os
import shutil
import subprocess
import sys
import time
from pathlib import Path
from typing import Annotated, Optional

import typer
from rich.console import Console
from rich.panel import Panel
from rich.progress import Progress, SpinnerColumn, TextColumn
from rich.prompt import Confirm, Prompt
from rich.rule import Rule
from rich.table import Table

# ── Cross-Platform Windows UTF-8 Output Safety ────────────────────────────────
# Configures UTF-8 encoding to prevent Windows cp1252 encoding errors with emojis/rich text.
if sys.platform == "win32":
    try:
        if sys.stdout and hasattr(sys.stdout, "reconfigure"):
            sys.stdout.reconfigure(encoding="utf-8", errors="replace")
        if sys.stderr and hasattr(sys.stderr, "reconfigure"):
            sys.stderr.reconfigure(encoding="utf-8", errors="replace")
    except Exception:
        pass

# ── App Setup ─────────────────────────────────────────────────────────────────
app = typer.Typer(
    name="lifeline",
    help="🚑 [LifeLine Agent] Autonomous Emergency Dispatch powered by Gemini + Google ADK",
    add_completion=True,
    rich_markup_mode="rich",
    no_args_is_help=True,
    pretty_exceptions_show_locals=False,
)

console = Console()
err_console = Console(stderr=True, style="bold red")

# ── Constants ─────────────────────────────────────────────────────────────────
PROJECT_ROOT = Path(__file__).resolve().parent.parent
CITIES = ["mumbai", "delhi", "bangalore", "london", "seattle", "new york"]


# ══════════════════════════════════════════════════════════════════════════════
# SHARED HELPERS
# ══════════════════════════════════════════════════════════════════════════════

def _banner(subtitle: str = "Autonomous Emergency Dispatch · Gemini + ADK + Firestore"):
    try:
        from lifeline import __version__
    except Exception:
        __version__ = "0.1.0"

    console.print()
    console.print(Panel(
        f"[bold red]🚑  LifeLine Agent[/bold red]  [dim]v{__version__}[/dim]\n"
        f"[dim]{subtitle}[/dim]",
        border_style="red",
        expand=False,
        padding=(0, 2),
    ))
    console.print()


def _inject_config(warn: bool = True) -> dict:
    """Load configuration from environment or .env file. Returns config dict."""
    config: dict[str, str] = {}
    
    # 1. Read .env file if present
    env_path = PROJECT_ROOT / ".env"
    if env_path.exists():
        try:
            with open(env_path, "r", encoding="utf-8") as f:
                for line in f:
                    line = line.strip()
                    if line and not line.startswith("#") and "=" in line:
                        k, v = line.split("=", 1)
                        k, v = k.strip(), v.strip().strip("'\"")
                        if k and k not in os.environ:
                            os.environ[k] = v
                        config[k] = os.environ.get(k, v)
        except Exception:
            pass

    # 2. Try encrypted admin config if available
    try:
        from admin.config_manager import get_runtime_config, inject_to_env
        admin_cfg = get_runtime_config()
        inject_to_env(admin_cfg)
        config.update(admin_cfg)
    except Exception:
        pass

    # 3. Fill from environment variables
    for key in [
        "GOOGLE_API_KEY", "GEMINI_API_KEY", "FIRESTORE_PROJECT_ID", "GCP_PROJECT_ID",
        "DEMO_AUTH_MODE", "DEMO_CITY", "FIRESTORE_COLLECTION", "VITE_API_BASE_URL",
        "PORT", "HOST"
    ]:
        val = os.environ.get(key)
        if val:
            config[key] = val

    # Warn if key is missing and live AI expected
    api_key = config.get("GOOGLE_API_KEY") or config.get("GEMINI_API_KEY")
    if warn and not api_key:
        console.print(
            "[yellow]⚠  GOOGLE_API_KEY not configured.[/yellow] "
            "Set it in .env or run [bold]lifeline init[/bold] to configure.\n"
        )
    return config


def _check(condition: bool, label: str, ok_msg: str = "OK", fail_msg: str = "MISSING"):
    icon = "✅" if condition else "❌"
    status = f"[green]{ok_msg}[/green]" if condition else f"[red]{fail_msg}[/red]"
    console.print(f"  {icon}  {label:<35} {status}")
    return condition


# ══════════════════════════════════════════════════════════════════════════════
# version
# ══════════════════════════════════════════════════════════════════════════════
@app.command()
def version():
    """Display version, author, and runtime platform information."""
    try:
        from lifeline import __version__, __author__
    except Exception:
        __version__, __author__ = "0.1.0", "LifeLine Agent Team"

    console.print(
        Panel(
            f"[bold]lifeline-agent[/bold]  v[bold green]{__version__}[/bold green]\n"
            f"[dim]by {__author__}[/dim]\n"
            f"[dim]Python {sys.version.split()[0]} · "
            f"{sys.platform}[/dim]",
            title="[red]🚑 LifeLine Agent[/red]",
            border_style="dim",
            expand=False,
        )
    )


# ══════════════════════════════════════════════════════════════════════════════
# init
# ══════════════════════════════════════════════════════════════════════════════
@app.command()
def init():
    """
    Interactive first-run setup wizard.

    Guides you through:
      1. Checking runtime dependencies
      2. Setting Gemini API Key & Firestore configuration
      3. Selecting demo city and pulling OSM hospital data
      4. Seeding simulated bed availability
    """
    _banner("First-Run Setup Wizard")

    console.print("[bold]Welcome to LifeLine Agent![/bold]")
    console.print(
        "This wizard will configure your local environment for autonomous emergency dispatch.\n"
    )

    # ── Step 1: Dependency check ──────────────────────────────────────────────
    console.print(Rule("[bold]Step 1 — Dependency Check[/bold]"))
    all_ok = True

    py_ok = sys.version_info >= (3, 11)
    all_ok &= _check(py_ok, "Python ≥ 3.11", sys.version.split()[0], sys.version.split()[0])

    for pkg_name, import_name in [
        ("fastapi", "fastapi"),
        ("uvicorn", "uvicorn"),
        ("typer", "typer"),
        ("rich", "rich"),
        ("pydantic", "pydantic"),
        ("requests", "requests"),
    ]:
        try:
            __import__(import_name)
            all_ok &= _check(True, pkg_name)
        except ImportError:
            all_ok &= _check(False, pkg_name, fail_msg="NOT INSTALLED")

    console.print()
    if not all_ok:
        console.print("[yellow]Some core packages are missing. Install with:[/yellow]")
        console.print("  [bold]pip install -e \".[dev]\"[/bold]\n")
        if not Confirm.ask("Continue anyway?", default=False):
            raise typer.Exit(1)

    # ── Step 2: API Keys & Environment ────────────────────────────────────────
    console.print(Rule("[bold]Step 2 — API Key & Cloud Config[/bold]"))
    config = _inject_config(warn=False)

    existing_api_key = config.get("GOOGLE_API_KEY") or config.get("GEMINI_API_KEY") or ""
    masked_key = (existing_api_key[:4] + "••••" + existing_api_key[-4:]) if len(existing_api_key) > 8 else ""

    if existing_api_key:
        console.print(f"Current GOOGLE_API_KEY: [green]{masked_key}[/green]")
        if Confirm.ask("Do you want to update your Gemini API key?", default=False):
            new_key = Prompt.ask("Enter your GOOGLE_API_KEY", password=True)
            if new_key.strip():
                existing_api_key = new_key.strip()
    else:
        new_key = Prompt.ask("Enter your GOOGLE_API_KEY (from https://aistudio.google.com/apikey)", default="", password=True)
        if new_key.strip():
            existing_api_key = new_key.strip()

    gcp_proj = Prompt.ask("Enter GCP / Firestore Project ID (optional for local mock mode)", default=config.get("FIRESTORE_PROJECT_ID", "lifeline-demo-project"))

    # Write/update .env file
    env_file = PROJECT_ROOT / ".env"
    env_lines = [
        f"GOOGLE_API_KEY={existing_api_key}\n",
        f"FIRESTORE_PROJECT_ID={gcp_proj}\n",
        "DEMO_AUTH_MODE=true\n",
        "DEMO_CITY=mumbai\n",
        "PORT=8000\n",
        "HOST=0.0.0.0\n",
        "VITE_API_BASE_URL=http://localhost:8000\n",
        "FIRESTORE_COLLECTION=dispatch_cases\n",
    ]
    try:
        with open(env_file, "w", encoding="utf-8") as f:
            f.writelines(env_lines)
        console.print(f"[green]✓ Saved configuration to [bold]{env_file.name}[/bold][/green]\n")
    except Exception as e:
        console.print(f"[yellow]Could not write .env file: {e}[/yellow]\n")

    # ── Step 3: Demo City & Hospital Data ─────────────────────────────────────
    console.print(Rule("[bold]Step 3 — Hospital Data Acquisition[/bold]"))
    city = Prompt.ask("Select demo city for OpenStreetMap hospital extraction", choices=CITIES, default="mumbai")

    if Confirm.ask(f"Fetch and seed hospital data for [bold]{city}[/bold] now?", default=True):
        _run_fetch(city)
        _run_seed()

    # ── Done ──────────────────────────────────────────────────────────────────
    console.print()
    console.print(Panel(
        "[bold green]✅  Setup complete![/bold green]\n\n"
        "Next commands to explore:\n"
        "  [bold]lifeline run[/bold]      → start API backend + Next.js frontend\n"
        "  [bold]lifeline dispatch[/bold] → run autonomous dispatch in terminal\n"
        "  [bold]lifeline status[/bold]   → verify live configuration and health\n"
        "  [bold]lifeline ui[/bold]       → launch Next.js user portal",
        border_style="green",
        expand=False,
    ))


# ══════════════════════════════════════════════════════════════════════════════
# status
# ══════════════════════════════════════════════════════════════════════════════
@app.command()
def status():
    """Live system health and configuration dashboard."""
    _banner("System Status Dashboard")
    config = _inject_config(warn=False)

    # ── Config status ─────────────────────────────────────────────────────────
    console.print(Rule("[bold]Configuration[/bold]"))
    keys_status = {
        "GOOGLE_API_KEY":        "Gemini API Key",
        "FIRESTORE_PROJECT_ID":  "Firestore Project ID",
        "DEMO_AUTH_MODE":        "Demo Auth Mode",
        "DEMO_CITY":             "Default Demo City",
        "FIRESTORE_COLLECTION":  "Firestore Collection",
        "VITE_API_BASE_URL":     "Frontend API Base URL",
    }
    all_configured = True
    for key, label in keys_status.items():
        val = config.get(key) or os.environ.get(key)
        # Fallback for GEMINI_API_KEY or GCP_PROJECT_ID
        if not val and key == "GOOGLE_API_KEY":
            val = config.get("GEMINI_API_KEY") or os.environ.get("GEMINI_API_KEY")
        if not val and key == "FIRESTORE_PROJECT_ID":
            val = config.get("GCP_PROJECT_ID") or os.environ.get("GCP_PROJECT_ID")

        ok = bool(val)
        if key in ["GOOGLE_API_KEY", "FIRESTORE_PROJECT_ID"]:
            all_configured &= ok
        masked = (val[:4] + "••••" + val[-4:]) if val and len(val) > 8 else ("set" if val else "")
        _check(ok, label, ok_msg=masked or (str(val) if val else "set"), fail_msg="NOT SET")

    # ── Data files ────────────────────────────────────────────────────────────
    console.print()
    console.print(Rule("[bold]Data Files[/bold]"))
    data_files = {
        "data/hospitals_raw.json": "Raw hospital locations (OSM)",
        "data/hospitals.json":     "Enriched hospital data (seeded)",
        "data/demo_cases.json":    "Demo clinical scenarios",
    }
    for filepath, label in data_files.items():
        path = PROJECT_ROOT / filepath
        exists = path.exists()
        size = f"{path.stat().st_size // 1024} KB" if exists else ""
        _check(exists, label, ok_msg=size or "exists", fail_msg="missing → run seed")

    # ── Model configuration ───────────────────────────────────────────────────
    console.print()
    console.print(Rule("[bold]Gemini LLM Tiers[/bold]"))
    try:
        from lifeline.models import AGENT_MODELS
        table = Table(show_header=True, header_style="bold", box=None, padding=(0, 2))
        table.add_column("Agent Role")
        table.add_column("Assigned Gemini Model", style="green")
        for agent, model in AGENT_MODELS.items():
            table.add_row(agent, model)
        console.print(table)
    except Exception as e:
        console.print(f"  [red]Could not load model registry: {e}[/red]")

    # ── Summary ───────────────────────────────────────────────────────────────
    console.print()
    if all_configured:
        console.print("[bold green]✅  System is fully configured and ready.[/bold green]")
        console.print("Run [bold]lifeline run[/bold] to start all services.")
    else:
        console.print("[bold yellow]⚠  Some configuration is optional or missing.[/bold yellow]")
        console.print("Run [bold]lifeline init[/bold] to configure environment variables.")
    console.print()


# ══════════════════════════════════════════════════════════════════════════════
# run
# ══════════════════════════════════════════════════════════════════════════════
@app.command()
def run(
    host: Annotated[str, typer.Option("--host", "-h", help="Bind host address")] = "0.0.0.0",
    port: Annotated[int, typer.Option("--port", "-p", help="FastAPI backend port")] = 8000,
    frontend_port: Annotated[int, typer.Option("--frontend-port", help="Next.js frontend port")] = 3000,
    reload: Annotated[bool, typer.Option("--reload", help="Enable auto-reload for development")] = False,
    backend_only: Annotated[bool, typer.Option("--backend-only", "-b", help="Start only the FastAPI backend")] = False,
):
    """
    Start the LifeLine Agent backend and user frontend.

    By default launches BOTH services concurrently:
      • Backend API   → http://localhost:8000
      • API Docs      → http://localhost:8000/docs
      • Next.js App   → http://localhost:3000

    Use --backend-only to launch just the FastAPI server.
    """
    _banner()
    _inject_config()

    start_script = PROJECT_ROOT / "start.py"

    if not backend_only and start_script.exists():
        console.print(Panel(
            "[bold green]▶  Starting LifeLine Agent Stack (Backend + Frontend)[/bold green]\n\n"
            f"  FastAPI Backend  →  [link]http://localhost:{port}[/link]\n"
            f"  API Docs         →  [link]http://localhost:{port}/docs[/link]\n"
            f"  Next.js Frontend →  [link]http://localhost:{frontend_port}[/link]\n\n"
            "[dim]Press Ctrl+C to gracefully terminate all services[/dim]",
            border_style="green",
            expand=False,
        ))
        cmd = [
            sys.executable, str(start_script),
            "--port", str(port),
            "--frontend-port", str(frontend_port),
        ]
        if reload:
            cmd.append("--reload")
        try:
            subprocess.run(cmd, cwd=str(PROJECT_ROOT))
        except KeyboardInterrupt:
            pass
        return

    # Backend-only mode
    console.print(Panel(
        f"[bold yellow]▶  Starting FastAPI Backend (Port {port})[/bold yellow]\n\n"
        f"  URL:     [link]http://{host}:{port}[/link]\n"
        f"  Docs:    [link]http://{host}:{port}/docs[/link]\n"
        f"  Health:  [link]http://{host}:{port}/health[/link]\n"
        f"  Reload:  {'enabled' if reload else 'disabled'}",
        border_style="yellow",
        expand=False,
    ))
    cmd = [
        sys.executable, "-m", "uvicorn",
        "lifeline.main:app",
        "--host", host,
        "--port", str(port),
    ]
    if reload:
        cmd.append("--reload")
    try:
        subprocess.run(cmd, cwd=str(PROJECT_ROOT))
    except KeyboardInterrupt:
        pass


# ══════════════════════════════════════════════════════════════════════════════
# ui
# ══════════════════════════════════════════════════════════════════════════════
@app.command()
def ui(
    port: Annotated[int, typer.Option("--port", "-p", help="Next.js frontend port")] = 3000,
    no_browser: Annotated[bool, typer.Option("--no-browser", help="Do not automatically open browser")] = False,
):
    """
    Launch the Next.js multi-role user frontend.

    Supports Blood & Organ Donor, Hospital Staff ER Ops, and Government Authority portals.
    Opens at http://localhost:3000
    """
    _banner("Next.js Multi-Role Frontend Portal")
    _inject_config()

    frontend_dir = PROJECT_ROOT / "frontend"
    pkg_json = frontend_dir / "package.json"

    if not pkg_json.exists():
        err_console.print(f"✗ Frontend directory or package.json not found at: {frontend_dir}")
        raise typer.Exit(1)

    npm_bin = shutil.which("npm.cmd" if sys.platform == "win32" else "npm") or "npm"

    console.print(Panel(
        f"[bold cyan]▶  Launching Next.js Frontend[/bold cyan]\n\n"
        f"  URL:  [link]http://localhost:{port}[/link]\n\n"
        "[dim]Ensure FastAPI backend is running: lifeline run --backend-only[/dim]",
        border_style="cyan",
        expand=False,
    ))

    if not no_browser:
        try:
            import webbrowser
            webbrowser.open(f"http://localhost:{port}")
        except Exception:
            pass

    cmd = [npm_bin, "run", "dev", "--", "-p", str(port)]
    try:
        subprocess.run(cmd, cwd=str(frontend_dir), shell=(sys.platform == "win32"))
    except KeyboardInterrupt:
        pass
    except Exception as e:
        err_console.print(f"✗ Could not start npm dev server: {e}")
        console.print("\n[yellow]To run manually:[/yellow]")
        console.print(f"  cd frontend && npm install && npm run dev\n")


# ══════════════════════════════════════════════════════════════════════════════
# dispatch
# ══════════════════════════════════════════════════════════════════════════════
@app.command()
def dispatch(
    scenario: Annotated[
        Optional[str],
        typer.Argument(help="Scenario key from data/demo_cases.json (or leave blank to pick interactively)")
    ] = None,
    lat: Annotated[float, typer.Option(help="Patient latitude coordinate")] = 19.055,
    lng: Annotated[float, typer.Option(help="Patient longitude coordinate")] = 72.840,
    api_url: Annotated[str, typer.Option("--api-url", help="API URL for dispatch execution")] = "http://localhost:8000/dispatch",
):
    """
    Execute the multi-agent emergency dispatch pipeline directly from the terminal.

    Runs NEWS2 Scoring → Gemini 3.1 Pro Triage → Gemini 3.5 Flash Bed Matching → OSRM Routing → Briefing.
    """
    _banner("Autonomous Dispatch Pipeline")
    _inject_config()

    cases_path = PROJECT_ROOT / "data" / "demo_cases.json"
    if not cases_path.exists():
        err_console.print("✗  data/demo_cases.json not found.")
        raise typer.Exit(1)

    try:
        with open(cases_path, "r", encoding="utf-8") as f:
            cases = json.load(f)
    except Exception as e:
        err_console.print(f"✗  Could not parse demo_cases.json: {e}")
        raise typer.Exit(1)

    if not scenario:
        console.print("[bold]Available Emergency Scenarios:[/bold]")
        case_keys = list(cases.keys())
        for i, name in enumerate(case_keys, 1):
            console.print(f"  {i}. {name}")
        choice = Prompt.ask("\nSelect scenario number", choices=[str(i) for i in range(1, len(case_keys) + 1)], default="1")
        scenario = case_keys[int(choice) - 1]

    case_data = cases.get(scenario)
    if not case_data:
        err_console.print(f"✗  Scenario '{scenario}' not found in demo_cases.json.")
        raise typer.Exit(1)

    console.print(f"\n[bold]Running Emergency Case:[/bold] [red]{scenario}[/red]")
    console.print(f"[dim]Patient GPS Location: ({lat}, {lng})[/dim]\n")

    result = None

    # 1. Try sending to live API endpoint
    try:
        import requests
        payload = {"case": case_data, "patient_location": {"lat": lat, "lng": lng}}
        with Progress(SpinnerColumn(), TextColumn("[bold green]Executing agent pipeline via API...[/bold green]"), console=console) as p:
            p.add_task("dispatch", total=None)
            resp = requests.post(api_url, json=payload, timeout=45)
            if resp.ok:
                result = resp.json()
    except Exception:
        pass

    # 2. Fallback: Execute pipeline in-process
    if not result:
        try:
            from lifeline.schemas import Case, Location
            from lifeline.orchestrator import run_dispatch

            case_obj = Case(**case_data)
            loc_obj = Location(lat=lat, lng=lng)

            with Progress(SpinnerColumn(), TextColumn("[bold yellow]Executing in-process multi-agent pipeline...[/bold yellow]"), console=console) as p:
                p.add_task("pipeline", total=None)
                result = run_dispatch(case_obj, loc_obj)
        except Exception as e:
            err_console.print(f"✗ Pipeline execution error: {e}")
            raise typer.Exit(1)

    # ── Display Pretty Results ────────────────────────────────────────────────
    console.print()
    console.print(Rule("[bold red]🚨 NEWS2 Clinical Score[/bold red]"))
    news2 = result.get("news2", {})
    console.print(f"  Total Score:  [bold yellow]{news2.get('score', '—')}[/bold yellow]")
    console.print(f"  Risk Band:    [bold]{str(news2.get('risk_band', '—')).upper()}[/bold]")

    console.print(Rule("[bold blue]🩺 Triage Reasoning (Gemini 3.1 Pro)[/bold blue]"))
    triage = result.get("triage", {})
    console.print(f"  Severity:     [bold red]{triage.get('severity_label', '—').upper()}[/bold red]")
    console.print(f"  Specialty:    [bold]{triage.get('required_specialty', '—')}[/bold]")
    console.print(f"  Clinical Log: [dim]{triage.get('notes', '—')}[/dim]")

    console.print(Rule("[bold green]🏥 Bed-Matching (Gemini 3.5 Flash + OSM)[/bold green]"))
    match = result.get("bed_match", {})
    hospital = match.get("chosen_hospital", {})
    console.print(f"  Destination:  [bold green]{hospital.get('name', '—')}[/bold green]")
    if hospital.get("eta_minutes"):
        console.print(f"  Drive ETA:    [bold]{hospital['eta_minutes']} min[/bold] ({hospital.get('distance_km', '?')} km)")
    console.print(f"  Match Rationale: [dim]{match.get('reasoning', '—')}[/dim]")

    alts = match.get("alternatives", [])
    if alts:
        alt_names = [a.get("name", "") for a in alts if isinstance(a, dict)]
        console.print(f"  Alternatives: [dim]{', '.join(alt_names)}[/dim]")

    if result.get("briefing"):
        console.print(Rule("[bold magenta]📋 SBAR Pre-Arrival Briefing[/bold magenta]"))
        console.print(f"  [italic]{result['briefing'].get('pre_arrival_brief', '')}[/italic]")

    if result.get("audit_id"):
        console.print(f"\n[dim]Audit Trace ID: {result['audit_id']}[/dim]")
    console.print()


# ══════════════════════════════════════════════════════════════════════════════
# logs
# ══════════════════════════════════════════════════════════════════════════════
@app.command()
def logs(
    limit: Annotated[int, typer.Option("--limit", "-n", help="Number of recent records to display")] = 10,
):
    """Stream recent Firestore dispatch audit records."""
    _banner("Audit Log Streamer")
    _inject_config()

    records = []
    try:
        from lifeline.tools.firestore_client import get_recent_cases
        records = get_recent_cases(limit=limit)
    except Exception as e:
        console.print(f"[yellow]Notice: Firestore client unavailable ({e}).[/yellow]")

    if not records:
        console.print("[dim]No remote Firestore audit records found. Run a dispatch to generate logs.[/dim]\n")
        return

    table = Table(
        title=f"Last {len(records)} Emergency Dispatch Audit Records",
        show_header=True,
        header_style="bold",
        border_style="dim",
    )
    table.add_column("Case ID", style="dim", width=14)
    table.add_column("Timestamp", width=22)
    table.add_column("Severity", width=12)
    table.add_column("Specialty", width=14)
    table.add_column("Assigned Facility", width=28)
    table.add_column("ETA (min)", width=10)

    for rec in records:
        triage = rec.get("triage", {})
        match = rec.get("bed_match", {}).get("chosen_hospital", {})
        severity = triage.get("severity_label", "—")
        color = {"critical": "red", "moderate": "yellow", "mild": "green"}.get(severity.lower(), "white")
        table.add_row(
            rec.get("_id", rec.get("id", "CASE-xxxx"))[:12],
            rec.get("_timestamp", "—")[:19].replace("T", " "),
            f"[{color}]{severity.upper()}[/{color}]",
            triage.get("required_specialty", "—"),
            match.get("name", "—")[:26],
            str(match.get("eta_minutes", "—")),
        )

    console.print(table)
    console.print()


# ══════════════════════════════════════════════════════════════════════════════
# fetch-hospitals
# ══════════════════════════════════════════════════════════════════════════════
@app.command(name="fetch-hospitals")
def fetch_hospitals(
    city: Annotated[str, typer.Argument(help=f"Target city. Supported: {', '.join(CITIES)}")] = "mumbai",
):
    """Pull real hospital locations from OpenStreetMap (Overpass API)."""
    _banner("OpenStreetMap Hospital Ingestion")
    _run_fetch(city)


def _run_fetch(city: str):
    from lifeline.tools.places_api import fetch_hospitals_overpass
    (PROJECT_ROOT / "data").mkdir(exist_ok=True)

    with Progress(SpinnerColumn(), TextColumn("[progress.description]{task.description}"), console=console) as progress:
        task = progress.add_task(f"Querying OpenStreetMap Overpass API for [bold]{city}[/bold]...", total=None)
        try:
            hospitals = fetch_hospitals_overpass(city)
            progress.update(task, description=f"[green]✓ Retrieved {len(hospitals)} facilities in {city}[/green]")
        except Exception as e:
            progress.stop()
            err_console.print(f"✗ OSM Overpass error: {e}")
            raise typer.Exit(1)

    out_path = PROJECT_ROOT / "data" / "hospitals_raw.json"
    with open(out_path, "w", encoding="utf-8") as f:
        json.dump(hospitals, f, indent=2)

    console.print(f"[green]✓ Saved {len(hospitals)} raw facilities → [bold]{out_path.name}[/bold][/green]")
    console.print("[dim]Next step: run [bold]lifeline seed[/bold] to enrich with bed availability.[/dim]\n")


# ══════════════════════════════════════════════════════════════════════════════
# seed
# ══════════════════════════════════════════════════════════════════════════════
@app.command()
def seed(
    icu_max: Annotated[int, typer.Option(help="Max ICU beds per facility")] = 12,
    general_max: Annotated[int, typer.Option(help="Max general beds per facility")] = 40,
    surgical_max: Annotated[int, typer.Option(help="Max surgical beds per facility")] = 8,
):
    """Enrich raw hospital data with simulated bed counts & clinical specialties."""
    _banner("Hospital Data Seeder")
    _run_seed(icu_max, general_max, surgical_max)


def _run_seed(icu_max: int = 12, general_max: int = 40, surgical_max: int = 8):
    import random
    specialties_pool = ["cardiac", "trauma", "general", "surgical", "pediatric", "burn", "neurology"]

    data_dir = PROJECT_ROOT / "data"
    data_dir.mkdir(parents=True, exist_ok=True)
    raw_path = data_dir / "hospitals_raw.json"
    if not raw_path.exists():
        err_console.print(
            "✗ data/hospitals_raw.json not found.\n"
            "  Run: [bold]lifeline fetch-hospitals[/bold] first."
        )
        raise typer.Exit(1)

    with open(raw_path, "r", encoding="utf-8") as f:
        hospitals = json.load(f)

    with Progress(SpinnerColumn(), TextColumn("{task.description}"), console=console) as p:
        task = p.add_task(f"Enriching {len(hospitals)} hospital records...", total=None)
        for h in hospitals:
            h["icu_beds"] = max(0, random.randint(1, icu_max) - random.randint(0, 3))
            h["general_beds"] = max(0, random.randint(5, general_max) - random.randint(0, 10))
            h["surgical_beds"] = max(0, random.randint(1, surgical_max) - random.randint(0, 2))
            h["specialties"] = random.sample(specialties_pool, k=random.randint(1, 3))
        p.update(task, description=f"[green]✓ Enriched {len(hospitals)} hospital records[/green]")

    out_path = data_dir / "hospitals.json"
    with open(out_path, "w", encoding="utf-8") as f:
        json.dump(hospitals, f, indent=2)

    console.print(f"[green]✓ Saved enriched hospital dataset → [bold]{out_path.name}[/bold][/green]")
    console.print("[dim]Bed data is plausibly simulated for hackathon evaluation.[/dim]\n")


# ══════════════════════════════════════════════════════════════════════════════
# test
# ══════════════════════════════════════════════════════════════════════════════
@app.command()
def test(
    verbose: Annotated[bool, typer.Option("-v", "--verbose", help="Verbose test execution output")] = False,
    cov: Annotated[bool, typer.Option("--cov", help="Generate code coverage report")] = False,
):
    """Run test suite with pytest."""
    _banner("Test Suite Runner")
    args = [sys.executable, "-m", "pytest", "tests/"]
    if verbose:
        args.append("-v")
    if cov:
        args += ["--cov=lifeline", "--cov-report=term-missing"]
    
    result = subprocess.run(args)
    raise typer.Exit(result.returncode)


# ══════════════════════════════════════════════════════════════════════════════
# Main Entrypoint
# ══════════════════════════════════════════════════════════════════════════════
def main():
    app()


if __name__ == "__main__":
    main()
