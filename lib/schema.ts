import { z } from "zod";
import {
  ENGINE_TYPE_OPTIONS,
  GEARBOX_OPTIONS,
  WHEEL_FORMULA_OPTIONS,
} from "./proposal-select-options";

const requiredString = z.string().min(1, "Обов'язкове поле");

const wheelFormulaZ = z.enum(
  WHEEL_FORMULA_OPTIONS as unknown as [string, ...string[]]
);
const engineTypeZ = z.enum(
  ENGINE_TYPE_OPTIONS as unknown as [string, ...string[]]
);
const gearboxZ = z.enum(
  GEARBOX_OPTIONS as unknown as [string, ...string[]]
);

export const proposalSchema = z
  .object({
  model: requiredString,
  vin: requiredString,
  year: requiredString,
  mileage: requiredString,
  color: requiredString,
  country: requiredString,
  body_type: requiredString,
  wheel_formula: wheelFormulaZ,
  engine_type: engineTypeZ,
  engine_volume: requiredString,
  power: requiredString,
  gearbox: gearboxZ,
  seats: requiredString,
  technical_state: requiredString,
  /** Примітка під блоком вартості в КП; порожньо — заводський текст з rate-disclaimer */
  rate_disclaimer_text: z.string(),
  /** Блок «Фінансування / консультація» на стор. 2 КП. */
  financing_block_title: z.string(),
  financing_block_phone: z.string(),
  financing_block_messenger: z.string(),
  financing_block_cta: z.string(),
  /**
   * URL для QR; порожньо — статичний `img/qr/qrcode.webp`.
   * Заводське значення — `DEFAULT_FINANCING_BLOCK_QR_URL` у proposal-financing-defaults.
   */
  financing_block_qr_url: z
    .string()
    .max(2048, "Не довше 2048 символів")
    .refine(
      (s) => {
        const t = s.trim();
        if (!t) return true;
        try {
          new URL(t);
          return true;
        } catch {
          return false;
        }
      },
      { message: "Некоректне посилання для QR" }
    ),
  supplier_company: requiredString,
  supplier_edrpou: requiredString,
  /** Адреса постачальника: частини опційні; порожні не потрапляють у КП. */
  supplier_postal_code: z.string(),
  supplier_region: z.string(),
  supplier_city: z.string(),
  supplier_street: z.string(),
  /** До 2 номерів; блок контактів у КП лише якщо є хоча б один. */
  supplier_phone_primary: z.string(),
  supplier_phone_secondary: z.string(),
  /** 1 — калькулятор (поточна логіка), 2 — повністю вручну */
  cost_mode: z.enum(["calculator", "manual"]),
  currency_value: z.string(),
  percent_base: z.string(),
  additional_services: z.string(),
  /** У режимі «вручну»: валютна безготівкова (ціле число у валюті КП) */
  currency_non_cash_manual: z.string(),
  currency_code: z.enum(["usd", "eur"]),
  show_currency_non_cash: z.boolean(),
  /** У шаблоні 1 заповнює калькулятор; обов'язковість лише для шаблону 2 — у superRefine */
  price_with_vat: z.string(),
  price_without_vat: z.string(),
  vat: z.string(),
})
  .superRefine((data, ctx) => {
    if (data.cost_mode !== "manual") return;
    const n = Math.round(
      Number.parseFloat(String(data.currency_non_cash_manual ?? "").replace(",", ".")) || 0
    );
    if (n <= 0) {
      ctx.addIssue({
        code: "custom",
        message: "Вкажіть валютну безготівкову вартість (ціле число)",
        path: ["currency_non_cash_manual"],
      });
    }
    const req = "Обов'язкове поле";
    if (!data.price_with_vat?.trim()) {
      ctx.addIssue({ code: "custom", message: req, path: ["price_with_vat"] });
    }
    if (!data.vat?.trim()) {
      ctx.addIssue({ code: "custom", message: req, path: ["vat"] });
    }
    if (!data.price_without_vat?.trim()) {
      ctx.addIssue({ code: "custom", message: req, path: ["price_without_vat"] });
    }
  })
  .superRefine((data, ctx) => {
    const maxPhone = 32;
    if ((data.supplier_phone_primary?.length ?? 0) > maxPhone) {
      ctx.addIssue({
        code: "custom",
        message: `Не довше ${maxPhone} символів`,
        path: ["supplier_phone_primary"],
      });
    }
    if ((data.supplier_phone_secondary?.length ?? 0) > maxPhone) {
      ctx.addIssue({
        code: "custom",
        message: `Не довше ${maxPhone} символів`,
        path: ["supplier_phone_secondary"],
      });
    }
  });

export type ProposalFormData = z.infer<typeof proposalSchema>;