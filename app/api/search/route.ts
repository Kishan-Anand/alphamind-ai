export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const query = searchParams.get("q");

  if (!query) {
    return Response.json({ result: [] });
  }

  const apiKey = process.env.FINNHUB_API_KEY;

  const response = await fetch(
    `https://finnhub.io/api/v1/search?q=${query}&token=${apiKey}`
  );

  const data = await response.json();

  return Response.json(data);
}