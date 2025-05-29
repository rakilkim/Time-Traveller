from polygon import RESTClient
import numpy as np
import os
from dotenv import load_dotenv
from statsmodels.tsa.holtwinters import ExponentialSmoothing
import pandas as pd
from datetime import datetime
from dateutil.relativedelta import relativedelta
from uuid import uuid4
import json

load_dotenv()

def mapa(series: pd.Series, h: int, max_agg: int = 5):
    forecasts = []
    lower_bound = []
    upper_bound = []

    for agg in range(1, max_agg + 1):
        agg_series = series.groupby(np.arange(len(series)) // agg).mean()
        freq = pd.infer_freq(series.index) or "D"
        agg_series.index = pd.date_range(start=series.index[0], periods=len(agg_series), freq=f"{agg}{freq}")

        model = ExponentialSmoothing(agg_series, trend="add", seasonal=None)
        fit = model.fit()
        agg_forecast = fit.forecast(steps=int(np.ceil(h / agg)))
        resid_std = fit.resid.std()
        z = 1.96

        agg_forecast_lower = agg_forecast - z * resid_std
        agg_forecast_upper = agg_forecast + z * resid_std

        disagg = np.repeat(agg_forecast.values, agg)[:h]
        disagg_lower = np.repeat(agg_forecast_lower.values, agg)[:h]
        disagg_upper = np.repeat(agg_forecast_upper.values, agg)[:h]

        forecasts.append(disagg)
        lower_bound.append(disagg_lower)
        upper_bound.append(disagg_upper)

    combined_forecast = np.mean(forecasts, axis=0)
    lower_bound_forecast = np.mean(lower_bound, axis=0)
    upper_bound_forecast = np.mean(upper_bound, axis=0)

    return {
        "mean": combined_forecast,
        "lower": lower_bound_forecast,
        "upper": upper_bound_forecast
    }


async def mapa_model(ticker: str, n_steps: int = 1) -> dict:

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

        series = [('hour', 3600000, 24, time_hour, price_hour), ('day',  86400000, 7, time_day, price_day), ('week', 604800000, 7, time_week, price_week), ('month', 2674800000, 12, time_month, price_month)]

        output = {}
        
        for frequency, step_size, seasonality, time, price in series:
            series_ts = pd.Series(data=price, index=pd.to_datetime(time, unit="ms"))
            forecast_object = mapa(series_ts, h=n_steps)

            future_times = [time[-1] + step_size * (i + 1) for i in range(n_steps)]


            #=========== STORE INFORMATION IN DICTIONARY ===========#
            output["status"] = "OK"
            output[f"{frequency}_mean"] = forecast_object["mean"].tolist()
            output[f"{frequency}_lowerbound"] = forecast_object["lower"].tolist()
            output[f"{frequency}_upperbound"] = forecast_object["upper"].tolist()
            output[f"{frequency}_time"] = pd.to_datetime(future_times, unit="ms").tolist()
            output[f"{frequency}_time"] = [ts.isoformat() for ts in output[f"{frequency}_time"]]
            
        return output
    
    except Exception as e:
        
        return json.loads(e.args[0])