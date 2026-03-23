import { NextRequest, NextResponse } from "next/server";
import path from "path";
import fs from "fs/promises";
import { OUTPUT_DIR } from "@/lib/output-dir";

function isENOENT(err: unknown): boolean {
  if (err instanceof Error && "code" in err) return (err as NodeJS.ErrnoException).code === "ENOENT";
  const o = err as { code?: string; errno?: number };
  return o?.code === "ENOENT" || o?.errno === -2 || (err instanceof Error && /no such file|ENOENT/i.test(err.message));
}

export async function GET(
  request: NextRequest,
  context: { params?: Promise<{ filename: string }> | { filename: string } }
) {
  try {
    let filename: string | undefined;
    const rawParams = context?.params;
    if (rawParams != null) {
      const resolved =
        typeof (rawParams as Promise<unknown>).then === "function"
          ? await (rawParams as Promise<{ filename: string }>)
          : (rawParams as { filename: string });
      filename = resolved?.filename;
    }
    if (!filename || typeof filename !== "string") {
      const fromPath = request.nextUrl.pathname.split("/").pop();
      if (fromPath && !fromPath.includes("..")) filename = fromPath;
    }
    if (!filename || typeof filename !== "string") {
      return NextResponse.json(
        { error: "Bad request", detail: "filename missing" },
        { status: 400 }
      );
    }
    const decoded = decodeURIComponent(filename);
    if (decoded.includes("..") || path.isAbsolute(decoded)) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }
    const safeName = path.basename(decoded);
    const filePath = path.join(OUTPUT_DIR, safeName);
    const stat = await fs.stat(filePath);
    if (!stat.isFile()) {
      return NextResponse.json({ error: "Not found" }, { status: 404 });
    }
    const buf = await fs.readFile(filePath);
    const nameParam = request.nextUrl.searchParams.get("name");
    const contentDispositionName = nameParam
      ? decodeURIComponent(nameParam).replace(/["\\]/g, "_")
      : decoded;
    const body = buf instanceof Buffer ? new Uint8Array(buf) : buf;
    return new NextResponse(body, {
      headers: {
        "Content-Type": "application/pdf",
        "Content-Disposition": `attachment; filename="${contentDispositionName}"`,
        "Content-Length": String(stat.size),
      },
    });
  } catch (err) {
    const isNotFound = isENOENT(err);
    const body: { error: string; detail?: string; code?: string } = {
      error: isNotFound ? "Not found" : "Download failed",
    };
    if (!isNotFound && process.env.NODE_ENV === "development" && err instanceof Error) {
      body.detail = err.message;
      body.code = (err as NodeJS.ErrnoException).code;
    }
    return NextResponse.json(body, { status: isNotFound ? 404 : 500 });
  }
}