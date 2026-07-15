"""
tests/test_eta_service.py
=========================
Purpose:
    Unit tests for the Advanced ETA estimation service layer.
"""

import pytest

from app.models.estimate import (
    EstimateRequest,
    PeakHour,
    RestaurantBusyLevel,
    TrafficLevel,
    WeatherCondition,
)
from app.services.eta_service import (
    BUSY_DELAYS,
    PEAK_DELAYS,
    TRAFFIC_MULTIPLIERS,
    WEATHER_DELAYS,
    WEEKEND_SURGE_DELAY,
    _get_delivery_status,
    estimate_eta,
)


class TestGetDeliveryStatus:
    def test_fast_delivery_boundary(self) -> None:
        assert _get_delivery_status(19.99) == "Fast Delivery"

    def test_moderate_boundaries(self) -> None:
        assert _get_delivery_status(20.0) == "Moderate"
        assert _get_delivery_status(40.0) == "Moderate"

    def test_delayed_boundary(self) -> None:
        assert _get_delivery_status(40.01) == "Delayed"


class TestBusinessRulesContracts:
    """Ensure the documented modifiers don't accidentally drift."""
    
    def test_traffic_multipliers(self) -> None:
        assert TRAFFIC_MULTIPLIERS[TrafficLevel.low] == 1.0
        assert TRAFFIC_MULTIPLIERS[TrafficLevel.medium] == 1.4
        assert TRAFFIC_MULTIPLIERS[TrafficLevel.high] == 2.0

    def test_busy_delays(self) -> None:
        assert BUSY_DELAYS[RestaurantBusyLevel.low] == 0.0
        assert BUSY_DELAYS[RestaurantBusyLevel.medium] == 5.0
        assert BUSY_DELAYS[RestaurantBusyLevel.high] == 10.0

    def test_peak_delays(self) -> None:
        assert PEAK_DELAYS[PeakHour.none] == 0.0
        assert PEAK_DELAYS[PeakHour.lunch] == 8.0
        assert PEAK_DELAYS[PeakHour.dinner] == 12.0

    def test_weather_delays(self) -> None:
        assert WEATHER_DELAYS[WeatherCondition.sunny] == 0.0
        assert WEATHER_DELAYS[WeatherCondition.rain] == 10.0
        assert WEATHER_DELAYS[WeatherCondition.heavy_rain] == 20.0

    def test_weekend_surge(self) -> None:
        assert WEEKEND_SURGE_DELAY == 5.0


class TestEstimateETA:
    @staticmethod
    def _make_request(**overrides) -> EstimateRequest:
        defaults = {
            "restaurant_name": "Test Restaurant",
            "restaurant_lat":  51.5074,
            "restaurant_lon": -0.1278,
            "delivery_lat":   51.5155,
            "delivery_lon":  -0.0922,
            "prep_time":      15,
            "traffic":        TrafficLevel.medium,
            "busy_level":     RestaurantBusyLevel.low,
            "peak_hour":      PeakHour.none,
            "weather":        WeatherCondition.sunny,
            "is_weekend":     False,
        }
        defaults.update(overrides)
        return EstimateRequest(**defaults)

    def test_response_shape_and_breakdown(self) -> None:
        result = estimate_eta(self._make_request())
        assert hasattr(result, "eta_breakdown")
        
        breakdown = result.eta_breakdown
        assert "base_travel_time" in breakdown
        assert "traffic_delay" in breakdown
        assert "base_prep_time" in breakdown
        assert "busy_delay" in breakdown
        assert "peak_delay" in breakdown
        assert "weather_delay" in breakdown
        assert "weekend_delay" in breakdown

    def test_zero_delays_on_perfect_conditions(self) -> None:
        result = estimate_eta(self._make_request(
            traffic=TrafficLevel.low,
            busy_level=RestaurantBusyLevel.low,
            peak_hour=PeakHour.none,
            weather=WeatherCondition.sunny,
            is_weekend=False,
        ))
        
        breakdown = result.eta_breakdown
        assert breakdown["traffic_delay"] == 0.0
        assert breakdown["busy_delay"] == 0.0
        assert breakdown["peak_delay"] == 0.0
        assert breakdown["weather_delay"] == 0.0
        assert breakdown["weekend_delay"] == 0.0

    def test_all_delays_applied_on_worst_conditions(self) -> None:
        result = estimate_eta(self._make_request(
            traffic=TrafficLevel.high,
            busy_level=RestaurantBusyLevel.high,
            peak_hour=PeakHour.dinner,
            weather=WeatherCondition.heavy_rain,
            is_weekend=True,
        ))
        
        breakdown = result.eta_breakdown
        assert breakdown["traffic_delay"] > 0.0
        assert breakdown["busy_delay"] == 10.0
        assert breakdown["peak_delay"] == 12.0
        assert breakdown["weather_delay"] == 20.0
        assert breakdown["weekend_delay"] == 5.0
