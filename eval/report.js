#!/usr/bin/env node
// ─── EventScribe Eval Framework — HTML Report Generator ─────────────
// Reads the latest eval results and generates a self-contained HTML
// report card with dark theme matching EventScribe aesthetic.
//
// Usage:
//   node eval/report.js

const fs = require('fs');
const path = require('path');
const { config } = require('./config');

const outputDir = path.resolve(config.outputDir);
const latestPath = path.join(outputDir, 'latest.json');

if (!fs.existsSync(latestPath)) {
  console.error('❌  No results found. Run "node eval/run-eval.js" first.');
  process.exit(1);
}

const results = JSON.parse(fs.readFileSync(latestPath, 'utf-8'));

// ─── Helpers ────────────────────────────────────────────────────────

function statusIcon(status) {
  switch (status) {
    case 'passed': return '✅';
    case 'failed': return '❌';
    case 'skipped': return '⏭️';
    case 'error': return '💥';
    default: return '❓';
  }
}

function classificationBadge(classification) {
  if (!classification) return '';
  const colors = {
    prd_gap: 'background: #3b82f6; color: white;',
    bug: 'background: #ef4444; color: white;',
    regression: 'background: #f97316; color: white;',
    environment_issue: 'background: #eab308; color: black;',
  };
  return `<span class="badge" style="${colors[classification] || ''}">${classification.replace('_', ' ')}</span>`;
}

function scoreColor(score) {
  if (score >= 80) return '#22c55e';
  if (score >= 50) return '#eab308';
  return '#ef4444';
}

function barHTML(score, maxWidth = 200) {
  const color = scoreColor(score);
  const width = Math.round((score / 100) * maxWidth);
  return `<div class="bar-bg"><div class="bar-fill" style="width: ${width}px; background: ${color};"></div><span class="bar-label">${score}%</span></div>`;
}

// ─── Build category rows ────────────────────────────────────────────

function buildCategoryRows() {
  return Object.entries(results.metricScores).map(([cat, data]) => {
    return `<tr>
      <td class="cat-name">${cat.replace(/_/g, ' ')}</td>
      <td>${barHTML(data.score)}</td>
      <td class="num">${data.passCount}/${data.testCount}</td>
    </tr>`;
  }).join('\n');
}

// ─── Build test matrix rows ─────────────────────────────────────────

function buildTestRows() {
  return results.testResults.map(t => {
    const icon = statusIcon(t.status);
    const badge = classificationBadge(t.failureClassification);
    const reason = t.failureReason
      ? `<div class="failure-reason">${escapeHtml(t.failureReason)}</div>`
      : '';
    return `<tr class="test-row ${t.status}">
      <td class="test-id">${t.id}</td>
      <td>${escapeHtml(t.title)}</td>
      <td class="cat-name">${t.category.replace(/_/g, ' ')}</td>
      <td class="center">${t.priority}</td>
      <td class="center">${icon}</td>
      <td class="center">${badge}</td>
      <td class="num">${t.durationMs}ms</td>
    </tr>${reason ? `<tr class="reason-row ${t.status}"><td colspan="7">${reason}</td></tr>` : ''}`;
  }).join('\n');
}

// ─── Build top blockers ─────────────────────────────────────────────

function buildBlockers() {
  const failures = results.testResults
    .filter(t => t.status !== 'passed')
    .sort((a, b) => b.weight - a.weight)
    .slice(0, 5);

  if (failures.length === 0) return '<p class="success-note">No blockers — all tests passing! 🎉</p>';

  return failures.map((t, i) => {
    const badge = classificationBadge(t.failureClassification);
    return `<div class="blocker">
      <div class="blocker-header">
        <span class="blocker-rank">#${i + 1}</span>
        <strong>${t.id}</strong> — ${escapeHtml(t.title)}
        ${badge}
      </div>
      <div class="blocker-detail">
        <span>Category: ${t.category.replace(/_/g, ' ')}</span>
        <span>Priority: ${t.priority}</span>
        <span>Weight: ${t.weight}</span>
      </div>
      ${t.failureReason ? `<div class="blocker-reason">${escapeHtml(t.failureReason)}</div>` : ''}
    </div>`;
  }).join('\n');
}

// ─── Build PRD coverage table ───────────────────────────────────────

function buildPrdCoverageRows() {
  // Group tests by category and summarize status
  const categories = {};
  for (const t of results.testResults) {
    if (!categories[t.category]) {
      categories[t.category] = { tests: [], passed: 0, failed: 0, prdGaps: 0 };
    }
    categories[t.category].tests.push(t);
    if (t.status === 'passed') categories[t.category].passed++;
    else if (t.failureClassification === 'prd_gap') categories[t.category].prdGaps++;
    else categories[t.category].failed++;
  }

  return Object.entries(categories).map(([cat, data]) => {
    let statusCell;
    if (data.prdGaps > 0) {
      statusCell = `<span class="status-gap">❌ PRD Gap (${data.prdGaps})</span>`;
    } else if (data.failed > 0) {
      statusCell = `<span class="status-fail">⚠️ Failing (${data.failed})</span>`;
    } else {
      statusCell = `<span class="status-pass">✅ Passing</span>`;
    }

    const testIds = data.tests.map(t => t.id).join(', ');
    return `<tr>
      <td class="cat-name">${cat.replace(/_/g, ' ')}</td>
      <td>${statusCell}</td>
      <td class="test-ids">${testIds}</td>
      <td class="num">${data.passed}/${data.tests.length}</td>
    </tr>`;
  }).join('\n');
}

function escapeHtml(str) {
  return str.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');
}

// ─── Generate HTML ──────────────────────────────────────────────────

const html = `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>EventScribe Eval Report — ${results.runId}</title>
  <style>
    :root {
      --bg-primary: #0a0a12;
      --bg-secondary: #12121f;
      --bg-card: #1a1a2e;
      --bg-hover: #222240;
      --border: rgba(99, 102, 241, 0.15);
      --text-primary: #f0f0f5;
      --text-secondary: #a0a0b5;
      --text-muted: #6b6b85;
      --indigo: #6366f1;
      --violet: #7c3aed;
      --green: #22c55e;
      --red: #ef4444;
      --amber: #eab308;
      --blue: #3b82f6;
    }

    * { margin: 0; padding: 0; box-sizing: border-box; }

    body {
      font-family: 'Inter', -apple-system, BlinkMacSystemFont, sans-serif;
      background: var(--bg-primary);
      color: var(--text-primary);
      line-height: 1.6;
      padding: 2rem;
    }

    .container { max-width: 1100px; margin: 0 auto; }

    h1 {
      font-size: 2rem;
      background: linear-gradient(135deg, var(--indigo), var(--violet));
      -webkit-background-clip: text;
      -webkit-text-fill-color: transparent;
      margin-bottom: 0.5rem;
    }

    .subtitle { color: var(--text-muted); font-size: 0.875rem; margin-bottom: 2rem; }

    .score-hero {
      display: flex;
      gap: 1.5rem;
      margin-bottom: 2rem;
      flex-wrap: wrap;
    }

    .score-card {
      flex: 1;
      min-width: 200px;
      background: var(--bg-card);
      border: 1px solid var(--border);
      border-radius: 16px;
      padding: 1.5rem;
      text-align: center;
    }

    .score-card.hero {
      background: linear-gradient(135deg, rgba(99, 102, 241, 0.15), rgba(124, 58, 237, 0.15));
      border-color: rgba(99, 102, 241, 0.3);
    }

    .score-number {
      font-size: 2.5rem;
      font-weight: 800;
      line-height: 1;
      margin: 0.5rem 0;
    }

    .score-label {
      font-size: 0.75rem;
      color: var(--text-muted);
      text-transform: uppercase;
      letter-spacing: 0.05em;
    }

    .score-detail {
      font-size: 0.8rem;
      color: var(--text-secondary);
      margin-top: 0.25rem;
    }

    .stats-row {
      display: flex;
      gap: 1rem;
      margin-bottom: 2rem;
      flex-wrap: wrap;
    }

    .stat-badge {
      display: inline-flex;
      align-items: center;
      gap: 0.5rem;
      padding: 0.5rem 1rem;
      border-radius: 12px;
      font-size: 0.875rem;
      font-weight: 600;
    }

    .stat-badge.passed { background: rgba(34, 197, 94, 0.15); color: var(--green); }
    .stat-badge.failed { background: rgba(239, 68, 68, 0.15); color: var(--red); }
    .stat-badge.gap { background: rgba(59, 130, 246, 0.15); color: var(--blue); }

    section { margin-bottom: 2.5rem; }
    h2 {
      font-size: 1.25rem;
      margin-bottom: 1rem;
      display: flex;
      align-items: center;
      gap: 0.5rem;
    }
    h2::before {
      content: '';
      display: block;
      width: 4px;
      height: 1.25rem;
      border-radius: 2px;
      background: linear-gradient(180deg, var(--indigo), var(--violet));
    }

    table {
      width: 100%;
      border-collapse: collapse;
      background: var(--bg-card);
      border-radius: 12px;
      overflow: hidden;
      border: 1px solid var(--border);
    }

    th {
      background: var(--bg-secondary);
      text-align: left;
      padding: 0.75rem 1rem;
      font-size: 0.75rem;
      text-transform: uppercase;
      letter-spacing: 0.05em;
      color: var(--text-muted);
      border-bottom: 1px solid var(--border);
    }

    td {
      padding: 0.625rem 1rem;
      font-size: 0.85rem;
      border-bottom: 1px solid rgba(99, 102, 241, 0.07);
      color: var(--text-secondary);
    }

    tr:last-child td { border-bottom: none; }
    tr:hover td { background: var(--bg-hover); }

    .cat-name { text-transform: capitalize; color: var(--text-primary); font-weight: 500; }
    .test-id { font-family: monospace; font-size: 0.8rem; color: var(--indigo); white-space: nowrap; }
    .test-ids { font-family: monospace; font-size: 0.75rem; }
    .num { text-align: right; font-variant-numeric: tabular-nums; }
    .center { text-align: center; }

    .bar-bg {
      display: flex;
      align-items: center;
      gap: 0.5rem;
      height: 22px;
    }
    .bar-fill {
      height: 8px;
      border-radius: 4px;
      transition: width 0.3s ease;
    }
    .bar-label {
      font-size: 0.8rem;
      font-weight: 600;
      min-width: 36px;
    }

    .badge {
      display: inline-block;
      padding: 0.125rem 0.5rem;
      border-radius: 6px;
      font-size: 0.7rem;
      font-weight: 600;
      text-transform: uppercase;
      letter-spacing: 0.03em;
    }

    .status-pass { color: var(--green); }
    .status-fail { color: var(--amber); }
    .status-gap { color: var(--blue); }

    .failure-reason {
      font-size: 0.8rem;
      color: var(--red);
      padding: 0.25rem 1rem 0.5rem 1rem;
      font-family: monospace;
      word-break: break-all;
    }

    .reason-row td {
      padding-top: 0;
      border-bottom: 1px solid rgba(239, 68, 68, 0.1);
    }

    .reason-row:hover td { background: inherit; }

    .test-row.failed td { background: rgba(239, 68, 68, 0.03); }

    .blocker {
      background: var(--bg-card);
      border: 1px solid var(--border);
      border-radius: 12px;
      padding: 1rem 1.25rem;
      margin-bottom: 0.75rem;
    }

    .blocker-header {
      display: flex;
      align-items: center;
      gap: 0.5rem;
      flex-wrap: wrap;
    }

    .blocker-rank {
      font-weight: 800;
      color: var(--indigo);
      font-size: 0.9rem;
    }

    .blocker-detail {
      margin-top: 0.5rem;
      display: flex;
      gap: 1rem;
      font-size: 0.8rem;
      color: var(--text-muted);
    }

    .blocker-reason {
      margin-top: 0.5rem;
      font-size: 0.8rem;
      color: var(--red);
      font-family: monospace;
    }

    .success-note {
      color: var(--green);
      font-weight: 600;
      font-size: 1.1rem;
      padding: 1rem;
    }

    .footer {
      text-align: center;
      color: var(--text-muted);
      font-size: 0.75rem;
      padding: 2rem 0;
      border-top: 1px solid var(--border);
    }

    .filter-bar {
      display: flex;
      gap: 0.5rem;
      margin-bottom: 1rem;
    }

    .filter-btn {
      padding: 0.5rem 1rem;
      border-radius: 8px;
      border: 1px solid var(--border);
      background: var(--bg-card);
      color: var(--text-secondary);
      font-size: 0.8rem;
      cursor: pointer;
      font-family: inherit;
    }

    .filter-btn:hover { background: var(--bg-hover); color: var(--text-primary); }
    .filter-btn.active {
      background: rgba(99, 102, 241, 0.15);
      border-color: var(--indigo);
      color: var(--indigo);
    }

    @media (max-width: 768px) {
      body { padding: 1rem; }
      .score-hero { flex-direction: column; }
      .score-card { min-width: auto; }
      table { font-size: 0.75rem; }
      td, th { padding: 0.5rem; }
    }
  </style>
</head>
<body>
  <div class="container">
    <!-- Header -->
    <h1>EventScribe — Eval Report Card</h1>
    <p class="subtitle">
      Run: ${results.runId} &nbsp;|&nbsp;
      Base URL: ${escapeHtml(results.baseUrl)} &nbsp;|&nbsp;
      ${new Date(results.completedAt).toLocaleString()}
    </p>

    <!-- Executive Summary -->
    <div class="score-hero">
      <div class="score-card hero">
        <div class="score-label">Overall Weighted Score</div>
        <div class="score-number" style="color: ${scoreColor(results.compositeScores.overall_weighted_score)}">
          ${results.compositeScores.overall_weighted_score}
        </div>
        <div class="score-detail">${results.passed} passed / ${results.failed} failed / ${results.prdGaps} PRD gaps</div>
      </div>
      <div class="score-card">
        <div class="score-label">PRD Compliance (70%)</div>
        <div class="score-number" style="color: ${scoreColor(results.compositeScores.prd_compliance_score)}">
          ${results.compositeScores.prd_compliance_score}
        </div>
      </div>
      <div class="score-card">
        <div class="score-label">Live Execution (20%)</div>
        <div class="score-number" style="color: ${scoreColor(results.compositeScores.live_execution_score)}">
          ${results.compositeScores.live_execution_score}
        </div>
      </div>
      <div class="score-card">
        <div class="score-label">Reliability (10%)</div>
        <div class="score-number" style="color: ${scoreColor(results.compositeScores.reliability_and_evidence_score)}">
          ${results.compositeScores.reliability_and_evidence_score}
        </div>
      </div>
    </div>

    <div class="stats-row">
      <span class="stat-badge passed">✅ ${results.passed} Passed</span>
      <span class="stat-badge failed">❌ ${results.failed} Failed</span>
      <span class="stat-badge gap">🔵 ${results.prdGaps} PRD Gaps</span>
    </div>

    <!-- PRD Coverage -->
    <section>
      <h2>PRD Requirement Coverage</h2>
      <table>
        <thead>
          <tr>
            <th>Capability</th>
            <th>Status</th>
            <th>Test Cases</th>
            <th style="text-align:right">Pass Rate</th>
          </tr>
        </thead>
        <tbody>
          ${buildPrdCoverageRows()}
        </tbody>
      </table>
    </section>

    <!-- Category Scores -->
    <section>
      <h2>Category Score Breakdown</h2>
      <table>
        <thead>
          <tr>
            <th>Category</th>
            <th>Score</th>
            <th style="text-align:right">Tests</th>
          </tr>
        </thead>
        <tbody>
          ${buildCategoryRows()}
        </tbody>
      </table>
    </section>

    <!-- Test Case Matrix -->
    <section>
      <h2>Test Case Matrix</h2>
      <div class="filter-bar">
        <button class="filter-btn active" onclick="filterTests('all')">All (${results.totalTests})</button>
        <button class="filter-btn" onclick="filterTests('passed')">Passed (${results.passed})</button>
        <button class="filter-btn" onclick="filterTests('failed')">Failed (${results.failed})</button>
        <button class="filter-btn" onclick="filterTests('prd_gap')">PRD Gaps (${results.prdGaps})</button>
      </div>
      <table id="test-table">
        <thead>
          <tr>
            <th>ID</th>
            <th>Title</th>
            <th>Category</th>
            <th>Priority</th>
            <th>Status</th>
            <th>Classification</th>
            <th style="text-align:right">Duration</th>
          </tr>
        </thead>
        <tbody>
          ${buildTestRows()}
        </tbody>
      </table>
    </section>

    <!-- Top Blockers -->
    <section>
      <h2>Top Blockers to MVP Compliance</h2>
      ${buildBlockers()}
    </section>

    <!-- Footer -->
    <div class="footer">
      EventScribe Eval Framework &nbsp;|&nbsp; PRD-First Scoring Model (70/20/10) &nbsp;|&nbsp;
      Generated ${new Date().toISOString()}
    </div>
  </div>

  <script>
    function filterTests(type) {
      const rows = document.querySelectorAll('#test-table tbody tr');
      const buttons = document.querySelectorAll('.filter-btn');
      buttons.forEach(b => b.classList.remove('active'));
      event.target.classList.add('active');

      rows.forEach(row => {
        if (type === 'all') {
          row.style.display = '';
          return;
        }
        const isTestRow = row.classList.contains('test-row');
        const isReasonRow = row.classList.contains('reason-row');

        if (isTestRow) {
          let show = false;
          if (type === 'passed') show = row.classList.contains('passed');
          else if (type === 'failed') show = row.classList.contains('failed') || row.classList.contains('error');
          else if (type === 'prd_gap') {
            const badge = row.querySelector('.badge');
            show = badge && badge.textContent.includes('prd gap');
          }
          row.style.display = show ? '' : 'none';
        }

        if (isReasonRow) {
          const prevRow = row.previousElementSibling;
          row.style.display = prevRow && prevRow.style.display !== 'none' ? '' : 'none';
        }
      });
    }
  </script>
</body>
</html>`;

// ─── Write report ───────────────────────────────────────────────────
const timestamp = new Date().toISOString().replace(/[:.]/g, '-').split('Z')[0];
const reportPath = path.join(outputDir, `report-${timestamp}.html`);
const latestReportPath = path.join(outputDir, 'report-latest.html');

fs.writeFileSync(reportPath, html);
fs.writeFileSync(latestReportPath, html);

console.log('');
console.log('╔══════════════════════════════════════════════════════════╗');
console.log('║             EventScribe — Report Generated              ║');
console.log('╚══════════════════════════════════════════════════════════╝');
console.log('');
console.log(`  📄 Report   : ${reportPath}`);
console.log(`  📄 Latest   : ${latestReportPath}`);
console.log('');
console.log(`  Open in browser: open ${latestReportPath}`);
console.log('');
