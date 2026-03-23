import { z } from "zod";

const requiredString = z.string().min(1, "Обов'язкове поле");

export const proposalSchema = z.object({
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
  currency_value: z.string(),
  percent_base: z.string(),
  additional_services: z.string(),
  currency_code: z.enum(["usd", "eur"]),
  show_currency_non_cash: z.boolean(),
  price_with_vat: requiredString,
  price_without_vat: requiredString,
  vat: requiredString,
});

export type ProposalFormData = z.infer<typeof proposalSchema>;