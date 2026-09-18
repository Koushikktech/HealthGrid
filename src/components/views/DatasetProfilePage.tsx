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
    <div className="space-y-6">
      {/* Top Header */}
      <div className="flex flex-wrap items-center justify-between gap-4 pb-4 border-b border-slate-200">
        <div className="flex items-center gap-3">
          <button
            onClick={onBack}
            className="p-1.5 rounded hover:bg-slate-100 text-slate-500 hover:text-slate-800 transition-colors"
            title="Back to Datasets"
          >
            <ArrowLeft className="w-5 h-5" />
          </button>
          <div>
            <div className="flex items-center gap-2.5">
              <h1 className="text-2xl font-bold tracking-tight text-slate-900">{dataset.name}</h1>
              <StatusBadge status={dataset.status} size="sm" />
            </div>
            <p className="text-xs text-slate-500 mt-0.5">
              {dataset.patientCount.toLocaleString()} patients • {dataset.visitCount.toLocaleString()} visits • {dataset.featureCount} variables
            </p>
          </div>
        </div>

        <button
          onClick={() => onBuildCohort(dataset.id)}
          className="inline-flex items-center gap-1.5 px-3.5 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded text-xs font-semibold transition-colors shadow-xs"
        >
          <Sliders className="w-3.5 h-3.5" />
          <span>Configure Cohort Generator</span>
        </button>
      </div>

      {/* Data Quality Metrics */}
      <div>
        <div className="text-xs font-bold uppercase tracking-wider text-slate-400 mb-3">
          Data Quality Assessment
        </div>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <div className="bg-white p-4 rounded-lg border border-slate-200">
            <div className="text-xs text-slate-500 mb-1">Missing Values</div>
            <div className="text-xl font-bold text-slate-900 tabular-nums">2.4%</div>
            <div className="text-[11px] text-emerald-700 mt-1 flex items-center gap-1">
              <CheckCircle2 className="w-3 h-3" /> Within 5% threshold
            </div>
          </div>

          <div className="bg-white p-4 rounded-lg border border-slate-200">
            <div className="text-xs text-slate-500 mb-1">Duplicate Records</div>
            <div className="text-xl font-bold text-slate-900 tabular-nums">0</div>
            <div className="text-[11px] text-emerald-700 mt-1 flex items-center gap-1">
              <CheckCircle2 className="w-3 h-3" /> Zero exact duplicates
            </div>
          </div>

          <div className="bg-white p-4 rounded-lg border border-slate-200">
            <div className="text-xs text-slate-500 mb-1">Potential Identifiers</div>
            <div className="text-xl font-bold text-slate-900 tabular-nums">1 column</div>
            <div className="text-[11px] text-slate-500 mt-1">
              patient_id (pseudonymized)
            </div>
          </div>

          <div className="bg-white p-4 rounded-lg border border-slate-200">
            <div className="text-xs text-slate-500 mb-1">Date Coverage</div>
            <div className="text-sm font-bold text-slate-900 mt-1">2024-01 to 2025-11</div>
            <div className="text-[11px] text-slate-500 mt-1">22.4 months span</div>
          </div>
        </div>
      </div>

      {/* Tabs: Schema, Distributions, Relationships */}
      <div className="border-b border-slate-200">
        <div className="flex space-x-6 text-xs font-semibold">
          <button
            onClick={() => setActiveTab('schema')}
            className={`pb-3 border-b-2 transition-colors ${
              activeTab === 'schema'
                ? 'border-blue-600 text-blue-800 font-bold'
                : 'border-transparent text-slate-500 hover:text-slate-700'
            }`}
          >
            Schema &amp; Variables ({schema.length})
          </button>
          <button
            onClick={() => setActiveTab('distributions')}
            className={`pb-3 border-b-2 transition-colors ${
              activeTab === 'distributions'
                ? 'border-blue-600 text-blue-800 font-bold'
                : 'border-transparent text-slate-500 hover:text-slate-700'
            }`}
          >
            Observed Distributions
          </button>
          <button
            onClick={() => setActiveTab('relationships')}
            className={`pb-3 border-b-2 transition-colors ${
              activeTab === 'relationships'
                ? 'border-blue-600 text-blue-800 font-bold'
                : 'border-transparent text-slate-500 hover:text-slate-700'
            }`}
          >
            Correlation Heatmap
          </button>
        </div>
      </div>

      {/* Tab Content 1: Schema Table */}
      {activeTab === 'schema' && (
        <div className="bg-white rounded-lg border border-slate-200 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs border-collapse">
              <thead>
                <tr className="bg-slate-50 border-b border-slate-200 text-slate-600 font-semibold uppercase tracking-wider text-[11px]">
                  <th className="py-2.5 px-4">Column</th>
                  <th className="py-2.5 px-4">Type</th>
                  <th className="py-2.5 px-4 text-right">Missing</th>
                  <th className="py-2.5 px-4 text-right">Unique</th>
                  <th className="py-2.5 px-4">Observed Range / Values</th>
                  <th className="py-2.5 px-4">Clinical Description</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {schema.map((col, idx) => (
                  <tr key={idx} className="hover:bg-slate-50/70">
                    <td className="py-2.5 px-4 font-mono font-medium text-slate-900">
                      {col.name}
                      {col.isTarget && (
                        <span className="ml-2 text-[10px] bg-blue-100 text-blue-800 px-1.5 py-0.2 rounded font-sans font-semibold">
                          Endpoint
                        </span>
                      )}
                    </td>
                    <td className="py-2.5 px-4">
                      <span className="text-[11px] px-2 py-0.5 rounded bg-slate-100 text-slate-700 font-mono">
                        {col.type}
                      </span>
                    </td>
                    <td className="py-2.5 px-4 text-right font-mono text-slate-700">{col.missingPct}%</td>
                    <td className="py-2.5 px-4 text-right font-mono text-slate-700">{col.uniqueCount}</td>
                    <td className="py-2.5 px-4 font-mono text-slate-800 text-[11px]">{col.observedRange}</td>
                    <td className="py-2.5 px-4 text-slate-600 text-[11px]">{col.description}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Tab Content 2: Observed Distributions */}
      {activeTab === 'distributions' && (
        <div className="bg-white rounded-lg border border-slate-200 p-5 space-y-4">
          <div className="flex flex-wrap items-center justify-between gap-3 pb-3 border-b border-slate-200">
            <div>
              <h3 className="text-sm font-bold text-slate-900">Empirical Variable Distributions</h3>
              <p className="text-xs text-slate-500">Univariate histograms observed in the baseline sample</p>
            </div>
            <div className="flex items-center gap-1.5">
              {(['age', 'sbp', 'bmi', 'activity', 'adherence'] as const).map((feat) => (
                <button
                  key={feat}
                  onClick={() => setSelectedChartFeature(feat)}
                  className={`px-2.5 py-1 rounded text-xs uppercase font-semibold transition-colors ${
                    selectedChartFeature === feat
                      ? 'bg-blue-600 text-white'
                      : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
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
                  contentStyle={{ backgroundColor: '#ffffff', borderColor: '#cbd5e1', fontSize: '11px', borderRadius: '4px' }}
                />
                <Bar dataKey="realCount" name="Observed Count" fill="#2563eb" radius={[2, 2, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      )}

      {/* Tab Content 3: Correlation Heatmap */}
      {activeTab === 'relationships' && (
        <div className="bg-white rounded-lg border border-slate-200 p-5 space-y-4">
          <div>
            <h3 className="text-sm font-bold text-slate-900">Empirical Pearson Correlation Matrix</h3>
            <p className="text-xs text-slate-500">Pairwise correlation coefficients across continuous variables</p>
          </div>

          <div className="overflow-x-auto">
            <table className="text-xs text-center border-collapse mx-auto">
              <thead>
                <tr>
                  <th className="p-2"></th>
                  {DEMO_CORRELATION_FEATURES.map((feat) => (
                    <th key={feat} className="p-2 font-bold text-slate-700 text-[11px] w-20">
                      {feat}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {DEMO_REAL_CORR_MATRIX.map((row, rowIdx) => (
                  <tr key={rowIdx}>
                    <td className="p-2 font-bold text-slate-700 text-left text-[11px]">
                      {DEMO_CORRELATION_FEATURES[rowIdx]}
                    </td>
                    {row.map((val, colIdx) => {
                      const isSelf = rowIdx === colIdx;
                      let bg = 'bg-slate-50';
                      let text = 'text-slate-700';

                      if (!isSelf) {
                        if (val > 0.3) {
                          bg = 'bg-blue-100';
                          text = 'text-blue-900 font-bold';
                        } else if (val > 0.1) {
                          bg = 'bg-blue-50';
                          text = 'text-blue-800';
                        } else if (val < -0.3) {
                          bg = 'bg-rose-100';
                          text = 'text-rose-900 font-bold';
                        } else if (val < -0.1) {
                          bg = 'bg-rose-50';
                          text = 'text-rose-800';
                        }
                      }

                      return (
                        <td key={colIdx} className={`p-2 font-mono text-[11px] ${bg} ${text} border border-white`}>
                          {val.toFixed(2)}
                        </td>
                      );
                    })}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <div className="text-[11px] text-slate-500 flex items-center justify-center gap-6 pt-2">
            <span className="flex items-center gap-1">
              <span className="w-3 h-3 bg-blue-100 border border-blue-200 inline-block"></span> Positive Association
            </span>
            <span className="flex items-center gap-1">
              <span className="w-3 h-3 bg-rose-100 border border-rose-200 inline-block"></span> Inverse Association
            </span>
          </div>
        </div>
      )}
    </div>
  );
};
