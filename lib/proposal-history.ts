import type { ProposalFormData } from "@/lib/schema";

const STORAGE_KEY = "proposal_history";
const MAX_ENTRIES = 50;
const MAX_PHOTOS = 8;

export interface ProposalHistoryEntry {
  id: string;
  file: string;
  date: string;
  formData: ProposalFormData;
  /** Base64 data URLs для відновлення фото при заповненні з історії (до 8 шт.) */
  photoDataUrls?: string[];
}

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

export function getProposalHistory(): ProposalHistoryEntry[] {
  if (typeof window === "undefined") return [];
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw) as ProposalHistoryEntry[];
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
}

export function addToProposalHistory(
  entry: Omit<ProposalHistoryEntry, "id" | "date"> & { photoDataUrls?: string[] }
): void {
  if (typeof window === "undefined") return;
  const list = getProposalHistory();
  const photoDataUrls = (entry.photoDataUrls ?? []).slice(0, MAX_PHOTOS);
  const newEntry: ProposalHistoryEntry = {
    ...entry,
    photoDataUrls: photoDataUrls.length > 0 ? photoDataUrls : undefined,
    id: crypto.randomUUID(),
    date: new Date().toISOString(),
  };
  const next = [newEntry, ...list].slice(0, MAX_ENTRIES);
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(next));
  } catch {
    // ignore quota or parse errors
  }
}

export function deleteFromProposalHistory(id: string): void {
  if (typeof window === "undefined") return;
  const list = getProposalHistory().filter((e) => e.id !== id);
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(list));
  } catch {
    // ignore
  }
}
