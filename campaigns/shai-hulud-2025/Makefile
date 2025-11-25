# Shai-Hulud 2025 Campaign - Video Pipeline Makefile
# Usage: make <target>

# Configuration
CAMPAIGN_DIR := $(shell pwd)
DOCS_DIR := $(CAMPAIGN_DIR)/docs
DATA_DIR := $(CAMPAIGN_DIR)/data
PROMPTS_DIR := $(CAMPAIGN_DIR)/prompts
AUDIO_DIR := $(CAMPAIGN_DIR)/audio
VIDEO_DIR := $(CAMPAIGN_DIR)/video

# Input files
PARADIGM_DOC := $(DOCS_DIR)/shai-hulud-paradigm.md
INTEL_NOTES := $(DATA_DIR)/raw/notes-snippets.md

# Output files
OUTLINE_JSON := $(DATA_DIR)/processed/outline.json
SCRIPT_LONGFORM := $(DATA_DIR)/processed/script-longform.md
SHORTS_SCRIPTS := $(DATA_DIR)/processed/shorts-scripts.md
SHOTLIST_JSON := $(DATA_DIR)/processed/shotlist.json
VOICEOVER_MP3 := $(AUDIO_DIR)/voiceover.mp3

# Default target
.PHONY: all
all: help

# Help target
.PHONY: help
help:
	@echo "╔══════════════════════════════════════════════════════════════╗"
	@echo "║     Shai-Hulud 2025 Campaign - Video Pipeline Makefile      ║"
	@echo "╠══════════════════════════════════════════════════════════════╣"
	@echo "║  Targets:                                                    ║"
	@echo "║    make outline   - Generate video outline from threat doc   ║"
	@echo "║    make script    - Generate long-form script from outline   ║"
	@echo "║    make shorts    - Generate YouTube Shorts scripts          ║"
	@echo "║    make shotlist  - Generate Sora 2 shotlist from script     ║"
	@echo "║    make audio     - Generate ElevenLabs voiceover            ║"
	@echo "║    make sora      - Generate Sora 2 video clips              ║"
	@echo "║    make pipeline  - Run full pipeline (outline→sora)         ║"
	@echo "║    make clean     - Remove generated files                   ║"
	@echo "║    make status    - Show pipeline status                     ║"
	@echo "╚══════════════════════════════════════════════════════════════╝"

# Step 1: Generate outline from threat doc
.PHONY: outline
outline:
	@echo "📋 Generating video outline..."
	@echo "Input: $(PARADIGM_DOC)"
	@echo "Prompt: $(PROMPTS_DIR)/01-threat-to-outline.md"
	@echo "Output: $(OUTLINE_JSON)"
	@echo ""
	@echo "TODO: Implement Gemini 3 API call"
	@echo "  python scripts/generate_outline.py \\"
	@echo "    --threat-doc $(PARADIGM_DOC) \\"
	@echo "    --prompt $(PROMPTS_DIR)/01-threat-to-outline.md \\"
	@echo "    --output $(OUTLINE_JSON)"

# Step 2: Generate long-form script from outline
.PHONY: script
script:
	@echo "📝 Generating long-form script..."
	@echo "Input: $(OUTLINE_JSON)"
	@echo "Prompt: $(PROMPTS_DIR)/02-outline-to-script.md"
	@echo "Output: $(SCRIPT_LONGFORM)"
	@echo ""
	@echo "TODO: Implement Gemini 3 API call"
	@echo "  python scripts/generate_script.py \\"
	@echo "    --outline $(OUTLINE_JSON) \\"
	@echo "    --prompt $(PROMPTS_DIR)/02-outline-to-script.md \\"
	@echo "    --output $(SCRIPT_LONGFORM)"

# Step 3: Generate YouTube Shorts scripts
.PHONY: shorts
shorts:
	@echo "🎬 Generating Shorts scripts..."
	@echo "Input: $(SCRIPT_LONGFORM)"
	@echo "Prompt: $(PROMPTS_DIR)/03-script-to-shorts.md"
	@echo "Output: $(SHORTS_SCRIPTS)"
	@echo ""
	@echo "TODO: Implement LLM API call"
	@echo "  python scripts/generate_shorts.py \\"
	@echo "    --script $(SCRIPT_LONGFORM) \\"
	@echo "    --prompt $(PROMPTS_DIR)/03-script-to-shorts.md \\"
	@echo "    --output $(SHORTS_SCRIPTS)"

# Step 4: Generate Sora 2 shotlist
.PHONY: shotlist
shotlist:
	@echo "🎥 Generating Sora 2 shotlist..."
	@echo "Input: $(SCRIPT_LONGFORM)"
	@echo "Prompt: $(PROMPTS_DIR)/04-script-to-shotlist.md"
	@echo "Output: $(SHOTLIST_JSON)"
	@echo ""
	@echo "TODO: Implement LLM API call"
	@echo "  python scripts/generate_shotlist.py \\"
	@echo "    --script $(SCRIPT_LONGFORM) \\"
	@echo "    --prompt $(PROMPTS_DIR)/04-script-to-shotlist.md \\"
	@echo "    --output $(SHOTLIST_JSON)"

# Step 5: Generate ElevenLabs voiceover
.PHONY: audio
audio:
	@echo "🎙️ Generating ElevenLabs voiceover..."
	@echo "Input: $(SCRIPT_LONGFORM)"
	@echo "Style: $(PROMPTS_DIR)/05-elevenlabs-style-note.md"
	@echo "Output: $(VOICEOVER_MP3)"
	@echo ""
	@echo "TODO: Implement ElevenLabs API call"
	@echo "  python scripts/generate_audio.py \\"
	@echo "    --script $(SCRIPT_LONGFORM) \\"
	@echo "    --voice-id YOUR_VOICE_ID \\"
	@echo "    --output $(VOICEOVER_MP3)"

# Step 6: Generate Sora 2 video clips
.PHONY: sora
sora:
	@echo "🎬 Generating Sora 2 video clips..."
	@echo "Input: $(SHOTLIST_JSON)"
	@echo "Output: $(VIDEO_DIR)/*.mp4"
	@echo ""
	@echo "TODO: Implement Sora 2 API call"
	@echo "  python scripts/generate_sora_clips.py \\"
	@echo "    --shotlist $(SHOTLIST_JSON) \\"
	@echo "    --output-dir $(VIDEO_DIR)"

# Run full pipeline
.PHONY: pipeline
pipeline: outline script shorts shotlist audio sora
	@echo ""
	@echo "✅ Full pipeline complete!"
	@echo "Next: Import audio + video into DaVinci Resolve or Premiere Pro"

# Clean generated files
.PHONY: clean
clean:
	@echo "🧹 Cleaning generated files..."
	rm -f $(OUTLINE_JSON)
	rm -f $(SCRIPT_LONGFORM)
	rm -f $(SHORTS_SCRIPTS)
	rm -f $(SHOTLIST_JSON)
	rm -f $(VOICEOVER_MP3)
	rm -f $(VIDEO_DIR)/*.mp4
	@echo "✅ Clean complete"

# Show pipeline status
.PHONY: status
status:
	@echo "📊 Pipeline Status"
	@echo "=================="
	@echo ""
	@echo "Source Documents:"
	@[ -f $(PARADIGM_DOC) ] && echo "  ✅ $(PARADIGM_DOC)" || echo "  ❌ $(PARADIGM_DOC) (MISSING)"
	@[ -f $(INTEL_NOTES) ] && echo "  ✅ $(INTEL_NOTES)" || echo "  ⚠️  $(INTEL_NOTES) (optional)"
	@echo ""
	@echo "Generated Outputs:"
	@[ -f $(OUTLINE_JSON) ] && echo "  ✅ outline.json" || echo "  ⬜ outline.json"
	@[ -f $(SCRIPT_LONGFORM) ] && echo "  ✅ script-longform.md" || echo "  ⬜ script-longform.md"
	@[ -f $(SHORTS_SCRIPTS) ] && echo "  ✅ shorts-scripts.md" || echo "  ⬜ shorts-scripts.md"
	@[ -f $(SHOTLIST_JSON) ] && echo "  ✅ shotlist.json" || echo "  ⬜ shotlist.json"
	@[ -f $(VOICEOVER_MP3) ] && echo "  ✅ voiceover.mp3" || echo "  ⬜ voiceover.mp3"
	@echo ""
	@echo "Video Clips:"
	@ls -1 $(VIDEO_DIR)/*.mp4 2>/dev/null | wc -l | xargs -I {} echo "  {} clips generated"