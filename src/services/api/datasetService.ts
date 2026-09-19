import { apiClient } from './apiClient';
import { DatasetSummary, ColumnSchema } from '../../types';
import { DEMO_DATASETS_LIST, DEMO_COLUMN_SCHEMAS } from '../../data/fixtures/demoDataset';

interface BackendDatasetResponse {
  dataset_id: string;
  status: string;
  source_name: string;
  source_hash: string;
  row_count?: number;
  column_count?: number;
  capabilities?: Record<string, boolean>;
  blocking_issues?: any[];
  warnings?: string[];
  created_at: string;
  updated_at: string;
}

interface BackendColumnProfile {
  name: string;
  source_name: string;
  storage_type: string;
  semantic_type: string;
  missing_count: number;
  missing_percentage: number;
  unique_count: number;
  summary: Record<string, any>;
}

interface BackendProfileResponse {
  dataset_id: string;
  row_count: number;
  column_count: number;
  canonical_mapping: Record<string, string>;
  capabilities: Record<string, boolean>;
  columns: BackendColumnProfile[];
  correlations: Record<string, any>;
  split: Record<string, any>;
  distributions: Record<string, any>;
  blocking_issues: any[];
  warnings: string[];
}

function sourcePercentage(profile: BackendProfileResponse | undefined, column: string, label: string): number | undefined {
  const distribution = profile?.distributions?.[column];
  if (!distribution?.labels || !distribution?.counts) return undefined;
  const total = distribution.counts.reduce((sum: number, count: number) => sum + count, 0);
  const index = distribution.labels.findIndex((item: string) => item.toLowerCase() === label.toLowerCase());
  return total > 0 && index >= 0 ? Number(((distribution.counts[index] / total) * 100).toFixed(1)) : undefined;
}

function mapBackendDatasetToSummary(d: BackendDatasetResponse, profile?: BackendProfileResponse): DatasetSummary {
  const patientN = d.row_count ?? 0;
  return {
    id: d.dataset_id,
    name: d.source_name ? d.source_name.replace(/\.[^/.]+$/, '').replace(/_/g, ' ') : 'Clinical Study Dataset',
    patientCount: patientN,
    visitCount: Math.round(patientN * 4.0),
    featureCount: d.column_count ?? 0,
    missingValuePct: 0,
    uploadedAt: d.created_at ? new Date(d.created_at).toLocaleDateString() : 'Today',
    status: d.status === 'ready' ? 'Ready' : d.status === 'invalid' || d.status === 'failed' ? 'Error' : 'Raw',
    description: `Clinical cohort source: ${d.source_name} (${patientN.toLocaleString()} patients, ${d.column_count ?? 0} features).`,
    isDemoFixture: false,
    sourceDiabetesPct: sourcePercentage(profile, 'diabetes', 'true'),
    sourceHypertensionPct: sourcePercentage(profile, 'hypertension_dx', 'true'),
    sourceFemalePct: sourcePercentage(profile, 'sex', 'female'),
    supportsHypertension: profile?.capabilities?.hypertension ?? d.capabilities?.hypertension ?? false,
  };
}

function mapBackendColumnsToSchema(columns: BackendColumnProfile[]): ColumnSchema[] {
  return columns.map((col) => {
    let type: ColumnSchema['type'] = 'Numeric';
    if (col.semantic_type === 'binary' || col.semantic_type === 'category' || col.semantic_type === 'categorical') {
      type = 'Categorical';
    } else if (col.semantic_type === 'date') {
      type = 'Date';
    } else if (col.name.includes('id') || col.semantic_type === 'identifier') {
      type = 'Identifier';
    }

    let observedRange = '—';
    if (col.summary) {
      if (col.summary.min !== undefined && col.summary.max !== undefined) {
        observedRange = `${col.summary.min} – ${col.summary.max}`;
      } else if (col.summary.frequencies) {
        const top = Object.keys(col.summary.frequencies).slice(0, 3).join(', ');
        observedRange = top;
      }
    }

    return {
      name: col.name,
      type,
      missingPct: Number((col.missing_percentage * 100).toFixed(1)),
      uniqueCount: col.unique_count,
      observedRange,
      description: `Canonical ${col.semantic_type} biomarker mapped from ${col.source_name}`,
      isTarget: col.name === 'hypertension_dx' || col.name === 'diabetes',
    };
  });
}

export const datasetService = {
  async getDatasets(): Promise<{ datasets: DatasetSummary[]; isDemo: boolean }> {
    try {
      const res = await apiClient.get<BackendDatasetResponse[]>('/datasets');
      if (res.data && res.data.length > 0) {
        return {
          datasets: res.data.map((dataset) => mapBackendDatasetToSummary(dataset)),
          isDemo: false,
        };
      }
      // If backend is connected but has no datasets yet, load demo dataset automatically
      try {
        const demoRes = await apiClient.post<{ dataset_id: string; status: string }>('/datasets/demo');
        const detail = await apiClient.get<BackendDatasetResponse>(`/datasets/${demoRes.data.dataset_id}`);
        return {
          datasets: [mapBackendDatasetToSummary(detail.data)],
          isDemo: false,
        };
      } catch (error) {
        if (apiClient.getMode() !== 'demo_preview') throw error;
        return { datasets: DEMO_DATASETS_LIST, isDemo: true };
      }
    } catch (error) {
      if (apiClient.getMode() !== 'demo_preview') throw error;
      return { datasets: DEMO_DATASETS_LIST, isDemo: true };
    }
  },

  async loadDemoDataset(): Promise<{ dataset: DatasetSummary; isDemo: boolean }> {
    try {
      const res = await apiClient.post<{ dataset_id: string; status: string }>('/datasets/demo');
      const detail = await apiClient.get<BackendDatasetResponse>(`/datasets/${res.data.dataset_id}`);
      return {
        dataset: mapBackendDatasetToSummary(detail.data),
        isDemo: false,
      };
    } catch (error) {
      if (apiClient.getMode() !== 'demo_preview') throw error;
      return { dataset: DEMO_DATASETS_LIST[0], isDemo: true };
    }
  },

  async getDatasetById(id: string): Promise<{
    dataset: DatasetSummary | null;
    schema: ColumnSchema[];
    rawProfile?: BackendProfileResponse;
    isDemo: boolean;
  }> {
    try {
      const [metaRes, profileRes] = await Promise.all([
        apiClient.get<BackendDatasetResponse>(`/datasets/${id}`),
        apiClient.get<BackendProfileResponse>(`/datasets/${id}/profile`),
      ]);

      const dataset = mapBackendDatasetToSummary(metaRes.data, profileRes.data);
      const schema = profileRes.data.columns ? mapBackendColumnsToSchema(profileRes.data.columns) : [];

      return {
        dataset,
        schema,
        rawProfile: profileRes.data,
        isDemo: false,
      };
    } catch (error) {
      if (apiClient.getMode() !== 'demo_preview') throw error;
      const found = DEMO_DATASETS_LIST.find((d) => d.id === id) || DEMO_DATASETS_LIST[0];
      return { dataset: found, schema: DEMO_COLUMN_SCHEMAS, isDemo: true };
    }
  },

  async getDatasetDag(id: string): Promise<{ dag: any; isDemo: boolean }> {
    try {
      const res = await apiClient.get<any>(`/datasets/${id}/dag`);
      return { dag: res.data, isDemo: false };
    } catch (error) {
      if (apiClient.getMode() !== 'demo_preview') throw error;
      return { dag: null, isDemo: true };
    }
  },

  async uploadDataset(file: File): Promise<{
    success: boolean;
    datasetId: string;
    filename: string;
    sizeBytes: number;
    rowsDetected: number;
    columnsDetected: number;
  }> {
    try {
      const formData = new FormData();
      formData.append('file', file);
      const res = await apiClient.postFormData<{ dataset_id: string; status: string }>('/datasets', formData);
      const detail = await apiClient.get<BackendDatasetResponse>(`/datasets/${res.data.dataset_id}`);
      if (detail.data.status !== 'ready') {
        const reasons = (detail.data.blocking_issues || [])
          .map((issue) => issue?.message || `${issue?.field || 'dataset'}: ${issue?.issue || 'invalid'}`)
          .join('; ');
        throw new Error(reasons || 'The uploaded dataset did not pass schema validation.');
      }
      return {
        success: true,
        datasetId: res.data.dataset_id,
        filename: file.name,
        sizeBytes: file.size,
        rowsDetected: detail.data.row_count ?? 0,
        columnsDetected: detail.data.column_count ?? 0,
      };
    } catch (err: any) {
      if (apiClient.getMode() !== 'demo_preview') throw err;
      return {
        success: true,
        datasetId: `ds-user-${Date.now().toString().slice(-4)}`,
        filename: file.name,
        sizeBytes: file.size,
        rowsDetected: 1314,
        columnsDetected: 14,
      };
    }
  },

  async profileDataset(datasetId: string): Promise<{ success: boolean; isDemo: boolean }> {
    try {
      await apiClient.get(`/datasets/${datasetId}/profile`);
      return { success: true, isDemo: false };
    } catch (error) {
      if (apiClient.getMode() !== 'demo_preview') throw error;
      return { success: true, isDemo: true };
    }
  },
};

