import type { KmpFormValues } from "@/lib/kmp-form";
import type { KmpHistorySummary } from "@/lib/kmp-history-store";

/**
 * Стійкий відбиток стану для автозбереження історії КМП без дублікатів при незмінних даних.
 */
export function kmpHistoryAutoSaveFingerprint(
  inputs: KmpFormValues,
  summary: KmpHistorySummary,
  sourceProposalHistoryId: string | null
): string {
  const s = summary;
  return JSON.stringify({
    inputs,
    summary: {
      creditBody: s.creditBody,
      totalInterest: s.totalInterest,
      totalPaymentSum: s.totalPaymentSum,
      oneTimeFee: s.oneTimeFee,
      monthlyPaymentDisplay: s.monthlyPaymentDisplay,
      interestPercentOfPrice: s.interestPercentOfPrice,
      mode: s.mode,
    },
    sourceProposalHistoryId,
  });
}

