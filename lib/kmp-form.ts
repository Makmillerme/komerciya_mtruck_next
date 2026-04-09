import { z } from "zod";

export function round2(n: number): number {
  return Math.round(n * 100) / 100;
}

export const kmpFormSchema = z
  .object({
    /** Марка / модель (для пошуку в історії КМП). */
    identityModel: z.string().default(""),
    /** VIN (для пошуку). */
    identityVin: z.string().default(""),
    /** Контрагент (для пошуку). */
    identityContractor: z.string().default(""),
    vehiclePriceUah: z.coerce.number().finite(),
    downPaymentPercent: z.coerce.number().finite(),
    downPaymentSum: z.coerce.number().finite(),
    residualPercent: z.coerce.number().finite(),
    residualSum: z.coerce.number().finite(),
    feePercent: z.coerce.number().finite(),
    termMonths: z.coerce.number().finite(),
    annualRatePercent: z.coerce.number().finite(),
    mode: z.enum(["annuity", "differentiated"]),
    showVatBreakdown: z.boolean().default(true),
  })
  .superRefine((data, ctx) => {
    const price = Math.round(data.vehiclePriceUah);
    if (!Number.isFinite(price) || price <= 0) {
      ctx.addIssue({
        code: "custom",
        message: "Вкажіть вартість ТЗ у грн (ціле число)",
        path: ["vehiclePriceUah"],
      });
      return;
    }
    if (data.downPaymentPercent < 0 || data.downPaymentPercent > 100) {
      ctx.addIssue({
        code: "custom",
        message: "Аванс 0–100%",
        path: ["downPaymentPercent"],
      });
    }
    if (data.residualPercent < 0 || data.residualPercent > 100) {
      ctx.addIssue({
        code: "custom",
        message: "Залишок 0–100%",
        path: ["residualPercent"],
      });
    }
    if (data.feePercent < 0 || data.feePercent > 100) {
      ctx.addIssue({
        code: "custom",
        message: "Комісія 0–100%",
        path: ["feePercent"],
      });
    }
    const term = Math.floor(data.termMonths);
    if (!Number.isFinite(term) || term < 1) {
      ctx.addIssue({
        code: "custom",
        message: "Строк від 1 міс.",
        path: ["termMonths"],
      });
    }
    if (data.annualRatePercent < 0 || data.annualRatePercent > 500) {
      ctx.addIssue({
        code: "custom",
        message: "Номінальна річна ставка ≥ 0%",
        path: ["annualRatePercent"],
      });
    }
    const advanceSum = round2(Math.max(0, data.downPaymentSum));
    const residualSum = round2(Math.max(0, data.residualSum));
    if (advanceSum + residualSum >= price - 0.005) {
      ctx.addIssue({
        code: "custom",
        message: "Аванс + залишок мають бути менші за вартість",
        path: ["downPaymentSum"],
      });
    }
    const creditBody = round2(price - advanceSum - residualSum);
    if (creditBody <= 0) {
      ctx.addIssue({
        code: "custom",
        message:
          "Сума до амортизації (після авансу та залишку) має бути додатною",
        path: ["residualSum"],
      });
    }
  });

export type KmpFormValues = z.infer<typeof kmpFormSchema>;

/** Початкові значення форми КМП (мердж з чернеткою / історією). */
export const kmpFormEmptyValues = (): KmpFormValues => ({
  identityModel: "",
  identityVin: "",
  identityContractor: "",
  vehiclePriceUah: 0,
  downPaymentPercent: 20,
  downPaymentSum: 0,
  residualPercent: 0,
  residualSum: 0,
  feePercent: 0,
  termMonths: 36,
  annualRatePercent: 18,
  mode: "annuity",
  showVatBreakdown: true,
});

