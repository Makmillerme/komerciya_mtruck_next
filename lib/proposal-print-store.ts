/**
 * Файлове сховище даних для сторінки /proposal-print.
 * TTL ~1 хв. Playwright завантажує сторінку, Chromium рендерить HTML→PDF.
 */

import path from "path";
import fs from "fs/promises";

export interface ProposalPrintData {
  formData: Record<string, string>;
  imageDataUrls: string[];
}

const DIR = path.join(process.cwd(), ".proposal-print-temp");

function safeId(id: string): string {
  if (!/^[a-zA-Z0-9]+$/.test(id)) return "";
  return id;
}

function filePath(id: string): string {
  return path.join(DIR, `${safeId(id)}.json`);
}

export async function setProposalPrintData(
  id: string,
  data: ProposalPrintData
): Promise<void> {
  if (!safeId(id)) return;
  await fs.mkdir(DIR, { recursive: true });
  await fs.writeFile(filePath(id), JSON.stringify(data), "utf-8");
}

export async function getProposalPrintData(
  id: string
): Promise<ProposalPrintData | undefined> {
  if (!safeId(id)) return undefined;
  try {
    const content = await fs.readFile(filePath(id), "utf-8");
    return JSON.parse(content) as ProposalPrintData;
  } catch {
    return undefined;
  }
}

export async function deleteProposalPrintData(id: string): Promise<void> {
  if (!safeId(id)) return;
  try {
    await fs.unlink(filePath(id));
  } catch {
    /* ignore */
  }
}
