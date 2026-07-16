import redis

from app.core.config import get_settings
from app.core.logging_config import get_logger

logger = get_logger(__name__)

# Initialize the global Redis connection pool.
# Connection is lazy; it only connects when the first command is executed.
try:
    redis_client = redis.Redis.from_url(
        get_settings().redis_url,
        decode_responses=True,
        socket_timeout=2.0,       # Fail fast if Redis is slow
        socket_connect_timeout=2.0
    )
except Exception as e:
    logger.error("Failed to initialize Redis client: %s", str(e))
    redis_client = None

def get_redis() -> redis.Redis | None:
    """
    Returns the Redis client instance.
    If Redis is unavailable, returns None, allowing the app to gracefully fallback.
    """
    return redis_client
