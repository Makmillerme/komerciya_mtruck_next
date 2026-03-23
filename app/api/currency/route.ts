import { NextResponse } from "next/server";

const MINFIN_URL = "https://minfin.com.ua/ua/currency/lutsk/";
const CACHE_MS = 60 * 60 * 1000; // 1 година

let cached:
  | { usd: { buy: string; sell: string }; eur: { buy: string; sell: string }; updatedAt: string }
  | null = null;
let cachedAt = 0;

function parseRates(html: string): {
  usd: { buy: string; sell: string };
  eur: { buy: string; sell: string };
} | null {
  const block = html.indexOf("Середній курс в банках");
  if (block === -1) return null;
  const slice = html.slice(block, block + 4000);
  const ratePattern = /(\d{2},\d{4})/g;
  const matches = [...slice.matchAll(ratePattern)];
  if (matches.length < 6) return null;
  return {
    usd: { buy: matches[0][1], sell: matches[1][1] },
    eur: { buy: matches[3][1], sell: matches[4][1] },
  };
}

export async function GET() {
  const now = Date.now();
  if (cached && now - cachedAt < CACHE_MS) {
    return NextResponse.json(cached, {
      headers: {
        "Cache-Control": "public, s-maxage=1800, stale-while-revalidate=3600",
      },
    });
  }
  try {
    const res = await fetch(MINFIN_URL, {
      headers: {
        "User-Agent":
          "Mozilla/5.0 (compatible; M-Truck/1.0; +https://mtruck.ua)",
      },
      next: { revalidate: 3600 },
    });
    const html = await res.text();
    const rates = parseRates(html);
    if (!rates) {
      if (cached) return NextResponse.json(cached);
      return NextResponse.json(
        { error: "Не вдалося отримати курси", usd: { buy: "—", sell: "—" }, eur: { buy: "—", sell: "—" }, updatedAt: "" },
        { status: 502 }
      );
    }
    const updatedAt = new Date().toISOString();
    cached = { ...rates, updatedAt };
    cachedAt = now;
    return NextResponse.json(cached, {
      headers: {
        "Cache-Control": "public, s-maxage=1800, stale-while-revalidate=3600",
      },
    });
  } catch (e) {
    if (cached) return NextResponse.json(cached);
    return NextResponse.json(
      { error: "Помилка завантаження", usd: { buy: "—", sell: "—" }, eur: { buy: "—", sell: "—" }, updatedAt: "" },
      { status: 500 }
    );
  }
}
