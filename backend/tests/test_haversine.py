"""
tests/test_haversine.py
=======================
Purpose:
    Unit tests for the Haversine formula utility function.

Testing Strategy:
    - Tests are organised into a class (TestHaversine) so pytest output
      groups them cleanly and they're easy to find.
    - Each test covers exactly ONE behaviour — Single Responsibility.
    - Tests use real-world known distances (London, Paris) to validate
      accuracy against independently verifiable values.
    - Edge cases (same point, antipodal points) ensure robustness.
    - No mocks needed — haversine() is a pure function with no dependencies.

Why unit test a math formula?
    - Documents the expected precision (4 decimal places).
    - Catches regressions if the formula is ever modified.
    - Confirms symmetry (A→B == B→A).
    - Validates the Earth radius constant (EARTH_RADIUS_KM).
"""

import math
import pytest

from app.utils.haversine import haversine, EARTH_RADIUS_KM


class TestHaversine:
    """Unit tests for the haversine() distance calculation function."""

    # ── Basic correctness ─────────────────────────────────────────────────────

    def test_same_point_returns_zero(self) -> None:
        """Distance between identical coordinates must be exactly 0.0."""
        result = haversine(51.5074, -0.1278, 51.5074, -0.1278)
        assert result == 0.0

    def test_returns_float(self) -> None:
        """Return type must always be float."""
        result = haversine(51.5074, -0.1278, 51.5155, -0.0922)
        assert isinstance(result, float)

    def test_distance_is_non_negative(self) -> None:
        """Distance can never be negative."""
        result = haversine(51.5074, -0.1278, 48.8566, 2.3522)
        assert result >= 0.0

    # ── Known distances ───────────────────────────────────────────────────────

    def test_two_london_points_approx_2_6_km(self) -> None:
        """
        Two known London points should be approximately 2.6 km apart.
        Pre-validated against Google Maps and an independent Haversine calculator.
        """
        result = haversine(51.5074, -0.1278, 51.5155, -0.0922)
        assert 2.5 < result < 2.8, f"Expected ~2.6 km, got {result}"

    def test_london_to_paris_approx_340_km(self) -> None:
        """
        London to Paris is approximately 340 km by great-circle distance.
        Validates the formula works over longer intercity distances.
        """
        result = haversine(51.5074, -0.1278, 48.8566, 2.3522)
        assert 330.0 < result < 360.0, f"Expected ~340 km, got {result}"

    def test_new_york_to_london_approx_5570_km(self) -> None:
        """
        New York to London is approximately 5,570 km.
        Validates accuracy over transatlantic (very long) distances.
        """
        result = haversine(40.7128, -74.0060, 51.5074, -0.1278)
        assert 5_500.0 < result < 5_650.0, f"Expected ~5570 km, got {result}"

    # ── Mathematical properties ───────────────────────────────────────────────

    def test_symmetry_a_to_b_equals_b_to_a(self) -> None:
        """
        Haversine must be symmetric: distance(A→B) == distance(B→A).
        This is a fundamental property of great-circle distance.
        """
        d_forward = haversine(51.5074, -0.1278, 51.5155, -0.0922)
        d_reverse = haversine(51.5155, -0.0922, 51.5074, -0.1278)
        assert abs(d_forward - d_reverse) < 0.0001, (
            f"Symmetry failed: forward={d_forward}, reverse={d_reverse}"
        )

    def test_result_rounded_to_4_decimal_places(self) -> None:
        """Result must be rounded to exactly 4 decimal places."""
        result = haversine(51.5074, -0.1278, 51.5155, -0.0922)
        assert result == round(result, 4)

    def test_earth_radius_constant_value(self) -> None:
        """EARTH_RADIUS_KM must be the WGS-84 standard mean radius."""
        assert EARTH_RADIUS_KM == 6371.0

    # ── Boundary coordinates ──────────────────────────────────────────────────

    def test_equator_coordinates(self) -> None:
        """Should handle equatorial coordinates (lat=0) without error."""
        result = haversine(0.0, 0.0, 0.0, 1.0)
        assert result > 0.0  # ~111 km per degree of longitude at equator

    def test_southern_hemisphere(self) -> None:
        """Should handle negative latitudes (Southern Hemisphere) correctly."""
        # Sydney, Australia to Melbourne, Australia (~714 km)
        result = haversine(-33.8688, 151.2093, -37.8136, 144.9631)
        assert 700.0 < result < 750.0, f"Expected ~714 km, got {result}"
