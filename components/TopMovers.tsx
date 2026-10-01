"use client";

import { useCallback, useEffect, useState } from "react";
import { fetchTopPicks as fetchMlTopPicks, type StockPrediction } from "@/lib/ml-api";

export default function TopMovers() {
  const [picks, setPicks] = useState<StockPrediction[]>([]);
  const [error, setError] = useState("");

  const fetchTopPicks = useCallback(async () => {
    try {
      const data = await fetchMlTopPicks();
      setPicks(data.slice(0, 4));
      setError("");
    } catch (requestError) {
      setPicks([]);
      setError(
        requestError instanceof Error
          ? requestError.message
          : "Could not load top picks."
      );
    }
  }, []);

  useEffect(() => {
    const timer = window.setTimeout(() => {
      void fetchTopPicks();
    }, 0);
    return () => window.clearTimeout(timer);
  }, [fetchTopPicks]);

  return (
    <div className="mt-8 rounded-3xl border border-zinc-800 bg-zinc-900 p-4 sm:mt-10 sm:p-6">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <h2 className="text-2xl font-bold sm:text-3xl">Top AI Picks</h2>
          <p className="text-zinc-400 mt-2">
            Top 4 ranked by model probability confidence
          </p>
        </div>

        <div className="shrink-0 rounded-full bg-green-500/20 px-3 py-2 text-sm font-semibold text-green-400 sm:px-4">
          REAL ML
        </div>
      </div>

      <p className="mt-4 text-sm text-zinc-500">
        Confidence is not a guarantee of future performance or investment advice.
      </p>
      {error && <p className="mt-4 text-red-400">{error}</p>}

      <div className="mt-8 grid grid-cols-1 md:grid-cols-2 gap-6">
        {picks.map((pick, index) => {
          const isUp = pick.prediction === "UP";

          return (
            <div
              key={index}
              className="min-w-0 rounded-3xl border border-zinc-800 bg-zinc-950 p-4 transition hover:scale-[1.02] sm:p-6"
            >
              <div className="flex items-start justify-between gap-3">
                <div>
                  <h3 className="text-2xl font-bold sm:text-3xl">{pick.symbol}</h3>
                  <p className="text-zinc-400 mt-2">
                    Ranked by model confidence
                  </p>
                </div>

                <div className="shrink-0 rounded-full bg-green-500/20 px-3 py-2 font-bold text-green-400 sm:px-4">
                  #{index + 1}
                </div>
              </div>

              <div className="mt-8">
                <div className="flex items-center justify-between gap-3">
                  <p className="text-zinc-400">Model confidence</p>
                  <p className="text-green-400 font-bold">
                    {Number(pick.confidence).toFixed(0)}%
                  </p>
                </div>

                <div className="w-full h-4 bg-zinc-800 rounded-full overflow-hidden mt-3">
                  <div
                    className="h-full bg-green-500"
                    style={{
                      width: `${pick.confidence}%`,
                    }}
                  />
                </div>
              </div>
              <p className="mt-2 text-sm text-zinc-500">
                Test accuracy: {pick.model_accuracy.toFixed(2)}%
              </p>

              <div className="mt-8 flex items-center justify-between">
                <div>
                  <p className="text-zinc-400">Prediction</p>

                  <p
                    className={`text-2xl font-bold mt-1 ${
                      isUp ? "text-green-400" : "text-red-400"
                    }`}
                  >
                    {pick.prediction}
                  </p>
                </div>

                <span className="text-sm text-zinc-500">Direction only</span>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}