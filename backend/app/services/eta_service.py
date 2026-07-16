import logging

from app.core.logging_config import get_logger
from app.models.estimate import (
    EstimateRequest,
    EstimateResponse,
    PeakHour,
    RestaurantBusyLevel,
    TrafficLevel,
)
from app.utils.haversine import haversine
from app.services.cache_service import get_cached_eta, set_cached_eta
from app.services.weather_service import get_current_weather

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

WEEKEND_SURGE_DELAY = 5.0

def _get_delivery_status(total_eta_minutes: float) -> str:
    if total_eta_minutes < 20.0:
        return "Fast Delivery"
    elif total_eta_minutes <= 40.0:
        return "Moderate"
    else:
        return "Delayed"

async def estimate_eta(request: EstimateRequest) -> EstimateResponse:
    logger.info("ETA estimation started | restaurant=%r", request.restaurant_name)

    # 1. Check Redis Cache First
    cached_response = get_cached_eta(request)
    if cached_response:
        return cached_response

    # 2. Proceed with heavy calculations if cache miss
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
    
    weather_condition, weather_delay = await get_current_weather(request.restaurant_lat, request.restaurant_lon)
    
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

    response = EstimateResponse(
        restaurant_name=request.restaurant_name,
        distance_km=round(distance_km, 2),
        total_eta=round(total_eta, 2),
        delivery_status=delivery_status,
        weather=weather_condition,
        weather_delay=weather_delay,
        eta_breakdown=eta_breakdown,
    )

    # 3. Store result in Redis asynchronously-like (fire and forget handled in service)
    set_cached_eta(request, response)

    return response
