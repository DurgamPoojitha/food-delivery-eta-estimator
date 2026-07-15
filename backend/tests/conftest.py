import pytest
from fastapi.testclient import TestClient

from app.main import app

@pytest.fixture(scope="module")
def client() -> TestClient:
    
    with TestClient(app) as test_client:
        yield test_client

@pytest.fixture
def valid_payload() -> dict:
    
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
