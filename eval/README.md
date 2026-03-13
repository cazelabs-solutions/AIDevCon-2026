# EventScribe — PRD-First Eval Framework

Automated evaluation framework that scores the live EventScribe Vercel deployment against the PRD and technical design, not just current behavior.

## Scoring Model

| Component | Weight | What It Measures |
|---|---|---|
| **PRD Compliance** | 70% | How much of the PRD is satisfied (includes expected-failure tests) |
| **Live Execution** | 20% | Do the implemented features actually work? |
| **Reliability** | 10% | Test stability, no environment issues |

## Quick Start

```bash
# 1. Install dependencies
cd eval
npm install
npx playwright install chromium

# 2. Run the eval suite
EVAL_BASE_URL=https://your-app.vercel.app node run-eval.js

# 3. Generate the HTML report
node report.js

# 4. Open the report
open results/report-latest.html
```

## Environment Variables

| Variable | Required | Default | Description |
|---|---|---|---|
| `EVAL_BASE_URL` | **Yes** | — | Vercel deployment URL |
| `EVAL_HEADLESS` | No | `true` | Set `false` to watch browser |
| `EVAL_TIMEOUT_MS` | No | `30000` | Per-test timeout (ms) |
| `EVAL_OUTPUT_DIR` | No | `eval/results` | Results output directory |
| `EVAL_SCREENSHOT_ON_FAILURE` | No | `true` | Capture screenshots |

## Test Coverage

**36 test cases** across 8 categories:

| Category | Tests | Description |
|---|---|---|
| Profile & Identity | 4 | CRUD, persistence, seed re-init |
| Event Intake & Extraction | 6 | URL extraction, API contracts, E2E creation |
| Sessions & Notes | 7 | CRUD operations, refresh persistence |
| AI Generation | 6 | API contract, UI flow, grounding checks |
| Publish & Public Page | 5 | Rendering, 404 handling, **2 PRD gaps** |
| Timeline & Persistence | 4 | Sorting, multi-event, deletion |
| Share Flow | 2 | Copy-to-clipboard, share buttons |
| Route Health | 2 | Status codes, method enforcement |

## Interpreting PRD Gaps

Tests marked `currentlyImplemented: false` are **expected to fail** based on the current prototype state. They are classified as `prd_gap` (blue badge) and scored — lowering the PRD compliance score to show the delta between current state and MVP.

Current known PRD gaps:
- **TC-PUB-004**: Public pages aren't accessible from a clean browser (localStorage-only persistence)
- **TC-PUB-005**: No explicit publish workflow or review gate

## Adding Test Cases

Add entries to `test-cases.json` following the schema:

```json
{
  "id": "TC-XXX-NNN",
  "title": "Description",
  "category": "category_name",
  "priority": "P0",
  "weight": 3,
  "prdRequirementIds": ["PRD-X.X"],
  "mode": "browser",
  "currentlyImplemented": true,
  "preconditions": [],
  "steps": [],
  "assertions": [],
  "expectedBehavior": "What should happen",
  "failureClassification": "bug"
}
```

## Output

- `results/eval-{timestamp}.json` — Structured results with per-test scores
- `results/latest.json` — Always points to the most recent run
- `results/report-latest.html` — Self-contained dark-themed HTML report card
- `results/*-failure.png` — Screenshots captured on UI test failures
