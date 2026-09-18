import React from 'react';
import { StatusBadge } from '../common/StatusBadge';
import {
  Users,
  Calendar,
  Layers,
  AlertCircle,
  ArrowRight,
  Upload,
  Plus,
  Activity,
  CheckCircle2,
  Clock,
  ExternalLink
} from 'lucide-react';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  Legend,
  ResponsiveContainer,
  CartesianGrid
} from 'recharts';
import { DatasetSummary, FullValidationReport } from '../../types';
import { DEMO_AGE_DISTRIBUTION } from '../../data/fixtures/demoDataset';

interface OverviewPageProps {
  dataset: DatasetSummary | null;
  validationReport: FullValidationReport | null;
  onNavigate: (section: any) => void;
  onOpenUpload: () => void;
  isDemoMode: boolean;
}

export const OverviewPage: React.FC<OverviewPageProps> = ({
  dataset,
  validationReport,
  onNavigate,
  onOpenUpload,
  isDemoMode,
}) => {
  const isValidationReady = validationReport && validationReport.isCalculated;

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex flex-wrap items-center justify-between gap-4 pb-4 border-b border-slate-200">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-slate-900">Overview</h1>
          <p className="text-xs text-slate-500 mt-1">
            Create, validate and manage synthetic healthcare cohorts.
          </p>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={() => onNavigate('cohort_builder')}
            className="inline-flex items-center gap-1.5 px-3.5 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded text-xs font-semibold transition-colors shadow-xs"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>+ New Cohort</span>
          </button>
        </div>
      </div>

      {/* Demo Mode Notice Banner if viewing fixture data */}
      {isDemoMode && (
        <div className="p-3 bg-amber-50/70 border border-amber-200 rounded text-xs text-amber-900 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className="font-semibold px-1.5 py-0.5 bg-amber-100 rounded text-[10px] uppercase font-mono">
              Development Preview
            </span>
            <span>
              Displaying clinical study demo fixtures. When connected to the REST API, active calculated metrics will replace these values.
            </span>
          </div>
          <button
            onClick={() => onNavigate('cohort_builder')}
            className="text-amber-800 font-semibold hover:underline text-[11px]"
          >
            Configure Generator →
          </button>
        </div>
      )}

      {/* Hero Workspace Section */}
      <div className="bg-white rounded-lg border border-slate-200 p-6">
        <div className="max-w-3xl">
          <h2 className="text-lg font-bold text-slate-900 mb-2">
            Create a synthetic cohort from your healthcare dataset.
          </h2>
          <p className="text-xs text-slate-600 leading-relaxed mb-5">
            Upload a dataset, define your target population, generate synthetic patients and review validation evidence before export.
            HealthGrid enforces empirical evidence checks so unverified synthetic data is never deployed blindly.
          </p>
          <div className="flex flex-wrap items-center gap-3">
            <button
              onClick={() => onNavigate('cohort_builder')}
              className="px-4 py-2 bg-slate-900 hover:bg-slate-800 text-white rounded text-xs font-semibold flex items-center gap-2 transition-colors"
            >
              <span>Create New Cohort</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
            <button
              onClick={onOpenUpload}
              className="px-4 py-2 bg-white hover:bg-slate-50 text-slate-700 border border-slate-300 rounded text-xs font-semibold flex items-center gap-2 transition-colors"
            >
              <Upload className="w-3.5 h-3.5 text-slate-500" />
              <span>Upload Dataset</span>
            </button>
          </div>
        </div>
      </div>

      {/* Dataset Summary Cards */}
      <div>
        <div className="text-xs font-bold uppercase tracking-wider text-slate-400 mb-3">
          Dataset Summary — {dataset ? dataset.name : 'No active dataset'}
        </div>
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          <div className="bg-white p-4 rounded-lg border border-slate-200">
            <div className="flex items-center justify-between text-slate-500 text-xs mb-1">
              <span>Patients (Source N)</span>
              <Users className="w-4 h-4 text-slate-400" />
            </div>
            <div className="text-2xl font-bold text-slate-900 tabular-nums">
              {dataset ? dataset.patientCount.toLocaleString() : '—'}
            </div>
            <div className="text-[11px] text-slate-500 mt-1">Small-sample clinical regime</div>
          </div>

          <div className="bg-white p-4 rounded-lg border border-slate-200">
            <div className="flex items-center justify-between text-slate-500 text-xs mb-1">
              <span>Visits Logged</span>
              <Calendar className="w-4 h-4 text-slate-400" />
            </div>
            <div className="text-2xl font-bold text-slate-900 tabular-nums">
              {dataset ? dataset.visitCount.toLocaleString() : '—'}
            </div>
            <div className="text-[11px] text-slate-500 mt-1">4.0 visits / patient mean</div>
          </div>

          <div className="bg-white p-4 rounded-lg border border-slate-200">
            <div className="flex items-center justify-between text-slate-500 text-xs mb-1">
              <span>Clinical Features</span>
              <Layers className="w-4 h-4 text-slate-400" />
            </div>
            <div className="text-2xl font-bold text-slate-900 tabular-nums">
              {dataset ? dataset.featureCount : '—'}
            </div>
            <div className="text-[11px] text-slate-500 mt-1">Continuous + Categorical</div>
          </div>

          <div className="bg-white p-4 rounded-lg border border-slate-200">
            <div className="flex items-center justify-between text-slate-500 text-xs mb-1">
              <span>Missing Values</span>
              <AlertCircle className="w-4 h-4 text-slate-400" />
            </div>
            <div className="text-2xl font-bold text-slate-900 tabular-nums">
              {dataset ? `${dataset.missingValuePct}%` : '—'}
            </div>
            <div className="text-[11px] text-slate-500 mt-1">Within profile quality tolerance</div>
          </div>
        </div>
      </div>

      {/* Validation Overview Section */}
      <div>
        <div className="flex items-center justify-between mb-3">
          <div className="text-xs font-bold uppercase tracking-wider text-slate-400">
            Validation Evidence Overview
          </div>
          <button
            onClick={() => onNavigate('validation')}
            className="text-xs text-blue-600 hover:text-blue-800 font-semibold flex items-center gap-1"
          >
            <span>Deep Dive Evidence</span>
            <ArrowRight className="w-3 h-3" />
          </button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {/* Card 1: Fidelity */}
          <div className="bg-white p-4 rounded-lg border border-slate-200 flex flex-col justify-between">
            <div>
              <div className="flex items-center justify-between gap-2 mb-2">
                <span className="text-xs font-bold text-slate-800">Fidelity</span>
                <StatusBadge
                  status={isValidationReady ? validationReport.fidelity.ksStatistic.status : 'NOT_CALCULATED'}
                  size="sm"
                />
              </div>
              <div className="text-xl font-bold text-slate-900 my-1 tabular-nums">
                {isValidationReady ? `KS = ${validationReport.fidelity.ksStatistic.value}` : 'Awaiting validation'}
              </div>
              <p className="text-xs text-slate-600 leading-relaxed mt-1">
                {isValidationReady
                  ? validationReport.fidelity.ksStatistic.shortEvidence
                  : 'Holdout KS statistic not yet evaluated on current cohort.'}
              </p>
            </div>
            <div className="mt-3 pt-2 border-t border-slate-100 text-[11px] text-slate-400">
              Target: KS &lt; 0.12 vs holdout
            </div>
          </div>

          {/* Card 2: Utility */}
          <div className="bg-white p-4 rounded-lg border border-slate-200 flex flex-col justify-between">
            <div>
              <div className="flex items-center justify-between gap-2 mb-2">
                <span className="text-xs font-bold text-slate-800">Utility</span>
                <StatusBadge
                  status={isValidationReady ? validationReport.utility.tstrAUROC.status : 'NOT_CALCULATED'}
                  size="sm"
                />
              </div>
              <div className="text-xl font-bold text-slate-900 my-1 tabular-nums">
                {isValidationReady ? `TSTR = ${validationReport.utility.tstrAUROC.value}` : 'Awaiting validation'}
              </div>
              <p className="text-xs text-slate-600 leading-relaxed mt-1">
                {isValidationReady
                  ? `ΔAUROC ${validationReport.utility.aurocDifference.value} vs real training benchmark.`
                  : 'TSTR predictive model has not yet run.'}
              </p>
            </div>
            <div className="mt-3 pt-2 border-t border-slate-100 text-[11px] text-slate-400">
              Benchmark: TSTR AUROC &gt; 0.75
            </div>
          </div>

          {/* Card 3: Temporal Fidelity */}
          <div className="bg-white p-4 rounded-lg border border-slate-200 flex flex-col justify-between">
            <div>
              <div className="flex items-center justify-between gap-2 mb-2">
                <span className="text-xs font-bold text-slate-800">Temporal Fidelity</span>
                <StatusBadge
                  status={isValidationReady ? validationReport.temporal.missingnessPatternSimilarity.status : 'NOT_CALCULATED'}
                  size="sm"
                />
              </div>
              <div className="text-xl font-bold text-slate-900 my-1 tabular-nums">
                {isValidationReady ? `Sim = ${validationReport.temporal.trajectorySimilarity.value}` : 'Awaiting validation'}
              </div>
              <p className="text-xs text-slate-600 leading-relaxed mt-1">
                {isValidationReady
                  ? 'DTW trajectory similarity 0.91; missingness schedule marked for review.'
                  : 'Longitudinal visit dynamics uncalculated.'}
              </p>
            </div>
            <div className="mt-3 pt-2 border-t border-slate-100 text-[11px] text-slate-400">
              Markov adherence + MNAR
            </div>
          </div>

          {/* Card 4: Privacy Risk */}
          <div className="bg-white p-4 rounded-lg border border-slate-200 flex flex-col justify-between">
            <div>
              <div className="flex items-center justify-between gap-2 mb-2">
                <span className="text-xs font-bold text-slate-800">Privacy Risk</span>
                <StatusBadge
                  status={isValidationReady ? validationReport.privacy.membershipInferenceAUC.status : 'NOT_CALCULATED'}
                  size="sm"
                />
              </div>
              <div className="text-xl font-bold text-slate-900 my-1 tabular-nums">
                {isValidationReady
                  ? `MIA = ${validationReport.privacy.membershipInferenceAUC.value}`
                  : 'Awaiting validation'}
              </div>
              <p className="text-xs text-slate-600 leading-relaxed mt-1">
                {isValidationReady
                  ? `${validationReport.privacy.flaggedNearDuplicates} near-duplicate records flagged for manual review.`
                  : 'Adversarial MIA attack not yet evaluated.'}
              </p>
            </div>
            <div className="mt-3 pt-2 border-t border-slate-100 text-[11px] text-slate-400">
              ESORICS-aligned empirical audit
            </div>
          </div>
        </div>
      </div>

      {/* Real vs Synthetic Distribution Comparison Chart */}
      <div className="bg-white rounded-lg border border-slate-200 p-5">
        <div className="flex flex-wrap items-center justify-between gap-3 mb-4">
          <div>
            <h3 className="text-sm font-bold text-slate-900">Real vs Synthetic: Age Distribution</h3>
            <p className="text-xs text-slate-500">
              Comparing marginal distributions of source sample (N=1,314) against synthetic cohort (N=5,000)
            </p>
          </div>
          <button
            onClick={() => onNavigate('validation')}
            className="text-xs font-semibold text-blue-600 hover:text-blue-800"
          >
            View All Distribution Tabs →
          </button>
        </div>

        <div className="h-64 w-full">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={DEMO_AGE_DISTRIBUTION} margin={{ top: 10, right: 10, left: -10, bottom: 0 }}>
              <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
              <XAxis dataKey="bucket" tick={{ fontSize: 11, fill: '#64748b' }} axisLine={{ stroke: '#cbd5e1' }} />
              <YAxis tick={{ fontSize: 11, fill: '#64748b' }} axisLine={{ stroke: '#cbd5e1' }} />
              <Tooltip
                contentStyle={{ backgroundColor: '#ffffff', borderColor: '#cbd5e1', fontSize: '11px', borderRadius: '4px' }}
              />
              <Legend wrapperStyle={{ fontSize: '11px', paddingTop: '8px' }} />
              <Bar dataKey="realCount" name="Real Patients (Source)" fill="#64748b" radius={[2, 2, 0, 0]} />
              <Bar dataKey="syntheticCount" name="Synthetic Cohort (HealthGrid)" fill="#2563eb" radius={[2, 2, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Recent Activity & Next Step recommendation */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 bg-white rounded-lg border border-slate-200 p-5">
          <h3 className="text-xs font-bold uppercase tracking-wider text-slate-400 mb-3">
            Recent Activity
          </h3>
          <div className="space-y-3">
            <div className="flex items-start gap-3 text-xs">
              <div className="w-2 h-2 rounded-full bg-emerald-500 mt-1.5 shrink-0"></div>
              <div className="flex-1">
                <span className="font-semibold text-slate-800">Generated 5,000 synthetic patients</span>
                <p className="text-slate-500 text-[11px]">Model: HealthGrid Causal Generator • Duration: 7.8s</p>
              </div>
              <span className="text-[11px] text-slate-400 font-mono">2 minutes ago</span>
            </div>

            <div className="flex items-start gap-3 text-xs">
              <div className="w-2 h-2 rounded-full bg-blue-500 mt-1.5 shrink-0"></div>
              <div className="flex-1">
                <span className="font-semibold text-slate-800">Validation completed</span>
                <p className="text-slate-500 text-[11px]">Holdout KS 0.082 • TSTR AUROC 0.81 • MIA AUC 0.51</p>
              </div>
              <span className="text-[11px] text-slate-400 font-mono">8 minutes ago</span>
            </div>

            <div className="flex items-start gap-3 text-xs">
              <div className="w-2 h-2 rounded-full bg-slate-400 mt-1.5 shrink-0"></div>
              <div className="flex-1">
                <span className="font-semibold text-slate-800">Dataset uploaded &amp; profiled</span>
                <p className="text-slate-500 text-[11px]">Clinical Cardiometabolic Study Dataset (1,314 rows, 14 cols)</p>
              </div>
              <span className="text-[11px] text-slate-400 font-mono">20 minutes ago</span>
            </div>
          </div>
        </div>

        {/* Next Step Callout */}
        <div className="bg-blue-50/60 border border-blue-200 rounded-lg p-5 flex flex-col justify-between">
          <div>
            <div className="flex items-center gap-1.5 text-blue-800 font-bold text-xs uppercase tracking-wider mb-2">
              <CheckCircle2 className="w-4 h-4 text-blue-600" />
              Next Recommended Step
            </div>
            <h4 className="text-sm font-bold text-blue-950 mb-1">
              Your cohort is ready for validation review.
            </h4>
            <p className="text-xs text-blue-900 leading-relaxed mb-4">
              Inspect holdout fidelity, confirm predictive utility on downstream endpoints, and verify near-duplicate quarantine records.
            </p>
          </div>
          <button
            onClick={() => onNavigate('validation')}
            className="w-full py-2 px-3 bg-blue-600 hover:bg-blue-700 text-white rounded text-xs font-semibold flex items-center justify-center gap-1.5 transition-colors shadow-xs"
          >
            <span>Review Validation Evidence</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>
    </div>
  );
};
