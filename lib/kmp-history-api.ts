import type {
  KmpHistoryEntry,
  KmpHistorySummary,
} from "@/lib/kmp-history-store";
import type { KmpFormValues } from "@/lib/kmp-form";

const API = "/api/kmp-history";

export async function fetchKmpHistory(): Promise<KmpHistoryEntry[]> {
  try {
    const r = await fetch(API);
    if (!r.ok) return [];
    const data = (await r.json()) as unknown;
    return Array.isArray(data) ? (data as KmpHistoryEntry[]) : [];
  } catch {
    return [];
  }
}

export async function saveKmpHistoryEntry(payload: {
  inputs: KmpFormValues;
  summary: KmpHistorySummary;
  sourceProposalHistoryId: string | null;
}): Promise<KmpHistoryEntry | null> {
  try {
    const r = await fetch(API, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    });
    if (!r.ok) return null;
    return (await r.json()) as KmpHistoryEntry;
  } catch {
    return null;
  }
}

export async function removeKmpHistoryEntry(id: string): Promise<boolean> {
  try {
    const r = await fetch(`${API}?id=${encodeURIComponent(id)}`, {
      method: "DELETE",
    });
    return r.ok;
  } catch {
    return false;
  }
}

