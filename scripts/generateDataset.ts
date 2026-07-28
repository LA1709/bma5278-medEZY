import { mkdirSync, writeFileSync } from 'node:fs';
import { cohortToCsv } from '../src/lib/csv';
import { evaluateV1, evaluateV2 } from '../src/lib/evaluation';
import { generateCohort } from '../src/lib/synthetic';

const size = Number(process.argv[2] ?? 5000);
const seed = Number(process.argv[3] ?? 5278);
const cohort = generateCohort(size, seed);
const v1 = evaluateV1(cohort);
const v2 = evaluateV2(cohort);

mkdirSync('data', { recursive: true });
writeFileSync('data/synthetic_patients.csv', cohortToCsv(cohort));
writeFileSync(
  'data/validation_summary.json',
  JSON.stringify({ generatedAt: new Date().toISOString(), size, seed, v1, v2 }, null, 2),
);

console.log(`Generated ${size} synthetic patients with seed ${seed}.`);
console.log(`v1 critical sensitivity: ${(v1.criticalSensitivity * 100).toFixed(1)}%`);
console.log(`v2 critical sensitivity: ${(v2.criticalSensitivity * 100).toFixed(1)}%`);
