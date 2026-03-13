---
name: Generate README
model: gemini-3.0-flash
description: Generates a professional README.md file for the EventScribe project.
---

# Instructions
You are an expert technical writer and software engineer. Create a professional `README.md` file for a new project called EventScribe in the root directory. if the file already exists, overwrite it with the new content.

# Context

**Project definition:** EventScribe is an AI-powered personal event learning hub and shareable journey microsite. It helps event attendees capture, enrich, organise, publish, and revisit what they learned from conferences, workshops, meetups, webinars, and similar events.

**Purpose:** Turn fragmented event notes, screenshots, and one-off social posts into a structured, polished, and continuously growing public learning portfolio. Each user gets a persistent personal microsite with event pages, session notes, AI-generated summaries, social drafts, and a multi-event timeline.

**Tech stack:** Next.js 16 (App Router) deployed on Vercel Serverless, Next.js API Routes for server-side logic, Vercel Blob for object storage, Vercel AI SDK for AI generation layer.

**Key features for MVP:**
- Personal profile and public landing page
- Event creation with auto-extraction from public event URLs
- Session and note capture (event-level and session-level)
- AI-generated event recap, session summaries, key takeaways, and social drafts
- Public event page publishing with stable URLs
- Multi-event timeline on the user profile

# Requirements
Include the following sections:
- Project Overview
- Features
- Tech Stack
- Getting Started (prerequisites, installation, running locally)
- Project Structure (placeholder)
- Deployment
- Contributing
- License (MIT)

# Constraints
- Keep it concise and professional.
- We will update it as the project evolves.
