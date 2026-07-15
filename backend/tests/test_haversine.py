import math
import pytest

from app.utils.haversine import haversine, EARTH_RADIUS_KM

class TestHaversine:
    

    def test_same_point_returns_zero(self) -> None:
        
        result = haversine(51.5074, -0.1278, 51.5074, -0.1278)
        assert result == 0.0

    def test_returns_float(self) -> None:
        
        result = haversine(51.5074, -0.1278, 51.5155, -0.0922)
        assert isinstance(result, float)

    def test_distance_is_non_negative(self) -> None:
        
        result = haversine(51.5074, -0.1278, 48.8566, 2.3522)
        assert result >= 0.0

    def test_two_london_points_approx_2_6_km(self) -> None:
        
        result = haversine(51.5074, -0.1278, 51.5155, -0.0922)
        assert 2.5 < result < 2.8, f"Expected ~2.6 km, got {result}"

    def test_london_to_paris_approx_340_km(self) -> None:
        
        result = haversine(51.5074, -0.1278, 48.8566, 2.3522)
        assert 330.0 < result < 360.0, f"Expected ~340 km, got {result}"

    def test_new_york_to_london_approx_5570_km(self) -> None:
        
        result = haversine(40.7128, -74.0060, 51.5074, -0.1278)
        assert 5_500.0 < result < 5_650.0, f"Expected ~5570 km, got {result}"

    def test_symmetry_a_to_b_equals_b_to_a(self) -> None:
        
        d_forward = haversine(51.5074, -0.1278, 51.5155, -0.0922)
        d_reverse = haversine(51.5155, -0.0922, 51.5074, -0.1278)
        assert abs(d_forward - d_reverse) < 0.0001, (
            f"Symmetry failed: forward={d_forward}, reverse={d_reverse}"
        )

    def test_result_rounded_to_4_decimal_places(self) -> None:
        
        result = haversine(51.5074, -0.1278, 51.5155, -0.0922)
        assert result == round(result, 4)

    def test_earth_radius_constant_value(self) -> None:
        
        assert EARTH_RADIUS_KM == 6371.0

    def test_equator_coordinates(self) -> None:
        
        result = haversine(0.0, 0.0, 0.0, 1.0)
        assert result > 0.0

    def test_southern_hemisphere(self) -> None:
        
        result = haversine(-33.8688, 151.2093, -37.8136, 144.9631)
        assert 700.0 < result < 750.0, f"Expected ~714 km, got {result}"
