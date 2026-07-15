import logging

from app.core.logging_config import get_logger
from app.models.estimate import (
    EstimateRequest,
    EstimateResponse,
    PeakHour,
    RestaurantBusyLevel,
    TrafficLevel,
    WeatherCondition,
)
from app.utils.haversine import haversine

logger = get_logger(__name__)

BASE_SPEED_KMH = 40.0

TRAFFIC_MULTIPLIERS = {
    TrafficLevel.low:    1.0,
    TrafficLevel.medium: 1.4,
    TrafficLevel.high:   2.0,
}

BUSY_DELAYS = {
    RestaurantBusyLevel.low:    0.0,
    RestaurantBusyLevel.medium: 5.0,
    RestaurantBusyLevel.high:   10.0,
}

PEAK_DELAYS = {
    PeakHour.none:   0.0,
    PeakHour.lunch:  8.0,
    PeakHour.dinner: 12.0,
}

WEATHER_DELAYS = {
    WeatherCondition.sunny:      0.0,
    WeatherCondition.rain:       10.0,
    WeatherCondition.heavy_rain: 20.0,
}

WEEKEND_SURGE_DELAY = 5.0

def _get_delivery_status(total_eta_minutes: float) -> str:
    if total_eta_minutes < 20.0:
        return "Fast Delivery"
    elif total_eta_minutes <= 40.0:
        return "Moderate"
    else:
        return "Delayed"

def estimate_eta(request: EstimateRequest) -> EstimateResponse:
    logger.info("ETA estimation started | restaurant=%r", request.restaurant_name)

    distance_km = haversine(
        lat1=request.restaurant_lat,
        lon1=request.restaurant_lon,
        lat2=request.delivery_lat,
        lon2=request.delivery_lon,
    )
    base_travel_time = (distance_km / BASE_SPEED_KMH) * 60

    multiplier = TRAFFIC_MULTIPLIERS[request.traffic]
    actual_travel_time = base_travel_time * multiplier
    traffic_delay = actual_travel_time - base_travel_time

    busy_delay    = BUSY_DELAYS[request.busy_level]
    peak_delay    = PEAK_DELAYS[request.peak_hour]
    weather_delay = WEATHER_DELAYS[request.weather]
    weekend_delay = WEEKEND_SURGE_DELAY if request.is_weekend else 0.0

    total_eta = (
        base_travel_time
        + traffic_delay
        + request.prep_time
        + busy_delay
        + peak_delay
        + weather_delay
        + weekend_delay
    )

    delivery_status = _get_delivery_status(total_eta)

    eta_breakdown = {
        "base_travel_time": round(base_travel_time, 2),
        "traffic_delay":    round(traffic_delay, 2),
        "base_prep_time":   float(request.prep_time),
        "busy_delay":       busy_delay,
        "peak_delay":       peak_delay,
        "weather_delay":    weather_delay,
        "weekend_delay":    weekend_delay,
    }

    logger.info("ETA complete | total_eta=%.2f | status=%r", total_eta, delivery_status)

    return EstimateResponse(
        restaurant_name=request.restaurant_name,
        distance_km=round(distance_km, 2),
        total_eta=round(total_eta, 2),
        delivery_status=delivery_status,
        eta_breakdown=eta_breakdown,
    )
