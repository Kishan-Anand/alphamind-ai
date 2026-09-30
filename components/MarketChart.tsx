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
    <div className="bg-zinc-900 border border-zinc-800 rounded-3xl p-6 mt-10">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-3xl font-bold">
            {symbol} Price Chart
          </h2>

          <p className="text-zinc-400 mt-2">
            Historical stock price movement
          </p>
        </div>

        <div className="flex gap-2">
          {["5d", "1mo", "6mo", "1y", "5y"].map((item) => (
            <button
              key={item}
              onClick={() => setRange(item)}
              className={`px-4 py-2 rounded-full font-semibold ${
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

      <div className="h-[400px] mt-8">
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