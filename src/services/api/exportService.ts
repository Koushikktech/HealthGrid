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

  async downloadArtifact(runId: string, artifactKind: string, defaultFilename: string): Promise<boolean> {
    if (apiClient.getMode() === 'connected_api' && runId && runId !== 'uncalculated' && runId !== 'pending') {
      try {
        const url = apiClient.getArtifactUrl(`/runs/${runId}/artifacts/${artifactKind}`);
        const res = await fetch(url);
        if (res.ok) {
          const blob = await res.blob();
          const blobUrl = URL.createObjectURL(blob);
          const link = document.createElement('a');
          link.href = blobUrl;
          link.setAttribute('download', defaultFilename);
          document.body.appendChild(link);
          link.click();
          document.body.removeChild(link);
          URL.revokeObjectURL(blobUrl);
          return true;
        }
      } catch (err) {
        console.warn(`[exportService] Failed to download backend artifact ${artifactKind}:`, err);
      }
    }
    return false;
  },

  async downloadCSV(runId: string, filename = 'healthgrid_synthetic_cohort.csv', fallbackPatientCount = 5000) {
    if (apiClient.getMode() === 'connected_api' && runId && runId !== 'uncalculated' && runId !== 'pending') {
      const ok = await this.downloadArtifact(runId, 'patients_csv', filename);
      if (ok) return;
    }

    // Full 5,000-patient synthetic cohort generation for offline / demo fallback
    const count = fallbackPatientCount || 5000;
    const header = 'patient_id,age,sex,bmi,diabetes,hypertension_dx,baseline_sbp,baseline_dbp,fasting_glucose,hba1c,activity_minutes,adherence_pct,pain_score,region\n';
    const regions = ['north', 'south', 'east', 'west'];
    const rows: string[] = [];
    for (let i = 1; i <= count; i++) {
      const isFemale = (i * 17) % 100 < 50;
      const diabetes = (i * 23 + 7) % 100 < 45 ? 1 : 0;
      const hypertension = (i * 31 + 13) % 100 < 55 ? 1 : 0;
      const age = Math.round(35 + ((i * 13) % 46));
      const bmi = Number((22.5 + ((i * 7) % 12) + (diabetes ? 4.5 : 0)).toFixed(1));
      const sbp = Math.round(115 + (age > 60 ? 12 : 0) + (hypertension ? 26 : 0) + ((i * 5) % 15));
      const dbp = Math.round(sbp * 0.62 + ((i * 3) % 8));
      const glucose = Math.round(diabetes ? 135 + ((i * 11) % 85) : 84 + ((i * 5) % 24));
      const hba1c = Number((diabetes ? 6.8 + ((i * 9) % 35) / 10 : 5.1 + ((i * 7) % 9) / 10).toFixed(1));
      const activity = Math.round(60 + ((i * 19) % 150));
      const adherence = Math.min(98, Math.max(52, Math.round(78 + ((i * 17) % 25) - (diabetes ? 6 : 0))));
      const pain = Math.round(1 + ((i * 7) % 7));
      const region = regions[i % 4];
      rows.push(`HG-SYN-${String(i).padStart(5, '0')},${age},${isFemale ? 'Female' : 'Male'},${bmi},${diabetes},${hypertension},${sbp},${dbp},${glucose},${hba1c},${activity},${adherence},${pain},${region}`);
    }

    const blob = new Blob([header + rows.join('\n')], {
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

  async downloadVisitsCSV(runId: string, filename = 'healthgrid_synthetic_visits.csv') {
    if (apiClient.getMode() === 'connected_api' && runId && runId !== 'uncalculated' && runId !== 'pending') {
      const ok = await this.downloadArtifact(runId, 'visits_csv', filename);
      if (ok) return;
    }

    // Generate comprehensive longitudinal visit trajectories for demo mode (500 patients x 12 weekly visits = 6,000+ visits)
    const header = 'patient_id,visit_index,day,sbp,dbp,activity_minutes,steps,adherence_pct,adherence_state,pain_score,on_treatment,dropped_out,is_missing\n';
    const rows: string[] = [];
    for (let p = 1; p <= 500; p++) {
      const pid = `HG-SYN-${String(p).padStart(5, '0')}`;
      const baseSbp = 120 + ((p * 7) % 35);
      const baseDbp = 75 + ((p * 3) % 18);
      for (let week = 0; week <= 12; week++) {
        const day = week * 7;
        const dropOut = week > 8 && (p * 13) % 100 < 8;
        if (dropOut) break;
        const sbp = Math.round(baseSbp - week * 0.8 + ((p + week) % 5));
        const dbp = Math.round(baseDbp - week * 0.4 + ((p + week) % 3));
        const activity = Math.round(90 + ((p * 11 + week * 5) % 60));
        const steps = activity * 65;
        const adherence = Math.min(100, Math.max(60, Math.round(85 + ((p + week) % 15))));
        const pain = Math.max(1, Math.round(4 - week * 0.2));
        rows.push(`${pid},${week},${day},${sbp},${dbp},${activity},${steps},${adherence},adherent,${pain},true,false,false`);
      }
    }

    const blob = new Blob([header + rows.join('\n')], {
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

