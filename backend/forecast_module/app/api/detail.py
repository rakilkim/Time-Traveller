from fastapi import APIRouter
from models.detail import PriceClose, PriceOpen
from models.error import ErrorResponse
from typing import Union
from utils.price_close import price_close
from utils.price_open import price_open
from datetime import date
from enum import Enum

class Frequency(str, Enum):
    HOUR = "hour"
    DAY = "day"
    WEEK = "week"
    MONTH = "month"

router = APIRouter()

@router.get("/price_close/{ticker}/{frequency}/{start_date}", response_model=Union[PriceClose, ErrorResponse])
async def close(ticker: str, frequency: Frequency, start_date: date):
    return price_close(ticker, frequency.value, start_date)

@router.get("/price_open/{ticker}/{frequency}/{start_date}", response_model=Union[PriceOpen, ErrorResponse])
async def open(ticker: str, frequency: Frequency, start_date: date):
    return price_open(ticker, frequency.value, start_date)