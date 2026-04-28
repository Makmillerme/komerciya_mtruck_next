/**
 * Файлове сховище історії генерацій КП (один JSON-масив).
 */

import path from "path";
import fs from "fs/promises";
import { randomUUID } from "crypto";
import type { ProposalHistoryEntry } from "./proposal-history";
import { MAX_PROPOSAL_PHOTOS } from "./proposal-photo-layout";

const FILE = path.join(process.cwd(), "data", "proposal-history.json");
const MAX_ENTRIES = 50;

export async function readProposalHistoryFile(): Promise<ProposalHistoryEntry[]> {
  try {
    const raw = await fs.readFile(FILE, "utf-8");
    const parsed = JSON.parse(raw) as unknown;
    return Array.isArray(parsed) ? (parsed as ProposalHistoryEntry[]) : [];
  } catch {
    return [];
  }
}

async function writeProposalHistoryFile(
  entries: ProposalHistoryEntry[]
): Promise<void> {
  await fs.mkdir(path.dirname(FILE), { recursive: true });
  await fs.writeFile(FILE, JSON.stringify(entries), "utf-8");
}

export type ProposalHistoryAppendPayload = Omit<
  ProposalHistoryEntry,
  "id" | "date"
> & { photoDataUrls?: string[] };

export async function appendProposalHistoryEntry(
  payload: ProposalHistoryAppendPayload
): Promise<ProposalHistoryEntry> {
  const list = await readProposalHistoryFile();
  const photoDataUrls = (payload.photoDataUrls ?? []).slice(0, MAX_PROPOSAL_PHOTOS);
  const entry: ProposalHistoryEntry = {
    file: payload.file,
    formData: payload.formData,
    photoDataUrls: photoDataUrls.length > 0 ? photoDataUrls : undefined,
    id: randomUUID(),
    date: new Date().toISOString(),
  };
  const next = [entry, ...list].slice(0, MAX_ENTRIES);
  await writeProposalHistoryFile(next);
  return entry;
}

export async function deleteProposalHistoryEntryById(id: string): Promise<void> {
  if (!id || typeof id !== "string") return;
  const list = await readProposalHistoryFile();
  const next = list.filter((e) => e.id !== id);
  await writeProposalHistoryFile(next);
}
