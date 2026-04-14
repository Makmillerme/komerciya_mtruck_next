import { NextResponse } from "next/server";
import { financingQrToDataUrl } from "@/lib/financing-qr";
import { renderProposalHtml } from "@/lib/render-proposal-html";

export async function POST(request: Request) {
  try {
    const formData = await request.formData();
    const data: Record<string, string> = {};
    formData.forEach((v, k) => {
      if (typeof v === "string") data[k] = v;
    });

    const files = formData.getAll("photos") as File[];
    const imageDataUrls: string[] = [];
    for (let i = 0; i < 8; i++) {
      const f = files[i];
      if (f?.type?.startsWith("image/")) {
        const buf = Buffer.from(await f.arrayBuffer());
        const base64 = buf.toString("base64");
        const mime = f.type || "image/jpeg";
        imageDataUrls.push(`data:${mime};base64,${base64}`);
      } else {
        imageDataUrls.push("");
      }
    }

    const origin = request.headers.get("x-forwarded-host")
      ? `${request.headers.get("x-forwarded-proto") ?? "https"}://${request.headers.get("x-forwarded-host")}`
      : new URL(request.url).origin;

    const financingQrSrc = await financingQrToDataUrl(data.financing_block_qr_url);

    const html = renderProposalHtml({
      formData: data,
      imageDataUrls,
      baseUrl: origin + "/",
      financingQrSrc,
    });

    return NextResponse.json({ html });
  } catch (e) {
    const err = e instanceof Error ? e : new Error(String(e));
    return NextResponse.json(
      { error: err.message },
      { status: 500 }
    );
  }
}
