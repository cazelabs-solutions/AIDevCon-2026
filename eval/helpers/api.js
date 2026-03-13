// ─── API Helpers — fetch-based HTTP test utilities ──────────────────
const { config } = require('../config');

/**
 * POST to an API endpoint.
 * @returns {{ status, data, error, durationMs }}
 */
async function postAPI(path, body) {
  const url = `${config.baseUrl}${path}`;
  const start = Date.now();
  try {
    const res = await fetch(url, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(body),
      signal: AbortSignal.timeout(config.timeoutMs),
    });
    const data = await res.json().catch(() => null);
    return {
      status: res.status,
      data,
      error: null,
      durationMs: Date.now() - start,
    };
  } catch (err) {
    return {
      status: null,
      data: null,
      error: err.message,
      durationMs: Date.now() - start,
    };
  }
}

/**
 * GET a route and return status + timing.
 * @returns {{ status, durationMs, error }}
 */
async function getRoute(path) {
  const url = `${config.baseUrl}${path}`;
  const start = Date.now();
  try {
    const res = await fetch(url, {
      method: 'GET',
      signal: AbortSignal.timeout(config.timeoutMs),
    });
    return {
      status: res.status,
      durationMs: Date.now() - start,
      error: null,
    };
  } catch (err) {
    return {
      status: null,
      durationMs: Date.now() - start,
      error: err.message,
    };
  }
}

/**
 * Deep access a JSON path like "meta.title"
 */
function getJsonPath(obj, path) {
  return path.split('.').reduce((o, k) => (o != null ? o[k] : undefined), obj);
}

module.exports = { postAPI, getRoute, getJsonPath };
