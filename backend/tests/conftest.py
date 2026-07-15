"""
tests/conftest.py
=================
Purpose:
    Shared pytest fixtures available to ALL test modules in the tests/ directory.

Why conftest.py?
    Pytest automatically discovers and loads conftest.py files.
    Fixtures defined here are available without explicit imports in test files.
    This prevents DRY violations — define TestClient once, use everywhere.

Fixtures:
    client       → FastAPI TestClient (module-scoped for performance)
    valid_payload → A complete, valid request body dict for POST /api/estimate

TestClient notes:
    - FastAPI's TestClient wraps httpx under the hood.
    - Using it as a context manager (with TestClient(app) as c) triggers the
      lifespan context manager, firing startup/shutdown events just like production.
    - scope="module" means the client is created once per test file, not per test.
      This speeds up the test suite significantly.
"""

import pytest
from fastapi.testclient import TestClient

from app.main import app


@pytest.fixture(scope="module")
def client() -> TestClient:
    """
    Provides a FastAPI TestClient that mirrors production behaviour.

    scope="module" → created once per test module (not per test function).
    Using `with` ensures the lifespan context manager (startup/shutdown) runs.
    """
    with TestClient(app) as test_client:
        yield test_client


@pytest.fixture
def valid_payload() -> dict:
    """
    A complete, valid request payload for POST /api/estimate.
    Now includes all advanced delivery conditions (weather, peak, etc).
    """
    return {
        "restaurant_name": "Burger Palace",
        "restaurant_lat":  51.5074,
        "restaurant_lon": -0.1278,
        "delivery_lat":   51.5155,
        "delivery_lon":  -0.0922,
        "prep_time":      15,
        "traffic":        "medium",
        "busy_level":     "high",
        "peak_hour":      "dinner",
        "weather":        "rain",
        "is_weekend":     True,
    }
