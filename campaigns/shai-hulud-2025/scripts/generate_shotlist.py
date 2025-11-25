#!/usr/bin/env python3
"""
Generate Sora 2 shotlist from script with B-roll markers.

Usage:
    python generate_shotlist.py
    python generate_shotlist.py --script custom-script.md --output shotlist.json
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


def generate_shotlist(
    script_text: str,
    prompt_template: str,
    aspect_ratio: str,
    api_key: str,
    model: str,
    temperature: float,
    top_p: float,
) -> dict:
    """Call Gemini API to generate Sora shotlist."""

    genai.configure(api_key=api_key)
    model_instance = genai.GenerativeModel(model)

    full_prompt = f"""{prompt_template}

---

## SCRIPT_TEXT:

{script_text}

## TARGET_ASPECT_RATIO: {aspect_ratio}
## DESIRED_SCENES: 8-12

---

Now generate the Sora 2 shotlist JSON. Output ONLY valid JSON, no markdown.
"""

    log.info("Calling Gemini API for shotlist", extra={"model": model})

    try:
        response = model_instance.generate_content(
            full_prompt,
            generation_config=genai.GenerationConfig(
                temperature=temperature,
                top_p=top_p,
                response_mime_type="application/json",
            ),
        )
    except Exception as exc:  # noqa: BLE001
        log.exception("Gemini API call failed")
        raise click.ClickException(f"Gemini API call failed: {exc}") from exc

    try:
        shotlist = json.loads(response.text)
    except json.JSONDecodeError as exc:
        console.print(f"[red]Failed to parse JSON: {exc}[/red]")
        raise click.ClickException("Gemini response was not valid JSON") from exc

    return shotlist


@click.command()
@click.option(
    "--script", "-s",
    type=click.Path(exists=True, path_type=Path),
    help="Path to long-form script"
)
@click.option(
    "--output", "-o",
    type=click.Path(path_type=Path),
    help="Output path for shotlist JSON"
)
@click.option(
    "--aspect-ratio", "-a",
    type=str, default="16:9",
    help="Video aspect ratio"
)
@click.option(
    "--dry-run", is_flag=True,
    help="Print prompt without calling API"
)
def main(script: Path | None, output: Path | None, aspect_ratio: str, dry_run: bool):
    """Generate Sora 2 shotlist from script."""

    config = get_config()

    script_path = script or config.script_longform
    output = output or config.shotlist_json

    if not config.gemini_api_key and not dry_run:
        console.print("[red]Error: GEMINI_API_KEY not set[/red]")
        raise click.Abort()

    missing_files = config.require_files([script_path, config.prompt_shotlist])
    if missing_files:
        for path in missing_files:
            console.print(f"[red]Missing file: {path}[/red]")
        raise click.Abort()

    console.print(Panel.fit(
        f"[bold]Generate Sora 2 Shotlist[/bold]\n\n"
        f"Script: {script_path}\n"
        f"Aspect Ratio: {aspect_ratio}\n"
        f"Output: {output}",
        title="Shai-Hulud Pipeline"
    ))

    script_text = script_path.read_text(encoding="utf-8")
    prompt_template = config.prompt_shotlist.read_text(encoding="utf-8")

    if dry_run:
        broll_count = script_text.count("[B-ROLL")
        console.print(f"\n[yellow]DRY RUN - B-roll markers found: {broll_count}[/yellow]")
        console.print(f"Model: {config.gemini_model}, temp: {config.gemini_temperature}, top_p: {config.gemini_top_p}")
        return

    # Generate
    config.ensure_dirs()
    shotlist = generate_shotlist(
        script_text,
        prompt_template,
        aspect_ratio,
        config.gemini_api_key,
        config.gemini_model,
        config.gemini_temperature,
        config.gemini_top_p,
    )

    output.write_text(json.dumps(shotlist, indent=2), encoding="utf-8")

    scene_count = len(shotlist.get("scenes", []))
    console.print(f"\n[green]✓ Shotlist saved to: {output}[/green]")
    console.print(f"  Scenes: {scene_count}")
    
    for scene in shotlist.get("scenes", [])[:3]:
        console.print(f"  - {scene.get('id')}: {scene.get('duration_seconds', '?')}s")


if __name__ == "__main__":
    main()
