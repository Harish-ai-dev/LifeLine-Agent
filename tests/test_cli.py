"""
Unit tests for LifeLine Agent CLI (lifeline/cli.py)
"""

import json
from pathlib import Path
import pytest
from typer.testing import CliRunner
from lifeline.cli import app, _inject_config, _check, _run_seed

runner = CliRunner()


def test_cli_help():
    """Verify root CLI help command returns 0 and lists operational verbs."""
    result = runner.invoke(app, ["--help"])
    assert result.exit_code == 0
    assert "LifeLine Agent" in result.output
    assert "version" in result.output
    assert "status" in result.output
    assert "run" in result.output
    assert "ui" in result.output
    assert "dispatch" in result.output
    assert "logs" in result.output
    assert "seed" in result.output


def test_cli_version():
    """Verify version command outputs package version and runtime info."""
    result = runner.invoke(app, ["version"])
    assert result.exit_code == 0
    assert "0.1.0" in result.output or "lifeline-agent" in result.output


def test_cli_status(monkeypatch):
    """Verify status command outputs configuration and dataset health."""
    from lifeline.cli import status
    # Direct function invocation to test status dashboard generation
    monkeypatch.setenv("DEMO_CITY", "mumbai")
    try:
        status()
    except Exception as e:
        pytest.fail(f"status() raised exception: {e}")


def test_cli_run_help():
    """Verify run --help outputs available server and port flags."""
    result = runner.invoke(app, ["run", "--help"])
    assert result.exit_code == 0
    assert "--port" in result.output
    assert "--backend-only" in result.output


def test_cli_ui_help():
    """Verify ui --help outputs frontend configuration flags."""
    result = runner.invoke(app, ["ui", "--help"])
    assert result.exit_code == 0
    assert "--port" in result.output
    assert "--no-browser" in result.output


def test_cli_dispatch_help():
    """Verify dispatch --help outputs scenario and coordinate flags."""
    result = runner.invoke(app, ["dispatch", "--help"])
    assert result.exit_code == 0
    assert "--lat" in result.output
    assert "--lng" in result.output


def test_cli_logs_help():
    """Verify logs --help outputs limit flag."""
    result = runner.invoke(app, ["logs", "--help"])
    assert result.exit_code == 0
    assert "--limit" in result.output


def test_cli_seed_help():
    """Verify seed --help outputs bed limit options."""
    result = runner.invoke(app, ["seed", "--help"])
    assert result.exit_code == 0
    assert "--icu-max" in result.output
    assert "--general-max" in result.output


def test_cli_init_help():
    """Verify init --help outputs setup wizard information."""
    result = runner.invoke(app, ["init", "--help"])
    assert result.exit_code == 0
    assert "setup" in result.output.lower() or "wizard" in result.output.lower()


def test_cli_inject_config(monkeypatch):
    """Verify _inject_config captures environment variables."""
    monkeypatch.setenv("GOOGLE_API_KEY", "test_mock_api_key")
    monkeypatch.setenv("DEMO_CITY", "test_city")
    cfg = _inject_config(warn=False)
    assert cfg.get("GOOGLE_API_KEY") == "test_mock_api_key"
    assert cfg.get("DEMO_CITY") == "test_city"


def test_cli_check_helper():
    """Verify _check returns expected boolean status."""
    assert _check(True, "Test True Component") is True
    assert _check(False, "Test False Component") is False


def test_cli_seed_execution(tmp_path, monkeypatch):
    """Verify _run_seed enriches hospital data with bed counts and specialties."""
    sample_raw = [
        {
            "name": "Test General Hospital",
            "lat": 19.05,
            "lng": 72.84,
            "city": "mumbai",
        }
    ]
    data_dir = tmp_path / "data"
    data_dir.mkdir(parents=True, exist_ok=True)
    raw_file = data_dir / "hospitals_raw.json"
    raw_file.write_text(json.dumps(sample_raw), encoding="utf-8")

    # Patch PROJECT_ROOT to temporary path for isolated execution
    monkeypatch.setattr("lifeline.cli.PROJECT_ROOT", tmp_path)

    _run_seed(icu_max=10, general_max=30, surgical_max=5)

    enriched_file = tmp_path / "data" / "hospitals.json"
    assert enriched_file.exists()

    with open(enriched_file, "r", encoding="utf-8") as f:
        enriched_data = json.load(f)

    assert len(enriched_data) == 1
    record = enriched_data[0]
    assert "icu_beds" in record
    assert "general_beds" in record
    assert "surgical_beds" in record
    assert "specialties" in record
    assert isinstance(record["specialties"], list)
