import { addUnitIfNeeded, formatNumberWithSpaces } from "./pdf-utils";
import { parseRateDisclaimerLines } from "./rate-disclaimer";
import { getDefaultFinancingFormValues } from "./proposal-financing-defaults";
import { resolveSupplierForProposal } from "./proposal-supplier-defaults";
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
  /** Абзаци примітки про курс (для КП) */
  rate_disclaimer_lines: string[];
  supplier_company: string;
  supplier_edrpou: string;
  supplier_address_lines: string[];
  supplier_contact_phones: string[];
  supplier_show_address: boolean;
  supplier_show_contact: boolean;
  financing_title: string;
  financing_phone: string;
  financing_messenger: string;
  financing_cta: string;
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

  const currencyLabel = data.currency_code === "eur" ? "EUR" : "USD";
  const showCurrencyNonCash = data.show_currency_non_cash ?? false;
  const costMode = data.cost_mode ?? "calculator";

  let priceWithVat = data.price_with_vat ?? "";
  if (priceWithVat) {
    if (costMode === "calculator") {
      const n = Number.parseFloat(priceWithVat.replace(/\s/g, "").replace(",", "."));
      if (!Number.isNaN(n)) {
        const intPart = Math.round(n);
        const formatted = intPart.toLocaleString("uk-UA").replace(/\s/g, " ");
        priceWithVat = addUnitIfNeeded(`${formatted},00`, "грн");
      } else {
        priceWithVat = formatNumberWithSpaces(priceWithVat);
        priceWithVat = addUnitIfNeeded(priceWithVat, "грн");
      }
    } else {
      priceWithVat = formatNumberWithSpaces(priceWithVat);
      priceWithVat = addUnitIfNeeded(priceWithVat, "грн");
    }
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

  const supplier = resolveSupplierForProposal(data);
  const finDef = getDefaultFinancingFormValues();
  const financing_title =
    (data.financing_block_title ?? "").trim() || finDef.financing_block_title;
  const financing_phone =
    (data.financing_block_phone ?? "").trim() || finDef.financing_block_phone;
  const financing_messenger =
    (data.financing_block_messenger ?? "").trim() ||
    finDef.financing_block_messenger;
  const financing_cta =
    (data.financing_block_cta ?? "").trim() || finDef.financing_block_cta;

  let currencyNonCash = "";
  if (showCurrencyNonCash) {
    if (costMode === "manual") {
      const mn =
        Math.round(
          Number.parseFloat(
            String(data.currency_non_cash_manual ?? "").replace(",", ".")
          ) || 0
        );
      if (mn > 0) {
        currencyNonCash = formatNumberWithSpaces(String(mn)) + " " + currencyLabel;
      }
    } else {
      const cv =
        Number.parseFloat(String(data.currency_value ?? "").replace(",", ".")) || 0;
      const pct =
        Number.parseFloat(String(data.percent_base ?? "0").replace(",", ".")) || 0;
      const addSvc =
        Number.parseFloat(String(data.additional_services ?? "").replace(",", ".")) || 0;
      const rounded = Math.round(cv * (1 + pct / 100) + addSvc);
      if (rounded > 0) {
        currencyNonCash = formatNumberWithSpaces(String(rounded)) + " " + currencyLabel;
      }
    }
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
    rate_disclaimer_lines: parseRateDisclaimerLines(data.rate_disclaimer_text),
    supplier_company: supplier.supplier_company,
    supplier_edrpou: supplier.supplier_edrpou,
    supplier_address_lines: supplier.supplier_address_lines,
    supplier_contact_phones: supplier.supplier_contact_phones,
    supplier_show_address: supplier.supplier_show_address,
    supplier_show_contact: supplier.supplier_show_contact,
    financing_title,
    financing_phone,
    financing_messenger,
    financing_cta,
  };
}
