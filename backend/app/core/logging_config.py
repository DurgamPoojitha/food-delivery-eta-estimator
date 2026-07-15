import json
import logging
import sys
from datetime import datetime, timezone
from typing import Any

class JSONFormatter(logging.Formatter):
    

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
    

    LEVEL_COLOURS: dict[str, str] = {
        "DEBUG":    "\033[36m", 
        "INFO":     "\033[32m", 
        "WARNING":  "\033[33m", 
        "ERROR":    "\033[31m", 
        "CRITICAL": "\033[35m", 
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

def configure_logging(log_level: str = "INFO", log_format: str = "text") -> None:
    
    level = getattr(logging, log_level.upper(), logging.INFO)

    formatter: logging.Formatter
    if log_format.lower() == "json":
        formatter = JSONFormatter()
    else:
        formatter = TextFormatter()

    handler = logging.StreamHandler(sys.stdout)
    handler.setFormatter(formatter)

    root = logging.getLogger()
    root.setLevel(level)
    root.handlers.clear()
    root.addHandler(handler)

    for noisy_logger in ("uvicorn.access", "httpx", "httpcore"):
        logging.getLogger(noisy_logger).setLevel(logging.WARNING)

def get_logger(name: str) -> logging.Logger:
    
    return logging.getLogger(name)
