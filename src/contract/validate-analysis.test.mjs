import test from 'node:test';
import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';
import { validateAnalysis } from './validate-analysis.mjs';

const fixture = JSON.parse(
  await readFile(new URL('../../data/examples/2026-09-15-market-analysis.json', import.meta.url), 'utf8'),
);

function clone(value) {
  return structuredClone(value);
}

test('accepts the canonical market-analysis fixture', () => {
  const result = validateAnalysis(fixture);
  assert.equal(result.valid, true, result.errors.join('\n'));
  assert.equal(fixture.opportunities.length, 3);
});

test('rejects duplicate prediction IDs', () => {
  const input = clone(fixture);
  input.opportunities[1].prediction_id = input.opportunities[0].prediction_id;

  const result = validateAnalysis(input);
  assert.equal(result.valid, false);
  assert.match(result.errors.join('\n'), /prediction_id must be unique/);
});

test('rejects probability distributions that do not sum to one', () => {
  const input = clone(fixture);
  input.opportunities[0].probabilities.profit = 0.9;

  const result = validateAnalysis(input);
  assert.equal(result.valid, false);
  assert.match(result.errors.join('\n'), /probabilities must sum to 1/);
});

test('rejects allocation above its maximum exposure', () => {
  const input = clone(fixture);
  input.opportunities[0].allocation.recommended_percent = 9;

  const result = validateAnalysis(input);
  assert.equal(result.valid, false);
  assert.match(result.errors.join('\n'), /recommended_percent must not exceed maximum/);
});

test('rejects an inverted entry zone', () => {
  const input = clone(fixture);
  input.opportunities[0].entry_zone = { low: 2500, high: 2400 };

  const result = validateAnalysis(input);
  assert.equal(result.valid, false);
  assert.match(result.errors.join('\n'), /entry_zone.low must not exceed high/);
});
