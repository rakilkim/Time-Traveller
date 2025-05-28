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


async def price_close(ticker, frequency, start_date):

    """
    :type ticker: string
    :type n_steps: int 
    :rtype: 
    """

    try:
        client = RESTClient(api_key=os.getenv("API_KEY"))
        client.get_ticker_details(ticker)

        end = datetime.now()

        price_close = []
        time_close = []

        for a in client.list_aggs(ticker=ticker, multiplier=1, timespan=frequency, from_ = start_date, to= end):
            price_close.append(a.close)
            time_close.append(a.timestamp)

        time_close = pd.to_datetime(time_close, unit="ms").tolist()
        time_close = [ts.isoformat() for ts in time_close]

        return {
            "status": "OK",
            "price_close": price_close,
            "time_close": time_close
        }
    
    except Exception as e:
        return json.loads(e.args[0])
