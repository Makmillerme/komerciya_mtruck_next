import type { FormattedProposalData } from "./format-proposal-data";

/** Ключі та підписи для основних характеристик (марка/модель — у шапці; технічний стан — окремим рядком під сіткою) */
export const MAIN_SPEC_KEYS: [keyof FormattedProposalData, string][] = [
  ["body_type", "Тип кузова"],
  ["vin", "VIN"],
  ["year", "Рік виготовлення"],
  ["mileage", "Пробіг"],
  ["color", "Колір"],
  ["country", "Країна виробник"],
];

/** Ключі та підписи для технічних характеристик (тип кузова перенесено в основні) */
export const TECH_SPEC_KEYS: [keyof FormattedProposalData, string][] = [
  ["wheel_formula", "Колісна формула"],
  ["engine_type", "Двигун"],
  ["engine_volume", "Об'єм двигуна"],
  ["power", "Потужність"],
  ["gearbox", "КПП"],
  ["seats", "Кількість місць"],
];

export function getMainSpecItems(data: FormattedProposalData): [string, string][] {
  return MAIN_SPEC_KEYS.map(([key, label]) => [label, String(data[key] ?? "")]);
}

export function getTechSpecItems(data: FormattedProposalData): [string, string][] {
  return TECH_SPEC_KEYS.map(([key, label]) => [label, String(data[key] ?? "")]);
}
