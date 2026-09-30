import argparse
import json
import logging
import re
from pathlib import Path
from threading import Lock
from typing import Any

import joblib
import numpy as np
import pandas as pd
import yfinance as yf
from sklearn.ensemble import RandomForestClassifier
from sklearn.metrics import accuracy_score


LOGGER = logging.getLogger(__name__)
MODEL_DIR = Path(__file__).resolve().parent / "models"
FEATURES = [
    "Daily Return",
    "5-day Moving Average",
    "20-day Moving Average",
    "50-day Moving Average",
    "RSI (14-day)",
    "Volatility",
    "Volume Change",
    "10-day Momentum",
]
REQUIRED_COLUMNS = {"Close", "Volume"}
MINIMUM_TRAINING_ROWS = 200
_MODEL_CACHE: dict[str, tuple[int, dict[str, Any]]] = {}
_MODEL_LOCKS: dict[str, Lock] = {}
_MODEL_LOCKS_GUARD = Lock()


class StockPredictionError(Exception):
    def __init__(self, message: str, status_code: int = 503):
        super().__init__(message)
        self.status_code = status_code


def normalize_symbol(symbol: str) -> str:
    normalized = symbol.strip().upper()
    if not normalized or not re.fullmatch(r"[A-Z0-9^._=-]+", normalized):
        raise StockPredictionError("Invalid stock symbol.", status_code=422)
    return normalized


def model_path(symbol: str) -> Path:
    safe_symbol = re.sub(r"[^A-Z0-9_-]", "_", normalize_symbol(symbol))
    return MODEL_DIR / f"{safe_symbol}.joblib"


def model_lock(symbol: str) -> Lock:
    with _MODEL_LOCKS_GUARD:
        return _MODEL_LOCKS.setdefault(symbol, Lock())


def download_history(symbol: str, period: str = "5y") -> pd.DataFrame:
    try:
        data = yf.download(
            symbol,
            period=period,
            interval="1d",
            auto_adjust=True,
            progress=False,
            threads=False,
        )
    except Exception as error:
        LOGGER.exception("Yahoo Finance download failed for %s", symbol)
        raise StockPredictionError(
            f"Unable to download historical data for {symbol}: {error}"
        ) from error

    if data is None or data.empty:
        raise StockPredictionError(
            f"Yahoo Finance returned no historical data for {symbol}."
        )

    if isinstance(data.columns, pd.MultiIndex):
        field_names = {
            "open": "Open",
            "high": "High",
            "low": "Low",
            "close": "Close",
            "volume": "Volume",
        }
        flattened: dict[str, pd.Series] = {}
        for position, column in enumerate(data.columns):
            field = next(
                (
                    field_names[str(level).lower()]
                    for level in column
                    if str(level).lower() in field_names
                ),
                None,
            )
            if field is not None and field not in flattened:
                flattened[field] = data.iloc[:, position]
        data = pd.DataFrame(flattened, index=data.index)
    else:
        data = data.copy()
        data.columns = [
            {
                "open": "Open",
                "high": "High",
                "low": "Low",
                "close": "Close",
                "volume": "Volume",
            }.get(str(column).lower(), str(column))
            for column in data.columns
        ]

    missing_columns = REQUIRED_COLUMNS.difference(data.columns)
    if missing_columns:
        missing = ", ".join(sorted(missing_columns))
        raise StockPredictionError(
            f"Yahoo Finance data for {symbol} is missing required columns: {missing}."
        )

    data = data.loc[:, ["Close", "Volume"]].copy()
    for column in ("Close", "Volume"):
        data[column] = pd.to_numeric(data[column], errors="coerce")
    data = data.sort_index()
    if data[["Close", "Volume"]].dropna().empty:
        raise StockPredictionError(
            f"Yahoo Finance returned no usable close/volume rows for {symbol}."
        )
    return data


def calculate_rsi(close: pd.Series, period: int = 14) -> pd.Series:
    change = close.diff()
    gains = change.clip(lower=0)
    losses = -change.clip(upper=0)
    average_gain = gains.rolling(window=period, min_periods=period).mean()
    average_loss = losses.rolling(window=period, min_periods=period).mean()

    relative_strength = average_gain.div(average_loss.replace(0, np.nan))
    rsi = 100 - (100 / (1 + relative_strength))
    rsi = rsi.mask((average_loss == 0) & (average_gain > 0), 100)
    rsi = rsi.mask((average_loss == 0) & (average_gain == 0), 50)
    return rsi


def engineer_features(history: pd.DataFrame) -> pd.DataFrame:
    data = history.copy()
    daily_return = data["Close"].pct_change()

    data["Daily Return"] = daily_return
    data["5-day Moving Average"] = data["Close"].rolling(window=5).mean()
    data["20-day Moving Average"] = data["Close"].rolling(window=20).mean()
    data["50-day Moving Average"] = data["Close"].rolling(window=50).mean()
    data["RSI (14-day)"] = calculate_rsi(data["Close"])
    data["Volatility"] = daily_return.rolling(window=10).std()
    data["Volume Change"] = data["Volume"].pct_change()
    data["10-day Momentum"] = data["Close"].pct_change(periods=10)

    next_close = data["Close"].shift(-1)
    data["Target"] = np.where(
        next_close.notna(),
        (next_close > data["Close"]).astype(float),
        np.nan,
    )
    return data.replace([np.inf, -np.inf], np.nan)


def training_rows(features: pd.DataFrame) -> pd.DataFrame:
    return features.dropna(subset=FEATURES + ["Target"])


def train_model(symbol: str) -> dict[str, Any]:
    symbol = normalize_symbol(symbol)
    with model_lock(symbol):
        return _train_model(symbol)


def _train_model(symbol: str) -> dict[str, Any]:
    data = training_rows(engineer_features(download_history(symbol)))
    if len(data) < MINIMUM_TRAINING_ROWS:
        raise StockPredictionError(
            f"Insufficient historical data for {symbol}: "
            f"need at least {MINIMUM_TRAINING_ROWS} usable rows, got {len(data)}."
        )

    split_index = int(len(data) * 0.8)
    # Purge the boundary row so its next-day label cannot overlap test features.
    train_end_index = split_index - 1
    if train_end_index == 0 or split_index >= len(data):
        raise StockPredictionError(
            f"Insufficient data to create a chronological train/test split for {symbol}."
        )

    X = data[FEATURES]
    y = data["Target"].astype(int)
    X_train, X_test = X.iloc[:train_end_index], X.iloc[split_index:]
    y_train, y_test = y.iloc[:train_end_index], y.iloc[split_index:]

    model = RandomForestClassifier(
        n_estimators=300,
        max_depth=10,
        min_samples_split=5,
        random_state=42,
        class_weight="balanced",
        n_jobs=-1,
    )
    model.fit(X_train, y_train)
    accuracy = float(accuracy_score(y_test, model.predict(X_test)))

    artifact = {
        "model": model,
        "features": FEATURES,
        "model_accuracy": accuracy,
        "training_samples": len(X_train),
        "testing_samples": len(X_test),
    }
    destination = model_path(symbol)
    try:
        MODEL_DIR.mkdir(parents=True, exist_ok=True)
        joblib.dump(artifact, destination)
        modified_at = destination.stat().st_mtime_ns
    except OSError as error:
        LOGGER.exception("Could not save the trained model for %s", symbol)
        raise StockPredictionError(
            f"Could not save the trained model for {symbol}: {error}", status_code=500
        ) from error

    _MODEL_CACHE[symbol] = (modified_at, artifact)
    return {
        "symbol": symbol,
        "status": "trained",
        "model_accuracy": round(accuracy * 100, 2),
        "training_samples": len(X_train),
        "testing_samples": len(X_test),
        "model_path": str(destination),
    }


def load_model(symbol: str) -> dict[str, Any]:
    symbol = normalize_symbol(symbol)
    with model_lock(symbol):
        return _load_model(symbol)


def _load_model(symbol: str) -> dict[str, Any]:
    path = model_path(symbol)
    if not path.exists():
        _train_model(symbol)

    try:
        modified_at = path.stat().st_mtime_ns
    except OSError as error:
        raise StockPredictionError(
            f"Could not access the saved model for {symbol}: {error}", status_code=500
        ) from error

    cached = _MODEL_CACHE.get(symbol)
    if cached is not None and cached[0] == modified_at:
        return cached[1]

    try:
        artifact = joblib.load(path)
    except Exception as error:
        LOGGER.exception("Could not load the saved model for %s", symbol)
        raise StockPredictionError(
            f"Could not load the saved model for {symbol}: {error}", status_code=500
        ) from error

    if (
        not isinstance(artifact, dict)
        or not isinstance(artifact.get("model"), RandomForestClassifier)
        or artifact.get("features") != FEATURES
        or not isinstance(artifact.get("model_accuracy"), (float, int))
    ):
        raise StockPredictionError(
            f"The saved model for {symbol} has an unsupported format. "
            f"Run `python ml_model.py train {symbol}` to retrain it.",
            status_code=500,
        )

    _MODEL_CACHE[symbol] = (modified_at, artifact)
    return artifact


def predict_stock(symbol: str) -> dict[str, Any]:
    symbol = normalize_symbol(symbol)
    recent_data = engineer_features(download_history(symbol))
    latest = recent_data.dropna(subset=FEATURES).tail(1)
    if latest.empty:
        raise StockPredictionError(
            f"Insufficient historical data to calculate prediction features for {symbol}."
        )

    artifact = load_model(symbol)
    model = artifact["model"]
    row = latest[FEATURES]

    try:
        predicted_class = int(model.predict(row)[0])
        probabilities = model.predict_proba(row)[0]
        class_index = list(model.classes_).index(predicted_class)
        confidence = float(probabilities[class_index]) * 100
    except Exception as error:
        LOGGER.exception("Prediction failed for %s", symbol)
        raise StockPredictionError(
            f"The saved model could not predict {symbol}: {error}", status_code=500
        ) from error

    return {
        "symbol": symbol,
        "prediction": "UP" if predicted_class == 1 else "DOWN",
        "confidence": round(confidence, 2),
        "model_accuracy": round(float(artifact["model_accuracy"]) * 100, 2),
    }


def main() -> None:
    parser = argparse.ArgumentParser(
        description="Train and save an AlphaMind stock direction model."
    )
    parser.add_argument("action", choices=["train"])
    parser.add_argument("symbol", help="Yahoo Finance ticker, for example AAPL")
    args = parser.parse_args()

    result = train_model(args.symbol)
    print(json.dumps(result, indent=2))


if __name__ == "__main__":
    logging.basicConfig(level=logging.INFO)
    main()
