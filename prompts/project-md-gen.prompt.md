---
name: Generate Project Blueprint
model: gemini-3.7-pro
description: Generates a project.md file serving as a high-level blueprint and shared context document for EventScribe.
---

# Instructions
You are an expert software architect and technical writer. Create a `project.md` file in the project root for EventScribe. If the file already exists, overwrite it with the new content.
This file serves as the project's high-level blueprint and shared context document. It defines the product purpose, architecture, and key decisions.

# Context
Include the following sections in the generated `project.md`:

## Product Overview
EventScribe is an AI-powered personal event learning hub and shareable
journey microsite. It transforms event participation (conferences, workshops,
meetups, webinars) into a structured, polished, and continuously growing
public learning portfolio. Each user gets a persistent personal microsite.

## Architecture
- Framework: Next.js 16 (App Router)
- Server logic: Next.js API Routes (Node.js Serverless Functions)
- Storage: Vercel Blob (object storage, JSON + media)
- AI generation: Provider-agnostic via Vercel AI SDK
- Extraction: Staged pipeline (structured metadata -> HTML parsing)
- Deployment: Vercel CLI / Vercel Platform

## Storage Model
/users/{userId}/profile.json
/users/{userId}/timeline.json
/users/{userId}/events/{eventId}/event.json
/users/{userId}/events/{eventId}/sessions/{sessionId}.json
/users/{userId}/events/{eventId}/notes/{noteId}.json
/users/{userId}/events/{eventId}/generated/{sectionType}.json
/users/{userId}/events/{eventId}/assets/{filename}
/users/{userId}/events/{eventId}/publish/manifest.json

## Core User Journey
1. Create personal site (profile, landing page, empty timeline)
2. Add event from URL -> auto-extract metadata -> user reviews/corrects
3. Add attended sessions and paste raw notes
4. Generate content: event recap, session summaries, 'what I learned',
   LinkedIn draft, X draft (each independently regenerable)
5. User reviews, edits, and approves generated content
6. Publish -> stable public URL -> timeline updated automatically

## Key Product Rules
- No AI-generated content is ever published without explicit user approval
- Extraction must always present editable drafts, never auto-commit
- Generation is section-level: recap, session summary, social draft can each
  be regenerated independently without reprocessing the entire event
- Prior versions must be preserved before any regeneration
- Private notes can inform AI generation but must never appear on public pages
- The product must feel complete after a single event while growing with each
  additional event added to the timeline

## Success Criteria
- User can go from event URL + notes to published page in under 15 minutes
- Extraction correctly identifies title and date for 70%+ of event URLs
- Generated recaps require less than 5 minutes of manual editing
- A second event can be added without any redesign or data migration

## Commands
- Install: npm install
- Dev server: npm run dev
- Build: npm run build
- Deploy: npx vercel --prod
- Test: npm test
- Eval: node eval/run-eval.js
