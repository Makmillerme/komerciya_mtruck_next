import { kmpFormEmptyValues, type KmpFormValues } from "@/lib/kmp-form";
import { KMP_PROPOSAL_HISTORY_NONE } from "@/lib/kmp-history-constants";

export const KMP_DRAFT_STORAGE_KEY = "kmp-draft-v1";

export type KmpDraftV1 = {
  v: 1;
  values: KmpFormValues;
  historyPick: string;
};

export function readKmpDraft(): KmpDraftV1 | null {
  if (typeof window === "undefined") return null;
  try {
    const raw = window.localStorage.getItem(KMP_DRAFT_STORAGE_KEY);
    if (!raw) return null;
    const data = JSON.parse(raw) as Partial<KmpDraftV1>;
    if (data?.v !== 1 || !data.values || typeof data.values !== "object") {
      return null;
    }
    const historyPick =
      typeof data.historyPick === "string"
        ? data.historyPick
        : KMP_PROPOSAL_HISTORY_NONE;
    return {
      v: 1,
      values: {
        ...kmpFormEmptyValues(),
        ...data.values,
        residualSum: 0,
        residualPercent: 0,
      },
      historyPick,
    };
  } catch {
    return null;
  }
}

export function writeKmpDraft(draft: KmpDraftV1): void {
  if (typeof window === "undefined") return;
  try {
    window.localStorage.setItem(KMP_DRAFT_STORAGE_KEY, JSON.stringify(draft));
  } catch {
    /* quota / private mode */
  }
}

