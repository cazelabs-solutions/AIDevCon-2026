import Link from "next/link";
import type { IEventData } from "@/types";

interface EventCardProps {
  event: IEventData;
  index: number;
  onDelete?: (id: string) => void;
}

export default function EventCard({ event, index, onDelete }: EventCardProps) {
  const formattedDate = new Date(event.date).toLocaleDateString("en-US", {
    year: "numeric",
    month: "long",
    day: "numeric",
  });

  const isFuture = new Date(event.date) > new Date();

  return (
    <div
      className="relative flex gap-6 group"
      style={{ animationDelay: `${index * 0.1}s` }}
    >
      {/* ── Timeline Dot + Line ─────────────────────────────── */}
      <div className="flex flex-col items-center">
        <div
          className={`relative z-10 flex h-4 w-4 items-center justify-center rounded-full ${
            isFuture
              ? "bg-violet-500 shadow-lg shadow-violet-500/40"
              : "bg-indigo-500 shadow-lg shadow-indigo-500/40"
          }`}
        >
          <div className="h-2 w-2 rounded-full bg-white" />
        </div>
        <div className="h-full w-px bg-gradient-to-b from-indigo-500/40 to-transparent" />
      </div>

      {/* ── Card ────────────────────────────────────────────── */}
      <div className="flex-1 pb-8">
        <Link href={`/event/${event.id}`}>
          <div className="card group-hover:border-indigo-500/50 cursor-pointer relative">
            {/* Delete button */}
            {onDelete && (
              <button
                onClick={(e) => {
                  e.preventDefault();
                  e.stopPropagation();
                  onDelete(event.id);
                }}
                className="absolute top-3 right-3 opacity-0 group-hover:opacity-100 transition-opacity text-[var(--es-text-muted)] hover:text-red-400 p-1.5 rounded-lg hover:bg-red-500/10 z-10"
                title="Delete event"
              >
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M3 6h18"/><path d="M19 6v14c0 1-1 2-2 2H7c-1 0-2-1-2-2V6"/><path d="M8 6V4c0-1 1-2 2-2h4c1 0 2 1 2 2v2"/>
                </svg>
              </button>
            )}
            <div className="flex items-start justify-between gap-4 mb-3">
              <div>
                <h3 className="text-lg font-semibold text-white group-hover:text-indigo-300 transition-colors">
                  {event.title}
                </h3>
                <div className="flex items-center gap-3 mt-1">
                  <span className="text-sm text-[var(--es-text-secondary)] flex items-center gap-1.5">
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                      <rect width="18" height="18" x="3" y="4" rx="2" ry="2"/>
                      <line x1="16" x2="16" y1="2" y2="6"/>
                      <line x1="8" x2="8" y1="2" y2="6"/>
                      <line x1="3" x2="21" y1="10" y2="10"/>
                    </svg>
                    {formattedDate}
                  </span>
                  <span className="text-sm text-[var(--es-text-secondary)] flex items-center gap-1.5">
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                      <path d="M20 10c0 6-8 12-8 12s-8-6-8-12a8 8 0 0 1 16 0Z"/>
                      <circle cx="12" cy="10" r="3"/>
                    </svg>
                    {event.location}
                  </span>
                </div>
              </div>
              <div className="flex items-center gap-2 shrink-0">
                {isFuture && (
                  <span className="rounded-full bg-violet-500/15 px-3 py-1 text-xs font-medium text-violet-400 border border-violet-500/20">
                    Upcoming
                  </span>
                )}
                {event.aiContent && (
                  <span className="rounded-full bg-indigo-500/15 px-3 py-1 text-xs font-medium text-indigo-400 border border-indigo-500/20 flex items-center gap-1">
                    <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                      <path d="M12 2v4"/><path d="m6.343 6.343 2.828 2.828"/><path d="M2 12h4"/><path d="m6.343 17.657 2.828-2.828"/><path d="M12 18v4"/><path d="m17.657 17.657-2.828-2.828"/><path d="M18 12h4"/><path d="m17.657 6.343-2.828 2.828"/>
                    </svg>
                    AI Ready
                  </span>
                )}
              </div>
            </div>
            <p className="text-sm text-[var(--es-text-muted)] line-clamp-2">
              {event.description}
            </p>
            <div className="flex items-center gap-4 mt-4 text-xs text-[var(--es-text-muted)]">
              <span>{event.sessions.length} session{event.sessions.length !== 1 ? "s" : ""}</span>
              <span>•</span>
              <span>{event.notes.length} note{event.notes.length !== 1 ? "s" : ""}</span>
            </div>
          </div>
        </Link>
      </div>
    </div>
  );
}
