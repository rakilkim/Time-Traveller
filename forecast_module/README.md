# Forecasting API

## Envrionment Setup
In order to recreate the environment, first create your own python virtual envrionment. Within this virtual environment, run the following command in the module's root directory:

```
pip install -r requirements.txt
```

This will install all of the necessary packages and requirements for the API server.

Also, you must download the .env file associated with the forecast module using the link in the Final Project report. Place the .env file within the "forecast_module" directory.

## Running the Server
Once installed, run the following in order to run the instance:

```
python main.py
```

## Accessing the API

### Price Endpoints
To read price_open data, use the following endpoint. Note that the start_date must be in ISO 8601 format (YYYY-MM-DDTHH:MM:SS) and the frequency can only be within the set of {hour, day, week, month}.

**Get Open Prices**
```
/detail/price_open/{ticker}/{frequency}/{start_datetime}/{end_datetime}
```

**Get Close Prices**
Likewise, to read price_close data, use the following endpoint.

```
/detail/price_close/{ticker}/{frequency}/{start_datetime}/{end_datetime}
```

Parameters:

- `ticker:` stock ticker symbol (e.g., `AAPL`)

- `frequency:` one of `hour`, `day`, `week`, or `month`

- `start_datetime:` date in `YYYY-MM-DDTHH:MM:SS` format (e.g. `2023-01-01T08:30:00`)

- `end_datetime:` date in `YYYY-MM-DDTHH:MM:SS` format (e.g. `2023-01-11T18:00:00`)

### Forecast Endpoints

You are able to access the various forecast endpoints as follows:


**ARIMA-OLS Forecast**
```
/forecast/arima/{ticker}/{steps}
```

**ETS (Exponential Smoothing) Forecast**
```
/forecast/ets/{ticker}/{steps}
```

**Prophet Forecast**
```
/forecast/prophet/{ticker}/{steps}
```

**MAPA Forecast**
```
/forecast/mapa/{ticker}/{steps}
```

**Combination Forecast**
```
/forecast/combination/{ticker}/{steps}
```

Parameters:

- `ticker:` stock ticker symbol (e.g., `AAPL`)

- `steps:` number of future time steps to forecast

## Manual Tests

In order to run the manual tests to check if the endpoints are working properly, run the following:

```
python tests/tests.py
```