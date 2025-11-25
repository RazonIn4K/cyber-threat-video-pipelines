# Shai-Hulud 2025 Campaign - Video Pipeline Makefile
# Usage: make <target>

# Configuration
CAMPAIGN_DIR := $(shell pwd)
SCRIPTS_DIR := $(CAMPAIGN_DIR)/scripts
PYTHON := python3

.PHONY: all
all: help

# Help target
.PHONY: help
help:
	@printf "\nShai-Hulud 2025 Campaign - Pipeline Targets\n"
	@printf "  make install            Install Python dependencies\n"
	@printf "  make setup-env          Create .env from template (optional when using Doppler)\n"
	@printf "  make validate           Sanity-check required secrets/files\n"
	@printf "  make status             Show pipeline status\n"
	@printf "  make dry-run            Preview prompts without API calls\n"
	@printf "  make simulate           Run pipeline with fake adapters (offline)\n"
	@printf "  make test               Run unit tests\n"
	@printf "  make outline            Generate video outline\n"
	@printf "  make script             Generate long-form script\n"
	@printf "  make shorts             Generate YouTube Shorts scripts\n"
	@printf "  make shotlist           Generate Sora 2 shotlist\n"
	@printf "  make audio              Generate ElevenLabs voiceover\n"
	@printf "  make sora               Generate Sora 2 video clips\n"
	@printf "  make content            outline → script → shorts → shotlist\n"
	@printf "  make media              audio → sora\n"
	@printf "  make pipeline           Run full pipeline (content + media)\n"
	@printf "  make clean              Remove generated files\n"
	@printf "  make scaffold-campaign  Clone this campaign: NAME=<new_campaign>\n\n"

# Setup targets
.PHONY: install
install:
	@echo "📦 Installing Python dependencies..."
	pip install -r requirements.txt
	@echo "✅ Dependencies installed"

.PHONY: setup-env
setup-env:
	@if [ ! -f .env ]; then \
		cp .env.example .env; \
		echo "✅ Created .env from template"; \
		echo "⚠️  Edit .env and add your API keys"; \
	else \
		echo "⚠️  .env already exists, skipping"; \
	fi

# Validation
.PHONY: validate
validate:
	@echo "🔍 Validating configuration..."
	@$(PYTHON) -c "from scripts.config import get_config; import sys; c=get_config(); issues=c.validate(); paths=[c.prompt_outline,c.prompt_script,c.prompt_shorts,c.prompt_shotlist,c.prompt_voice_style,c.paradigm_doc,c.intel_links]; issues+= [f'Missing file: {p}' for p in paths if not p.exists()]; [p.mkdir(parents=True, exist_ok=True) for p in (c.data_processed_dir,c.audio_dir,c.video_dir)]; \
print('❌ Issues found:\\n'+'\\n'.join('- '+i for i in issues) if issues else '✅ Configuration valid'); sys.exit(1 if issues else 0)"

# Step 1: Generate outline from threat doc
.PHONY: outline
outline:
	@echo "📋 Step 1: Generating video outline..."
	cd $(CAMPAIGN_DIR) && $(PYTHON) -m scripts.generate_outline

# Step 2: Generate long-form script from outline
.PHONY: script
script:
	@echo "📝 Step 2: Generating long-form script..."
	cd $(CAMPAIGN_DIR) && $(PYTHON) -m scripts.generate_script

# Step 3: Generate YouTube Shorts scripts
.PHONY: shorts
shorts:
	@echo "🎬 Step 3: Generating Shorts scripts..."
	cd $(CAMPAIGN_DIR) && $(PYTHON) -m scripts.generate_shorts

# Step 4: Generate Sora 2 shotlist
.PHONY: shotlist
shotlist:
	@echo "🎥 Step 4: Generating Sora 2 shotlist..."
	cd $(CAMPAIGN_DIR) && $(PYTHON) -m scripts.generate_shotlist

# Step 5: Generate ElevenLabs voiceover
.PHONY: audio
audio:
	@echo "🎙️ Step 5: Generating ElevenLabs voiceover..."
	cd $(CAMPAIGN_DIR) && $(PYTHON) -m scripts.generate_audio

# Step 6: Generate Sora 2 video clips
.PHONY: sora
sora:
	@echo "🎬 Step 6: Generating Sora 2 video clips..."
	cd $(CAMPAIGN_DIR) && $(PYTHON) -m scripts.generate_sora_clips

# Workflow targets
.PHONY: content
content: outline script shorts shotlist
	@echo ""
	@echo "✅ Content generation complete!"
	@echo "   Generated files in data/processed/"

.PHONY: media
media: audio sora
	@echo ""
	@echo "✅ Media generation complete!"
	@echo "   Audio: audio/voiceover.mp3"
	@echo "   Video: video/*.mp4"

.PHONY: pipeline
pipeline: content media
	@echo ""
	@echo "════════════════════════════════════════════"
	@echo "✅ Full pipeline complete!"
	@echo "════════════════════════════════════════════"
	@echo ""
	@echo "Next steps:"
	@echo "  1. Import audio/voiceover.mp3 into your editor"
	@echo "  2. Import video/*.mp4 clips as B-roll"
	@echo "  3. Sync audio with video using B-roll markers"
	@echo "  4. Add titles, transitions, and effects"
	@echo "  5. Export final video"

# Dry run (test without API calls)
.PHONY: dry-run
dry-run:
	@echo "🧪 DRY RUN - Testing pipeline without API calls..."
	@echo ""
	cd $(CAMPAIGN_DIR) && $(PYTHON) -m scripts.generate_outline --dry-run
	@echo ""
	cd $(CAMPAIGN_DIR) && $(PYTHON) -m scripts.generate_script --dry-run
	@echo ""
	cd $(CAMPAIGN_DIR) && $(PYTHON) -m scripts.generate_shorts --dry-run
	@echo ""
	cd $(CAMPAIGN_DIR) && $(PYTHON) -m scripts.generate_shotlist --dry-run
	@echo ""
	cd $(CAMPAIGN_DIR) && $(PYTHON) -m scripts.generate_audio --dry-run
	@echo ""
	cd $(CAMPAIGN_DIR) && $(PYTHON) -m scripts.generate_sora_clips --dry-run
	@echo ""
	@echo "✅ Dry run complete - no API calls made"

# Simulation mode (offline, uses fake adapters)
.PHONY: simulate
simulate:
	@echo "🤖 SIMULATION - Running full pipeline with fake adapters..."
	cd $(CAMPAIGN_DIR) && $(PYTHON) -m scripts.generate_outline --simulate
	cd $(CAMPAIGN_DIR) && $(PYTHON) -m scripts.generate_script --simulate
	cd $(CAMPAIGN_DIR) && $(PYTHON) -m scripts.generate_shorts --simulate
	cd $(CAMPAIGN_DIR) && $(PYTHON) -m scripts.generate_shotlist --simulate
	cd $(CAMPAIGN_DIR) && $(PYTHON) -m scripts.generate_audio --simulate
	cd $(CAMPAIGN_DIR) && $(PYTHON) -m scripts.generate_sora_clips --simulate
	@echo "✅ Simulation complete - check data/processed, audio/, video/ for fake outputs"

# Unit tests
.PHONY: test
test:
	@echo "🧪 Running unit tests..."
	cd $(CAMPAIGN_DIR) && PYTHONPATH=$(SCRIPTS_DIR):$$PYTHONPATH $(PYTHON) -m pytest

# Clean generated files
.PHONY: clean
clean:
	@echo "🧹 Cleaning generated files..."
	rm -f data/processed/outline.json
	rm -f data/processed/script-longform.md
	rm -f data/processed/shorts-scripts.md
	rm -f data/processed/shotlist.json
	rm -f audio/voiceover.mp3
	rm -f video/*.mp4
	@echo "✅ Clean complete"

# Show pipeline status
.PHONY: status
status:
	@echo "📊 Pipeline Status: Shai-Hulud 2025"
	@echo "════════════════════════════════════════════"
	@echo ""
	@echo "📄 Source Documents:"
	@[ -f docs/shai-hulud-paradigm.md ] && echo "  ✅ docs/shai-hulud-paradigm.md" || echo "  ❌ docs/shai-hulud-paradigm.md (MISSING)"
	@[ -f data/raw/intel-links.md ] && echo "  ✅ data/raw/intel-links.md" || echo "  ⚠️  data/raw/intel-links.md"
	@echo ""
	@echo "🔧 Configuration:"
	@[ -f .env ] && echo "  ✅ .env file exists" || echo "  ❌ .env file missing (run: make setup-env)"
	@echo ""
	@echo "📊 Generated Content:"
	@[ -f data/processed/outline.json ] && echo "  ✅ outline.json" || echo "  ⬜ outline.json (make outline)"
	@[ -f data/processed/script-longform.md ] && echo "  ✅ script-longform.md" || echo "  ⬜ script-longform.md (make script)"
	@[ -f data/processed/shorts-scripts.md ] && echo "  ✅ shorts-scripts.md" || echo "  ⬜ shorts-scripts.md (make shorts)"
	@[ -f data/processed/shotlist.json ] && echo "  ✅ shotlist.json" || echo "  ⬜ shotlist.json (make shotlist)"
	@echo ""
	@echo "🎵 Audio:"
	@[ -f audio/voiceover.mp3 ] && echo "  ✅ voiceover.mp3" || echo "  ⬜ voiceover.mp3 (make audio)"
	@echo ""
	@echo "🎬 Video Clips:"
	@ls -1 video/*.mp4 2>/dev/null | wc -l | xargs -I {} echo "  {} clips in video/"
	@echo ""
	@echo "════════════════════════════════════════════"

# Scaffold a new campaign folder
.PHONY: scaffold-campaign
scaffold-campaign:
	@test -n "$(NAME)" || (echo "NAME is required (e.g., make scaffold-campaign NAME=log4shell-retro)" && exit 1)
	@src_dir="$(CAMPAIGN_DIR)"; dst_dir="$$(cd "$(CAMPAIGN_DIR)/.." && pwd)/$(NAME)"; \
	if [ -e "$$dst_dir" ]; then echo "Target already exists: $$dst_dir"; exit 1; fi; \
	cp -R "$$src_dir" "$$dst_dir"; \
	rm -f "$$dst_dir/.env"; \
	find "$$dst_dir/data/processed" "$$dst_dir/audio" "$$dst_dir/video" -type f ! -name ".gitkeep" -delete 2>/dev/null || true; \
	find "$$dst_dir/data/processed" "$$dst_dir/audio" "$$dst_dir/video" -mindepth 1 -type d -empty -delete 2>/dev/null || true; \
	{ printf "NOTE: Update docs/shai-hulud-paradigm.md, prompts/*, and README for the new threat\n\n"; cat "$$dst_dir/README.md"; } > "$$dst_dir/README.tmp" && mv "$$dst_dir/README.tmp" "$$dst_dir/README.md"; \
	echo "✅ Scaffolded new campaign at $$dst_dir"
