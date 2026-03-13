import type { IProfile, IEventData } from "@/types";

// ─── Seed Profile ───────────────────────────────────────────
export const SEED_PROFILE: IProfile = {
  id: "user-1",
  name: "Alex Rivera",
  bio: "Full-stack engineer & lifelong learner. I attend developer conferences around the world and distill the best talks into actionable insights.",
  avatarUrl: "https://api.dicebear.com/9.x/notionists/svg?seed=Alex&backgroundColor=c0aede",
  title: "Senior Software Engineer",
};

// ─── Seed Events (as a Record for localStorage) ─────────────
export const SEED_EVENTS: Record<string, IEventData> = {
  "evt-1": {
    id: "evt-1",
    title: "AI DevCon 2026",
    url: "https://aidevcon.example.com",
    date: "2026-03-15",
    location: "San Francisco, CA",
    description:
      "The premier conference for AI-powered developer tooling, featuring keynotes from industry leaders and hands-on workshops.",
    sessions: [
      {
        id: "ses-1",
        title: "The Future of AI-Assisted Coding",
        speaker: "Dr. Evelyn Zhao",
        time: "09:00 AM",
        takeaway:
          "AI coding assistants will shift from code completion to full system design partners within 2 years.",
      },
      {
        id: "ses-2",
        title: "Building Resilient LLM Pipelines",
        speaker: "Marcus Chen",
        time: "11:00 AM",
        takeaway:
          "Use circuit-breaker patterns and fallback models to keep inference pipelines online at five-nines uptime.",
      },
    ],
    notes: [
      {
        id: "note-1",
        content:
          "Key theme: AI is no longer just autocomplete — it's becoming a design partner. Need to rethink how we architect applications for human-AI collaboration.",
        createdAt: "2026-03-15T10:30:00Z",
      },
    ],
    aiContent: {
      recap:
        "AI DevCon 2026 showcased a paradigm shift in developer tooling. The standout sessions emphasized that AI coding assistants are evolving from simple code completers into full-fledged system design partners. Speakers highlighted the importance of building resilient LLM inference pipelines using circuit-breaker patterns. The conference made it clear: the future of software engineering is deeply collaborative between humans and AI.",
      linkedInDraft:
        "Just wrapped up #AIDevCon2026 in San Francisco! 🚀\n\nKey takeaway: AI coding assistants are evolving from autocomplete into system design partners. We're not just writing code faster — we're rethinking how we architect applications.\n\nHighlights:\n🔹 Dr. Evelyn Zhao's keynote on the 2-year horizon for AI design partners\n🔹 Marcus Chen's talk on resilient LLM pipelines with five-nines uptime\n\nThe future of software engineering is human-AI collaboration. Incredible event!\n\n#AI #DevTools #SoftwareEngineering #Conference",
      twitterDraft:
        "🧵 Top takeaways from #AIDevCon2026:\n\n1/ AI coding assistants → full system design partners in ~2 years\n2/ Circuit-breaker patterns are essential for production LLM pipelines\n3/ The future is human-AI collaboration, not replacement\n\nIncredible energy in SF this week! 🔥",
      generatedAt: "2026-03-15T18:00:00Z",
    },
    createdAt: "2026-03-10T08:00:00Z",
  },
  "evt-2": {
    id: "evt-2",
    title: "React Summit 2026",
    url: "https://reactsummit.example.com",
    date: "2026-04-22",
    location: "Amsterdam, NL",
    description:
      "The biggest React conference in the world — deep dives into Server Components, concurrent features, and the React compiler.",
    sessions: [],
    notes: [],
    aiContent: null,
    createdAt: "2026-03-12T14:00:00Z",
  },
};
