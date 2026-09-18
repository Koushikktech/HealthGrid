import { DatasetSummary, ColumnSchema, DistributionBin } from '../../types';

export const DEMO_DATASET_SUMMARY: DatasetSummary = {
  id: 'ds-clinical-001',
  name: 'Clinical Cardiometabolic Study Dataset',
  patientCount: 1314,
  visitCount: 5256,
  featureCount: 14,
  missingValuePct: 2.4,
  uploadedAt: 'Today, 09:30 AM',
  status: 'Profiled',
  description: 'Multicenter observational cohort analyzing hypertension, type 2 diabetes progression, medication adherence, and longitudinal blood pressure.',
  isDemoFixture: true,
};

export const DEMO_DATASETS_LIST: DatasetSummary[] = [
  DEMO_DATASET_SUMMARY,
  {
    id: 'ds-hypertension-002',
    name: 'Hypertension Digital Care Pilot (Phase II)',
    patientCount: 300,
    visitCount: 1200,
    featureCount: 13,
    missingValuePct: 1.8,
    uploadedAt: 'Yesterday, 14:15 PM',
    status: 'Ready',
    description: 'Small sample pilot evaluating ambulatory systolic blood pressure response to digital adherence reminders.',
    isDemoFixture: true,
  },
  {
    id: 'ds-diabetic-prevention-003',
    name: 'Diabetic Prevention Lifestyle Cohort',
    patientCount: 840,
    visitCount: 3360,
    featureCount: 16,
    missingValuePct: 3.1,
    uploadedAt: '3 days ago',
    status: 'Ready',
    description: 'Pre-diabetic behavioral intervention tracking physical activity, BMI trajectories, and glycemic indicators.',
    isDemoFixture: true,
  },
];

export const DEMO_COLUMN_SCHEMAS: ColumnSchema[] = [
  {
    name: 'patient_id',
    type: 'Identifier',
    missingPct: 0.0,
    uniqueCount: 1314,
    observedRange: 'P0001–P1314',
    description: 'Pseudonymized subject identifier',
  },
  {
    name: 'age',
    type: 'Numeric',
    missingPct: 0.0,
    uniqueCount: 65,
    observedRange: '18–89 years (Mean 54.2)',
    description: 'Baseline chronological age in years',
  },
  {
    name: 'sex',
    type: 'Categorical',
    missingPct: 0.0,
    uniqueCount: 2,
    observedRange: '48.2% F / 51.8% M',
    description: 'Biological sex at birth',
  },
  {
    name: 'bmi',
    type: 'Numeric',
    missingPct: 1.1,
    uniqueCount: 382,
    observedRange: '18.5–44.2 kg/m²',
    description: 'Body Mass Index calculated at baseline',
  },
  {
    name: 'diabetes',
    type: 'Categorical',
    missingPct: 0.0,
    uniqueCount: 2,
    observedRange: '0 (92%) / 1 (8.0%)',
    description: 'Physician-confirmed Type-2 Diabetes diagnosis at enrollment',
  },
  {
    name: 'hypertension_dx',
    type: 'Categorical',
    missingPct: 0.0,
    uniqueCount: 2,
    observedRange: '0 (65.4%) / 1 (34.6%)',
    description: 'Documented essential hypertension diagnosis',
  },
  {
    name: 'baseline_sbp',
    type: 'Numeric',
    missingPct: 1.2,
    uniqueCount: 1102,
    observedRange: '92–201 mmHg (Mean 132.8)',
    description: 'Seated resting Systolic Blood Pressure in clinic',
    isTarget: true,
  },
  {
    name: 'baseline_dbp',
    type: 'Numeric',
    missingPct: 1.2,
    uniqueCount: 890,
    observedRange: '58–118 mmHg (Mean 84.1)',
    description: 'Seated resting Diastolic Blood Pressure in clinic',
  },
  {
    name: 'activity_minutes',
    type: 'Numeric',
    missingPct: 4.8,
    uniqueCount: 420,
    observedRange: '10–380 min/week (Median 145)',
    description: 'Self-reported moderate-to-vigorous physical activity',
  },
  {
    name: 'adherence_pct',
    type: 'Numeric',
    missingPct: 2.1,
    uniqueCount: 95,
    observedRange: '15%–100% (Mean 74.6%)',
    description: 'Medication possession ratio / pill count compliance score',
  },
  {
    name: 'pain_score',
    type: 'Numeric',
    missingPct: 1.9,
    uniqueCount: 11,
    observedRange: '0–10 Numeric Rating Scale',
    description: 'Patient-reported musculoskeletal discomfort scale',
  },
  {
    name: 'treatment_arm',
    type: 'Categorical',
    missingPct: 0.0,
    uniqueCount: 2,
    observedRange: 'Active (50.5%) / Standard (49.5%)',
    description: 'Allocated digital intervention vs routine care arm',
  },
  {
    name: 'comorbidity_count',
    type: 'Numeric',
    missingPct: 0.4,
    uniqueCount: 7,
    observedRange: '0–6 chronic conditions',
    description: 'Charlson-derived comorbid condition total',
  },
  {
    name: 'enrolment_date',
    type: 'Date',
    missingPct: 0.0,
    uniqueCount: 428,
    observedRange: '2024-01-15 to 2025-11-20',
    description: 'Formal trial intake timestamp',
  },
];

// Realistic univariate distribution bins for real vs synthetic comparisons
export const DEMO_AGE_DISTRIBUTION: DistributionBin[] = [
  { bucket: '18-29', realCount: 142, syntheticCount: 380, baselineCount: 520 },
  { bucket: '30-39', realCount: 218, syntheticCount: 620, baselineCount: 840 },
  { bucket: '40-49', realCount: 285, syntheticCount: 980, baselineCount: 1100 },
  { bucket: '50-59', realCount: 340, syntheticCount: 1320, baselineCount: 1240 },
  { bucket: '60-69', realCount: 210, syntheticCount: 1050, baselineCount: 890 },
  { bucket: '70-79', realCount: 92, syntheticCount: 490, baselineCount: 330 },
  { bucket: '80+', realCount: 27, syntheticCount: 160, baselineCount: 80 },
];

export const DEMO_SBP_DISTRIBUTION: DistributionBin[] = [
  { bucket: '<110', realCount: 110, syntheticCount: 280, baselineCount: 430 },
  { bucket: '110-119', realCount: 245, syntheticCount: 740, baselineCount: 960 },
  { bucket: '120-129', realCount: 380, syntheticCount: 1260, baselineCount: 1490 },
  { bucket: '130-139', realCount: 310, syntheticCount: 1340, baselineCount: 1180 },
  { bucket: '140-159', realCount: 195, syntheticCount: 990, baselineCount: 710 },
  { bucket: '160-179', realCount: 58, syntheticCount: 310, baselineCount: 180 },
  { bucket: '180+', realCount: 16, syntheticCount: 80, baselineCount: 50 },
];

export const DEMO_BMI_DISTRIBUTION: DistributionBin[] = [
  { bucket: '<20', realCount: 82, syntheticCount: 290, baselineCount: 310 },
  { bucket: '20-24.9', realCount: 395, syntheticCount: 1420, baselineCount: 1530 },
  { bucket: '25-29.9', realCount: 512, syntheticCount: 1980, baselineCount: 1940 },
  { bucket: '30-34.9', realCount: 228, syntheticCount: 910, baselineCount: 860 },
  { bucket: '35+', realCount: 97, syntheticCount: 400, baselineCount: 360 },
];

export const DEMO_ACTIVITY_DISTRIBUTION: DistributionBin[] = [
  { bucket: '<60m', realCount: 280, syntheticCount: 1040, baselineCount: 1080 },
  { bucket: '60-120m', realCount: 420, syntheticCount: 1620, baselineCount: 1590 },
  { bucket: '120-180m', realCount: 390, syntheticCount: 1480, baselineCount: 1490 },
  { bucket: '180-240m', realCount: 145, syntheticCount: 580, baselineCount: 550 },
  { bucket: '>240m', realCount: 79, syntheticCount: 280, baselineCount: 290 },
];

export const DEMO_ADHERENCE_DISTRIBUTION: DistributionBin[] = [
  { bucket: '<50%', realCount: 135, syntheticCount: 410, baselineCount: 520 },
  { bucket: '50-69%', realCount: 254, syntheticCount: 890, baselineCount: 990 },
  { bucket: '70-84%', realCount: 485, syntheticCount: 1860, baselineCount: 1840 },
  { bucket: '85-94%', realCount: 310, syntheticCount: 1280, baselineCount: 1190 },
  { bucket: '95-100%', realCount: 130, syntheticCount: 560, baselineCount: 460 },
];
