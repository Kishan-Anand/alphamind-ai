"use client";

import Link from "next/link";
import { useCallback, useEffect, useState } from "react";
import { fetchTopPicks, type StockPrediction } from "@/lib/ml-api";

export default function PredictionsPage() {
  const [predictions, setPredictions] = useState<StockPrediction[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const loadPredictions = useCallback(async () => {
    setLoading(true);

    try {
      const data = await fetchTopPicks();
      setPredictions(data);
      setError("");
    } catch (requestError) {
      setPredictions([]);
      setError(
        requestError instanceof Error
          ? requestError.message
          : "Could not load stock predictions."
      );
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    const timer = window.setTimeout(() => {
      void loadPredictions();
    }, 0);
    return () => window.clearTimeout(timer);
  }, [loadPredictions]);

  return (
    <main className="min-h-screen bg-black text-white flex">
      <aside className="w-64 bg-zinc-950 border-r border-zinc-800 p-6 hidden md:flex flex-col">
        <h1 className="text-3xl font-bold text-green-400">
          AlphaMind
        </h1>

        <nav className="mt-12 space-y-4">
          <Link
            href="/dashboard"
            className="text-zinc-400 px-4 py-3 hover:bg-zinc-900 rounded-2xl transition block"
          >
            Dashboard
          </Link>

          <Link
            href="/screener"
            className="text-zinc-400 px-4 py-3 hover:bg-zinc-900 rounded-2xl transition block"
          >
            Stock Screener
          </Link>

          <Link
            href="/predictions"
            className="bg-green-500/20 text-green-400 px-4 py-3 rounded-2xl block"
          >
            AI Predictions
          </Link>

          <Link
            href="/settings"
            className="text-zinc-400 px-4 py-3 hover:bg-zinc-900 rounded-2xl transition block"
          >
            Settings
          </Link>
        </nav>
      </aside>

      <section className="flex-1 p-8">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-5xl font-bold">
              AI Predictions
            </h1>

            <p className="text-zinc-400 mt-2">
              Random Forest predictions ranked by model confidence
            </p>
          </div>

          <button
            onClick={loadPredictions}
            className="bg-green-500 hover:bg-green-600 px-6 py-3 rounded-2xl font-bold transition"
          >
            Refresh
          </button>
        </div>

        {loading && (
          <div className="mt-10 bg-zinc-900 border border-zinc-800 rounded-3xl p-6 text-green-400">
            Loading ML predictions...
          </div>
        )}
        {error && (
          <div className="mt-10 bg-zinc-900 border border-red-900 rounded-3xl p-6 text-red-400">
            {error}
          </div>
        )}
        <p className="mt-6 text-sm text-zinc-500">
          Model confidence is not a guarantee of future price movement or investment advice.
        </p>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-10">
          {predictions.map((stock, index) => {
            const isUp = stock.prediction === "UP";

            return (
              <div
                key={index}
                className="bg-zinc-900 border border-zinc-800 rounded-3xl p-6"
              >
                <div className="flex items-center justify-between">
                  <h2 className="text-3xl font-bold">
                    #{index + 1} {stock.symbol}
                  </h2>

                  <span
                    className={`px-4 py-2 rounded-full ${
                      isUp
                        ? "bg-green-500/20 text-green-400"
                        : "bg-red-500/20 text-red-400"
                    }`}
                  >
                    {isUp ? "Bullish" : "Bearish"}
                  </span>
                </div>

                <p className="text-zinc-400 mt-6">
                  Model probability confidence
                </p>

                <h3
                  className={`text-6xl font-bold mt-2 ${
                    isUp ? "text-green-400" : "text-red-400"
                  }`}
                >
                  {Number(stock.confidence).toFixed(0)}%
                </h3>
                <p className="text-sm text-zinc-500 mt-2">
                  Chronological test accuracy: {stock.model_accuracy.toFixed(2)}%
                </p>

                <div className="w-full h-4 bg-zinc-800 rounded-full overflow-hidden mt-6">
                  <div
                    className={`h-full ${
                      isUp ? "bg-green-500" : "bg-red-500"
                    }`}
                    style={{ width: `${stock.confidence}%` }}
                  />
                </div>

                <p className="mt-6 text-zinc-300 leading-relaxed">
                  ML model predicts this stock may move{" "}
                  <span className={isUp ? "text-green-400" : "text-red-400"}>
                    {stock.prediction}
                  </span>{" "}
                  based on recent returns, moving averages, and volatility.
                </p>
              </div>
            );
          })}
        </div>
      </section>
    </main>
  );
}