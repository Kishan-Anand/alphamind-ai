"use client";

import { useEffect, useState } from "react";

import {
  ResponsiveContainer,
  AreaChart,
  Area,
  XAxis,
  YAxis,
  Tooltip,
} from "recharts";

type ChartPoint = {
  time: string;
  price: number;
};

type Props = {
  symbol: string;
};

export default function MarketChart({ symbol }: Props) {
  const [range, setRange] = useState("1mo");
  const [data, setData] = useState<ChartPoint[]>([]);

  async function fetchChart() {
    const res = await fetch(
      `/api/chart?symbol=${symbol}&range=${range}`
    );

    const chartData = await res.json();

    setData(chartData.prices || []);
  }

  useEffect(() => {
    fetchChart();
  }, [symbol, range]);

  return (
    <div className="mt-8 min-w-0 rounded-3xl border border-zinc-800 bg-zinc-900 p-4 sm:mt-10 sm:p-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h2 className="text-2xl font-bold sm:text-3xl">
            {symbol} Price Chart
          </h2>

          <p className="text-zinc-400 mt-2">
            Historical stock price movement
          </p>
        </div>

        <div className="mobile-nav-scrollbar flex max-w-full gap-2 overflow-x-auto">
          {["5d", "1mo", "6mo", "1y", "5y"].map((item) => (
            <button
              key={item}
              onClick={() => setRange(item)}
              className={`shrink-0 rounded-full px-3 py-2 text-sm font-semibold sm:px-4 ${
                range === item
                  ? "bg-green-500 text-black"
                  : "bg-zinc-800 text-zinc-300"
              }`}
            >
              {item.toUpperCase()}
            </button>
          ))}
        </div>
      </div>

      <div className="mt-6 h-[280px] min-w-0 sm:mt-8 sm:h-[400px]">
        {data.length > 0 ? (
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={data}>
              <defs>
                <linearGradient
                  id="colorPrice"
                  x1="0"
                  y1="0"
                  x2="0"
                  y2="1"
                >
                  <stop
                    offset="0%"
                    stopColor="#22c55e"
                    stopOpacity={0.8}
                  />

                  <stop
                    offset="100%"
                    stopColor="#22c55e"
                    stopOpacity={0}
                  />
                </linearGradient>
              </defs>

              <XAxis
                dataKey="time"
                stroke="#71717a"
                tick={{ fontSize: 12 }}
              />

              <YAxis stroke="#71717a" />

              <Tooltip
                contentStyle={{
                  backgroundColor: "#18181b",
                  border: "1px solid #27272a",
                  borderRadius: "16px",
                  color: "white",
                }}
              />

              <Area
                type="monotone"
                dataKey="price"
                stroke="#22c55e"
                strokeWidth={4}
                fill="url(#colorPrice)"
              />
            </AreaChart>
          </ResponsiveContainer>
        ) : (
          <div className="h-full flex items-center justify-center text-zinc-400">
            Loading chart...
          </div>
        )}
      </div>
    </div>
  );
}