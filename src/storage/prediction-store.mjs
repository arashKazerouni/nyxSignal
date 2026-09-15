import { mkdir, readFile, rename, writeFile } from 'node:fs/promises';
import { dirname } from 'node:path';

function clone(value) {
  return JSON.parse(JSON.stringify(value));
}

function validatePredictionRecord(record) {
  if (!record || typeof record !== 'object') throw new Error('Prediction record must be an object');
  if (!record.prediction_id) throw new Error('prediction_id is required');
  if (!record.analysis_timestamp) throw new Error('analysis_timestamp is required');
  if (!record.probabilities || typeof record.probabilities !== 'object') throw new Error('probabilities are required');
}

export function createPredictionStore(filePath) {
  async function load() {
    try {
      const raw = await readFile(filePath, 'utf8');
      return raw.trim() ? JSON.parse(raw) : [];
    } catch (error) {
      if (error.code === 'ENOENT') return [];
      throw error;
    }
  }

  async function save(records) {
    await mkdir(dirname(filePath), { recursive: true });
    const tempPath = `${filePath}.tmp`;
    await writeFile(tempPath, JSON.stringify(records, null, 2) + '\n', 'utf8');
    await rename(tempPath, filePath);
  }

  return {
    async list() {
      return clone(await load());
    },

    async upsert(record) {
      validatePredictionRecord(record);
      const records = await load();
      const index = records.findIndex((item) => item.prediction_id === record.prediction_id);
      if (index === -1) records.push(clone(record));
      else records[index] = clone({ ...records[index], ...record });
      await save(records);
      return clone(records[index === -1 ? records.length - 1 : index]);
    },

    async recordOutcome(predictionId, outcome) {
      if (!predictionId) throw new Error('predictionId is required');
      if (!['profit', 'flat', 'loss'].includes(outcome)) throw new Error('Outcome must be profit, flat, or loss');
      const records = await load();
      const index = records.findIndex((item) => item.prediction_id === predictionId);
      if (index === -1) throw new Error(`Prediction not found: ${predictionId}`);
      records[index] = { ...records[index], outcome, outcome_recorded_at: new Date().toISOString() };
      await save(records);
      return clone(records[index]);
    },
  };
}
