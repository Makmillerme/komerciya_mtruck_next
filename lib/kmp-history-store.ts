/**
 * Файлове сховище історії розрахунків КМП (JSON-масив).
 * У serverless з кількома інстансами можливі гонки read-modify-write — як у proposal-history.
 */

import path from "path";
import fs from "fs/promises";
import { randomUUID } from "crypto";
import type { KmpFormValues } from "@/lib/kmp-form";
import type { KmpPaymentMode } from "@/lib/kmp-loan";

const FILE = path.join(process.cwd(), "data", "kmp-history.json");
const MAX_ENTRIES = 80;

export type KmpHistorySummary = {
  creditBody: number;
  totalInterest: number;
  totalPaymentSum: number;
  oneTimeFee: number;
  monthlyPaymentDisplay: number;
  interestPercentOfPrice: number;
  mode: KmpPaymentMode;
};

export type KmpHistoryEntry = {
  id: string;
  date: string;
  inputs: KmpFormValues;
  summary: KmpHistorySummary;
  /** id запису з /api/proposal-history, якщо розрахунок прив’язаний до імпорту КП. */
  sourceProposalHistoryId: string | null;
};

export async function readKmpHistoryFile(): Promise<KmpHistoryEntry[]> {
  try {
    const raw = await fs.readFile(FILE, "utf-8");
    const parsed = JSON.parse(raw) as unknown;
    return Array.isArray(parsed) ? (parsed as KmpHistoryEntry[]) : [];
  } catch {
    return [];
  }
}

async function writeKmpHistoryFile(entries: KmpHistoryEntry[]): Promise<void> {
  await fs.mkdir(path.dirname(FILE), { recursive: true });
  await fs.writeFile(FILE, JSON.stringify(entries), "utf-8");
}

export type KmpHistoryAppendPayload = {
  inputs: KmpFormValues;
  summary: KmpHistorySummary;
  sourceProposalHistoryId: string | null;
};

export async function appendKmpHistoryEntry(
  payload: KmpHistoryAppendPayload
): Promise<KmpHistoryEntry> {
  const list = await readKmpHistoryFile();
  const entry: KmpHistoryEntry = {
    id: randomUUID(),
    date: new Date().toISOString(),
    inputs: payload.inputs,
    summary: payload.summary,
    sourceProposalHistoryId: payload.sourceProposalHistoryId,
  };
  const next = [entry, ...list].slice(0, MAX_ENTRIES);
  await writeKmpHistoryFile(next);
  return entry;
}

export async function deleteKmpHistoryEntryById(id: string): Promise<void> {
  if (!id || typeof id !== "string") return;
  const list = await readKmpHistoryFile();
  const next = list.filter((e) => e.id !== id);
  await writeKmpHistoryFile(next);
}

