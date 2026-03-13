"use client";

import { useState, useCallback } from "react";
import type { IEventData, ISession, IAIContent } from "@/types";
import * as store from "@/lib/store";
import SessionForm from "./SessionForm";
import NoteEditor from "./NoteEditor";
import AIContentDisplay from "./AIContentDisplay";
import EventEditor from "./EventEditor";

interface EventDashboardClientProps {
  initialEvent: IEventData;
}

export default function EventDashboardClient({
  initialEvent,
}: EventDashboardClientProps) {
  const [event, setEvent] = useState<IEventData>(initialEvent);
  const [generating, setGenerating] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [editing, setEditing] = useState(false);

  // Refresh from store
  const refreshEvent = useCallback(() => {
    const updated = store.getEventById(event.id);
    if (updated) setEvent(updated);
  }, [event.id]);

  const handleEditEvent = useCallback(
    (updates: { title: string; date: string; location: string; description: string }) => {
      store.updateEvent(event.id, updates);
      refreshEvent();
    },
    [event.id, refreshEvent]
  );

  const handleAddSession = useCallback(
    async (sessionData: Omit<ISession, "id">) => {
      store.addSession(event.id, sessionData);
      refreshEvent();
    },
    [event.id, refreshEvent]
  );

  const handleDeleteSession = useCallback(
    (sessionId: string) => {
      store.deleteSession(event.id, sessionId);
      refreshEvent();
    },
    [event.id, refreshEvent]
  );

  const handleAddNote = useCallback(
    async (content: string) => {
      store.addNote(event.id, content);
      refreshEvent();
    },
    [event.id, refreshEvent]
  );

  const handleDeleteNote = useCallback(
    (noteId: string) => {
      store.deleteNote(event.id, noteId);
      refreshEvent();
    },
    [event.id, refreshEvent]
  );

  const handleGenerate = useCallback(async () => {
    setGenerating(true);
    setError(null);
    try {
      const profile = store.getProfile();
      const res = await fetch("/api/ai/generate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          title: event.title,
          date: event.date,
          location: event.location,
          description: event.description,
          sessions: event.sessions,
          notes: event.notes,
          authorName: profile.name,
        }),
      });
      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error || "Generation failed");
      }
      const { aiContent } = (await res.json()) as { aiContent: IAIContent };
      store.setAIContent(event.id, aiContent);
      refreshEvent();
    } catch (err) {
      setError(err instanceof Error ? err.message : "An error occurred");
    } finally {
      setGenerating(false);
    }
  }, [event, refreshEvent]);

  const formattedDate = new Date(event.date).toLocaleDateString("en-US", {
    year: "numeric",
    month: "long",
    day: "numeric",
  });

  return (
    <div className="space-y-8 animate-fade-in">
      {/* ── Edit Modal ────────────────────────────────────────── */}
      {editing && (
        <EventEditor
          title={event.title}
          date={event.date}
          location={event.location}
          description={event.description}
          onSave={handleEditEvent}
          onClose={() => setEditing(false)}
        />
      )}

      {/* ── Event Header ──────────────────────────────────────── */}
      <section className="glass rounded-2xl p-8 glow-border">
        <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-4">
          <div>
            <h1 className="text-3xl font-bold gradient-text">{event.title}</h1>
            <div className="flex flex-wrap items-center gap-4 mt-3 text-sm text-[var(--es-text-secondary)]">
              <span className="flex items-center gap-1.5">
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect width="18" height="18" x="3" y="4" rx="2" ry="2"/><line x1="16" x2="16" y1="2" y2="6"/><line x1="8" x2="8" y1="2" y2="6"/><line x1="3" x2="21" y1="10" y2="10"/></svg>
                {formattedDate}
              </span>
              <span className="flex items-center gap-1.5">
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M20 10c0 6-8 12-8 12s-8-6-8-12a8 8 0 0 1 16 0Z"/><circle cx="12" cy="10" r="3"/></svg>
                {event.location}
              </span>
            </div>
            <p className="mt-3 text-[var(--es-text-muted)] max-w-2xl">{event.description}</p>
          </div>
          <div className="flex items-center gap-2 shrink-0">
            <button
              onClick={() => setEditing(true)}
              className="btn-secondary text-sm flex items-center gap-2"
            >
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M17 3a2.85 2.83 0 1 1 4 4L7.5 20.5 2 22l1.5-5.5Z"/></svg>
              Edit
            </button>
            <a
              href={`/public/event/${event.id}`}
              target="_blank"
              className="btn-secondary text-sm flex items-center gap-2"
            >
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6"/><polyline points="15 3 21 3 21 9"/><line x1="10" x2="21" y1="14" y2="3"/></svg>
              Public Page
            </a>
          </div>
        </div>
      </section>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* ── Sessions Section ───────────────────────────────── */}
        <section className="space-y-4">
          <h2 className="text-xl font-semibold flex items-center gap-2">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-indigo-400"><path d="M17 3a2.85 2.83 0 1 1 4 4L7.5 20.5 2 22l1.5-5.5Z"/></svg>
            Sessions
            <span className="text-sm font-normal text-[var(--es-text-muted)]">({event.sessions.length})</span>
          </h2>

          <div className="space-y-3 stagger">
            {event.sessions.map((session) => (
              <div key={session.id} className="card group/session relative">
                <button
                  onClick={() => handleDeleteSession(session.id)}
                  className="absolute top-3 right-3 opacity-0 group-hover/session:opacity-100 transition-opacity text-[var(--es-text-muted)] hover:text-red-400 p-1"
                  title="Delete session"
                >
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M3 6h18"/><path d="M19 6v14c0 1-1 2-2 2H7c-1 0-2-1-2-2V6"/><path d="M8 6V4c0-1 1-2 2-2h4c1 0 2 1 2 2v2"/></svg>
                </button>
                <div>
                  <h4 className="font-semibold text-white pr-8">{session.title}</h4>
                  <p className="text-sm text-[var(--es-text-secondary)] mt-0.5">
                    {session.speaker} {session.time && `• ${session.time}`}
                  </p>
                </div>
                {session.takeaway && (
                  <p className="mt-3 text-sm text-[var(--es-text-muted)] border-l-2 border-indigo-500/40 pl-3">
                    {session.takeaway}
                  </p>
                )}
              </div>
            ))}
          </div>

          <SessionForm onAdd={handleAddSession} />
        </section>

        {/* ── Notes Section ──────────────────────────────────── */}
        <section className="space-y-4">
          <h2 className="text-xl font-semibold flex items-center gap-2">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-violet-400"><path d="M12 20h9"/><path d="M16.376 3.622a1 1 0 0 1 3.002 3.002L7.368 18.635a2 2 0 0 1-.855.506l-2.872.838a.5.5 0 0 1-.62-.62l.838-2.872a2 2 0 0 1 .506-.854z"/></svg>
            Notes
            <span className="text-sm font-normal text-[var(--es-text-muted)]">({event.notes.length})</span>
          </h2>

          <div className="space-y-3 stagger">
            {event.notes.map((note) => (
              <div key={note.id} className="card group/note relative">
                <button
                  onClick={() => handleDeleteNote(note.id)}
                  className="absolute top-3 right-3 opacity-0 group-hover/note:opacity-100 transition-opacity text-[var(--es-text-muted)] hover:text-red-400 p-1"
                  title="Delete note"
                >
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M3 6h18"/><path d="M19 6v14c0 1-1 2-2 2H7c-1 0-2-1-2-2V6"/><path d="M8 6V4c0-1 1-2 2-2h4c1 0 2 1 2 2v2"/></svg>
                </button>
                <p className="text-sm text-[var(--es-text-secondary)] leading-relaxed whitespace-pre-wrap pr-8">
                  {note.content}
                </p>
                <p className="text-xs text-[var(--es-text-muted)] mt-2">
                  {new Date(note.createdAt).toLocaleString()}
                </p>
              </div>
            ))}
          </div>

          <NoteEditor onSave={handleAddNote} />
        </section>
      </div>

      {/* ── AI Generation Section ────────────────────────────── */}
      <section className="space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="text-xl font-semibold flex items-center gap-2">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-cyan-400"><path d="M12 2v4"/><path d="m6.343 6.343 2.828 2.828"/><path d="M2 12h4"/><path d="m6.343 17.657 2.828-2.828"/><path d="M12 18v4"/><path d="m17.657 17.657-2.828-2.828"/><path d="M18 12h4"/><path d="m17.657 6.343-2.828 2.828"/></svg>
            AI-Generated Content
          </h2>
          <button
            onClick={handleGenerate}
            disabled={generating}
            className="btn-primary text-sm flex items-center gap-2"
          >
            {generating ? (
              <>
                <svg className="animate-spin h-4 w-4" viewBox="0 0 24 24" fill="none"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"/><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"/></svg>
                Generating...
              </>
            ) : (
              <>
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M12 2v4"/><path d="m6.343 6.343 2.828 2.828"/><path d="M2 12h4"/><path d="m6.343 17.657 2.828-2.828"/><path d="M12 18v4"/><path d="m17.657 17.657-2.828-2.828"/><path d="M18 12h4"/><path d="m17.657 6.343-2.828 2.828"/></svg>
                {event.aiContent ? "Regenerate" : "Generate"} AI Content
              </>
            )}
          </button>
        </div>

        {error && (
          <div className="rounded-xl border border-red-500/30 bg-red-500/10 p-4 text-sm text-red-400">
            {error}
          </div>
        )}

        {event.aiContent && <AIContentDisplay content={event.aiContent} />}
      </section>
    </div>
  );
}
