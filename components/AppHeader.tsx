"use client";

import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";

const PAGE_TITLES: Record<string, string> = {
  "/": "Генератор PDF Комерційних Пропозицій",
  "/invoices": "Рахунки",
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
    <header className="h-14 shrink-0 flex items-center justify-between gap-4 px-4 border-b border-border bg-background">
      <h1 className="text-lg font-medium tracking-tight truncate">
        {title}
      </h1>
      <div className="flex items-center gap-4 shrink-0 text-sm text-muted-foreground">
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
