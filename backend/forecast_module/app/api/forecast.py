from fastapi import APIRouter
from utils.sarima import arima_ols
from utils.prophet_module import prophet_model
from utils.ets import ets_model
from utils.mapa import mapa_model
from utils.combination import combination_model
from models.forecast import Forecast
from models.error import ErrorResponse
from typing import Union
from api.redis import set_forecast, get_forecast
import json

router = APIRouter()

@router.get("/arima/{ticker}/{steps}", response_model=Union[Forecast, ErrorResponse])
async def arima(ticker: str, steps: int):

    cache_value = await get_forecast("ARIMA", ticker, steps)

    # If not in cache or error response found
    if cache_value is None or cache_value.get("status") != "OK":
        value = await arima_ols(ticker, steps)
        if (value.get("status") == "OK"):
            await set_forecast("ARIMA", ticker, value, steps)
        return value

    return cache_value

@router.get("/prophet/{ticker}/{steps}", response_model=Union[Forecast, ErrorResponse])
async def prophet(ticker: str, steps: int):

    cache_value = await get_forecast("PROPHET", ticker, steps)

    # If not in cache or error response found
    if cache_value is None or cache_value.get("status") != "OK":
        value = await prophet_model(ticker, steps)
        if (value.get("status") == "OK"):
            await set_forecast("PROPHET", ticker, value, steps)
        return value

    return cache_value

@router.get("/ets/{ticker}/{steps}", response_model=Union[Forecast, ErrorResponse])
async def ets(ticker: str, steps: int):

    cache_value = await get_forecast("ETS", ticker, steps)

    # If not in cache or error response found
    if cache_value is None or cache_value.get("status") != "OK":
        value = await ets_model(ticker, steps)
        if (value.get("status") == "OK"):
            await set_forecast("ETS", ticker, value, steps)
        return value

    return cache_value

@router.get("/mapa/{ticker}/{steps}", response_model=Union[Forecast, ErrorResponse])
async def mapa(ticker: str, steps: int):

    cache_value = await get_forecast("MAPA", ticker, steps)

    # If not in cache or error response found
    if cache_value is None or cache_value.get("status") != "OK":
        value = await mapa_model(ticker, steps)
        if (value.get("status") == "OK"):
            await set_forecast("MAPA", ticker, value, steps)
        return value

    return cache_value

@router.get("/combination/{ticker}/{steps}", response_model=Union[Forecast, ErrorResponse])
async def combination(ticker: str, steps: int):

    cache_value = await get_forecast("COMBINATION", ticker, steps)

    # If not in cache or error response found
    if cache_value is None or cache_value.get("status") != "OK":
        value = await combination_model(ticker, steps)
        if (value.get("status") == "OK"):
            await set_forecast("COMBINATION", ticker, value, steps)
        return value

    return cache_value