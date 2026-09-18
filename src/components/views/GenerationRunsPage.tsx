import React, { useState } from 'react';
import { GenerationRun } from '../../types';
import { DataTable, ColumnDef } from '../common/DataTable';
import { StatusBadge } from '../common/StatusBadge';
import {
  History,
  CheckCircle2,
  Clock,
  ArrowRight,
  Play,
  RotateCcw,
  FileCheck2,
  Download,
  Layers,
  Cpu
} from 'lucide-react';

interface GenerationRunsPageProps {
  runs: GenerationRun[];
  activeRun: GenerationRun | null;
  onReviewValidation: (runId: string) => void;
  onViewPassport: (runId: string) => void;
  onNewCohort: () => void;
}

export const GenerationRunsPage: React.FC<GenerationRunsPageProps> = ({
  runs,
  activeRun,
  onReviewValidation,
  onViewPassport,
  onNewCohort,
}) => {
  const currentRun = activeRun || runs[0];

  const columns: ColumnDef<GenerationRun>[] = [
    {
      header: 'Run ID',
      accessorKey: 'runId',
      sortable: true,
      cell: (row) => (
        <span className="font-mono font-bold text-slate-900">{row.runId}</span>
      ),
    },
    {
      header: 'Dataset',
      accessorKey: 'datasetName',
      sortable: true,
      cell: (row) => <span className="text-slate-800">{row.datasetName}</span>,
    },
    {
      header: 'Patients',
      accessorKey: 'patientCount',
      sortable: true,
      align: 'right',
      cell: (row) => (
        <span className="font-mono text-slate-800">
          {row.patientCount.toLocaleString()}
        </span>
      ),
    },
    {
      header: 'Model Architecture',
      accessorKey: 'model',
      sortable: true,
      cell: (row) => (
        <span className={`text-xs px-2 py-0.5 rounded font-medium ${
          row.model.includes('Causal')
            ? 'bg-blue-50 text-blue-800 border border-blue-200'
            : 'bg-slate-100 text-slate-700 border border-slate-200'
        }`}>
          {row.model}
        </span>
      ),
    },
    {
      header: 'Created',
      accessorKey: 'createdAt',
      sortable: true,
      cell: (row) => <span className="text-slate-500">{row.createdAt}</span>,
    },
    {
      header: 'Status',
      accessorKey: 'status',
      sortable: true,
      cell: (row) => <StatusBadge status={row.status} size="sm" />,
    },
    {
      header: 'Exec Time',
      accessorKey: 'executionTimeSec',
      align: 'right',
      cell: (row) => (
        <span className="font-mono text-slate-600">
          {row.executionTimeSec ? `${row.executionTimeSec}s` : 'Not measured'}
        </span>
      ),
    },
    {
      header: 'Actions',
      align: 'right',
      cell: (row) => (
        <div className="flex items-center justify-end gap-1.5">
          <button
            onClick={() => onReviewValidation(row.runId)}
            className="px-2 py-1 bg-white hover:bg-slate-50 border border-slate-200 rounded text-slate-700 text-[11px] font-medium"
          >
            Validation
          </button>
          <button
            onClick={() => onViewPassport(row.runId)}
            className="px-2 py-1 bg-blue-50 hover:bg-blue-100 border border-blue-200 rounded text-blue-700 text-[11px] font-semibold"
          >
            Passport
          </button>
        </div>
      ),
    },
  ];

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex flex-wrap items-center justify-between gap-4 pb-4 border-b border-slate-200">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-slate-900">Generation Runs</h1>
          <p className="text-xs text-slate-500 mt-1">
            Monitor active generation runs, track pipeline milestones, and audit historical cohorts.
          </p>
        </div>
        <button
          onClick={onNewCohort}
          className="inline-flex items-center gap-1.5 px-3.5 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded text-xs font-semibold transition-colors shadow-xs"
        >
          <Play className="w-3.5 h-3.5 fill-current" />
          <span>Launch New Generation</span>
        </button>
      </div>

      {/* Active Run Timeline Card */}
      {currentRun && (
        <div className="bg-white rounded-lg border border-slate-200 p-6">
          <div className="flex flex-wrap items-center justify-between gap-4 pb-4 border-b border-slate-200">
            <div>
              <div className="flex items-center gap-2">
                <span className="text-xs font-mono font-bold text-slate-500">RUN ID: {currentRun.runId}</span>
                <StatusBadge status={currentRun.status} size="sm" />
              </div>
              <h3 className="text-base font-bold text-slate-900 mt-1">
                {currentRun.patientCount.toLocaleString()} Patients Synthesized from {currentRun.datasetName}
              </h3>
            </div>
            <div className="flex items-center gap-3">
              <div className="text-right">
                <span className="text-xs text-slate-400 block">Duration</span>
                <span className="text-xs font-mono font-bold text-slate-700">
                  {currentRun.executionTimeSec ? `${currentRun.executionTimeSec}s (CPU)` : 'Not measured'}
                </span>
              </div>
              <button
                onClick={() => onReviewValidation(currentRun.runId)}
                className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded text-xs font-semibold flex items-center gap-1.5 transition-colors shadow-xs"
              >
                <span>Review Validation Evidence</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>

          {/* 5-Stage Process Timeline */}
          <div className="mt-6">
            <div className="text-[11px] font-bold uppercase tracking-wider text-slate-400 mb-3">
              Standard 5-Stage Validation Pipeline
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-3">
              <div className="p-3 bg-emerald-50/70 border border-emerald-200 rounded">
                <div className="flex items-center justify-between mb-1">
                  <span className="text-[10px] font-mono font-bold text-emerald-800">01</span>
                  <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                </div>
                <div className="text-xs font-bold text-emerald-950">Dataset Profile</div>
                <div className="text-[11px] text-emerald-700 mt-0.5">Schema &amp; Missingness ✓</div>
              </div>

              <div className="p-3 bg-emerald-50/70 border border-emerald-200 rounded">
                <div className="flex items-center justify-between mb-1">
                  <span className="text-[10px] font-mono font-bold text-emerald-800">02</span>
                  <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                </div>
                <div className="text-xs font-bold text-emerald-950">Cohort Config</div>
                <div className="text-[11px] text-emerald-700 mt-0.5">Extrapolation Checked ✓</div>
              </div>

              <div className="p-3 bg-emerald-50/70 border border-emerald-200 rounded">
                <div className="flex items-center justify-between mb-1">
                  <span className="text-[10px] font-mono font-bold text-emerald-800">03</span>
                  <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                </div>
                <div className="text-xs font-bold text-emerald-950">Synthetic Generation</div>
                <div className="text-[11px] text-emerald-700 mt-0.5">SCM Forward Prop ✓</div>
              </div>

              <div className="p-3 bg-emerald-50/70 border border-emerald-200 rounded">
                <div className="flex items-center justify-between mb-1">
                  <span className="text-[10px] font-mono font-bold text-emerald-800">04</span>
                  <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                </div>
                <div className="text-xs font-bold text-emerald-950">Holdout Validation</div>
                <div className="text-[11px] text-emerald-700 mt-0.5">KS, TSTR &amp; MIA Attack ✓</div>
              </div>

              <div className="p-3 bg-amber-50/70 border border-amber-200 rounded">
                <div className="flex items-center justify-between mb-1">
                  <span className="text-[10px] font-mono font-bold text-amber-800">05</span>
                  <Clock className="w-3.5 h-3.5 text-amber-600" />
                </div>
                <div className="text-xs font-bold text-amber-950">Purpose Approval</div>
                <div className="text-[11px] text-amber-700 mt-0.5">Conditional Review</div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Historical Generation Runs Table */}
      <div>
        <div className="text-xs font-bold uppercase tracking-wider text-slate-400 mb-3">
          Historical Generation Audit Log
        </div>
        <DataTable
          data={runs}
          columns={columns}
          searchKey="runId"
          searchPlaceholder="Search runs by ID or dataset..."
        />
      </div>
    </div>
  );
};
