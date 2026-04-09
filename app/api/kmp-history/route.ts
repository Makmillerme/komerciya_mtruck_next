import { NextResponse } from "next/server";
import { kmpFormSchema } from "@/lib/kmp-form";
import {
  appendKmpHistoryEntry,
  deleteKmpHistoryEntryById,
  readKmpHistoryFile,
  type KmpHistorySummary,
} from "@/lib/kmp-history-store";
import type { KmpFormValues } from "@/lib/kmp-form";

const MAX_BODY_BYTES = 256_000;

function isSummary(x: unknown): x is KmpHistorySummary {
  if (!x || typeof x !== "object") return false;
  const o = x as Record<string, unknown>;
  return (
    typeof o.creditBody === "number" &&
    typeof o.totalInterest === "number" &&
    typeof o.totalPaymentSum === "number" &&
    typeof o.oneTimeFee === "number" &&
    typeof o.monthlyPaymentDisplay === "number" &&
    typeof o.interestPercentOfPrice === "number" &&
    (o.mode === "annuity" || o.mode === "differentiated")
  );
}

export async function GET() {
  try {
    const list = await readKmpHistoryFile();
    return NextResponse.json(list);
  } catch {
    return NextResponse.json([], { status: 200 });
  }
}

export async function POST(request: Request) {
  try {
    const bodyText = await request.text();
    if (bodyText.length > MAX_BODY_BYTES) {
      return NextResponse.json({ error: "Payload too large" }, { status: 413 });
    }
    const body = JSON.parse(bodyText) as {
      inputs?: unknown;
      summary?: unknown;
      sourceProposalHistoryId?: string | null;
    };
    const parsedInputs = kmpFormSchema.safeParse(body.inputs);
    if (!parsedInputs.success) {
      return NextResponse.json({ error: "Invalid inputs" }, { status: 400 });
    }
    if (!isSummary(body.summary)) {
      return NextResponse.json({ error: "Invalid summary" }, { status: 400 });
    }
    const sid =
      body.sourceProposalHistoryId === null || body.sourceProposalHistoryId === undefined
        ? null
        : typeof body.sourceProposalHistoryId === "string"
          ? body.sourceProposalHistoryId.trim() || null
          : null;
    const entry = await appendKmpHistoryEntry({
      inputs: parsedInputs.data as KmpFormValues,
      summary: body.summary,
      sourceProposalHistoryId: sid,
    });
    return NextResponse.json(entry);
  } catch {
    return NextResponse.json({ error: "Failed to save" }, { status: 500 });
  }
}

export async function DELETE(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const id = searchParams.get("id");
    if (!id) {
      return NextResponse.json({ error: "Missing id" }, { status: 400 });
    }
    await deleteKmpHistoryEntryById(id);
    return NextResponse.json({ ok: true });
  } catch {
    return NextResponse.json({ error: "Failed to delete" }, { status: 500 });
  }
}

