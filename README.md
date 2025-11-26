# Cyber Threat Video Pipelines

A campaign-based repository for creating security education videos from threat intelligence. Uses Gemini 3, Sora 2, and ElevenLabs to transform threat intel documents into YouTube videos.

## Overview

This repository organizes video production workflows by **campaign** - each threat gets its own folder with dedicated prompts, scripts, and outputs. It also includes a web-based studio UI for browsing campaigns, running pipeline steps, and reviewing media/logs.

## Repository Structure

```
cyber-threat-video-pipelines/
├── campaigns/
│   └── shai-hulud-2025/     # NPM worm campaign (Sept-Nov 2025)
│       ├── docs/            # Threat intel source documents
│       ├── data/            # Raw intel and processed outputs
│       ├── prompts/         # AI prompt templates
│       ├── scripts/         # Python automation
│       ├── audio/           # ElevenLabs voiceovers
│       ├── video/           # Sora 2 clips
│       └── pipeline/        # Orchestration code
├── cyber-threat-video-studio/ # Web UI (Vite + React + Tailwind)
├── .github/workflows/       # CI for campaign tests + UI build
├── .gitignore
└── README.md
```

## Current Campaigns

| Campaign | Status | Description |
|----------|--------|-------------|
| [shai-hulud-2025](campaigns/shai-hulud-2025/) | 🟡 Setup | NPM supply chain worm (Wave 1: Sept 2025, Wave 2: Nov 2025) |

## Tech Stack

- **Script Generation**: Gemini 3 (via AI Studio / Vertex AI)
- **Video B-Roll**: Sora 2 (OpenAI API)
- **Voiceover**: ElevenLabs TTS
- **Editing**: DaVinci Resolve / Premiere Pro
- **Automation**: Python + Make

## Getting Started

1) Clone the repository

2) Campaign pipeline (Python)

```bash
cd campaigns/shai-hulud-2025
make help
make status
```

3) Studio UI (Vite + React)

```bash
cd cyber-threat-video-studio
npm install
npm run dev
```

Default Vite env vars (set in `.env.local`):
- `VITE_API_BASE` — backend base URL (e.g., http://localhost:3000/api)
- `VITE_APP_ENV` — label for environment (e.g., local, staging, prod)
- `VITE_LOG_LEVEL` — optional log level for client

4) Optional local API shim (to run pipeline steps from the UI)

```bash
cd server
npm install
npm start                # starts on :3000, exposes /run/* using --simulate by default (SIMULATE=true)
# or run with Doppler configs:
npm run start:doppler:dev_personal
npm run start:doppler:dev
```

Then set `VITE_API_BASE=http://localhost:3000` in `cyber-threat-video-studio/.env.local` and rebuild the UI.

To hit real APIs instead of simulation, start the server with `SIMULATE=false` (env var) and ensure `campaigns/shai-hulud-2025/.env` has valid API keys (or run via Doppler).

## Adding New Campaigns

To add a new campaign (e.g., `log4shell-retro`):

```bash
cp -r campaigns/shai-hulud-2025 campaigns/log4shell-retro
# Edit docs/, prompts/, and README.md for the new threat
```

## Future Campaigns

- `log4shell-retro/` - Log4j retrospective
- `xz-backdoor-2024/` - XZ Utils backdoor analysis
- `polyfill-io-2024/` - Polyfill.io supply chain attack
- `pypi-worm-20xx/` - Future PyPI ecosystem threats

## License

MIT License - See LICENSE file

## Contributing

1. Fork the repository
2. Create a campaign branch
3. Submit a pull request with your campaign folder


## API Integration (New)

The project now includes a full React-based dashboard and Express API server.

### Quick Start

```bash
# Terminal 1: Start API server
cd server && npm install && npm start

# Terminal 2: Start frontend
cd cyber-threat-video-studio
echo "VITE_API_BASE=http://localhost:3000" > .env.local
npm install && npm run dev
```

### Architecture Overview

```
┌─────────────────┐     ┌─────────────────┐     ┌─────────────────┐
│  React UI       │────▶│  Express API    │────▶│  Python Scripts │
│  (Vite + React) │ SSE │  (Node.js)      │spawn│  (Campaign)     │
└─────────────────┘     └─────────────────┘     └─────────────────┘
        │                       │                       │
        ▼                       ▼                       ▼
   User Interface         REST + SSE            Pipeline Steps
   - Dashboard            - /campaigns          - generate_outline
   - Campaign Detail      - /run/:step          - generate_script
   - Logs (real-time)     - /run/:step/stream   - generate_audio
   - Media Library        - /validate           - generate_sora_clips
```

### Features

- **Real-time Streaming**: SSE-based log streaming during pipeline execution
- **Retry Logic**: Automatic retry with exponential backoff for failed requests
- **Abort Support**: Cancel running pipeline operations
- **Status Inference**: Automatic campaign status from generated files
- **Validation**: Check campaign configuration before running

See `cyber-threat-video-studio/README.md` and `server/README.md` for detailed documentation.
