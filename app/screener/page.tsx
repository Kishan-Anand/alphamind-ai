"use client";

import { useCallback, useEffect, useState } from "react";
import DashboardNavigation from "@/components/DashboardNavigation";
import { fetchStockPrediction } from "@/lib/ml-api";

type Stock = {
  symbol: string;
  currentPrice: number | null;
  percentChange: number | null;
  prediction: string;
  confidence: number;
  model_accuracy: number | null;
};

const stockList = [
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
];

export default function ScreenerPage() {
  const [stocks, setStocks] = useState<Stock[]>([]);
  const [market, setMarket] = useState("All");
  const [prediction, setPrediction] = useState("All");
  const [confidence, setConfidence] = useState("All");
  const [loading, setLoading] = useState(false);
  const [scanError, setScanError] = useState("");

  async function fetchStock(symbol: string) {
    const priceRes = await fetch(`/api/stock?symbol=${symbol}`);
    const priceData = await priceRes.json();

    let predictionData = null;

    try {
      predictionData = await fetchStockPrediction(symbol);
    } catch {
      predictionData = null;
    }

    return {
      symbol,
      currentPrice:
        typeof priceData.currentPrice === "number"
          ? priceData.currentPrice
          : null,
      percentChange:
        typeof priceData.percentChange === "number"
          ? priceData.percentChange
          : null,
      prediction: predictionData?.prediction ?? "UNKNOWN",
      confidence: predictionData?.confidence ?? 0,
      model_accuracy: predictionData?.model_accuracy ?? null,
    };
  }

  const scanStocks = useCallback(async () => {
    setLoading(true);
    setScanError("");
    try {
      const results = await Promise.all(
        stockList.map((symbol) => fetchStock(symbol))
      );
      setStocks(results);
    } catch (error) {
      setScanError(
        error instanceof Error ? error.message : "Could not scan stocks."
      );
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    const timer = window.setTimeout(() => {
      void scanStocks();
    }, 0);
    return () => window.clearTimeout(timer);
  }, [scanStocks]);

  const filteredStocks = stocks.filter((stock) => {
    const isIndian = stock.symbol.includes(".NS");

    if (market === "India" && !isIndian) return false;
    if (market === "USA" && isIndian) return false;

    if (prediction === "Bullish" && stock.prediction !== "UP") return false;
    if (prediction === "Bearish" && stock.prediction !== "DOWN") return false;

    if (confidence === "70" && stock.confidence < 70) return false;
    if (confidence === "80" && stock.confidence < 80) return false;
    if (confidence === "90" && stock.confidence < 90) return false;

    return true;
  });

  return (
    <main className="flex min-h-screen w-full flex-col bg-black text-white md:flex-row">
      <DashboardNavigation activePage="screener" />

      <section className="w-full min-w-0 flex-1 p-4 sm:p-6 lg:p-8">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div className="min-w-0">
            <h1 className="text-3xl font-bold sm:text-4xl xl:text-5xl">
              Stock Screener
            </h1>

            <p className="text-zinc-400 mt-2">
              Filter stocks using live data and real ML predictions
            </p>
            <p className="text-sm text-zinc-500 mt-2">
              Model confidence is not a guarantee of future price movement.
            </p>
          </div>

          <button
            onClick={scanStocks}
            className="w-full rounded-2xl bg-green-500 px-6 py-3 font-bold transition hover:bg-green-600 sm:w-auto"
          >
            Scan Stocks
          </button>
        </div>

        <div className="mt-8 grid grid-cols-1 gap-4 sm:grid-cols-3 xl:mt-10">
          <select
            value={market}
            onChange={(e) => setMarket(e.target.value)}
            className="bg-zinc-900 border border-zinc-800 rounded-2xl p-3"
          >
            <option>All</option>
            <option>India</option>
            <option>USA</option>
          </select>

          <select
            value={prediction}
            onChange={(e) => setPrediction(e.target.value)}
            className="bg-zinc-900 border border-zinc-800 rounded-2xl p-3"
          >
            <option>All</option>
            <option>Bullish</option>
            <option>Bearish</option>
          </select>

          <select
            value={confidence}
            onChange={(e) => setConfidence(e.target.value)}
            className="bg-zinc-900 border border-zinc-800 rounded-2xl p-3"
          >
            <option value="All">All Confidence</option>
            <option value="70">70%+</option>
            <option value="80">80%+</option>
            <option value="90">90%+</option>
          </select>
        </div>

        {loading && (
          <div className="mt-10 bg-zinc-900 border border-zinc-800 rounded-3xl p-6 text-green-400">
            Scanning live stocks with ML...
          </div>
        )}
        {scanError && (
          <div className="mt-10 bg-zinc-900 border border-red-900 rounded-3xl p-6 text-red-400">
            {scanError}
          </div>
        )}

        <div className="mt-8 grid grid-cols-1 gap-5 xl:mt-10 xl:grid-cols-2 xl:gap-6">
          {filteredStocks.map((stock, index) => {
            const isIndian = stock.symbol.includes(".NS");
            const currency = isIndian ? "₹" : "$";
            const isUp = stock.prediction === "UP";
            const hasPrediction =
              stock.prediction === "UP" || stock.prediction === "DOWN";
            const priceChangePositive =
              stock.percentChange !== null &&
              stock.percentChange >= 0;

            return (
              <div
                key={index}
                className="bg-zinc-900 border border-zinc-800 rounded-3xl p-6 hover:scale-[1.02] transition"
              >
                <div className="flex justify-between items-center">
                  <h2 className="text-3xl font-bold">
                    {stock.symbol}
                  </h2>

                  <span
                    className={`px-4 py-2 rounded-full ${
                      isUp
                        ? "bg-green-500/20 text-green-400"
                        : stock.prediction === "DOWN"
                          ? "bg-red-500/20 text-red-400"
                          : "bg-zinc-800 text-zinc-400"
                    }`}
                  >
                    {hasPrediction ? stock.prediction : "Unavailable"}
                  </span>
                </div>

                <p className="text-zinc-400 mt-6">
                  Current Price
                </p>

                <h3 className="text-4xl font-bold mt-2">
                  {stock.currentPrice !== null
                    ? `${currency}${stock.currentPrice.toFixed(2)}`
                    : "No Data"}
                </h3>

                <p
                  className={`mt-2 font-semibold ${
                    stock.percentChange === null
                      ? "text-zinc-400"
                      : priceChangePositive
                      ? "text-green-400"
                      : "text-red-400"
                  }`}
                >
                  {stock.percentChange !== null
                    ? `${stock.percentChange.toFixed(2)}% ${
                        priceChangePositive ? "▲" : "▼"
                      }`
                    : "Quote unavailable"}
                </p>

                <div className="mt-6">
                  <div className="flex items-center justify-between">
                    <p className="text-zinc-400">
                      Model confidence
                    </p>

                    <p className={hasPrediction ? "text-green-400 font-bold" : "text-zinc-500 font-bold"}>
                      {hasPrediction ? `${Number(stock.confidence).toFixed(0)}%` : "Unavailable"}
                    </p>
                  </div>

                  {hasPrediction && (
                    <div className="w-full h-4 bg-zinc-800 rounded-full overflow-hidden mt-3">
                      <div
                        className={isUp ? "h-full bg-green-500" : "h-full bg-red-500"}
                        style={{
                          width: `${stock.confidence}%`,
                        }}
                      />
                    </div>
                  )}
                </div>

                <p className="mt-6 text-zinc-400">
                  Market: {isIndian ? "India" : "USA"} • Prediction:{" "}
                  {stock.prediction === "UNKNOWN"
                    ? "Unavailable"
                    : isUp
                      ? "Bullish"
                      : "Bearish"}
                </p>
                {stock.model_accuracy !== null && (
                  <p className="mt-2 text-sm text-zinc-500">
                    Chronological test accuracy: {stock.model_accuracy.toFixed(2)}%
                  </p>
                )}
              </div>
            );
          })}
        </div>
      </section>
    </main>
  );
}