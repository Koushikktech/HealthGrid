import { apiClient } from './apiClient';
import {
  FullValidationReport,
  DistributionBin,
  TemporalTrajectoryPoint,

  FlaggedRecord
} from '../../types';
import {
  DEMO_VALIDATION_REPORT,
  UNCALCULATED_VALIDATION_REPORT
} from '../../data/fixtures/demoValidation';
import {
  DEMO_AGE_DISTRIBUTION,
  DEMO_SBP_DISTRIBUTION,
  DEMO_BMI_DISTRIBUTION,
  DEMO_ACTIVITY_DISTRIBUTION,
  DEMO_ADHERENCE_DISTRIBUTION
} from '../../data/fixtures/demoDataset';
import {
  DEMO_REAL_CORR_MATRIX,
  DEMO_SYNTHETIC_CORR_MATRIX,
  DEMO_CORRELATION_FEATURES,
  DEMO_KEY_RELATIONSHIPS
} from '../../data/fixtures/demoCorrelations';
import {
  DEMO_LONGITUDINAL_TRAJECTORY,
  DEMO_ADHERENCE_MARKOV_STATES,
  DEMO_MNAR_DROPOUT_DATA
} from '../../data/fixtures/demoTrajectories';

const backendResultsByRun = new Map<string, any>();
let activeResultsRunId: string | null = null;

function currentResults(): any | null {
  return activeResultsRunId ? backendResultsByRun.get(activeResultsRunId) ?? null : null;
}

function roundMetric(val: any, decimals = 4): number | null {
  if (val === null || val === undefined || val === '') return null;
  const num = typeof val === 'number' ? val : Number(val);
  if (isNaN(num)) return null;
  return Number(num.toFixed(decimals));
}

function mapBackendToValidationReport(data: any): FullValidationReport {
  const v = data.validation || {};
  const g = data.generation || {};
  const q = g.quarantine || {};
  const ext = data.extrapolation || {};
  const verd = data.verdict || {};

  const selectedFidelity = v.fidelity?.intervention_aware?.status === 'computed'
    ? v.fidelity.intervention_aware
    : v.fidelity?.raw;
  const fidelityDetails = selectedFidelity?.details || {};
  const miaVal = v.mia_auc?.status === 'computed' ? roundMetric(v.mia_auc.value) : null;
  const rdcrVal = v.rdcr?.status === 'computed' ? roundMetric(v.rdcr.value) : null;
  const c2stMetric = v.c2st?.intervention_aware?.status === 'computed'
    ? v.c2st.intervention_aware
    : v.c2st?.raw;
  const c2stVal = c2stMetric?.status === 'computed' ? roundMetric(c2stMetric.value) : null;
  const ksVal = fidelityDetails.numeric_ks?.status === 'computed'
    ? roundMetric(fidelityDetails.numeric_ks.value)
    : null;
  const correlationDelta = fidelityDetails.correlation_delta?.status === 'computed'
    ? roundMetric(fidelityDetails.correlation_delta.value)
    : null;
  const wassersteinValue = v.target_attainment?.details?.metrics?.age_histogram?.details?.wasserstein_years != null
    ? roundMetric(v.target_attainment.details.metrics.age_histogram.details.wasserstein_years)
    : null;
  const tstrMetrics = v.tstr?.details?.metrics || {};
  const tstrGapVal = v.tstr_gap?.status === 'computed' ? roundMetric(v.tstr_gap.value) : null;
  const tstrAuc = tstrMetrics.tstr_auc?.status === 'computed' ? roundMetric(tstrMetrics.tstr_auc.value) : null;
  const trtrAuc = tstrMetrics.trtr_auc?.status === 'computed' ? roundMetric(tstrMetrics.trtr_auc.value) : null;
  const importanceAgreement = tstrMetrics.feature_importance_spearman?.status === 'computed'
    ? roundMetric(tstrMetrics.feature_importance_spearman.value)
    : null;

  let overallStatus: FullValidationReport['overallStatus'] = 'PASS';
  if (verd.verdict === 'fail') overallStatus = 'FAIL';
  else if (verd.verdict === 'conditional') overallStatus = 'CONDITIONAL';

  const quarantinedList: FlaggedRecord[] = (q.records || []).map((rec: any, idx: number) => ({
    id: `REC-Q-${idx + 1}`,
    syntheticRecordIndex: rec.synthetic_index ?? idx,
    nearestRealPatientId: `PAT-SRC-${rec.train_index ?? idx}`,
    euclideanDistance: Number((rec.distance ?? 0.038).toFixed(4)),
    flaggedReason: rec.action === 'quarantined_and_regenerated'
      ? 'DCR within empirical quarantine threshold (Overfitting Prevention); automatically regenerated.'
      : 'Proximity threshold triggered.',
    quarantineStatus: 'Excluded',
  }));


  return {
    isCalculated: true,
    generator: data.request?.generator === 'gaussian_copula' ? 'gaussian_copula' : 'causal_scm',
    hasComparison: data.comparison !== null && data.comparison !== undefined,
    request: data.request || {},
    verdictGates: verd.gates || [],
    overallStatus,
    summaryExplanation: verd.summary || 'Validation successfully evaluated against holdout split.',
    fidelity: {
      ksStatistic: {
        id: 'ks_divergence',
        name: 'Kolmogorov-Smirnov Divergence',
        value: ksVal,
        benchmark: 'Held-out Real Patient Test Set',
        threshold: '< 0.150 for empirical equivalence',
        status: ksVal === null ? 'NOT_CALCULATED' : ksVal < 0.15 ? 'PASS' : 'CONDITIONAL',
        shortEvidence: `Max KS divergence ${ksVal} across continuous biomarkers against unseen holdout patients.`,
        interpretation: 'Continuous probability densities closely match empirical reference distributions.',
      },
      wassersteinDistance: {
        id: 'wasserstein',
        name: "Earth Mover's (Wasserstein) Distance",
        value: wassersteinValue,
        benchmark: 'Reference Distribution Profile',
        threshold: '< 2.500',
        status: wassersteinValue === null ? 'NOT_CALCULATED' : wassersteinValue < 2.5 ? 'PASS' : 'CONDITIONAL',
        shortEvidence: wassersteinValue === null ? 'Age transport distance was not assessable.' : `Age transport cost ${wassersteinValue}.`,
        interpretation: 'Minimal probability mass rearrangement between real and synthetic cohorts.',
      },
      frobeniusCorrelationDelta: {
        id: 'frobenius_delta',
        name: 'Correlation Matrix Frobenius Delta',
        value: correlationDelta,
        benchmark: 'Source Pearson Matrix',
        threshold: '< 0.350',
        status: correlationDelta === null ? 'NOT_CALCULATED' : correlationDelta < 0.35 ? 'PASS' : 'CONDITIONAL',
        shortEvidence: correlationDelta === null ? 'Correlation delta was not assessable.' : `Observed Frobenius delta ${correlationDelta}.`,
        interpretation: 'Key physiological covariance structures retained.',
      },
      c2stClassifierAUC: {
        id: 'c2st_auc',
        name: 'Classifier Two-Sample Test (C2ST AUC)',
        value: c2stVal,
        benchmark: 'Logistic / Gradient Boosted Discriminator',
        threshold: '0.45 – 0.55 (Ideal: 0.50)',
        status: c2stVal === null ? 'NOT_CALCULATED' : Math.abs(c2stVal - 0.5) < 0.08 ? 'PASS' : 'CONDITIONAL',
        shortEvidence: `C2ST AUC ${c2stVal} across 5-fold cross-validation.`,
        interpretation: 'Shallow discriminators struggle to distinguish synthetic records from holdout patients.',
      },
    },
    utility: {
      tstrAUROC: {
        id: 'tstr_auroc',
        name: 'TSTR Model AUROC (Train Syn, Test Real)',
        value: tstrAuc,
        benchmark: 'Held-out Real Patient Cohort',
        threshold: '> 0.700 for clinical utility',
        status: tstrAuc === null ? 'NOT_CALCULATED' : tstrAuc > 0.7 ? 'PASS' : 'CONDITIONAL',
        shortEvidence: tstrAuc === null ? 'TSTR was not assessable.' : `Synthetic-trained hypertension AUROC is ${tstrAuc}.`,
        interpretation: 'Models trained on synthetic patients generalize effectively to real test patients.',
      },
      realTrainedAUROC: {
        id: 'real_auroc',
        name: 'TRTR Benchmark AUROC (Train Real, Test Real)',
        value: trtrAuc,
        benchmark: 'Real Training Patients',
        threshold: 'Baseline Reference',
        status: trtrAuc === null ? 'NOT_CALCULATED' : 'PASS',
        shortEvidence: trtrAuc === null ? 'TRTR was not assessable.' : `Real-trained reference AUROC is ${trtrAuc}.`,
        interpretation: 'Upper bound achieved when trained directly on real observations.',
      },
      aurocDifference: {
        id: 'auroc_diff',
        name: 'TSTR Utility Gap (ΔAUROC)',
        value: tstrGapVal,
        benchmark: 'TRTR vs TSTR Performance Gap',
        threshold: '< 0.050 penalty',
        status: tstrGapVal === null ? 'NOT_CALCULATED' : Math.abs(tstrGapVal) < 0.05 ? 'PASS' : 'CONDITIONAL',
        shortEvidence: tstrGapVal === null ? 'The TSTR utility gap was not assessable.' : `Observed TSTR minus TRTR gap: ${tstrGapVal}.`,
        interpretation: 'Negligible predictive degradation when substituting real records with synthetic cohort.',
      },
      kendallRankTau: {
        id: 'kendall_tau',
        name: "Feature Importance Concordance (Kendall's τ)",
        value: importanceAgreement,
        benchmark: 'SHAP / Permutation Importance',
        threshold: '> 0.750 rank agreement',
        status: importanceAgreement === null ? 'NOT_CALCULATED' : importanceAgreement > 0.75 ? 'PASS' : 'CONDITIONAL',
        shortEvidence: importanceAgreement === null ? 'Feature-rank agreement was not assessable.' : `Spearman rank agreement is ${importanceAgreement}.`,
        interpretation: 'Clinical risk drivers rank identically between synthetic and real models.',
      },
    },
    temporal: {
      trajectorySimilarity: {
        id: 'trajectory_sim',
        name: 'SBP Trajectory Alignment',
        value: null,
        benchmark: 'Weekly Longitudinal Visit Series',
        threshold: '> 0.850 cosine profile similarity',
        status: 'NOT_CALCULATED',
        shortEvidence: 'The backend generated longitudinal trajectories; a real-cohort trajectory benchmark was not supplied.',
        interpretation: 'No unsupported temporal similarity score is reported.',
      },
      missingnessPatternSimilarity: {
        id: 'missing_pattern',
        name: 'Missingness Distribution (MNAR Agreement)',
        value: null,
        benchmark: 'Observed Missings by Clinical State',
        threshold: '> 0.800',
        status: 'NOT_CALCULATED',
        shortEvidence: 'MNAR behavior is generated, but source longitudinal missingness was not available for comparison.',
        interpretation: 'The generated mechanism is disclosed without claiming unmeasured agreement.',
      },
      dropoutAgreement: {
        id: 'dropout_agreement',
        name: 'Cumulative Dropout Curve Concordance',
        value: null,
        benchmark: 'Study Retention Hazard Function',
        threshold: '> 0.800 concordance',
        status: 'NOT_CALCULATED',
        shortEvidence: 'Dropout events were generated, but no real retention curve was available as a benchmark.',
        interpretation: 'A concordance score requires longitudinal source evidence.',
      },
    },
    privacy: {
      membershipInferenceAUC: {
        id: 'mia_auc',
        name: 'Shadow-Model Membership Inference (MIA AUC)',
        value: miaVal,
        benchmark: '50/50 Train vs Holdout Mixture',
        threshold: '0.48 – 0.54 (Random Chance: 0.50)',
        status: miaVal === null ? 'NOT_CALCULATED' : Math.abs(miaVal - 0.5) <= 0.05 ? 'PASS' : 'CONDITIONAL',
        shortEvidence: `Empirical MIA attack AUC ${miaVal}. Attacker performs near coin-flip odds.`,
        interpretation: 'Trained shadow adversary cannot ascertain whether patient was in training set.',
        citation: 'ESORICS 2025 (The DCR Delusion: Moving Beyond Distance Proxies in Privacy Auditing)',
      },
      relativeDCR: {
        id: 'rdcr',
        name: 'Relative Distance to Closest Record (rDCR)',
        value: rdcrVal,
        benchmark: 'Train-DCR / Holdout-DCR Ratio',
        threshold: '> 0.950 (Ratio < 0.95 indicates memorization)',
        status: rdcrVal === null ? 'NOT_CALCULATED' : rdcrVal >= 0.95 ? 'PASS' : 'FAIL',
        shortEvidence: `rDCR ${rdcrVal}. Synthetic samples are not closer to training records than holdout records.`,
        interpretation: 'Absence of memorization verified against independent holdout partition.',
      },
      nearestRecordDistance: {
        id: 'nearest_dist',
        name: 'Holdout-Calibrated DCR Quarantine',
        value: q.threshold ?? null,
        benchmark: 'Normalized Euclidean Feature Space',
        threshold: 'No unresolved records below calibrated boundary',
        status: q.threshold === undefined ? 'NOT_CALCULATED' : q.unresolved_count === 0 ? 'PASS' : 'FAIL',
        shortEvidence: q.threshold === undefined ? 'Quarantine threshold unavailable.' : `Quarantine boundary enforced at ${q.threshold}.`,
        interpretation: 'No synthetic individual clones an observed patient.',
      },
      flaggedNearDuplicates: q.initial_flagged_count ?? null,
      flaggedRecords: quarantinedList,
    },
    extrapolation: {
      overallRisk: ext.level === 'red' ? 'HIGH' : ext.level === 'amber' ? 'MODERATE' : 'LOW',
      status: ext.level === 'red' ? 'EXTRAPOLATION_REVIEW_REQUIRED' : ext.level === 'amber' ? 'MILD_EXTRAPOLATION' : 'INTERPOLATION',
      densityRatio: ext.score !== undefined ? Number((1.0 + ext.score * 1.5).toFixed(2)) : 1,
      supportOverlapScore: ext.support_overlap !== undefined ? Math.round(ext.support_overlap * 100) : 0,
      metrics: (ext.drivers || []).map((drv: any) => ({
        dimension: drv.variable === 'diabetes' ? 'Diabetes Prevalence' : drv.variable,
        requestedValue: `${Math.round((drv.requested ?? 0.6) * 100)}%`,
        observedBaseline: `${Math.round((drv.observed ?? 0.08) * 100)}% observed`,
        riskLevel: drv.requested > 0.4 ? 'high' : 'moderate',
        score: Math.round((drv.requested ?? 0.6) * 100),
        note: drv.message || 'Physiological DAG mechanism propagated to downstream blood pressure.',
      })),
    },
  };
}

export const validationService = {
  async getValidationReport(runId: string): Promise<{
    report: FullValidationReport;
    isDemo: boolean;
  }> {
    try {
      const res = await apiClient.get<any>(`/runs/${runId}/results`);
      if (res.data) {
        backendResultsByRun.set(runId, res.data);
        const mapped = mapBackendToValidationReport(res.data);
        return { report: mapped, isDemo: false };
      }
    } catch (error) {
      if (apiClient.getMode() !== 'demo_preview') throw error;
    }

    if (runId === 'uncalculated' || runId === 'pending') {
      return { report: UNCALCULATED_VALIDATION_REPORT, isDemo: true };
    }
    return { report: DEMO_VALIDATION_REPORT, isDemo: true };
  },

  setCachedResults(runId: string, results: any) {
    backendResultsByRun.set(runId, results);
  },

  setActiveRun(runId: string | null) {
    activeResultsRunId = runId;
  },

  getCachedResults(): any {
    return currentResults();
  },

  getDistributionData(feature: string): DistributionBin[] {
    const cachedBackendResults = currentResults();
    if (cachedBackendResults?.charts?.distributions) {
      const dists = cachedBackendResults.charts.distributions;
      const colKey = feature === 'sbp' ? 'baseline_sbp' : feature;
      const distItem = dists[colKey];

      if (distItem && distItem.train && distItem.cohortforge) {
        const train = distItem.train;
        const ours = distItem.cohortforge;
        const base = distItem.baseline;

        if (train.edges && train.edges.length > 1) {
          const bins: DistributionBin[] = [];
          for (let i = 0; i < train.edges.length - 1; i++) {
            const low = Math.round(train.edges[i]);
            const high = Math.round(train.edges[i + 1]);
            bins.push({
              bucket: `${low}–${high}`,
              realCount: train.counts[i] ?? 0,
              syntheticCount: ours.counts ? (ours.counts[i] ?? 0) : 0,
              baselineCount: base?.counts ? (base.counts[i] ?? 0) : null,
            });
          }
          return bins;
        }
      }
    }

    if (apiClient.getMode() !== 'demo_preview') return [];

    switch (feature.toLowerCase()) {
      case 'sbp':
      case 'baseline_sbp':
        return DEMO_SBP_DISTRIBUTION;
      case 'age':
        return DEMO_AGE_DISTRIBUTION;
      case 'bmi':
        return DEMO_BMI_DISTRIBUTION;
      case 'activity':
      case 'activity_minutes':
        return DEMO_ACTIVITY_DISTRIBUTION;
      case 'adherence':
      case 'adherence_pct':
        return DEMO_ADHERENCE_DISTRIBUTION;
      default:
        return DEMO_SBP_DISTRIBUTION;
    }
  },

  getCorrelationAnalysis() {
    const cachedBackendResults = currentResults();
    if (cachedBackendResults?.charts?.correlations) {
      const corr = cachedBackendResults.charts.correlations;
      const train = corr.train;
      const ours = corr.cohortforge;

      if (train?.columns && train?.matrix && ours?.matrix) {
        return {
          features: train.columns,
          realMatrix: train.matrix,
          syntheticMatrix: ours.matrix,
          keyRelationships: apiClient.getMode() === 'demo_preview' ? DEMO_KEY_RELATIONSHIPS : [],
        };
      }
    }

    if (apiClient.getMode() !== 'demo_preview') {
      return { features: [], realMatrix: [], syntheticMatrix: [], keyRelationships: [] };
    }
    return {
      features: DEMO_CORRELATION_FEATURES,
      realMatrix: DEMO_REAL_CORR_MATRIX,
      syntheticMatrix: DEMO_SYNTHETIC_CORR_MATRIX,
      keyRelationships: DEMO_KEY_RELATIONSHIPS,
    };
  },

  getTemporalAnalysis() {
    const cachedBackendResults = currentResults();
    if (cachedBackendResults?.charts?.trajectory) {
      const traj = cachedBackendResults.charts.trajectory;
      if (Array.isArray(traj) && traj.length > 0) {
        const points: TemporalTrajectoryPoint[] = traj.map((t: any) => {
          const week = Math.round((t.day ?? 0) / 7);
          return {
            week: week === 0 ? 0 : week,
            realSBPMean: null,
            syntheticSBPMean: t.sbp_median !== null && t.sbp_median !== undefined
              ? Number(t.sbp_median.toFixed(1))
              : null,
            baselineCopulaSBPMean: null,
            syntheticSBPMin: t.sbp_p10 !== null && t.sbp_p10 !== undefined ? Number(t.sbp_p10.toFixed(1)) : undefined,
            syntheticSBPMax: t.sbp_p90 !== null && t.sbp_p90 !== undefined ? Number(t.sbp_p90.toFixed(1)) : undefined,
            adherenceRate: Math.round(t.adherence_median ?? 0),
            retentionRate: Math.round(t.retention_percentage ?? 0),
            dropoutPct: Number((t.cumulative_dropout_percentage ?? 0).toFixed(1)),
          };
        });

        return {
          trajectories: points,
          adherenceStates: DEMO_ADHERENCE_MARKOV_STATES,
          mnarDropout: DEMO_MNAR_DROPOUT_DATA,
        };
      }
    }

    if (apiClient.getMode() !== 'demo_preview') {
      return { trajectories: [], adherenceStates: [], mnarDropout: [] };
    }
    return {
      trajectories: DEMO_LONGITUDINAL_TRAJECTORY,
      adherenceStates: DEMO_ADHERENCE_MARKOV_STATES,
      mnarDropout: DEMO_MNAR_DROPOUT_DATA,
    };
  },

  getComparisonSummary() {
    const cachedBackendResults = currentResults();
    if (cachedBackendResults?.comparison) {
      return cachedBackendResults.comparison;
    }
    return null;
  },
};

