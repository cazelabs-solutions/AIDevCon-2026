import type { IProfile, IEventData, ISession, INote, IAIContent } from "@/types";
import { SEED_PROFILE, SEED_EVENTS } from "./db";

// ─── Storage Keys ───────────────────────────────────────────
const KEYS = {
  profile: "eventscribe:profile",
  events: "eventscribe:events",
  initialized: "eventscribe:initialized",
} as const;

// ─── Initialization ─────────────────────────────────────────
function ensureInitialized(): void {
  if (typeof window === "undefined") return;
  if (localStorage.getItem(KEYS.initialized)) return;

  localStorage.setItem(KEYS.profile, JSON.stringify(SEED_PROFILE));
  localStorage.setItem(KEYS.events, JSON.stringify(SEED_EVENTS));
  localStorage.setItem(KEYS.initialized, "true");
}

// ─── Profile ────────────────────────────────────────────────
export function getProfile(): IProfile {
  ensureInitialized();
  const raw = localStorage.getItem(KEYS.profile);
  return raw ? JSON.parse(raw) : SEED_PROFILE;
}

export function updateProfile(updates: Partial<Omit<IProfile, "id">>): IProfile {
  const current = getProfile();
  const updated = { ...current, ...updates };
  localStorage.setItem(KEYS.profile, JSON.stringify(updated));
  return updated;
}

// ─── Events ─────────────────────────────────────────────────
function getAllEventsMap(): Record<string, IEventData> {
  ensureInitialized();
  const raw = localStorage.getItem(KEYS.events);
  return raw ? JSON.parse(raw) : {};
}

function saveEventsMap(map: Record<string, IEventData>): void {
  localStorage.setItem(KEYS.events, JSON.stringify(map));
}

export function getEvents(): IEventData[] {
  const map = getAllEventsMap();
  return Object.values(map).sort(
    (a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()
  );
}

export function getEventById(id: string): IEventData | undefined {
  const map = getAllEventsMap();
  return map[id];
}

export function createEvent(
  meta: { title: string; url: string; date: string; location: string; description: string }
): IEventData {
  const map = getAllEventsMap();
  const id = `evt-${Date.now()}`;
  const newEvent: IEventData = {
    id,
    ...meta,
    sessions: [],
    notes: [],
    aiContent: null,
    createdAt: new Date().toISOString(),
  };
  map[id] = newEvent;
  saveEventsMap(map);
  return newEvent;
}

export function updateEvent(
  id: string,
  updates: Partial<Pick<IEventData, "title" | "date" | "location" | "description">>
): IEventData | null {
  const map = getAllEventsMap();
  if (!map[id]) return null;
  map[id] = { ...map[id], ...updates };
  saveEventsMap(map);
  return map[id];
}

export function deleteEvent(id: string): boolean {
  const map = getAllEventsMap();
  if (!map[id]) return false;
  delete map[id];
  saveEventsMap(map);
  return true;
}

export function addSession(
  eventId: string,
  session: Omit<ISession, "id">
): ISession | null {
  const map = getAllEventsMap();
  const evt = map[eventId];
  if (!evt) return null;
  const newSession: ISession = { id: `ses-${Date.now()}`, ...session };
  evt.sessions.push(newSession);
  saveEventsMap(map);
  return newSession;
}

export function deleteSession(eventId: string, sessionId: string): boolean {
  const map = getAllEventsMap();
  const evt = map[eventId];
  if (!evt) return false;
  evt.sessions = evt.sessions.filter((s) => s.id !== sessionId);
  saveEventsMap(map);
  return true;
}

export function addNote(eventId: string, content: string): INote | null {
  const map = getAllEventsMap();
  const evt = map[eventId];
  if (!evt) return null;
  const newNote: INote = {
    id: `note-${Date.now()}`,
    content,
    createdAt: new Date().toISOString(),
  };
  evt.notes.push(newNote);
  saveEventsMap(map);
  return newNote;
}

export function deleteNote(eventId: string, noteId: string): boolean {
  const map = getAllEventsMap();
  const evt = map[eventId];
  if (!evt) return false;
  evt.notes = evt.notes.filter((n) => n.id !== noteId);
  saveEventsMap(map);
  return true;
}

export function setAIContent(eventId: string, content: IAIContent): boolean {
  const map = getAllEventsMap();
  const evt = map[eventId];
  if (!evt) return false;
  evt.aiContent = content;
  saveEventsMap(map);
  return true;
}
