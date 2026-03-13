"use client";

import { useState, useEffect } from "react";
import type { IProfile, IEventData } from "@/types";
import * as store from "@/lib/store";
import EventCard from "@/components/EventCard";
import ProfileEditor from "@/components/ProfileEditor";

export default function HomePage() {
  const [profile, setProfile] = useState<IProfile | null>(null);
  const [events, setEvents] = useState<IEventData[]>([]);
  const [editingProfile, setEditingProfile] = useState(false);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setProfile(store.getProfile());
    setEvents(store.getEvents());
    setMounted(true);
  }, []);

  const handleProfileSave = (updates: Partial<Omit<IProfile, "id">>) => {
    const updated = store.updateProfile(updates);
    setProfile(updated);
  };

  const handleDeleteEvent = (id: string) => {
    if (!confirm("Delete this event? This cannot be undone.")) return;
    store.deleteEvent(id);
    setEvents(store.getEvents());
  };

  if (!mounted || !profile) {
    return (
      <div className="mx-auto max-w-4xl px-6 py-12">
        <div className="glass rounded-2xl p-8 animate-shimmer h-40" />
        <div className="mt-12 space-y-6">
          <div className="animate-shimmer h-32 rounded-xl" />
          <div className="animate-shimmer h-32 rounded-xl" />
        </div>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-4xl px-6 py-12 animate-fade-in">
      {/* ── Profile Edit Modal ───────────────────────────────── */}
      {editingProfile && (
        <ProfileEditor
          profile={profile}
          onSave={handleProfileSave}
          onClose={() => setEditingProfile(false)}
        />
      )}

      {/* ── Profile Hero ─────────────────────────────────────── */}
      <section className="glass rounded-2xl p-8 glow-border mb-12">
        <div className="flex flex-col sm:flex-row items-center sm:items-start gap-6">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={profile.avatarUrl}
            alt={profile.name}
            width={96}
            height={96}
            className="h-24 w-24 rounded-2xl bg-[var(--es-bg-card)] ring-2 ring-indigo-500/30 shadow-lg shadow-indigo-500/10"
          />
          <div className="text-center sm:text-left flex-1">
            <div className="flex items-start justify-between">
              <div>
                <h1 className="text-3xl font-bold gradient-text">{profile.name}</h1>
                <p className="text-[var(--es-accent-purple)] font-medium mt-1">{profile.title}</p>
              </div>
              <button
                onClick={() => setEditingProfile(true)}
                className="btn-secondary text-sm flex items-center gap-2 shrink-0"
              >
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M17 3a2.85 2.83 0 1 1 4 4L7.5 20.5 2 22l1.5-5.5Z"/></svg>
                Edit
              </button>
            </div>
            <p className="text-[var(--es-text-muted)] mt-2 max-w-xl leading-relaxed">{profile.bio}</p>
          </div>
        </div>
      </section>

      {/* ── Event Timeline ───────────────────────────────────── */}
      <section>
        <div className="flex items-center justify-between mb-8">
          <h2 className="text-2xl font-bold flex items-center gap-3">
            <span className="h-8 w-1 rounded-full glow-line" />
            Event Timeline
          </h2>
          <span className="text-sm text-[var(--es-text-muted)]">
            {events.length} event{events.length !== 1 ? "s" : ""}
          </span>
        </div>

        {events.length === 0 ? (
          <div className="glass rounded-2xl p-12 text-center">
            <div className="text-4xl mb-4">🎪</div>
            <h3 className="text-lg font-semibold text-white mb-2">No events yet</h3>
            <p className="text-[var(--es-text-muted)] mb-6">
              Start by adding your first conference or event.
            </p>
            <a href="/event/new" className="btn-primary inline-flex items-center gap-2">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M12 5v14"/><path d="M5 12h14"/></svg>
              Add Your First Event
            </a>
          </div>
        ) : (
          <div className="stagger">
            {events.map((event, i) => (
              <EventCard
                key={event.id}
                event={event}
                index={i}
                onDelete={handleDeleteEvent}
              />
            ))}
          </div>
        )}
      </section>
    </div>
  );
}
