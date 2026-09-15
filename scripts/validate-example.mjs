import { readFile } from 'node:fs/promises';
import { validateAnalysis } from '../src/contract/validate-analysis.mjs';

const path = new URL('../data/examples/2026-09-15-market-analysis.json', import.meta.url);
const analysis = JSON.parse(await readFile(path, 'utf8'));
const result = validateAnalysis(analysis);

if (!result.valid) {
  console.error('NyxSignal example validation failed:');
  for (const error of result.errors) console.error(`- ${error}`);
  process.exit(1);
}

console.log(`NyxSignal example valid: ${analysis.opportunities.length} opportunities`);
