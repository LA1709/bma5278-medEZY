export type MonitoringStatus =
  | 'ON_TRACK'
  | 'REVIEW_NEEDED'
  | 'NEEDS_SUPPORT'
  | 'ACTION_REQUIRED'
  | 'MORE_DATA_NEEDED';

export type Phenotype =
  | 'ON_TRACK'
  | 'BEHAVIOR_GAP'
  | 'CLINICAL_GAP'
  | 'SAFETY_EVENT';

export type ScoreEntry = {
  date: string;
  score: number;
}
export interface ScoreInputs {
  systolic: number;
  diastolic: number;
  fastingGlucose: number;
  adherencePercent: number;
  moderateMinutes: number;
  vigorousMinutes: number;
  sleepHours: number;
  bmi: number;
  hrv: number;
}

export interface PillarResult {
  key: 'BP' | 'GL' | 'ADH' | 'ACT' | 'SL';
  label: string;
  score: number;
  observed: string;
  rationale: string;
}

export interface SafetyAlert {
  severity: 'warning' | 'critical';
  code: string;
  message: string;
}

export interface ScoreResultV2 {
  version: '2.0';
  score: number;
  status: MonitoringStatus;
  pillars: PillarResult[];
  alerts: SafetyAlert[];
  completeness: number;
  explanation: string[];
}

export interface ScoreResultV1 {
  version: '1.0';
  score: number;
  category: 'GOOD_CONTROL' | 'NEEDS_ATTENTION' | 'AT_RISK';
  pillarScores: Record<string, number>;
}

export interface SyntheticPatient extends ScoreInputs {
  patientId: string;
  phenotype: Phenotype;
  expectedStatus: Exclude<MonitoringStatus, 'MORE_DATA_NEEDED'>;
  criticalInjected: boolean;
}

export interface EvaluationResult {
  total: number;
  accuracy: number;
  macroF1: number;
  criticalSensitivity: number;
  falseReassuranceRate: number;
  confusion: Record<string, Record<string, number>>;
  predictedCounts: Record<string, number>;
  misclassified: Array<{
    patient: SyntheticPatient;
    predicted: MonitoringStatus;
  }>;
}
