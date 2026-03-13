// ─── Profile ────────────────────────────────────────────────
export interface IProfile {
  id: string;
  name: string;
  bio: string;
  avatarUrl: string;
  title: string;
}

// ─── Event ──────────────────────────────────────────────────
export interface IEventData {
  id: string;
  title: string;
  url: string;
  date: string;
  location: string;
  description: string;
  sessions: ISession[];
  notes: INote[];
  aiContent: IAIContent | null;
  createdAt: string;
}

// ─── Session ────────────────────────────────────────────────
export interface ISession {
  id: string;
  title: string;
  speaker: string;
  time: string;
  takeaway: string;
}

// ─── Note ───────────────────────────────────────────────────
export interface INote {
  id: string;
  content: string;
  createdAt: string;
}

// ─── AI-Generated Content ───────────────────────────────────
export interface IAIContent {
  recap: string;
  linkedInDraft: string;
  twitterDraft: string;
  generatedAt: string;
}

// ─── API payloads ───────────────────────────────────────────
export interface IExtractedMeta {
  title: string;
  date: string;
  location: string;
  description: string;
}
