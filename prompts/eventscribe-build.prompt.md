# EventScribe — AI-Powered Personal Event Learning Microsite

Build **EventScribe**, a premium dark-mode microsite for capturing conference sessions, synthesizing notes with AI, and sharing polished social posts. The app must be **fully functional end-to-end** with zero build errors and deployable to Vercel in a single pass.

---

## 1. Technical Stack

| Layer | Choice | Notes |
|---|---|---|
| **Framework** | Next.js 15+ App Router | Use `npx create-next-app@latest` or manual `package.json` |
| **Language** | TypeScript (strict) | Strict interfaces: `IProfile`, `IEventData`, `ISession`, `INote`, `IAIContent` |
| **Styling** | Tailwind CSS v4 | Via `@tailwindcss/postcss` in `postcss.config.mjs` (not `tailwind.config.js`) |
| **Runtime** | Vercel Serverless (Node.js) | **Never** use `export const runtime = 'edge'` — it crashes with `node:async_hooks` |
| **Data persistence** | Client-side `localStorage` | See §3 for rationale |
| **Fonts** | Google Fonts — Inter | Load via `<link>` in root layout `<head>` |

### 1.1 Critical Constraints

> **Serverless Isolation**: On Vercel, each serverless function invocation gets a **fresh module instance**. In-memory JavaScript objects (`Map`, arrays, module-scoped variables) are ephemeral and **will not persist** between requests. Never use server-side in-memory state as a database — it will cause "not found" errors on production. Use `localStorage` for MVP persistence (see §3).

> **Next 15+ Async Params**: Dynamic route parameters in both Server Components and client components with `use()` must be typed as `Promise` and unwrapped:
> ```tsx
> // Server Component
> export default async function Page({ params }: { params: Promise<{ id: string }> }) {
>   const { id } = await params;
> }
> // Client Component
> import { use } from "react";
> export default function Page({ params }: { params: Promise<{ id: string }> }) {
>   const { id } = use(params);
> }
> ```
> Failing this will cause Vercel production build failures.

---

## 2. Design System

Implement a **state-of-the-art dark mode** aesthetic using CSS custom properties in `globals.css`:

- **Backgrounds**: Deep saturated grays (`#0a0a0f`, `#12121a`, `#1a1a2e`)
- **Accents**: Vibrant indigo (`#6366f1`), violet (`#8b5cf6`), purple (`#a78bfa`), cyan (`#22d3ee`)
- **Glassmorphism**: `.glass` class with `backdrop-filter: blur(16px)` + translucent bg + subtle border
- **Glow effects**: Box shadows using accent colors at low opacity
- **Micro-animations**: `@keyframes` for `fadeIn`, `slideInFromBottom`, `shimmer` (loading skeleton), `pulseGlow`
- **Stagger**: `.stagger > *:nth-child(n)` with incremental `animation-delay`
- **Utility classes**: `.gradient-text`, `.btn-primary`, `.btn-secondary`, `.input-field`, `.card`, `.glow-border`, `.glow-line`

---

## 3. Data Architecture

### 3.1 Seed Data (`src/lib/db.ts`)

Export **constants only** — no CRUD functions:
- `SEED_PROFILE`: Default `IProfile` with name, bio, title, avatar URL (use DiceBear API)
- `SEED_EVENTS`: A `Record<string, IEventData>` with 2 pre-populated events containing realistic conference data (sessions, notes, and one with pre-generated AI content)

### 3.2 Client-Side Store (`src/lib/store.ts`)

A `localStorage`-backed CRUD module that:
- Auto-initializes from `SEED_PROFILE` / `SEED_EVENTS` on first visit (check an `initialized` flag)
- Exports synchronous functions: `getProfile`, `updateProfile`, `getEvents`, `getEventById`, `createEvent`, `updateEvent`, `deleteEvent`, `addSession`, `deleteSession`, `addNote`, `deleteNote`, `setAIContent`

### 3.3 API Routes (Stateless)

API routes must be **completely stateless** — they must never read from or write to server-side storage.

| Route | Method | Receives | Returns |
|---|---|---|---|
| `/api/events/extract` | POST | `{ url: string }` | `{ meta: IExtractedMeta }` — title extracted from HTML `<title>` tag, mocked date/location |
| `/api/ai/generate` | POST | `{ title, date, location, description, sessions, notes, authorName }` | `{ aiContent: IAIContent }` — polished recap + LinkedIn draft + X/Twitter draft |

The **client** is responsible for persisting data to `localStorage` after receiving API responses.

---

## 4. Pages & Components

### 4.1 Root Layout (`src/app/layout.tsx`)

- `<html lang="en" className="dark">`
- Load Inter font, import `globals.css`
- Fixed navigation bar with glassmorphism (`glass-strong`), glowing logo, "New Event" CTA button

### 4.2 Home Page (`src/app/page.tsx`) — Client Component

- **Profile hero**: Avatar, name, title, bio inside a `glass` card with `glow-border`. **Edit button** → opens `ProfileEditor` modal.
- **Event timeline**: Chronologically sorted list of `EventCard` components with vertical timeline line + dots. Each card shows a hover-reveal **delete button**.
- **Loading state**: Shimmer skeleton while `localStorage` initializes.

### 4.3 Create Event (`src/app/event/new/page.tsx`) — Client Component

- Centered form with URL input (link icon prefix, focus glow animation).
- On submit: call `/api/events/extract` → save event to `localStorage` via `store.createEvent()` → `router.push()` to the new event's dashboard.
- Loading spinner during extraction, error toast on failure.

### 4.4 Event Dashboard (`src/app/event/[id]/page.tsx`) — Client Component

- Unwrap `params` with React 19 `use()` hook.
- Read event from `store.getEventById(id)`.
- Render `EventDashboardClient` with the event data.
- Show **loading shimmer** while initializing, **not-found page** if event is missing.

**`EventDashboardClient`** contains:
- **Event header**: Title, date, location, description with **Edit button** (→ `EventEditor` modal) and **Public Page** link.
- **Sessions panel**: List of session cards with hover-reveal delete button + `SessionForm` (collapsible add form).
- **Notes panel**: List of note cards with hover-reveal delete button + `NoteEditor` (textarea + save).
- **AI Generation section**: "Generate AI Content" button → calls `/api/ai/generate` with the full event payload (including `authorName` from profile). Shows `AIContentDisplay` with tabbed output.

All mutations (add/edit/delete) must call the `store` module and refresh state from `localStorage`.

### 4.5 Public Event Page (`src/app/public/event/[id]/page.tsx`) — Client Component

- Read-only, beautifully styled display: event header, sessions with takeaway highlights (💡), notes with timestamps, AI recap in a `glass` card.
- Footer: "Powered by EventScribe".

### 4.6 Shared Components

| Component | Type | Purpose |
|---|---|---|
| `EventCard` | Server-safe | Timeline card with date, location, badges (Upcoming, AI Ready), delete button |
| `SessionForm` | Client | Collapsible form to add sessions (title, speaker, time, takeaway) |
| `NoteEditor` | Client | Textarea + save button with loading spinner |
| `AIContentDisplay` | Client | Tabbed view (Recap / LinkedIn / X) with **Copy** button, **Post to LinkedIn** button (opens `linkedin.com/feed/?shareActive=true&text=...`), **Post to X** button (opens `twitter.com/intent/tweet?text=...`) |
| `ProfileEditor` | Client | Modal with backdrop blur — edit name, title, bio, avatar URL |
| `EventEditor` | Client | Modal — edit event title, date (date input), location, description |

---

## 5. AI Content Quality

The `/api/ai/generate` endpoint must produce **well-structured, professional** drafts:

**Recap**: Markdown-formatted with `# Title`, `## Overview`, `## Session Highlights` (numbered list), `## Personal Reflections`, `## Key Takeaways`.

**LinkedIn Draft**: Conversational professional tone, includes emoji, event details (📅 date, 📍 location), session bullet points (🔹), a personal insight (💡), a CTA inviting comments, relevant hashtags, and the author's name as sign-off.

**X/Twitter Draft**: Thread format (`1/ ... 2/ ...`), concise takeaways, engagement CTA (`What were YOUR biggest takeaways? 👇`), event hashtag.

---

## 6. Verification Requirements

The project **must pass all of these** before delivery:

1. `npm run build` exits with code 0, zero TypeScript errors, zero lint errors.
2. All 7 routes compile (static and dynamic).
3. Creating a new event via URL extraction → event persists and appears on home timeline.
4. Event dashboard: add/delete sessions, add/delete notes, edit event details — all persist.
5. AI generation produces polished output and does not throw "not found" errors.
6. Profile edit saves and reflects on home page.
7. LinkedIn/X share buttons open the correct platform with pre-filled content.
8. `vercel --prod --yes` deploys without errors.

---

## 7. File Structure

```
src/
├── app/
│   ├── globals.css              # Design system + animations
│   ├── layout.tsx               # Root layout with nav
│   ├── page.tsx                 # Home (client component)
│   ├── api/
│   │   ├── events/extract/route.ts   # Stateless URL extractor
│   │   └── ai/generate/route.ts      # Stateless AI generator
│   ├── event/
│   │   ├── new/page.tsx         # Create event form
│   │   └── [id]/page.tsx        # Event dashboard
│   └── public/event/[id]/page.tsx    # Public read-only page
├── components/
│   ├── EventCard.tsx
│   ├── SessionForm.tsx
│   ├── NoteEditor.tsx
│   ├── AIContentDisplay.tsx
│   ├── EventDashboardClient.tsx
│   ├── ProfileEditor.tsx
│   └── EventEditor.tsx
├── lib/
│   ├── db.ts                    # Seed data constants only
│   └── store.ts                 # localStorage CRUD
└── types/
    └── index.ts                 # IProfile, IEventData, ISession, INote, IAIContent, IExtractedMeta
```
