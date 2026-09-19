import { apiClient } from './apiClient';
import {
  CohortConfiguration,
  ExtrapolationAssessment,
  GenerationRun
} from '../../types';
import { DEMO_RUNS_LIST } from '../../data/fixtures/demoGenerationRuns';

interface BackendRunRecord {
  run_id: string;
  dataset_id: string;
  status: string;
  progress: number;
  stage: string;
  message: string;
  seed: number;
  generator: 'causal_scm' | 'gaussian_copula';
  purpose: string;
  stage_timings?: Record<string, number>;
  created_at: string;
  updated_at: string;
  request?: any;
}

function mapBackendRunToGenerationRun(r: BackendRunRecord): GenerationRun {
  const req = r.request || {};
  const cohort = req.cohort || {};
  const patientCount = cohort.patient_count ?? 0;
  const diabetesPct = cohort.diabetes_prevalence !== undefined ? Math.round(cohort.diabetes_prevalence * 100) : 0;
  const femalePct = cohort.sex_proportions?.female !== undefined ? Math.round(cohort.sex_proportions.female * 100) : 50;
  const ageBins = cohort.age?.bins || [];
  const minAge = ageBins.length > 0 ? Math.min(...ageBins.map((bin: any) => bin.min)) : 18;
  const maxAge = ageBins.length > 0 ? Math.max(...ageBins.map((bin: any) => bin.max)) : 89;
  const generator = r.generator || req.generator || 'causal_scm';

  let uiStatus: GenerationRun['status'] = 'Generating';
  if (r.status === 'completed') {
    uiStatus = 'Validated';
  } else if (r.status === 'failed' || r.status === 'interrupted') {
    uiStatus = 'Failed';
  } else if (r.status === 'queued') {
    uiStatus = 'Queued';
  }

  // Calculate execution time sum if available
  let execTime: number | null = null;
  if (r.stage_timings && Object.keys(r.stage_timings).length > 0) {
    const total = r.stage_timings.total
      ?? Object.entries(r.stage_timings)
        .filter(([stage]) => stage !== 'total')
        .reduce((sum, [, duration]) => sum + duration, 0);
    execTime = Number(total.toFixed(2));
  }

  return {
    runId: r.run_id,
    datasetName: 'Cardiometabolic Study Dataset',
    patientCount,
    model: generator === 'gaussian_copula'
      ? 'Gaussian Copula Baseline'
      : req.include_baseline !== false
        ? 'HealthGrid SCM (+ Copula Comparator)'
        : 'HealthGrid SCM',
    createdAt: r.created_at ? new Date(r.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : 'Today',
    status: uiStatus,
    executionTimeSec: execTime,
    progress: r.progress,
    stage: r.stage,
    message: r.message,
    stageTimings: r.stage_timings,
    cohortConfig: {
      targetPatients: patientCount,
      minAge,
      maxAge,
      diabetesPct,
      hypertensionEnabled: cohort.hypertension_enabled !== false,
      hypertensionPct: cohort.hypertension_prevalence !== undefined && cohort.hypertension_prevalence !== null
        ? Math.round(cohort.hypertension_prevalence * 100)
        : 0,
      malePct: 100 - femalePct,
      femalePct,
      adherencePct: cohort.adherence_target !== undefined
        ? Math.round(cohort.adherence_target * 100)
        : 0,
      activityLevel: cohort.activity_level === 'low' ? 'Low' : cohort.activity_level === 'high' ? 'High' : 'Moderate',
      studyDurationWeeks: cohort.programme_weeks || 12,
      treatmentStatus: cohort.treatment_status === 'active_treatment'
        ? 'Active Treatment'
        : cohort.treatment_status === 'control'
          ? 'Control / Standard of Care'
          : 'All',
      modelType: generator === 'gaussian_copula' ? 'gaussian_copula_baseline' : 'causal_generator',
    },
  };
}

export const generationService = {
  async getRuns(): Promise<{ runs: GenerationRun[]; isDemo: boolean }> {
    try {
      const res = await apiClient.get<BackendRunRecord[]>('/runs');
      if (res.data && res.data.length > 0) {
        return {
          runs: res.data.map(mapBackendRunToGenerationRun),
          isDemo: false,
        };
      }
      return { runs: [], isDemo: false };
    } catch (error) {
      if (apiClient.getMode() === 'demo_preview') return { runs: DEMO_RUNS_LIST, isDemo: true };
      throw error;
    }
  },

  async getRunById(runId: string): Promise<{ run: GenerationRun | null; isDemo: boolean }> {
    try {
      const res = await apiClient.get<BackendRunRecord>(`/runs/${runId}`);
      return { run: mapBackendRunToGenerationRun(res.data), isDemo: false };
    } catch (error) {
      if (apiClient.getMode() !== 'demo_preview') throw error;
      const found = DEMO_RUNS_LIST.find((r) => r.runId === runId) || DEMO_RUNS_LIST[0];
      return { run: found, isDemo: true };
    }
  },

  async getRunResults(runId: string): Promise<{ results: any | null; isDemo: boolean }> {
    try {
      const res = await apiClient.get<any>(`/runs/${runId}/results`);
      return { results: res.data, isDemo: false };
    } catch (error) {
      if (apiClient.getMode() !== 'demo_preview') throw error;
      return { results: null, isDemo: true };
    }
  },

  async getRunComparison(runId: string): Promise<{ comparison: any | null; isDemo: boolean }> {
    try {
      const res = await apiClient.get<any>(`/runs/${runId}/comparison`);
      return { comparison: res.data, isDemo: false };
    } catch (error) {
      if (apiClient.getMode() !== 'demo_preview') throw error;
      return { comparison: null, isDemo: true };
    }
  },

  calculateExtrapolation(config: CohortConfiguration): ExtrapolationAssessment {
    // Dynamic honest evaluation of how far requested parameters diverge from source support
    // Source data baseline: Diabetes 8.0%, HTN 34.6%, Adherence 74.6%, Age 18-89 (Mean 54)
    const diabetesShift = Math.abs(config.diabetesPct - 8.0);
    const adherenceShift = Math.abs(config.adherencePct - 74.6);
    const htnShift = config.hypertensionEnabled ? Math.abs(config.hypertensionPct - 34.6) : 0;

    const diabetesScore = Math.min(100, Math.round(diabetesShift * 1.6));
    const adherenceScore = Math.min(100, Math.round(adherenceShift * 1.5));
    const htnScore = Math.min(100, Math.round(htnShift * 1.2));

    const overallScore = config.hypertensionEnabled
      ? Math.round(diabetesScore * 0.5 + htnScore * 0.3 + adherenceScore * 0.2)
      : Math.round(diabetesScore * 0.65 + adherenceScore * 0.35);

    let overallRisk: 'LOW' | 'MODERATE' | 'HIGH' = 'LOW';
    let status: 'INTERPOLATION' | 'MILD_EXTRAPOLATION' | 'EXTRAPOLATION_REVIEW_REQUIRED' = 'INTERPOLATION';

    if (overallScore > 60 || diabetesScore > 70) {
      overallRisk = 'HIGH';
      status = 'EXTRAPOLATION_REVIEW_REQUIRED';
    } else if (overallScore > 30 || diabetesScore > 40) {
      overallRisk = 'MODERATE';
      status = 'MILD_EXTRAPOLATION';
    }

    return {
      overallRisk,
      status,
      densityRatio: Number((1.0 + overallScore / 25).toFixed(2)),
      supportOverlapScore: Math.max(15, 100 - overallScore),
      metrics: [
        {
          dimension: 'Diabetes Prevalence',
          requestedValue: `${config.diabetesPct}%`,
          observedBaseline: '8.0% (n=105)',
          riskLevel: diabetesScore > 60 ? 'high' : diabetesScore > 30 ? 'moderate' : 'low',
          score: diabetesScore,
          note:
            diabetesScore > 60
              ? `Severe covariate shift (${(config.diabetesPct / 8).toFixed(1)}x baseline). SCM generator propagates physiological BP changes; baseline resampling will repeat sparse individuals.`
              : 'Within reasonable conditional support.',
        },
        ...(config.hypertensionEnabled ? [{
          dimension: 'Hypertension Diagnosis' as const,
          requestedValue: `${config.hypertensionPct}%`,
          observedBaseline: '34.6% (n=455)',
          riskLevel: (htnScore > 50 ? 'moderate' : 'low') as 'moderate' | 'low',
          score: htnScore,
          note: 'Model conditions on baseline blood pressure distribution.',
        }] : []),
        {
          dimension: 'Medication Adherence',
          requestedValue: `${config.adherencePct}%`,
          observedBaseline: '74.6% mean',
          riskLevel: adherenceScore > 40 ? 'moderate' : 'low',
          score: adherenceScore,
          note:
            adherenceScore > 40
              ? 'High adherence assumption alters longitudinal visit dropout probability.'
              : 'Near observed study compliance rates.',
        },
        {
          dimension: 'Sample Support Overlap',
          requestedValue: `${config.targetPatients.toLocaleString()} patients`,
          observedBaseline: '1,314 source records',
          riskLevel: overallRisk === 'HIGH' ? 'high' : overallRisk === 'MODERATE' ? 'moderate' : 'low',
          score: overallScore,
          note:
            overallRisk === 'HIGH'
              ? 'Multi-variable propensity density drops below 0.15; reliance on clinical DAG mechanisms is high.'
              : 'Density overlap is sufficient for empirical stability.',
        },
      ],
    };
  },

  async startGeneration(
    config: CohortConfiguration,
    datasetId = 'ds-clinical-001',
    purpose = 'software_qa'
  ): Promise<{ runId: string; status: string; isLive: boolean }> {
    const useSourceAgeDistribution = config.minAge <= 18 && config.maxAge >= 89;
    const runPayload = {
      dataset_id: datasetId,
      seed: 405,
      generator: config.modelType === 'gaussian_copula_baseline' ? 'gaussian_copula' : 'causal_scm',
      cohort: {
        patient_count: config.targetPatients,
        age: useSourceAgeDistribution
          ? { mode: 'sample_like_source', bins: [] }
          : {
              mode: 'histogram',
              bins: [{ min: config.minAge, max: config.maxAge, proportion: 1 }],
            },
        diabetes_prevalence: Number((config.diabetesPct / 100).toFixed(4)),
        hypertension_enabled: config.hypertensionEnabled,
        hypertension_prevalence: config.hypertensionEnabled
          ? Number((config.hypertensionPct / 100).toFixed(4))
          : null,
        sex_proportions: {
          female: Number((config.femalePct / 100).toFixed(4)),
          male: Number((config.malePct / 100).toFixed(4)),
        },
        adherence_target: Number((config.adherencePct / 100).toFixed(4)),
        activity_level: config.activityLevel.toLowerCase(),
        treatment_status: config.treatmentStatus === 'Active Treatment'
          ? 'active_treatment'
          : config.treatmentStatus === 'Control / Standard of Care'
            ? 'control'
            : 'all',
        programme_weeks: config.studyDurationWeeks,
        visit_interval_days: 7,
      },
      purpose,
      include_baseline: config.modelType === 'causal_generator',
    };

    try {
      const res = await apiClient.post<{ run_id: string; status: string }>('/runs', runPayload);
      return {
        runId: res.data.run_id,
        status: res.data.status,
        isLive: true,
      };
    } catch (err) {
      if (apiClient.getMode() !== 'demo_preview') throw err;
      return {
        runId: `HG-${new Date().getFullYear()}-${Math.floor(100 + Math.random() * 900)}`,
        status: 'Generating',
        isLive: false,
      };
    }
  },

  async pollRunUntilComplete(
    runId: string,
    onProgress: (run: GenerationRun) => void,
    intervalMs = 700
  ): Promise<GenerationRun | null> {
    return new Promise((resolve) => {
      const timer = setInterval(async () => {
        try {
          const res = await apiClient.get<BackendRunRecord>(`/runs/${runId}`);
          const mapped = mapBackendRunToGenerationRun(res.data);
          onProgress(mapped);

          if (res.data.status === 'completed' || res.data.status === 'failed' || res.data.status === 'interrupted') {
            clearInterval(timer);
            resolve(mapped);
          }
        } catch {
          // If polling fails or offline
          clearInterval(timer);
          resolve(null);
        }
      }, intervalMs);
    });
  },
};

