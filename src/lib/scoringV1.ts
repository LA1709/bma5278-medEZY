import type { ScoreInputs, ScoreResultV1 } from './types';

function clamp(value: number): number {
  return Math.max(0, Math.min(100, value));
}

function normalize(
  value: number,
  optimalLow: number,
  optimalHigh: number,
  dangerLow: number,
  dangerHigh: number,
): number {
  if (value >= optimalLow && value <= optimalHigh) return 100;
  if (value <= dangerLow || value >= dangerHigh) return 0;
  if (value < optimalLow) {
    return clamp(((value - dangerLow) / (optimalLow - dangerLow)) * 100);
  }
  return clamp(((dangerHigh - value) / (dangerHigh - optimalHigh)) * 100);
}

export function calculateLegacyScore(input: ScoreInputs): ScoreResultV1 {
  const map = (input.systolic + 2 * input.diastolic) / 3;
  const bp = normalize(map, 83, 100, 70, 127);
  const glucose = normalize(input.fastingGlucose, 80, 110, 60, 200);
  const adherence = input.adherencePercent >= 90
    ? 100
    : input.adherencePercent <= 60
      ? 0
      : ((input.adherencePercent - 60) / 30) * 100;
  const hrv = input.hrv >= 50 ? 100 : input.hrv <= 20 ? 0 : ((input.hrv - 20) / 30) * 100;
  const weight = normalize(input.bmi, 18.5, 25, 16, 35);
  const sleep = normalize(input.sleepHours, 7, 8, 4, 10);
  const averageStepsProxy = (input.moderateMinutes + 2 * input.vigorousMinutes) * 40;
  const activity = averageStepsProxy >= 7000
    ? 100
    : averageStepsProxy <= 3000
      ? 0
      : ((averageStepsProxy - 3000) / 4000) * 100;

  const pillarScores = {
    GL: glucose,
    BP: bp,
    ADH: adherence,
    HRV: hrv,
    WT: weight,
    SL: sleep,
    ACT: activity,
  };

  const score = Math.round(
    0.25 * glucose +
      0.2 * bp +
      0.15 * adherence +
      0.1 * hrv +
      0.1 * weight +
      0.1 * sleep +
      0.1 * activity,
  );

  return {
    version: '1.0',
    score,
    category: score >= 80 ? 'GOOD_CONTROL' : score >= 60 ? 'NEEDS_ATTENTION' : 'AT_RISK',
    pillarScores,
  };
}
