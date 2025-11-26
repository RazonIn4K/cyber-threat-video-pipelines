# Cyber Threat Video Studio

A React-based dashboard for managing and running the video pipeline for cyber threat campaigns.

## Features

- **Campaign Management**: View, monitor, and manage threat video campaigns
- **Pipeline Execution**: Run individual pipeline steps or full pipeline
- **Real-time Logs**: SSE-based streaming of Python script output
- **Simulation Mode**: Test pipeline without API calls
- **Status Inference**: Automatic campaign status based on generated files

## Quick Start

### Prerequisites
- Node.js 18+
- API server running (see `../server/README.md`)

### Development
```bash
# Install dependencies
npm install

# Configure API endpoint
echo "VITE_API_BASE=http://localhost:3000" > .env.local

# Start development server
npm run dev
```

### Production Build
```bash
npm run build
npm run preview
```

## Architecture

```
┌─────────────────────────────────────────────────────────────┐
│                     React Application                        │
├─────────────────────────────────────────────────────────────┤
│  Pages          │  Stores (Zustand)  │  API Layer           │
│  ─────          │  ───────────────   │  ─────────           │
│  Dashboard      │  campaignStore     │  campaigns.ts        │
│  CampaignDetail │  pipelineStore     │  run.ts (+ retry)    │
│  LogsPage       │  logsStore (SSE)   │  logs.ts (SSE)       │
│  MediaLibrary   │  mediaStore        │  media.ts            │
│  ShotlistSync   │  secretsStore      │  secrets.ts          │
└─────────────────────────────────────────────────────────────┘
                              │
                    HTTP/SSE  │  VITE_API_BASE
                              ▼
┌─────────────────────────────────────────────────────────────┐
│                    Express API Server                        │
│                    (../server/index.js)                      │
└─────────────────────────────────────────────────────────────┘
```

## Key Files

| File | Purpose |
|------|---------|
| `api/run.ts` | Pipeline execution with retry logic |
| `api/logs.ts` | SSE streaming client |
| `stores/logsStore.ts` | Real-time log management |
| `stores/pipelineStore.ts` | Run state with abort support |
| `pages/CampaignDetail.tsx` | Main campaign UI with actions |

## Environment Variables

| Variable | Description | Default |
|----------|-------------|---------|
| `VITE_API_BASE` | API server URL | (empty - uses relative paths) |
