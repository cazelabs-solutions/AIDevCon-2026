// ─── EventScribe Eval Framework — Configuration ────────────────────
// All settings are env-driven with sensible defaults.

const BASE_URL = process.env.EVAL_BASE_URL;
if (!BASE_URL) {
  console.error('❌  EVAL_BASE_URL is required. Example:');
  console.error('   EVAL_BASE_URL=https://your-app.vercel.app node eval/run-eval.js');
  process.exit(1);
}

const config = {
  baseUrl: BASE_URL.replace(/\/+$/, ''),          // strip trailing slash
  headless: process.env.EVAL_HEADLESS !== 'false', // default true
  timeoutMs: parseInt(process.env.EVAL_TIMEOUT_MS || '30000', 10),
  outputDir: process.env.EVAL_OUTPUT_DIR || 'eval/results',
  screenshotOnFailure: process.env.EVAL_SCREENSHOT_ON_FAILURE !== 'false',
};

// ─── DOM Selectors (derived from EventScribe source) ────────────────
const SELECTORS = {
  // Layout / Navigation
  nav: 'nav',
  navLogo: 'nav a[href="/"]',
  navNewEventBtn: 'nav a[href="/event/new"]',

  // Homepage — Profile Hero
  profileSection: 'section.glass',
  profileName: 'h1.gradient-text',
  profileEditBtn: 'button:has-text("Edit")',
  profileAvatar: 'img[alt]',

  // Homepage — Timeline
  timelineHeading: 'h2:has-text("Event Timeline")',
  eventCards: '.card',
  eventCardLink: 'a[href^="/event/"]',

  // New Event Page
  newEventHeading: 'h1:has-text("Add New Event")',
  eventUrlInput: '#event-url',
  extractSubmitBtn: 'button[type="submit"]',

  // Event Dashboard
  eventDashboardTitle: 'h1.gradient-text',
  editEventBtn: 'button:has-text("Edit")',
  publicPageLink: 'a:has-text("Public Page")',
  sessionsHeading: 'h2:has-text("Sessions")',
  notesHeading: 'h2:has-text("Notes")',
  addSessionBtn: 'button:has-text("Add Session")',
  sessionTitleInput: 'input[placeholder="Session title"]',
  speakerInput: 'input[placeholder="Speaker name"]',
  timeInput: 'input[placeholder*="Time"]',
  takeawayTextarea: 'textarea[placeholder*="Key takeaway"]',
  noteTextarea: 'textarea[placeholder*="Capture your thoughts"]',
  saveNoteBtn: 'button:has-text("Save Note")',
  deleteSessionBtn: 'button[title="Delete session"]',
  deleteNoteBtn: 'button[title="Delete note"]',

  // AI Content
  aiSectionHeading: 'h2:has-text("AI-Generated Content")',
  generateBtn: 'button:has-text("Generate")',
  regenerateBtn: 'button:has-text("Regenerate")',
  recapTab: 'button:has-text("Recap")',
  linkedinTab: 'button:has-text("LinkedIn")',
  twitterTab: 'button:has-text("X / Twitter")',
  copyBtn: 'button:has-text("Copy")',
  postToLinkedInBtn: 'button:has-text("Post to LinkedIn")',
  postToXBtn: 'button:has-text("Post to X")',
  aiContentPre: 'pre.whitespace-pre-wrap',

  // Public Event Page
  publicHeader: 'header.glass',
  publicEventTitle: 'h1.gradient-text',
  publicBranding: 'text=EventScribe — Public Event Page',
  publicSessions: 'h2:has-text("Sessions")',
  publicNotes: 'h2:has-text("Notes")',
  publicRecap: 'h2:has-text("AI-Generated Recap")',
  publicFooter: 'footer',

  // Profile Editor Modal
  profileEditorHeading: 'h2:has-text("Edit Profile")',
  profileSaveBtn: 'button:has-text("Save Changes")',
  profileCancelBtn: 'button:has-text("Cancel")',

  // Event Editor Modal
  eventEditorHeading: 'h2:has-text("Edit Event")',
  eventSaveBtn: 'button:has-text("Save Changes")',

  // Loading / Error
  shimmer: '.animate-shimmer',
  errorBanner: '.border-red-500\\/30',
};

// ─── Seed data constants (from src/lib/db.ts) ───────────────────────
const SEED = {
  profile: {
    id: 'user-1',
    name: 'Alex Rivera',
    title: 'Senior Software Engineer',
    bio: 'Full-stack engineer & lifelong learner',
    avatarUrl: 'https://api.dicebear.com/9.x/notionists/svg?seed=Alex&backgroundColor=c0aede',
  },
  events: {
    'evt-1': {
      title: 'AI DevCon 2026',
      date: '2026-03-15',
      location: 'San Francisco, CA',
      sessionCount: 2,
      noteCount: 1,
      hasAiContent: true,
    },
    'evt-2': {
      title: 'React Summit 2026',
      date: '2026-04-22',
      location: 'Amsterdam, NL',
      sessionCount: 0,
      noteCount: 0,
      hasAiContent: false,
    },
  },
  localStorageKeys: {
    profile: 'eventscribe:profile',
    events: 'eventscribe:events',
    initialized: 'eventscribe:initialized',
  },
};

module.exports = { config, SELECTORS, SEED };
