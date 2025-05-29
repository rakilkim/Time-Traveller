from pydantic import BaseModel
from typing import List
from datetime import datetime

class PriceClose(BaseModel):
    status: str
    start_datetime: datetime
    end_datetime: datetime
    price_close: List[float]
    time_close: List[datetime]

class PriceOpen(BaseModel):
    status: str
    start_datetime: datetime
    end_datetime: datetime
    price_open: List[float]
    time_open: List[datetime]