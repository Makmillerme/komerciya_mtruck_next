import type { ProposalFormData } from "@/lib/schema";

/** Як у відповіді GET `/api/currency`. */
export type CurrencyRatesSnapshot = {
  usd: { buy: string; sell: string };
  eur: { buy: string; sell: string };
};

/** Округлена валютна безготівкова (ціле число в USD/EUR), як у формі КП. */
export function computeRoundedNonCashFx(data: Partial<ProposalFormData>): number {
  const costMode = data.cost_mode ?? "calculator";
  if (costMode === "manual") {
    return Math.round(
      Number.parseFloat(String(data.currency_non_cash_manual ?? "").replace(",", ".")) || 0
    );
  }
  const cv = Number.parseFloat(String(data.currency_value ?? "").replace(",", ".")) || 0;
  const pct = Number.parseFloat(String(data.percent_base ?? "0").replace(",", ".")) || 0;
  const addSvc = Number.parseFloat(String(data.additional_services ?? "").replace(",", ".")) || 0;
  return Math.round(cv * (1 + pct / 100) + addSvc);
}

/**
 * Розрахунок грн-полів у режимі «калькулятор», як у `ProposalForm` (курс продажу, ПДВ 20% у складі суми з ПДВ).
 * У ручному режимі повертає нулі та порожні рядки — автозаповнення не застосовується.
 */
export function computeProposalCalculatorUahFields(
  data: Partial<ProposalFormData>,
  rates: CurrencyRatesSnapshot | null
): {
  roundedNonCash: number;
  sellRate: number;
  priceWithVatRounded: number;
  priceWithoutVatRounded: number;
  vatRounded: number;
  priceWithVat: string;
  priceWithoutVat: string;
  vat: string;
} {
  if ((data.cost_mode ?? "calculator") !== "calculator") {
    return {
      roundedNonCash: 0,
      sellRate: 0,
      priceWithVatRounded: 0,
      priceWithoutVatRounded: 0,
      vatRounded: 0,
      priceWithVat: "",
      priceWithoutVat: "",
      vat: "",
    };
  }
  const cv = Number.parseFloat(String(data.currency_value ?? "").replace(",", ".")) || 0;
  const pct = Number.parseFloat(String(data.percent_base ?? "0").replace(",", ".")) || 0;
  const addSvc = Number.parseFloat(String(data.additional_services ?? "").replace(",", ".")) || 0;
  const code = (data.currency_code ?? "usd") as "usd" | "eur";
  const roundedNonCash = Math.round(cv * (1 + pct / 100) + addSvc);
  const sellStr = rates?.[code]?.sell ?? "";
  const sellRate = Number.parseFloat(sellStr.replace(",", ".")) || 0;
  const priceWithVatUahRaw = roundedNonCash * sellRate;
  const priceWithVatRounded = Math.round(priceWithVatUahRaw);
  const vatUah = priceWithVatRounded * 0.2;
  const priceWithoutVatUah = priceWithVatRounded - vatUah;
  const has = sellRate > 0 && roundedNonCash > 0;
  return {
    roundedNonCash,
    sellRate,
    priceWithVatRounded,
    priceWithoutVatRounded: priceWithoutVatUah,
    vatRounded: vatUah,
    priceWithVat: has ? priceWithVatRounded.toFixed(2) : "",
    priceWithoutVat: has ? priceWithoutVatUah.toFixed(2) : "",
    vat: has ? vatUah.toFixed(2) : "",
  };
}

/** Вартість з ПДВ у грн для КМП / імпорту з КП (число). */
export function getProposalPriceWithVatUahNumber(
  data: Partial<ProposalFormData>,
  rates: CurrencyRatesSnapshot | null
): number {
  const mode = data.cost_mode ?? "calculator";
  if (mode === "calculator") {
    return computeProposalCalculatorUahFields(data, rates).priceWithVatRounded;
  }
  const raw = String(data.price_with_vat ?? "").replace(/\s/g, "").replace(",", ".");
  const n = Number.parseFloat(raw);
  return Number.isFinite(n) ? Math.round(n) : 0;
}
