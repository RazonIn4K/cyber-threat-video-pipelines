#!/usr/bin/env python3
"""
Generate YouTube Shorts scripts from long-form script.

Usage:
    python generate_shorts.py
    python generate_shorts.py --script custom-script.md --output shorts.md
"""

from pathlib import Path

import click
import google.generativeai as genai
from rich.console import Console
from rich.panel import Panel

from config import get_config
from logging_utils import get_logger
from simulation_adapters import FakeGeminiAdapter

console = Console()
log = get_logger(__name__)


def generate_shorts(
    script_text: str,
    prompt_template: str,
    api_key: str,
    model: str,
    temperature: float,
    top_p: float,
    simulate: bool = False,
) -> str:
    """Call Gemini API to generate Shorts scripts."""
    if simulate:
        adapter = FakeGeminiAdapter()
        adapter.configure(api_key="fake")
        model_instance = adapter.GenerativeModel(model)
        generation_config = adapter.GenerationConfig(
            temperature=temperature,
            top_p=top_p,
            max_output_tokens=4000,
        )
        console.print("[bold yellow]Running in SIMULATION mode[/bold yellow]")
    else:
        genai.configure(api_key=api_key)
        model_instance = genai.GenerativeModel(model)
        generation_config = genai.GenerationConfig(
            temperature=temperature,
            top_p=top_p,
            max_output_tokens=4000,
        )

    full_prompt = f"""{prompt_template}

---

## FULL_SCRIPT_TEXT:

{script_text}

---

Now generate 3-5 YouTube Shorts scripts. Each should be 45-60 seconds when read aloud.
"""

    log.info("Calling Gemini API for shorts", extra={"model": model})

    try:
        response = model_instance.generate_content(
            full_prompt,
            generation_config=generation_config,
        )
    except Exception as exc:  # noqa: BLE001
        log.exception("Gemini API call failed")
        raise click.ClickException(f"Gemini API call failed: {exc}") from exc

    return response.text


@click.command()
@click.option(
    "--script", "-s",
    type=click.Path(exists=True, path_type=Path),
    help="Path to long-form script"
)
@click.option(
    "--output", "-o",
    type=click.Path(path_type=Path),
    help="Output path for Shorts scripts"
)
@click.option(
    "--dry-run", is_flag=True,
    help="Print prompt without calling API"
)
@click.option(
    "--simulate", is_flag=True,
    help="Use fake adapters instead of real API"
)
def main(script: Path | None, output: Path | None, dry_run: bool, simulate: bool):
    """Generate YouTube Shorts scripts."""

    config = get_config()

    script_path = script or config.script_longform
    output = output or config.shorts_scripts

    if not config.gemini_api_key and not dry_run and not simulate:
        console.print("[red]Error: GEMINI_API_KEY not set[/red]")
        raise click.Abort()

    missing_files = config.require_files([script_path, config.prompt_shorts])
    if missing_files:
        for path in missing_files:
            console.print(f"[red]Missing file: {path}[/red]")
        console.print("[yellow]Run generate_script.py first if script is missing[/yellow]")
        raise click.Abort()

    console.print(Panel.fit(
        f"[bold]Generate YouTube Shorts[/bold]\n\n"
        f"Script: {script_path}\n"
        f"Output: {output}",
        title="Shai-Hulud Pipeline"
    ))

    script_text = script_path.read_text(encoding="utf-8")
    prompt_template = config.prompt_shorts.read_text(encoding="utf-8")

    if dry_run:
        console.print(f"\n[yellow]DRY RUN - Script length: {len(script_text)} chars[/yellow]")
        console.print(f"Model: {config.gemini_model}, temp: {config.gemini_temperature}, top_p: {config.gemini_top_p}")
        return

    # Generate
    config.ensure_dirs()
    shorts = generate_shorts(
        script_text,
        prompt_template,
        config.gemini_api_key,
        config.gemini_model,
        config.gemini_temperature,
        config.gemini_top_p,
        simulate,
    )

    output.write_text(shorts, encoding="utf-8")

    # Count shorts
    short_count = shorts.count("SHORT #") or shorts.count("--- SHORT")

    console.print(f"\n[green]✓ Shorts scripts saved to: {output}[/green]")
    console.print(f"  Shorts generated: ~{max(short_count, 3)}")


if __name__ == "__main__":
    main()
