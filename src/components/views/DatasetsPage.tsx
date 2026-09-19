import React from 'react';
import { DatasetSummary } from '../../types';
import { DataTable, ColumnDef } from '../common/DataTable';
import { StatusBadge } from '../common/StatusBadge';
import { Upload, FileBarChart2, Sliders, Database, ArrowRight } from 'lucide-react';
import { datasetService } from '../../services/api/datasetService';

interface DatasetsPageProps {
  datasets: DatasetSummary[];
  onOpenUpload: () => void;
  onInspectProfile: (datasetId: string) => void;
  onBuildCohort: (datasetId: string) => void;
  onLoadDemo?: () => void;
}

export const DatasetsPage: React.FC<DatasetsPageProps> = ({
  datasets,
  onOpenUpload,
  onInspectProfile,
  onBuildCohort,
  onLoadDemo,
}) => {
  const [loadingDemo, setLoadingDemo] = React.useState(false);
  const columns: ColumnDef<DatasetSummary>[] = [
    {
      header: 'Dataset Name',
      accessorKey: 'name',
      sortable: true,
      cell: (row) => (
        <div>
          <div className="font-semibold text-slate-900 dark:text-white hover:text-blue-600 dark:hover:text-blue-400 cursor-pointer" onClick={() => onInspectProfile(row.id)}>
            {row.name}
          </div>
          {row.description && (
            <div className="text-[11px] text-slate-600 dark:text-slate-400 max-w-md truncate">{row.description}</div>
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
        <span className="font-mono font-semibold text-slate-900 dark:text-slate-100">
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
        <span className="font-mono font-medium text-slate-700 dark:text-slate-300">
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
        <span className="font-mono font-medium text-slate-700 dark:text-slate-300">{row.featureCount}</span>
      ),
    },
    {
      header: 'Missing %',
      accessorKey: 'missingValuePct',
      sortable: true,
      align: 'right',
      cell: (row) => (
        <span className="font-mono font-medium text-slate-700 dark:text-slate-300">{row.missingValuePct}%</span>
      ),
    },
    {
      header: 'Uploaded',
      accessorKey: 'uploadedAt',
      sortable: true,
      cell: (row) => <span className="text-slate-600 dark:text-slate-400 font-medium">{row.uploadedAt}</span>,
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
        <div className="flex items-center justify-end gap-2">
          <button
            onClick={() => onInspectProfile(row.id)}
            title="Inspect statistical schema and variables"
            className="px-3 py-1.5 glass-pill hover:bg-white dark:hover:bg-slate-800 text-slate-700 dark:text-slate-200 font-semibold text-[11px] rounded-xl inline-flex items-center justify-center gap-1.5 shrink-0 leading-none transition-all shadow-2xs"
          >
            <FileBarChart2 className="w-3.5 h-3.5 text-slate-500 dark:text-slate-400" />
            <span>Profile</span>
          </button>
          <button
            onClick={() => onBuildCohort(row.id)}
            title="Design a synthetic cohort using this dataset"
            className="px-3 py-1.5 bg-blue-50 dark:bg-blue-950/50 hover:bg-blue-100 dark:hover:bg-blue-900/60 border border-blue-200 dark:border-blue-800/80 rounded-xl text-blue-700 dark:text-blue-300 font-semibold text-[11px] inline-flex items-center justify-center gap-1.5 shrink-0 leading-none transition-all shadow-2xs"
          >
            <Sliders className="w-3.5 h-3.5 text-blue-600 dark:text-blue-400" />
            <span>Build Cohort</span>
          </button>
        </div>
      ),
    },
  ];

  return (
    <div className="space-y-6 animate-in fade-in duration-300">
      {/* Header */}
      <div className="flex flex-wrap items-center justify-between gap-4 pb-5 border-b border-slate-200/80 dark:border-slate-800">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-slate-900 dark:text-white">Datasets</h1>
          <p className="text-xs text-slate-600 dark:text-slate-400 mt-1 font-medium">
            Upload and inspect healthcare datasets used for synthetic cohort generation.
          </p>
        </div>
        <div className="flex items-center gap-2.5">
          <button
            onClick={async () => {
              if (onLoadDemo) {
                onLoadDemo();
              } else {
                setLoadingDemo(true);
                await datasetService.loadDemoDataset();
                setLoadingDemo(false);
                window.location.reload();
              }
            }}
            disabled={loadingDemo}
            className="inline-flex items-center gap-2 px-3.5 py-2 glass-pill hover:bg-white/80 dark:hover:bg-slate-800 text-slate-700 dark:text-slate-200 rounded-xl text-xs font-semibold transition-all shadow-xs"
          >
            <Database className="w-3.5 h-3.5 text-blue-600 dark:text-blue-400" />
            <span>{loadingDemo ? 'Loading Demo...' : 'Load Bundled Demo (1,314 Patients)'}</span>
          </button>
          <button
            onClick={onOpenUpload}
            className="inline-flex items-center gap-2 px-4 py-2.5 bg-blue-600 hover:bg-blue-500 text-white rounded-xl text-xs font-semibold transition-all shadow-sm hover:shadow-md hover:-translate-y-0.5 active:translate-y-0"
          >
            <Upload className="w-3.5 h-3.5" />
            <span>Upload Dataset</span>
          </button>
        </div>
      </div>

      {/* Dataset Table */}
      <DataTable
        data={datasets}
        columns={columns}
        searchKey="name"
        searchPlaceholder="Search datasets by title..."
      />

      {/* Guidance Card */}
      <div className="p-5 glass-card rounded-2xl border border-slate-200/80 dark:border-slate-800/80 text-xs text-slate-600 dark:text-slate-400 flex items-start gap-3.5 shadow-xs">
        <Database className="w-4 h-4 text-blue-500 dark:text-blue-400 shrink-0 mt-0.5" />
        <div>
          <strong className="text-slate-900 dark:text-white font-semibold">Supported Formats &amp; Specifications:</strong> HealthGrid processes cross-sectional
          and longitudinal tabular datasets in standard CSV format up to 50 MB. Datasets undergo automated schema inference,
          missingness profiling, and identifier detection prior to model initialization.
        </div>
      </div>
    </div>
  );
};
