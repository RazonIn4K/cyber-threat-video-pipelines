"""
Configuration management for the Shai-Hulud video pipeline.

Usage:
    from config import Config
    config = Config()
    
Environment variables required:
    - GEMINI_API_KEY: Google AI Studio API key
    - OPENAI_API_KEY: OpenAI API key (for Sora 2)
    - ELEVENLABS_API_KEY: ElevenLabs API key
    - ELEVENLABS_VOICE_ID: Your voice profile ID
"""

import os
from pathlib import Path
from dataclasses import dataclass
from dotenv import load_dotenv

# Load .env from campaign root
CAMPAIGN_ROOT = Path(__file__).parent.parent
load_dotenv(CAMPAIGN_ROOT / ".env")


@dataclass
class Config:
    """Pipeline configuration with paths and API settings."""
    
    # Paths
    campaign_root: Path = CAMPAIGN_ROOT
    docs_dir: Path = CAMPAIGN_ROOT / "docs"
    data_dir: Path = CAMPAIGN_ROOT / "data"
    prompts_dir: Path = CAMPAIGN_ROOT / "prompts"
    audio_dir: Path = CAMPAIGN_ROOT / "audio"
    video_dir: Path = CAMPAIGN_ROOT / "video"
    
    # Input files
    paradigm_doc: Path = CAMPAIGN_ROOT / "docs" / "shai-hulud-paradigm.md"
    intel_notes: Path = CAMPAIGN_ROOT / "data" / "raw" / "notes-snippets.md"
    
    # Output files
    outline_json: Path = CAMPAIGN_ROOT / "data" / "processed" / "outline.json"
    script_longform: Path = CAMPAIGN_ROOT / "data" / "processed" / "script-longform.md"
    shorts_scripts: Path = CAMPAIGN_ROOT / "data" / "processed" / "shorts-scripts.md"
    shotlist_json: Path = CAMPAIGN_ROOT / "data" / "processed" / "shotlist.json"
    voiceover_mp3: Path = CAMPAIGN_ROOT / "audio" / "voiceover.mp3"
    
    # Prompt files
    prompt_outline: Path = CAMPAIGN_ROOT / "prompts" / "01-threat-to-outline.md"
    prompt_script: Path = CAMPAIGN_ROOT / "prompts" / "02-outline-to-script.md"
    prompt_shorts: Path = CAMPAIGN_ROOT / "prompts" / "03-script-to-shorts.md"
    prompt_shotlist: Path = CAMPAIGN_ROOT / "prompts" / "04-script-to-shotlist.md"
    prompt_voice_style: Path = CAMPAIGN_ROOT / "prompts" / "05-elevenlabs-style-note.md"
    
    # API Keys (from environment)
    gemini_api_key: str = os.getenv("GEMINI_API_KEY", "")
    openai_api_key: str = os.getenv("OPENAI_API_KEY", "")
    elevenlabs_api_key: str = os.getenv("ELEVENLABS_API_KEY", "")
    elevenlabs_voice_id: str = os.getenv("ELEVENLABS_VOICE_ID", "")
    
    # Model settings
    gemini_model: str = "gemini-2.0-flash"  # Or "gemini-1.5-pro" for longer context
    sora_model: str = "sora-2"  # Sora 2 model identifier
    
    # Video settings
    video_aspect_ratio: str = "16:9"
    video_resolution: str = "1080p"
    target_video_minutes: int = 12
    
    def validate(self) -> list[str]:
        """Check for missing required configuration."""
        errors = []
        
        if not self.gemini_api_key:
            errors.append("GEMINI_API_KEY not set")
        if not self.openai_api_key:
            errors.append("OPENAI_API_KEY not set (required for Sora)")
        if not self.elevenlabs_api_key:
            errors.append("ELEVENLABS_API_KEY not set")
        if not self.elevenlabs_voice_id:
            errors.append("ELEVENLABS_VOICE_ID not set")
        if not self.paradigm_doc.exists():
            errors.append(f"Paradigm doc not found: {self.paradigm_doc}")
            
        return errors
    
    def ensure_dirs(self):
        """Create output directories if they don't exist."""
        for dir_path in [self.data_dir / "processed", self.audio_dir, self.video_dir]:
            dir_path.mkdir(parents=True, exist_ok=True)


def get_config() -> Config:
    """Get configuration singleton."""
    return Config()