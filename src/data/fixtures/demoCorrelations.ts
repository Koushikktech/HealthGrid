export interface CorrelationItem {
  featureA: string;
  featureB: string;
  realCorr: number;
  syntheticCorr: number;
  delta: number;
  clinicalMeaning: string;
}

export const DEMO_CORRELATION_FEATURES = ['Age', 'BMI', 'Diabetes', 'SBP', 'Activity', 'Adherence', 'Pain'];

export const DEMO_REAL_CORR_MATRIX: number[][] = [
  // Age, BMI, Diab, SBP, Act, Adh, Pain
  [1.00, 0.18, 0.41, 0.44, -0.32, -0.15, 0.28], // Age
  [0.18, 1.00, 0.35, 0.38, -0.29, -0.11, 0.22], // BMI
  [0.41, 0.35, 1.00, 0.46, -0.34, -0.19, 0.24], // Diabetes
  [0.44, 0.38, 0.46, 1.00, -0.38, -0.31, 0.32], // SBP
  [-0.32, -0.29, -0.34, -0.38, 1.00, 0.36, -0.51], // Activity
  [-0.15, -0.11, -0.19, -0.31, 0.36, 1.00, -0.42], // Adherence
  [0.28, 0.22, 0.24, 0.32, -0.51, -0.42, 1.00], // Pain
];

export const DEMO_SYNTHETIC_CORR_MATRIX: number[][] = [
  [1.00, 0.17, 0.39, 0.43, -0.30, -0.14, 0.27],
  [0.17, 1.00, 0.34, 0.37, -0.28, -0.10, 0.21],
  [0.39, 0.34, 1.00, 0.44, -0.33, -0.18, 0.23],
  [0.43, 0.37, 0.44, 1.00, -0.36, -0.29, 0.30],
  [-0.30, -0.28, -0.33, -0.36, 1.00, 0.35, -0.48],
  [-0.14, -0.10, -0.18, -0.29, 0.35, 1.00, -0.40],
  [0.27, 0.21, 0.23, 0.30, -0.48, -0.40, 1.00],
];

export const DEMO_KEY_RELATIONSHIPS: CorrelationItem[] = [
  {
    featureA: 'Age',
    featureB: 'Diabetes Prevalence',
    realCorr: 0.41,
    syntheticCorr: 0.39,
    delta: -0.02,
    clinicalMeaning: 'Age-dependent rise in metabolic dysregulation preserved accurately.',
  },
  {
    featureA: 'Activity Level',
    featureB: 'Reported Pain Score',
    realCorr: -0.51,
    syntheticCorr: -0.48,
    delta: 0.03,
    clinicalMeaning: 'Inverse relationship: physical inactivity strongly accompanies chronic pain episodes.',
  },
  {
    featureA: 'Medication Adherence',
    featureB: 'Systolic Blood Pressure',
    realCorr: -0.31,
    syntheticCorr: -0.29,
    delta: 0.02,
    clinicalMeaning: 'Antihypertensive efficacy: high compliance associates with controlled blood pressure.',
  },
  {
    featureA: 'Diabetes Diagnosis',
    featureB: 'Baseline SBP',
    realCorr: 0.46,
    syntheticCorr: 0.44,
    delta: -0.02,
    clinicalMeaning: 'Cardiovascular comorbidity: diabetic patients demonstrate elevated mean resting SBP.',
  },
  {
    featureA: 'Body Mass Index',
    featureB: 'Diabetes Risk',
    realCorr: 0.35,
    syntheticCorr: 0.34,
    delta: -0.01,
    clinicalMeaning: 'Adiposity risk factor for glycemic elevation.',
  },
];
