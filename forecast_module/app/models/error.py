from pydantic import BaseModel
from typing import List
from datetime import datetime

class ErrorResponse(BaseModel):
    status: str
    request_id: str
    message: str