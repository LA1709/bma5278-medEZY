import { calculateLegacyScore } from './scoringV1';
import { calculateMonitoringScore } from './scoringV2';
import type {
  EvaluationResult,
  MonitoringStatus,
  SyntheticPatient,
} from './types';

export const STATUS_ORDER: MonitoringStatus[] = [
  'ON_TRACK',
  'REVIEW_NEEDED',
  'NEEDS_SUPPORT',
  'ACTION_REQUIRED',
];

function emptyConfusion(): Record<string, Record<string, number>> {
  return Object.fromEntries(
    STATUS_ORDER.map((actual) => [
      actual,
      Object.fromEntries(STATUS_ORDER.map((predicted) => [predicted, 0])),
    ]),
  );
}

function calculateMacroF1(confusion: Record<string, Record<string, number>>): number {
  const f1Values = STATUS_ORDER.map((label) => {
    const tp = confusion[label][label];
    const fp = STATUS_ORDER.reduce(
      (sum, actual) => sum + (actual === label ? 0 : confusion[actual][label]),
      0,
    );
    const fn = STATUS_ORDER.reduce(
      (sum, predicted) => sum + (predicted === label ? 0 : confusion[label][predicted]),
      0,
    );
    const precision = tp + fp === 0 ? 0 : tp / (tp + fp);
    const recall = tp + fn === 0 ? 0 : tp / (tp + fn);
    return precision + recall === 0 ? 0 : (2 * precision * recall) / (precision + recall);
  });

  return f1Values.reduce((sum, value) => sum + value, 0) / f1Values.length;
}

function evaluate(
  cohort: SyntheticPatient[],
  predict: (patient: SyntheticPatient) => MonitoringStatus,
): EvaluationResult {
  const confusion = emptyConfusion();
  const predictedCounts = Object.fromEntries(STATUS_ORDER.map((status) => [status, 0]));
  let correct = 0;
  let criticalTotal = 0;
  let criticalDetected = 0;
  let criticalFalseReassurance = 0;
  const misclassified: EvaluationResult['misclassified'] = [];

  for (const patient of cohort) {
    const predicted = predict(patient);
    confusion[patient.expectedStatus][predicted] += 1;
    predictedCounts[predicted] = (predictedCounts[predicted] ?? 0) + 1;

    if (predicted === patient.expectedStatus) correct += 1;
    else misclassified.push({ patient, predicted });

    if (patient.expectedStatus === 'ACTION_REQUIRED') {
      criticalTotal += 1;
      if (predicted === 'ACTION_REQUIRED') criticalDetected += 1;
      if (predicted === 'ON_TRACK') criticalFalseReassurance += 1;
    }
  }

  return {
    total: cohort.length,
    accuracy: cohort.length === 0 ? 0 : correct / cohort.length,
    macroF1: calculateMacroF1(confusion),
    criticalSensitivity: criticalTotal === 0 ? 1 : criticalDetected / criticalTotal,
    falseReassuranceRate: criticalTotal === 0 ? 0 : criticalFalseReassurance / criticalTotal,
    confusion,
    predictedCounts,
    misclassified,
  };
}

export function evaluateV2(cohort: SyntheticPatient[]): EvaluationResult {
  return evaluate(cohort, (patient) => calculateMonitoringScore(patient).status);
}

export function evaluateV1(cohort: SyntheticPatient[]): EvaluationResult {
  return evaluate(cohort, (patient) => {
    const category = calculateLegacyScore(patient).category;
    if (category === 'GOOD_CONTROL') return 'ON_TRACK';
    if (category === 'NEEDS_ATTENTION') return 'REVIEW_NEEDED';
    return 'NEEDS_SUPPORT';
  });
}
