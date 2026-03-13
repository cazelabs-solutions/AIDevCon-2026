// ─── Browser Helpers — Playwright setup/teardown ────────────────────
const { chromium } = require('playwright');
const { config } = require('../config');

let browser = null;

/**
 * Launch browser (shared across all browser tests in a run).
 */
async function launchBrowser() {
  if (!browser) {
    browser = await chromium.launch({ headless: config.headless });
  }
  return browser;
}

/**
 * Create a fresh browser context with seed data initialized.
 * Navigates to / first to trigger localStorage seed, then returns context + page.
 */
async function createSeededContext() {
  const b = await launchBrowser();
  const context = await b.newContext();
  const page = await context.newPage();

  // Navigate to homepage to trigger seed initialization
  await page.goto(`${config.baseUrl}/`, { waitUntil: 'networkidle', timeout: config.timeoutMs });
  await page.waitForSelector('h1', { timeout: config.timeoutMs });

  return { context, page };
}

/**
 * Create a clean browser context (no localStorage, no seed data).
 */
async function createCleanContext() {
  const b = await launchBrowser();
  const context = await b.newContext();
  const page = await context.newPage();
  return { context, page };
}

/**
 * Take a screenshot on failure.
 */
async function screenshotOnFailure(page, testId) {
  if (!config.screenshotOnFailure) return null;
  const fs = require('fs');
  const path = require('path');
  const dir = path.resolve(config.outputDir);
  if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });
  const filePath = path.join(dir, `${testId}-failure.png`);
  await page.screenshot({ path: filePath, fullPage: true });
  return filePath;
}

/**
 * Close browser at end of eval run.
 */
async function closeBrowser() {
  if (browser) {
    await browser.close();
    browser = null;
  }
}

module.exports = { launchBrowser, createSeededContext, createCleanContext, screenshotOnFailure, closeBrowser };
