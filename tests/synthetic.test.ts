import { describe, expect, it } from 'vitest';
import { evaluateV2 } from '../src/lib/evaluation';
import { generateCohort } from '../src/lib/synthetic';

describe('Synthetic cohort evaluation', () => {
  it('is reproducible for a fixed seed', () => {
    expect(generateCohort(10, 5278)).toEqual(generateCohort(10, 5278));
  });

  it('detects all injected critical cases in the default cohort', () => {
    const cohort = generateCohort(5000, 5278);
    const result = evaluateV2(cohort);
    expect(result.criticalSensitivity).toBe(1);
    expect(result.falseReassuranceRate).toBe(0);
  });
});
