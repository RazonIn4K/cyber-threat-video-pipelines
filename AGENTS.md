# Repository Guidelines

Contributors focus on per-campaign video pipelines that turn threat intel into scripts, audio, and clips. Keep changes minimal, reproducible, and campaign-scoped.

## Project Structure & Modules
- Root `campaigns/` holds one folder per threat; current work lives in `campaigns/shai-hulud-2025/`.
- Inside a campaign: `docs/` (source intel), `data/raw/` notes + links, `data/processed/` generated JSON/MD, `prompts/` numbered prompt templates, `scripts/` Python CLIs, `audio/` & `video/` outputs, `pipeline/` orchestration code.
- `.env.example` defines required keys; `.gitignore` already excludes processed outputs and media.

## Build, Test, and Development Commands
Run commands from the campaign folder (`cd campaigns/shai-hulud-2025`).
- `make help` — list targets; `make install` — install Python deps; `make setup-env` — create `.env` from template.
- Pipeline steps: `make outline`, `make script`, `make shorts`, `make shotlist`, `make audio`, `make sora`.
- Bundles: `make content` (all text assets), `make media` (audio + video), `make pipeline` (full run).
- Safety checks: `make dry-run` previews prompts without API calls; `make validate` verifies config and required files; `make status` reports what’s generated; `make clean` removes generated artifacts.

## Coding Style & Naming Conventions
- Python 3 with type hints and docstrings; prefer `pathlib`, `dataclass` config (`scripts/config.py`), and Click CLIs.
- Use snake_case for functions/vars; keep prompt files numbered (`01-*.md`) and outputs in `data/processed/` with descriptive names (e.g., `script-longform.md`).
- Handle file I/O with UTF-8; avoid hard-coded paths—read from `Config` helpers.

## Testing Guidelines
- No formal unit suite yet; validate setup via `make validate` and dry-run the pipeline before invoking external APIs.
- When modifying generators, run the affected step with `--dry-run` (e.g., `python -m scripts.generate_outline --dry-run`) and confirm outputs land in `data/processed/`.
- Do not commit generated audio/video or processed JSON/MD (ignored by default).

## Commit & Pull Request Guidelines
- Follow existing history: conventional-style prefixes (`feat:`, `fix:`, `chore:`) with imperative descriptions.
- Scope commits to a single campaign or concern; mention impacted targets (e.g., “touches make script/shorts”).
- PRs should include: summary, commands run, sample output paths, and any new config requirements. Avoid sharing API keys or proprietary report text.

## Security & Configuration Tips
- Copy `.env.example` → `.env` and fill `GEMINI_API_KEY`, `OPENAI_API_KEY`, `ELEVENLABS_API_KEY`, `ELEVENLABS_VOICE_ID`; never commit `.env`.
- Keep vendor reports and notes in `data/raw/`; use `docs/` as the reviewed source of truth before running prompts.
- Generated assets may contain sensitive intel—treat local outputs as confidential and scrub before sharing externally.
