#!/usr/bin/env python3
"""
Generate long-form video script from outline using Gemini.

Usage:
    python generate_script.py
    python generate_script.py --outline custom-outline.json --output custom-script.md
"""

import json
from pathlib import Path

import click
import google.generativeai as genai
from rich.console import Console
from rich.panel import Panel

from config import get_config
from logging_utils import get_logger

console = Console()
log = get_logger(__name__)


def generate_script(
    outline_json: dict,
    prompt_template: str,
    voice_style: str,
    target_minutes: int,
    api_key: str,
    model: str,
    temperature: float,
    top_p: float,
) -> str:
    """Call Gemini API to generate script from outline."""

    genai.configure(api_key=api_key)
    model_instance = genai.GenerativeModel(model)

    full_prompt = f"""{prompt_template}

---

## OUTLINE_JSON:

```json
{json.dumps(outline_json, indent=2)}
```

## TARGET_MINUTES: {target_minutes}

## VOICE_GUIDE:
{voice_style}

---

Now generate the full spoken script. Include [B-ROLL: ...] markers for visual cues.
Output in plain text/markdown format.
"""

    log.info("Calling Gemini API for script", extra={"model": model})

    try:
        response = model_instance.generate_content(
            full_prompt,
            generation_config=genai.GenerationConfig(
                temperature=temperature,
                top_p=top_p,
                max_output_tokens=8000,
            ),
        )
    except Exception as exc:  # noqa: BLE001
        log.exception("Gemini API call failed")
        raise click.ClickException(f"Gemini API call failed: {exc}") from exc

    return response.text


@click.command()
@click.option(
    "--outline", "-i",
    type=click.Path(exists=True, path_type=Path),
    help="Path to outline JSON"
)
@click.option(
    "--output", "-o",
    type=click.Path(path_type=Path),
    help="Output path for script markdown"
)
@click.option(
    "--minutes", "-m",
    type=int, default=12,
    help="Target video length in minutes"
)
@click.option(
    "--dry-run", is_flag=True,
    help="Print prompt without calling API"
)
def main(outline: Path | None, output: Path | None, minutes: int, dry_run: bool):
    """Generate video script from outline."""

    config = get_config()

    outline_path = outline or config.outline_json
    output = output or config.script_longform

    if not config.gemini_api_key and not dry_run:
        console.print("[red]Error: GEMINI_API_KEY not set[/red]")
        raise click.Abort()

    missing_files = config.require_files(
        [outline_path, config.prompt_script, config.prompt_voice_style]
    )
    if missing_files:
        for path in missing_files:
            console.print(f"[red]Missing file: {path}[/red]")
        console.print("[yellow]Run generate_outline.py first if outline is missing[/yellow]")
        raise click.Abort()

    console.print(Panel.fit(
        f"[bold]Generate Video Script[/bold]\n\n"
        f"Outline: {outline_path}\n"
        f"Target: {minutes} minutes\n"
        f"Output: {output}",
        title="Shai-Hulud Pipeline"
    ))

    # Load inputs
    try:
        outline_json = json.loads(outline_path.read_text(encoding="utf-8"))
    except json.JSONDecodeError as exc:
        raise click.ClickException(f"Invalid outline JSON at {outline_path}: {exc}") from exc
    prompt_template = config.prompt_script.read_text(encoding="utf-8")
    voice_style = config.prompt_voice_style.read_text(encoding="utf-8")

    if dry_run:
        console.print("\n[yellow]DRY RUN - Outline preview:[/yellow]")
        console.print(f"Chapters: {len(outline_json.get('chapters', []))}")
        console.print(f"Model: {config.gemini_model}, temp: {config.gemini_temperature}, top_p: {config.gemini_top_p}")
        return

    # Generate script
    config.ensure_dirs()
    script = generate_script(
        outline_json,
        prompt_template,
        voice_style,
        minutes,
        config.gemini_api_key,
        config.gemini_model,
        config.gemini_temperature,
        config.gemini_top_p,
    )

    # Save output
    output.write_text(script, encoding="utf-8")

    # Stats
    word_count = len(script.split())
    estimated_minutes = word_count / 150  # ~150 wpm for narration
    broll_count = script.count("[B-ROLL")

    console.print(f"\n[green]✓ Script saved to: {output}[/green]")
    console.print(f"  Word count: {word_count}")
    console.print(f"  Estimated duration: {estimated_minutes:.1f} minutes")
    console.print(f"  B-roll markers: {broll_count}")


if __name__ == "__main__":
    main()
