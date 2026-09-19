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
        <span className="font-mono font-bold text-slate-900 dark:text-white">{row.runId}</span>
      ),
    },
    {
      header: 'Dataset',
      accessorKey: 'datasetName',
      sortable: true,
      cell: (row) => <span className="text-slate-900 dark:text-slate-100 font-medium">{row.datasetName}</span>,
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
      header: 'Model Architecture',
      accessorKey: 'model',
      sortable: true,
      cell: (row) => (
        <span className={`text-xs px-2.5 py-0.5 rounded-lg font-medium shrink-0 inline-flex items-center justify-center leading-none ${
          row.model.includes('SCM') || row.model.includes('Causal')
            ? 'bg-blue-50 dark:bg-blue-950/60 text-blue-800 dark:text-blue-300 border border-blue-200 dark:border-blue-800/80'
            : 'bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 border border-slate-200 dark:border-slate-700'
        }`}>
          {row.model}
        </span>
      ),
    },
    {
      header: 'Created',
      accessorKey: 'createdAt',
      sortable: true,
      cell: (row) => <span className="text-slate-600 dark:text-slate-400 font-medium">{row.createdAt}</span>,
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
        <span className="font-mono font-medium text-slate-700 dark:text-slate-300">
          {row.executionTimeSec ? `${row.executionTimeSec}s` : 'Not measured'}
        </span>
      ),
    },
    {
      header: 'Actions',
      align: 'right',
      cell: (row) => (
        <div className="flex items-center justify-end gap-2">
          <button
            onClick={() => onReviewValidation(row.runId)}
            className="px-3 py-1.5 glass-pill hover:bg-white dark:hover:bg-slate-800 text-slate-700 dark:text-slate-200 text-[11px] font-semibold rounded-xl inline-flex items-center justify-center leading-none shrink-0 transition-all shadow-2xs"
          >
            Validation
          </button>
          <button
            onClick={() => onViewPassport(row.runId)}
            className="px-3 py-1.5 bg-blue-50 dark:bg-blue-950/50 hover:bg-blue-100 dark:hover:bg-blue-900/60 border border-blue-200 dark:border-blue-800/80 rounded-xl text-blue-700 dark:text-blue-300 text-[11px] font-semibold inline-flex items-center justify-center leading-none shrink-0 transition-all shadow-2xs"
          >
            Passport
          </button>
        </div>
      ),
    },
  ];

  return (
    <div className="space-y-6 animate-in fade-in duration-300">
      {/* Page Header */}
      <div className="flex flex-wrap items-center justify-between gap-4 pb-5 border-b border-slate-200/80 dark:border-slate-800">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-slate-900 dark:text-white">Generation Runs</h1>
          <p className="text-xs text-slate-600 dark:text-slate-400 mt-1 font-medium">
            Monitor active generation runs, track pipeline milestones, and audit historical cohorts.
          </p>
        </div>
        <button
          onClick={onNewCohort}
          className="inline-flex items-center gap-2 px-4 py-2.5 bg-blue-600 hover:bg-blue-500 text-white rounded-xl text-xs font-semibold transition-all shadow-sm hover:shadow-md hover:-translate-y-0.5 active:translate-y-0"
        >
          <Play className="w-3.5 h-3.5 fill-current" />
          <span>Launch New Generation</span>
        </button>
      </div>

      {/* Active Run Timeline Card */}
      {currentRun && (
        <div className="glass-card rounded-3xl border border-slate-200/80 dark:border-slate-800/80 p-6 space-y-6 shadow-sm">
          <div className="flex flex-wrap items-center justify-between gap-4 pb-4 border-b border-slate-200/80 dark:border-slate-800">
            <div>
              <div className="flex items-center gap-2.5">
                <span className="text-xs font-mono font-bold text-slate-600 dark:text-slate-400">RUN ID: {currentRun.runId}</span>
                <StatusBadge status={currentRun.status} size="sm" />
              </div>
              <h3 className="text-base font-bold text-slate-900 dark:text-white mt-1.5">
                {currentRun.patientCount.toLocaleString()} Patients Synthesized from {currentRun.datasetName}
              </h3>
            </div>
            <div className="flex items-center gap-4">
              <div className="text-right">
                <span className="text-xs text-slate-600 dark:text-slate-400 block font-medium">Duration</span>
                <span className="text-xs font-mono font-bold text-slate-800 dark:text-slate-200">
                  {currentRun.executionTimeSec ? `${currentRun.executionTimeSec}s (CPU)` : 'Not measured'}
                </span>
              </div>
              <button
                onClick={() => onReviewValidation(currentRun.runId)}
                className="px-4 py-2.5 bg-blue-600 hover:bg-blue-500 text-white rounded-xl text-xs font-semibold flex items-center gap-2 transition-all shadow-sm hover:shadow-md hover:-translate-y-0.5 active:translate-y-0"
              >
                <span>Review Validation Evidence</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>

          {/* Live Progress Bar if Active */}
          {(currentRun.status === 'Generating' || currentRun.status === 'Queued' || (currentRun.progress !== undefined && currentRun.progress < 100 && currentRun.status !== 'Failed')) && (
            <div className="p-4 rounded-2xl bg-blue-500/10 border border-blue-500/20 space-y-2.5">
              <div className="flex items-center justify-between text-xs">
                <span className="font-semibold text-blue-900 dark:text-blue-300 flex items-center gap-2">
                  <span className="w-2 h-2 rounded-full bg-blue-500 animate-pulse"></span>
                  Stage: <span className="font-mono uppercase">{currentRun.stage || 'PROCESSING'}</span>
                </span>
                <span className="font-mono font-bold text-blue-700 dark:text-blue-300">{currentRun.progress ?? 25}%</span>
              </div>
              <div className="w-full bg-blue-200/50 dark:bg-blue-950/60 rounded-full h-2 overflow-hidden">
                <div
                  className="bg-blue-600 dark:bg-blue-500 h-2 rounded-full transition-all duration-300 ease-out"
                  style={{ width: `${Math.max(5, currentRun.progress ?? 25)}%` }}
                ></div>
              </div>
              <p className="text-[11px] text-blue-800 dark:text-blue-300/80 italic">
                {currentRun.message || 'Executing physiological DAG mechanism fitting and longitudinal patient synthesis...'}
              </p>
            </div>
          )}

          {/* 5-Stage Process Timeline */}
          <div>
            <div className="text-[11px] font-bold uppercase tracking-wider text-slate-600 dark:text-slate-400 mb-3.5 flex items-center justify-between">
              <span>Standard 5-Stage Validation Pipeline</span>
              {currentRun.stageTimings && Object.keys(currentRun.stageTimings).length > 0 && (
                <span className="text-[10px] font-mono text-slate-600 dark:text-slate-400 font-medium">
                  Fitted: {currentRun.stageTimings.fitting ? `${currentRun.stageTimings.fitting}s` : '—'} |
                  Gen: {currentRun.stageTimings.generating ? `${currentRun.stageTimings.generating}s` : '—'} |
                  Val: {currentRun.stageTimings.validating ? `${currentRun.stageTimings.validating}s` : '—'}
                </span>
              )}
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-3.5">
              <div className={`p-4 rounded-2xl border transition-all ${
                currentRun.progress !== undefined && currentRun.progress >= 8
                  ? 'bg-emerald-500/10 border-emerald-500/30'
                  : 'glass-card border-slate-200/80 dark:border-slate-800/80'
              }`}>
                <div className="flex items-center justify-between mb-1.5">
                  <span className="text-[10px] font-mono font-bold text-emerald-700 dark:text-emerald-400">01</span>
                  <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400" />
                </div>
                <div className="text-xs font-bold text-slate-900 dark:text-white">Dataset Profile</div>
                <div className="text-[11px] text-slate-600 dark:text-slate-400 mt-0.5 font-medium">Schema &amp; Missingness ✓</div>
              </div>

              <div className={`p-4 rounded-2xl border transition-all ${
                currentRun.progress !== undefined && currentRun.progress >= 15
                  ? 'bg-emerald-500/10 border-emerald-500/30'
                  : 'glass-card border-slate-200/80 dark:border-slate-800/80'
              }`}>
                <div className="flex items-center justify-between mb-1.5">
                  <span className="text-[10px] font-mono font-bold text-emerald-700 dark:text-emerald-400">02</span>
                  <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400" />
                </div>
                <div className="text-xs font-bold text-slate-900 dark:text-white">Cohort Config</div>
                <div className="text-[11px] text-slate-600 dark:text-slate-400 mt-0.5 font-medium">Extrapolation Checked ✓</div>
              </div>

              <div className={`p-4 rounded-2xl border transition-all ${
                currentRun.progress !== undefined && currentRun.progress >= 38
                  ? 'bg-emerald-500/10 border-emerald-500/30'
                  : currentRun.stage === 'generating'
                  ? 'bg-blue-500/10 border-blue-500/30'
                  : 'glass-card border-slate-200/80 dark:border-slate-800/80'
              }`}>
                <div className="flex items-center justify-between mb-1.5">
                  <span className="text-[10px] font-mono font-bold text-blue-700 dark:text-blue-400">03</span>
                  {currentRun.progress !== undefined && currentRun.progress >= 38 ? (
                    <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400" />
                  ) : (
                    <Clock className="w-3.5 h-3.5 text-blue-600 dark:text-blue-400 animate-spin" />
                  )}
                </div>
                <div className="text-xs font-bold text-slate-900 dark:text-white">Synthetic Generation</div>
                <div className="text-[11px] text-slate-600 dark:text-slate-400 mt-0.5 font-medium">SCM Forward Prop &amp; Quarantining</div>
              </div>

              <div className={`p-4 rounded-2xl border transition-all ${
                currentRun.progress !== undefined && currentRun.progress >= 85
                  ? 'bg-emerald-500/10 border-emerald-500/30'
                  : currentRun.stage === 'validating' || currentRun.stage === 'baseline'
                  ? 'bg-blue-500/10 border-blue-500/30'
                  : 'glass-card border-slate-200/80 dark:border-slate-800/80'
              }`}>
                <div className="flex items-center justify-between mb-1.5">
                  <span className="text-[10px] font-mono font-bold text-purple-700 dark:text-purple-400">04</span>
                  {currentRun.progress !== undefined && currentRun.progress >= 85 ? (
                    <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400" />
                  ) : (
                    <Clock className="w-3.5 h-3.5 text-slate-400" />
                  )}
                </div>
                <div className="text-xs font-bold text-slate-900 dark:text-white">Holdout Validation</div>
                <div className="text-[11px] text-slate-600 dark:text-slate-400 mt-0.5 font-medium">KS, C2ST, TSTR &amp; MIA Attack</div>
              </div>

              <div className={`p-4 rounded-2xl border transition-all ${
                currentRun.status === 'Validated'
                  ? 'bg-emerald-500/10 border-emerald-500/30'
                  : 'bg-amber-500/10 border-amber-500/30'
              }`}>
                <div className="flex items-center justify-between mb-1.5">
                  <span className="text-[10px] font-mono font-bold text-amber-700 dark:text-amber-400">05</span>
                  {currentRun.status === 'Validated' ? (
                    <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400" />
                  ) : (
                    <Clock className="w-3.5 h-3.5 text-amber-600 dark:text-amber-400" />
                  )}
                </div>
                <div className="text-xs font-bold text-amber-900 dark:text-amber-300">Purpose Approval</div>
                <div className="text-[11px] text-amber-800 dark:text-amber-400 mt-0.5 font-medium">
                  {currentRun.status === 'Validated' ? 'Certified Passport Ready' : 'Review in Progress'}
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Historical Generation Runs Table */}
      <div>
        <div className="text-[11px] font-bold uppercase tracking-wider text-slate-600 dark:text-slate-400 mb-3">
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
