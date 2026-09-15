import test from 'node:test';
import assert from 'node:assert/strict';
import { mkdtemp, readFile } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { createPredictionStore } from './prediction-store.mjs';

async function makeStore() {
  const dir = await mkdtemp(join(tmpdir(), 'nyxsignal-'));
  return createPredictionStore(join(dir, 'predictions.json'));
}

const prediction = {
  prediction_id: 'PRED-TEST-001',
  analysis_timestamp: '2026-09-15T15:00:00.000Z',
  asset: 'Bitcoin',
  probabilities: { profit: 0.6, flat: 0.2, loss: 0.2 },
};

test('upserts and reloads predictions', async () => {
  const store = await makeStore();
  await store.upsert(prediction);
  const records = await store.list();
  assert.deepEqual(records, [prediction]);
});

test('records a resolved outcome', async () => {
  const store = await makeStore();
  await store.upsert(prediction);
  const updated = await store.recordOutcome(prediction.prediction_id, 'profit');
  assert.equal(updated.outcome, 'profit');
  assert.equal((await store.list())[0].outcome, 'profit');
});

test('writes valid JSON atomically', async () => {
  const dir = await mkdtemp(join(tmpdir(), 'nyxsignal-'));
  const path = join(dir, 'nested', 'predictions.json');
  const store = createPredictionStore(path);
  await store.upsert(prediction);
  const parsed = JSON.parse(await readFile(path, 'utf8'));
  assert.equal(parsed[0].prediction_id, prediction.prediction_id);
});

test('rejects unknown outcomes', async () => {
  const store = await makeStore();
  await store.upsert(prediction);
  await assert.rejects(store.recordOutcome(prediction.prediction_id, 'unknown'), /profit, flat, or loss/);
});
