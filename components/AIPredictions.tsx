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
    <div className="mt-10 bg-zinc-900 border border-zinc-800 rounded-3xl p-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-3xl font-bold">AI Predictions</h2>
          <p className="text-zinc-400 mt-2">
            Random Forest predictions for selected stocks
          </p>
        </div>

        <div className="bg-green-500/20 text-green-400 px-4 py-2 rounded-full font-semibold">
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
              className="bg-zinc-950 border border-zinc-800 rounded-3xl p-6"
            >
              <div className="flex items-center justify-between">
                <h3 className="text-3xl font-bold">{stock.symbol}</h3>

                <div
                  className={`px-4 py-2 rounded-full font-bold ${
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

                <p className="text-5xl font-bold mt-2">
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