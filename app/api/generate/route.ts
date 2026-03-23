import { NextResponse } from "next/server";
import { chromium } from "playwright";
import { randomUUID } from "crypto";
import {
  setProposalPrintData,
  deleteProposalPrintData,
} from "@/lib/proposal-print-store";

export async function POST(request: Request) {
  try {
    const formData = await request.formData();
    const data: Record<string, string> = {};
    formData.forEach((v, k) => {
      if (typeof v === "string") data[k] = v;
    });

    const files = formData.getAll("photos") as File[];
    const imageDataUrls: string[] = [];
    for (let i = 0; i < Math.min(files.length, 8); i++) {
      const f = files[i];
      if (!f?.name) continue;
      const buf = Buffer.from(await f.arrayBuffer());
      const base64 = buf.toString("base64");
      const mime = f.type?.startsWith("image/") ? f.type : "image/jpeg";
      imageDataUrls.push(`data:${mime};base64,${base64}`);
    }
    while (imageDataUrls.length < 8) imageDataUrls.push("");

    const id = randomUUID().replace(/-/g, "");
    await setProposalPrintData(id, { formData: data, imageDataUrls });

    // Use internal HTTP endpoint for server-side Playwright rendering.
    // This avoids SSL/proxy host mismatches when app is behind Nginx tunnel/domain.
    const internalBaseUrl = process.env.INTERNAL_RENDER_URL ?? "http://127.0.0.1:3000";

    const modelName = (data.model ?? "MAN").trim();
    const vinPart = (data.vin ?? "").trim();
    const displayName = `Комерційна пропозиція ${modelName}${vinPart ? ` ${vinPart}` : ""}.pdf`;

    const printUrl = `${internalBaseUrl.replace(/\/$/, "")}/proposal-print?id=${id}`;

    const browser = await chromium.launch({ headless: true });
    const page = await browser.newPage();

    await page.goto(printUrl, { waitUntil: "networkidle", timeout: 30000 });

    const notFound = await page
      .locator("text=Дані не знайдено")
      .isVisible()
      .catch(() => false);
    if (notFound) {
      await browser.close();
      await deleteProposalPrintData(id);
      throw new Error("Дані пропозиції не знайдено. Спробуйте ще раз.");
    }

    await page.waitForSelector('[data-page="1"]', {
      timeout: 30000,
      state: "attached",
    });

    const pdfBuffer = await page.pdf({
      format: "A4",
      printBackground: true,
      margin: { top: 0, right: 0, bottom: 0, left: 0 },
    });

    await browser.close();
    await deleteProposalPrintData(id);

    return NextResponse.json({
      success: true,
      file: displayName,
      pdf_base64: Buffer.from(pdfBuffer).toString("base64"),
      message: "PDF успішно створено!",
    });
  } catch (e) {
    const err = e instanceof Error ? e : new Error(String(e));
    return NextResponse.json(
      { success: false, error: err.message + "\n" + (err.stack ?? "") },
      { status: 500 }
    );
  }
}
