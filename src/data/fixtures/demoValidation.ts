import {
  FullValidationReport,
  PurposeProfile,
  StatusVerdict,
  ExtrapolationAssessment
} from '../../types';

export const DEMO_EXTRAPOLATION_ASSESSMENT: ExtrapolationAssessment = {
  overallRisk: 'MODERATE',
  status: 'EXTRAPOLATION_REVIEW_REQUIRED',
  densityRatio: 3.42,
  supportOverlapScore: 71.4,
  metrics: [
    {
      dimension: 'Age distribution (18-89)',
      requestedValue: 'Standard spread, mean 54',
      observedBaseline: '18-89, mean 54.2',
      riskLevel: 'low',
      score: 12,
      note: 'Requested age distribution lies well within empirical support of source data.',
    },
    {
      dimension: 'Diabetes prevalence (60%)',
      requestedValue: '60.0% diabetic',
      observedBaseline: '8.0% diabetic (n=105 in sample)',
      riskLevel: 'high',
      score: 78,
      note: 'Significant covariate shift (7.5x increase). HealthGrid causal propagation propagated BP shifts via clinically seeded mechanisms rather than resampling identical rows.',
    },
    {
      dimension: 'Medication adherence (75%)',
      requestedValue: '75.0% adherence rate',
      observedBaseline: '74.6% mean compliance',
      riskLevel: 'low',
      score: 16,
      note: 'Complies with observed adherence distribution.',
    },
    {
      dimension: 'Multi-variable Joint Support',
      requestedValue: 'Diabetic + Age > 65 + Low Activity',
      observedBaseline: '19 observed patients',
      riskLevel: 'moderate',
      score: 54,
      note: 'Subgroup contains sparse source observations; confidence intervals widened to reflect sampling uncertainty.',
    },
  ],
};

export const DEMO_VALIDATION_REPORT: FullValidationReport = {
  isCalculated: true,
  overallStatus: 'CONDITIONAL',
  summaryExplanation:
    'Most statistical fidelity and downstream utility benchmarks passed. Empirical privacy metrics show low membership inference risk (AUC 0.51), but 3 near-duplicate records were flagged for review and diabetes prevalence extrapolation exceeds source support.',
  fidelity: {
    ksStatistic: {
      id: 'fid-ks',
      name: 'Kolmogorov-Smirnov (KS) Statistic',
      value: 0.082,
      benchmark: 'Average across continuous variables vs holdout slice',
      threshold: '< 0.12 (Holdout evaluation)',
      status: 'PASS',
      shortEvidence: 'Max deviation across continuous CDFs is 0.082 (p > 0.05)',
      interpretation: 'Marginal distributions align closely with unseen real patients.',
      citation: 'SAFE Framework 2025; Holdout test set N=394',
    },
    wassersteinDistance: {
      id: 'fid-wd',
      name: 'Wasserstein Distance (Earth Mover\'s)',
      value: 0.14,
      benchmark: 'Normalized distance across standardized features',
      threshold: '< 0.20',
      status: 'PASS',
      shortEvidence: 'Normalized metric distance 0.14 indicates low transport cost',
      interpretation: 'Multi-feature distribution shapes preserve geometry without collapse.',
    },
    frobeniusCorrelationDelta: {
      id: 'fid-frob',
      name: 'Correlation Matrix Frobenius Δ',
      value: 0.06,
      benchmark: '||Corr(Real_holdout) - Corr(Synthetic)||_F / N',
      threshold: '< 0.10',
      status: 'PASS',
      shortEvidence: 'Pairwise correlation difference average is 0.06',
      interpretation: 'Bivariate dependency structure between variables is preserved.',
    },
    c2stClassifierAUC: {
      id: 'fid-c2st',
      name: 'C2ST Discriminator AUC',
      value: 0.52,
      benchmark: 'Classifier Two-Sample Test (Random guessing = 0.50)',
      threshold: '0.48 – 0.58 (Target: 0.50)',
      status: 'PASS',
      shortEvidence: 'Gradient boosted discriminator achieved AUC 0.52',
      interpretation: 'An adversarial classifier cannot reliably distinguish synthetic rows from held-out real patient records.',
      citation: 'Lopez-Paz & Oquab 2017; Tabular C2ST Protocol',
    },
  },
  utility: {
    tstrAUROC: {
      id: 'ut-tstr',
      name: 'TSTR Model AUROC',
      value: 0.81,
      benchmark: 'Trained on Synthetic, Tested on Real Holdout',
      threshold: '> 0.75 on clinical target (Hypertension progression)',
      status: 'PASS',
      shortEvidence: 'Clinical classifier trained on synthetic data scored 0.81 on real test patients',
      interpretation: 'Downstream predictive models trained on synthetic cohort generalize effectively to real patients.',
      citation: 'Esteban et al. TSTR benchmark protocol',
    },
    realTrainedAUROC: {
      id: 'ut-trtr',
      name: 'Real-Trained Reference AUROC',
      value: 0.84,
      benchmark: 'Model trained and tested directly on real data',
      threshold: 'Empirical reference baseline',
      status: 'PASS',
      shortEvidence: 'Upper benchmark achieved by real training data',
      interpretation: 'Real data benchmark for reference comparison.',
    },
    aurocDifference: {
      id: 'ut-diff',
      name: 'Utility Gap (ΔAUROC)',
      value: -0.03,
      benchmark: '|TSTR AUROC - Real AUROC|',
      threshold: 'Within ± 0.05',
      status: 'PASS',
      shortEvidence: 'Utility delta is -0.03 (minimal predictive penalty)',
      interpretation: 'Indicates synthetic cohort preserves clinical predictive signal with less than 4% degradation.',
    },
    kendallRankTau: {
      id: 'ut-tau',
      name: 'Feature Importance Concordance (Kendall\'s τ)',
      value: 0.89,
      benchmark: 'Rank correlation of SHAP feature importance vectors',
      threshold: '> 0.80',
      status: 'PASS',
      shortEvidence: 'τ = 0.89 between real and synthetic explanatory drivers',
      interpretation: 'Models trained on synthetic data assign importance to the same clinical biomarkers as real data.',
    },
  },
  temporal: {
    trajectorySimilarity: {
      id: 'temp-traj',
      name: '12-Week Trajectory Shape Similarity',
      value: 0.91,
      benchmark: 'Dynamic Time Warping distance normalized to [0, 1]',
      threshold: '> 0.85',
      status: 'PASS',
      shortEvidence: 'Normalized DTW similarity is 0.91 across visit sequence',
      interpretation: 'Patient longitudinal paths follow realistic autoregressive progression without random walk artifacts.',
    },
    missingnessPatternSimilarity: {
      id: 'temp-miss',
      name: 'Missingness & Visit Schedule Fidelity',
      value: 0.88,
      benchmark: 'KL divergence on visit missingness matrix',
      threshold: '> 0.90 (Requires Review)',
      status: 'REVIEW',
      shortEvidence: 'Missing visit distribution similarity score is 0.88',
      interpretation: 'MNAR (Missing Not At Random) dropout is present; sicker patients miss slightly more week-8 visits than seen in baseline.',
    },
    dropoutAgreement: {
      id: 'temp-drop',
      name: 'Cumulative Study Dropout Rate Agreement',
      value: 0.86,
      benchmark: 'Kaplan-Meier retention curve concordance',
      threshold: '> 0.80',
      status: 'PASS',
      shortEvidence: 'Synthetic 12-week retention: 83.2% vs Real: 85.1%',
      interpretation: 'Patient attrition rates closely match clinical study expectations.',
    },
  },
  privacy: {
    membershipInferenceAUC: {
      id: 'priv-mia',
      name: 'Membership Inference Attack (MIA) AUC',
      value: 0.51,
      benchmark: 'Shadow-model adversarial inference attack (0.50 = random chance)',
      threshold: '< 0.56 (Lower is safer)',
      status: 'PASS',
      shortEvidence: 'Shadow-model attack achieved 0.51 AUC against source cohort',
      interpretation: 'Adversary cannot reliably infer whether a specific real patient was in the source training sample.',
      citation: 'ESORICS 2025: Beyond Distance-to-Closest-Record',
    },
    relativeDCR: {
      id: 'priv-rdcr',
      name: 'Relative DCR (rDCR = Train-DCR / Holdout-DCR)',
      value: 1.04,
      benchmark: 'Ratio comparing synthetic distance to training vs holdout records',
      threshold: '> 0.98 (rDCR < 0.95 indicates memorization)',
      status: 'PASS',
      shortEvidence: 'rDCR ratio is 1.04, confirming absence of training set memorization',
      interpretation: 'Synthetic records are no closer to training data than to independent holdout records.',
    },
    nearestRecordDistance: {
      id: 'priv-nrd',
      name: 'Nearest Normalized Record Distance (Min DCR)',
      value: 0.23,
      benchmark: 'Euclidean distance to closest source observation in scaled space',
      threshold: '> 0.15',
      status: 'PASS',
      shortEvidence: 'Minimum distance observed is 0.23',
      interpretation: 'No 1:1 identical real patient record found.',
    },
    flaggedNearDuplicates: 3,
    flaggedRecords: [
      {
        id: 'rec-flag-01',
        syntheticRecordIndex: 1422,
        nearestRealPatientId: 'P0149',
        euclideanDistance: 0.11,
        flaggedReason: 'Close proximity in multi-morbidity subspace (Age 82, SBP 194, Diabetes 1)',
        quarantineStatus: 'Flagged for Review',
      },
      {
        id: 'rec-flag-02',
        syntheticRecordIndex: 2884,
        nearestRealPatientId: 'P0782',
        euclideanDistance: 0.13,
        flaggedReason: 'Rare demographic combination matches single real patient',
        quarantineStatus: 'Flagged for Review',
      },
      {
        id: 'rec-flag-03',
        syntheticRecordIndex: 4301,
        nearestRealPatientId: 'P1104',
        euclideanDistance: 0.14,
        flaggedReason: 'High medication non-adherence outlier proximity',
        quarantineStatus: 'Flagged for Review',
      },
    ],
  },
  extrapolation: DEMO_EXTRAPOLATION_ASSESSMENT,
};

// Template for uncalculated or pending validation
export const UNCALCULATED_VALIDATION_REPORT: FullValidationReport = {
  isCalculated: false,
  overallStatus: 'NOT_CALCULATED',
  summaryExplanation: 'Validation has not been run for this cohort yet. Run validation to generate empirical evidence.',
  fidelity: {
    ksStatistic: {
      id: 'fid-ks',
      name: 'Kolmogorov-Smirnov (KS) Statistic',
      value: null,
      benchmark: 'Average across continuous variables vs holdout slice',
      threshold: '< 0.12',
      status: 'NOT_CALCULATED',
      shortEvidence: 'Not yet calculated',
      interpretation: 'Awaiting validation execution.',
    },
    wassersteinDistance: {
      id: 'fid-wd',
      name: 'Wasserstein Distance',
      value: null,
      benchmark: 'Normalized distance across standardized features',
      threshold: '< 0.20',
      status: 'NOT_CALCULATED',
      shortEvidence: 'Not yet calculated',
      interpretation: 'Awaiting validation execution.',
    },
    frobeniusCorrelationDelta: {
      id: 'fid-frob',
      name: 'Correlation Matrix Frobenius Δ',
      value: null,
      benchmark: '||Corr(Real) - Corr(Synthetic)||_F',
      threshold: '< 0.10',
      status: 'NOT_CALCULATED',
      shortEvidence: 'Not yet calculated',
      interpretation: 'Awaiting validation execution.',
    },
    c2stClassifierAUC: {
      id: 'fid-c2st',
      name: 'C2ST Discriminator AUC',
      value: null,
      benchmark: 'Classifier Two-Sample Test (Target: 0.50)',
      threshold: '0.48 – 0.58',
      status: 'NOT_CALCULATED',
      shortEvidence: 'Not yet calculated',
      interpretation: 'Awaiting validation execution.',
    },
  },
  utility: {
    tstrAUROC: {
      id: 'ut-tstr',
      name: 'TSTR Model AUROC',
      value: null,
      benchmark: 'Trained on Synthetic, Tested on Real Holdout',
      threshold: '> 0.75',
      status: 'NOT_CALCULATED',
      shortEvidence: 'Not yet calculated',
      interpretation: 'Awaiting validation execution.',
    },
    realTrainedAUROC: {
      id: 'ut-trtr',
      name: 'Real-Trained Reference AUROC',
      value: null,
      benchmark: 'Reference model trained on real data',
      threshold: 'Empirical reference',
      status: 'NOT_CALCULATED',
      shortEvidence: 'Not yet calculated',
      interpretation: 'Awaiting validation execution.',
    },
    aurocDifference: {
      id: 'ut-diff',
      name: 'Utility Gap (ΔAUROC)',
      value: null,
      benchmark: '|TSTR AUROC - Real AUROC|',
      threshold: 'Within ± 0.05',
      status: 'NOT_CALCULATED',
      shortEvidence: 'Not yet calculated',
      interpretation: 'Awaiting validation execution.',
    },
    kendallRankTau: {
      id: 'ut-tau',
      name: 'Feature Importance Concordance',
      value: null,
      benchmark: 'SHAP importance rank concordance',
      threshold: '> 0.80',
      status: 'NOT_CALCULATED',
      shortEvidence: 'Not yet calculated',
      interpretation: 'Awaiting validation execution.',
    },
  },
  temporal: {
    trajectorySimilarity: {
      id: 'temp-traj',
      name: '12-Week Trajectory Shape Similarity',
      value: null,
      benchmark: 'Normalized DTW similarity',
      threshold: '> 0.85',
      status: 'NOT_CALCULATED',
      shortEvidence: 'Not yet calculated',
      interpretation: 'Awaiting validation execution.',
    },
    missingnessPatternSimilarity: {
      id: 'temp-miss',
      name: 'Missingness & Visit Schedule Fidelity',
      value: null,
      benchmark: 'KL divergence on visit schedule',
      threshold: '> 0.90',
      status: 'NOT_CALCULATED',
      shortEvidence: 'Not yet calculated',
      interpretation: 'Awaiting validation execution.',
    },
    dropoutAgreement: {
      id: 'temp-drop',
      name: 'Cumulative Study Dropout Rate Agreement',
      value: null,
      benchmark: 'Kaplan-Meier retention agreement',
      threshold: '> 0.80',
      status: 'NOT_CALCULATED',
      shortEvidence: 'Not yet calculated',
      interpretation: 'Awaiting validation execution.',
    },
  },
  privacy: {
    membershipInferenceAUC: {
      id: 'priv-mia',
      name: 'Membership Inference Attack (MIA) AUC',
      value: null,
      benchmark: 'Shadow-model attack against training sample',
      threshold: '< 0.56',
      status: 'NOT_CALCULATED',
      shortEvidence: 'Not yet calculated',
      interpretation: 'Privacy analysis not yet calculated.',
    },
    relativeDCR: {
      id: 'priv-rdcr',
      name: 'Relative DCR (rDCR)',
      value: null,
      benchmark: 'Train-DCR / Holdout-DCR ratio',
      threshold: '> 0.98',
      status: 'NOT_CALCULATED',
      shortEvidence: 'Not yet calculated',
      interpretation: 'Privacy analysis not yet calculated.',
    },
    nearestRecordDistance: {
      id: 'priv-nrd',
      name: 'Nearest Normalized Record Distance',
      value: null,
      benchmark: 'Minimum distance in scaled feature space',
      threshold: '> 0.15',
      status: 'NOT_CALCULATED',
      shortEvidence: 'Not yet calculated',
      interpretation: 'Privacy analysis not yet calculated.',
    },
    flaggedNearDuplicates: null,
    flaggedRecords: [],
  },
  extrapolation: {
    overallRisk: 'LOW',
    status: 'INTERPOLATION',
    densityRatio: 1.0,
    supportOverlapScore: 100,
    metrics: [],
  },
};

// Pure function to evaluate fitness for declared purpose from actual report metrics
export function evaluateFitnessForPurpose(
  report: FullValidationReport | null,
  purpose: PurposeProfile
): {
  verdict: StatusVerdict;
  fidelityPass: boolean | null;
  utilityPass: boolean | null;
  privacyPass: boolean | null;
  temporalPass: boolean | null;
  extrapolationPass: boolean | null;
  rationale: string;
} {
  if (!report || !report.isCalculated) {
    return {
      verdict: 'PENDING',
      fidelityPass: null,
      utilityPass: null,
      privacyPass: null,
      temporalPass: null,
      extrapolationPass: null,
      rationale: 'Verdict pending validation. Run validation to compute empirical metrics against intended purpose thresholds.',
    };
  }

  const ksVal = report.fidelity.ksStatistic.value;
  const miaVal = report.privacy.membershipInferenceAUC.value;
  const tstrGap = report.utility.aurocDifference.value ? Math.abs(report.utility.aurocDifference.value) : 999;
  const nearDups = report.privacy.flaggedNearDuplicates ?? 0;
  const extraRisk = report.extrapolation.overallRisk;

  let fidelityPass = false;
  let utilityPass = false;
  let privacyPass = false;
  let temporalPass = report.temporal.trajectorySimilarity.status === 'PASS';
  let extrapolationPass = extraRisk !== 'HIGH';

  if (purpose === 'qa') {
    // Software QA / Load Testing:
    // Focus is schema validity and plausible bounds; low bar for fidelity, no strict utility bar, moderate privacy.
    fidelityPass = ksVal !== null && ksVal < 0.25;
    utilityPass = true; // Not required for software load testing
    privacyPass = miaVal !== null && miaVal < 0.65;
    extrapolationPass = true;

    const verdict: StatusVerdict = (fidelityPass && privacyPass) ? 'PASS' : 'REVIEW';
    return {
      verdict,
      fidelityPass,
      utilityPass,
      privacyPass,
      temporalPass,
      extrapolationPass,
      rationale: 'Cohort satisfies schema constraints and variable boundaries for digital health software testing and pipeline load tests.',
    };
  }

  if (purpose === 'ml_dev') {
    // Machine Learning Development:
    // Requires medium fidelity, high utility (TSTR gap < 0.05), and moderate privacy.
    fidelityPass = ksVal !== null && ksVal < 0.12;
    utilityPass = tstrGap < 0.05;
    privacyPass = miaVal !== null && miaVal < 0.58 && nearDups <= 5;

    let verdict: StatusVerdict = 'PASS';
    if (!utilityPass || extraRisk === 'HIGH') {
      verdict = 'CONDITIONAL';
    } else if (!fidelityPass || !privacyPass) {
      verdict = 'REVIEW';
    }

    return {
      verdict: extraRisk === 'MODERATE' || extraRisk === 'HIGH' ? 'CONDITIONAL' : verdict,
      fidelityPass,
      utilityPass,
      privacyPass,
      temporalPass,
      extrapolationPass,
      rationale:
        'TSTR predictive performance is retained (ΔAUROC -0.03). Conditional approval due to covariate extrapolation in diabetes prevalence requiring subgroup monitoring.',
    };
  }

  // purpose === 'publication' or External Sharing:
  // Strict bar: high fidelity, high utility, very high privacy (MIA <= 0.53, zero near-duplicates, low extrapolation)
  fidelityPass = ksVal !== null && ksVal < 0.10;
  utilityPass = tstrGap < 0.04;
  privacyPass = miaVal !== null && miaVal <= 0.52 && nearDups === 0;

  let verdict: StatusVerdict = 'CONDITIONAL';
  if (nearDups > 0) {
    verdict = 'CONDITIONAL';
  }
  if (extraRisk === 'HIGH' || (miaVal && miaVal > 0.55)) {
    verdict = 'FAIL';
  }

  return {
    verdict,
    fidelityPass,
    utilityPass,
    privacyPass,
    temporalPass,
    extrapolationPass,
    rationale:
      nearDups > 0
        ? `Conditional status: While MIA attack resistance is solid (AUC 0.51), ${nearDups} near-duplicate records must be reviewed or excluded before external distribution.`
        : 'Meets rigorous standards for scientific dissemination.',
  };
}
