#!/usr/bin/env python3
"""
Campaign management tooling.

Usage:
    python scripts/campaign_tooling.py new <campaign_name>
    python scripts/campaign_tooling.py list
"""

import shutil
from pathlib import Path

import click
from rich.console import Console

console = Console()

REPO_ROOT = Path(__file__).resolve().parent.parent
CAMPAIGNS_DIR = REPO_ROOT / "campaigns"
TEMPLATE_CAMPAIGN = CAMPAIGNS_DIR / "shai-hulud-2025"


@click.group()
def cli():
    """Campaign management tools."""


@cli.command()
@click.argument("name")
def new(name: str):
    """Create a new campaign from the shai-hulud-2025 template."""

    target_dir = CAMPAIGNS_DIR / name

    if target_dir.exists():
        console.print(f"[red]Error: Campaign '{name}' already exists at {target_dir}[/red]")
        raise click.Abort()

    if not TEMPLATE_CAMPAIGN.exists():
        console.print(f"[red]Template campaign not found at {TEMPLATE_CAMPAIGN}[/red]")
        raise click.Abort()

    console.print(f"[bold blue]Creating new campaign: {name}[/bold blue]")

    try:
        shutil.copytree(
            TEMPLATE_CAMPAIGN,
            target_dir,
            ignore=shutil.ignore_patterns("__pycache__", ".pytest_cache", "*.pyc", ".env"),
        )
    except Exception as exc:  # noqa: BLE001
        console.print(f"[red]Error copying template: {exc}[/red]")
        raise click.Abort() from exc

    for path in [target_dir / "data" / "processed", target_dir / "audio", target_dir / "video"]:
        if path.exists():
            for item in path.iterdir():
                if item.name == ".gitkeep":
                    continue
                if item.is_dir():
                    shutil.rmtree(item)
                else:
                    item.unlink()

    paradigm_src = target_dir / "docs" / "shai-hulud-paradigm.md"
    paradigm_dest = target_dir / "docs" / f"{name}-paradigm.md"

    if paradigm_src.exists():
        content = paradigm_src.read_text(encoding="utf-8")
        paradigm_dest.write_text(f"# TODO: Update paradigm for {name}\n\n{content}", encoding="utf-8")
        paradigm_src.unlink()

    config_path = target_dir / "scripts" / "config.py"
    if config_path.exists():
        config_content = config_path.read_text(encoding="utf-8")
        config_content = config_content.replace("shai-hulud-paradigm.md", f"{name}-paradigm.md")
        config_path.write_text(config_content, encoding="utf-8")

    prompts_dir = target_dir / "prompts"
    if prompts_dir.exists():
        for prompt_file in prompts_dir.glob("*.md"):
            content = prompt_file.read_text(encoding="utf-8")
            if "TODO" not in content:
                prompt_file.write_text(f"<!-- TODO: Customize prompt for {name} -->\n\n{content}", encoding="utf-8")

    console.print(f"[green]\u2713 Campaign created at: {target_dir}[/green]")
    console.print("[yellow]Next steps:[/yellow]")
    console.print(f"  1. cd campaigns/{name}")
    console.print("  2. make setup-env")
    console.print("  3. Edit .env")
    console.print(f"  4. Edit docs/{name}-paradigm.md")


@cli.command()
def list():
    """List all available campaigns."""

    console.print("[bold]Available Campaigns:[/bold]")
    for item in sorted(CAMPAIGNS_DIR.iterdir()):
        if item.is_dir() and not item.name.startswith("."):
            console.print(f"  - {item.name}")


if __name__ == "__main__":
    cli()
