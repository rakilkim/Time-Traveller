from fastapi import APIRouter
from utils.sarima import arima_ols
from utils.prophet_module import prophet_model
from utils.ets import ets_model
from utils.mapa import mapa_model
from utils.combination import combination_model
from models.forecast import Forecast
from models.error import ErrorResponse
from typing import Union

router = APIRouter()

@router.get("/arima/{ticker}/{steps}", response_model=Union[Forecast, ErrorResponse])
async def arima(ticker: str, steps: int):
    return arima_ols(ticker, steps)

@router.get("/prophet/{ticker}/{steps}", response_model=Union[Forecast, ErrorResponse])
async def prophet(ticker: str, steps: int):
    return prophet_model(ticker, steps)

@router.get("/ets/{ticker}/{steps}", response_model=Union[Forecast, ErrorResponse])
async def ets(ticker: str, steps: int):
    return ets_model(ticker, steps)

@router.get("/mapa/{ticker}/{steps}", response_model=Union[Forecast, ErrorResponse])
async def mapa(ticker: str, steps: int):
    return mapa_model(ticker, steps)

@router.get("/combination/{ticker}/{steps}", response_model=Union[Forecast, ErrorResponse])
async def combination(ticker: str, steps: int):
    return combination_model(ticker, steps)