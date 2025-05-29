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


async def price_close(ticker: str, frequency: str, start_datetime: datetime, end_datetime: datetime) -> dict:

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

        price_close = []
        time_close = []

        for a in client.list_aggs(ticker=ticker, multiplier=1, timespan=frequency, from_ = temp_start_datetime, to= temp_end_datetime):
            price_close.append(a.close)
            time_close.append(a.timestamp)

        time_close = pd.to_datetime(time_close, unit="ms").tolist()
        time_close = [ts.isoformat() for ts in time_close]

        return {
            "status": "OK",
            "start_datetime": start_datetime.isoformat(),
            "end_datetime": end_datetime.isoformat(),
            "price_close": price_close,
            "time_close": time_close
        }
    
    except Exception as e:
        return json.loads(e.args[0])


# if __name__ == "__main__":
#     async def main():
#         result = await price_close(
#             "AAPL",
#             "hour",
#             "2023-01-01T09:30:00",
#             "2023-01-02T16:00:00"
#         )
#         print(result)
        #print(json.dumps(result, indent=2))
