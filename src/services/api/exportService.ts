import { apiClient } from './apiClient';

export interface ExportArtifactStatus {
  hasCSV: boolean;
  hasVisitsCSV: boolean;
  hasJSON: boolean;
  hasPDFReport: boolean;
  hasBundleZIP: boolean;
  csvRecordCount: number;
  csvFileSize: string;
  generatedAt: string;
}

export const exportService = {
  async getArtifactStatus(runId: string): Promise<ExportArtifactStatus> {
    const unavailable: ExportArtifactStatus = {
      hasCSV: false,
      hasVisitsCSV: false,
      hasJSON: false,
      hasPDFReport: false,
      hasBundleZIP: false,
      csvRecordCount: 0,
      csvFileSize: '0 KB',
      generatedAt: 'Pending generation',
    };
    if (!runId || runId === 'uncalculated' || runId === 'pending') return unavailable;

    if (apiClient.getMode() === 'demo_preview') {
      return {
        hasCSV: true,
        hasVisitsCSV: true,
        hasJSON: true,
        hasPDFReport: true,
        hasBundleZIP: false,
        csvRecordCount: 5000,
        csvFileSize: 'Demo preview',
        generatedAt: 'Demo preview',
      };
    }

    const [resultsRes, runRes] = await Promise.all([
      apiClient.get<any>(`/runs/${runId}/results`),
      apiClient.get<any>(`/runs/${runId}`),
    ]);
    const artifacts: Array<{ kind: string; size_bytes?: number }> = resultsRes.data.artifacts || [];
    const kinds = new Set(artifacts.map((artifact) => artifact.kind));
    const patientArtifact = artifacts.find((artifact) => artifact.kind === 'patients_csv');
    const sizeBytes = patientArtifact?.size_bytes ?? 0;
    return {
      hasCSV: kinds.has('patients_csv'),
      hasVisitsCSV: kinds.has('visits_csv'),
      hasJSON: kinds.has('passport_json'),
      hasPDFReport: kinds.has('passport_pdf'),
      hasBundleZIP: kinds.has('bundle_zip'),
      csvRecordCount: resultsRes.data.generation?.patient_count ?? 0,
      csvFileSize: sizeBytes ? `${(sizeBytes / (1024 * 1024)).toFixed(2)} MB` : 'Unavailable',
      generatedAt: runRes.data.updated_at
        ? new Date(runRes.data.updated_at).toLocaleString()
        : 'Unavailable',
    };
  },

  downloadArtifact(runId: string, artifactKind: string, defaultFilename: string) {
    if (apiClient.getMode() === 'connected_api') {
      const url = apiClient.getArtifactUrl(`/runs/${runId}/artifacts/${artifactKind}`);
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', defaultFilename);
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      return;
    }
  },

  downloadCSV(runId: string, filename = 'healthgrid_synthetic_cohort.csv') {
    if (apiClient.getMode() === 'connected_api') {
      this.downloadArtifact(runId, 'patients_csv', filename);
      return;
    }

    // Demo fallback
    const header = 'patient_id,age,sex,bmi,diabetes,hypertension_dx,baseline_sbp,baseline_dbp,activity_minutes,adherence_pct,pain_score\n';
    const sampleRows = [
      'SYN_0001,62,Female,28.4,1,1,142,88,110,82,3',
      'SYN_0002,71,Male,31.2,1,1,154,92,65,70,5',
      'SYN_0003,54,Female,24.1,0,0,122,78,180,95,1',
      'SYN_0004,68,Male,29.8,1,1,148,86,95,78,4',
      'SYN_0005,49,Female,26.5,0,1,134,84,150,88,2',
    ].join('\n');

    const blob = new Blob([header + sampleRows + '\n# [Truncated for demo preview - 5,000 synthetic records]'], {
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

  downloadVisitsCSV(runId: string, filename = 'healthgrid_synthetic_visits.csv') {
    if (apiClient.getMode() === 'connected_api') {
      this.downloadArtifact(runId, 'visits_csv', filename);
      return;
    }

    const header = 'patient_id,visit_index,day,sbp,dbp,activity_minutes,steps,adherence_pct,adherence_state,pain_score,on_treatment,dropped_out,is_missing\n';
    const sampleRows = [
      'SYN_0001,0,0,142,88,110,5400,82,adherent,3,true,false,false',
      'SYN_0001,1,7,140,86,115,5600,85,adherent,2,true,false,false',
      'SYN_0001,2,14,138,85,120,6000,88,adherent,2,true,false,false',
    ].join('\n');

    const blob = new Blob([header + sampleRows + '\n# [Truncated for demo preview - 60,000 longitudinal visits]'], {
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

  downloadPassportJSON(runId: string, passportData?: unknown, filename = 'cohort_passport.json') {
    if (apiClient.getMode() === 'connected_api') {
      this.downloadArtifact(runId, 'passport_json', filename);
      return;
    }

    const blob = new Blob([JSON.stringify(passportData || { runId, status: 'demo_preview' }, null, 2)], {
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

  downloadPassportPDF(runId: string, filename = 'cohort_passport.pdf') {
    if (apiClient.getMode() === 'connected_api') {
      this.downloadArtifact(runId, 'passport_pdf', filename);
      return;
    }
    window.print();
  },

  downloadBundleZIP(runId: string, filename = 'cohortforge_bundle.zip') {
    if (apiClient.getMode() === 'connected_api') {
      this.downloadArtifact(runId, 'bundle_zip', filename);
      return;
    }
    alert('Full ZIP package requires connected backend server.');
  },

  triggerPrintReport() {
    window.print();
  },
};

