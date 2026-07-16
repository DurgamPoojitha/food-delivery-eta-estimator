import json
import hashlib
from typing import Optional

from app.models.estimate import EstimateRequest, EstimateResponse
from app.utils.redis_client import get_redis
from app.core.logging_config import get_logger

logger = get_logger(__name__)

# Cache TTL is 10 minutes (600 seconds)
CACHE_TTL_SECONDS = 600

def _generate_cache_key(request: EstimateRequest) -> str:
    """
    Generates a deterministic, unique cache key based on the request parameters.
    We hash the parameters because coordinates can be long floats.
    """
    # Create a string representation of all parameters that affect the ETA
    key_string = (
        f"{request.restaurant_lat},{request.restaurant_lon}-"
        f"{request.delivery_lat},{request.delivery_lon}-"
        f"{request.prep_time}-"
        f"{request.traffic.value}-"
        f"{request.busy_level.value}-"
        f"{request.peak_hour.value}-"
        f"{request.is_weekend}"
    )
    
    # Use MD5 to create a short, consistent hash for the cache key
    key_hash = hashlib.md5(key_string.encode('utf-8')).hexdigest()
    return f"eta:{key_hash}"

def get_cached_eta(request: EstimateRequest) -> Optional[EstimateResponse]:
    """
    Checks Redis for a cached ETA response.
    
    Why caching improves scalability:
    By serving repeated requests from an in-memory cache (O(1) time complexity),
    we bypass the CPU-intensive mathematical calculations (Haversine formula) and 
    any future database calls, freeing up the application server to handle more concurrent users.
    """
    redis_client = get_redis()
    if not redis_client:
        return None

    cache_key = _generate_cache_key(request)
    
    try:
        cached_data = redis_client.get(cache_key)
        if cached_data:
            # Time complexity after caching: O(1) for retrieval + O(N) for JSON parsing.
            logger.info("Cache Hit | key=%s", cache_key)
            data_dict = json.loads(cached_data)
            return EstimateResponse(**data_dict)
            
        logger.info("Cache Miss | key=%s", cache_key)
        return None
        
    except Exception as e:
        # Graceful fallback: If Redis crashes or network drops, 
        # we log the error and return None, allowing normal computation to proceed.
        logger.error("Redis get error for key %s: %s", cache_key, str(e))
        return None

def set_cached_eta(request: EstimateRequest, response: EstimateResponse) -> None:
    """
    Stores the computed ETA response in Redis with a TTL.
    
    Why Redis is commonly used in production systems:
    Companies like Foodhub, Uber Eats, and Zomato use Redis because it stores data 
    entirely in RAM, offering sub-millisecond read/write latency. It is single-threaded
    but highly optimized, capable of handling hundreds of thousands of operations per second,
    making it ideal for ephemeral data like ETAs that decay rapidly in validity.
    """
    redis_client = get_redis()
    if not redis_client:
        return

    cache_key = _generate_cache_key(request)
    
    try:
        # Time complexity before caching: O(1) mathematical, but scales poorly 
        # when adding database lookups or external routing APIs.
        redis_client.setex(
            name=cache_key,
            time=CACHE_TTL_SECONDS,
            value=response.model_dump_json()
        )
    except Exception as e:
        logger.error("Redis set error for key %s: %s", cache_key, str(e))
