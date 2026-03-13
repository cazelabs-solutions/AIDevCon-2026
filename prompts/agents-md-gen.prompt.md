---
name: Generate AGENTS.md
model: gemini-3.7-pro
description: Generates an AGENTS.md operational instruction manual for AI agents working on EventScribe.
---

# Instructions
You are an expert AI agent orchestrator and software architect. Create an `AGENTS.md` file in the project root for EventScribe. If the file already exists, overwrite it with the new content.
This file serves as the operational instruction manual for all AI agents working on this codebase. Keep it under 150 lines. Include ONLY rules that an agent would get wrong without explicit instruction. Do NOT duplicate information already in `project.md` or `README.md` — reference those files instead.

# Context
Include the following sections in the generated `AGENTS.md`:

## Project Context
One-line: EventScribe is a Next.js 16 app on Vercel with Vercel Blob storage.
For full architecture and domain context, read project.md.

## Tech Stack and Versions
- Runtime: Node.js 22 LTS
- Framework: Next.js 16 with App Router (NOT Pages Router)
- Language: TypeScript (strict mode, no 'any' types)
- Styling: Tailwind CSS
- Storage: Vercel Blob (instead of R2)
- Server logic: Next.js Route Handlers (Node.js Serverless runtime, NOT edge)
- Package manager: npm (NOT yarn, NOT pnpm)
- AI: Provider-agnostic generation through Vercel AI SDK

## Key Commands
These are exact commands. Use them verbatim:
- Install dependencies: npm install
- Start dev server: npm run dev
- Run build: npm run build
- Run tests: npm test
- Run linter: npm run lint
- Deploy to Vercel: npx vercel --prod
- Run evaluation suite: node eval/run-eval.js
- Generate eval report: node eval/report.js

## Coding Conventions
- Naming: PascalCase for React components and types, camelCase for variables,
  functions, and JSON object keys, kebab-case for file and directory names
- Components: Functional components with hooks only. No class components.
- Exports: Named exports for components and utilities. Default export only
  for page-level route components.
- Imports: Use path aliases (@/ for src root). Group imports: external libs,
  then internal modules, then relative paths, then styles.
- Error handling: All async operations must have try-catch with meaningful
  user-facing error messages. Never swallow errors silently.
- Types: Define interfaces for all API request/response shapes, Blob object
  schemas, and component props. Prefix interfaces with 'I' (IEventData).
- Files: One component per file. Co-locate tests with source files.
- JSON data in Blob: Use camelCase keys, ISO 8601 dates, UUIDs for IDs.

## Architecture Rules
- All Blob access goes through server-side Route Handlers only. NEVER access
  Blob directly from client-side code.
- AI generation requests route through a single internal API endpoint that
  wraps the Vercel AI SDK call. Components never call AI providers directly.
- Extraction pipeline must follow the staged approach: structured metadata
  first (JSON-LD, Open Graph), then HTML content parsing, then Browser
  Rendering fallback ONLY if the first two stages fail to produce title + date.
- Public pages are pre-rendered from R2 publish manifests. They must NOT
  depend on the authoring UI or server-side rendering being available.

## Guardrails and Safety Boundaries

### Allowed Without Asking (Always Do)
- Read files, list directories, git status/diff/log
- Run npm install, npm run dev, npm run build, npm test, npm run lint
- Create or modify source files in src/, app/, components/, lib/, types/
- Run individual unit tests or the evaluation suite
- Run prettier and eslint auto-fix

### Ask First
- Adding new npm dependencies (explain why the dependency is needed)
- Modifying vercel.json or any deployment configuration
- Modifying the Blob storage path structure
- Changing the AI generation prompt templates
- Deleting any file (prefer renaming with .backup suffix)
- Running git push or changing branches
