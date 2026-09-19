import React, { useState } from 'react';
import { DatasetSummary, ColumnSchema } from '../../types';
import { StatusBadge } from '../common/StatusBadge';
import {
  FileText,
  AlertCircle,
  Database,
  Calendar,
  Layers,
  ShieldCheck,
  CheckCircle2,
  Sliders,
  ArrowLeft
} from 'lucide-react';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  CartesianGrid
} from 'recharts';
import {
  DEMO_AGE_DISTRIBUTION,
  DEMO_SBP_DISTRIBUTION,
  DEMO_BMI_DISTRIBUTION,
  DEMO_ACTIVITY_DISTRIBUTION,
  DEMO_ADHERENCE_DISTRIBUTION
} from '../../data/fixtures/demoDataset';
import { DEMO_CORRELATION_FEATURES, DEMO_REAL_CORR_MATRIX } from '../../data/fixtures/demoCorrelations';

interface DatasetProfilePageProps {
  dataset: DatasetSummary;
  schema: ColumnSchema[];
  onBack: () => void;
  onBuildCohort: (datasetId: string) => void;
}

export const DatasetProfilePage: React.FC<DatasetProfilePageProps> = ({
  dataset,
  schema,
  onBack,
  onBuildCohort,
}) => {
  const [activeTab, setActiveTab] = useState<'schema' | 'distributions' | 'relationships'>('schema');
  const [selectedChartFeature, setSelectedChartFeature] = useState<'age' | 'sbp' | 'bmi' | 'activity' | 'adherence'>('age');

  const getChartData = () => {
    switch (selectedChartFeature) {
      case 'age':
        return DEMO_AGE_DISTRIBUTION;
      case 'sbp':
        return DEMO_SBP_DISTRIBUTION;
      case 'bmi':
        return DEMO_BMI_DISTRIBUTION;
      case 'activity':
        return DEMO_ACTIVITY_DISTRIBUTION;
      case 'adherence':
        return DEMO_ADHERENCE_DISTRIBUTION;
    }
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-300">
      {/* Top Header */}
      <div className="flex flex-wrap items-center justify-between gap-4 pb-5 border-b border-slate-200/80 dark:border-slate-800">
        <div className="flex items-center gap-3">
          <button
            onClick={onBack}
            className="p-2 rounded-xl glass-pill hover:bg-white/80 dark:hover:bg-slate-800 text-slate-600 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white transition-all shadow-xs"
            title="Back to Datasets"
          >
            <ArrowLeft className="w-4 h-4" />
          </button>
          <div>
            <div className="flex items-center gap-2.5">
              <h1 className="text-2xl font-bold tracking-tight text-slate-900 dark:text-white">{dataset.name}</h1>
              <StatusBadge status={dataset.status} size="sm" />
            </div>
            <p className="text-xs text-slate-600 dark:text-slate-400 mt-0.5 font-medium">
              {dataset.patientCount.toLocaleString()} patients • {dataset.visitCount.toLocaleString()} visits • {dataset.featureCount} variables
            </p>
          </div>
        </div>

        <button
          onClick={() => onBuildCohort(dataset.id)}
          className="inline-flex items-center gap-2 px-4 py-2.5 bg-blue-600 hover:bg-blue-500 text-white rounded-xl text-xs font-semibold transition-all shadow-sm hover:shadow-md hover:-translate-y-0.5 active:translate-y-0"
        >
          <Sliders className="w-3.5 h-3.5" />
          <span>Configure Cohort Generator</span>
        </button>
      </div>

      {/* Data Quality Metrics */}
      <div>
        <div className="text-[11px] font-bold uppercase tracking-wider text-slate-600 dark:text-slate-400 mb-3">
          Data Quality Assessment
        </div>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <div className="glass-card p-4 rounded-2xl border border-slate-200/80 dark:border-slate-800/80 shadow-xs hover:shadow-md transition-all">
            <div className="text-xs font-medium text-slate-600 dark:text-slate-400 mb-1">Missing Values</div>
            <div className="text-2xl font-bold tracking-tight text-slate-900 dark:text-white tabular-nums">2.4%</div>
            <div className="text-[11px] text-emerald-600 dark:text-emerald-400 font-semibold mt-1 flex items-center gap-1.5">
              <CheckCircle2 className="w-3.5 h-3.5" /> Within 5% threshold
            </div>
          </div>

          <div className="glass-card p-4 rounded-2xl border border-slate-200/80 dark:border-slate-800/80 shadow-xs hover:shadow-md transition-all">
            <div className="text-xs font-medium text-slate-600 dark:text-slate-400 mb-1">Duplicate Records</div>
            <div className="text-2xl font-bold tracking-tight text-slate-900 dark:text-white tabular-nums">0</div>
            <div className="text-[11px] text-emerald-600 dark:text-emerald-400 font-semibold mt-1 flex items-center gap-1.5">
              <CheckCircle2 className="w-3.5 h-3.5" /> Zero exact duplicates
            </div>
          </div>

          <div className="glass-card p-4 rounded-2xl border border-slate-200/80 dark:border-slate-800/80 shadow-xs hover:shadow-md transition-all">
            <div className="text-xs font-medium text-slate-600 dark:text-slate-400 mb-1">Potential Identifiers</div>
            <div className="text-2xl font-bold tracking-tight text-slate-900 dark:text-white tabular-nums">1 col</div>
            <div className="text-[11px] text-slate-600 dark:text-slate-400 mt-1 truncate font-medium">
              patient_id (pseudonymized)
            </div>
          </div>

          <div className="glass-card p-4 rounded-2xl border border-slate-200/80 dark:border-slate-800/80 shadow-xs hover:shadow-md transition-all">
            <div className="text-xs font-medium text-slate-600 dark:text-slate-400 mb-1">Date Coverage</div>
            <div className="text-sm font-bold text-slate-900 dark:text-white mt-1">2024-01 to 2025-11</div>
            <div className="text-[11px] text-slate-600 dark:text-slate-400 mt-1 font-medium">22.4 months span</div>
          </div>
        </div>
      </div>

      {/* Tabs: Apple Segmented Pill */}
      <div className="flex items-center">
        <div className="glass-panel p-1 rounded-full inline-flex gap-1 border border-slate-200/80 dark:border-slate-700/70 shadow-xs">
          <button
            onClick={() => setActiveTab('schema')}
            className={`px-4 py-1.5 rounded-full text-xs font-semibold inline-flex items-center justify-center leading-none shrink-0 transition-all ${
              activeTab === 'schema'
                ? 'bg-blue-600 text-white shadow-xs'
                : 'text-slate-600 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white hover:bg-slate-100/50'
            }`}
          >
            Schema &amp; Variables ({schema.length})
          </button>
          <button
            onClick={() => setActiveTab('distributions')}
            className={`px-4 py-1.5 rounded-full text-xs font-semibold inline-flex items-center justify-center leading-none shrink-0 transition-all ${
              activeTab === 'distributions'
                ? 'bg-blue-600 text-white shadow-xs'
                : 'text-slate-600 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white hover:bg-slate-100/50'
            }`}
          >
            Observed Distributions
          </button>
          <button
            onClick={() => setActiveTab('relationships')}
            className={`px-4 py-1.5 rounded-full text-xs font-semibold inline-flex items-center justify-center leading-none shrink-0 transition-all ${
              activeTab === 'relationships'
                ? 'bg-blue-600 text-white shadow-xs'
                : 'text-slate-600 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white hover:bg-slate-100/50'
            }`}
          >
            Correlation Heatmap
          </button>
        </div>
      </div>

      {/* Tab Content 1: Schema Table */}
      {activeTab === 'schema' && (
        <div className="glass-card rounded-3xl border border-slate-200/80 dark:border-slate-800/80 overflow-hidden shadow-sm">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs border-collapse">
              <thead>
                <tr className="bg-slate-50/70 dark:bg-slate-800/60 border-b border-slate-200/80 dark:border-slate-800 text-slate-600 dark:text-slate-400 font-bold uppercase tracking-wider text-[11px]">
                  <th className="py-3.5 px-5">Column</th>
                  <th className="py-3.5 px-4">Type</th>
                  <th className="py-3.5 px-4 text-right">Missing</th>
                  <th className="py-3.5 px-4 text-right">Unique</th>
                  <th className="py-3.5 px-4">Observed Range / Values</th>
                  <th className="py-3.5 px-5">Clinical Description</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-slate-800/60">
                {schema.map((col, idx) => (
                  <tr key={idx} className="hover:bg-slate-50/50 dark:hover:bg-slate-800/30 transition-colors">
                    <td className="py-3.5 px-5 font-mono font-semibold text-slate-900 dark:text-white">
                      {col.name}
                      {col.isTarget && (
                        <span className="ml-2 text-[10px] bg-blue-100 dark:bg-blue-900/40 text-blue-700 dark:text-blue-300 px-2 py-0.5 rounded-full font-sans font-semibold shrink-0 inline-flex items-center justify-center leading-none">
                          Endpoint
                        </span>
                      )}
                    </td>
                    <td className="py-3.5 px-4">
                      <span className="text-[11px] px-2.5 py-1 rounded-md bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 font-mono font-medium shrink-0 inline-flex items-center justify-center leading-none">
                        {col.type}
                      </span>
                    </td>
                    <td className="py-3.5 px-4 text-right font-mono text-slate-700 dark:text-slate-300 font-medium">{col.missingPct}%</td>
                    <td className="py-3.5 px-4 text-right font-mono text-slate-700 dark:text-slate-300 font-medium">{col.uniqueCount}</td>
                    <td className="py-3.5 px-4 font-mono text-slate-800 dark:text-slate-200 text-[11px] font-medium">{col.observedRange}</td>
                    <td className="py-3.5 px-5 text-slate-600 dark:text-slate-400 text-[11px] font-normal">{col.description}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Tab Content 2: Observed Distributions */}
      {activeTab === 'distributions' && (
        <div className="glass-card rounded-3xl border border-slate-200/80 dark:border-slate-800/80 p-6 space-y-5 shadow-sm">
          <div className="flex flex-wrap items-center justify-between gap-3 pb-4 border-b border-slate-200/80 dark:border-slate-800">
            <div>
              <h3 className="text-sm font-bold text-slate-900 dark:text-white">Empirical Variable Distributions</h3>
              <p className="text-xs text-slate-600 dark:text-slate-400 mt-0.5 font-medium">Univariate histograms observed in the baseline sample</p>
            </div>
            <div className="glass-panel p-1 rounded-full inline-flex gap-1 border border-slate-200/80 dark:border-slate-700/70 shadow-xs">
              {(['age', 'sbp', 'bmi', 'activity', 'adherence'] as const).map((feat) => (
                <button
                  key={feat}
                  onClick={() => setSelectedChartFeature(feat)}
                  className={`px-3 py-1 rounded-full text-xs uppercase font-semibold inline-flex items-center justify-center leading-none shrink-0 transition-all ${
                    selectedChartFeature === feat
                      ? 'bg-blue-600 text-white shadow-xs'
                      : 'text-slate-600 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white hover:bg-slate-100/50'
                  }`}
                >
                  {feat}
                </button>
              ))}
            </div>
          </div>

          <div className="h-72 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={getChartData()} margin={{ top: 10, right: 10, left: -10, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                <XAxis dataKey="bucket" tick={{ fontSize: 11, fill: '#64748b' }} axisLine={{ stroke: '#cbd5e1' }} />
                <YAxis tick={{ fontSize: 11, fill: '#64748b' }} axisLine={{ stroke: '#cbd5e1' }} />
                <Tooltip
                  contentStyle={{ backgroundColor: '#ffffff', borderColor: '#cbd5e1', fontSize: '11px', borderRadius: '8px' }}
                />
                <Bar dataKey="realCount" name="Observed Count" fill="#2563eb" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      )}

      {/* Tab Content 3: Correlation Heatmap */}
      {activeTab === 'relationships' && (
        <div className="glass-card rounded-3xl border border-slate-200/80 dark:border-slate-800/80 p-6 space-y-5 shadow-sm">
          <div>
            <h3 className="text-sm font-bold text-slate-900 dark:text-white">Empirical Pearson Correlation Matrix</h3>
            <p className="text-xs text-slate-600 dark:text-slate-400 mt-0.5 font-medium">Pairwise correlation coefficients across continuous variables</p>
          </div>

          <div className="overflow-x-auto">
            <table className="text-xs text-center border-collapse mx-auto">
              <thead>
                <tr>
                  <th className="p-2"></th>
                  {DEMO_CORRELATION_FEATURES.map((feat) => (
                    <th key={feat} className="p-2 font-bold text-slate-700 dark:text-slate-300 text-[11px] w-20">
                      {feat}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {DEMO_REAL_CORR_MATRIX.map((row, rowIdx) => (
                  <tr key={rowIdx}>
                    <td className="p-2 font-bold text-slate-700 dark:text-slate-300 text-left text-[11px]">
                      {DEMO_CORRELATION_FEATURES[rowIdx]}
                    </td>
                    {row.map((val, colIdx) => {
                      const isSelf = rowIdx === colIdx;
                      let bg = 'bg-slate-50 dark:bg-slate-800/50';
                      let text = 'text-slate-700 dark:text-slate-300';

                      if (!isSelf) {
                        if (val > 0.3) {
                          bg = 'bg-blue-100 dark:bg-blue-900/50';
                          text = 'text-blue-900 dark:text-blue-200 font-bold';
                        } else if (val > 0.1) {
                          bg = 'bg-blue-50 dark:bg-blue-950/40';
                          text = 'text-blue-800 dark:text-blue-300';
                        } else if (val < -0.3) {
                          bg = 'bg-rose-100 dark:bg-rose-900/50';
                          text = 'text-rose-900 dark:text-rose-200 font-bold';
                        } else if (val < -0.1) {
                          bg = 'bg-rose-50 dark:bg-rose-950/40';
                          text = 'text-rose-800 dark:text-rose-300';
                        }
                      }

                      return (
                        <td key={colIdx} className={`p-2.5 font-mono text-[11px] rounded-sm ${bg} ${text} border border-white/50 dark:border-slate-800`}>
                          {val.toFixed(2)}
                        </td>
                      );
                    })}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <div className="text-[11px] text-slate-600 dark:text-slate-400 flex items-center justify-center gap-6 pt-2 font-medium">
            <span className="flex items-center gap-1.5">
              <span className="w-3 h-3 bg-blue-100 dark:bg-blue-900 border border-blue-200 dark:border-blue-700 rounded-sm inline-block"></span> Positive Association
            </span>
            <span className="flex items-center gap-1.5">
              <span className="w-3 h-3 bg-rose-100 dark:bg-rose-900 border border-rose-200 dark:border-rose-700 rounded-sm inline-block"></span> Inverse Association
            </span>
          </div>
        </div>
      )}
    </div>
  );
};
