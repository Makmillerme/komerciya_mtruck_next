"use client";

import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";

const PAGE_TITLES: Record<string, string> = {
  "/": "Генератор PDF Комерційних Пропозицій",
  "/kmp": "КМП — Калькулятор місячних платежів",
};

interface CurrencyRates {
  usd: { buy: string; sell: string };
  eur: { buy: string; sell: string };
  updatedAt: string;
}

export function AppHeader() {
  const pathname = usePathname();
  const title = PAGE_TITLES[pathname ?? "/"] ?? "M-Truck";
  const [rates, setRates] = useState<CurrencyRates | null>(null);

  useEffect(() => {
    let cancelled = false;
    fetch("/api/currency")
      .then((r) => r.json())
      .then((data) => {
        if (!cancelled && data.usd) setRates(data);
      })
      .catch(() => {});
    return () => {
      cancelled = true;
    };
  }, []);

  return (
    <header className="flex min-h-14 shrink-0 flex-col gap-2 border-b border-border bg-background px-3 py-2 sm:h-14 sm:flex-row sm:items-center sm:justify-between sm:gap-4 sm:px-4 sm:py-0">
      <h1 className="text-base font-medium tracking-tight sm:text-lg min-w-0 leading-snug sm:truncate">
        {title}
      </h1>
      <div className="flex flex-shrink-0 flex-wrap items-center gap-x-4 gap-y-1 text-xs text-muted-foreground sm:text-sm">
        {rates ? (
          <>
            <span title="Долар США (купівля / продаж)">
              USD: <strong className="text-foreground">{rates.usd.buy}</strong> / {rates.usd.sell}
            </span>
            <span title="Євро (купівля / продаж)">
              EUR: <strong className="text-foreground">{rates.eur.buy}</strong> / {rates.eur.sell}
            </span>
            {rates.updatedAt && (
              <span className="hidden sm:inline text-xs">
                Оновлено {new Date(rates.updatedAt).toLocaleTimeString("uk-UA", { hour: "2-digit", minute: "2-digit" })}
              </span>
            )}
          </>
        ) : (
          <span className="text-xs">Курси валют завантажуються…</span>
        )}
      </div>
    </header>
  );
}
