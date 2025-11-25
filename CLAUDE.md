# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

Campaign-based system for converting threat intelligence documents into security education YouTube videos using Gemini 3, Sora 2, and ElevenLabs APIs. Each threat gets its own campaign folder with dedicated prompts, scripts, and outputs.

## Development Commands

All commands run from a campaign folder (e.g., `cd campaigns/shai-hulud-2025`):

```bash
# Setup
make install          # Install Python dependencies
make setup-env        # Create .env from template
make validate         # Verify API keys and required files

# Pipeline steps (run sequentially)
make outline          # Threat doc → outline.json (Gemini)
make script           # Outline → script-longform.md (Gemini)
make shorts           # Script → shorts-scripts.md (Gemini)
make shotlist         # Script → shotlist.json (Gemini)
make audio            # Script → voiceover.mp3 (ElevenLabs)
make sora             # Shotlist → video/*.mp4 (Sora 2)

# Bundles
make content          # All text generation steps
make media            # Audio + video generation
make pipeline         # Full pipeline

# Validation
make dry-run          # Preview all steps without API calls
make status           # Show pipeline progress
make clean            # Remove generated artifacts
```

To test a single script: `python -m scripts.generate_outline --dry-run`

## Architecture

### Pipeline Flow
Linear 6-step pipeline: Threat doc → Outline → Script → Shorts/Shotlist → Audio/Video

Each step is independent and stateless—can re-run individual stages without repeating prior steps.

### Key Components
- `docs/` — Source threat intelligence (reviewed source of truth)
- `prompts/` — Numbered AI prompt templates (`01-*.md`, `02-*.md`, etc.)
- `scripts/` — Python Click CLIs that combine prompts with inputs and call APIs
- `scripts/config.py` — Centralized dataclass-based configuration with env var loading
- `data/processed/` — Generated outputs (JSON for structured data, Markdown for scripts)

### API Integration
- **Gemini 3** (`google-generativeai`): Outline, script, shorts, shotlist generation
- **OpenAI Sora 2** (`openai`): Video clip generation with async polling
- **ElevenLabs** (`elevenlabs`): TTS voiceover with automatic chunking for long scripts

## Code Style

- Python 3 with type hints and docstrings
- Click for all CLIs with `--dry-run` support
- Rich library for console output
- Use `pathlib` exclusively (no `os.path`)
- Read paths from `Config` class, not hard-coded
- snake_case for functions/variables
- UTF-8 encoding for all file I/O

## Content Guidelines

- Defensive focus: Mechanics, detection, remediation (never exploit code)
- Visual abstraction: Symbolic representations (no real credentials in prompts)
- Markdown scripts include `[B-ROLL: ...]` markers for visual cues

## Adding New Campaigns

```bash
cp -r campaigns/shai-hulud-2025 campaigns/new-threat
# Customize: docs/, prompts/, README.md
```

## Environment Variables

Required in `.env` (copy from `.env.example`):
- `GEMINI_API_KEY`
- `OPENAI_API_KEY`
- `ELEVENLABS_API_KEY`
- `ELEVENLABS_VOICE_ID`
