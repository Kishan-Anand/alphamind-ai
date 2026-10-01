"use client";

import { useEffect, useState } from "react";

import DashboardNavigation from "@/components/DashboardNavigation";
import MarketChart from "@/components/MarketChart";
import TopMovers from "@/components/TopMovers";
import AIPredictions from "@/components/AIPredictions";
import NewsPanel from "@/components/NewsPanel";
import AIChat from "@/components/AIChat";

type StockData = {
  symbol: string;
  currentPrice: number | null;
  percentChange: number | null;
};

type SearchResult = {
  description: string;
  displaySymbol: string;
  symbol: string;
};

export default function Dashboard() {
  const [stocks, setStocks] = useState<StockData[]>([]);
  const [search, setSearch] = useState("");
  const [results, setResults] = useState<SearchResult[]>([]);
  const [selectedSymbol, setSelectedSymbol] = useState("AAPL");

  async function fetchStock(symbol: string): Promise<StockData> {
    const res = await fetch(`/api/stock?symbol=${symbol}`);
    const data = await res.json();

    return {
      symbol,
      currentPrice:
        typeof data.currentPrice === "number" && data.currentPrice > 0
          ? data.currentPrice
          : null,
      percentChange:
        typeof data.percentChange === "number"
          ? data.percentChange
          : null,
    };
  }

  async function loadDefaultStocks() {
    const nvda = await fetchStock("NVDA");
    const tsla = await fetchStock("TSLA");
    const aapl = await fetchStock("AAPL");

    setStocks([nvda, tsla, aapl]);
    setSelectedSymbol("NVDA");
  }

  async function searchStocks(query: string) {
    if (!query) {
      setResults([]);
      return;
    }

    const res = await fetch(`/api/search?q=${query}`);
    const data = await res.json();

    setResults(data.result?.slice(0, 8) || []);
  }

  async function addStock(symbol: string) {
    const stock = await fetchStock(symbol);

    const exists = stocks.find((s) => s.symbol === symbol);

    if (!exists) {
      setStocks([stock, ...stocks]);
    }

    setSelectedSymbol(symbol);
    setResults([]);
    setSearch("");
  }

  useEffect(() => {
    loadDefaultStocks();
  }, []);

  return (
    <main className="relative flex min-h-screen w-full flex-col overflow-hidden bg-black text-white md:flex-row">
      <div className="absolute top-0 left-0 w-96 h-96 bg-green-500/10 blur-3xl rounded-full"></div>
      <div className="absolute bottom-0 right-0 w-96 h-96 bg-blue-500/10 blur-3xl rounded-full"></div>

      <DashboardNavigation activePage="dashboard" />

      <section className="z-10 w-full min-w-0 flex-1 p-4 sm:p-6 lg:p-8">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div className="min-w-0">
            <h1 className="text-3xl font-bold sm:text-4xl xl:text-5xl">
              Market Dashboard
            </h1>

            <p className="text-zinc-400 mt-2">
              AI Powered Stock Intelligence
            </p>
          </div>

          <button
            onClick={() => window.location.reload()}
            className="w-full rounded-2xl bg-green-500 px-6 py-3 font-bold transition hover:bg-green-600 sm:w-auto"
          >
            Refresh
          </button>
        </div>

        <div className="mt-6 relative">
          <input
            type="text"
            placeholder="Search global stocks like Reliance, Tata, AMD, Apple..."
            value={search}
            onChange={(e) => {
              setSearch(e.target.value);
              searchStocks(e.target.value);
            }}
            className="w-full bg-zinc-900 border border-zinc-800 rounded-2xl px-4 py-3 outline-none"
          />

          {results.length > 0 && (
            <div className="absolute mt-2 w-full bg-zinc-900 border border-zinc-800 rounded-2xl overflow-hidden z-50">
              {results.map((stock, index) => (
                <button
                  key={index}
                  onClick={() => addStock(stock.symbol)}
                  className="w-full text-left px-4 py-4 hover:bg-zinc-800 border-b border-zinc-800 transition"
                >
                  <p className="font-bold text-green-400">
                    {stock.symbol}
                  </p>

                  <p className="text-sm text-zinc-400">
                    {stock.description}
                  </p>
                </button>
              ))}
            </div>
          )}
        </div>

        <div className="mt-8 grid grid-cols-1 gap-5 sm:grid-cols-2 xl:mt-10 xl:grid-cols-3 xl:gap-6">
          {stocks.map((stock, index) => {
            const isPositive =
              stock.percentChange !== null && stock.percentChange >= 0;

            const currencySymbol = stock.symbol.includes(".NS") ? "₹" : "$";

            const isSelected = selectedSymbol === stock.symbol;

            return (
              <button
                key={index}
                onClick={() => setSelectedSymbol(stock.symbol)}
                className={`text-left bg-zinc-900 p-6 rounded-3xl border transition hover:scale-[1.02] ${
                  isSelected
                    ? "border-green-500"
                    : "border-zinc-800"
                }`}
              >
                <div className="flex items-center justify-between">
                  <h2 className="text-2xl font-bold">
                    {stock.symbol}
                  </h2>

                  {isSelected && (
                    <span className="text-xs bg-green-500/20 text-green-400 px-3 py-1 rounded-full">
                      CHART
                    </span>
                  )}
                </div>

                <p className="text-4xl mt-4">
                  {stock.currentPrice !== null
                    ? `${currencySymbol}${stock.currentPrice.toFixed(2)}`
                    : "No Data"}
                </p>

                <p
                  className={`mt-2 font-semibold ${
                    stock.percentChange === null
                      ? "text-zinc-400"
                      : isPositive
                      ? "text-green-400"
                      : "text-red-400"
                  }`}
                >
                  {stock.percentChange !== null
                    ? `${stock.percentChange.toFixed(2)}% ${
                        isPositive ? "▲" : "▼"
                      }`
                    : "Quote unavailable"}
                </p>

                <div
                  className={`inline-block mt-6 px-4 py-2 rounded-full ${
                    stock.percentChange === null
                      ? "bg-zinc-500/20 text-zinc-400"
                      : isPositive
                      ? "bg-green-500/20 text-green-400"
                      : "bg-red-500/20 text-red-400"
                  }`}
                >
                  {stock.percentChange === null
                    ? "NO DATA"
                    : isPositive
                    ? "BUY"
                    : "SELL"}
                </div>
              </button>
            );
          })}
        </div>

        <MarketChart symbol={selectedSymbol} />

        <TopMovers />

        <AIPredictions symbols={stocks.map((stock) => stock.symbol).slice(0, 4)} />

        <NewsPanel />

        <AIChat />

        <footer className="mt-16 text-center text-zinc-500">
          Powered by AlphaMind AI • Hackathon 2026
        </footer>
      </section>
    </main>
  );
}