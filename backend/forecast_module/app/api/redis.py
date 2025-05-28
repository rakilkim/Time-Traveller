from fastapi import APIRouter
import redis.asyncio as redis
import asyncio, json

# Redis client
r = redis.Redis(host="localhost", port=6379, db=0, decode_responses=True)

# Cache format for forecast: forecast:{type}:{ticker}:{steps} => JSON string

async def set_forecast(model_type: str, ticker: str, value: dict, steps: int) -> None:
    """Store forecast in cache as JSON string with 1-hour TTL."""
    key = f"forecast:{model_type}:{ticker}:{steps}"
    print(f"Writing {key} to cache")
    try:
        json_value = json.dumps(value)
        await r.set(key, json_value, ex=3600)
    except Exception as e:
        print(f"Failed to set cache: {e}")
        raise

async def get_forecast(model_type: str, ticker: str, steps: int) -> dict | None:
    """Retrieve forecast from cache and return parsed JSON (or None)."""
    key = f"forecast:{model_type}:{ticker}:{steps}"
    print(f"Attempting to fetch {key} from cache")
    try:
        value = await r.get(key)
        if value:
            print(f"{key} found in cache.")
            return json.loads(value)
    except Exception as e:
        print(f"Failed to get cache: {e}")
        raise
    return None

# Cache format for detail: detail:{type}:{frequency}:{start_date}:{ticker} => JSON string

async def set_detail(type: str, frequency: str,  start_date: str, ticker: str, value: dict) -> None:
    """Store detail in cache as JSON string with 1-hour TTL."""
    key = f"detail:{type}:{frequency}:{start_date}:{ticker}"
    print(f"Writing {key} to cache")
    try:
        json_value = json.dumps(value)
        await r.set(key, json_value, ex=3600)
    except Exception as e:
        print(f"Failed to set cache: {e}")
        raise



async def get_detail(type: str, frequency: str, start_date: str, ticker: str) -> dict | None:
    """Retrieve detail from cache and return parsed JSON (or None)."""
    key = f"detail:{type}:{frequency}:{start_date}:{ticker}"
    print(f"Attempting to fetch {key} from cache")
    try:
        value = await r.get(key)
        if value:
            print(f"{key} found in cache.")
            return json.loads(value)
    except Exception as e:
        print(f"Failed to get cache: {e}")
        raise
    return None

