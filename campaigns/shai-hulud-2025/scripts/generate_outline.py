#!/usr/bin/env python3
"""
Generate video outline from threat intelligence document using Gemini.

Usage:
    python generate_outline.py
    python generate_outline.py --threat-doc custom.md --output custom-outline.json
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


def load_prompt(prompt_path: Path) -> str:
    """Load prompt template from file."""
    return prompt_path.read_text(encoding="utf-8")


def load_threat_doc(doc_path: Path, notes_path: Path | None = None) -> str:
    """Load threat document and optional notes."""
    threat_doc = doc_path.read_text(encoding="utf-8")

    notes = ""
    if notes_path and notes_path.exists():
        notes_content = notes_path.read_text(encoding="utf-8")
        # Only include if there's actual content beyond template
        if "### Wave 1 Notes" in notes_content and len(notes_content) > 200:
            notes = f"\n\n## Additional Intel Notes\n{notes_content}"

    return threat_doc + notes


def generate_outline(
    threat_doc: str,
    prompt_template: str,
    api_key: str,
    model: str,
    temperature: float,
    top_p: float,
) -> dict:
    """Call Gemini API to generate outline JSON."""

    genai.configure(api_key=api_key)
    model_instance = genai.GenerativeModel(model)

    # Construct the full prompt
    full_prompt = f"""{prompt_template}

---

## LONGFORM_THREAT_DOC:

{threat_doc}

---

Now generate the video outline JSON. Output ONLY valid JSON, no markdown code blocks.
"""

    log.info("Calling Gemini API for outline")

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

    # Parse the JSON response
    try:
        outline = json.loads(response.text)
    except json.JSONDecodeError as exc:
        console.print(f"[red]Failed to parse JSON response: {exc}[/red]")
        console.print(f"Raw response:\n{response.text[:500]}...")
        raise click.ClickException("Gemini response was not valid JSON") from exc

    return outline


@click.command()
@click.option(
    "--threat-doc", "-t",
    type=click.Path(exists=True, path_type=Path),
    help="Path to threat intelligence document"
)
@click.option(
    "--output", "-o",
    type=click.Path(path_type=Path),
    help="Output path for outline JSON"
)
@click.option(
    "--dry-run", is_flag=True,
    help="Print prompt without calling API"
)
def main(threat_doc: Path | None, output: Path | None, dry_run: bool):
    """Generate video outline from threat document."""

    config = get_config()

    # Use defaults from config if not specified
    threat_doc = threat_doc or config.paradigm_doc
    output = output or config.outline_json

    # Validate
    missing_files = config.require_files([threat_doc, config.prompt_outline])
    if missing_files:
        for path in missing_files:
            console.print(f"[red]Missing file: {path}[/red]")
        raise click.Abort()

    if not config.gemini_api_key and not dry_run:
        console.print("[red]Error: GEMINI_API_KEY not set[/red]")
        raise click.Abort()

    console.print(Panel.fit(
        f"[bold]Generate Video Outline[/bold]\n\n"
        f"Threat Doc: {threat_doc}\n"
        f"Prompt: {config.prompt_outline}\n"
        f"Output: {output}",
        title="Shai-Hulud Pipeline"
    ))

    # Load inputs
    prompt_template = load_prompt(config.prompt_outline)
    threat_content = load_threat_doc(threat_doc, config.intel_notes)

    if dry_run:
        console.print("\n[yellow]DRY RUN - Prompt preview:[/yellow]")
        console.print(prompt_template[:500] + "...")
        console.print(f"\n[yellow]Threat doc length: {len(threat_content)} chars[/yellow]")
        return

    # Generate outline
    config.ensure_dirs()
    outline = generate_outline(
        threat_content,
        prompt_template,
        config.gemini_api_key,
        config.gemini_model,
        config.gemini_temperature,
        config.gemini_top_p,
    )

    # Save output
    output.write_text(json.dumps(outline, indent=2), encoding="utf-8")

    console.print(f"\n[green]✓ Outline saved to: {output}[/green]")
    console.print(f"  Chapters: {len(outline.get('chapters', []))}")

    # Preview
    for chapter in outline.get("chapters", [])[:3]:
        console.print(f"  - {chapter.get('id')}: {chapter.get('title')}")
    if len(outline.get("chapters", [])) > 3:
        console.print(f"  ... and {len(outline['chapters']) - 3} more")


if __name__ == "__main__":
    main()
