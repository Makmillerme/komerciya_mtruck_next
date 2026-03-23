import { NextResponse } from "next/server";

/**
 * Stub for OAuth Protected Resource Metadata (RFC 9729) probes.
 * Returns 200 so discovery requests do not produce 404 in dev console.
 */
export async function GET() {
  return NextResponse.json(
    { resource: "https://localhost:3000", authorization_servers: [] },
    { status: 200 }
  );
}
