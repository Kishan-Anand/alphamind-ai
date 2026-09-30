export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);

  const symbol = searchParams.get("symbol") || "AAPL";
  const range = searchParams.get("range") || "1mo";

  let interval = "1d";

  if (range === "5d") {
    interval = "1h";
  }

  if (range === "1mo") {
    interval = "1d";
  }

  if (range === "6mo") {
    interval = "1d";
  }

  if (range === "1y") {
    interval = "1wk";
  }

  if (range === "5y") {
    interval = "1mo";
  }

  try {
    const response = await fetch(
      `https://query1.finance.yahoo.com/v8/finance/chart/${symbol}?range=${range}&interval=${interval}`
    );

    const data = await response.json();

    const result = data.chart?.result?.[0];

    if (!result) {
      return Response.json({
        symbol,
        range,
        prices: [],
      });
    }

    const timestamps = result.timestamp || [];
    const closes = result.indicators?.quote?.[0]?.close || [];

    const prices = timestamps
      .map((time: number, index: number) => {
        const price = closes[index];

        if (price === null || price === undefined) {
          return null;
        }

        return {
          time: new Date(time * 1000).toLocaleDateString(),
          price: Number(price.toFixed(2)),
        };
      })
      .filter(Boolean);

    return Response.json({
      symbol,
      range,
      prices,
    });
  } catch {
    return Response.json({
      symbol,
      range,
      prices: [],
    });
  }
}