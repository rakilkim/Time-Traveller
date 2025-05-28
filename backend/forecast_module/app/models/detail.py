from pydantic import BaseModel
from typing import List
from datetime import datetime

class PriceClose(BaseModel):
    status: str
    price_close: List[float]
    time_close: List[datetime]

class PriceOpen(BaseModel):
    status: str
    price_open: List[float]
    time_open: List[datetime]