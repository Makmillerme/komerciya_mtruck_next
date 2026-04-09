import type { ProposalFormData } from "@/lib/schema";

const HISTORY_API = "/api/proposal-history";

export interface ProposalHistoryEntry {
  id: string;
  file: string;
  date: string;
  formData: ProposalFormData;
  /** Base64 data URLs для відновлення фото при заповненні з історії (до 8 шт.) */
  photoDataUrls?: string[];
}

const MAX_PHOTOS = 8;

export function fileToDataUrl(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const r = new FileReader();
    r.onload = () => resolve(r.result as string);
    r.onerror = reject;
    r.readAsDataURL(file);
  });
}

export function dataUrlToFile(dataUrl: string, filename: string): File {
  const [head, data] = dataUrl.split(",", 2);
  const mime = head?.match(/data:([^;]+)/)?.[1] ?? "image/jpeg";
  const bin = atob(data ?? "");
  const arr = new Uint8Array(bin.length);
  for (let i = 0; i < bin.length; i++) arr[i] = bin.charCodeAt(i);
  return new File([arr], filename, { type: mime });
}

/** Історія зберігається у файлі `data/proposal-history.json` на сервері (через API). */
export async function fetchProposalHistory(): Promise<ProposalHistoryEntry[]> {
  try {
    const r = await fetch(HISTORY_API);
    if (!r.ok) return [];
    const data = (await r.json()) as unknown;
    return Array.isArray(data) ? (data as ProposalHistoryEntry[]) : [];
  } catch {
    return [];
  }
}

export async function saveProposalHistoryEntry(
  entry: Omit<ProposalHistoryEntry, "id" | "date"> & { photoDataUrls?: string[] }
): Promise<ProposalHistoryEntry | null> {
  try {
    const photoDataUrls = (entry.photoDataUrls ?? []).slice(0, MAX_PHOTOS);
    const r = await fetch(HISTORY_API, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        file: entry.file,
        formData: entry.formData,
        photoDataUrls: photoDataUrls.length > 0 ? photoDataUrls : undefined,
      }),
    });
    if (!r.ok) return null;
    return (await r.json()) as ProposalHistoryEntry;
  } catch {
    return null;
  }
}

export async function removeProposalHistoryEntry(id: string): Promise<boolean> {
  try {
    const r = await fetch(`${HISTORY_API}?id=${encodeURIComponent(id)}`, {
      method: "DELETE",
    });
    return r.ok;
  } catch {
    return false;
  }
}
