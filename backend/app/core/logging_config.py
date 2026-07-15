"""
core/logging_config.py
======================
Purpose:
    Configures structured logging for the entire DeliverIQ application.

Why structured logging matters:
    - In production, JSON logs are machine-parseable by aggregators like
      Datadog, CloudWatch, or Google Cloud Logging — enabling alerting,
      dashboards, and full-text search across millions of log lines.
    - In development, human-readable text format is used so developers
      can read logs quickly without a log aggregation tool.
    - Named loggers (get_logger(__name__)) mean log lines include the
      exact module and function that produced them — no guessing.

Log Levels:
    DEBUG    → Verbose diagnostic info (local debugging only)
    INFO     → Normal operational events (requests, startups, key decisions)
    WARNING  → Unexpected but recoverable situations
    ERROR    → Failures that need investigation (exceptions, bad state)
    CRITICAL → Catastrophic failures (data loss, unrecoverable state)

Usage:
    from app.core.logging_config import get_logger

    logger = get_logger(__name__)
    logger.info("ETA calculated | restaurant=%s eta=%.2f", name, eta)
    logger.error("Haversine failed | error=%s", str(exc), exc_info=True)
"""

import json
import logging
import sys
from datetime import datetime, timezone
from typing import Any


# ── Custom Formatters ─────────────────────────────────────────────────────────

class JSONFormatter(logging.Formatter):
    """
    Formats log records as single-line JSON objects.

    Output example:
        {"timestamp":"2024-01-15T10:30:00Z","level":"INFO","message":"ETA calculated","module":"eta_service","function":"estimate_eta","line":72}

    Why single-line JSON?
        Log aggregators (Datadog, CloudWatch) parse one JSON object per line.
        Multi-line JSON breaks their parsers.
    """

    def format(self, record: logging.LogRecord) -> str:
        log_entry: dict[str, Any] = {
            "timestamp": datetime.now(timezone.utc).isoformat(),
            "level":     record.levelname,
            "message":   record.getMessage(),
            "logger":    record.name,
            "module":    record.module,
            "function":  record.funcName,
            "line":      record.lineno,
        }
        if record.exc_info:
            log_entry["exception"] = self.formatException(record.exc_info)
        if record.stack_info:
            log_entry["stack_info"] = self.formatStack(record.stack_info)
        return json.dumps(log_entry, ensure_ascii=False)


class TextFormatter(logging.Formatter):
    """
    Human-readable formatter for local development.

    Output example:
        2024-01-15 10:30:00 | INFO     | eta_service:estimate_eta:72 | ETA calculated

    Colour-coded by level for easy scanning in terminals that support ANSI.
    """

    LEVEL_COLOURS: dict[str, str] = {
        "DEBUG":    "\033[36m",   # Cyan
        "INFO":     "\033[32m",   # Green
        "WARNING":  "\033[33m",   # Yellow
        "ERROR":    "\033[31m",   # Red
        "CRITICAL": "\033[35m",   # Magenta
    }
    RESET = "\033[0m"

    def format(self, record: logging.LogRecord) -> str:
        colour = self.LEVEL_COLOURS.get(record.levelname, "")
        level  = f"{colour}{record.levelname:<8}{self.RESET}"
        location = f"{record.module}:{record.funcName}:{record.lineno}"
        timestamp = datetime.now().strftime("%Y-%m-%d %H:%M:%S")
        base = f"{timestamp} | {level} | {location:<40} | {record.getMessage()}"
        if record.exc_info:
            base += f"\n{self.formatException(record.exc_info)}"
        return base


# ── Configuration function ────────────────────────────────────────────────────

def configure_logging(log_level: str = "INFO", log_format: str = "text") -> None:
    """
    Configure the root logger for the entire application.

    This should be called ONCE at application startup (in main.py),
    before any other code runs. All subsequent `get_logger()` calls
    will inherit this configuration.

    Args:
        log_level:  Logging threshold — "DEBUG" | "INFO" | "WARNING" | "ERROR" | "CRITICAL"
        log_format: Output format — "text" (dev) | "json" (prod)
    """
    level = getattr(logging, log_level.upper(), logging.INFO)

    # Select formatter
    formatter: logging.Formatter
    if log_format.lower() == "json":
        formatter = JSONFormatter()
    else:
        formatter = TextFormatter()

    # Build handler (stdout so container runtimes capture logs)
    handler = logging.StreamHandler(sys.stdout)
    handler.setFormatter(formatter)

    # Apply to root logger
    root = logging.getLogger()
    root.setLevel(level)
    root.handlers.clear()
    root.addHandler(handler)

    # Quieten noisy third-party loggers to WARNING
    for noisy_logger in ("uvicorn.access", "httpx", "httpcore"):
        logging.getLogger(noisy_logger).setLevel(logging.WARNING)


# ── Logger factory ────────────────────────────────────────────────────────────

def get_logger(name: str) -> logging.Logger:
    """
    Get a named logger for a specific module.

    Convention: always pass __name__ so log lines include the exact module path.

    Args:
        name: Typically `__name__` of the calling module.

    Returns:
        logging.Logger: A logger inheriting the root configuration.

    Example:
        logger = get_logger(__name__)
        logger.info("ETA calculated for %s: %.2f min", restaurant, eta)
    """
    return logging.getLogger(name)
