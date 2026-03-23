import { addUnitIfNeeded, formatNumberWithSpaces } from "./pdf-utils";
import type { ProposalFormData } from "./schema";

export interface FormattedProposalData {
  model: string;
  vin: string;
  year: string;
  mileage: string;
  color: string;
  country: string;
  technical_state: string;
  body_type: string;
  wheel_formula: string;
  engine_type: string;
  engine_volume: string;
  power: string;
  gearbox: string;
  seats: string;
  price_with_vat: string;
  price_without_vat: string;
  vat: string;
  currency_non_cash: string;
  show_currency_non_cash: boolean;
  currency_label: string;
}

export function formatProposalData(data: Partial<ProposalFormData>): FormattedProposalData {
  let mileage = data.mileage ?? "";
  if (mileage) {
    mileage = addUnitIfNeeded(mileage, "км");
    mileage = formatNumberWithSpaces(mileage.replace(" км", "")) + " км";
  }

  let engineVolume = data.engine_volume ?? "";
  if (engineVolume) engineVolume = addUnitIfNeeded(engineVolume, "л");

  let power = data.power ?? "";
  if (power) power = addUnitIfNeeded(power, "кВт");

  let seats = data.seats ?? "";
  if (seats) seats = addUnitIfNeeded(seats, "місця");

  let priceWithVat = data.price_with_vat ?? "";
  if (priceWithVat) {
    priceWithVat = formatNumberWithSpaces(priceWithVat);
    priceWithVat = addUnitIfNeeded(priceWithVat, "грн");
  }

  let priceWithoutVat = data.price_without_vat ?? "";
  if (priceWithoutVat) {
    priceWithoutVat = formatNumberWithSpaces(priceWithoutVat);
    priceWithoutVat = addUnitIfNeeded(priceWithoutVat, "грн");
  }

  let vat = data.vat ?? "";
  if (vat) {
    vat = formatNumberWithSpaces(vat);
    vat = addUnitIfNeeded(vat, "грн");
  }

  const currencyLabel = (data.currency_code === "eur" ? "EUR" : "USD");
  const showCurrencyNonCash = data.show_currency_non_cash ?? true;
  const cv = Number.parseFloat(String(data.currency_value ?? "").replace(",", ".")) || 0;
  const pct = Number.parseFloat(String(data.percent_base ?? "0").replace(",", ".")) || 0;
  const addSvc = Number.parseFloat(String(data.additional_services ?? "").replace(",", ".")) || 0;
  const currencyNonCashNum = cv * (1 + pct / 100) + addSvc;
  let currencyNonCash = "";
  if (showCurrencyNonCash && currencyNonCashNum > 0) {
    currencyNonCash = formatNumberWithSpaces(currencyNonCashNum.toFixed(2)) + " " + currencyLabel;
  }

  return {
    model: data.model ?? "",
    vin: data.vin ?? "",
    year: data.year ?? "",
    mileage,
    color: data.color ?? "",
    country: data.country ?? "",
    technical_state: data.technical_state ?? "",
    body_type: data.body_type ?? "",
    wheel_formula: data.wheel_formula ?? "",
    engine_type: data.engine_type ?? "",
    engine_volume: engineVolume,
    power,
    gearbox: data.gearbox ?? "",
    seats,
    price_with_vat: priceWithVat,
    price_without_vat: priceWithoutVat,
    vat,
    currency_non_cash: currencyNonCash,
    show_currency_non_cash: showCurrencyNonCash,
    currency_label: currencyLabel,
  };
}
