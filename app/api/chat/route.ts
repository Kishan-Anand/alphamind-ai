import Groq from "groq-sdk";

export async function POST(request: Request) {
  const apiKey = process.env.GROQ_API_KEY;
  if (!apiKey) {
    return Response.json(
      { answer: "The AI assistant is not configured. Set GROQ_API_KEY in .env.local." },
      { status: 503 }
    );
  }

  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return Response.json({ answer: "Request body must be valid JSON." }, { status: 400 });
  }

  const question =
    typeof body === "object" && body !== null && "question" in body
      ? body.question
      : undefined;
  if (typeof question !== "string" || !question.trim()) {
    return Response.json(
      { answer: "Enter a question for the AI assistant." },
      { status: 400 }
    );
  }

  try {
    const groq = new Groq({ apiKey });
    const completion = await groq.chat.completions.create({
      model: "openai/gpt-oss-20b",
      messages: [
        {
          role: "system",
          content:
            "You are AlphaMind AI, a stock market assistant. Answer in one or two short sentences, maximum 25 words total. Give only the key takeaway. Do not guarantee profit.",
        },
        {
          role: "user",
          content: question.trim(),
        },
      ],
      max_tokens: 300,
    });

    const answer = completion.choices[0]?.message?.content?.trim();
    const words = answer?.split(/\s+/) ?? [];
    const conciseAnswer =
      words.length > 25 ? `${words.slice(0, 25).join(" ")}…` : answer;

    return Response.json({
      answer: conciseAnswer || "AI could not answer right now.",
    });
  } catch (error: unknown) {
    console.error("AI assistant request failed:", error);
    return Response.json(
      { answer: "The AI assistant could not complete your request. Please try again shortly." },
      { status: 502 }
    );
  }
}