import { NextResponse } from "next/server";
import type { ProposalFormData } from "@/lib/schema";
import {
  appendProposalHistoryEntry,
  deleteProposalHistoryEntryById,
  readProposalHistoryFile,
} from "@/lib/proposal-history-store";

export async function GET() {
  try {
    const list = await readProposalHistoryFile();
    return NextResponse.json(list);
  } catch {
    return NextResponse.json([], { status: 200 });
  }
}

export async function POST(request: Request) {
  try {
    const body = (await request.json()) as {
      file?: string;
      formData?: ProposalFormData;
      photoDataUrls?: string[];
    };
    if (!body.file?.trim() || !body.formData || typeof body.formData !== "object") {
      return NextResponse.json({ error: "Invalid payload" }, { status: 400 });
    }
    const entry = await appendProposalHistoryEntry({
      file: body.file.trim(),
      formData: body.formData,
      photoDataUrls: body.photoDataUrls,
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
    await deleteProposalHistoryEntryById(id);
    return NextResponse.json({ ok: true });
  } catch {
    return NextResponse.json({ error: "Failed to delete" }, { status: 500 });
  }
}
