
import pytest
from pathlib import Path
import sys

# Add scripts directory to path so we can import modules
sys.path.append(str(Path(__file__).parents[1] / "scripts"))

from simulation_adapters import (
    FakeGeminiAdapter,
    FakeElevenLabsClient,
    FakeOpenAIClient
)

def test_fake_gemini_adapter():
    adapter = FakeGeminiAdapter()
    model = adapter.GenerativeModel("test-model")

    # Test script generation simulation
    prompt_script = "Some prompt with OUTLINE_JSON included"
    response = model.generate_content(prompt_script)
    assert "FAKE SCRIPT" in response.text

    # Test outline generation simulation
    prompt_outline = "Some prompt with threat-to-outline"
    response = model.generate_content(prompt_outline)
    assert "Simulated Campaign" in response.text

def test_fake_elevenlabs_client():
    client = FakeElevenLabsClient(api_key="fake")
    audio_chunks = client.text_to_speech.convert(
        voice_id="fake_voice",
        text="Hello world",
        model_id="eleven_multilingual_v2"
    )
    assert len(audio_chunks) > 0
    assert b"FAKE_AUDIO_DATA" in audio_chunks[0]

def test_fake_openai_client():
    client = FakeOpenAIClient(api_key="fake")

    # Test create
    response = client.responses.create(
        model="sora",
        input="A cat jumping",
        n=1,
        size="1080p",
        duration=5
    )
    assert response.status == "processing"
    assert response.id == "fake_job_id_123"

    # Test retrieve
    response = client.responses.retrieve("fake_job_id_123")
    assert response.status == "completed"
    assert len(response.output) == 1
    assert response.output[0].url == "http://fake-url/video.mp4"
