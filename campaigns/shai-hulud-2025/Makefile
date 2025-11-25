# Shai-Hulud 2025 Campaign - Video Pipeline Makefile
# Usage: make <target>

# Configuration
CAMPAIGN_DIR := $(shell pwd)
SCRIPTS_DIR := $(CAMPAIGN_DIR)/scripts
PYTHON := python3

# Default target
.PHONY: all
all: help

# Help target
.PHONY: help
help:
	@echo "╔══════════════════════════════════════════════════════════════════╗"
	@echo "║       Shai-Hulud 2025 Campaign - Video Pipeline Makefile        ║"
	@echo "╠══════════════════════════════════════════════════════════════════╣"
	@echo "║  Setup:                                                          ║"
	@echo "║    make install      - Install Python dependencies               ║"
	@echo "║    make setup-env    - Create .env file from template            ║"
	@echo "║                                                                  ║"
	@echo "║  Pipeline Steps (run in order):                                  ║"
	@echo "║    make outline      - Generate video outline from threat doc    ║"
	@echo "║    make script       - Generate long-form script from outline    ║"
	@echo "║    make shorts       - Generate YouTube Shorts scripts           ║"
	@echo "║    make shotlist     - Generate Sora 2 shotlist from script      ║"
	@echo "║    make audio        - Generate ElevenLabs voiceover             ║"
	@echo "║    make sora         - Generate Sora 2 video clips               ║"
	@echo "║                                                                  ║"
	@echo "║  Workflow:                                                       ║"
	@echo "║    make content      - Run outline → script → shorts → shotlist  ║"
	@echo "║    make media        - Run audio → sora                          ║"
	@echo "║    make pipeline     - Run full pipeline (all steps)             ║"
	@echo "║                                                                  ║"
	@echo "║  Testing:                                                        ║"
	@echo "║    make dry-run      - Preview all steps without API calls       ║"
	@echo "║    make simulate     - Run full pipeline with fake adapters      ║"
	@echo "║    make test         - Run unit tests                            ║"
	@echo "║                                                                  ║"
	@echo "║  Utilities:                                                      ║"
	@echo "║    make clean        - Remove generated files                    ║"
	@echo "║    make status       - Show pipeline status                      ║"
	@echo "║    make validate     - Check configuration                       ║"
	@echo "╚══════════════════════════════════════════════════════════════════╝"

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
	@$(PYTHON) -c "from scripts.config import get_config; c = get_config(); errors = c.validate(); print('\n'.join(errors) if errors else '✅ Configuration valid')"

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

# Simulation mode (full pipeline with fake adapters)
.PHONY: simulate
simulate:
	@echo "🤖 SIMULATION - Running full pipeline with fake adapters..."
	@echo ""
	cd $(CAMPAIGN_DIR) && export PYTHONPATH=$(CAMPAIGN_DIR)/scripts && $(PYTHON) -m scripts.generate_outline --simulate
	@echo ""
	cd $(CAMPAIGN_DIR) && export PYTHONPATH=$(CAMPAIGN_DIR)/scripts && $(PYTHON) -m scripts.generate_script --simulate
	@echo ""
	cd $(CAMPAIGN_DIR) && export PYTHONPATH=$(CAMPAIGN_DIR)/scripts && $(PYTHON) -m scripts.generate_shorts --simulate
	@echo ""
	cd $(CAMPAIGN_DIR) && export PYTHONPATH=$(CAMPAIGN_DIR)/scripts && $(PYTHON) -m scripts.generate_shotlist --simulate
	@echo ""
	cd $(CAMPAIGN_DIR) && export PYTHONPATH=$(CAMPAIGN_DIR)/scripts && $(PYTHON) -m scripts.generate_audio --simulate
	@echo ""
	cd $(CAMPAIGN_DIR) && export PYTHONPATH=$(CAMPAIGN_DIR)/scripts && $(PYTHON) -m scripts.generate_sora_clips --simulate
	@echo ""
	@echo "✅ Simulation complete - Check data/processed and audio/ for fake content"

# Unit tests
.PHONY: test
test:
	@echo "🧪 Running unit tests..."
	export PYTHONPATH=$PYTHONPATH:$(CAMPAIGN_DIR)/scripts && $(PYTHON) -m pytest tests/

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