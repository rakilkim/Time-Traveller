from polygon import RESTClient
import numpy as np
import os
from dotenv import load_dotenv
from prophet import Prophet
import pandas as pd
from datetime import datetime
from dateutil.relativedelta import relativedelta
from uuid import uuid4
import json

load_dotenv()

async def prophet_model(ticker, n_steps=1):

    """
    :type ticker: string
    :type n_steps: int 
    :rtype: 
    """

    try:
        client = RESTClient(api_key=os.getenv("API_KEY"))
        client.get_ticker_details(ticker)

        end = datetime.now()

        start_hour = end - relativedelta(days=7)
        price_hour = []
        time_hour = []

        start_day = end - relativedelta(months=4)
        price_day = []
        time_day = []

        start_week = end - relativedelta(years=5)
        price_week = []
        time_week = []

        start_month = end - relativedelta(years=10)
        price_month = []
        time_month = []

        for a in client.list_aggs(ticker=ticker, multiplier=1, timespan="hour", from_ = start_hour, to= end):
            price_hour.append(a.close)
            time_hour.append(a.timestamp)
        
        for a in client.list_aggs(ticker=ticker, multiplier=1, timespan="day", from_ = start_day, to= end):
            price_day.append(a.close)
            time_day.append(a.timestamp)
        
        for a in client.list_aggs(ticker=ticker, multiplier=1, timespan="week", from_ = start_week, to= end):
            price_week.append(a.close)
            time_week.append(a.timestamp)
        
        for a in client.list_aggs(ticker=ticker, multiplier=1, timespan="month", from_ = start_month, to= end):
            price_month.append(a.close)
            time_month.append(a.timestamp)

        #Note to self: 
        #step_size for hour (weekday to weekday): 3600000
        #step_size for day (weekday to weekday): 86400000
        #step_size for Friday to Monday: 259200000
        #step_size for week: 604800000
        #step_size for month: 2674800000
        #Series object contains (type, step_size, seasonality, time list, price list)

        series = [('hour', 'H', 24, time_hour, price_hour), ('day', 'D', 7, time_day, price_day), ('week', 'W', 7, time_week, price_week), ('month', 'M', 12, time_month, price_month)]

        output = {}
        
        for frequency, step_size, seasonality, time, price in series:
            df = pd.DataFrame({
                "ds": pd.to_datetime(time, unit='ms'),
                "y": price
            })

            model = Prophet()
            model.fit(df)
            future = model.make_future_dataframe(periods=n_steps, freq=step_size)
            forecast = model.predict(future)

            #=========== STORE INFORMATION IN DICTIONARY ===========#
            output["status"] = "OK"
            output[f"{frequency}_mean"] = forecast["yhat"].tolist()[-1*n_steps:]
            output[f"{frequency}_lowerbound"] = forecast["yhat_lower"].tolist()[-1*n_steps:]
            output[f"{frequency}_upperbound"] = forecast["yhat_upper"].tolist()[-1*n_steps:]
            output[f"{frequency}_time"] = forecast["ds"].tolist()[-1*n_steps:]
            output[f"{frequency}_time"] = [ts.isoformat() for ts in output[f"{frequency}_time"]]
        return output
    
    except Exception as e:
        
        return json.loads(e.args[0])
