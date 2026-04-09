import type { CurrencyRatesSnapshot } from "@/lib/proposal-cost-from-form";
import { getProposalPriceWithVatUahNumber } from "@/lib/proposal-cost-from-form";
import type { ProposalFormData } from "@/lib/schema";
import type { ProposalHistoryEntry } from "@/lib/proposal-history";

export type KmpSeedFromProposal = {
  vehicleLabel: string;
  model: string;
  year: string;
  vin: string;
  /** Вартість з ПДВ, грн (ціле) — для поля калькулятора. */
  vehiclePriceUah: number;
  /** Є розрахунок у грн (курс або ручні поля). */
  hasPrice: boolean;
};

function buildLabel(model: string, year: string, vin: string): string {
  const parts = [model?.trim(), year?.trim()].filter(Boolean).join(", ");
  const vinPart = vin?.trim() ? ` · ${vin.trim()}` : "";
  return (parts + vinPart).trim() || "—";
}

export function mapProposalHistoryToKmpSeed(
  entry: ProposalHistoryEntry,
  rates: CurrencyRatesSnapshot | null
): KmpSeedFromProposal {
  const fd = entry.formData as Partial<ProposalFormData>;
  const model = fd.model ?? "";
  const year = fd.year ?? "";
  const vin = fd.vin ?? "";
  const vehiclePriceUah = getProposalPriceWithVatUahNumber(fd, rates);
  const hasPrice = vehiclePriceUah > 0;
  return {
    vehicleLabel: buildLabel(model, year, vin),
    model,
    year,
    vin,
    vehiclePriceUah,
    hasPrice,
  };
}
