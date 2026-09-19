import { apiClient } from './apiClient';
import { CohortPassportData, PurposeProfile } from '../../types';
import { DEMO_VALIDATION_REPORT, evaluateFitnessForPurpose } from '../../data/fixtures/demoValidation';

interface BackendArtifact {
  kind: string;
  sha256: string;
  download_url: string;
}

interface BackendVerdict {
  purpose: string;
  verdict: string;
  policy_version: string;
  summary: string;
  gates: any[];
  warnings: string[];
}

interface BackendRun {
  run_id: string;
  dataset_id: string;
  created_at: string;
  updated_at: string;
  request?: Record<string, any>;
}

interface BackendDataset {
  dataset_id: string;
  source_name: string;
  row_count?: number;
  created_at: string;
  updated_at: string;
}

let passportMutationQueue: Promise<void> = Promise.resolve();

function mapUIPurposeToBackend(purpose: PurposeProfile): string {
  switch (purpose) {
    case 'qa':
      return 'software_qa';
    case 'ml_dev':
      return 'ml_development';
    case 'publication':
      return 'external_sharing';
  }
}

function formatTimestamp(value?: string): string {
  if (!value) return 'Unavailable';
  const date = new Date(value);
  return Number.isNaN(date.getTime()) ? value : `${date.toISOString().replace('T', ' ').slice(0, 19)} UTC`;
}

function mapVerdict(value: string): CohortPassportData['purposeVerdict'] {
  if (value === 'fail') return 'FAIL';
  if (value === 'conditional') return 'CONDITIONAL';
  return 'PASS';
}

function demoPassport(runId: string, purpose: PurposeProfile): CohortPassportData {
  const isCalculated = runId !== 'uncalculated' && runId !== 'pending' && Boolean(runId);
  const evaluation = evaluateFitnessForPurpose(isCalculated ? DEMO_VALIDATION_REPORT : null, purpose);
  return {
    passportId: isCalculated ? `HGP-DEMO-${runId.slice(-4) || '001'}` : 'HGP-DEMO-PENDING',
    issuedAt: isCalculated ? 'Demo preview' : 'Pending',
    sha256Checksum: null,
    datasetTitle: 'Demo Clinical Cardiometabolic Dataset',
    datasetSourceSampleN: 1314,
    syntheticTargetN: 5000,
    generationModelName: 'Demo SCM Generator',
    selectedPurpose: purpose,
    purposeVerdict: evaluation.verdict,
    verdictRationale: evaluation.rationale,
    holdoutSplitRatio: 'Demo preview: 70% Train / 30% Holdout',
    auditTrail: {
      datasetProfiledAt: 'Demo preview',
      generationStartedAt: 'Demo preview',
      generationCompletedAt: 'Demo preview',
      validationRunCompletedAt: 'Demo preview',
    },
    complianceConsiderations: {
      title: 'Research & Compliance Considerations (Demo Preview)',
      notes: [
        'This is fixture-backed preview data and must not be treated as evidence from a completed backend run.',
        'Synthetic generation does not automatically establish legal anonymization; assess the applicable regulatory context.',
      ],
    },
  };
}

async function getLivePassport(runId: string, purpose: PurposeProfile): Promise<CohortPassportData> {
  if (!runId) throw new Error('Select a completed generation run before opening its Passport.');
  const backendPurpose = mapUIPurposeToBackend(purpose);

  const verdictRes = await apiClient.put<BackendVerdict>(`/runs/${runId}/verdict`, {
    purpose: backendPurpose,
  });
  await apiClient.post<{ run_id: string; artifacts: BackendArtifact[] }>(`/runs/${runId}/passport`);

  const [resultsRes, runRes] = await Promise.all([
    apiClient.get<any>(`/runs/${runId}/results`),
    apiClient.get<BackendRun>(`/runs/${runId}`),
  ]);
  const run = runRes.data;
  const [datasetRes, profileRes] = await Promise.all([
    apiClient.get<BackendDataset>(`/datasets/${run.dataset_id}`),
    apiClient.get<any>(`/datasets/${run.dataset_id}/profile`),
  ]);

  const results = resultsRes.data;
  const dataset = datasetRes.data;
  const request = results.request || run.request || {};
  const cohort = request.cohort || {};
  const generator = request.generator || results.generation?.selected_generator || 'causal_scm';
  const artifacts: BackendArtifact[] = results.artifacts || [];
  const patientArtifact = artifacts.find((artifact) => artifact.kind === 'patients_csv');
  const fallbackArtifact = artifacts.find((artifact) => artifact.kind === 'passport_json');
  const diabetesTarget = cohort.diabetes_prevalence;
  const diabetesDriver = (results.extrapolation?.drivers || []).find(
    (driver: any) => driver.variable === 'diabetes'
  );
  const quarantine = results.generation?.quarantine || {};
  const split = profileRes.data?.split || {};
  const trainRatio = split.train_rows && profileRes.data?.row_count
    ? Math.round((split.train_rows / profileRes.data.row_count) * 100)
    : 70;
  const holdoutRatio = 100 - trainRatio;

  const notes = [
    'Technical Evidence Only: this Passport reports quantitative statistical and empirical privacy evidence for the declared purpose.',
    'No Automatic Legal Certification: synthetic generation does not automatically establish legal anonymization. Assess the applicable DPDP, HIPAA, GDPR, ethics, and institutional requirements.',
    `Membership inference AUC: ${results.validation?.mia_auc?.value ?? 'not assessable'}.`,
    `Near-duplicate quarantine: ${quarantine.initial_flagged_count ?? 0} initially flagged; ${quarantine.unresolved_count ?? 0} unresolved after enforcement.`,
  ];
  if (diabetesTarget !== null && diabetesTarget !== undefined) {
    const observed = diabetesDriver?.observed;
    notes.push(
      `Diabetes target: ${(diabetesTarget * 100).toFixed(1)}%${
        observed !== undefined ? ` versus ${(observed * 100).toFixed(1)}% observed support` : ''
      }; extrapolation risk is ${results.extrapolation?.level || 'not available'}.`
    );
  }

  return {
    passportId: `HGP-${runId}`,
    issuedAt: formatTimestamp(run.updated_at),
    sha256Checksum: patientArtifact?.sha256 || fallbackArtifact?.sha256 || null,
    datasetTitle: dataset.source_name.replace(/\.[^/.]+$/, '').replace(/_/g, ' '),
    datasetSourceSampleN: dataset.row_count || profileRes.data?.row_count || 0,
    syntheticTargetN: results.generation?.patient_count || cohort.patient_count || 0,
    generationModelName: generator === 'gaussian_copula'
      ? 'Gaussian Copula Baseline'
      : 'HealthGrid SCM',
    selectedPurpose: purpose,
    purposeVerdict: mapVerdict(verdictRes.data.verdict),
    verdictRationale: verdictRes.data.summary,
    verdictGates: verdictRes.data.gates,
    verdictWarnings: verdictRes.data.warnings,
    holdoutSplitRatio: `${trainRatio}% Train / ${holdoutRatio}% Holdout (validation on unseen patients)`,
    auditTrail: {
      datasetProfiledAt: formatTimestamp(dataset.updated_at),
      generationStartedAt: formatTimestamp(run.created_at),
      generationCompletedAt: formatTimestamp(run.updated_at),
      validationRunCompletedAt: formatTimestamp(run.updated_at),
    },
    complianceConsiderations: {
      title: 'Research & Compliance Considerations (Informational Notes)',
      notes,
    },
  };
}

export const passportService = {
  async getPassport(
    runId: string,
    purpose: PurposeProfile = 'qa'
  ): Promise<{ passport: CohortPassportData; isDemo: boolean }> {
    if (apiClient.getMode() === 'demo_preview') {
      return { passport: demoPassport(runId, purpose), isDemo: true };
    }

    const task = passportMutationQueue.then(() => getLivePassport(runId, purpose));
    passportMutationQueue = task.then(() => undefined, () => undefined);
    return { passport: await task, isDemo: false };
  },
};
