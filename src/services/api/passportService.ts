import { apiClient } from './apiClient';
import { CohortPassportData, PurposeProfile } from '../../types';
import { DEMO_VALIDATION_REPORT, evaluateFitnessForPurpose } from '../../data/fixtures/demoValidation';

export const passportService = {
  async getPassport(
    runId: string,
    purpose: PurposeProfile = 'qa'
  ): Promise<{ passport: CohortPassportData; isDemo: boolean }> {
    try {
      const res = await apiClient.get<CohortPassportData>(`/passport/${runId}?purpose=${purpose}`);
      return { passport: res.data, isDemo: false };
    } catch {
      const isCalculated = runId !== 'uncalculated' && runId !== 'pending';
      const evalResult = evaluateFitnessForPurpose(isCalculated ? DEMO_VALIDATION_REPORT : null, purpose);

      const passport: CohortPassportData = {
        passportId: isCalculated ? `HGP-2026-${runId.slice(-3) || '001'}` : 'HGP-PENDING',
        issuedAt: isCalculated ? '2026-09-18 10:15:00 UTC' : 'Pending',
        sha256Checksum: isCalculated ? 'e3b0c44298fc1c149afbf4c8996fb92427ae41e4649b934ca495991b7852b855' : null,
        datasetTitle: 'Clinical Cardiometabolic Study Dataset',
        datasetSourceSampleN: 1314,
        syntheticTargetN: 5000,
        generationModelName: 'HealthGrid Causal / Conditional Generator',
        selectedPurpose: purpose,
        purposeVerdict: evalResult.verdict,
        verdictRationale: evalResult.rationale,
        holdoutSplitRatio: '70% Train / 30% Holdout (Validation on unseen patients)',
        auditTrail: {
          datasetProfiledAt: '2026-09-18 09:30:12 UTC',
          generationStartedAt: '2026-09-18 10:14:02 UTC',
          generationCompletedAt: '2026-09-18 10:14:10 UTC',
          validationRunCompletedAt: '2026-09-18 10:15:00 UTC',
        },
        complianceConsiderations: {
          title: 'Research & Compliance Considerations (Informational Notes)',
          notes: [
            'Technical Evidence Only: This document provides quantitative statistical and empirical privacy metrics to assist research sponsors, Institutional Review Boards (IRBs), and Data Protection Officers (DPOs).',
            'No Automatic Legal Certification: Synthetic data generation is not an automatic guarantee of legal anonymization. Organizations must assess their specific regulatory context (e.g. DPDP Act, HIPAA Safe Harbor / Expert Determination, GDPR).',
            'Adversarial Attack Surface: A shadow-model Membership Inference Attack (MIA) resulted in AUC 0.51, indicating attack performance near random chance (0.50).',
            'Near-Duplicate Proximity: 3 records reside within the empirical isolation boundary and have been quarantined for human review.',
            'Causal Extrapolation Boundaries: Diabetes prevalence was conditioned at 60.0% from an 8.0% baseline. Physiological relationships were propagated through the clinically seeded DAG rather than copy-sampling.',
          ],
        },
      };

      return { passport, isDemo: true };
    }
  },
};
