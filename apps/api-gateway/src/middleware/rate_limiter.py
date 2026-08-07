import time
import os
from fastapi import Request, HTTPException, status
import redis.asyncio as aioredis

REDIS_URL = os.getenv("REDIS_URL", "redis://localhost:6379/0")
redis_client = aioredis.from_url(REDIS_URL, decode_responses=True)


async def check_rate_limit(request: Request, limit: int = 100, window_seconds: int = 60):
    """
    Sliding window log rate limiter implementation using Redis.
    """
    user_id = getattr(request.state, "user", None).user_id if hasattr(request.state, "user") and request.state.user else request.client.host
    key = f"rate_limit:{user_id}:{request.url.path}"
    now = time.time()
    clear_before = now - window_seconds

    try:
        pipe = redis_client.pipeline()
        pipe.zremrangebyscore(key, 0, clear_before)
        pipe.zadd(key, {str(now): now})
        pipe.zcard(key)
        pipe.expire(key, window_seconds)
        results = await pipe.execute()
        request_count = results[2]

        if request_count > limit:
            raise HTTPException(
                status_code=status.HTTP_429_TOO_MANY_REQUESTS,
                detail=f"Rate limit exceeded: Maximum {limit} requests per {window_seconds} seconds.",
            )
    except HTTPException:
        raise
    except Exception:
        pass  # Fail open if Redis is temporarily unreachable in dev environment
