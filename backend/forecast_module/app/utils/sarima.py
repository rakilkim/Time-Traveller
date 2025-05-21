from polygon import RESTClient
import numpy as np
import os
from dotenv import load_dotenv
import pandas as pd
from statsmodels.tsa.statespace.sarimax import SARIMAX
from scipy.stats import linregress
from datetime import datetime
from dateutil.relativedelta import relativedelta
from uuid import uuid4
import json

load_dotenv()

def arima_ols(ticker, n_steps=1):

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
            #=========== STEP 1 - DETREND USING OLS ===========#
            #Detrend using Linear Regression
            slope, intercept, r_value, p_value, std_err = linregress(time, price)
            time_array = np.array(time)
            y_pred = intercept + slope * time_array
            detrended = price - y_pred
            future_times = [time[-1] + step_size * (i+1) for i in range(n_steps)]
            trend_forecast = intercept + slope * np.array(future_times)

            #=========== STEP 2 - CAPTURE SEASONALITY COMPONENT ===========#
            index = np.arange(len(detrended))
            season_pos = index % seasonality
            seasonality_component = pd.Series(detrended).groupby(season_pos).transform('mean')
            seasonality_centered = seasonality_component - np.mean(seasonality_component)
            season_cycle = seasonality_centered[-1 * seasonality:] 
            seasonal_forecast = np.tile(season_cycle.values, int(np.ceil(n_steps / seasonality)))[:n_steps]
            #plt.plot(time, seasonality_centered, color='green', label = 'Seasonality')

            #=========== STEP 3 - MODEL RESIDUALS USING SARIMA ===========#
            residual = detrended - seasonality_centered
            model = SARIMAX(residual, order=(1, 0, 1))
            fitted_values = model.fit()
            pred = fitted_values.get_forecast(steps=n_steps)
            resid_forecast = pred.predicted_mean
            conf_int = pred.conf_int(alpha=0.05)
            full_forecast = trend_forecast + seasonal_forecast + resid_forecast
            lower_bound = trend_forecast + seasonal_forecast + conf_int.iloc[:, 0]
            upper_bound = trend_forecast + seasonal_forecast + conf_int.iloc[:, 1]

            #=========== STEP 4 - STORE INFORMATION IN DICTIONARY ===========#
            output[f"{frequency}_mean"] = full_forecast.tolist()
            output[f"{frequency}_lowerbound"] = lower_bound.tolist()
            output[f"{frequency}_upperbound"] = upper_bound.tolist()
            output[f"{frequency}_time"] = pd.to_datetime(future_times, unit='ms')
        return output
    
    except Exception as e:
        
        return json.loads(e.args[0])
