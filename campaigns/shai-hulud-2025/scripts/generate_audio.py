#!/usr/bin/env python3
"""
Generate ElevenLabs voiceover from script.

Usage:
    python generate_audio.py
    python generate_audio.py --script custom-script.md --output voiceover.mp3
"""

import re
import click
from pathlib import Path
from rich.console import Console
from rich.panel import Panel
from rich.progress import Progress

from elevenlabs import ElevenLabs
from config import get_config
from simulation_adapters import FakeElevenLabsClient

console = Console()


def clean_script_for_tts(script_text: str) -> str:
    """Remove B-roll markers and formatting for TTS."""
    
    # Remove [B-ROLL: ...] markers
    cleaned = re.sub(r'\[B-ROLL:[^\]]+\]', '', script_text)
    
    # Remove markdown headers but keep text
    cleaned = re.sub(r'^#+\s*', '', cleaned, flags=re.MULTILINE)
    
    # Remove [INTRO], [OUTRO], [CHAPTER] markers
    cleaned = re.sub(r'\[(?:INTRO|OUTRO|CHAPTER)[^\]]*\]', '', cleaned)
    
    # Clean up extra whitespace
    cleaned = re.sub(r'\n{3,}', '\n\n', cleaned)
    cleaned = cleaned.strip()
    
    return cleaned


def generate_audio(
    script_text: str,
    voice_id: str,
    api_key: str,
    output_path: Path,
    simulate: bool = False
) -> None:
    """Call ElevenLabs API to generate audio."""
    
    if simulate:
        client = FakeElevenLabsClient(api_key="fake")
        console.print("[bold yellow]Running in SIMULATION mode[/bold yellow]")
    else:
        client = ElevenLabs(api_key=api_key)
    
    console.print("[bold blue]Calling ElevenLabs API...[/bold blue]")
    console.print(f"  Voice ID: {voice_id}")
    console.print(f"  Script length: {len(script_text)} characters")
    
    # ElevenLabs has a character limit per request
    # For long scripts, might need to chunk
    MAX_CHARS = 5000
    
    if len(script_text) > MAX_CHARS:
        console.print(f"[yellow]Script exceeds {MAX_CHARS} chars, generating in chunks...[/yellow]")
        chunks = []
        
        # Split on paragraph boundaries
        paragraphs = script_text.split('\n\n')
        current_chunk = ""
        
        for para in paragraphs:
            if len(current_chunk) + len(para) < MAX_CHARS:
                current_chunk += para + "\n\n"
            else:
                if current_chunk:
                    chunks.append(current_chunk.strip())
                current_chunk = para + "\n\n"
        
        if current_chunk:
            chunks.append(current_chunk.strip())
        
        console.print(f"  Chunks: {len(chunks)}")
        
        # Generate audio for each chunk
        audio_segments = []
        with Progress() as progress:
            task = progress.add_task("Generating audio...", total=len(chunks))
            
            for i, chunk in enumerate(chunks):
                audio = client.text_to_speech.convert(
                    voice_id=voice_id,
                    text=chunk,
                    model_id="eleven_multilingual_v2"
                )
                audio_segments.append(b"".join(audio))
                progress.update(task, advance=1)
        
        # Concatenate audio
        full_audio = b"".join(audio_segments)
        
    else:
        audio = client.text_to_speech.convert(
            voice_id=voice_id,
            text=script_text,
            model_id="eleven_multilingual_v2"
        )
        full_audio = b"".join(audio)
    
    # Save audio
    output_path.write_bytes(full_audio)


@click.command()
@click.option(
    "--script", "-s",
    type=click.Path(exists=True, path_type=Path),
    help="Path to long-form script"
)
@click.option(
    "--output", "-o",
    type=click.Path(path_type=Path),
    help="Output path for audio file"
)
@click.option(
    "--voice-id", "-v",
    type=str,
    help="ElevenLabs voice ID (overrides config)"
)
@click.option(
    "--dry-run", is_flag=True,
    help="Show cleaned script without calling API"
)
@click.option(
    "--simulate", is_flag=True,
    help="Use fake adapter instead of real API"
)
def main(script: Path | None, output: Path | None, voice_id: str | None, dry_run: bool, simulate: bool):
    """Generate voiceover from script using ElevenLabs."""
    
    config = get_config()
    
    script_path = script or config.script_longform
    output = output or config.voiceover_mp3
    voice_id = voice_id or config.elevenlabs_voice_id
    
    if not config.elevenlabs_api_key and not dry_run and not simulate:
        console.print("[red]Error: ELEVENLABS_API_KEY not set[/red]")
        raise click.Abort()
    
    if not voice_id and not dry_run and not simulate:
        console.print("[red]Error: No voice ID specified[/red]")
        console.print("[yellow]Set ELEVENLABS_VOICE_ID or use --voice-id[/yellow]")
        raise click.Abort()
    
    if not script_path.exists():
        console.print(f"[red]Error: Script not found: {script_path}[/red]")
        raise click.Abort()
    
    console.print(Panel.fit(
        f"[bold]Generate ElevenLabs Voiceover[/bold]\n\n"
        f"Script: {script_path}\n"
        f"Voice ID: {voice_id or 'Not set'}\n"
        f"Output: {output}",
        title="Shai-Hulud Pipeline"
    ))
    
    # Load and clean script
    raw_script = script_path.read_text(encoding="utf-8")
    cleaned_script = clean_script_for_tts(raw_script)
    
    if dry_run:
        console.print("\n[yellow]DRY RUN - Cleaned script preview:[/yellow]")
        console.print(cleaned_script[:1000] + "...")
        console.print(f"\n[yellow]Total characters: {len(cleaned_script)}[/yellow]")
        return
    
    # Generate audio
    config.ensure_dirs()
    generate_audio(
        cleaned_script,
        voice_id,
        config.elevenlabs_api_key,
        output,
        simulate
    )
    
    file_size = output.stat().st_size / (1024 * 1024)  # MB
    console.print(f"\n[green]✓ Audio saved to: {output}[/green]")
    console.print(f"  File size: {file_size:.1f} MB")


if __name__ == "__main__":
    main()