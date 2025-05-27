from pydantic import BaseModel
from typing import List
from datetime import datetime

class PriceClose(BaseModel):
    price_close: List[float]
    time_close: List[datetime]

class PriceOpen(BaseModel):
    price_open: List[float]
    time_open: List[datetime]