"use client";

import { useEffect, useState, use } from "react";
import * as store from "@/lib/store";
import type { IEventData } from "@/types";
import EventDashboardClient from "@/components/EventDashboardClient";

interface EventDashboardPageProps {
  params: Promise<{ id: string }>;
}

export default function EventDashboardPage({ params }: EventDashboardPageProps) {
  const { id } = use(params);
  const [event, setEvent] = useState<IEventData | null | undefined>(undefined);

  useEffect(() => {
    const found = store.getEventById(id);
    setEvent(found ?? null);
  }, [id]);

  // Loading
  if (event === undefined) {
    return (
      <div className="mx-auto max-w-5xl px-6 py-12 space-y-8">
        <div className="animate-shimmer h-48 rounded-2xl" />
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          <div className="animate-shimmer h-64 rounded-xl" />
          <div className="animate-shimmer h-64 rounded-xl" />
        </div>
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

  return (
    <div className="mx-auto max-w-5xl px-6 py-12">
      <EventDashboardClient initialEvent={event} />
    </div>
  );
}
