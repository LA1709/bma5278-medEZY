import type {
  MonitoringStatus,
  PillarResult,
  SafetyAlert,
  ScoreInputs,
  ScoreResultV2,
} from './types';

function assertFinite(name: string, value: number, min: number, max: number): void {
  if (!Number.isFinite(value) || value < min || value > max) {
    throw new Error(`${name} must be between ${min} and ${max}.`);
  }
}

export function validateInputs(input: ScoreInputs): void {
  assertFinite('Systolic blood pressure', input.systolic, 60, 260);
  assertFinite('Diastolic blood pressure', input.diastolic, 30, 160);
  assertFinite('Fasting glucose', input.fastingGlucose, 30, 500);
  assertFinite('Adherence percentage', input.adherencePercent, 0, 100);
  assertFinite('Moderate activity minutes', input.moderateMinutes, 0, 1200);
  assertFinite('Vigorous activity minutes', input.vigorousMinutes, 0, 600);
  assertFinite('Sleep hours', input.sleepHours, 0, 24);
  assertFinite('BMI', input.bmi, 10, 60);
  assertFinite('HRV', input.hrv, 0, 250);
}

export function calculateBPScore(systolic: number, diastolic: number): number {
  if (systolic > 180 || diastolic > 120) return 0;
  if (systolic < 120 && diastolic < 80) return 100;
  if (systolic >= 120 && systolic <= 129 && diastolic < 80) return 80;
  if ((systolic >= 130 && systolic <= 139) || (diastolic >= 80 && diastolic <= 89)) {
    return 60;
  }
  return 25;
}

export function calculateGlucoseScore(glucose: number): number {
  if (glucose >= 80 && glucose <= 130) return 100;
  if ((glucose >= 70 && glucose < 80) || (glucose > 130 && glucose <= 160)) return 70;
  if ((glucose >= 54 && glucose < 70) || (glucose > 160 && glucose < 200)) return 30;
  return 0;
}

export function calculateAdherenceScore(adherencePercent: number): number {
  if (adherencePercent >= 80) return 100;
  if (adherencePercent >= 60) return 50;
  return 0;
}

export function calculateActivityScore(moderateMinutes: number, vigorousMinutes: number): number {
  const equivalentMinutes = moderateMinutes + 2 * vigorousMinutes;
  if (equivalentMinutes >= 150) return 100;
  if (equivalentMinutes >= 75) return 60;
  if (equivalentMinutes > 0) return 30;
  return 0;
}

export function calculateSleepScore(sleepHours: number): number {
  if (sleepHours >= 7 && sleepHours <= 9) return 100;
  if ((sleepHours >= 6 && sleepHours < 7) || (sleepHours > 9 && sleepHours <= 10)) return 60;
  if ((sleepHours >= 5 && sleepHours < 6) || (sleepHours > 10 && sleepHours <= 11)) return 30;
  return 0;
}

export function detectSafetyAlerts(input: ScoreInputs): SafetyAlert[] {
  const alerts: SafetyAlert[] = [];

  if (input.systolic > 180 || input.diastolic > 120) {
    alerts.push({
      severity: 'critical',
      code: 'SEVERE_BP',
      message: 'Severely elevated blood pressure detected. This event overrides your MedEZY score.',
    });
  }

  if (input.fastingGlucose < 54) {
    alerts.push({
      severity: 'critical',
      code: 'LEVEL_2_HYPOGLYCEMIA',
      message: 'Very low glucose detected. This event overrides your MedEZY score.',
    });
  } else if (input.fastingGlucose < 70) {
    alerts.push({
      severity: 'warning',
      code: 'LOW_GLUCOSE',
      message: 'Low glucose detected. Review the reading and care plan.',
    });
  }

  return alerts;
}

function determineStatus(
  score: number,
  pillars: PillarResult[],
  alerts: SafetyAlert[],
): MonitoringStatus {
  if (alerts.some((alert) => alert.severity === 'critical')) return 'ACTION_REQUIRED';

  const scores = pillars.map((pillar) => pillar.score);
  const weakCount = scores.filter((value) => value <= 50).length;
  const clinicalWeak = pillars.some(
    (pillar) => (pillar.key === 'BP' || pillar.key === 'GL') && pillar.score < 40,
  );

  if (clinicalWeak || weakCount >= 2 || score < 60) return 'NEEDS_SUPPORT';
  if (scores.some((value) => value < 100) || score < 80) return 'REVIEW_NEEDED';
  return 'ON_TRACK';
}

export function calculateMonitoringScore(input: ScoreInputs): ScoreResultV2 {
  validateInputs(input);

  const activityEquivalent = input.moderateMinutes + 2 * input.vigorousMinutes;
  const pillars: PillarResult[] = [
    {
      key: 'BP',
      label: 'Blood pressure',
      score: calculateBPScore(input.systolic, input.diastolic),
      observed: `${Math.round(input.systolic)}/${Math.round(input.diastolic)} mmHg`,
      rationale: 'Uses systolic and diastolic categories independently; the worse category governs.',
    },
    {
      key: 'GL',
      label: 'Fasting glucose',
      score: calculateGlucoseScore(input.fastingGlucose),
      observed: `${Math.round(input.fastingGlucose)} mg/dL`,
      rationale: 'Anchored to the common 80–130 mg/dL premeal target with explicit low-glucose rules.',
    },
    {
      key: 'ADH',
      label: 'Medication Adherence',
      score: calculateAdherenceScore(input.adherencePercent),
      observed: `${Math.round(input.adherencePercent)}%`,
      rationale: 'Uses an 80% adherence threshold; self-reported logging should be described as dose completion.',
    },
    {
      key: 'ACT',
      label: 'Physical activity',
      score: calculateActivityScore(input.moderateMinutes, input.vigorousMinutes),
      observed: `${Math.round(activityEquivalent)} moderate-equivalent min/week`,
      rationale: 'Vigorous minutes count double toward the 150-minute weekly target.',
    },
    {
      key: 'SL',
      label: 'Sleep duration',
      score: calculateSleepScore(input.sleepHours),
      observed: `${input.sleepHours.toFixed(1)} hours/night`,
      rationale: 'Uses the 7–9 hour adult sleep range as the target band.',
    },
  ];

  const score = Math.round(
    pillars.reduce((sum, pillar) => sum + pillar.score, 0) / pillars.length,
  );
  const alerts = detectSafetyAlerts(input);
  const status = determineStatus(score, pillars, alerts);

  const explanation = pillars
    .filter((pillar) => pillar.score < 100)
    .sort((a, b) => a.score - b.score)
    .slice(0, 3)
    .map((pillar) => `${pillar.label}: ${pillar.observed} → ${pillar.score}/100`);

  if (explanation.length === 0) {
    explanation.push('All five monitored indicators are currently within the prototype target bands.');
  }

  return {
    version: '2.0',
    score,
    status,
    pillars,
    alerts,
    completeness: 100,
    explanation,
  };
}

export function formatStatus(status: MonitoringStatus): string {
  return status
    .toLowerCase()
    .split('_')
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
    .join(' ');
}
