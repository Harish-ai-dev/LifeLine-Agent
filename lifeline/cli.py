from __future__ import annotations

"""
LifeLine Agent CLI
==================
Installed as the `lifeline` command when you run:  pip install -e .
Also runnable as:                                   python -m lifeline

Operational Verbs Supported:
----------------------------
  lifeline setup           -> interactive validating key & credential setup wizard
  lifeline install         -> install python package and frontend npm dependencies
  lifeline status          -> live system health and configuration dashboard
  lifeline run             -> start API backend server and Next.js frontend (pre-flight check)
  lifeline ui              -> launch Next.js user frontend
  lifeline dispatch        -> execute agent pipeline directly from terminal
  lifeline logs            -> stream recent audit database records
  lifeline seed            -> enrich hospitals with simulated bed & specialty data
  lifeline fetch-hospitals -> pull real hospital data from OpenStreetMap (Overpass API)
  lifeline test            -> run test suite with pytest
  lifeline version         -> show version and runtime info
  lifeline init            -> alias for lifeline setup
"""

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

from lifeline.config_validator import (
    audit_full_system_config,
    validate_firebase_service_account,
    validate_firebase_web_key,
    validate_gcp_project,
    validate_gemini_key,
)

# ── Cross-Platform Windows UTF-8 Output Safety ────────────────────────────────
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
FRONTEND_DIR = PROJECT_ROOT / "frontend"
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
    """Load configuration from environment, .env file, and encrypted admin config."""
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

    # 2. Read encrypted admin config if available
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
        "PORT", "HOST", "FIREBASE_SERVICE_ACCOUNT_JSON", "FIREBASE_WEB_API_KEY",
        "GOOGLE_APPLICATION_CREDENTIALS"
    ]:
        val = os.environ.get(key)
        if val:
            config[key] = val

    return config


def _check(condition: bool, label: str, ok_msg: str = "OK", fail_msg: str = "MISSING"):
    icon = "✅" if condition else "❌"
    status = f"[green]{ok_msg}[/green]" if condition else f"[red]{fail_msg}[/red]"
    console.print(f"  {icon}  {label:<38} {status}")
    return condition


def _save_all_config(new_config: dict) -> None:
    """Save configuration to both .env and encrypted admin config."""
    # 1. Update .env
    env_file = PROJECT_ROOT / ".env"
    existing_lines = {}
    if env_file.exists():
        try:
            with open(env_file, "r", encoding="utf-8") as f:
                for line in f:
                    if line.strip() and not line.strip().startswith("#") and "=" in line:
                        k, v = line.strip().split("=", 1)
                        existing_lines[k.strip()] = v.strip().strip("'\"")
        except Exception:
            pass

    existing_lines.update(new_config)
    
    # Standard format
    env_content = [
        "# Core AI & LLM Models\n",
        f"GOOGLE_API_KEY={existing_lines.get('GOOGLE_API_KEY', '')}\n",
        f"GEMINI_API_KEY={existing_lines.get('GOOGLE_API_KEY', '')}\n\n",
        "# Server & Runtime Configuration\n",
        f"HOST={existing_lines.get('HOST', '0.0.0.0')}\n",
        f"PORT={existing_lines.get('PORT', '8000')}\n",
        f"DEMO_CITY={existing_lines.get('DEMO_CITY', 'mumbai')}\n",
        f"DEMO_AUTH_MODE={existing_lines.get('DEMO_AUTH_MODE', 'true')}\n",
        f"VITE_API_BASE_URL={existing_lines.get('VITE_API_BASE_URL', 'http://localhost:8000')}\n\n",
        "# Google Cloud & Firestore Database\n",
        f"FIRESTORE_PROJECT_ID={existing_lines.get('FIRESTORE_PROJECT_ID', '')}\n",
        f"GCP_PROJECT_ID={existing_lines.get('FIRESTORE_PROJECT_ID', '')}\n",
        f"FIRESTORE_COLLECTION={existing_lines.get('FIRESTORE_COLLECTION', 'dispatch_cases')}\n",
    ]
    if "FIREBASE_WEB_API_KEY" in existing_lines:
        env_content.append(f"FIREBASE_WEB_API_KEY={existing_lines.get('FIREBASE_WEB_API_KEY')}\n")
    if "FIREBASE_SERVICE_ACCOUNT_JSON" in existing_lines:
        env_content.append(f"FIREBASE_SERVICE_ACCOUNT_JSON={existing_lines.get('FIREBASE_SERVICE_ACCOUNT_JSON')}\n")

    with open(env_file, "w", encoding="utf-8") as f:
        f.writelines(env_content)

    # 2. Save encrypted config
    try:
        from admin.config_manager import save_config
        save_config(existing_lines)
    except Exception:
        pass


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
# setup / init
# ══════════════════════════════════════════════════════════════════════════════
@app.command()
def setup(
    key: Annotated[
        Optional[str],
        typer.Option("--key", "-k", help="Specific key/credential to reconfigure (gemini, gcp, firebase, city, auth, all)")
    ] = "all",
):
    """
    Interactive key & credential setup wizard.
    Validates each key live before saving to encrypted storage and .env.
    """
    _banner("Interactive Key & Credential Setup Wizard")
    config = _inject_config(warn=False)
    updated_values = dict(config)

    target = (key or "all").lower().strip()

    # ── 1. Gemini API Key (Mandatory) ─────────────────────────────────────────
    if target in ["all", "gemini", "google"]:
        console.print(Rule("[bold]Gemini API Key Setup (Mandatory)[/bold]"))
        curr_gemini = config.get("GOOGLE_API_KEY") or config.get("GEMINI_API_KEY") or ""
        masked = (curr_gemini[:4] + "••••" + curr_gemini[-4:]) if len(curr_gemini) > 8 else "not set"
        console.print(f"Current Gemini API Key: [cyan]{masked}[/cyan]")
        
        while True:
            new_key = Prompt.ask(
                "Enter GOOGLE_API_KEY (from https://aistudio.google.com/apikey)",
                default=curr_gemini if curr_gemini else "",
                password=True,
            )
            if not new_key.strip():
                err_console.print("⚠ Gemini API Key is mandatory for live agent reasoning.")
                if not Confirm.ask("Skip Gemini validation for now?", default=False):
                    continue
                else:
                    break

            with Progress(SpinnerColumn(), TextColumn("[bold cyan]Validating Gemini API Key live...[/bold cyan]"), console=console) as p:
                p.add_task("val", total=None)
                is_valid, msg = validate_gemini_key(new_key.strip())

            if is_valid:
                console.print(f"[bold green]✓ {msg}[/bold green]\n")
                updated_values["GOOGLE_API_KEY"] = new_key.strip()
                updated_values["GEMINI_API_KEY"] = new_key.strip()
                os.environ["GOOGLE_API_KEY"] = new_key.strip()
                break
            else:
                err_console.print(f"✗ Validation Failed: {msg}")
                if not Confirm.ask("Try entering Gemini API Key again?", default=True):
                    if Confirm.ask("Save this key anyway?", default=False):
                        updated_values["GOOGLE_API_KEY"] = new_key.strip()
                        updated_values["GEMINI_API_KEY"] = new_key.strip()
                    break

    # ── 2. GCP Project ID (Optional) ──────────────────────────────────────────
    if target in ["all", "gcp", "firestore"]:
        console.print(Rule("[bold]GCP / Firestore Project ID (Optional)[/bold]"))
        curr_gcp = config.get("FIRESTORE_PROJECT_ID") or config.get("GCP_PROJECT_ID") or ""
        new_gcp = Prompt.ask(
            "Enter GCP / Firestore Project ID (press Enter for mock offline mode)",
            default=curr_gcp if curr_gcp else "lifeline-3725b",
        )
        if new_gcp.strip():
            is_valid, msg = validate_gcp_project(new_gcp.strip())
            if is_valid:
                console.print(f"[green]✓ {msg}[/green]\n")
            else:
                console.print(f"[yellow]⚠ {msg}[/yellow]\n")
            updated_values["FIRESTORE_PROJECT_ID"] = new_gcp.strip()
            updated_values["GCP_PROJECT_ID"] = new_gcp.strip()

    # ── 3. Firebase Credentials (Optional) ────────────────────────────────────
    if target in ["all", "firebase"]:
        console.print(Rule("[bold]Firebase Credentials (Optional)[/bold]"))
        curr_sa = config.get("FIREBASE_SERVICE_ACCOUNT_JSON") or config.get("GOOGLE_APPLICATION_CREDENTIALS") or ""
        sa_path = Prompt.ask(
            "Enter path to Firebase Service Account JSON file (or press Enter to skip)",
            default=curr_sa if os.path.exists(curr_sa) else "",
        )
        if sa_path.strip():
            is_valid, msg = validate_firebase_service_account(sa_path.strip())
            if is_valid:
                console.print(f"[green]✓ {msg}[/green]\n")
                updated_values["FIREBASE_SERVICE_ACCOUNT_JSON"] = sa_path.strip()
                updated_values["GOOGLE_APPLICATION_CREDENTIALS"] = sa_path.strip()
            else:
                console.print(f"[yellow]⚠ Service Account check notice: {msg}[/yellow]\n")

        curr_web = config.get("FIREBASE_WEB_API_KEY") or ""
        web_key = Prompt.ask(
            "Enter Firebase Web API Key (optional for client auth)",
            default=curr_web,
            password=True,
        )
        if web_key.strip():
            updated_values["FIREBASE_WEB_API_KEY"] = web_key.strip()

    # ── 4. Demo City & Auth Mode ──────────────────────────────────────────────
    if target in ["all", "city", "auth"]:
        console.print(Rule("[bold]Demo Runtime Settings[/bold]"))
        curr_city = config.get("DEMO_CITY", "mumbai")
        new_city = Prompt.ask("Select default Demo City for hospital data", choices=CITIES, default=curr_city)
        updated_values["DEMO_CITY"] = new_city

        curr_auth = config.get("DEMO_AUTH_MODE", "true")
        new_auth = Confirm.ask("Enable zero-friction DEMO_AUTH_MODE?", default=(curr_auth == "true"))
        updated_values["DEMO_AUTH_MODE"] = "true" if new_auth else "false"

    # Save all updated values
    _save_all_config(updated_values)

    # ── Validation Summary Table ──────────────────────────────────────────────
    console.print()
    console.print(Rule("[bold green]Validation & Health Summary[/bold green]"))
    audit_results = audit_full_system_config(updated_values)

    table = Table(show_header=True, header_style="bold", border_style="dim")
    table.add_column("Credential / Setting", width=32)
    table.add_column("Status", width=16)
    table.add_column("Validation Details", width=42)

    all_mandatory_ok = True
    for key_name, item in audit_results.items():
        if item["mandatory"] and not item["valid"]:
            all_mandatory_ok = False
        
        status_str = "[bold green]VALIDATED[/bold green]" if item["valid"] else (
            "[bold red]FAILED[/bold red]" if item["mandatory"] else "[yellow]OFFLINE / MOCK[/yellow]"
        )
        table.add_row(item["label"], status_str, item["message"])

    console.print(table)
    console.print()

    if all_mandatory_ok:
        console.print("[bold green]✅ Configuration saved and validated successfully![/bold green]")
        console.print("Run [bold]lifeline run[/bold] to start the application stack.\n")
    else:
        console.print("[bold red]❌ Mandatory credentials failed validation.[/bold red]")
        console.print("Run [bold]lifeline setup --key gemini[/bold] to reconfigure your Gemini API Key.\n")


@app.command(name="init")
def init():
    """First-run interactive setup wizard (alias for lifeline setup)."""
    setup(key="all")


# ══════════════════════════════════════════════════════════════════════════════
# install
# ══════════════════════════════════════════════════════════════════════════════
@app.command()
def install():
    """
    Install Python backend package and Next.js frontend dependencies.
    Wraps pip install and npm install into a single unified CLI command.
    """
    _banner("Unified Package & Dependency Installer")

    # ── Step 1: Prerequisite Check ────────────────────────────────────────────
    console.print(Rule("[bold]Step 1 — Prerequisite Version Check[/bold]"))
    
    # Python check
    py_ok = sys.version_info >= (3, 11)
    _check(py_ok, "Python ≥ 3.11", sys.version.split()[0], sys.version.split()[0])
    if not py_ok:
        err_console.print("✗ Python 3.11 or higher is required. Download at https://www.python.org/downloads/")
        raise typer.Exit(1)

    # Node.js check
    node_bin = shutil.which("node") or shutil.which("node.exe")
    node_ok = False
    node_ver = "NOT INSTALLED"
    if node_bin:
        try:
            res = subprocess.run([node_bin, "-v"], capture_output=True, text=True, timeout=5, shell=(sys.platform == "win32"))
            if res.returncode == 0:
                node_ver = res.stdout.strip()
                digits = "".join([c for c in node_ver if c.isdigit() or c == "."])
                if digits:
                    major = int(digits.split(".")[0])
                    node_ok = major >= 18
        except Exception:
            pass

    _check(node_ok, "Node.js ≥ 18", node_ver, node_ver)
    if not node_ok:
        err_console.print("✗ Node.js 18 or higher is required to run the Next.js frontend. Download at https://nodejs.org/")
        raise typer.Exit(1)

    # npm check
    npm_bin = shutil.which("npm.cmd" if sys.platform == "win32" else "npm") or "npm"
    npm_ok = bool(shutil.which(npm_bin))
    _check(npm_ok, "npm package manager", "AVAILABLE", "MISSING")
    if not npm_ok:
        err_console.print("✗ npm package manager is required. Ensure Node.js and npm are installed in PATH.")
        raise typer.Exit(1)

    console.print()

    # ── Step 2: Install Python Backend Package ────────────────────────────────
    console.print(Rule("[bold]Step 2 — Python Backend Package Installation[/bold]"))
    with Progress(SpinnerColumn(), TextColumn("[bold cyan]Installing Python package (pip install -e .)...[/bold cyan]"), console=console) as p:
        p.add_task("pip", total=None)
        cmd_pip = [sys.executable, "-m", "pip", "install", "-e", ".", "--no-deps"]
        res_pip = subprocess.run(cmd_pip, cwd=str(PROJECT_ROOT), capture_output=True, text=True)

    if res_pip.returncode == 0:
        console.print("[bold green]✓ Python backend package installed successfully.[/bold green]\n")
    else:
        err_console.print("✗ Python package installation failed:")
        err_console.print(res_pip.stderr or res_pip.stdout)
        raise typer.Exit(1)

    # ── Step 3: Install Next.js Frontend Dependencies ─────────────────────────
    console.print(Rule("[bold]Step 3 — Next.js Frontend Dependencies Installation[/bold]"))
    if not FRONTEND_DIR.exists() or not (FRONTEND_DIR / "package.json").exists():
        err_console.print(f"✗ Frontend package.json not found at {FRONTEND_DIR}")
        raise typer.Exit(1)

    with Progress(SpinnerColumn(), TextColumn("[bold cyan]Installing Next.js dependencies (npm install)...[/bold cyan]"), console=console) as p:
        p.add_task("npm", total=None)
        cmd_npm = [npm_bin, "install", "--prefer-offline", "--no-audit", "--no-fund"]
        res_npm = subprocess.run(cmd_npm, cwd=str(FRONTEND_DIR), capture_output=True, text=True, shell=(sys.platform == "win32"))

    # ── Step 4: Build Next.js Frontend Production Bundle ──────────────────────
    console.print(Rule("[bold]Step 4 — Next.js Frontend Production Bundle Build[/bold]"))
    with Progress(SpinnerColumn(), TextColumn("[bold cyan]Building Next.js production bundle (npm run build)...[/bold cyan]"), console=console) as p:
        p.add_task("build", total=None)
        cmd_build = [npm_bin, "run", "build"]
        res_build = subprocess.run(cmd_build, cwd=str(FRONTEND_DIR), capture_output=True, text=True, shell=(sys.platform == "win32"))

    if res_build.returncode == 0:
        console.print("[bold green]✓ Next.js frontend production bundle built successfully.[/bold green]\n")
    else:
        console.print("[yellow]⚠ Production build notice (dev mode will still work dynamically on startup).[/yellow]\n")

    console.print(Panel(
        "[bold green]🎉  Installation Complete![/bold green]\n\n"
        "Both Python backend and Next.js frontend dependencies and build are ready.\n"
        "Run [bold]lifeline run[/bold] or [bold]lifeline start[/bold] to launch all services automatically.",
        border_style="green",
        expand=False,
    ))


# ══════════════════════════════════════════════════════════════════════════════
# status
# ══════════════════════════════════════════════════════════════════════════════
@app.command()
def status():
    """Live system health and configuration status dashboard."""
    _banner("System Status & Health Dashboard")
    config = _inject_config(warn=False)
    audit = audit_full_system_config(config)

    # ── 1. Configuration Audit Table ──────────────────────────────────────────
    console.print(Rule("[bold]API Key & Credential Audit[/bold]"))
    table = Table(show_header=True, header_style="bold", border_style="dim")
    table.add_column("Setting / Credential", width=32)
    table.add_column("Status", width=16)
    table.add_column("Validation Message", width=44)

    all_mandatory_valid = True
    for key_name, item in audit.items():
        if item["mandatory"] and not item["valid"]:
            all_mandatory_valid = False
        
        status_str = "[bold green]VALIDATED[/bold green]" if item["valid"] else (
            "[bold red]FAILED[/bold red]" if item["mandatory"] else "[yellow]OFFLINE / MOCK[/yellow]"
        )
        table.add_row(item["label"], status_str, item["message"])

    console.print(table)

    # ── 2. Data Files ─────────────────────────────────────────────────────────
    console.print()
    console.print(Rule("[bold]Hospital & Clinical Datasets[/bold]"))
    data_files = {
        "data/hospitals_raw.json": "Raw hospital locations (OSM)",
        "data/hospitals.json":     "Enriched hospital dataset (seeded)",
        "data/demo_cases.json":    "Demo clinical scenarios",
    }
    for filepath, label in data_files.items():
        path = PROJECT_ROOT / filepath
        exists = path.exists()
        size = f"{path.stat().st_size // 1024} KB" if exists else ""
        _check(exists, label, ok_msg=size or "exists", fail_msg="missing → run lifeline seed")

    # ── 3. Gemini LLM Tiers ───────────────────────────────────────────────────
    console.print()
    console.print(Rule("[bold]Gemini LLM Agent Model Tiers[/bold]"))
    try:
        from lifeline.models import AGENT_MODELS
        mod_table = Table(show_header=True, header_style="bold", box=None, padding=(0, 2))
        mod_table.add_column("Agent / Task Role")
        mod_table.add_column("Assigned Gemini Tier Model", style="green")
        for agent, model in AGENT_MODELS.items():
            mod_table.add_row(agent, model)
        console.print(mod_table)
    except Exception as e:
        console.print(f"  [red]Could not load model registry: {e}[/red]")

    # ── Summary ───────────────────────────────────────────────────────────────
    console.print()
    if all_mandatory_valid:
        console.print("[bold green]✅  System is fully configured and ready for execution.[/bold green]")
        console.print("Run [bold]lifeline run[/bold] to start the full stack.")
    else:
        console.print("[bold red]❌  Mandatory Gemini API key is missing or invalid.[/bold red]")
        console.print("Run [bold]lifeline setup --key gemini[/bold] to configure your API key.")
    console.print()


# ══════════════════════════════════════════════════════════════════════════════
# run / start
# ══════════════════════════════════════════════════════════════════════════════
@app.command()
def run(
    host: Annotated[str, typer.Option("--host", "-h", help="Bind host address")] = "0.0.0.0",
    port: Annotated[int, typer.Option("--port", "-p", help="FastAPI backend port")] = 8000,
    frontend_port: Annotated[int, typer.Option("--frontend-port", help="Next.js frontend port")] = 3000,
    adk_port: Annotated[int, typer.Option("--adk-port", help="Google ADK Web UI port")] = 8088,
    reload: Annotated[bool, typer.Option("--reload", help="Enable auto-reload for development")] = False,
    backend_only: Annotated[bool, typer.Option("--backend-only", "-b", help="Start only the FastAPI backend")] = False,
):
    """
    Start the LifeLine Agent backend, Next.js frontend, and Google ADK Web UI concurrently via start.py.
    """
    _banner()
    config = _inject_config(warn=False)

    # ── Pre-flight Key & Config Validation Check ──────────────────────────────
    audit = audit_full_system_config(config)
    gemini_status = audit["GEMINI_API_KEY"]

    if not gemini_status["valid"]:
        console.print(Panel(
            f"[bold red]🛑  STARTUP BLOCKED — MANDATORY GEMINI API KEY MISSING OR INVALID[/bold red]\n\n"
            f"  [yellow]Reason:[/yellow] {gemini_status['message']}\n\n"
            "  The LifeLine multi-agent system requires a valid Gemini API key for clinical triage,\n"
            "  bed-matching, routing, and daily intelligence summaries.\n\n"
            "  [bold cyan]To fix this issue, run:[/bold cyan]\n"
            "    [bold white]lifeline setup --key gemini[/bold white]\n\n"
            "  Get your key from: [link]https://aistudio.google.com/apikey[/link]",
            border_style="red",
            expand=False,
        ))
        raise typer.Exit(1)

    # Check optional feature degraded modes
    gcp_status = audit["GCP_PROJECT_ID"]
    fb_status = audit["FIREBASE_SERVICE_ACCOUNT"]
    if not gcp_status["valid"] or not fb_status["valid"]:
        console.print(
            "[yellow]⚡ Notice:[/yellow] Remote Firestore credentials not detected. "
            "Running in [bold cyan]Offline Dev Memory Audit Mode[/bold cyan] (mock tokens & thread-safe store active).\n"
        )

    start_script = PROJECT_ROOT / "start.py"

    if start_script.exists():
        cmd = [
            sys.executable, str(start_script),
            "--port", str(port),
            "--frontend-port", str(frontend_port),
            "--adk-port", str(adk_port),
        ]
        if backend_only:
            cmd.append("--backend-only")
        if reload:
            cmd.append("--reload")
        try:
            subprocess.run(cmd, cwd=str(PROJECT_ROOT))
        except KeyboardInterrupt:
            pass
        return

    # Fallback to direct uvicorn execution
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


@app.command(name="start")
def start_alias(
    host: Annotated[str, typer.Option("--host", "-h", help="Bind host address")] = "0.0.0.0",
    port: Annotated[int, typer.Option("--port", "-p", help="FastAPI backend port")] = 8000,
    frontend_port: Annotated[int, typer.Option("--frontend-port", help="Next.js frontend port")] = 3000,
    adk_port: Annotated[int, typer.Option("--adk-port", help="Google ADK Web UI port")] = 8088,
    reload: Annotated[bool, typer.Option("--reload", help="Enable auto-reload for development")] = False,
    backend_only: Annotated[bool, typer.Option("--backend-only", "-b", help="Start only the FastAPI backend")] = False,
):
    """Start all LifeLine Agent services (alias for lifeline run -> start.py)."""
    run(host=host, port=port, frontend_port=frontend_port, adk_port=adk_port, reload=reload, backend_only=backend_only)



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
    Opens at http://localhost:3000
    """
    _banner("Next.js Multi-Role Frontend Portal")
    _inject_config(warn=False)

    if not FRONTEND_DIR.exists() or not (FRONTEND_DIR / "package.json").exists():
        err_console.print(f"✗ Frontend directory or package.json not found at: {FRONTEND_DIR}")
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
        subprocess.run(cmd, cwd=str(FRONTEND_DIR), shell=(sys.platform == "win32"))
    except KeyboardInterrupt:
        pass
    except Exception as e:
        err_console.print(f"✗ Could not start npm dev server: {e}")
        console.print("\n[yellow]To run manually via CLI:[/yellow]")
        console.print("  [bold]lifeline install[/bold] && [bold]lifeline run[/bold]\n")


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
    config = _inject_config(warn=False)

    # ── Pre-flight Key & Config Validation Check ──────────────────────────────
    audit = audit_full_system_config(config)
    gemini_status = audit["GEMINI_API_KEY"]

    if not gemini_status["valid"]:
        console.print(Panel(
            f"[bold red]🛑  DISPATCH BLOCKED — MANDATORY GEMINI API KEY MISSING OR INVALID[/bold red]\n\n"
            f"  [yellow]Reason:[/yellow] {gemini_status['message']}\n\n"
            "  The LifeLine multi-agent system requires a valid Gemini API key for clinical triage,\n"
            "  bed-matching, routing, and daily intelligence summaries.\n\n"
            "  [bold cyan]To fix this issue, run:[/bold cyan]\n"
            "    [bold white]lifeline setup --key gemini[/bold white]\n\n"
            "  Get your key from: [link]https://aistudio.google.com/apikey[/link]",
            border_style="red",
            expand=False,
        ))
        raise typer.Exit(1)

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
    _inject_config(warn=False)

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
