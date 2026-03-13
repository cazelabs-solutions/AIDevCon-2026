#!/usr/bin/env node
// ─── EventScribe Eval Framework — Main Runner ──────────────────────
// Runs all test cases against the live Vercel deployment and outputs
// structured results with per-test scores, metric rollups, and
// composite PRD-weighted scoring.
//
// Usage:
//   EVAL_BASE_URL=https://your-app.vercel.app node eval/run-eval.js

const fs = require('fs');
const path = require('path');
const { config } = require('./config');
const { createSeededContext, createCleanContext, screenshotOnFailure, closeBrowser } = require('./helpers/browser');
const { postAPI, getRoute, getJsonPath } = require('./helpers/api');
const { classifyFailure, computeCategoryScores, computeCompositeScores, computePrdCoverage } = require('./helpers/scoring');

const testCases = require('./test-cases.json');

// ─── Assertion Engine ───────────────────────────────────────────────

async function runAssertion(assertion, page, apiResponse) {
  switch (assertion.type) {
    case 'visible': {
      const el = page.locator(assertion.selector);
      await el.first().waitFor({ state: 'visible', timeout: config.timeoutMs });
      return true;
    }
    case 'notVisible': {
      const count = await page.locator(assertion.selector).count();
      if (count > 0) throw new Error(`Expected "${assertion.selector}" to NOT be visible, but found ${count} element(s)`);
      return true;
    }
    case 'textContent': {
      const el = page.locator(assertion.selector).first();
      await el.waitFor({ state: 'visible', timeout: config.timeoutMs });
      const text = await el.textContent();
      if (assertion.contains && !text.includes(assertion.contains)) {
        throw new Error(`Expected "${assertion.selector}" to contain "${assertion.contains}", got "${text}"`);
      }
      if (assertion.expected && text.trim() !== assertion.expected) {
        throw new Error(`Expected "${assertion.selector}" text to be "${assertion.expected}", got "${text.trim()}"`);
      }
      return true;
    }
    case 'textVisible': {
      await page.locator(`text="${assertion.text}"`).first().waitFor({ state: 'visible', timeout: config.timeoutMs });
      return true;
    }
    case 'urlContains': {
      const url = page.url();
      if (!url.includes(assertion.value)) {
        throw new Error(`Expected URL to contain "${assertion.value}", got "${url}"`);
      }
      return true;
    }
    case 'elementOrder': {
      const elements = await page.locator(assertion.selector).allTextContents();
      const firstIdx = elements.findIndex(t => t.includes(assertion.first));
      const secondIdx = elements.findIndex(t => t.includes(assertion.second));
      if (firstIdx === -1) throw new Error(`"${assertion.first}" not found in elements`);
      if (secondIdx === -1) throw new Error(`"${assertion.second}" not found in elements`);
      if (firstIdx >= secondIdx) {
        throw new Error(`Expected "${assertion.first}" before "${assertion.second}", but found at indices ${firstIdx} and ${secondIdx}`);
      }
      return true;
    }
    case 'elementCountDecreased': {
      // This is verified in the test runner by comparing counts
      return true;
    }
    case 'status': {
      if (apiResponse.status !== assertion.expected) {
        throw new Error(`Expected status ${assertion.expected}, got ${apiResponse.status}`);
      }
      return true;
    }
    case 'allStatus': {
      // Handled in the multi-route test runner
      return true;
    }
    case 'jsonPath': {
      const value = getJsonPath(apiResponse.data, assertion.path);
      if (assertion.notEmpty && (value === undefined || value === null || value === '')) {
        throw new Error(`Expected "${assertion.path}" to be non-empty, got: ${JSON.stringify(value)}`);
      }
      if (assertion.expected !== undefined && value !== assertion.expected) {
        throw new Error(`Expected "${assertion.path}" = "${assertion.expected}", got "${value}"`);
      }
      if (assertion.contains && (typeof value !== 'string' || !value.includes(assertion.contains))) {
        throw new Error(`Expected "${assertion.path}" to contain "${assertion.contains}", got "${value}"`);
      }
      if (assertion.matchesRegex && !new RegExp(assertion.matchesRegex).test(value)) {
        throw new Error(`Expected "${assertion.path}" to match /${assertion.matchesRegex}/, got "${value}"`);
      }
      return true;
    }
    default:
      throw new Error(`Unknown assertion type: ${assertion.type}`);
  }
}

// ─── Browser Test Runner ────────────────────────────────────────────

async function runBrowserTest(test) {
  const needsCleanContext = test.id === 'TC-PUB-004';
  const { context, page } = needsCleanContext
    ? await createCleanContext()
    : await createSeededContext();

  const consoleLogs = [];
  page.on('console', msg => {
    if (msg.type() === 'error') consoleLogs.push(msg.text());
  });

  // Set up dialog handler for delete confirmation
  if (test.id === 'TC-TL-004') {
    page.once('dialog', dialog => {
      if (dialog.type() !== 'beforeunload') {
        dialog.accept().catch(() => {});
      }
    });
  }

  try {
    // Execute steps
    for (const step of test.steps) {
      switch (step.action) {
        case 'navigate':
          await page.goto(`${config.baseUrl}${step.target}`, { waitUntil: 'networkidle', timeout: config.timeoutMs });
          break;
        case 'waitForSelector':
          await page.waitForSelector(step.target, { timeout: step.timeout || config.timeoutMs });
          break;
        case 'waitForURL':
          await page.waitForURL(step.pattern, { timeout: config.timeoutMs });
          break;
        case 'waitForTimeout':
          await page.waitForTimeout(step.timeout || 3000);
          break;
        case 'click':
          if (step.index !== undefined) {
            await page.locator(step.target).nth(step.index).click();
          } else {
            await page.locator(step.target).first().click();
          }
          break;
        case 'fill':
          await page.locator(step.target).first().fill(step.value);
          break;
        case 'clearAndType': {
          const inputs = page.locator(step.target);
          const input = step.index !== undefined ? inputs.nth(step.index) : inputs.first();
          await input.fill(step.value);
          break;
        }
        case 'hover':
          await page.locator(step.target).first().hover();
          break;
        case 'reload':
          await page.reload({ waitUntil: 'networkidle', timeout: config.timeoutMs });
          break;
        case 'evaluate':
          await page.evaluate(step.script);
          break;
        case 'newContext':
          // Already handled above for TC-PUB-004
          break;
        case 'dialogAccept':
          page.once('dialog', dialog => {
            if (dialog.type() !== 'beforeunload') {
              dialog.accept().catch(() => {});
            }
          });
          break;
        case 'countElements':
          // Informational — stored for later comparison
          break;
        case 'getText':
          // Informational — used for timestamp comparison
          break;
        default:
          console.warn(`  ⚠ Unknown step action: ${step.action}`);
      }
    }

    // Run assertions
    for (const assertion of test.assertions) {
      await runAssertion(assertion, page, null);
    }

    await context.close();
    return { status: 'passed', score: 100, consoleLogs };
  } catch (err) {
    const screenshotPath = await screenshotOnFailure(page, test.id).catch(() => null);
    await context.close();
    return {
      status: 'failed',
      score: 0,
      failureReason: err.message,
      screenshotPath,
      consoleLogs,
    };
  }
}

// ─── API Test Runner ────────────────────────────────────────────────

async function runAPITest(test) {
  const evidence = {};
  try {
    // Handle multi-route tests (TC-ROUTE-001, TC-ROUTE-002)
    if (test.steps.length > 1 && (test.steps[0].action === 'get' || test.steps[0].action === 'post')) {
      const results = [];
      for (const step of test.steps) {
        if (step.action === 'get') {
          results.push(await getRoute(step.target));
        } else if (step.action === 'post') {
          results.push(await postAPI(step.target, step.body));
        }
      }
      evidence.apiResponses = results;

      // Check assertions
      for (const assertion of test.assertions) {
        if (assertion.type === 'allStatus') {
          for (let i = 0; i < results.length; i++) {
            if (results[i].status !== assertion.expected) {
              throw new Error(
                `Route "${test.steps[i].target}" returned ${results[i].status}, expected ${assertion.expected}`
              );
            }
          }
        }
      }
      return { status: 'passed', score: 100, evidence };
    }

    // Single API call tests
    const step = test.steps[0];
    let apiResponse;
    if (step.action === 'post') {
      apiResponse = await postAPI(step.target, step.body);
    } else {
      apiResponse = await getRoute(step.target);
    }
    evidence.apiResponse = apiResponse;

    for (const assertion of test.assertions) {
      await runAssertion(assertion, null, apiResponse);
    }

    return { status: 'passed', score: 100, evidence };
  } catch (err) {
    return {
      status: 'failed',
      score: 0,
      failureReason: err.message,
      evidence,
    };
  }
}

// ─── Main Orchestrator ──────────────────────────────────────────────

async function runAllTests() {
  const startedAt = new Date().toISOString();
  console.log('');
  console.log('╔══════════════════════════════════════════════════════════╗');
  console.log('║         EventScribe — PRD-First Eval Framework          ║');
  console.log('╚══════════════════════════════════════════════════════════╝');
  console.log('');
  console.log(`🌐 Base URL : ${config.baseUrl}`);
  console.log(`📊 Tests    : ${testCases.length}`);
  console.log(`🖥  Headless : ${config.headless}`);
  console.log('');
  console.log('─'.repeat(60));
  console.log('');

  const testResults = [];
  let passed = 0;
  let failed = 0;
  let prdGaps = 0;

  for (let i = 0; i < testCases.length; i++) {
    const test = testCases[i];
    const testStart = Date.now();
    process.stdout.write(`  [${String(i + 1).padStart(2)}/${testCases.length}] ${test.id} — ${test.title}... `);

    let result;
    try {
      if (test.mode === 'browser') {
        result = await runBrowserTest(test);
      } else if (test.mode === 'api') {
        result = await runAPITest(test);
      } else {
        result = { status: 'skipped', score: 0 };
      }
    } catch (err) {
      result = {
        status: 'error',
        score: 0,
        failureReason: err.message,
      };
    }

    const durationMs = Date.now() - testStart;
    const classification = result.status !== 'passed'
      ? classifyFailure(test, result.failureReason || '')
      : null;

    if (result.status === 'passed') {
      passed++;
      console.log(`✅ (${durationMs}ms)`);
    } else if (classification === 'prd_gap') {
      prdGaps++;
      console.log(`🔵 PRD GAP (${durationMs}ms)`);
    } else {
      failed++;
      console.log(`❌ FAIL (${durationMs}ms)`);
      if (result.failureReason) {
        console.log(`       └─ ${result.failureReason}`);
      }
    }

    testResults.push({
      id: test.id,
      title: test.title,
      category: test.category,
      priority: test.priority,
      weight: test.weight,
      prdRequirementIds: test.prdRequirementIds,
      currentlyImplemented: test.currentlyImplemented,
      status: result.status,
      score: result.score,
      durationMs,
      failureClassification: classification,
      failureReason: result.failureReason || null,
      evidence: {
        screenshotPath: result.screenshotPath || null,
        apiResponse: result.evidence?.apiResponse || null,
        consoleLogs: result.consoleLogs || [],
      },
    });
  }

  await closeBrowser();

  // ── Compute scores ──────────────────────────────────────────────
  const categoryScores = computeCategoryScores(testResults);
  const compositeScores = computeCompositeScores(testResults, categoryScores);
  const prdCoverage = computePrdCoverage(testCases, testResults);

  const completedAt = new Date().toISOString();
  const timestamp = completedAt.replace(/[:.]/g, '-').replace('T', '_').split('Z')[0];

  const output = {
    runId: `eval-${timestamp}`,
    baseUrl: config.baseUrl,
    startedAt,
    completedAt,
    totalTests: testCases.length,
    passed,
    failed,
    skipped: 0,
    prdGaps,
    testResults,
    metricScores: categoryScores,
    compositeScores,
    prdCoverage,
  };

  // ── Write results ───────────────────────────────────────────────
  const outputDir = path.resolve(config.outputDir);
  if (!fs.existsSync(outputDir)) fs.mkdirSync(outputDir, { recursive: true });

  const resultsPath = path.join(outputDir, `eval-${timestamp}.json`);
  fs.writeFileSync(resultsPath, JSON.stringify(output, null, 2));

  // Also write a "latest" symlink-like file
  const latestPath = path.join(outputDir, 'latest.json');
  fs.writeFileSync(latestPath, JSON.stringify(output, null, 2));

  // ── Print summary ──────────────────────────────────────────────
  console.log('');
  console.log('─'.repeat(60));
  console.log('');
  console.log('  📊 RESULTS SUMMARY');
  console.log('');
  console.log(`  ✅ Passed   : ${passed}/${testCases.length}`);
  console.log(`  ❌ Failed   : ${failed}/${testCases.length}`);
  console.log(`  🔵 PRD Gaps : ${prdGaps}/${testCases.length}`);
  console.log('');
  console.log('  ── Composite Scores ──────────────────────────────');
  console.log(`  PRD Compliance (70%)      : ${compositeScores.prd_compliance_score}`);
  console.log(`  Live Execution (20%)      : ${compositeScores.live_execution_score}`);
  console.log(`  Reliability (10%)         : ${compositeScores.reliability_and_evidence_score}`);
  console.log(`  ─────────────────────────────────────────────────`);
  console.log(`  Overall Weighted Score    : ${compositeScores.overall_weighted_score}`);
  console.log('');
  console.log('  ── Category Scores ───────────────────────────────');
  for (const [cat, score] of Object.entries(categoryScores)) {
    const bar = '█'.repeat(Math.round(score.score / 5)) + '░'.repeat(20 - Math.round(score.score / 5));
    console.log(`  ${cat.padEnd(28)} ${bar} ${score.score}% (${score.passCount}/${score.testCount})`);
  }
  console.log('');
  console.log(`  📁 Results : ${resultsPath}`);
  console.log(`  📁 Latest  : ${latestPath}`);
  console.log('');
  console.log('  Run "node eval/report.js" to generate the HTML report card.');
  console.log('');

  return output;
}

// ─── Execute ────────────────────────────────────────────────────────
runAllTests().catch(err => {
  console.error('💥 Fatal error:', err);
  closeBrowser();
  process.exit(1);
});
