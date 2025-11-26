# Video Pipeline API Server

Express.js API server that bridges the React frontend to the Python pipeline scripts.

## API Endpoints

### Health & Info
| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/health` | Health check |

### Campaigns
| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/campaigns` | List all campaigns with status inference |
| GET | `/campaigns/:id` | Get campaign details with pipeline step status |
| GET | `/campaigns/:id/validate` | Validate campaign configuration |
| GET | `/campaigns/:id/media` | List campaign media files |

### Pipeline Execution
| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/run/outline` | Generate outline |
| POST | `/run/script` | Generate script |
| POST | `/run/shorts` | Generate shorts |
| POST | `/run/shotlist` | Generate shotlist |
| POST | `/run/audio` | Generate audio |
| POST | `/run/sora` | Generate Sora clips |
| POST | `/run/media` | Run full media pipeline |

### Streaming (SSE)
| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/run/:step/stream` | Stream pipeline execution logs |

## Request/Response Examples

### POST /run/{step}
```bash
curl -X POST http://localhost:3000/run/outline \
  -H "Content-Type: application/json" \
  -d '{"campaignId": "shai-hulud-2025", "simulate": true}'
```

Response:
```json
{
  "success": true,
  "step": "outline",
  "output": "...",
  "duration": 1234
}
```

### GET /run/{step}/stream (SSE)
```bash
curl -N "http://localhost:3000/run/outline/stream?campaignId=shai-hulud-2025&simulate=true"
```

Events:
```
data: {"type":"connected","step":"outline","campaignId":"shai-hulud-2025"}
data: {"type":"stdout","text":"Processing..."}
data: {"type":"stderr","text":"Warning: ..."}
data: {"type":"complete","exitCode":0,"success":true}
```

### GET /campaigns/:id/validate
```json
{
  "valid": false,
  "issues": [
    ".env file missing - copy from .env.example and configure",
    "No intel files found in docs/ directory"
  ]
}
```

## Quick Start

```bash
# Install dependencies
npm install

# Start in simulate mode (default)
npm start

# Start with Doppler secrets
npm run start:doppler:dev_personal

# Start in real mode (requires API keys)
SIMULATE=false npm run start:doppler:dev_personal
```

## Environment Variables

| Variable | Description | Default |
|----------|-------------|---------|
| `PORT` | Server port | 3000 |
| `SIMULATE` | Enable simulation mode | true |
| `CAMPAIGNS_ROOT` | Path to campaigns directory | ../campaigns |

## Architecture

```
┌──────────────────────────────────────────────────────────────┐
│                      Express Server                           │
├──────────────────────────────────────────────────────────────┤
│  Routes              │  Middleware         │  Utils           │
│  ──────              │  ──────────         │  ─────           │
│  /campaigns          │  CORS               │  runPython()     │
│  /run/:step          │  JSON body parser   │  getCampaignDir()│
│  /run/:step/stream   │  Error handling     │  inferStatus()   │
└──────────────────────────────────────────────────────────────┘
                              │
                    spawn     │  child_process
                              ▼
┌──────────────────────────────────────────────────────────────┐
│                    Python Pipeline Scripts                    │
│                (campaigns/*/scripts/*.py)                     │
└──────────────────────────────────────────────────────────────┘