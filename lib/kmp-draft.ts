import type { KmpFormValues } from "@/lib/kmp-form";

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
    const data = JSON.parse(raw) as KmpDraftV1;
    if (data?.v !== 1 || !data.values || typeof data.historyPick !== "string")
      return null;
    return {
      v: 1,
      values: data.values,
      historyPick: data.historyPick,
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

