import React from 'react';
import { DatasetSummary } from '../../types';
import { DataTable, ColumnDef } from '../common/DataTable';
import { StatusBadge } from '../common/StatusBadge';
import { Upload, FileBarChart2, Sliders, Database, ArrowRight } from 'lucide-react';

interface DatasetsPageProps {
  datasets: DatasetSummary[];
  onOpenUpload: () => void;
  onInspectProfile: (datasetId: string) => void;
  onBuildCohort: (datasetId: string) => void;
}

export const DatasetsPage: React.FC<DatasetsPageProps> = ({
  datasets,
  onOpenUpload,
  onInspectProfile,
  onBuildCohort,
}) => {
  const columns: ColumnDef<DatasetSummary>[] = [
    {
      header: 'Dataset Name',
      accessorKey: 'name',
      sortable: true,
      cell: (row) => (
        <div>
          <div className="font-semibold text-slate-900 hover:text-blue-600 cursor-pointer" onClick={() => onInspectProfile(row.id)}>
            {row.name}
          </div>
          {row.description && (
            <div className="text-[11px] text-slate-500 max-w-md truncate">{row.description}</div>
          )}
        </div>
      ),
    },
    {
      header: 'Patients',
      accessorKey: 'patientCount',
      sortable: true,
      align: 'right',
      cell: (row) => (
        <span className="font-mono font-medium text-slate-800">
          {row.patientCount.toLocaleString()}
        </span>
      ),
    },
    {
      header: 'Visits',
      accessorKey: 'visitCount',
      sortable: true,
      align: 'right',
      cell: (row) => (
        <span className="font-mono text-slate-600">
          {row.visitCount.toLocaleString()}
        </span>
      ),
    },
    {
      header: 'Features',
      accessorKey: 'featureCount',
      sortable: true,
      align: 'center',
      cell: (row) => (
        <span className="font-mono text-slate-600">{row.featureCount}</span>
      ),
    },
    {
      header: 'Missing %',
      accessorKey: 'missingValuePct',
      sortable: true,
      align: 'right',
      cell: (row) => (
        <span className="font-mono text-slate-600">{row.missingValuePct}%</span>
      ),
    },
    {
      header: 'Uploaded',
      accessorKey: 'uploadedAt',
      sortable: true,
      cell: (row) => <span className="text-slate-500">{row.uploadedAt}</span>,
    },
    {
      header: 'Status',
      accessorKey: 'status',
      sortable: true,
      cell: (row) => <StatusBadge status={row.status} size="sm" />,
    },
    {
      header: 'Actions',
      align: 'right',
      cell: (row) => (
        <div className="flex items-center justify-end gap-1.5">
          <button
            onClick={() => onInspectProfile(row.id)}
            title="Inspect statistical schema and variables"
            className="px-2 py-1 bg-white hover:bg-slate-100 border border-slate-200 rounded text-slate-700 font-medium text-[11px] flex items-center gap-1 transition-colors"
          >
            <FileBarChart2 className="w-3 h-3 text-slate-500" />
            <span>Profile</span>
          </button>
          <button
            onClick={() => onBuildCohort(row.id)}
            title="Design a synthetic cohort using this dataset"
            className="px-2 py-1 bg-blue-50 hover:bg-blue-100 border border-blue-200 rounded text-blue-700 font-medium text-[11px] flex items-center gap-1 transition-colors"
          >
            <Sliders className="w-3 h-3 text-blue-600" />
            <span>Build Cohort</span>
          </button>
        </div>
      ),
    },
  ];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-wrap items-center justify-between gap-4 pb-4 border-b border-slate-200">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-slate-900">Datasets</h1>
          <p className="text-xs text-slate-500 mt-1">
            Upload and inspect healthcare datasets used for synthetic cohort generation.
          </p>
        </div>
        <button
          onClick={onOpenUpload}
          className="inline-flex items-center gap-1.5 px-3.5 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded text-xs font-semibold transition-colors shadow-xs"
        >
          <Upload className="w-3.5 h-3.5" />
          <span>Upload Dataset</span>
        </button>
      </div>

      {/* Dataset Table */}
      <DataTable
        data={datasets}
        columns={columns}
        searchKey="name"
        searchPlaceholder="Search datasets by title..."
      />

      {/* Guidance Card */}
      <div className="p-4 bg-slate-50 rounded-lg border border-slate-200 text-xs text-slate-600 flex items-start gap-3">
        <Database className="w-4 h-4 text-slate-400 shrink-0 mt-0.5" />
        <div>
          <strong className="text-slate-800">Supported Formats &amp; Specifications:</strong> HealthGrid processes cross-sectional
          and longitudinal tabular datasets in standard CSV format up to 50 MB. Datasets undergo automated schema inference,
          missingness profiling, and identifier detection prior to causal model initialization.
        </div>
      </div>
    </div>
  );
};
