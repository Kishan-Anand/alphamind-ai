"use client";

import { useState } from "react";

type Message = {
  sender: "user" | "ai";
  text: string;
};

function keepLatestQuestions(messages: Message[]): Message[] {
  const questionIndexes = messages.flatMap((message, index) =>
    message.sender === "user" ? [index] : []
  );

  if (questionIndexes.length <= 3) {
    return messages;
  }

  return messages.slice(questionIndexes[questionIndexes.length - 3]);
}

export default function AIChat() {

  const [input, setInput] = useState("");

  const [loading, setLoading] = useState(false);

  const [messages, setMessages] = useState<Message[]>([
    {
      sender: "ai",
      text: "Hi, I am AlphaMind AI. Ask me about stocks, investing, risk, or market trends.",
    },
  ]);

  async function handleSend() {

    if (!input.trim()) return;

    const question = input;

    setMessages((prev) => keepLatestQuestions([
      ...prev,
      {
        sender: "user",
        text: question,
      },
    ]));

    setInput("");

    setLoading(true);

    try {

      const res = await fetch("/api/chat", {
        method: "POST",

        headers: {
          "Content-Type": "application/json",
        },

        body: JSON.stringify({
          question,
        }),
      });

      const data: unknown = await res.json();
      const answer =
        typeof data === "object" &&
        data !== null &&
        "answer" in data &&
        typeof data.answer === "string"
          ? data.answer
          : null;
      if (!res.ok || answer === null) {
        throw new Error(answer || "AI assistant returned an invalid response.");
      }

      setMessages((prev) => keepLatestQuestions([
        ...prev,
        {
          sender: "ai",
          text: answer,
        },
      ]));

    } catch (error) {
      setMessages((prev) => keepLatestQuestions([
        ...prev,
        {
          sender: "ai",
          text:
            error instanceof Error
              ? error.message
              : "AI is unavailable right now.",
        },
      ]));
    } finally {
      setLoading(false);
    }

  }

  return (

    <div className="mt-8 rounded-3xl border border-zinc-800 bg-zinc-900 p-4 sm:mt-10 sm:p-6">

      <div className="flex flex-wrap items-start justify-between gap-3">

        <div>

          <h2 className="text-2xl font-bold sm:text-3xl">
            AI Investment Assistant
          </h2>

          <p className="text-zinc-400 mt-2">
            Real AI powered stock assistant
          </p>

        </div>

        <div className="shrink-0 rounded-full bg-green-500/20 px-3 py-2 text-sm font-semibold text-green-400 sm:px-4">
          GPT AI
        </div>

      </div>

      <div className="mt-8 space-y-4 max-h-[420px] overflow-y-auto pr-2">

        {messages.map((message, index) => (

          <div
            key={index}
            className={`p-4 rounded-2xl ${
              message.sender === "user"
                ? "bg-zinc-950 border border-zinc-800"
                : "bg-green-500/10 border border-green-500/20"
            }`}
          >

            <p
              className={`text-sm font-semibold ${
                message.sender === "user"
                  ? "text-zinc-400"
                  : "text-green-400"
              }`}
            >

              {message.sender === "user"
                ? "User"
                : "AlphaMind AI"}

            </p>

            <p className="mt-2 text-zinc-200 leading-relaxed">
              {message.text}
            </p>

          </div>

        ))}

        {loading && (

          <div className="bg-green-500/10 border border-green-500/20 p-4 rounded-2xl text-green-400">

            AlphaMind AI is thinking...

          </div>

        )}

      </div>

      <div className="mt-6 flex flex-col gap-3 sm:flex-row">

        <input
          type="text"
          placeholder="Ask about any stock..."
          value={input}
          onChange={(e) =>
            setInput(e.target.value)
          }
          onKeyDown={(e) => {
            if (e.key === "Enter") {
              handleSend();
            }
          }}
          className="flex-1 bg-zinc-950 border border-zinc-800 rounded-2xl px-4 py-3 outline-none"
        />

        <button
          onClick={handleSend}
          className="rounded-2xl bg-green-500 px-6 py-3 font-bold transition hover:bg-green-600 sm:py-0"
        >

          Send

        </button>

      </div>

    </div>

  );

}