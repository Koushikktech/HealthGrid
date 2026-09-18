import { apiClient } from './apiClient';
import { FullValidationReport, DistributionBin } from '../../types';
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

export const validationService = {
  async getValidationReport(runId: string): Promise<{
    report: FullValidationReport;
    isDemo: boolean;
  }> {
    try {
      const res = await apiClient.get<FullValidationReport>(`/validation/report/${runId}`);
      return { report: res.data, isDemo: false };
    } catch {
      // In demo mode, if runId is HG-2026-001 or default, return demo report
      if (runId === 'uncalculated' || runId === 'pending') {
        return { report: UNCALCULATED_VALIDATION_REPORT, isDemo: true };
      }
      return { report: DEMO_VALIDATION_REPORT, isDemo: true };
    }
  },

  getDistributionData(feature: string): DistributionBin[] {
    switch (feature.toLowerCase()) {
      case 'age':
        return DEMO_AGE_DISTRIBUTION;
      case 'sbp':
      case 'baseline_sbp':
        return DEMO_SBP_DISTRIBUTION;
      case 'bmi':
        return DEMO_BMI_DISTRIBUTION;
      case 'activity':
      case 'activity_minutes':
        return DEMO_ACTIVITY_DISTRIBUTION;
      case 'adherence':
      case 'adherence_pct':
        return DEMO_ADHERENCE_DISTRIBUTION;
      default:
        return DEMO_AGE_DISTRIBUTION;
    }
  },

  getCorrelationAnalysis() {
    return {
      features: DEMO_CORRELATION_FEATURES,
      realMatrix: DEMO_REAL_CORR_MATRIX,
      syntheticMatrix: DEMO_SYNTHETIC_CORR_MATRIX,
      keyRelationships: DEMO_KEY_RELATIONSHIPS,
    };
  },

  getTemporalAnalysis() {
    return {
      trajectories: DEMO_LONGITUDINAL_TRAJECTORY,
      adherenceStates: DEMO_ADHERENCE_MARKOV_STATES,
      mnarDropout: DEMO_MNAR_DROPOUT_DATA,
    };
  },
};
