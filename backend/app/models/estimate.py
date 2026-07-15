from enum import Enum
from typing import Dict

from pydantic import BaseModel, ConfigDict, Field

class TrafficLevel(str, Enum):
    low    = "low"
    medium = "medium"
    high   = "high"

class RestaurantBusyLevel(str, Enum):
    low    = "low"
    medium = "medium"
    high   = "high"

class PeakHour(str, Enum):
    none   = "none"
    lunch  = "lunch"
    dinner = "dinner"

class WeatherCondition(str, Enum):
    sunny      = "sunny"
    rain       = "rain"
    heavy_rain = "heavy_rain"

class EstimateRequest(BaseModel):
    

    model_config = ConfigDict(
        json_schema_extra={
            "example": {
                "restaurant_name": "Burger Palace",
                "restaurant_lat":   51.5074,
                "restaurant_lon":  -0.1278,
                "delivery_lat":    51.5155,
                "delivery_lon":   -0.0922,
                "prep_time":       15,
                "traffic":         "medium",
                "busy_level":      "high",
                "peak_hour":       "dinner",
                "weather":         "rain",
                "is_weekend":      True,
            }
        }
    )

    restaurant_name: str = Field(..., min_length=1, max_length=100)
    restaurant_lat: float = Field(..., ge=-90.0, le=90.0)
    restaurant_lon: float = Field(..., ge=-180.0, le=180.0)
    delivery_lat: float = Field(..., ge=-90.0, le=90.0)
    delivery_lon: float = Field(..., ge=-180.0, le=180.0)
    prep_time: int = Field(..., ge=0, le=180, description="Base prep time in minutes.")
    
    traffic: TrafficLevel = Field(..., description="Traffic modifier (1x, 1.4x, 2x travel time).")
    busy_level: RestaurantBusyLevel = Field(..., description="Kitchen backup delay.")
    peak_hour: PeakHour = Field(..., description="System-wide dispatch delay.")
    weather: WeatherCondition = Field(..., description="Weather-related slow down.")
    is_weekend: bool = Field(..., description="Weekend surge delay flag.")

class EstimateResponse(BaseModel):
    

    model_config = ConfigDict(
        json_schema_extra={
            "example": {
                "restaurant_name":     "Burger Palace",
                "distance_km":         2.62,
                "total_eta":           55.8,
                "delivery_status":     "Delayed",
                "eta_breakdown": {
                    "base_travel_time": 3.9,
                    "traffic_delay":    1.6,
                    "base_prep_time":   15.0,
                    "busy_delay":       10.0,
                    "peak_delay":       12.0,
                    "weather_delay":    10.0,
                    "weekend_delay":    5.0,
                }
            }
        }
    )

    restaurant_name: str
    distance_km: float
    total_eta: float
    delivery_status: str
    eta_breakdown: Dict[str, float] = Field(
        description="Itemised breakdown of how the total ETA was calculated in minutes."
    )

class ErrorDetail(BaseModel):
    field:   str
    message: str
    type:    str

class ErrorBody(BaseModel):
    code:    str
    message: str
    details: list[ErrorDetail] | None = None

class ErrorResponse(BaseModel):
    error: ErrorBody
