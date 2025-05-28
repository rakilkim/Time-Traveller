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


async def price_open(ticker, frequency, start_date):

    """
    :type ticker: string
    :type n_steps: int 
    :rtype: 
    """

    try:
        client = RESTClient(api_key=os.getenv("API_KEY"))
        client.get_ticker_details(ticker)

        end = datetime.now()

        price_open = []
        time_open = []

        for a in client.list_aggs(ticker=ticker, multiplier=1, timespan=frequency, from_ = start_date, to= end):
            price_open.append(a.open)
            time_open.append(a.timestamp)
        
        
        time_open = pd.to_datetime(time_open, unit="ms").tolist()
        time_open = [ts.isoformat() for ts in time_open]

        return {
            "status": "OK",
            "price_open": price_open,
            "time_open": time_open
        }
    
    except Exception as e:
        
        return json.loads(e.args[0])
    