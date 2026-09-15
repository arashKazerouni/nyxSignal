const OUTCOMES = ['profit', 'flat', 'loss'];

function probabilityVector(probabilities) {
  return OUTCOMES.map((outcome) => Number(probabilities?.[outcome] ?? 0));
}

export function brierScore(records) {
  const resolved = records.filter((record) => OUTCOMES.includes(record.outcome));
  if (resolved.length === 0) return null;

  const total = resolved.reduce((sum, record) => {
    const probabilities = probabilityVector(record.probabilities);
    return sum + probabilities.reduce((score, probability, index) => {
      const actual = OUTCOMES[index] === record.outcome ? 1 : 0;
      return score + (probability - actual) ** 2;
    }, 0);
  }, 0);

  return Number((total / resolved.length).toFixed(6));
}

export function calibrationSummary(records) {
  const resolved = records.filter((record) => OUTCOMES.includes(record.outcome));
  const count = resolved.length;
  if (count === 0) {
    return { resolved: 0, accuracy: null, brierScore: null, byOutcome: {} };
  }

  const correct = resolved.filter((record) => {
    const probabilities = probabilityVector(record.probabilities);
    const predicted = OUTCOMES[probabilities.indexOf(Math.max(...probabilities))];
    return predicted === record.outcome;
  }).length;

  const byOutcome = Object.fromEntries(OUTCOMES.map((outcome) => [
    outcome,
    resolved.filter((record) => record.outcome === outcome).length,
  ]));

  return {
    resolved: count,
    accuracy: Number((correct / count).toFixed(4)),
    brierScore: brierScore(resolved),
    byOutcome,
  };
}

export { OUTCOMES };
