import { NextRequest, NextResponse } from "next/server";
import type { IExtractedMeta } from "@/types";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { url } = body as { url: string };

    if (!url || typeof url !== "string") {
      return NextResponse.json(
        { error: "A valid URL is required." },
        { status: 400 }
      );
    }

    // ── Fetch HTML and extract <title> ────────────────────────
    let title = "Untitled Event";
    try {
      const res = await fetch(url, {
        headers: { "User-Agent": "EventScribe/1.0" },
        signal: AbortSignal.timeout(8000),
      });
      const html = await res.text();
      const match = html.match(/<title[^>]*>([^<]+)<\/title>/i);
      if (match?.[1]) {
        title = match[1].trim();
      }
    } catch {
      // If fetch fails, keep the fallback title
    }

    // ── Return extracted metadata (stateless — no persistence) ─
    const meta: IExtractedMeta = {
      title,
      date: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000)
        .toISOString()
        .split("T")[0],
      location: "Virtual / TBD",
      description: `Event extracted from ${new URL(url).hostname}. Edit details on the dashboard to customize.`,
    };

    return NextResponse.json({ meta }, { status: 200 });
  } catch (error) {
    const message =
      error instanceof Error ? error.message : "Internal server error";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
