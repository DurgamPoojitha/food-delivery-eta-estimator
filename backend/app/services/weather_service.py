import httpx
from app.core.config import get_settings
from app.core.logging_config import get_logger

logger = get_logger(__name__)

async def get_current_weather(lat: float, lon: float) -> tuple[str, float]:
    settings = get_settings()
    if not settings.weather_api_key:
        logger.warning("WEATHER_API_KEY is not set. Falling back to Sunny.")
        return "Sunny", 0.0

    url = f"https://api.openweathermap.org/data/2.5/weather?lat={lat}&lon={lon}&appid={settings.weather_api_key}"

    try:
        async with httpx.AsyncClient(timeout=2.0) as client:
            response = await client.get(url)
            response.raise_for_status()
            data = response.json()
            
            weather_main = data.get("weather", [{}])[0].get("main", "Clear")
            weather_id = data.get("weather", [{}])[0].get("id", 800)
            
            if weather_main == "Clear":
                return "Sunny", 0.0
            if weather_main == "Clouds":
                return "Cloudy", 3.0
            if weather_main in ("Rain", "Drizzle"):
                if 502 <= weather_id <= 504:
                    return "Heavy Rain", 20.0
                return "Rain", 8.0
            if weather_main == "Thunderstorm":
                return "Thunderstorm", 15.0
            if weather_main == "Snow":
                return "Snow", 25.0
            
            return "Sunny", 0.0
                
    except httpx.HTTPStatusError as e:
        logger.error("Weather API error: %s. Fallback to Sunny.", e.response.status_code)
        return "Sunny", 0.0
    except Exception as e:
        logger.error("Weather API connection failed: %s. Fallback to Sunny.", str(e))
        return "Sunny", 0.0
