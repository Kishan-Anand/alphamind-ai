export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const symbol = searchParams.get("symbol");

  if (!symbol) {
    return Response.json(
      { error: "Symbol is required" },
      { status: 400 }
    );
  }

  const apiKey = process.env.FINNHUB_API_KEY;

  try {
    const finnhubResponse = await fetch(
      `https://finnhub.io/api/v1/quote?symbol=${symbol}&token=${apiKey}`
    );

    const finnhubData = await finnhubResponse.json();

    if (finnhubData.c && finnhubData.c > 0) {
      return Response.json({
        symbol,
        currentPrice: finnhubData.c,
        change: finnhubData.d,
        percentChange: finnhubData.dp,
        high: finnhubData.h,
        low: finnhubData.l,
        open: finnhubData.o,
        previousClose: finnhubData.pc,
        source: "Finnhub Live",
      });
    }

    const yahooResponse = await fetch(
      `https://query1.finance.yahoo.com/v8/finance/chart/${symbol}?range=5d&interval=1d`
    );

    const yahooData = await yahooResponse.json();

    const result = yahooData.chart?.result?.[0];

    if (!result) {
      return Response.json({
        symbol,
        currentPrice: null,
        percentChange: null,
        source: "Unavailable",
      });
    }

    const closes = result.indicators?.quote?.[0]?.close || [];

    const validCloses = closes.filter(
      (price: number | null) => price !== null
    );

    const lastClose = validCloses[validCloses.length - 1];
    const previousClose = validCloses[validCloses.length - 2];

    const change =
      lastClose && previousClose
        ? lastClose - previousClose
        : 0;

    const percentChange =
      lastClose && previousClose
        ? (change / previousClose) * 100
        : 0;

    return Response.json({
      symbol,
      currentPrice: lastClose,
      change,
      percentChange,
      high: null,
      low: null,
      open: null,
      previousClose,
      source: "Yahoo Last Available",
    });
  } catch {
    return Response.json(
      {
        symbol,
        error: "Failed to fetch stock data",
      },
      { status: 500 }
    );
  }
}