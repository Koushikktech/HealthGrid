// Core HealthGrid Data Types & State Schemas

export type DataState = 'loading' | 'ready' | 'empty' | 'error' | 'not-calculated';

export type StatusVerdict = 'PASS' | 'CONDITIONAL' | 'REVIEW' | 'FAIL' | 'PENDING' | 'NOT_CALCULATED';

export type PurposeProfile = 'qa' | 'ml_dev' | 'publication';

export interface DatasetSummary {
  id: string;
  name: string;
  patientCount: number;
  visitCount: number;
  featureCount: number;
  missingValuePct: number;
  uploadedAt: string;
  status: 'Profiled' | 'Ready' | 'Raw' | 'Error';
  description?: string;
  isDemoFixture?: boolean;
}

export interface ColumnSchema {
  name: string;
  type: 'Numeric' | 'Categorical' | 'Date' | 'Identifier';
  missingPct: number;
  uniqueCount: number;
  observedRange: string;
  description: string;
  isTarget?: boolean;
}

export interface CorrelationCell {
  x: string;
  y: string;
  real: number;
  synthetic: number | null;
  difference: number | null;
}

export interface DistributionBin {
  bucket: string;
  realCount: number;
  syntheticCount: number | null;
  baselineCount?: number | null;
}

export interface CohortConfiguration {
  targetPatients: number;
  minAge: number;
  maxAge: number;
  diabetesPct: number;
  hypertensionPct: number;
  malePct: number;
  femalePct: number;
  adherencePct: number;
  activityLevel: 'Low' | 'Moderate' | 'High';
  studyDurationWeeks: number;
  treatmentStatus: 'All' | 'Active Treatment' | 'Control / Standard of Care';
  modelType: 'causal_generator' | 'gaussian_copula_baseline';
}

export interface ExtrapolationMetric {
  dimension: string;
  requestedValue: string;
  observedBaseline: string;
  riskLevel: 'low' | 'moderate' | 'high';
  score: number; // 0 to 100
  note: string;
}

export interface ExtrapolationAssessment {
  overallRisk: 'LOW' | 'MODERATE' | 'HIGH';
  status: 'INTERPOLATION' | 'MILD_EXTRAPOLATION' | 'EXTRAPOLATION_REVIEW_REQUIRED';
  densityRatio: number;
  supportOverlapScore: number;
  metrics: ExtrapolationMetric[];
}

export interface GenerationStep {
  stepIndex: number;
  name: string;
  status: 'Complete' | 'Running' | 'Pending' | 'Failed' | 'Not Started';
  detail: string;
}

export interface GenerationRun {
  runId: string;
  datasetName: string;
  patientCount: number;
  model: string;
  createdAt: string;
  status: 'Validated' | 'Review' | 'Generating' | 'Failed' | 'Queued';
  executionTimeSec: number | null;
  cohortConfig: CohortConfiguration;
}

export interface ValidationMetricItem {
  id: string;
  name: string;
  value: number | null;
  benchmark: string;
  threshold: string;
  status: StatusVerdict;
  shortEvidence: string;
  interpretation: string;
  citation?: string;
}

export interface FidelityValidation {
  ksStatistic: ValidationMetricItem;
  wassersteinDistance: ValidationMetricItem;
  frobeniusCorrelationDelta: ValidationMetricItem;
  c2stClassifierAUC: ValidationMetricItem;
}

export interface UtilityValidation {
  tstrAUROC: ValidationMetricItem;
  realTrainedAUROC: ValidationMetricItem;
  aurocDifference: ValidationMetricItem;
  kendallRankTau: ValidationMetricItem;
}

export interface TemporalValidation {
  trajectorySimilarity: ValidationMetricItem;
  missingnessPatternSimilarity: ValidationMetricItem;
  dropoutAgreement: ValidationMetricItem;
}

export interface FlaggedRecord {
  id: string;
  syntheticRecordIndex: number;
  nearestRealPatientId: string;
  euclideanDistance: number;
  flaggedReason: string;
  quarantineStatus: 'Flagged for Review' | 'Excluded' | 'Accepted';
}

export interface PrivacyValidation {
  membershipInferenceAUC: ValidationMetricItem;
  relativeDCR: ValidationMetricItem;
  nearestRecordDistance: ValidationMetricItem;
  flaggedNearDuplicates: number | null;
  flaggedRecords: FlaggedRecord[];
}

export interface FullValidationReport {
  isCalculated: boolean;
  overallStatus: StatusVerdict;
  summaryExplanation: string;
  fidelity: FidelityValidation;
  utility: UtilityValidation;
  temporal: TemporalValidation;
  privacy: PrivacyValidation;
  extrapolation: ExtrapolationAssessment;
}

export interface TemporalTrajectoryPoint {
  week: number;
  realSBPMean: number;
  syntheticSBPMean: number | null;
  baselineCopulaSBPMean?: number | null;
  syntheticSBPMin?: number;
  syntheticSBPMax?: number;
  adherenceRate: number;
  retentionRate: number;
  dropoutPct: number;
}

export interface CohortPassportData {
  passportId: string;
  issuedAt: string;
  sha256Checksum: string | null; // Null if not yet calculated
  datasetTitle: string;
  datasetSourceSampleN: number;
  syntheticTargetN: number;
  generationModelName: string;
  selectedPurpose: PurposeProfile;
  purposeVerdict: StatusVerdict;
  verdictRationale: string;
  holdoutSplitRatio: string;
  auditTrail: {
    datasetProfiledAt: string;
    generationStartedAt: string;
    generationCompletedAt: string;
    validationRunCompletedAt: string;
  };
  complianceConsiderations: {
    title: string;
    notes: string[];
  };
}
