import logging

from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware

from ml_model import StockPredictionError, predict_stock


LOGGER = logging.getLogger(__name__)
app = FastAPI(title="AlphaMind ML Backend")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=False,
    allow_methods=["*"],
    allow_headers=["*"],
)

stocks = [
    "AAPL",
    "NVDA",
    "TSLA",
    "MSFT",
    "AMD",
    "AMZN",
    "META",
    "GOOGL",
    "RELIANCE.NS",
    "TCS.NS",
]


@app.get("/")
def home():
    return {"message": "AlphaMind ML Backend Running"}


@app.get("/predict/{symbol}")
def predict(symbol: str):
    try:
        return predict_stock(symbol)
    except StockPredictionError as error:
        raise HTTPException(
            status_code=error.status_code, detail=str(error)
        ) from error


@app.get("/top-picks")
def top_picks():
    results = []
    failed_symbols = []

    for symbol in stocks:
        try:
            results.append(predict_stock(symbol))
        except StockPredictionError as error:
            failed_symbols.append(symbol)
            LOGGER.warning("Skipping top-pick prediction for %s: %s", symbol, error)

    if not results:
        raise HTTPException(
            status_code=503,
            detail=(
                "Predictions are unavailable for all supported stocks. "
                "Check the backend logs for per-symbol data/model errors."
            ),
        )

    if failed_symbols:
        LOGGER.warning(
            "Top picks returned partial results; unavailable symbols: %s",
            ", ".join(failed_symbols),
        )

    results.sort(key=lambda result: result["confidence"], reverse=True)
    return results
