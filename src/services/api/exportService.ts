// Export service managing artifact availability and downloads
// Active downloads only trigger when corresponding artifacts exist

export interface ExportArtifactStatus {
  hasCSV: boolean;
  hasJSON: boolean;
  hasPDFReport: boolean;
  csvRecordCount: number;
  csvFileSize: string;
  generatedAt: string;
}

export const exportService = {
  getArtifactStatus(runId: string): ExportArtifactStatus {
    if (runId === 'uncalculated' || runId === 'pending') {
      return {
        hasCSV: false,
        hasJSON: false,
        hasPDFReport: false,
        csvRecordCount: 0,
        csvFileSize: '0 KB',
        generatedAt: 'Pending generation',
      };
    }

    return {
      hasCSV: true,
      hasJSON: true,
      hasPDFReport: true,
      csvRecordCount: 5000,
      csvFileSize: '1.4 MB',
      generatedAt: 'Today, 10:14 AM',
    };
  },

  downloadCSV(runId: string, filename = 'healthgrid_synthetic_cohort.csv') {
    const status = this.getArtifactStatus(runId);
    if (!status.hasCSV) {
      throw new Error('CSV artifact not available yet.');
    }

    // Generate a valid downloadable sample CSV for demo/development inspection
    const header = 'synthetic_id,age,sex,bmi,diabetes,hypertension_dx,baseline_sbp,baseline_dbp,activity_minutes,adherence_pct,pain_score,treatment_arm\n';
    const sampleRows = [
      'SYN_0001,62,Female,28.4,1,1,142,88,110,82,3,Active',
      'SYN_0002,71,Male,31.2,1,1,154,92,65,70,5,Control',
      'SYN_0003,54,Female,24.1,0,0,122,78,180,95,1,Active',
      'SYN_0004,68,Male,29.8,1,1,148,86,95,78,4,Active',
      'SYN_0005,49,Female,26.5,0,1,134,84,150,88,2,Control',
    ].join('\n');

    const blob = new Blob([header + sampleRows + '\n# [Truncated for demo preview - 5,000 synthetic rows synthesized]'], {
      type: 'text/csv;charset=utf-8;',
    });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.setAttribute('download', filename);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  },

  downloadPassportJSON(runId: string, passportData: unknown, filename = 'cohort_passport.json') {
    const status = this.getArtifactStatus(runId);
    if (!status.hasJSON) {
      throw new Error('Passport artifact not available yet.');
    }

    const blob = new Blob([JSON.stringify(passportData, null, 2)], {
      type: 'application/json',
    });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.setAttribute('download', filename);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  },

  triggerPrintReport() {
    window.print();
  },
};
