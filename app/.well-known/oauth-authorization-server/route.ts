import { NextResponse } from "next/server";

/**
 * Stub for OAuth Authorization Server Metadata (RFC 8414) probes.
 * Returns 200 so discovery requests do not produce 404 in dev console.
 */
export async function GET() {
  return NextResponse.json(
    { issuer: "https://localhost:3000", authorization_endpoint: null },
    { status: 200 }
  );
}
