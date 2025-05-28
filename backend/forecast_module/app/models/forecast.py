from pydantic import BaseModel
from typing import List
from datetime import datetime

class Forecast(BaseModel):

    status: str
    hour_mean: List[float]
    hour_lowerbound: List[float]
    hour_upperbound: List[float]
    hour_time: List[datetime]

    day_mean: List[float]
    day_lowerbound: List[float]
    day_upperbound: List[float]
    day_time: List[datetime]

    week_mean: List[float]
    week_lowerbound: List[float]
    week_upperbound: List[float]
    week_time: List[datetime]

    month_mean: List[float]
    month_lowerbound: List[float]
    month_upperbound: List[float]
    month_time: List[datetime]