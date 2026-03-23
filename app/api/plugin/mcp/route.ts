import { NextResponse } from "next/server";

/**
 * Stub for MCP plugin probes (e.g. from Cursor/IDE).
 * Returns 200 so probes do not produce 404 in dev console.
 */
export async function GET() {
  return NextResponse.json(
    { ok: true, message: "MCP plugin not configured for this app" },
    { status: 200 }
  );
}

export async function POST() {
  return NextResponse.json(
    {
      jsonrpc: "2.0",
      id: null,
      error: { code: -32601, message: "Method not found" },
    },
    { status: 200 }
  );
}
