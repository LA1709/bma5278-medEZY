import type {
  MonitoringStatus,
  Phenotype,
  SyntheticPatient,
} from './types';

export function mulberry32(seed: number): () => number {
  let state = seed >>> 0;
  return () => {
    state += 0x6d2b79f5;
    let t = state;
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

function normal(rng: () => number, mean: number, sd: number): number {
  const u1 = Math.max(rng(), Number.EPSILON);
  const u2 = Math.max(rng(), Number.EPSILON);
  const z = Math.sqrt(-2 * Math.log(u1)) * Math.cos(2 * Math.PI * u2);
  return mean + sd * z;
}

function truncated(
  rng: () => number,
  mean: number,
  sd: number,
  min: number,
  max: number,
): number {
  return Math.max(min, Math.min(max, normal(rng, mean, sd)));
}

function selectPhenotype(rng: () => number): Phenotype {
  const draw = rng();
  if (draw < 0.4) return 'ON_TRACK';
  if (draw < 0.65) return 'BEHAVIOR_GAP';
  if (draw < 0.9) return 'CLINICAL_GAP';
  return 'SAFETY_EVENT';
}

export function deriveReferenceStatus(
  patient: Omit<SyntheticPatient, 'expectedStatus'>,
): Exclude<MonitoringStatus, 'MORE_DATA_NEEDED'> {
  if (
    patient.systolic > 180 ||
    patient.diastolic > 120 ||
    patient.fastingGlucose < 54
  ) {
    return 'ACTION_REQUIRED';
  }

  const severeFlags = [
    patient.systolic >= 140 || patient.diastolic >= 90,
    patient.fastingGlucose < 70 || patient.fastingGlucose >= 200,
    patient.adherencePercent < 60,
    patient.moderateMinutes + 2 * patient.vigorousMinutes < 75,
    patient.sleepHours < 6 || patient.sleepHours > 10,
  ].filter(Boolean).length;

  if (severeFlags >= 2 || patient.adherencePercent < 60) return 'NEEDS_SUPPORT';

  const outsideTarget =
    patient.systolic >= 120 ||
    patient.diastolic >= 80 ||
    patient.fastingGlucose < 80 ||
    patient.fastingGlucose > 130 ||
    patient.adherencePercent < 80 ||
    patient.moderateMinutes + 2 * patient.vigorousMinutes < 150 ||
    patient.sleepHours < 7 ||
    patient.sleepHours > 9;

  return outsideTarget ? 'REVIEW_NEEDED' : 'ON_TRACK';
}

function makePatient(
  phenotype: Phenotype,
  index: number,
  rng: () => number,
): SyntheticPatient {
  let values: Omit<SyntheticPatient, 'expectedStatus'>;

  if (phenotype === 'ON_TRACK') {
    values = {
      patientId: `SYN-${String(index + 1).padStart(5, '0')}`,
      phenotype,
      systolic: truncated(rng, 114, 4, 95, 119),
      diastolic: truncated(rng, 73, 4, 55, 79),
      fastingGlucose: truncated(rng, 105, 10, 80, 130),
      adherencePercent: truncated(rng, 91, 6, 80, 100),
      moderateMinutes: truncated(rng, 175, 35, 120, 300),
      vigorousMinutes: truncated(rng, 15, 10, 0, 60),
      sleepHours: truncated(rng, 7.6, 0.45, 7, 9),
      bmi: truncated(rng, 24.5, 2.5, 18, 32),
      hrv: truncated(rng, 54, 13, 20, 100),
      criticalInjected: false,
    };
  } else if (phenotype === 'BEHAVIOR_GAP') {
    values = {
      patientId: `SYN-${String(index + 1).padStart(5, '0')}`,
      phenotype,
      systolic: truncated(rng, 123, 7, 105, 139),
      diastolic: truncated(rng, 78, 5, 60, 89),
      fastingGlucose: truncated(rng, 119, 16, 75, 165),
      adherencePercent: truncated(rng, 66, 10, 35, 85),
      moderateMinutes: truncated(rng, 45, 25, 0, 110),
      vigorousMinutes: truncated(rng, 4, 5, 0, 25),
      sleepHours: truncated(rng, 5.9, 0.7, 4.5, 7.2),
      bmi: truncated(rng, 28, 3.5, 19, 40),
      hrv: truncated(rng, 38, 12, 10, 80),
      criticalInjected: false,
    };
  } else if (phenotype === 'CLINICAL_GAP') {
    values = {
      patientId: `SYN-${String(index + 1).padStart(5, '0')}`,
      phenotype,
      systolic: truncated(rng, 151, 17, 125, 180),
      diastolic: truncated(rng, 94, 11, 78, 120),
      fastingGlucose: truncated(rng, 184, 42, 120, 290),
      adherencePercent: truncated(rng, 82, 10, 55, 100),
      moderateMinutes: truncated(rng, 105, 50, 0, 250),
      vigorousMinutes: truncated(rng, 8, 8, 0, 40),
      sleepHours: truncated(rng, 6.7, 0.8, 4.8, 9.5),
      bmi: truncated(rng, 31, 4.5, 20, 46),
      hrv: truncated(rng, 32, 11, 8, 70),
      criticalInjected: false,
    };
  } else {
    const bpEvent = rng() < 0.6;
    values = {
      patientId: `SYN-${String(index + 1).padStart(5, '0')}`,
      phenotype,
      systolic: bpEvent ? truncated(rng, 198, 10, 181, 230) : truncated(rng, 130, 15, 95, 180),
      diastolic: bpEvent && rng() < 0.3
        ? truncated(rng, 127, 6, 121, 150)
        : truncated(rng, 82, 12, 55, 120),
      fastingGlucose: bpEvent ? truncated(rng, 145, 35, 70, 260) : truncated(rng, 45, 5, 30, 53),
      adherencePercent: truncated(rng, 78, 16, 30, 100),
      moderateMinutes: truncated(rng, 80, 55, 0, 260),
      vigorousMinutes: truncated(rng, 5, 8, 0, 45),
      sleepHours: truncated(rng, 6.4, 1.2, 3.5, 10.5),
      bmi: truncated(rng, 29, 5, 17, 48),
      hrv: truncated(rng, 30, 12, 5, 75),
      criticalInjected: true,
    };
  }

  return {
    ...values,
    systolic: Math.round(values.systolic),
    diastolic: Math.round(values.diastolic),
    fastingGlucose: Math.round(values.fastingGlucose),
    adherencePercent: Math.round(values.adherencePercent),
    moderateMinutes: Math.round(values.moderateMinutes),
    vigorousMinutes: Math.round(values.vigorousMinutes),
    sleepHours: Math.round(values.sleepHours * 10) / 10,
    bmi: Math.round(values.bmi * 10) / 10,
    hrv: Math.round(values.hrv),
    expectedStatus: deriveReferenceStatus(values),
  };
}

export function generateCohort(size = 5000, seed = 5278): SyntheticPatient[] {
  if (!Number.isInteger(size) || size < 1 || size > 100000) {
    throw new Error('Cohort size must be an integer between 1 and 100,000.');
  }
  const rng = mulberry32(seed);
  return Array.from({ length: size }, (_, index) =>
    makePatient(selectPhenotype(rng), index, rng),
  );
}
