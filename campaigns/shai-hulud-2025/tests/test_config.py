import importlib
import os
import sys
from pathlib import Path

import pytest

sys.path.append(str(Path(__file__).parents[1] / "scripts"))

import config  # noqa: E402


@pytest.fixture
def mock_env(monkeypatch):
    monkeypatch.setenv("GEMINI_API_KEY", "fake_gemini")
    monkeypatch.setenv("OPENAI_API_KEY", "fake_openai")
    monkeypatch.setenv("ELEVENLABS_API_KEY", "fake_eleven")
    monkeypatch.setenv("ELEVENLABS_VOICE_ID", "fake_voice")


def test_config_initialization(mock_env):
    importlib.reload(config)
    cfg = config.Config()
    assert cfg.gemini_api_key == "fake_gemini"
    assert cfg.openai_api_key == "fake_openai"
    assert cfg.elevenlabs_api_key == "fake_eleven"
    assert cfg.elevenlabs_voice_id == "fake_voice"


def test_config_paths():
    cfg = config.Config()
    assert cfg.campaign_root.name == "shai-hulud-2025"
    assert (cfg.campaign_root / "docs").exists()
    assert (cfg.campaign_root / "scripts").exists()


def test_config_validation_missing_keys(monkeypatch):
    monkeypatch.delenv("GEMINI_API_KEY", raising=False)
    cfg = config.Config(gemini_api_key="")
    errors = cfg.validate()
    assert "GEMINI_API_KEY not set" in errors


def test_ensure_dirs(tmp_path):
    cfg = config.Config()
    cfg.data_dir = tmp_path / "data"
    cfg.audio_dir = tmp_path / "audio"
    cfg.video_dir = tmp_path / "video"

    cfg.ensure_dirs()

    assert (cfg.data_dir / "processed").exists()
    assert cfg.audio_dir.exists()
    assert cfg.video_dir.exists()
