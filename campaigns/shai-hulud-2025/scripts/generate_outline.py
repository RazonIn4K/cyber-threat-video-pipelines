#!/usr/bin/env python3
"""
Generate video outline from threat intelligence document using Gemini.

Usage:
    python generate_outline.py
    python generate_outline.py --threat-doc custom.md --output custom-outline.json
"""

import json
import click
from pathlib import Path
from rich.console import Console
from rich.panel import Panel

import google.generativeai as genai
from config import get_config
from simulation_adapters import FakeGeminiAdapter

console = Console()


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
    model: str = "gemini-2.0-flash",
    simulate: bool = False
) -> dict:
    """Call Gemini API to generate outline JSON."""
    
    if simulate:
        adapter = FakeGeminiAdapter()
        adapter.configure(api_key="fake")
        model_instance = adapter.GenerativeModel(model)
        console.print("[bold yellow]Running in SIMULATION mode[/bold yellow]")
    else:
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
    
    console.print("[bold blue]Calling Gemini API...[/bold blue]")
    
    response = model_instance.generate_content(
        full_prompt,
        generation_config=genai.GenerationConfig(
            temperature=0.7,
            response_mime_type="application/json"
        )
    )
    
    # Parse the JSON response
    try:
        if simulate and "```json" in response.text:
             # Strip markdown code blocks if present (fake adapter puts them there to mimic real behavior)
             clean_text = response.text.replace("```json", "").replace("```", "").strip()
             outline = json.loads(clean_text)
        else:
             outline = json.loads(response.text)
    except json.JSONDecodeError as e:
        console.print(f"[red]Failed to parse JSON response: {e}[/red]")
        console.print(f"Raw response:\n{response.text[:500]}...")
        raise
    
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
@click.option(
    "--simulate", is_flag=True,
    help="Use fake adapter instead of real API"
)
def main(threat_doc: Path | None, output: Path | None, dry_run: bool, simulate: bool):
    """Generate video outline from threat document."""
    
    config = get_config()
    
    # Use defaults from config if not specified
    threat_doc = threat_doc or config.paradigm_doc
    output = output or config.outline_json
    
    # Validate
    if not config.gemini_api_key and not dry_run and not simulate:
        console.print("[red]Error: GEMINI_API_KEY not set[/red]")
        raise click.Abort()
    
    if not threat_doc.exists():
        console.print(f"[red]Error: Threat doc not found: {threat_doc}[/red]")
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
        simulate
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