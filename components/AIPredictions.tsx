"use client";

import { useCallback, useEffect, useState } from "react";
import { fetchStockPrediction, type StockPrediction } from "@/lib/ml-api";

type Props = {
  symbols: string[];
};

export default function AIPredictions({ symbols }: Props) {
  const [predictions, setPredictions] = useState<StockPrediction[]>([]);
  const [error, setError] = useState("");

  const loadPredictions = useCallback(async () => {
    const onlyFourSymbols = symbols.slice(0, 4);

    try {
      const results = await Promise.all(
        onlyFourSymbols.map((symbol) => fetchStockPrediction(symbol))
      );
      setPredictions(results);
      setError("");
    } catch (predictionError) {
      setPredictions([]);
      setError(
        predictionError instanceof Error
          ? predictionError.message
          : "Could not load ML predictions."
      );
    }
  }, [symbols]);

  useEffect(() => {
    const timer = window.setTimeout(() => {
      void loadPredictions();
    }, 0);
    return () => window.clearTimeout(timer);
  }, [loadPredictions]);

  return (
    <div className="mt-8 rounded-3xl border border-zinc-800 bg-zinc-900 p-4 sm:mt-10 sm:p-6">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <h2 className="text-2xl font-bold sm:text-3xl">AI Predictions</h2>
          <p className="text-zinc-400 mt-2">
            Random Forest predictions for selected stocks
          </p>
        </div>

        <div className="shrink-0 rounded-full bg-green-500/20 px-3 py-2 text-sm font-semibold text-green-400 sm:px-4">
          LIVE ML
        </div>
      </div>

      <p className="mt-4 text-sm text-zinc-500">
        Model confidence is not a guarantee of future price movement.
      </p>
      {error && <p className="mt-4 text-red-400">{error}</p>}

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-8">
        {predictions.map((stock, index) => {
          const isUp = stock.prediction === "UP";

          return (
            <div
              key={index}
              className="min-w-0 rounded-3xl border border-zinc-800 bg-zinc-950 p-4 sm:p-6"
            >
              <div className="flex items-start justify-between gap-3">
                <h3 className="break-all text-2xl font-bold sm:text-3xl">{stock.symbol}</h3>

                <div
                  className={`shrink-0 rounded-full px-3 py-2 font-bold sm:px-4 ${
                    isUp
                      ? "bg-green-500/20 text-green-400"
                      : "bg-red-500/20 text-red-400"
                  }`}
                >
                  {stock.prediction}
                </div>
              </div>

              <div className="mt-8">
                <p className="text-zinc-400">Model probability confidence</p>

                <p className="mt-2 text-4xl font-bold sm:text-5xl">
                  {Number(stock.confidence).toFixed(0)}%
                </p>
                <p className="text-sm text-zinc-500 mt-2">
                  Chronological test accuracy: {stock.model_accuracy.toFixed(2)}%
                </p>
              </div>

              <div className="mt-8">
                <div className="w-full h-4 bg-zinc-800 rounded-full overflow-hidden">
                  <div
                    className={`h-full ${
                      isUp ? "bg-green-500" : "bg-red-500"
                    }`}
                    style={{
                      width: `${stock.confidence}%`,
                    }}
                  />
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}