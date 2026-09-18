import React, { useState } from 'react';
import { FullValidationReport, DistributionBin } from '../../types';
import { StatusBadge } from '../common/StatusBadge';
import { MetricCard } from '../common/MetricCard';
import { ExtrapolationMeter } from '../common/ExtrapolationMeter';
import { validationService } from '../../services/api/validationService';
import {
  CheckCheck,
  BarChart2,
  GitCommit,
  TrendingUp,
  ShieldCheck,
  AlertCircle,
  Clock,
  ArrowRight,
  Info,
  Layers,
  Activity,
  FileCheck2
} from 'lucide-react';
import {
  BarChart,
  Bar,
  LineChart,
  Line,
  XAxis,
  YAxis,
  Tooltip,
  Legend,
  ResponsiveContainer,
  CartesianGrid
} from 'recharts';

interface ValidationPageProps {
  report: FullValidationReport | null;
  onNavigateToPassport: () => void;
  onNavigateToPrivacy: () => void;
  isDemoMode: boolean;
}

type ValidationSubTab = 'overview' | 'distributions' | 'relationships' | 'temporal';

export const ValidationPage: React.FC<ValidationPageProps> = ({
  report,
  onNavigateToPassport,
  onNavigateToPrivacy,
  isDemoMode,
}) => {
  const [subTab, setSubTab] = useState<ValidationSubTab>('overview');

  // Distributions sub-tab state
  const [selectedFeature, setSelectedFeature] = useState<string>('sbp');
  const [showBaselineComparison, setShowBaselineComparison] = useState<boolean>(true);

  // Load correlation and temporal fixture data from validation service
  const correlationData = validationService.getCorrelationAnalysis();
  const temporalData = validationService.getTemporalAnalysis();
  const currentDistData = validationService.getDistributionData(selectedFeature);

  const isCalculated = report && report.isCalculated;

  return (
    <div className="space-y-6">
      {/* Top Header */}
      <div className="flex flex-wrap items-center justify-between gap-4 pb-4 border-b border-slate-200">
        <div>
          <div className="flex items-center gap-2.5">
            <h1 className="text-2xl font-bold tracking-tight text-slate-900">Validation Suite</h1>
            <StatusBadge
              status={isCalculated ? report.overallStatus : 'NOT_CALCULATED'}
              size="sm"
            />
          </div>
          <p className="text-xs text-slate-500 mt-1">
            Empirical evidence comparing the synthetic cohort against held-out real patient test splits.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={onNavigateToPassport}
            className="inline-flex items-center gap-1.5 px-3.5 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded text-xs font-semibold transition-colors shadow-xs"
          >
            <FileCheck2 className="w-3.5 h-3.5" />
            <span>Generate Cohort Passport</span>
          </button>
        </div>
      </div>

      {/* Internal Sub-Navigation Tabs */}
      <div className="border-b border-slate-200 bg-white px-2 rounded-t-lg">
        <nav className="flex space-x-6 text-xs font-semibold">
          <button
            onClick={() => setSubTab('overview')}
            className={`py-3 px-1 border-b-2 flex items-center gap-2 transition-colors ${
              subTab === 'overview'
                ? 'border-blue-600 text-blue-800 font-bold'
                : 'border-transparent text-slate-500 hover:text-slate-700'
            }`}
          >
            <CheckCheck className="w-4 h-4" />
            <span>Validation Overview</span>
          </button>
          <button
            onClick={() => setSubTab('distributions')}
            className={`py-3 px-1 border-b-2 flex items-center gap-2 transition-colors ${
              subTab === 'distributions'
                ? 'border-blue-600 text-blue-800 font-bold'
                : 'border-transparent text-slate-500 hover:text-slate-700'
            }`}
          >
            <BarChart2 className="w-4 h-4" />
            <span>Distributions (Real vs Synthetic)</span>
          </button>
          <button
            onClick={() => setSubTab('relationships')}
            className={`py-3 px-1 border-b-2 flex items-center gap-2 transition-colors ${
              subTab === 'relationships'
                ? 'border-blue-600 text-blue-800 font-bold'
                : 'border-transparent text-slate-500 hover:text-slate-700'
            }`}
          >
            <GitCommit className="w-4 h-4" />
            <span>Relationship Fidelity</span>
          </button>
          <button
            onClick={() => setSubTab('temporal')}
            className={`py-3 px-1 border-b-2 flex items-center gap-2 transition-colors ${
              subTab === 'temporal'
                ? 'border-blue-600 text-blue-800 font-bold'
                : 'border-transparent text-slate-500 hover:text-slate-700'
            }`}
          >
            <TrendingUp className="w-4 h-4" />
            <span>Temporal &amp; Trajectories</span>
          </button>
        </nav>
      </div>

      {/* SUB-TAB 1: VALIDATION OVERVIEW */}
      {subTab === 'overview' && (
        <div className="space-y-6">
          {/* Overall Review Status Banner */}
          <div className="p-4 bg-white rounded-lg border border-slate-200">
            <div className="flex flex-wrap items-start justify-between gap-3 pb-3 border-b border-slate-100">
              <div className="flex items-center gap-2">
                <span className="text-xs font-bold uppercase tracking-wider text-slate-500">
                  Overall Review Status:
                </span>
                <StatusBadge
                  status={isCalculated ? report.overallStatus : 'NOT_CALCULATED'}
                  size="md"
                />
              </div>
              <span className="text-xs text-slate-500 font-mono">
                Evaluation Basis: 30% Unseen Real Holdout Split (N=394)
              </span>
            </div>
            <p className="text-xs text-slate-700 leading-relaxed mt-3">
              {isCalculated
                ? report.summaryExplanation
                : 'No validation metrics currently recorded for this cohort. Execute a synthetic generation run to populate holdout statistics.'}
            </p>
          </div>

          {/* Quadrant 1: FIDELITY */}
          <div>
            <div className="flex items-center justify-between mb-2">
              <h3 className="text-xs font-bold uppercase tracking-wider text-slate-500 flex items-center gap-1.5">
                <Layers className="w-3.5 h-3.5 text-blue-600" />
                Dimension 1: Statistical Fidelity (Holdout CDFs &amp; Dependencies)
              </h3>
              <span className="text-xs text-slate-400">Zero circular training data overlap</span>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
              <MetricCard metric={report!.fidelity.ksStatistic} />
              <MetricCard metric={report!.fidelity.wassersteinDistance} />
              <MetricCard metric={report!.fidelity.frobeniusCorrelationDelta} />
              <MetricCard metric={report!.fidelity.c2stClassifierAUC} />
            </div>
          </div>

          {/* Quadrant 2: UTILITY */}
          <div>
            <div className="flex items-center justify-between mb-2">
              <h3 className="text-xs font-bold uppercase tracking-wider text-slate-500 flex items-center gap-1.5">
                <Activity className="w-3.5 h-3.5 text-emerald-600" />
                Dimension 2: Predictive Utility (TSTR Protocol)
              </h3>
              <span className="text-xs text-slate-400">Train on Synthetic, Test on Real</span>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
              <MetricCard metric={report!.utility.tstrAUROC} />
              <MetricCard metric={report!.utility.realTrainedAUROC} />
              <MetricCard metric={report!.utility.aurocDifference} />
              <MetricCard metric={report!.utility.kendallRankTau} />
            </div>
          </div>

          {/* Quadrant 3: TEMPORAL FIDELITY */}
          <div>
            <div className="flex items-center justify-between mb-2">
              <h3 className="text-xs font-bold uppercase tracking-wider text-slate-500 flex items-center gap-1.5">
                <TrendingUp className="w-3.5 h-3.5 text-purple-600" />
                Dimension 3: Longitudinal &amp; Temporal Behavior
              </h3>
              <span className="text-xs text-slate-400">12-Week Visit Trajectories &amp; MNAR Dropout</span>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              <MetricCard metric={report!.temporal.trajectorySimilarity} />
              <MetricCard metric={report!.temporal.missingnessPatternSimilarity} />
              <MetricCard metric={report!.temporal.dropoutAgreement} />
            </div>
          </div>

          {/* Quadrant 4: PRIVACY RISK */}
          <div>
            <div className="flex items-center justify-between mb-2">
              <h3 className="text-xs font-bold uppercase tracking-wider text-slate-500 flex items-center gap-1.5">
                <ShieldCheck className="w-3.5 h-3.5 text-rose-600" />
                Dimension 4: Empirical Privacy Risk (Adversarial Attack)
              </h3>
              <button
                onClick={onNavigateToPrivacy}
                className="text-xs text-blue-600 hover:text-blue-800 font-semibold"
              >
                Inspect Quarantined Records ({report!.privacy.flaggedNearDuplicates ?? 0}) →
              </button>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              <MetricCard metric={report!.privacy.membershipInferenceAUC} />
              <MetricCard metric={report!.privacy.relativeDCR} />
              <MetricCard metric={report!.privacy.nearestRecordDistance} />
            </div>
          </div>

          {/* Extrapolation Meter Component */}
          {report && <ExtrapolationMeter assessment={report.extrapolation} />}
        </div>
      )}

      {/* SUB-TAB 2: DISTRIBUTIONS (REAL VS SYNTHETIC) */}
      {subTab === 'distributions' && (
        <div className="bg-white rounded-lg border border-slate-200 p-6 space-y-6">
          <div className="flex flex-wrap items-center justify-between gap-4 pb-4 border-b border-slate-200">
            <div>
              <h3 className="text-base font-bold text-slate-900">
                Univariate Distribution Comparison: Real vs Synthetic
              </h3>
              <p className="text-xs text-slate-500 mt-0.5">
                Compare marginal density shapes of source observations against the generated synthetic cohort.
              </p>
            </div>

            {/* Comparator Toggle (Causal vs Baseline Copula) */}
            <div className="flex items-center gap-2 bg-slate-50 p-1.5 rounded border border-slate-200">
              <span className="text-[11px] font-semibold text-slate-600 px-1.5">
                Compare with Baseline:
              </span>
              <button
                onClick={() => setShowBaselineComparison(!showBaselineComparison)}
                className={`px-2.5 py-1 rounded text-xs font-medium transition-colors ${
                  showBaselineComparison
                    ? 'bg-amber-100 text-amber-900 border border-amber-300'
                    : 'bg-white text-slate-600 border border-slate-200'
                }`}
              >
                {showBaselineComparison ? 'Baseline Copula Active' : 'Hide Baseline'}
              </button>
            </div>
          </div>

          {/* Feature Selector Tabs */}
          <div className="flex flex-wrap items-center gap-1.5 pb-2">
            {[
              { id: 'sbp', label: 'Systolic BP (SBP)', ks: 'KS = 0.082' },
              { id: 'age', label: 'Age Distribution', ks: 'KS = 0.074' },
              { id: 'bmi', label: 'Body Mass Index', ks: 'KS = 0.089' },
              { id: 'activity', label: 'Weekly Activity', ks: 'KS = 0.095' },
              { id: 'adherence', label: 'Medication Adherence', ks: 'KS = 0.068' },
            ].map((f) => (
              <button
                key={f.id}
                onClick={() => setSelectedFeature(f.id)}
                className={`px-3 py-1.5 rounded text-xs transition-colors flex items-center gap-2 ${
                  selectedFeature === f.id
                    ? 'bg-slate-900 text-white font-semibold'
                    : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                }`}
              >
                <span>{f.label}</span>
                <span className={`text-[10px] font-mono ${selectedFeature === f.id ? 'text-blue-300' : 'text-slate-400'}`}>
                  {f.ks}
                </span>
              </button>
            ))}
          </div>

          {/* Chart Display */}
          <div className="h-80 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={currentDistData} margin={{ top: 10, right: 10, left: -10, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                <XAxis dataKey="bucket" tick={{ fontSize: 11, fill: '#64748b' }} axisLine={{ stroke: '#cbd5e1' }} />
                <YAxis tick={{ fontSize: 11, fill: '#64748b' }} axisLine={{ stroke: '#cbd5e1' }} />
                <Tooltip
                  contentStyle={{ backgroundColor: '#ffffff', borderColor: '#cbd5e1', fontSize: '11px', borderRadius: '4px' }}
                />
                <Legend wrapperStyle={{ fontSize: '11px', paddingTop: '10px' }} />
                <Bar dataKey="realCount" name="Real Source Patients (N=1,314)" fill="#64748b" radius={[2, 2, 0, 0]} />
                <Bar dataKey="syntheticCount" name="HealthGrid Causal Generator (N=5,000)" fill="#2563eb" radius={[2, 2, 0, 0]} />
                {showBaselineComparison && (
                  <Bar
                    dataKey="baselineCount"
                    name="Gaussian Copula Baseline (Resampled)"
                    fill="#f59e0b"
                    radius={[2, 2, 0, 0]}
                  />
                )}
              </BarChart>
            </ResponsiveContainer>
          </div>

          {/* Scientific Insight Explanation */}
          <div className="p-4 bg-blue-50/60 rounded-lg border border-blue-200 text-xs text-blue-950 space-y-2">
            <div className="font-bold flex items-center gap-1.5">
              <Info className="w-4 h-4 text-blue-700" />
              <span>Causal Propagation vs Standard Resampling</span>
            </div>
            <p className="text-blue-900 leading-relaxed">
              When diabetes prevalence was increased from 8% to 60%, notice how the <strong>HealthGrid Causal Generator</strong> shifted
              the Systolic Blood Pressure distribution upwards (elevating patients in the 130–159 mmHg range) because the metabolic mechanism
              fired. In contrast, the <strong>Gaussian Copula baseline</strong> resampled the same 105 real diabetic individuals repeatedly,
              leaving the overall blood pressure curve artificially static and creating near-duplicate records.
            </p>
          </div>
        </div>
      )}

      {/* SUB-TAB 3: RELATIONSHIP FIDELITY */}
      {subTab === 'relationships' && (
        <div className="bg-white rounded-lg border border-slate-200 p-6 space-y-6">
          <div>
            <h3 className="text-base font-bold text-slate-900">Pairwise Relationship Fidelity</h3>
            <p className="text-xs text-slate-500 mt-0.5">
              Evaluating whether multidimensional correlation structures between biomarkers are preserved.
            </p>
          </div>

          {/* Key Relationships Cards */}
          <div>
            <div className="text-xs font-bold uppercase tracking-wider text-slate-400 mb-3">
              Essential Clinical Dependencies
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
              {correlationData.keyRelationships.map((item, idx) => (
                <div key={idx} className="p-4 bg-slate-50 rounded border border-slate-200 text-xs">
                  <div className="font-bold text-slate-900 text-sm mb-1">
                    {item.featureA} ⇄ {item.featureB}
                  </div>
                  <div className="flex items-center gap-3 font-mono my-2 text-xs">
                    <span className="text-slate-600">Real: <strong>{item.realCorr > 0 ? `+${item.realCorr}` : item.realCorr}</strong></span>
                    <span className="text-blue-700">Synth: <strong>{item.syntheticCorr > 0 ? `+${item.syntheticCorr}` : item.syntheticCorr}</strong></span>
                    <span className="text-slate-400">Δ: {item.delta > 0 ? `+${item.delta}` : item.delta}</span>
                  </div>
                  <p className="text-[11px] text-slate-600 leading-normal">{item.clinicalMeaning}</p>
                </div>
              ))}
            </div>
          </div>

          {/* Correlation Matrix Table */}
          <div className="pt-4 border-t border-slate-200">
            <h4 className="text-xs font-bold uppercase tracking-wider text-slate-600 mb-3">
              Side-by-Side Correlation Matrix (Real vs Synthetic)
            </h4>
            <div className="overflow-x-auto">
              <table className="text-xs text-center border-collapse mx-auto">
                <thead>
                  <tr>
                    <th className="p-2"></th>
                    {correlationData.features.map((feat) => (
                      <th key={feat} className="p-2 font-bold text-slate-700 text-[11px] w-24">
                        {feat}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {correlationData.realMatrix.map((row, rowIdx) => (
                    <tr key={rowIdx}>
                      <td className="p-2 font-bold text-slate-700 text-left text-[11px]">
                        {correlationData.features[rowIdx]}
                      </td>
                      {row.map((realVal, colIdx) => {
                        const synthVal = correlationData.syntheticMatrix[rowIdx][colIdx];
                        const delta = Math.abs(realVal - synthVal);
                        const isSelf = rowIdx === colIdx;

                        return (
                          <td
                            key={colIdx}
                            className={`p-2 font-mono text-[11px] border border-slate-100 ${
                              isSelf ? 'bg-slate-100 text-slate-400' : delta < 0.04 ? 'bg-emerald-50 text-emerald-900' : 'bg-slate-50 text-slate-700'
                            }`}
                          >
                            <div className="font-semibold">{synthVal.toFixed(2)}</div>
                            {!isSelf && <div className="text-[10px] text-slate-400">r: {realVal.toFixed(2)}</div>}
                          </td>
                        );
                      })}
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            <div className="text-[11px] text-slate-500 text-center mt-3">
              Frobenius norm distance ||Corr_real - Corr_synthetic||_F = 0.06 (PASS threshold &lt; 0.10)
            </div>
          </div>
        </div>
      )}

      {/* SUB-TAB 4: TEMPORAL & TRAJECTORIES */}
      {subTab === 'temporal' && (
        <div className="bg-white rounded-lg border border-slate-200 p-6 space-y-6">
          <div>
            <h3 className="text-base font-bold text-slate-900">Longitudinal Trajectory Analysis</h3>
            <p className="text-xs text-slate-500 mt-0.5">
              Simulating 12-week clinic visit progression with autoregressive drift, Markov adherence decay, and MNAR dropout.
            </p>
          </div>

          {/* SBP Trajectory Chart */}
          <div>
            <div className="text-xs font-bold uppercase tracking-wider text-slate-600 mb-3">
              Systolic Blood Pressure Trajectory Over 12 Weeks
            </div>
            <div className="h-72 w-full">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={temporalData.trajectories} margin={{ top: 10, right: 10, left: -10, bottom: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                  <XAxis dataKey="week" tickFormatter={(v) => `Wk ${v}`} tick={{ fontSize: 11, fill: '#64748b' }} axisLine={{ stroke: '#cbd5e1' }} />
                  <YAxis domain={[120, 140]} tick={{ fontSize: 11, fill: '#64748b' }} axisLine={{ stroke: '#cbd5e1' }} />
                  <Tooltip
                    contentStyle={{ backgroundColor: '#ffffff', borderColor: '#cbd5e1', fontSize: '11px', borderRadius: '4px' }}
                  />
                  <Legend wrapperStyle={{ fontSize: '11px', paddingTop: '10px' }} />
                  <Line type="monotone" dataKey="realSBPMean" name="Real Patient Trajectory (Mean SBP)" stroke="#64748b" strokeWidth={2} dot={{ r: 3 }} />
                  <Line type="monotone" dataKey="syntheticSBPMean" name="HealthGrid Synthetic SBP" stroke="#2563eb" strokeWidth={2} dot={{ r: 3 }} />
                  <Line type="monotone" dataKey="baselineCopulaSBPMean" name="Baseline Copula (Flat Random Walk)" stroke="#f59e0b" strokeWidth={1.5} strokeDasharray="4 4" dot={false} />
                </LineChart>
              </ResponsiveContainer>
            </div>
          </div>

          {/* Markov Adherence and Dropout Rows */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pt-4 border-t border-slate-200">
            {/* Adherence States */}
            <div>
              <h4 className="text-xs font-bold uppercase tracking-wider text-slate-700 mb-2">
                Medication Adherence Markov Transitions
              </h4>
              <div className="space-y-2">
                {temporalData.adherenceStates.map((item) => (
                  <div key={item.week} className="p-2.5 bg-slate-50 rounded border border-slate-200 text-xs">
                    <div className="flex justify-between font-semibold text-slate-800 mb-1">
                      <span>{item.week}</span>
                      <span className="text-emerald-700">{item.adherentPct}% Adherent</span>
                    </div>
                    <div className="w-full bg-slate-200 h-2 rounded-full overflow-hidden flex">
                      <div style={{ width: `${item.adherentPct}%` }} className="bg-emerald-600 h-full"></div>
                      <div style={{ width: `${item.lapsingPct}%` }} className="bg-amber-400 h-full"></div>
                      <div style={{ width: `${item.droppedPct}%` }} className="bg-rose-500 h-full"></div>
                    </div>
                    <div className="flex justify-between text-[10px] text-slate-400 font-mono mt-1">
                      <span>{item.adherentPct}% Active</span>
                      <span>{item.lapsingPct}% Lapsing</span>
                      <span>{item.droppedPct}% Discontinued</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* MNAR Dropout Agreement */}
            <div>
              <h4 className="text-xs font-bold uppercase tracking-wider text-slate-700 mb-2">
                MNAR (Missing Not At Random) Dropout Fidelity
              </h4>
              <div className="space-y-2">
                {temporalData.mnarDropout.map((item, idx) => (
                  <div key={idx} className="p-2.5 bg-slate-50 rounded border border-slate-200 text-xs">
                    <div className="font-semibold text-slate-800 mb-1">{item.subgroup}</div>
                    <div className="flex justify-between text-[11px] text-slate-600 font-mono">
                      <span>Real Attrition: {item.realDropout}%</span>
                      <span className="text-blue-700 font-bold">Synthetic Attrition: {item.syntheticDropout}%</span>
                    </div>
                  </div>
                ))}
              </div>
              <p className="text-[11px] text-slate-500 mt-3 leading-relaxed">
                HealthGrid simulates realistic clinical trial attrition: patients experiencing persistent pain or uncontrolled hypertension
                exhibit elevated probabilities of missed appointments.
              </p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
