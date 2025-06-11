from polygon import RESTClient
import numpy as np
import os
from dotenv import load_dotenv
import pandas as pd
from datetime import datetime
from dateutil.relativedelta import relativedelta
from uuid import uuid4
import json

load_dotenv()


async def price_open(ticker: str, frequency: str, start_datetime: datetime, end_datetime: datetime) -> dict:

    """
    :type ticker: string
    :type n_steps: int 
    :rtype: 
    """

    try:
        client = RESTClient(api_key=os.getenv("API_KEY"))
        client.get_ticker_details(ticker)

        temp_start_datetime = int(start_datetime.timestamp())
        temp_end_datetime = int(end_datetime.timestamp())

        price_open = []
        time_open = []

        for a in client.list_aggs(ticker=ticker, multiplier=1, timespan=frequency, from_ = temp_start_datetime, to= temp_end_datetime):
            price_open.append(a.open)
            time_open.append(a.timestamp)
        
        
        time_open = pd.to_datetime(time_open, unit="ms").tolist()
        time_open = [ts.isoformat() for ts in time_open]

        return {
            "status": "OK",
            "start_datetime": start_datetime.isoformat(),
            "end_datetime": end_datetime.isoformat(),
            "price_open": price_open,
            "time_open": time_open
           
        }
    
    except Exception as e:
        
        return json.loads(e.args[0])
    