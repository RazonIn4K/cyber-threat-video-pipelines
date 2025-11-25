
import pytest
import os
from pathlib import Path
import sys
import importlib

# Add scripts directory to path so we can import modules
sys.path.append(str(Path(__file__).parents[1] / "scripts"))

import config

# Helper to mock environment variables
@pytest.fixture
def mock_env(monkeypatch):
    monkeypatch.setenv("GEMINI_API_KEY", "fake_gemini")
    monkeypatch.setenv("OPENAI_API_KEY", "fake_openai")
    monkeypatch.setenv("ELEVENLABS_API_KEY", "fake_eleven")
    monkeypatch.setenv("ELEVENLABS_VOICE_ID", "fake_voice")

def test_config_initialization(mock_env):
    """Test that Config initializes correctly with environment variables."""
    # Reload config module to pick up new env vars
    importlib.reload(config)
    cfg = config.Config()
    assert cfg.gemini_api_key == "fake_gemini"
    assert cfg.openai_api_key == "fake_openai"
    assert cfg.elevenlabs_api_key == "fake_eleven"
    assert cfg.elevenlabs_voice_id == "fake_voice"

def test_config_paths():
    """Test that config paths are resolved relative to campaign root."""
    cfg = config.Config()
    assert cfg.campaign_root.name == "shai-hulud-2025"
    assert (cfg.campaign_root / "docs").exists()
    assert (cfg.campaign_root / "scripts").exists()

def test_config_validation_missing_keys(monkeypatch):
    """Test validation fails when keys are missing."""
    monkeypatch.delenv("GEMINI_API_KEY", raising=False)

    cfg = config.Config(gemini_api_key="")
    errors = cfg.validate()
    assert "GEMINI_API_KEY not set" in errors

def test_ensure_dirs(tmp_path):
    """Test that output directories are created."""
    cfg = config.Config()
    # Mock paths to be inside tmp_path
    cfg.data_dir = tmp_path / "data"
    cfg.audio_dir = tmp_path / "audio"
    cfg.video_dir = tmp_path / "video"

    cfg.ensure_dirs()

    assert (cfg.data_dir / "processed").exists()
    assert cfg.audio_dir.exists()
    assert cfg.video_dir.exists()
