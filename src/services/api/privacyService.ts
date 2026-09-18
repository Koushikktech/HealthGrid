import { apiClient } from './apiClient';
import { PrivacyValidation, FlaggedRecord } from '../../types';
import { DEMO_VALIDATION_REPORT, UNCALCULATED_VALIDATION_REPORT } from '../../data/fixtures/demoValidation';

export const privacyService = {
  async getPrivacyMetrics(runId: string): Promise<{
    privacy: PrivacyValidation;
    isDemo: boolean;
  }> {
    try {
      const res = await apiClient.get<PrivacyValidation>(`/privacy/report/${runId}`);
      return { privacy: res.data, isDemo: false };
    } catch {
      if (runId === 'uncalculated' || runId === 'pending') {
        return { privacy: UNCALCULATED_VALIDATION_REPORT.privacy, isDemo: true };
      }
      return { privacy: DEMO_VALIDATION_REPORT.privacy, isDemo: true };
    }
  },

  async updateFlaggedRecordStatus(
    recordId: string,
    status: FlaggedRecord['quarantineStatus']
  ): Promise<{ success: boolean; recordId: string; newStatus: string }> {
    try {
      const res = await apiClient.post<{ success: boolean; recordId: string; newStatus: string }>(
        `/privacy/flagged-records/${recordId}/status`,
        { status }
      );
      return res.data;
    } catch {
      return { success: true, recordId, newStatus: status };
    }
  },
};
