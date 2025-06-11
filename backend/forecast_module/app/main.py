# main.py
from fastapi import FastAPI
from api import forecast, detail, redis
from fastapi.middleware.cors import CORSMiddleware

app = FastAPI()

origins = [
    "http://localhost:5173",   # vite dev server
    "http://127.0.0.1:5173",
    "http://localhost:4173",   # vite preview / prod test
    "http://127.0.0.1:4173",
]

app = FastAPI()

app.include_router(forecast.router, prefix="/forecast", tags=["Forecast"])
app.include_router(detail.router, prefix="/detail", tags=["Detail"])
app.add_middleware(
    CORSMiddleware,
    allow_origins=origins,
    allow_methods=["GET", "POST", "OPTIONS"],
    allow_headers=["*"],
    allow_credentials=True,
)
if __name__ == "__main__":
    import uvicorn
    uvicorn.run("main:app", host="127.0.0.1", port=8000, reload=True)