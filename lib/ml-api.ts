export type StockPrediction = {
  symbol: string;
  prediction: "UP" | "DOWN";
  confidence: number;
  model_accuracy: number;
};

const configuredApiBaseUrl = process.env.NEXT_PUBLIC_ML_API_URL?.replace(
  /\/+$/,
  ""
);

function getApiUrl(path: string): string {
  if (configuredApiBaseUrl) {
    return `${configuredApiBaseUrl}${path}`;
  }

  if (process.env.NODE_ENV === "production") {
    return path;
  }

  const localBackendUrl =
    typeof window === "undefined"
      ? "http://localhost:8000"
      : `${window.location.protocol}//${window.location.hostname}:8000`;

  return `${localBackendUrl}${path}`;
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null;
}

function parsePrediction(value: unknown): StockPrediction {
  if (
    !isRecord(value) ||
    typeof value.symbol !== "string" ||
    (value.prediction !== "UP" && value.prediction !== "DOWN") ||
    typeof value.confidence !== "number" ||
    !Number.isFinite(value.confidence) ||
    value.confidence < 0 ||
    value.confidence > 100 ||
    typeof value.model_accuracy !== "number" ||
    !Number.isFinite(value.model_accuracy) ||
    value.model_accuracy < 0 ||
    value.model_accuracy > 100
  ) {
    throw new Error("The ML backend returned an invalid prediction response.");
  }

  return {
    symbol: value.symbol,
    prediction: value.prediction,
    confidence: value.confidence,
    model_accuracy: value.model_accuracy,
  };
}

async function getJson(path: string): Promise<unknown> {
  const response = await fetch(getApiUrl(path));
  let body: unknown;

  try {
    body = await response.json();
  } catch {
    throw new Error(`The ML backend returned an invalid response (${response.status}).`);
  }

  if (!response.ok) {
    const detail =
      isRecord(body) && typeof body.detail === "string"
        ? body.detail
        : `ML request failed (${response.status}).`;
    throw new Error(detail);
  }

  return body;
}

export async function fetchStockPrediction(
  symbol: string
): Promise<StockPrediction> {
  const result = await getJson(`/predict/${encodeURIComponent(symbol)}`);
  return parsePrediction(result);
}

export async function fetchTopPicks(): Promise<StockPrediction[]> {
  const result = await getJson("/top-picks");
  if (!Array.isArray(result)) {
    throw new Error("The ML backend returned an invalid top-picks response.");
  }
  return result.map(parsePrediction);
}
