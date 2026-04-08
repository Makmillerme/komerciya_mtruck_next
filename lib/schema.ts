import { z } from "zod";

const requiredString = z.string().min(1, "Обов'язкове поле");

export const proposalSchema = z
  .object({
  model: requiredString,
  vin: requiredString,
  year: requiredString,
  mileage: requiredString,
  color: requiredString,
  country: requiredString,
  body_type: requiredString,
  wheel_formula: requiredString,
  engine_type: requiredString,
  engine_volume: requiredString,
  power: requiredString,
  gearbox: requiredString,
  seats: requiredString,
  technical_state: requiredString,
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
  });

export type ProposalFormData = z.infer<typeof proposalSchema>;