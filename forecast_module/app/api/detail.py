from fastapi import APIRouter
from models.detail import PriceClose, PriceOpen
from models.error import ErrorResponse
from typing import Union
from utils.price_close import price_close
from utils.price_open import price_open
from datetime import datetime
from enum import Enum
from api.redis import set_detail, get_detail
import json

class Frequency(str, Enum):
    HOUR = "hour"
    DAY = "day"
    WEEK = "week"
    MONTH = "month"

router = APIRouter()


@router.get("/price_close/{ticker}/{frequency}/{start_datetime}/{end_datetime}", response_model=Union[PriceClose, ErrorResponse])
async def close(ticker: str, frequency: Frequency, start_datetime: datetime, end_datetime: datetime):

    cache_value = await get_detail("CLOSE", frequency.value, start_datetime, end_datetime, ticker)

    # If not in cache or error response found
    if cache_value is None or cache_value.get("status") != "OK":
        value = await price_close(ticker, frequency.value, start_datetime, end_datetime)
        if (value.get("status") == "OK"):
            await set_detail("CLOSE", frequency.value, ticker, value)
        return value
    

    #Binary Search to find start index in which to slice
    datetime_objects = cache_value["time_close"]
    datetime_objects = [datetime.fromisoformat(t) for t in datetime_objects]

    # Find start index
    low, high = 0, len(datetime_objects)
    while low < high:
        mid = (low + high) // 2
        if datetime_objects[mid] < start_datetime:
            low = mid + 1
        else:
            high = mid
    slice_start = low

    # Find end index
    low, high = 0, len(datetime_objects)
    while low < high:
        mid = (low + high) // 2
        if datetime_objects[mid] <= end_datetime:
            low = mid + 1
        else:
            high = mid
    slice_end = low

    cache_value["time_close"] = cache_value["time_close"][slice_start:slice_end]
    cache_value["price_close"] = cache_value["price_close"][slice_start:slice_end]
            
    return cache_value

@router.get("/price_open/{ticker}/{frequency}/{start_datetime}/{end_datetime}", response_model=Union[PriceOpen, ErrorResponse])
async def open(ticker: str, frequency: Frequency, start_datetime: datetime, end_datetime: datetime):
    
    
    cache_value = await get_detail("OPEN", frequency.value, start_datetime, end_datetime, ticker)

    # If not in cache or error response found
    if cache_value is None or cache_value.get("status") != "OK":
        value = await price_open(ticker, frequency.value, start_datetime, end_datetime)
        if (value.get("status") == "OK"):
            await set_detail("OPEN", frequency.value, ticker, value)
        return value

    #Binary Search to find start index in which to slice
    datetime_objects = cache_value["time_open"]
    datetime_objects = [datetime.fromisoformat(t) for t in datetime_objects]

    # Find start index
    low, high = 0, len(datetime_objects)
    while low < high:
        mid = (low + high) // 2
        if datetime_objects[mid] < start_datetime:
            low = mid + 1
        else:
            high = mid
    slice_start = low

    # Find end index
    low, high = 0, len(datetime_objects)
    while low < high:
        mid = (low + high) // 2
        if datetime_objects[mid] <= end_datetime:
            low = mid + 1
        else:
            high = mid
    slice_end = low

    cache_value["time_open"] = cache_value["time_open"][slice_start:slice_end]
    cache_value["price_open"] = cache_value["price_open"][slice_start:slice_end]

    return cache_value