import { describe, expect, it } from 'vitest';
import { calculateBPScore, calculateMonitoringScore } from '../src/lib/scoringV2';
import type { ScoreInputs } from '../src/lib/types';

const base: ScoreInputs = {
  systolic: 116,
  diastolic: 74,
  fastingGlucose: 105,
  adherencePercent: 92,
  moderateMinutes: 170,
  vigorousMinutes: 10,
  sleepHours: 7.5,
  bmi: 24,
  hrv: 55,
};

describe('MedEZY Monitoring Score v2', () => {
  it('does not treat 180/60 as optimal blood pressure', () => {
    expect(calculateBPScore(180, 60)).toBeLessThanOrEqual(25);
  });

  it('flags blood pressure above 180 systolic', () => {
    const result = calculateMonitoringScore({ ...base, systolic: 185, diastolic: 80 });
    expect(result.status).toBe('ACTION_REQUIRED');
    expect(result.alerts.some((alert) => alert.code === 'SEVERE_BP')).toBe(true);
  });

  it('flags glucose below 54 mg/dL', () => {
    const result = calculateMonitoringScore({ ...base, fastingGlucose: 45 });
    expect(result.status).toBe('ACTION_REQUIRED');
  });

  it('never increases the BP score when systolic pressure worsens through categories', () => {
    const scores = [118, 125, 135, 150, 185].map((systolic) => calculateBPScore(systolic, 78));
    for (let index = 1; index < scores.length; index += 1) {
      expect(scores[index]).toBeLessThanOrEqual(scores[index - 1]);
    }
  });

  it('keeps final score between 0 and 100', () => {
    const result = calculateMonitoringScore(base);
    expect(result.score).toBeGreaterThanOrEqual(0);
    expect(result.score).toBeLessThanOrEqual(100);
  });
});
