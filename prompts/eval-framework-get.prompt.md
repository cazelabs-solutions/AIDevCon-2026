---
name: Generate Eval Framework
model: gemini-3.7-pro
description: Generates a PRD-first automated evaluation framework for EventScribe, running against a live deployment.
---

# Instructions
You are an expert AI QA automation engineer and software architect. Your task is to generate a comprehensive, runnable evaluation framework for the EventScribe application. It must score the live Vercel deployment against both the PRD vision and current prototype behavior using a rigid scoring engine.

Follow the exact directory structure, schemas, and implementation learnings provided in this context.

# Context & Orientation

| Document | Path | Purpose |
|---|---|---|
| PRD | `project_docs/EventScribe_PRD_Vercel.docx` | Defines MVP acceptance criteria and full feature vision |
| Technical Design | `project_docs/EventScribe_Technical_Solution_Design.docx` | Architecture, data flows, and API contracts |
| Type Contracts | `src/types/index.ts` | The source of truth for all data interfaces |
| Data Layer | `src/lib/store.ts` | localStorage CRUD operations |
| Seed Data | `src/lib/db.ts` | Seeded user profile and 2 events |

## 1. Directory Structure to Create

Create all these files inside an `eval/` directory:
- `eval/package.json` (Playwright dependency, `npm run eval`, `npm run report`)
- `eval/README.md` (Setup instructions, env vars, how to run)
- `eval/config.js` (Centralized config: env vars, timeouts, DOM selectors derived from source)
- `eval/fixtures/sample-urls.json` (Stable URLs for extraction testing)
- `eval/test-cases.json` (Structured array of all 36 test cases)
- `eval/metrics.json` (Weightings for 8 categories and 70/20/10 composite model)
- `eval/helpers/browser.js` (Playwright setup, seeded/clean context handling, screenshot capture)
- `eval/helpers/api.js` (fetch POST/GET wrappers, jsonPath assertions)
- `eval/helpers/scoring.js` (Composite and category scoring math, failure taxonomy)
- `eval/run-eval.js` (Main test orchestrator that prints console progress and dumps JSON results)
- `eval/report.js` (Generates standalone dark-themed HTML report)

## 2. Technology Requirements
- **Playwright** (`chromium` only) for browser UI tests.
- **Node `fetch`** for API tests.
- **NO test runners** like Jest/Vitest. `run-eval.js` orchestrates everything sequentially.
- Environment driven via `EVAL_BASE_URL` (critical for Vercel pointing).

## 3. Implementation Learnings (CRITICAL)
From past runs, implement these exact fixes to prevent framework crashes:

1. **Vercel Auth Bypass**: Vercel preview URLs usually return HTTP 401 Unauthorized for automated scripts due to Vercel Protection. Document in the README that the runner should hit the production URL (`https://eventscribe.vercel.app`) or use a generic bypass token if configured.
2. **Playwright Dialog Handling**: Playwright throws `Cannot accept dialog which is already handled!` if `page.on('dialog')` fires multiple times. Always use this safe handler for dialogs (like deletes):
   ```javascript
   page.once('dialog', dialog => {
     if (dialog.type() !== 'beforeunload') {
       dialog.accept().catch(() => {});
     }
   });
   ```
3. **localStorage Ephemerality**: Public pages (`/public/event/[id]`) read from localStorage. A fresh, clean browser context hitting that URL will correctly fail with an "Event Not Found" error. This is a known PRD Gap.
4. **Known Current Bugs to Score Against**:
   - Event timeline sorting is currently ascending instead of descending.
   - Profile changes sometimes drop on hard refresh.
   - Form validation requires all session fields instead of just the title.
   - The "Copy" button doesn't correctly register state as "Copied!".
   The framework must assert the explicitly correct PRD behavior (as written in the test plan) so these bugs are correctly identified as failures.

## 4. Test Cases & Data Schema
The `test-cases.json` must cover exactly **36 tests** across 8 weighted categories:
1. `profile_and_identity` (Weight: 10%)
2. `event_intake_extraction` (Weight: 15%)
3. `sessions_and_notes` (Weight: 15%)
4. `ai_generation` (Weight: 15%)
5. `publish_and_public_page` (Weight: 15%)
6. `timeline_and_persistence` (Weight: 10%)
7. `share_flow` (Weight: 10%)
8. `route_health` (Weight: 10%)

**Schema for a test case:**
```json
{
  "id": "TC-XYZ-001",
  "title": "Clear description",
  "category": "one_of_the_8_categories",
  "priority": "P0",
  "weight": 3,
  "prdRequirementIds": ["PRD-1.1"],
  "mode": "browser", // or "api"
  "currentlyImplemented": true, // If false, failureClassification should be "prd_gap"
  "preconditions": [],
  "steps": [{ "action": "navigate", "target": "/" }],
  "assertions": [{ "type": "visible", "selector": ".card" }],
  "expectedBehavior": "What should happen",
  "failureClassification": "bug" // default
}
```

## 5. Scoring Model
Implementation for `scoring.js` must calculate 3 distinct scores:
- **PRD Compliance (70%)**: Weighted average of ALL category scores, including tests marked as PRD gaps. Measures how close the feature is to MVP.
- **Live Execution (20%)**: Weighted average of ONLY tests with `currentlyImplemented: true`. Measures if the code we actually wrote works.
- **Reliability (10%)**: Percentage of tests that did not fail due to an `environment_issue` or timeout.

## 6. HTML Report Generator
The `report.js` script must generate a self-contained, dark-themed (bg: `#0a0a12`, cards: `#1a1a2e`, primary: `#6366f1` / `#7c3aed`) HTML report. It must contain:
- Executive Summary with the 3 composite scores
- PRD Requirement Coverage matrix
- Category Score Breakdown (with horizontal progress bars)
- Test Case Matrix loop (with filters for Passed, Failed, PRD Gaps)
- Top 5 Blockers to MVP Compliance (sorted by test weight)
