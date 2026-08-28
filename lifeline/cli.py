"""
LifeLine Agent CLI — entry point for all commands.

Usage:
    lifeline --help
    lifeline run
    lifeline admin
    lifeline fetch-hospitals --city mumbai
    lifeline seed
    lifeline test
    lifeline version
"""

import subprocess
import sys
import typer
from typing import Annotated
from rich.console import Console
from rich.panel import Panel
from rich import print as rprint

app = typer.Typer(
    name="lifeline",
    help="🚑 LifeLine Agent — AI-powered emergency dispatch system.",
    add_completion=True,
    rich_markup_mode="rich",
)
console = Console()


def _banner():
    console.print(Panel.fit(
        "[bold red]🚑 LifeLine Agent[/bold red]\n"
        "[dim]AI-powered Emergency Dispatch · Google ADK + Gemini[/dim]",
        border_style="red",
    ))


# ── version ──────────────────────────────────────────────────────────────────
@app.command()
def version():
    """Show the installed LifeLine Agent version."""
    from lifeline import __version__
    rprint(f"[bold]lifeline-agent[/bold] v[green]{__version__}[/green]")


# ── run ───────────────────────────────────────────────────────────────────────
@app.command()
def run(
    host: Annotated[str, typer.Option(help="Host to bind to")] = "0.0.0.0",
    port: Annotated[int, typer.Option(help="Port to listen on")] = 8000,
    reload: Annotated[bool, typer.Option(help="Enable auto-reload (dev mode)")] = False,
):
    """
    Start the LifeLine Agent FastAPI server.

    [dim]Loads API keys from the admin config (set via 'lifeline admin').[/dim]
    """
    _banner()
    _inject_config()
    console.print(f"[green]▶ Starting API server on http://{host}:{port}[/green]")
    args = [
        sys.executable, "-m", "uvicorn",
        "lifeline.main:app",
        "--host", host,
        "--port", str(port),
    ]
    if reload:
        args.append("--reload")
    subprocess.run(args)


# ── admin ─────────────────────────────────────────────────────────────────────
@app.command()
def admin():
    """
    Launch the Super Admin Panel (Streamlit UI).

    [dim]Use this to create your admin account and set API keys on first run.[/dim]
    """
    _banner()
    console.print("[green]▶ Opening Super Admin Panel...[/green]")
    subprocess.run([
        sys.executable, "-m", "streamlit", "run",
        "admin/superadmin.py",
        "--server.headless", "false",
    ])


# ── ui ────────────────────────────────────────────────────────────────────────
@app.command()
def ui():
    """
    Launch the demo Streamlit UI (preset scenarios + Dispatch button).
    """
    _banner()
    _inject_config()
    console.print("[green]▶ Opening LifeLine Demo UI...[/green]")
    subprocess.run([
        sys.executable, "-m", "streamlit", "run",
        "ui/streamlit_app.py",
    ])


# ── fetch-hospitals ───────────────────────────────────────────────────────────
@app.command(name="fetch-hospitals")
def fetch_hospitals(
    city: Annotated[str, typer.Option(help="City name to fetch hospitals for")] = "mumbai",
):
    """
    Pull real hospital locations from OpenStreetMap (Overpass API).

    [dim]Saves raw results to data/hospitals_raw.json.[/dim]
    """
    _banner()
    import json
    import os
    from lifeline.tools.places_api import fetch_hospitals_overpass

    os.makedirs("data", exist_ok=True)
    console.print(f"[yellow]⟳ Fetching hospitals in [bold]{city}[/bold] from OpenStreetMap...[/yellow]")
    try:
        hospitals = fetch_hospitals_overpass(city)
        out_path = "data/hospitals_raw.json"
        with open(out_path, "w") as f:
            json.dump(hospitals, f, indent=2)
        console.print(f"[green]✓ Saved {len(hospitals)} hospitals → {out_path}[/green]")
    except Exception as e:
        console.print(f"[red]✗ Failed: {e}[/red]")
        raise typer.Exit(1)


# ── seed ──────────────────────────────────────────────────────────────────────
@app.command()
def seed(
    icu_max: Annotated[int, typer.Option(help="Max ICU beds per hospital")] = 12,
    general_max: Annotated[int, typer.Option(help="Max general beds per hospital")] = 40,
    surgical_max: Annotated[int, typer.Option(help="Max surgical beds per hospital")] = 8,
):
    """
    Enrich hospitals_raw.json with simulated bed/specialty data.

    [dim]Saves enriched data to data/hospitals.json (your Bed-Matching source of truth).[/dim]
    """
    _banner()
    import json
    import random

    SPECIALTIES = ["cardiac", "trauma", "general", "surgical", "pediatric", "burn"]

    try:
        with open("data/hospitals_raw.json") as f:
            hospitals = json.load(f)
    except FileNotFoundError:
        console.print("[red]✗ data/hospitals_raw.json not found. Run 'lifeline fetch-hospitals' first.[/red]")
        raise typer.Exit(1)

    console.print(f"[yellow]⟳ Seeding {len(hospitals)} hospitals with simulated bed data...[/yellow]")
    for h in hospitals:
        # Slightly varied randomization so data looks plausible, not uniform
        h["icu_beds"]      = max(0, random.randint(1, icu_max) - random.randint(0, 3))
        h["general_beds"]  = max(0, random.randint(5, general_max) - random.randint(0, 10))
        h["surgical_beds"] = max(0, random.randint(1, surgical_max) - random.randint(0, 2))
        # Each hospital gets 1-3 specialties; trauma & cardiac hospitals are common
        num_specialties = random.randint(1, 3)
        h["specialties"]   = random.sample(SPECIALTIES, k=num_specialties)

    with open("data/hospitals.json", "w") as f:
        json.dump(hospitals, f, indent=2)

    console.print(f"[green]✓ Enriched {len(hospitals)} hospitals → data/hospitals.json[/green]")
    console.print("[dim]Note: bed/specialty data is SIMULATED — real EHR data requires private access.[/dim]")


# ── test ──────────────────────────────────────────────────────────────────────
@app.command()
def test(
    verbose: Annotated[bool, typer.Option("-v", help="Verbose output")] = False,
):
    """Run the full test suite with pytest."""
    _banner()
    args = [sys.executable, "-m", "pytest", "tests/"]
    if verbose:
        args.append("-v")
    result = subprocess.run(args)
    raise typer.Exit(result.returncode)


# ── Helper ────────────────────────────────────────────────────────────────────
def _inject_config():
    """Load admin config and push keys into os.environ before starting services."""
    try:
        from admin.config_manager import get_runtime_config, inject_to_env
        config = get_runtime_config()
        inject_to_env(config)
        if not config.get("GEMINI_API_KEY"):
            console.print(
                "[yellow]⚠ Gemini API key not set. Run 'lifeline admin' to configure.[/yellow]"
            )
    except Exception:
        pass  # Admin config is optional if env vars are set directly


# ── Entry point ───────────────────────────────────────────────────────────────
def main():
    app()


if __name__ == "__main__":
    main()

