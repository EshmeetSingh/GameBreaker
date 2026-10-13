type ExchangeRateResponse = {
  rate: number;
};

export async function getUsdToInrRate(): Promise<number> {
  const response = await fetch(
    "https://api.frankfurter.dev/v2/rate/usd/inr",
  );

  if (!response.ok) {
    throw new Error("Failed to fetch USD to INR exchange rate.");
  }

  const data: ExchangeRateResponse = await response.json();

  return data.rate;
}