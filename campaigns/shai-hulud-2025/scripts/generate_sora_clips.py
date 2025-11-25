#!/usr/bin/env python3
"""
Generate Sora 2 video clips from shotlist.

Usage:
    python generate_sora_clips.py
    python generate_sora_clips.py --shotlist custom-shotlist.json --output-dir ./videos
"""

import json
import time
import click
from pathlib import Path
from rich.console import Console
from rich.panel import Panel
from rich.progress import Progress

from openai import OpenAI
from config import get_config

console = Console()


def generate_sora_clip(
    client: OpenAI,
    scene: dict,
    output_dir: Path,
    resolution: str = "1080p"
) -> Path | None:
    """Generate a single Sora clip from a scene definition."""
    
    scene_id = scene.get("id", "unknown")
    prompt = scene.get("sora_prompt", "")
    duration = scene.get("duration_seconds", 10)
    
    if not prompt:
        console.print(f"[yellow]Skipping {scene_id}: No prompt[/yellow]")
        return None
    
    console.print(f"[blue]Generating: {scene_id} ({duration}s)[/blue]")
    
    try:
        # Create video generation request
        # Note: Sora 2 API is accessed through OpenAI's responses.create
        response = client.responses.create(
            model="sora",
            input=prompt,
            # Sora-specific parameters
            n=1,
            size=resolution,
            duration=min(duration, 20)  # Sora max is typically 20s
        )
        
        # Poll for completion
        while response.status == "processing":
            time.sleep(5)
            response = client.responses.retrieve(response.id)
        
        if response.status == "completed":
            # Download video
            video_url = response.output[0].url
            output_path = output_dir / f"{scene_id}.mp4"
            
            # Download using httpx
            import httpx
            with httpx.Client() as http:
                video_response = http.get(video_url)
                output_path.write_bytes(video_response.content)
            
            return output_path
        else:
            console.print(f"[red]Generation failed for {scene_id}: {response.status}[/red]")
            return None
            
    except Exception as e:
        console.print(f"[red]Error generating {scene_id}: {e}[/red]")
        return None


@click.command()
@click.option(
    "--shotlist", "-s",
    type=click.Path(exists=True, path_type=Path),
    help="Path to shotlist JSON"
)
@click.option(
    "--output-dir", "-o",
    type=click.Path(path_type=Path),
    help="Output directory for video clips"
)
@click.option(
    "--scene", "-n",
    type=str, multiple=True,
    help="Generate only specific scene(s) by ID"
)
@click.option(
    "--dry-run", is_flag=True,
    help="Show prompts without calling API"
)
def main(shotlist: Path | None, output_dir: Path | None, scene: tuple, dry_run: bool):
    """Generate Sora 2 video clips from shotlist."""
    
    config = get_config()
    
    shotlist_path = shotlist or config.shotlist_json
    output_dir = output_dir or config.video_dir
    
    if not config.openai_api_key and not dry_run:
        console.print("[red]Error: OPENAI_API_KEY not set[/red]")
        raise click.Abort()
    
    if not shotlist_path.exists():
        console.print(f"[red]Error: Shotlist not found: {shotlist_path}[/red]")
        console.print("[yellow]Run generate_shotlist.py first[/yellow]")
        raise click.Abort()
    
    console.print(Panel.fit(
        f"[bold]Generate Sora 2 Video Clips[/bold]\n\n"
        f"Shotlist: {shotlist_path}\n"
        f"Output: {output_dir}\n"
        f"Resolution: {config.video_resolution}",
        title="Shai-Hulud Pipeline"
    ))
    
    # Load shotlist
    shotlist_data = json.loads(shotlist_path.read_text(encoding="utf-8"))
    scenes = shotlist_data.get("scenes", [])
    
    # Filter scenes if specific ones requested
    if scene:
        scenes = [s for s in scenes if s.get("id") in scene]
    
    if not scenes:
        console.print("[yellow]No scenes to generate[/yellow]")
        return
    
    console.print(f"\nScenes to generate: {len(scenes)}")
    
    if dry_run:
        console.print("\n[yellow]DRY RUN - Scene prompts:[/yellow]")
        for s in scenes:
            console.print(f"\n[bold]{s.get('id')}[/bold] ({s.get('duration_seconds', '?')}s)")
            console.print(f"  {s.get('sora_prompt', 'No prompt')[:100]}...")
        return
    
    # Initialize OpenAI client
    client = OpenAI(api_key=config.openai_api_key)
    config.ensure_dirs()
    output_dir.mkdir(parents=True, exist_ok=True)
    
    # Generate clips
    generated = []
    failed = []
    
    with Progress() as progress:
        task = progress.add_task("Generating clips...", total=len(scenes))
        
        for scene_data in scenes:
            result = generate_sora_clip(
                client,
                scene_data,
                output_dir,
                config.video_resolution
            )
            
            if result:
                generated.append(result)
            else:
                failed.append(scene_data.get("id"))
            
            progress.update(task, advance=1)
            
            # Rate limiting
            time.sleep(2)
    
    console.print(f"\n[green]✓ Generated {len(generated)} clips[/green]")
    if failed:
        console.print(f"[red]✗ Failed: {', '.join(failed)}[/red]")
    
    for path in generated:
        console.print(f"  - {path}")


if __name__ == "__main__":
    main()