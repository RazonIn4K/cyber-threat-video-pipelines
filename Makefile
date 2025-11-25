# Root Makefile for Cyber Threat Video Pipelines

PYTHON := python3

.PHONY: all
all: help

.PHONY: help
help:
	@echo "Available commands:"
	@echo "  make scaffold-campaign NAME=<name>  - Create a new campaign from template"
	@echo "  make list-campaigns                 - List all campaigns"

.PHONY: scaffold-campaign
scaffold-campaign:
	@if [ -z "$(NAME)" ]; then \
		echo "Error: NAME argument required. Usage: make scaffold-campaign NAME=<name>"; \
		exit 1; \
	fi
	$(PYTHON) scripts/campaign_tooling.py new $(NAME)

.PHONY: list-campaigns
list-campaigns:
	$(PYTHON) scripts/campaign_tooling.py list
