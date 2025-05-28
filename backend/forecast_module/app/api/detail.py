from fastapi import APIRouter
from models.detail import PriceClose, PriceOpen
from models.error import ErrorResponse
from typing import Union
from utils.price_close import price_close
from utils.price_open import price_open
from datetime import date
from enum import Enum
from api.redis import set_detail, get_detail
import json

class Frequency(str, Enum):
    HOUR = "hour"
    DAY = "day"
    WEEK = "week"
    MONTH = "month"

router = APIRouter()


#TODO: Add end date for close
#TODO: Change the closing and open date to include time as well
#TODO: Implement proper subset/superset caching to the dates
#TODO: Update ReadME.md

@router.get("/price_close/{ticker}/{frequency}/{start_date}", response_model=Union[PriceClose, ErrorResponse])
async def close(ticker: str, frequency: Frequency, start_date: date):

    
    cache_value = await get_detail("CLOSE", frequency.value, start_date, ticker)

    # If not in cache or error response found
    if cache_value is None or cache_value.get("status") != "OK":
        value = await price_close(ticker, frequency.value, start_date)
        if (value.get("status") == "OK"):
            await set_detail("CLOSE", frequency.value, start_date, ticker, value)
        return value

    return cache_value

@router.get("/price_open/{ticker}/{frequency}/{start_date}", response_model=Union[PriceOpen, ErrorResponse])
async def open(ticker: str, frequency: Frequency, start_date: date):

    cache_value = await get_detail("OPEN", frequency.value, start_date, ticker)

    # If not in cache or error response found
    if cache_value is None or cache_value.get("status") != "OK":
        value = await price_open(ticker, frequency.value, start_date)
        if (value.get("status") == "OK"):
            await set_detail("OPEN", frequency.value, start_date, ticker, value)
        return value

    return cache_value