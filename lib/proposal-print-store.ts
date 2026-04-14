/**
 * Файлове сховище даних для сторінки /proposal-print.
 * Життєвий цикл: запис перед рендером PDF → читання Playwright → видалення після успіху або помилки в /api/generate.
 * Файли старші за `MAX_PRINT_DATA_AGE_MS` при `get` вважаються застарілими і видаляються (захист від сиріт після збою).
 */

import path from "path";
import fs from "fs/promises";

/** Максимальний вік JSON на диску; після цього `getProposalPrintData` повертає undefined і видаляє файл. */
export const MAX_PRINT_DATA_AGE_MS = 15 * 60 * 1000;

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
  const fp = filePath(id);
  try {
    const stat = await fs.stat(fp);
    if (Date.now() - stat.mtimeMs > MAX_PRINT_DATA_AGE_MS) {
      await fs.unlink(fp).catch(() => {
        /* ignore */
      });
      return undefined;
    }
    const content = await fs.readFile(fp, "utf-8");
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
