"use client";

import { useEffect, useState } from "react";

type News = {
  headline: string;
  source: string;
  url: string;
  summary: string;
};

export default function NewsPanel() {
  const [news, setNews] = useState<News[]>([]);

  async function fetchNews() {
    try {
      const res = await fetch(
        "https://finnhub.io/api/v1/news?category=general&token=d89j7t1r01qspkc770ugd89j7t1r01qspkc770v0"
      );

      const data = await res.json();

      const formatted = data.slice(0, 3).map((item: any) => ({
        headline: item.headline,
        source: item.source,
        url: item.url,
        summary:
          item.summary ||
          "AI is tracking this market event for possible impact on stock movement.",
      }));

      setNews(formatted);
    } catch (error) {
      console.log(error);
    }
  }

  useEffect(() => {
    fetchNews();
  }, []);

  return (
    <div className="mt-8 rounded-3xl border border-zinc-800 bg-zinc-900 p-4 sm:mt-10 sm:p-6">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <h2 className="text-2xl font-bold sm:text-3xl">
            AI Market News
          </h2>

          <p className="text-zinc-400 mt-2">
            AI-filtered financial headlines
          </p>
        </div>

        <div className="shrink-0 rounded-full bg-blue-500/20 px-3 py-2 text-sm font-semibold text-blue-400 sm:px-4">
          AI NEWS
        </div>
      </div>

      <div className="mt-8 space-y-6">
        {news.map((item, index) => (
          <a
            key={index}
            href={item.url}
            target="_blank"
            className="block min-w-0 rounded-3xl border border-zinc-800 bg-zinc-950 p-4 transition hover:border-green-500 sm:p-6"
          >
            <div className="flex items-start justify-between gap-3">
              <p className="text-sm text-green-400 font-semibold">
                {item.source}
              </p>

              <p className="text-zinc-500 text-sm">
                AI TRACKED
              </p>
            </div>

            <h3 className="mt-4 text-xl font-bold leading-snug sm:text-2xl">
              {item.headline}
            </h3>

            <p className="text-zinc-400 mt-4 leading-relaxed">
              {item.summary}
            </p>
          </a>
        ))}
      </div>
    </div>
  );
}