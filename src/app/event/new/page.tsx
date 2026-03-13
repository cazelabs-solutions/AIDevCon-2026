"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import * as store from "@/lib/store";

export default function NewEventPage() {
  const router = useRouter();
  const [url, setUrl] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!url.trim()) return;

    setLoading(true);
    setError(null);

    try {
      const res = await fetch("/api/events/extract", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ url: url.trim() }),
      });

      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error || "Failed to extract event data");
      }

      const { meta } = await res.json();

      // Save to localStorage
      const event = store.createEvent({ ...meta, url: url.trim() });

      router.push(`/event/${event.id}`);
    } catch (err) {
      setError(err instanceof Error ? err.message : "An error occurred");
      setLoading(false);
    }
  };

  return (
    <div className="mx-auto max-w-2xl px-6 py-16 animate-fade-in">
      {/* ── Header ─────────────────────────────────────────── */}
      <div className="text-center mb-12">
        <div className="inline-flex h-16 w-16 items-center justify-center rounded-2xl bg-gradient-to-br from-indigo-500 to-violet-600 shadow-lg shadow-indigo-500/25 mb-6">
          <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-white">
            <path d="M12 5v14"/><path d="M5 12h14"/>
          </svg>
        </div>
        <h1 className="text-3xl font-bold gradient-text mb-3">Add New Event</h1>
        <p className="text-[var(--es-text-muted)] max-w-md mx-auto">
          Paste the URL of a conference or event page. We&apos;ll extract the details and create a workspace for your learning notes.
        </p>
      </div>

      {/* ── Form ───────────────────────────────────────────── */}
      <form onSubmit={handleSubmit} className="glass rounded-2xl p-8 glow-border space-y-6">
        <div className="space-y-2">
          <label htmlFor="event-url" className="text-sm font-medium text-[var(--es-text-secondary)]">
            Event URL
          </label>
          <div className="relative">
            <div className="absolute left-4 top-1/2 -translate-y-1/2 text-[var(--es-text-muted)]">
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M10 13a5 5 0 0 0 7.54.54l3-3a5 5 0 0 0-7.07-7.07l-1.72 1.71"/>
                <path d="M14 11a5 5 0 0 0-7.54-.54l-3 3a5 5 0 0 0 7.07 7.07l1.71-1.71"/>
              </svg>
            </div>
            <input
              id="event-url"
              type="url"
              placeholder="https://conference.example.com"
              value={url}
              onChange={(e) => setUrl(e.target.value)}
              className="input-field pl-12 text-base"
              required
            />
          </div>
        </div>

        {error && (
          <div className="rounded-xl border border-red-500/30 bg-red-500/10 p-4 text-sm text-red-400 animate-slide-in">
            {error}
          </div>
        )}

        <button
          type="submit"
          disabled={loading || !url.trim()}
          className="btn-primary w-full text-base py-3 flex items-center justify-center gap-2"
        >
          {loading ? (
            <>
              <svg className="animate-spin h-5 w-5" viewBox="0 0 24 24" fill="none">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"/>
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"/>
              </svg>
              Extracting Event Data...
            </>
          ) : (
            <>
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M12 2v4"/><path d="m6.343 6.343 2.828 2.828"/><path d="M2 12h4"/><path d="m6.343 17.657 2.828-2.828"/><path d="M12 18v4"/><path d="m17.657 17.657-2.828-2.828"/><path d="M18 12h4"/><path d="m17.657 6.343-2.828 2.828"/></svg>
              Extract &amp; Create Event
            </>
          )}
        </button>

        <p className="text-xs text-center text-[var(--es-text-muted)]">
          We&apos;ll fetch the page title and set up a workspace. You can edit all details later.
        </p>
      </form>
    </div>
  );
}
