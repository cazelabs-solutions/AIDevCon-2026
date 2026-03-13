// ─── Scoring Engine ─────────────────────────────────────────────────
const metrics = require('../metrics.json');

/**
 * Classify a failure based on test metadata and error.
 */
function classifyFailure(test, error) {
  if (!test.currentlyImplemented) return 'prd_gap';
  if (error && (error.includes('timeout') || error.includes('net::') || error.includes('Navigation failed'))) {
    return 'environment_issue';
  }
  return test.failureClassification || 'bug';
}

/**
 * Compute per-category scores from test results.
 * Returns { [category]: { score, maxPossible, testCount, passCount } }
 */
function computeCategoryScores(testResults) {
  const categories = {};

  for (const result of testResults) {
    const cat = result.category;
    if (!categories[cat]) {
      categories[cat] = { totalWeight: 0, earnedWeight: 0, testCount: 0, passCount: 0 };
    }
    categories[cat].totalWeight += result.weight;
    categories[cat].testCount += 1;
    if (result.status === 'passed') {
      categories[cat].earnedWeight += result.weight;
      categories[cat].passCount += 1;
    }
  }

  const scores = {};
  for (const [cat, data] of Object.entries(categories)) {
    scores[cat] = {
      score: data.totalWeight > 0 ? Math.round((data.earnedWeight / data.totalWeight) * 100) : 0,
      maxPossible: 100,
      testCount: data.testCount,
      passCount: data.passCount,
    };
  }

  return scores;
}

/**
 * Compute the three composite scores and the overall weighted score.
 */
function computeCompositeScores(testResults, categoryScores) {
  const weights = metrics.compositeWeights;
  const catWeights = metrics.categories;

  // 1. PRD compliance score: weighted average of ALL categories
  let prdNumerator = 0;
  let prdDenominator = 0;
  for (const [cat, score] of Object.entries(categoryScores)) {
    const catWeight = catWeights[cat]?.weight || 0;
    prdNumerator += score.score * catWeight;
    prdDenominator += catWeight;
  }
  const prd_compliance_score = prdDenominator > 0
    ? Math.round((prdNumerator / prdDenominator) * 10) / 10
    : 0;

  // 2. Live execution score: only tests where currentlyImplemented === true
  const implementedResults = testResults.filter(r => r.currentlyImplemented);
  const implementedPassed = implementedResults.filter(r => r.status === 'passed');
  const totalImplWeight = implementedResults.reduce((s, r) => s + r.weight, 0);
  const passedImplWeight = implementedPassed.reduce((s, r) => s + r.weight, 0);
  const live_execution_score = totalImplWeight > 0
    ? Math.round((passedImplWeight / totalImplWeight) * 1000) / 10
    : 0;

  // 3. Reliability score: % of tests that didn't hit environment_issue or timeout
  const nonEnvResults = testResults.filter(r =>
    r.failureClassification !== 'environment_issue' && r.status !== 'error'
  );
  const reliability_and_evidence_score = testResults.length > 0
    ? Math.round((nonEnvResults.length / testResults.length) * 1000) / 10
    : 0;

  // Overall weighted score
  const overall_weighted_score = Math.round(
    (prd_compliance_score * weights.prd_compliance_score +
     live_execution_score * weights.live_execution_score +
     reliability_and_evidence_score * weights.reliability_and_evidence_score) * 10
  ) / 10;

  return {
    prd_compliance_score,
    live_execution_score,
    reliability_and_evidence_score,
    overall_weighted_score,
  };
}

/**
 * Compute PRD coverage stats.
 */
function computePrdCoverage(testCases, testResults) {
  const allPrdIds = new Set();
  const implementedPrdIds = new Set();
  const passingPrdIds = new Set();

  for (const tc of testCases) {
    for (const prdId of (tc.prdRequirementIds || [])) {
      allPrdIds.add(prdId);
      if (tc.currentlyImplemented) implementedPrdIds.add(prdId);
    }
  }

  for (const result of testResults) {
    if (result.status === 'passed') {
      for (const prdId of (result.prdRequirementIds || [])) {
        passingPrdIds.add(prdId);
      }
    }
  }

  return {
    totalRequirements: allPrdIds.size,
    implemented: implementedPrdIds.size,
    passing: passingPrdIds.size,
    gaps: allPrdIds.size - passingPrdIds.size,
  };
}

module.exports = { classifyFailure, computeCategoryScores, computeCompositeScores, computePrdCoverage };
