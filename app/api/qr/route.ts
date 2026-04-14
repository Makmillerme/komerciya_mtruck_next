import { NextResponse } from "next/server";
import { financingQrToPngBuffer } from "@/lib/financing-qr";

const MAX_URL_LEN = 2048;

/**
 * GET /api/qr?url=https%3A%2F%2F... — PNG QR для прев’ю в формі КП.
 */
export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const raw = searchParams.get("url");
  if (raw == null) {
    return NextResponse.json({ error: "Missing url" }, { status: 400 });
  }
  if (raw.length > MAX_URL_LEN) {
    return NextResponse.json({ error: "URL too long" }, { status: 400 });
  }
  const buf = await financingQrToPngBuffer(raw);
  if (!buf) {
    return NextResponse.json({ error: "Invalid URL" }, { status: 400 });
  }
  return new Response(new Uint8Array(buf), {
    headers: {
      "Content-Type": "image/png",
      "Cache-Control": "no-store",
    },
  });
}
