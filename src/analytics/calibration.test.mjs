import test from 'node:test';
import assert from 'node:assert/strict';
import { brierScore, calibrationSummary } from './calibration.mjs';

const records = [
  { prediction_id: '1', probabilities: { profit: 0.8, flat: 0.1, loss: 0.1 }, outcome: 'profit' },
  { prediction_id: '2', probabilities: { profit: 0.2, flat: 0.7, loss: 0.1 }, outcome: 'flat' },
  { prediction_id: '3', probabilities: { profit: 0.1, flat: 0.2, loss: 0.7 }, outcome: 'loss' },
  { prediction_id: '4', probabilities: { profit: 0.7, flat: 0.2, loss: 0.1 } },
];

test('computes multiclass Brier score only from resolved predictions', () => {
  assert.equal(brierScore(records), 0.12);
});

test('computes accuracy and outcome distribution', () => {
  assert.deepEqual(calibrationSummary(records), {
    resolved: 3,
    accuracy: 1,
    brierScore: 0.12,
    byOutcome: { profit: 1, flat: 1, loss: 1 },
  });
});

test('returns empty analytics when nothing is resolved', () => {
  assert.deepEqual(calibrationSummary(records.slice(3)), {
    resolved: 0,
    accuracy: null,
    brierScore: null,
    byOutcome: {},
  });
});
