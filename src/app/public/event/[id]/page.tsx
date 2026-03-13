"use client";

import { useEffect, useState, use } from "react";
import * as store from "@/lib/store";
import type { IEventData } from "@/types";

interface PublicEventPageProps {
  params: Promise<{ id: string }>;
}

export default function PublicEventPage({ params }: PublicEventPageProps) {
  const { id } = use(params);
  const [event, setEvent] = useState<IEventData | null | undefined>(undefined);

  useEffect(() => {
    const found = store.getEventById(id);
    setEvent(found ?? null);
  }, [id]);

  // Loading
  if (event === undefined) {
    return (
      <div className="mx-auto max-w-3xl px-6 py-12 space-y-6">
        <div className="animate-shimmer h-56 rounded-2xl" />
        <div className="animate-shimmer h-40 rounded-xl" />
        <div className="animate-shimmer h-40 rounded-xl" />
      </div>
    );
  }

  // Not found
  if (event === null) {
    return (
      <div className="mx-auto max-w-2xl px-6 py-24 text-center animate-fade-in">
        <div className="text-5xl mb-6">🔍</div>
        <h1 className="text-2xl font-bold text-white mb-3">Event Not Found</h1>
        <p className="text-[var(--es-text-muted)] mb-8">
          This event doesn&apos;t exist or may have been deleted.
        </p>
        <a href="/" className="btn-primary inline-flex items-center gap-2">
          ← Back to Home
        </a>
      </div>
    );
  }

  const formattedDate = new Date(event.date).toLocaleDateString("en-US", {
    weekday: "long",
    year: "numeric",
    month: "long",
    day: "numeric",
  });

  return (
    <div className="mx-auto max-w-3xl px-6 py-12 animate-fade-in">
      {/* ── Public Header ────────────────────────────────────── */}
      <header className="glass rounded-2xl p-8 glow-border mb-8">
        <div className="flex items-center gap-2 text-xs font-medium text-indigo-400 uppercase tracking-widest mb-4">
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M12 2v4"/><path d="m6.343 6.343 2.828 2.828"/><path d="M2 12h4"/><path d="m6.343 17.657 2.828-2.828"/><path d="M12 18v4"/><path d="m17.657 17.657-2.828-2.828"/><path d="M18 12h4"/><path d="m17.657 6.343-2.828 2.828"/></svg>
          EventScribe — Public Event Page
        </div>
        <h1 className="text-4xl font-bold gradient-text leading-tight">
          {event.title}
        </h1>
        <div className="flex flex-wrap items-center gap-4 mt-4 text-sm text-[var(--es-text-secondary)]">
          <span className="flex items-center gap-1.5">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect width="18" height="18" x="3" y="4" rx="2" ry="2"/><line x1="16" x2="16" y1="2" y2="6"/><line x1="8" x2="8" y1="2" y2="6"/><line x1="3" x2="21" y1="10" y2="10"/></svg>
            {formattedDate}
          </span>
          <span className="flex items-center gap-1.5">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M20 10c0 6-8 12-8 12s-8-6-8-12a8 8 0 0 1 16 0Z"/><circle cx="12" cy="10" r="3"/></svg>
            {event.location}
          </span>
          {event.url && (
            <a
              href={event.url}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-1.5 text-indigo-400 hover:text-indigo-300 transition-colors"
            >
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6"/><polyline points="15 3 21 3 21 9"/><line x1="10" x2="21" y1="14" y2="3"/></svg>
              Event Website
            </a>
          )}
        </div>
        <p className="mt-4 text-[var(--es-text-muted)] leading-relaxed">
          {event.description}
        </p>
      </header>

      {/* ── Sessions ─────────────────────────────────────────── */}
      {event.sessions.length > 0 && (
        <section className="mb-8">
          <h2 className="text-xl font-semibold mb-4 flex items-center gap-2">
            <span className="h-6 w-1 rounded-full glow-line" />
            Sessions ({event.sessions.length})
          </h2>
          <div className="space-y-3 stagger">
            {event.sessions.map((session) => (
              <div key={session.id} className="card">
                <div>
                  <h3 className="font-semibold text-white">{session.title}</h3>
                  <p className="text-sm text-[var(--es-text-secondary)] mt-0.5">
                    {session.speaker}
                    {session.time && ` • ${session.time}`}
                  </p>
                </div>
                {session.takeaway && (
                  <div className="mt-3 rounded-lg bg-indigo-500/5 border border-indigo-500/10 p-3">
                    <p className="text-sm text-[var(--es-text-secondary)] leading-relaxed">
                      💡 {session.takeaway}
                    </p>
                  </div>
                )}
              </div>
            ))}
          </div>
        </section>
      )}

      {/* ── Notes ────────────────────────────────────────────── */}
      {event.notes.length > 0 && (
        <section className="mb-8">
          <h2 className="text-xl font-semibold mb-4 flex items-center gap-2">
            <span className="h-6 w-1 rounded-full bg-gradient-to-b from-violet-500 to-purple-600 shadow-sm shadow-violet-500/40" />
            Notes ({event.notes.length})
          </h2>
          <div className="space-y-3 stagger">
            {event.notes.map((note) => (
              <div key={note.id} className="card">
                <p className="text-sm text-[var(--es-text-secondary)] leading-relaxed whitespace-pre-wrap">
                  {note.content}
                </p>
                <p className="text-xs text-[var(--es-text-muted)] mt-3">
                  {new Date(note.createdAt).toLocaleDateString("en-US", {
                    month: "short",
                    day: "numeric",
                    year: "numeric",
                    hour: "2-digit",
                    minute: "2-digit",
                  })}
                </p>
              </div>
            ))}
          </div>
        </section>
      )}

      {/* ── AI Recap ─────────────────────────────────────────── */}
      {event.aiContent && (
        <section className="mb-8">
          <h2 className="text-xl font-semibold mb-4 flex items-center gap-2">
            <span className="h-6 w-1 rounded-full bg-gradient-to-b from-cyan-400 to-blue-500 shadow-sm shadow-cyan-400/40" />
            AI-Generated Recap
          </h2>
          <div className="glass rounded-xl p-6 glow-border">
            <pre className="whitespace-pre-wrap text-sm text-[var(--es-text-secondary)] leading-relaxed font-[inherit]">
              {event.aiContent.recap}
            </pre>
            <div className="mt-4 pt-3 border-t border-[var(--es-border)] text-xs text-[var(--es-text-muted)]">
              Generated by EventScribe AI •{" "}
              {new Date(event.aiContent.generatedAt).toLocaleDateString("en-US", {
                month: "short",
                day: "numeric",
                year: "numeric",
              })}
            </div>
          </div>
        </section>
      )}

      {/* ── Footer ───────────────────────────────────────────── */}
      <footer className="text-center py-8 border-t border-[var(--es-border)]">
        <p className="text-sm text-[var(--es-text-muted)]">
          Powered by{" "}
          <a href="/" className="text-indigo-400 hover:text-indigo-300 transition-colors font-medium">
            EventScribe
          </a>
          {" "}— AI-powered event learning
        </p>
      </footer>
    </div>
  );
}
