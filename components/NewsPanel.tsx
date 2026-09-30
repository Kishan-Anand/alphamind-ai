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
    <div className="mt-10 bg-zinc-900 border border-zinc-800 rounded-3xl p-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-3xl font-bold">
            AI Market News
          </h2>

          <p className="text-zinc-400 mt-2">
            AI-filtered financial headlines
          </p>
        </div>

        <div className="bg-blue-500/20 text-blue-400 px-4 py-2 rounded-full font-semibold">
          AI NEWS
        </div>
      </div>

      <div className="mt-8 space-y-6">
        {news.map((item, index) => (
          <a
            key={index}
            href={item.url}
            target="_blank"
            className="block bg-zinc-950 border border-zinc-800 rounded-3xl p-6 hover:border-green-500 transition"
          >
            <div className="flex items-center justify-between">
              <p className="text-sm text-green-400 font-semibold">
                {item.source}
              </p>

              <p className="text-zinc-500 text-sm">
                AI TRACKED
              </p>
            </div>

            <h3 className="text-2xl font-bold mt-4 leading-snug">
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