#!/usr/bin/env python3
"""
Generate YouTube Shorts scripts from long-form script.

Usage:
    python generate_shorts.py
    python generate_shorts.py --script custom-script.md --output shorts.md
"""

import click
from pathlib import Path
from rich.console import Console
from rich.panel import Panel

import google.generativeai as genai
from config import get_config
from simulation_adapters import FakeGeminiAdapter

console = Console()


def generate_shorts(
    script_text: str,
    prompt_template: str,
    api_key: str,
    model: str = "gemini-2.0-flash",
    simulate: bool = False
) -> str:
    """Call Gemini API to generate Shorts scripts."""
    
    if simulate:
        adapter = FakeGeminiAdapter()
        adapter.configure(api_key="fake")
        model_instance = adapter.GenerativeModel(model)
        console.print("[bold yellow]Running in SIMULATION mode[/bold yellow]")
    else:
        genai.configure(api_key=api_key)
        model_instance = genai.GenerativeModel(model)
    
    full_prompt = f"""{prompt_template}

---

## FULL_SCRIPT_TEXT:

{script_text}

---

Now generate 3-5 YouTube Shorts scripts. Each should be 45-60 seconds when read aloud.
"""
    
    console.print("[bold blue]Calling Gemini API for Shorts generation...[/bold blue]")
    
    response = model_instance.generate_content(
        full_prompt,
        generation_config=genai.GenerationConfig(
            temperature=0.9,
            max_output_tokens=4000
        )
    )
    
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
    help="Use fake adapter instead of real API"
)
def main(script: Path | None, output: Path | None, dry_run: bool, simulate: bool):
    """Generate YouTube Shorts scripts."""
    
    config = get_config()
    
    script_path = script or config.script_longform
    output = output or config.shorts_scripts
    
    if not config.gemini_api_key and not dry_run and not simulate:
        console.print("[red]Error: GEMINI_API_KEY not set[/red]")
        raise click.Abort()
    
    if not script_path.exists():
        console.print(f"[red]Error: Script not found: {script_path}[/red]")
        console.print("[yellow]Run generate_script.py first[/yellow]")
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
        return
    
    # Generate
    config.ensure_dirs()
    shorts = generate_shorts(
        script_text,
        prompt_template,
        config.gemini_api_key,
        config.gemini_model,
        simulate
    )
    
    output.write_text(shorts, encoding="utf-8")
    
    # Count shorts
    short_count = shorts.count("SHORT #") or shorts.count("--- SHORT")
    
    console.print(f"\n[green]✓ Shorts scripts saved to: {output}[/green]")
    console.print(f"  Shorts generated: ~{max(short_count, 3)}")


if __name__ == "__main__":
    main()