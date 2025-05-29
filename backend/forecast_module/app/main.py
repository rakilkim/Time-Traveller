# main.py
from fastapi import FastAPI
from api import forecast, detail, redis

app = FastAPI()

app.include_router(forecast.router, prefix="/forecast", tags=["Forecast"])
app.include_router(detail.router, prefix="/detail", tags=["Detail"])

if __name__ == "__main__":
    import uvicorn
    uvicorn.run("main:app", host="127.0.0.1", port=8000, reload=True)