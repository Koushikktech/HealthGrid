import { apiClient } from './apiClient';
import { PrivacyValidation, FlaggedRecord } from '../../types';
import { validationService } from './validationService';
import { DEMO_VALIDATION_REPORT, UNCALCULATED_VALIDATION_REPORT } from '../../data/fixtures/demoValidation';

export const privacyService = {
  async getPrivacyMetrics(runId: string): Promise<{
    privacy: PrivacyValidation;
    isDemo: boolean;
  }> {
    try {
      const res = await validationService.getValidationReport(runId);
      return { privacy: res.report.privacy, isDemo: res.isDemo };
    } catch (error) {
      if (apiClient.getMode() !== 'demo_preview') throw error;
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
    if (apiClient.getMode() === 'connected_api') {
      throw new Error('Manual quarantine status mutation is not supported by the backend API.');
    }
    return { success: true, recordId, newStatus: status };
  },
};

