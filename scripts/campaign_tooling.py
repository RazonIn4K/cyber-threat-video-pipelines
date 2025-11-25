#!/usr/bin/env python3
"""
Campaign Tooling CLI.
Helper script to create new campaigns from templates.

Usage:
    python scripts/campaign_tooling.py new <campaign_name>
    python scripts/campaign_tooling.py list
"""

import os
import shutil
import click
from pathlib import Path
from rich.console import Console

console = Console()

# Define paths
REPO_ROOT = Path(__file__).resolve().parent.parent
CAMPAIGNS_DIR = REPO_ROOT / "campaigns"
TEMPLATE_CAMPAIGN = CAMPAIGNS_DIR / "shai-hulud-2025"

def ignore_patterns(path, names):
    """Ignore specific directories and files during copy."""
    ignored = []
    if "data" in names:
        # We want to keep the structure of data/ but not the content if possible,
        # or we just copy it and then clean it.
        # Let's copy and then clean.
        pass
    if "__pycache__" in names:
        ignored.append("__pycache__")
    if ".pytest_cache" in names:
        ignored.append(".pytest_cache")
    if "video" in names:
        # We might want to keep the directory but not the files.
        pass
    if "audio" in names:
        pass
    return ignored

@click.group()
def cli():
    """Campaign management tools."""
    pass

@cli.command()
@click.argument("name")
def new(name: str):
    """Create a new campaign from the shai-hulud-2025 template."""

    target_dir = CAMPAIGNS_DIR / name

    if target_dir.exists():
        console.print(f"[red]Error: Campaign '{name}' already exists at {target_dir}[/red]")
        raise click.Abort()

    console.print(f"[bold blue]Creating new campaign: {name}[/bold blue]")

    # Copy template
    try:
        shutil.copytree(TEMPLATE_CAMPAIGN, target_dir, ignore=shutil.ignore_patterns("__pycache__", ".pytest_cache", "*.pyc", ".git"))
    except Exception as e:
        console.print(f"[red]Error copying template: {e}[/red]")
        raise click.Abort()

    # Clean up data/processed and media
    dirs_to_clean = [
        target_dir / "data" / "processed",
        target_dir / "audio",
        target_dir / "video"
    ]

    for d in dirs_to_clean:
        if d.exists():
            for item in d.iterdir():
                if item.name == ".gitkeep":
                    continue
                if item.is_file():
                    item.unlink()
                elif item.is_dir():
                    shutil.rmtree(item)

    # Add TODO markers
    # Modify docs/shai-hulud-paradigm.md -> docs/<name>-paradigm.md
    paradigm_src = target_dir / "docs" / "shai-hulud-paradigm.md"
    paradigm_dest = target_dir / "docs" / f"{name}-paradigm.md"

    if paradigm_src.exists():
        content = paradigm_src.read_text()
        content = f"# TODO: Update paradigm for {name}\n\n" + content
        paradigm_dest.write_text(content)
        paradigm_src.unlink()

    # Update config.py to point to new paradigm doc?
    # config.py uses hardcoded paths: paradigm_doc = CAMPAIGN_ROOT / "docs" / "shai-hulud-paradigm.md"
    # We should update this line.
    config_path = target_dir / "scripts" / "config.py"
    if config_path.exists():
        config_content = config_path.read_text()
        config_content = config_content.replace("shai-hulud-paradigm.md", f"{name}-paradigm.md")
        config_path.write_text(config_content)

    # Insert TODOs in prompts
    prompts_dir = target_dir / "prompts"
    if prompts_dir.exists():
        for prompt_file in prompts_dir.glob("*.md"):
            content = prompt_file.read_text()
            if "TODO" not in content:
                content = f"<!-- TODO: Customize prompt for {name} -->\n\n" + content
                prompt_file.write_text(content)

    console.print(f"[green]✓ Campaign created at: {target_dir}[/green]")
    console.print("[yellow]Next steps:[/yellow]")
    console.print(f"  1. cd campaigns/{name}")
    console.print("  2. make setup-env")
    console.print("  3. Edit .env")
    console.print(f"  4. Edit docs/{name}-paradigm.md")

@cli.command()
def list():
    """List all available campaigns."""
    console.print("[bold]Available Campaigns:[/bold]")
    for item in CAMPAIGNS_DIR.iterdir():
        if item.is_dir() and not item.name.startswith("."):
            console.print(f"  - {item.name}")

if __name__ == "__main__":
    cli()
