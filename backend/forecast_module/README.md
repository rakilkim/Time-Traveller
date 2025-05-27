# Forecasting API

## Envrionment Setup
In order to recreate the environment, first create your own python virtual envrionment. Within this virtual environment, run the following command in the module's root directory:

```
pip install -r requirements.txt
```

This will install all of the necessary packages and requirements for the API server.

## Running the Server
Once installed, run the following in order to run the instance:

```
python main.py
```

## Accessing the API

### Price Endpoints
To read price_open data, use the following endpoint. Note that the start_date must be in YYYY-MM-DD format and the frequency can only be within the set of {hour, day, week, month}.

**Get Open Prices**
```
/detail/price_open/{ticker}/{frequency}/{start_date}
```

**Get Close Prices**
Likewise, to read price_close data, use the following endpoint.

```
/detail/price_close/{ticker}/{frequency}/{start_date}
```

Parameters:

- `ticker:` stock ticker symbol (e.g., `AAPL`)

- `frequency:` one of `hour`, `day`, `week`, or `month`

- `start_date:` date in `YYYY-MM-DD` format

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