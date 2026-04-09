import type { CurrencyRatesSnapshot } from "@/lib/proposal-cost-from-form";

export type CurrencyApiResponse = CurrencyRatesSnapshot & {
  updatedAt?: string;
};

export function parseCurrencyApiPayload(data: unknown): CurrencyApiResponse | null {
  if (!data || typeof data !== "object") return null;
  const o = data as Record<string, unknown>;
  const usd = o.usd;
  const eur = o.eur;
  if (!usd || !eur || typeof usd !== "object" || typeof eur !== "object")
    return null;
  const u = usd as Record<string, unknown>;
  const e = eur as Record<string, unknown>;
  if (typeof u.buy !== "string" || typeof u.sell !== "string") return null;
  if (typeof e.buy !== "string" || typeof e.sell !== "string") return null;
  return {
    usd: { buy: u.buy, sell: u.sell },
    eur: { buy: e.buy, sell: e.sell },
    updatedAt: typeof o.updatedAt === "string" ? o.updatedAt : undefined,
  };
}

export async function fetchCurrencyRates(): Promise<CurrencyApiResponse | null> {
  try {
    const r = await fetch("/api/currency");
    if (!r.ok) return null;
    const json = (await r.json()) as unknown;
    return parseCurrencyApiPayload(json);
  } catch {
    return null;
  }
}

