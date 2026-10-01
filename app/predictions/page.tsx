"use client";

import { useCallback, useEffect, useState } from "react";
import DashboardNavigation from "@/components/DashboardNavigation";
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
    <main className="flex min-h-screen w-full flex-col bg-black text-white md:flex-row">
      <DashboardNavigation activePage="predictions" />

      <section className="w-full min-w-0 flex-1 p-4 sm:p-6 lg:p-8">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div className="min-w-0">
            <h1 className="text-3xl font-bold sm:text-4xl xl:text-5xl">
              AI Predictions
            </h1>

            <p className="text-zinc-400 mt-2">
              Random Forest predictions ranked by model confidence
            </p>
          </div>

          <button
            onClick={loadPredictions}
            className="w-full rounded-2xl bg-green-500 px-6 py-3 font-bold transition hover:bg-green-600 sm:w-auto"
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

        <div className="mt-8 grid grid-cols-1 gap-5 xl:mt-10 xl:grid-cols-2 xl:gap-6">
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