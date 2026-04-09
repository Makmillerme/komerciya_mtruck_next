import type { KmpHistoryEntry } from "@/lib/kmp-history-store";
import type { KmpPaymentMode } from "@/lib/kmp-loan";

/** Підписи режиму як у тригері Select КМП. */
export const KMP_MODE_LABELS_LONG: Record<KmpPaymentMode, string> = {
  annuity: "Ануїтет (рівні)",
  differentiated: "Стандарт (рівне тіло)",
};

export function formatKmpHistoryDate(iso: string): string {
  const d = new Date(iso);
  return Number.isFinite(d.getTime())
    ? d.toLocaleString("uk-UA", {
        year: "numeric",
        month: "2-digit",
        day: "2-digit",
        hour: "2-digit",
        minute: "2-digit",
      })
    : iso;
}

export function kmpSavedEntryLabel(entry: KmpHistoryEntry): string {
  const dateStr = formatKmpHistoryDate(entry.date);
  const mode =
    entry.summary.mode === "annuity" ? "Ануїтет" : "Стандарт";
  const src = entry.sourceProposalHistoryId ? " · з КП" : "";
  return `${dateStr} · ${mode}${src}`;
}

function kmpEntryIdentityHaystack(e: KmpHistoryEntry): string {
  const i = e.inputs;
  const model = (i.identityModel ?? "").trim();
  const vin = (i.identityVin ?? "").trim();
  const contractor = (i.identityContractor ?? "").trim();
  return `${model} ${vin} ${contractor}`;
}

/** Рядок для картки історії: марка · VIN · контрагент. */
export function kmpHistoryEntryIdentityLine(entry: KmpHistoryEntry): string {
  const i = entry.inputs;
  const parts = [
    (i.identityModel ?? "").trim(),
    (i.identityVin ?? "").trim(),
    (i.identityContractor ?? "").trim(),
  ].filter(Boolean);
  return parts.length ? parts.join(" · ") : "";
}

export function filterKmpHistoryBySearch(
  list: KmpHistoryEntry[],
  rawQuery: string,
  formatUah: (n: number) => string
): KmpHistoryEntry[] {
  const q = rawQuery.trim().toLowerCase().replace(/\s+/g, " ");
  if (!q) return list;
  return list.filter((e) => {
    const pay = formatUah(e.summary.monthlyPaymentDisplay);
    const mode = KMP_MODE_LABELS_LONG[e.summary.mode];
    const dateStr = formatKmpHistoryDate(e.date);
    const id = e.id.toLowerCase();
    const kpId = (e.sourceProposalHistoryId ?? "").toLowerCase();
    const identity = kmpEntryIdentityHaystack(e).toLowerCase();
    const hay = `${pay} ${mode} ${dateStr} ${id} ${kpId} ${identity}`
      .toLowerCase()
      .replace(/\s+/g, " ");
    if (hay.includes(q)) return true;
    if (
      (q === "кп" || q === "kp") &&
      Boolean(e.sourceProposalHistoryId)
    )
      return true;
    return false;
  });
}

