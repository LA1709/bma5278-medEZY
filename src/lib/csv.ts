import type { SyntheticPatient } from './types';

export function cohortToCsv(cohort: SyntheticPatient[]): string {
  const headers = [
    'patientId',
    'phenotype',
    'systolic',
    'diastolic',
    'fastingGlucose',
    'adherencePercent',
    'moderateMinutes',
    'vigorousMinutes',
    'sleepHours',
    'bmi',
    'hrv',
    'criticalInjected',
    'expectedStatus',
  ];

  const rows = cohort.map((patient) =>
    headers.map((header) => String(patient[header as keyof SyntheticPatient])).join(','),
  );

  return [headers.join(','), ...rows].join('\n');
}

export function downloadText(filename: string, text: string, mimeType: string): void {
  const blob = new Blob([text], { type: mimeType });
  const url = URL.createObjectURL(blob);
  const anchor = document.createElement('a');
  anchor.href = url;
  anchor.download = filename;
  anchor.click();
  URL.revokeObjectURL(url);
}
