"""
LifeLine Agent CLI
==================
Installed as the `lifeline` command when you run:  pip install -e .
Also runnable as:                                   python -m lifeline

Commands
--------
  lifeline                  -> show help
  lifeline version          -> show version
  lifeline init             -> interactive setup wizard (first-run)
  lifeline status           -> system health dashboard
  lifeline admin            -> super admin panel (API keys, Firebase login)
  lifeline run              -> start FastAPI agent server
  lifeline ui               -> launch demo Streamlit UI
  lifeline fetch-hospitals  -> pull real hospital data (OpenStreetMap)
  lifeline seed             -> enrich hospitals with simulated bed data
  lifeline dispatch         -> run a single dispatch from the terminal
  lifeline test             -> run test suite
  lifeline logs             -> tail recent Firestore audit records
"""

from __future__ import annotations

import io
import json
import os
import subprocess
import sys
import time
from pathlib import Path
from typing import Annotated, Optional

import typer
from rich import print as rprint
from rich.console import Console
from rich.panel import Panel
from rich.progress import Progress, SpinnerColumn, TextColumn
from rich.prompt import Confirm, Prompt
from rich.rule import Rule
from rich.table import Table

# ── Windows UTF-8 fix ─────────────────────────────────────────────────────────
# Force UTF-8 output so emoji render correctly on Windows terminals.
# Falls back gracefully if the terminal truly can't handle it.
if sys.platform == "win32":
    try:
        sys.stdout.reconfigure(encoding="utf-8", errors="replace")
        sys.stderr.reconfigure(encoding="utf-8", errors="replace")
    except Exception:
        pass

# ── App ───────────────────────────────────────────────────────────────────────
app = typer.Typer(
    name="lifeline",
    help="[LifeLine Agent] Autonomous Emergency Dispatch powered by Gemini + ADK",
    add_completion=True,
    rich_markup_mode="rich",
    no_args_is_help=True,
    pretty_exceptions_show_locals=False,
)

console = Console()
err_console = Console(stderr=True, style="bold red")

# ── Constants ─────────────────────────────────────────────────────────────────
PROJECT_ROOT = Path(__file__).parent.parent
CITIES = ["mumbai", "delhi", "bangalore", "london", "seattle", "new york"]


# ══════════════════════════════════════════════════════════════════════════════
# SHARED HELPERS
# ══════════════════════════════════════════════════════════════════════════════

def _banner(subtitle: str = "Autonomous Emergency Dispatch · Gemini + ADK + Firebase"):
    from lifeline import __version__
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
    """Load encrypted admin config → push into os.environ. Returns config dict."""
    try:
        from admin.config_manager import get_runtime_config, inject_to_env
        config = get_runtime_config()
        inject_to_env(config)
        if warn and not config.get("GEMINI_API_KEY"):
            console.print(
                "[yellow]⚠  Gemini API key not configured.[/yellow] "
                "Run [bold]lifeline init[/bold] or [bold]lifeline admin[/bold] to set it up.\n"
            )
        return config
    except Exception:
        return {}


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
    """Show the installed version of LifeLine Agent."""
    from lifeline import __version__, __author__
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
# init  ← THE FIRST THING A NEW USER RUNS
# ══════════════════════════════════════════════════════════════════════════════
@app.command()
def init():
    """
    Interactive first-run setup wizard.

    Guides you through:
      1. Checking dependencies
      2. Creating your Firebase admin account
      3. Setting all required API keys
      4. Pulling hospital data for your demo city
    """
    _banner("First-Run Setup Wizard")

    console.print("[bold]Welcome to LifeLine Agent![/bold]")
    console.print(
        "This wizard will get you from zero to a running agent in under 5 minutes.\n"
    )

    # ── Step 1: Dependency check ──────────────────────────────────────────────
    console.print(Rule("[bold]Step 1 — Dependency Check[/bold]"))
    all_ok = True

    # Python version
    py_ok = sys.version_info >= (3, 11)
    all_ok &= _check(py_ok, "Python ≥ 3.11", sys.version.split()[0], sys.version.split()[0])

    # Check key packages
    for pkg_name, import_name in [
        ("google-adk", "google.adk"),
        ("google-genai", "google.genai"),
        ("firebase-admin", "firebase_admin"),
        ("fastapi", "fastapi"),
        ("streamlit", "streamlit"),
        ("typer", "typer"),
        ("rich", "rich"),
    ]:
        try:
            __import__(import_name)
            all_ok &= _check(True, pkg_name)
        except ImportError:
            all_ok &= _check(False, pkg_name, fail_msg="NOT INSTALLED")

    console.print()
    if not all_ok:
        console.print("[yellow]Some packages are missing. Run:[/yellow]")
        console.print("  [bold]pip install -e \".[dev]\"[/bold]\n")
        if not Confirm.ask("Continue anyway?", default=False):
            raise typer.Exit(1)

    # ── Step 2: Firebase project check ───────────────────────────────────────
    console.print(Rule("[bold]Step 2 — Firebase & API Keys[/bold]"))
    console.print(
        "LifeLine Agent uses Firebase for authentication and Firestore for audit logs.\n"
        "You'll need a Firebase project. Create one free at [link]https://console.firebase.google.com[/link]\n"
    )

    has_keys = Confirm.ask(
        "Do you have your Firebase Web API Key and Service Account JSON ready?",
        default=False,
    )
    if has_keys:
        console.print(
            "\n[green]Great![/green] Opening the Admin Panel now — "
            "go to the [bold]🔑 API Keys[/bold] tab to enter them.\n"
        )
        time.sleep(1)
        subprocess.run([sys.executable, "-m", "streamlit", "run",
                        str(PROJECT_ROOT / "admin" / "superadmin.py")])
    else:
        console.print(
            "\n[yellow]No problem.[/yellow] When you're ready:\n"
            "  1. Create a Firebase project → [link]https://console.firebase.google.com[/link]\n"
            "  2. Run [bold]lifeline admin[/bold] to enter your keys\n"
        )

    # ── Step 3: Demo city ─────────────────────────────────────────────────────
    console.print(Rule("[bold]Step 3 — Hospital Data[/bold]"))
    console.print("Pull real hospital locations from OpenStreetMap for your demo city.\n")

    city = Prompt.ask(
        "Which city should we use?",
        choices=CITIES,
        default="mumbai",
    )

    if Confirm.ask(f"Fetch hospital data for [bold]{city}[/bold] now?", default=True):
        _run_fetch(city)
        _run_seed()

    # ── Done ──────────────────────────────────────────────────────────────────
    console.print()
    console.print(Panel(
        "[bold green]✅  Setup complete![/bold green]\n\n"
        "Next steps:\n"
        "  [bold]lifeline run[/bold]    → start the agent API server\n"
        "  [bold]lifeline ui[/bold]     → open the demo dispatch UI\n"
        "  [bold]lifeline status[/bold] → check system health\n",
        border_style="green",
        expand=False,
    ))


# ══════════════════════════════════════════════════════════════════════════════
# status  ← REAL-TIME HEALTH DASHBOARD
# ══════════════════════════════════════════════════════════════════════════════
@app.command()
def status():
    """Show a live system health dashboard — config, data files, services."""
    _banner("System Status Dashboard")
    config = _inject_config(warn=False)

    # ── Config status ─────────────────────────────────────────────────────────
    console.print(Rule("[bold]Configuration[/bold]"))
    keys_status = {
        "GEMINI_API_KEY":                "Gemini API Key",
        "GCP_PROJECT_ID":                "GCP Project ID",
        "FIREBASE_WEB_API_KEY":          "Firebase Web API Key",
        "FIREBASE_SERVICE_ACCOUNT_JSON": "Firebase Service Account",
        "FIRESTORE_COLLECTION":          "Firestore Collection",
        "DEMO_CITY":                     "Demo City",
    }
    all_configured = True
    for key, label in keys_status.items():
        val = config.get(key) or os.environ.get(key)
        ok = bool(val)
        all_configured &= ok
        masked = (val[:4] + "••••" + val[-4:]) if val and len(val) > 8 else ("set" if val else "")
        _check(ok, label, ok_msg=masked or "set", fail_msg="NOT SET")

    # ── Data files ────────────────────────────────────────────────────────────
    console.print()
    console.print(Rule("[bold]Data Files[/bold]"))
    data_files = {
        "data/hospitals_raw.json": "Raw hospital locations (OSM)",
        "data/hospitals.json":     "Enriched hospital data (seeded)",
        "data/demo_cases.json":    "Demo scenarios",
    }
    for filepath, label in data_files.items():
        path = PROJECT_ROOT / filepath
        exists = path.exists()
        size = f"{path.stat().st_size // 1024} KB" if exists else ""
        _check(exists, label, ok_msg=size or "exists", fail_msg="missing → run fetch/seed")

    # ── Model info ────────────────────────────────────────────────────────────
    console.print()
    console.print(Rule("[bold]Models[/bold]"))
    try:
        from lifeline.models import AGENT_MODELS
        table = Table(show_header=True, header_style="bold", box=None, padding=(0, 2))
        table.add_column("Agent")
        table.add_column("Model", style="green")
        for agent, model in AGENT_MODELS.items():
            table.add_row(agent, model)
        console.print(table)
    except Exception as e:
        console.print(f"  [red]Could not load models: {e}[/red]")

    # ── Summary ───────────────────────────────────────────────────────────────
    console.print()
    if all_configured:
        console.print("[bold green]✅  System is fully configured and ready.[/bold green]")
        console.print("Run [bold]lifeline run[/bold] to start the agent server.")
    else:
        console.print("[bold yellow]⚠  Some configuration is missing.[/bold yellow]")
        console.print("Run [bold]lifeline init[/bold] or [bold]lifeline admin[/bold] to fix it.")
    console.print()


# ══════════════════════════════════════════════════════════════════════════════
# admin
# ══════════════════════════════════════════════════════════════════════════════
@app.command()
def admin():
    """
    Launch the Super Admin Panel.

    Set API keys, manage Firebase auth, view system configuration.
    Opens at [link]http://localhost:8501[/link]
    """
    _banner("Super Admin Panel")
    console.print("[dim]Opening admin panel at http://localhost:8501 ...[/dim]\n")
    subprocess.run([
        sys.executable, "-m", "streamlit", "run",
        str(PROJECT_ROOT / "admin" / "superadmin.py"),
        "--server.headless", "false",
        "--browser.gatherUsageStats", "false",
    ])


# ══════════════════════════════════════════════════════════════════════════════
# run
# ══════════════════════════════════════════════════════════════════════════════
@app.command()
def run(
    host: Annotated[str, typer.Option("--host", "-h", help="Bind host")] = "0.0.0.0",
    port: Annotated[int, typer.Option("--port", "-p", help="Bind port")] = 8000,
    reload: Annotated[bool, typer.Option("--reload", help="Auto-reload (dev mode)")] = False,
    workers: Annotated[int, typer.Option("--workers", "-w", help="Worker processes")] = 1,
):
    """
    Start the LifeLine Agent API server (FastAPI + uvicorn).

    Endpoints:
      GET  /health     → liveness probe
      POST /dispatch   → run the full agent pipeline
      GET  /docs       → interactive Swagger UI
    """
    _banner()
    _inject_config()

    console.print(Panel(
        f"[bold green]▶  Starting API Server[/bold green]\n\n"
        f"  URL:      [link]http://{host}:{port}[/link]\n"
        f"  Docs:     [link]http://{host}:{port}/docs[/link]\n"
        f"  Health:   [link]http://{host}:{port}/health[/link]\n"
        f"  Workers:  {workers}\n"
        f"  Reload:   {'on (dev mode)' if reload else 'off'}",
        border_style="green",
        expand=False,
    ))

    args = [
        sys.executable, "-m", "uvicorn",
        "lifeline.main:app",
        "--host", host,
        "--port", str(port),
        "--workers", str(workers),
    ]
    if reload:
        args.append("--reload")

    subprocess.run(args)


# ══════════════════════════════════════════════════════════════════════════════
# ui
# ══════════════════════════════════════════════════════════════════════════════
@app.command()
def ui():
    """
    Launch the demo dispatch UI (Streamlit).

    Shows 5 preset emergency scenarios with a Dispatch button.
    Each click runs the full Triage → Bed-Matching pipeline live.
    Opens at [link]http://localhost:8501[/link]
    """
    _banner("Demo Dispatch UI")
    _inject_config()
    console.print("[dim]Opening React frontend at http://localhost:5173 ...[/dim]\n")
    
    frontend_dir = PROJECT_ROOT / "frontend"
    if not (frontend_dir / "node_modules").exists():
        console.print("[yellow]First run: installing npm dependencies...[/yellow]")
        subprocess.run(["npm", "install"], cwd=frontend_dir, shell=sys.platform == "win32")

    subprocess.run(["npm", "run", "dev"], cwd=frontend_dir, shell=sys.platform == "win32")


# ══════════════════════════════════════════════════════════════════════════════
# fetch-hospitals
# ══════════════════════════════════════════════════════════════════════════════
@app.command(name="fetch-hospitals")
def fetch_hospitals(
    city: Annotated[str, typer.Argument(help=f"City to fetch. Options: {', '.join(CITIES)}")] = "mumbai",
):
    """
    Pull real hospital locations from OpenStreetMap (Overpass API).

    No API key required. Saves to [bold]data/hospitals_raw.json[/bold].
    Run [bold]lifeline seed[/bold] next to add simulated bed data.
    """
    _banner()
    _run_fetch(city)


def _run_fetch(city: str):
    from lifeline.tools.places_api import fetch_hospitals_overpass
    (PROJECT_ROOT / "data").mkdir(exist_ok=True)

    with Progress(
        SpinnerColumn(),
        TextColumn("[progress.description]{task.description}"),
        console=console,
    ) as progress:
        task = progress.add_task(
            f"Fetching hospitals in [bold]{city}[/bold] from OpenStreetMap...", total=None
        )
        try:
            hospitals = fetch_hospitals_overpass(city)
            progress.update(task, description=f"[green]✓  Found {len(hospitals)} hospitals[/green]")
        except Exception as e:
            progress.stop()
            err_console.print(f"✗ Overpass API error: {e}")
            raise typer.Exit(1)

    out_path = PROJECT_ROOT / "data" / "hospitals_raw.json"
    with open(out_path, "w") as f:
        json.dump(hospitals, f, indent=2)

    console.print(f"[green]✓[/green]  Saved [bold]{len(hospitals)}[/bold] hospitals → [dim]{out_path}[/dim]")
    console.print("[dim]Next: run [bold]lifeline seed[/bold] to add bed data.[/dim]\n")


# ══════════════════════════════════════════════════════════════════════════════
# seed
# ══════════════════════════════════════════════════════════════════════════════
@app.command()
def seed(
    icu_max:     Annotated[int, typer.Option(help="Max ICU beds")] = 12,
    general_max: Annotated[int, typer.Option(help="Max general beds")] = 40,
    surgical_max:Annotated[int, typer.Option(help="Max surgical beds")] = 8,
):
    """
    Add simulated bed counts & specialties to hospitals_raw.json.

    Saves to [bold]data/hospitals.json[/bold] — the Bed-Matching Agent's source of truth.
    Bed data is intentionally simulated (real EHR integration is future work).
    """
    _banner()
    _run_seed(icu_max, general_max, surgical_max)


def _run_seed(icu_max=12, general_max=40, surgical_max=8):
    import random
    SPECIALTIES = ["cardiac", "trauma", "general", "surgical", "pediatric", "burn"]

    raw_path = PROJECT_ROOT / "data" / "hospitals_raw.json"
    if not raw_path.exists():
        err_console.print(
            "✗  data/hospitals_raw.json not found.\n"
            "   Run: [bold]lifeline fetch-hospitals[/bold] first."
        )
        raise typer.Exit(1)

    with open(raw_path) as f:
        hospitals = json.load(f)

    with Progress(SpinnerColumn(), TextColumn("{task.description}"), console=console) as p:
        task = p.add_task(f"Seeding {len(hospitals)} hospitals...", total=None)
        for h in hospitals:
            h["icu_beds"]      = max(0, random.randint(1, icu_max) - random.randint(0, 3))
            h["general_beds"]  = max(0, random.randint(5, general_max) - random.randint(0, 10))
            h["surgical_beds"] = max(0, random.randint(1, surgical_max) - random.randint(0, 2))
            h["specialties"]   = random.sample(SPECIALTIES, k=random.randint(1, 3))
        p.update(task, description=f"[green]✓  Seeded {len(hospitals)} hospitals[/green]")

    out_path = PROJECT_ROOT / "data" / "hospitals.json"
    with open(out_path, "w") as f:
        json.dump(hospitals, f, indent=2)

    console.print(f"[green]✓[/green]  Saved → [dim]{out_path}[/dim]")
    console.print("[dim]⚠  Bed data is SIMULATED. Real EHR integration is future work.[/dim]\n")


# ══════════════════════════════════════════════════════════════════════════════
# dispatch  ← RUN A CASE FROM THE TERMINAL
# ══════════════════════════════════════════════════════════════════════════════
@app.command()
def dispatch(
    scenario: Annotated[
        Optional[str],
        typer.Argument(help="Scenario name from data/demo_cases.json (leave blank to pick)")
    ] = None,
    lat: Annotated[float, typer.Option(help="Patient latitude")] = 19.076,
    lng: Annotated[float, typer.Option(help="Patient longitude")] = 72.877,
):
    """
    Run the full agent pipeline for a scenario directly in the terminal.

    Calls POST /dispatch on the running API server.
    Make sure [bold]lifeline run[/bold] is already running.
    """
    import requests as http

    _banner("Terminal Dispatch")
    config = _inject_config()

    cases_path = PROJECT_ROOT / "data" / "demo_cases.json"
    if not cases_path.exists():
        err_console.print("✗  data/demo_cases.json not found.")
        raise typer.Exit(1)

    with open(cases_path) as f:
        cases = json.load(f)

    if not scenario:
        console.print("[bold]Available scenarios:[/bold]")
        for i, name in enumerate(cases.keys(), 1):
            console.print(f"  {i}. {name}")
        choice = Prompt.ask("\nPick a scenario", choices=[str(i) for i in range(1, len(cases)+1)])
        scenario = list(cases.keys())[int(choice) - 1]

    case = cases.get(scenario)
    if not case:
        err_console.print(f"✗  Scenario '{scenario}' not found.")
        raise typer.Exit(1)

    payload = {**case, "patient_location": {"lat": lat, "lng": lng}}
    api_url = f"http://localhost:8000/dispatch"

    console.print(f"\n[bold]Running:[/bold] {scenario}")
    console.print(f"[dim]Patient location: ({lat}, {lng})[/dim]\n")

    with Progress(SpinnerColumn(), TextColumn("{task.description}"), console=console) as p:
        task = p.add_task("Triage Agent thinking...", total=None)
        try:
            resp = http.post(api_url, json=payload, timeout=60)
            p.update(task, description="[green]✓  Pipeline complete[/green]")
        except Exception as e:
            p.stop()
            err_console.print(f"✗  Could not reach API: {e}\n   Is [bold]lifeline run[/bold] running?")
            raise typer.Exit(1)

    if not resp.ok:
        err_console.print(f"✗  API error {resp.status_code}: {resp.text}")
        raise typer.Exit(1)

    result = resp.json()

    # Pretty print results
    console.print(Rule("[bold]Triage Result[/bold]"))
    triage = result.get("triage", {})
    console.print(f"  Severity:   [bold red]{triage.get('severity_label', '—').upper()}[/bold red]")
    console.print(f"  Specialty:  [bold]{triage.get('required_specialty', '—')}[/bold]")
    console.print(f"  Notes:      [dim]{triage.get('notes', '—')}[/dim]")

    console.print(Rule("[bold]Hospital Match[/bold]"))
    match = result.get("bed_match", {})
    hospital = match.get("chosen_hospital", {})
    console.print(f"  Hospital:   [bold green]{hospital.get('name', '—')}[/bold green]")
    if hospital.get("eta_minutes"):
        console.print(f"  ETA:        [bold]{hospital['eta_minutes']} min[/bold] ({hospital.get('distance_km', '?')} km)")
    console.print(f"  Reasoning:  [dim]{match.get('reasoning', '—')}[/dim]")

    alts = match.get("alternatives", [])
    if alts:
        console.print(f"\n  [dim]Alternatives considered: {', '.join(a['name'] for a in alts)}[/dim]")

    if result.get("briefing"):
        console.print(Rule("[bold]Pre-Arrival Brief[/bold]"))
        console.print(f"  [italic]{result['briefing'].get('pre_arrival_brief', '')}[/italic]")

    console.print()


# ══════════════════════════════════════════════════════════════════════════════
# logs  ← TAIL FIRESTORE AUDIT RECORDS
# ══════════════════════════════════════════════════════════════════════════════
@app.command()
def logs(
    limit: Annotated[int, typer.Option("--limit", "-n", help="Number of records to show")] = 10,
):
    """
    Show the most recent dispatch records from Firestore.

    Reads from the audit log collection configured in your admin panel.
    """
    _banner("Audit Log")
    _inject_config()

    try:
        from lifeline.tools.firestore_client import get_recent_cases
    except Exception as e:
        err_console.print(f"✗  Could not connect to Firestore: {e}")
        raise typer.Exit(1)

    with Progress(SpinnerColumn(), TextColumn("Loading audit records..."), console=console) as p:
        task = p.add_task("", total=None)
        try:
            records = get_recent_cases(limit=limit)
            p.update(task, description=f"[green]✓  {len(records)} records loaded[/green]")
        except Exception as e:
            p.stop()
            err_console.print(f"✗  Firestore error: {e}")
            raise typer.Exit(1)

    if not records:
        console.print("[dim]No dispatch records found. Run a dispatch to create one.[/dim]")
        return

    table = Table(
        title=f"Last {len(records)} Dispatch Records",
        show_header=True,
        header_style="bold",
        border_style="dim",
    )
    table.add_column("ID", style="dim", width=12)
    table.add_column("Timestamp", width=22)
    table.add_column("Severity", width=10)
    table.add_column("Specialty", width=12)
    table.add_column("Hospital", width=30)
    table.add_column("ETA (min)", width=10)

    for rec in records:
        triage = rec.get("triage", {})
        match = rec.get("bed_match", {}).get("chosen_hospital", {})
        severity = triage.get("severity_label", "—")
        color = {"critical": "red", "moderate": "yellow", "mild": "green"}.get(severity, "white")
        table.add_row(
            rec["id"][:10] + "…",
            rec.get("_timestamp", "—")[:19].replace("T", " "),
            f"[{color}]{severity}[/{color}]",
            triage.get("required_specialty", "—"),
            match.get("name", "—")[:28],
            str(match.get("eta_minutes", "—")),
        )

    console.print(table)
    console.print()


# ══════════════════════════════════════════════════════════════════════════════
# test
# ══════════════════════════════════════════════════════════════════════════════
@app.command()
def test(
    verbose: Annotated[bool, typer.Option("-v", "--verbose", help="Verbose pytest output")] = False,
    cov:     Annotated[bool, typer.Option("--cov", help="Show coverage report")] = False,
):
    """Run the full test suite with pytest."""
    _banner()
    args = [sys.executable, "-m", "pytest", "tests/"]
    if verbose:
        args.append("-v")
    if cov:
        args += ["--cov=lifeline", "--cov-report=term-missing"]
    result = subprocess.run(args)
    raise typer.Exit(result.returncode)


# ══════════════════════════════════════════════════════════════════════════════
# Entry point
# ══════════════════════════════════════════════════════════════════════════════
def main():
    app()


if __name__ == "__main__":
    main()

