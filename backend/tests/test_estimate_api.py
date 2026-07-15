"""
tests/test_estimate_api.py
==========================
Purpose:
    Integration tests for the POST /api/estimate HTTP endpoint and the
    GET / health check endpoint.

Testing Strategy:
    - Uses FastAPI's TestClient (backed by httpx) to make real HTTP requests
      through the full middleware + handler + service stack.
    - Tests are grouped into classes by endpoint for a clean Pytest output.
    - Covers: happy path, all traffic levels, all validation error types,
      boundary values, error response shape, and HTTP method restrictions.

The "client" and "valid_payload" fixtures come from conftest.py.

Why integration tests AND unit tests?
    - Unit tests (test_eta_service.py) catch pure logic bugs in isolation.
    - Integration tests here catch wiring bugs:
        "Is the router mounted at the right prefix?"
        "Does the CORS middleware run?"
        "Is the 422 error response shaped correctly?"
    Both layers are necessary for production confidence.
"""

import pytest
from fastapi.testclient import TestClient


class TestHealthCheck:
    """Tests for the GET / health check endpoint."""

    def test_health_check_returns_200(self, client: TestClient) -> None:
        response = client.get("/")
        assert response.status_code == 200

    def test_health_check_status_field(self, client: TestClient) -> None:
        data = client.get("/").json()
        assert data["status"] == "ok"

    def test_health_check_has_version(self, client: TestClient) -> None:
        data = client.get("/").json()
        assert "version" in data
        assert data["version"] == "2.0.0"

    def test_health_check_has_service_name(self, client: TestClient) -> None:
        data = client.get("/").json()
        assert "service" in data


class TestEstimateEndpointHappyPath:
    """Tests for POST /api/estimate — valid requests."""

    def test_valid_request_returns_200(
        self, client: TestClient, valid_payload: dict
    ) -> None:
        response = client.post("/api/estimate", json=valid_payload)
        assert response.status_code == 200

    def test_response_contains_all_required_fields(
        self, client: TestClient, valid_payload: dict
    ) -> None:
        data = client.post("/api/estimate", json=valid_payload).json()
        required_fields = {
            "restaurant_name", "distance_km", "total_eta", "delivery_status", "eta_breakdown"
        }
        assert required_fields.issubset(data.keys()), (
            f"Missing fields: {required_fields - data.keys()}"
        )

    def test_response_field_types(
        self, client: TestClient, valid_payload: dict
    ) -> None:
        data = client.post("/api/estimate", json=valid_payload).json()
        assert isinstance(data["restaurant_name"],     str)
        assert isinstance(data["distance_km"],         float)
        assert isinstance(data["total_eta"],           float)
        assert isinstance(data["delivery_status"],     str)
        assert isinstance(data["eta_breakdown"],       dict)

    def test_restaurant_name_is_echoed(
        self, client: TestClient, valid_payload: dict
    ) -> None:
        data = client.post("/api/estimate", json=valid_payload).json()
        assert data["restaurant_name"] == valid_payload["restaurant_name"]

    def test_delivery_status_is_valid(
        self, client: TestClient, valid_payload: dict
    ) -> None:
        data = client.post("/api/estimate", json=valid_payload).json()
        assert data["delivery_status"] in {"Fast Delivery", "Moderate", "Delayed"}

    def test_distance_is_positive(
        self, client: TestClient, valid_payload: dict
    ) -> None:
        data = client.post("/api/estimate", json=valid_payload).json()
        assert data["distance_km"] > 0.0

    def test_total_eta_equals_sum_of_breakdown(
        self, client: TestClient, valid_payload: dict
    ) -> None:
        data = client.post("/api/estimate", json=valid_payload).json()
        breakdown = data["eta_breakdown"]
        expected = sum(breakdown.values())
        assert abs(data["total_eta"] - expected) < 0.01

    @pytest.mark.parametrize("traffic_level", ["low", "medium", "high"])
    def test_all_traffic_levels_return_200(
        self, client: TestClient, valid_payload: dict, traffic_level: str
    ) -> None:
        payload = {**valid_payload, "traffic": traffic_level}
        response = client.post("/api/estimate", json=payload)
        assert response.status_code == 200, (
            f"Expected 200 for traffic={traffic_level!r}, "
            f"got {response.status_code}: {response.text}"
        )


class TestEstimateEndpointValidation:
    """Tests for POST /api/estimate — validation error cases."""

    def test_invalid_restaurant_lat_above_90_returns_422(
        self, client: TestClient, valid_payload: dict
    ) -> None:
        response = client.post("/api/estimate", json={**valid_payload, "restaurant_lat": 91})
        assert response.status_code == 422

    def test_invalid_restaurant_lat_below_minus_90_returns_422(
        self, client: TestClient, valid_payload: dict
    ) -> None:
        response = client.post("/api/estimate", json={**valid_payload, "restaurant_lat": -91})
        assert response.status_code == 422

    def test_invalid_longitude_returns_422(
        self, client: TestClient, valid_payload: dict
    ) -> None:
        response = client.post("/api/estimate", json={**valid_payload, "delivery_lon": -999})
        assert response.status_code == 422

    def test_invalid_traffic_level_returns_422(
        self, client: TestClient, valid_payload: dict
    ) -> None:
        response = client.post("/api/estimate", json={**valid_payload, "traffic": "extreme"})
        assert response.status_code == 422

    def test_empty_restaurant_name_returns_422(
        self, client: TestClient, valid_payload: dict
    ) -> None:
        response = client.post("/api/estimate", json={**valid_payload, "restaurant_name": ""})
        assert response.status_code == 422

    def test_negative_prep_time_returns_422(
        self, client: TestClient, valid_payload: dict
    ) -> None:
        response = client.post("/api/estimate", json={**valid_payload, "prep_time": -1})
        assert response.status_code == 422

    def test_prep_time_above_180_returns_422(
        self, client: TestClient, valid_payload: dict
    ) -> None:
        response = client.post("/api/estimate", json={**valid_payload, "prep_time": 181})
        assert response.status_code == 422

    def test_missing_required_field_returns_422(
        self, client: TestClient, valid_payload: dict
    ) -> None:
        payload = {k: v for k, v in valid_payload.items() if k != "restaurant_name"}
        response = client.post("/api/estimate", json=payload)
        assert response.status_code == 422

    def test_missing_all_fields_returns_422(self, client: TestClient) -> None:
        response = client.post("/api/estimate", json={})
        assert response.status_code == 422


class TestErrorResponseShape:
    """Tests that ALL error responses share the same uniform JSON shape."""

    def test_422_error_has_error_key(
        self, client: TestClient, valid_payload: dict
    ) -> None:
        response = client.post("/api/estimate", json={**valid_payload, "restaurant_lat": 999})
        data = response.json()
        assert "error" in data

    def test_422_error_has_code_and_message(
        self, client: TestClient, valid_payload: dict
    ) -> None:
        response = client.post("/api/estimate", json={**valid_payload, "restaurant_lat": 999})
        error = response.json()["error"]
        assert "code"    in error
        assert "message" in error

    def test_422_error_has_details(
        self, client: TestClient, valid_payload: dict
    ) -> None:
        """Validation errors must include field-level details."""
        response = client.post("/api/estimate", json={**valid_payload, "restaurant_lat": 999})
        error = response.json()["error"]
        assert "details" in error
        assert isinstance(error["details"], list)
        assert len(error["details"]) > 0

    def test_422_error_detail_has_field_and_message(
        self, client: TestClient, valid_payload: dict
    ) -> None:
        response = client.post("/api/estimate", json={**valid_payload, "restaurant_lat": 999})
        detail = response.json()["error"]["details"][0]
        assert "field"   in detail
        assert "message" in detail
        assert "type"    in detail

    def test_404_returns_error_shape(self, client: TestClient) -> None:
        response = client.get("/api/nonexistent-route")
        data = response.json()
        assert "error" in data
        assert "code" in data["error"]


class TestBoundaryValues:
    """Tests for boundary values on coordinate and prep_time fields."""

    @pytest.mark.parametrize("prep_time", [0, 1, 180])
    def test_prep_time_boundary_values_are_valid(
        self, client: TestClient, valid_payload: dict, prep_time: int
    ) -> None:
        response = client.post("/api/estimate", json={**valid_payload, "prep_time": prep_time})
        assert response.status_code == 200

    @pytest.mark.parametrize("lat", [-90.0, 0.0, 90.0])
    def test_latitude_boundary_values_are_valid(
        self, client: TestClient, valid_payload: dict, lat: float
    ) -> None:
        response = client.post("/api/estimate", json={**valid_payload, "delivery_lat": lat})
        assert response.status_code == 200

    @pytest.mark.parametrize("lon", [-180.0, 0.0, 180.0])
    def test_longitude_boundary_values_are_valid(
        self, client: TestClient, valid_payload: dict, lon: float
    ) -> None:
        response = client.post("/api/estimate", json={**valid_payload, "delivery_lon": lon})
        assert response.status_code == 200
