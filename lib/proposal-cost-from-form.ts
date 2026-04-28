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
function toMoney2(value: number): string {
  return value.toFixed(2);
}

function toMoney2WithoutRounding(value: number): string {
  const sign = value < 0 ? "-" : "";
  const abs = Math.abs(value);
  const cents = Math.trunc(abs * 100);
  const integerPart = Math.trunc(cents / 100);
  const fractionalPart = String(cents % 100).padStart(2, "0");
  return `${sign}${integerPart}.${fractionalPart}`;
}

function roundToIntegerByFirstDecimalDigit(value: number): number {
  const sign = value < 0 ? -1 : 1;
  const abs = Math.abs(value);
  const intPart = Math.trunc(abs);
  const firstDecimalDigit = Math.trunc((abs - intPart) * 10);
  const roundedAbs = firstDecimalDigit >= 4 ? intPart + 1 : intPart;
  return roundedAbs * sign;
}

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

  const grossRaw = roundedNonCash * sellRate;
  const has = sellRate > 0 && roundedNonCash > 0;

  // Округлюємо лише суму з ПДВ до гривні за правилом: 0-3 вниз, 4-9 вгору.
  const gross = has ? roundToIntegerByFirstDecimalDigit(grossRaw) : 0;

  // Рахуємо у копійках, щоб сума `без ПДВ + ПДВ` завжди точно дорівнювала `з ПДВ`.
  const grossCents = gross * 100;
  const netCents = has ? Math.trunc(grossCents / 1.2) : 0;
  const vatCents = has ? grossCents - netCents : 0;

  const net = netCents / 100;
  const vat = vatCents / 100;

  const priceWithVat = has ? toMoney2(gross) : "";
  const priceWithoutVat = has ? toMoney2WithoutRounding(net) : "";
  const vatString = has ? toMoney2WithoutRounding(vat) : "";

  return {
    roundedNonCash,
    sellRate,
    priceWithVatRounded: has ? Number.parseFloat(priceWithVat) : 0,
    priceWithoutVatRounded: has ? Number.parseFloat(priceWithoutVat) : 0,
    vatRounded: has ? Number.parseFloat(vatString) : 0,
    priceWithVat,
    priceWithoutVat,
    vat: vatString,
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
