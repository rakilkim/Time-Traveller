from utils.sarima import arima_ols
from utils.prophet_module import prophet_model
from utils.ets import ets_model
from utils.mapa import mapa_model
import os
from polygon import RESTClient
from dotenv import load_dotenv
import json

load_dotenv()

async def combination_model(ticker: str, steps: int = 1) -> dict:
    try:
        client = RESTClient(api_key=os.getenv("API_KEY"))
        client.get_ticker_details(ticker)

        arima_ols_predictions = await arima_ols(ticker, steps)
        prophet_predictions = await prophet_model(ticker, steps)
        mapa_predictions = await mapa_model(ticker, steps)
        ets_predictions = await ets_model(ticker, steps)

        output = {
            "hour_time": ets_predictions["hour_time"],
            "day_time": ets_predictions["day_time"],
            "week_time": ets_predictions["week_time"],
            "month_time": ets_predictions["month_time"]
        }

        fields = [
            "hour_mean", "hour_lowerbound", "hour_upperbound",
            "day_mean", "day_lowerbound", "day_upperbound",
            "week_mean", "week_lowerbound", "week_upperbound",
            "month_mean", "month_lowerbound", "month_upperbound"
        ]

        models = [
            arima_ols_predictions,
            prophet_predictions,
            mapa_predictions,
            ets_predictions
        ]

        for field in fields:
            num_steps = len(models[0][field])

            combined_field = []
            for i in range(num_steps):
                total = 0
                for model in models:
                    total += model[field][i]
                average = total / len(models)
                combined_field.append(average)

            output[field] = combined_field
        output["status"] = "OK"
        return output
    
    except Exception as e:
        
        return json.loads(e.args[0])