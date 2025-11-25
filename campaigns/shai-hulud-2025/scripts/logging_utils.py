"""
Shared logging setup for pipeline scripts.

Usage:
    from logging_utils import get_logger
    log = get_logger(__name__)
"""

from __future__ import annotations

import logging
import os
from typing import Optional


def _log_level_from_env(default: str = "INFO") -> int:
    """Resolve a logging level from the LOG_LEVEL env var."""
    level_name = os.getenv("LOG_LEVEL", default).upper()
    return getattr(logging, level_name, logging.INFO)


def configure_logging(level: Optional[int] = None) -> None:
    """Configure root logger once with a simple, consistent format."""
    if logging.getLogger().handlers:
        return

    logging.basicConfig(
        level=level or _log_level_from_env(),
        format="%(asctime)s | %(levelname)s | %(name)s | %(message)s",
        datefmt="%H:%M:%S",
    )


def get_logger(name: str) -> logging.Logger:
    """Get a named logger with baseline configuration."""
    configure_logging()
    return logging.getLogger(name)
