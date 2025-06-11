import requests

BASE_URL = "http://127.0.0.1:8000"
TICKER = "AAPL"
STEPS = 10
FREQ = "day"
START = "2023-04-15T00:00:00"
END = "2025-04-28T00:00:00"

def check_forecast(endpoint):
    url = f"{BASE_URL}/forecast/{endpoint}/{TICKER}/{STEPS}"
    try:
        response = requests.get(url)
        response.raise_for_status()
        content = response.json()
        assert content.get("status") == "OK", f"Status not OK in {endpoint}"
        print(f"SUCCESS: /forecast/{endpoint} endpoint successful")
    except Exception as e:
        print(f"FAILED: /forecast/{endpoint} failed: {e}")

def check_price_detail(field):
    url = f"{BASE_URL}/detail/price_{field}/{TICKER}/{FREQ}/{START}/{END}"
    try:
        response = requests.get(url)
        response.raise_for_status()
        content = response.json()
        assert content.get("status") == "OK", f"Status not OK in {url}"
        print(f"SUCCESS: /detail/price_{field} endpoint successful")
    except Exception as e:
        print(f"FAILED: /detail/price_{field} failed: {e}")

# Run forecast tests
check_forecast("arima")
check_forecast("prophet")
check_forecast("ets")
check_forecast("mapa")
check_forecast("combination")

# Run detail tests
check_price_detail("close")
check_price_detail("open")
