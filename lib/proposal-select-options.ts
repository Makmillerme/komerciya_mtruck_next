/**
 * Допустимі значення для випадаючих списків форми КП (колісна формула, тип двигуна, КПП).
 */

export const WHEEL_FORMULA_OPTIONS = [
  "4x2",
  "4x4",
  "6x2",
  "6x2/4",
  "6x4",
  "6x6",
  "8x2",
  "8x4",
  "8x6",
  "8x8",
  "10x4",
  "10x6",
  "10x8",
] as const;

export type WheelFormula = (typeof WHEEL_FORMULA_OPTIONS)[number];

export const ENGINE_TYPE_OPTIONS = [
  "Дизель",
  "Бензин",
  "Газ (CNG/LPG)",
  "Гібрид",
  "Електро",
] as const;

export type EngineTypeOption = (typeof ENGINE_TYPE_OPTIONS)[number];

export const GEARBOX_OPTIONS = [
  "Механічна",
  "Автоматична",
  "Роботизована (AMT)",
  "Преселективна",
  "Гідромеханічна",
  "Двоступенева",
] as const;

export type GearboxOption = (typeof GEARBOX_OPTIONS)[number];

function pickFrom<T extends readonly string[]>(
  options: T,
  raw: string | undefined
): T[number] {
  if (raw != null && (options as readonly string[]).includes(raw)) {
    return raw as T[number];
  }
  return options[0];
}


export function coerceWheelFormula(raw: string | undefined): WheelFormula {
  return pickFrom(WHEEL_FORMULA_OPTIONS, raw);
}

export function coerceEngineTypeOption(raw: string | undefined): EngineTypeOption {
  return pickFrom(ENGINE_TYPE_OPTIONS, raw);
}

export function coerceGearboxOption(raw: string | undefined): GearboxOption {
  return pickFrom(GEARBOX_OPTIONS, raw);
}
