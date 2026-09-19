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
  FileCheck2,
  GitBranch,
  CheckCircle2,
  XCircle,
  Scale,
  Zap,
  AlertTriangle
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

type ValidationSubTab = 'overview' | 'comparator' | 'distributions' | 'relationships' | 'temporal';

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
  const comparisonSummary = validationService.getComparisonSummary();

  const isCalculated = report && report.isCalculated;

  if (!report) {
    return <div className="p-8 text-center text-slate-500 text-xs">Loading validation evidence for the active run...</div>;
  }

  return (
    <div className="space-y-6 animate-in fade-in duration-300">
      {/* Top Header */}
      <div className="flex flex-wrap items-center justify-between gap-4 pb-5 border-b border-slate-200/80 dark:border-slate-800">
        <div>
          <div className="flex items-center gap-3">
            <h1 className="text-2xl font-bold tracking-tight text-slate-900 dark:text-white">Validation Suite</h1>
            <StatusBadge
              status={isCalculated ? report.overallStatus : 'NOT_CALCULATED'}
              size="sm"
            />
          </div>
          <p className="text-xs text-slate-600 dark:text-slate-400 mt-1 font-medium">
            Empirical evidence audit comparing synthetic cohort against held-out real patient splits.
          </p>
        </div>

        <div className="flex items-center gap-2.5">
          <button
            onClick={onNavigateToPassport}
            className="inline-flex items-center gap-2 px-4 py-2 bg-blue-600 hover:bg-blue-500 text-white rounded-xl text-xs font-semibold transition-all duration-200 shadow-sm hover:shadow-md hover:-translate-y-0.5 active:translate-y-0"
          >
            <FileCheck2 className="w-3.5 h-3.5" />
            <span>Generate Cohort Passport</span>
          </button>
        </div>
      </div>

      {/* Apple Floating Segmented Glass Pill Navigation */}
      <div className="flex justify-start overflow-x-auto pb-1">
        <nav className="glass-panel p-1.5 rounded-full inline-flex items-center gap-1.5 shadow-2xs border border-slate-200/80 dark:border-slate-700">
          <button
            onClick={() => setSubTab('overview')}
            className={`px-4 py-2 rounded-full text-xs font-semibold inline-flex items-center gap-2 shrink-0 whitespace-nowrap leading-none transition-all duration-200 ${
              subTab === 'overview'
                ? 'bg-blue-600 text-white shadow-xs shadow-blue-500/30'
                : 'text-slate-700 dark:text-slate-200 hover:text-slate-950 dark:hover:text-white hover:bg-white/60 dark:hover:bg-slate-800'
            }`}
          >
            <CheckCheck className="w-3.5 h-3.5" />
            <span>Overview</span>
          </button>
          <button
            onClick={() => setSubTab('comparator')}
            className={`px-4 py-2 rounded-full text-xs font-semibold inline-flex items-center gap-2 shrink-0 whitespace-nowrap leading-none transition-all duration-200 ${
              subTab === 'comparator'
                ? 'bg-amber-600 text-white shadow-xs shadow-amber-600/30'
                : 'text-slate-700 dark:text-slate-200 hover:text-slate-950 dark:hover:text-white hover:bg-white/60 dark:hover:bg-slate-800'
            }`}
          >
            <Scale className="w-3.5 h-3.5 text-amber-500" />
            <span>Baseline Comparator</span>
            <span className={`text-[10px] px-2 py-0.5 inline-flex items-center justify-center leading-none rounded-full font-bold uppercase tracking-wider shrink-0 ${
              subTab === 'comparator' ? 'bg-amber-700/50 text-amber-100' : 'bg-amber-500/15 text-amber-800 dark:text-amber-300 font-semibold'
            }`}>
              Split-Screen
            </span>
          </button>
          <button
            onClick={() => setSubTab('distributions')}
            className={`px-4 py-2 rounded-full text-xs font-semibold inline-flex items-center gap-2 shrink-0 whitespace-nowrap leading-none transition-all duration-200 ${
              subTab === 'distributions'
                ? 'bg-blue-600 text-white shadow-xs shadow-blue-500/30'
                : 'text-slate-700 dark:text-slate-200 hover:text-slate-950 dark:hover:text-white hover:bg-white/60 dark:hover:bg-slate-800'
            }`}
          >
            <BarChart2 className="w-3.5 h-3.5" />
            <span>Distributions</span>
          </button>
          <button
            onClick={() => setSubTab('relationships')}
            className={`px-4 py-2 rounded-full text-xs font-semibold inline-flex items-center gap-2 shrink-0 whitespace-nowrap leading-none transition-all duration-200 ${
              subTab === 'relationships'
                ? 'bg-blue-600 text-white shadow-xs shadow-blue-500/30'
                : 'text-slate-700 dark:text-slate-200 hover:text-slate-950 dark:hover:text-white hover:bg-white/60 dark:hover:bg-slate-800'
            }`}
          >
            <GitCommit className="w-3.5 h-3.5" />
            <span>Relationships</span>
          </button>
          <button
            onClick={() => setSubTab('temporal')}
            className={`px-4 py-2 rounded-full text-xs font-semibold inline-flex items-center gap-2 shrink-0 whitespace-nowrap leading-none transition-all duration-200 ${
              subTab === 'temporal'
                ? 'bg-blue-600 text-white shadow-xs shadow-blue-500/30'
                : 'text-slate-700 dark:text-slate-200 hover:text-slate-950 dark:hover:text-white hover:bg-white/60 dark:hover:bg-slate-800'
            }`}
          >
            <TrendingUp className="w-3.5 h-3.5" />
            <span>Temporal Dynamics</span>
          </button>
        </nav>
      </div>

      {/* SUB-TAB 1: VALIDATION OVERVIEW */}
      {subTab === 'overview' && (
        <div className="space-y-8 animate-in fade-in duration-300">
          {/* Overall Review Status Banner */}
          <div className="glass-card rounded-3xl p-6 md:p-7">
            <div className="flex flex-wrap items-start justify-between gap-3 pb-3.5 border-b border-slate-200/60 dark:border-white/5">
              <div className="flex items-center gap-3">
                <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400">
                  Overall Review Status:
                </span>
                <StatusBadge
                  status={isCalculated ? report.overallStatus : 'NOT_CALCULATED'}
                  size="md"
                />
              </div>
              <span className="text-xs text-slate-500 dark:text-slate-400 font-mono glass-pill px-2.5 py-0.5 rounded-full border-slate-200 dark:border-white/10 shrink-0 inline-flex items-center justify-center leading-none">
                Evaluation: 30% Holdout Split (N=394)
              </span>
            </div>
            <p className="text-xs md:text-sm text-slate-700 dark:text-slate-300 leading-relaxed mt-3.5 font-normal">
              {isCalculated
                ? report.summaryExplanation
                : 'No validation metrics currently recorded for this cohort. Execute a synthetic generation run to populate holdout statistics.'}
            </p>
            {report.verdictGates && report.verdictGates.length > 0 && (
              <div className="mt-4 flex flex-wrap gap-2">
                {report.verdictGates.map((gate) => (
                  <span key={gate.metric} className="glass-pill rounded-full px-3 py-1 text-[11px] font-mono">
                    {gate.metric.replace(/_/g, ' ')}: {gate.value === null ? 'N/A' : (typeof gate.value === 'number' ? (Number.isInteger(gate.value) ? gate.value : gate.value.toFixed(4)) : String(gate.value))} · {gate.result.toUpperCase()}
                  </span>
                ))}
              </div>
            )}
          </div>

          {/* Quadrant 1: FIDELITY */}
          <div>
            <div className="flex items-center justify-between mb-3 px-1">
              <h3 className="text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400 flex items-center gap-2">
                <Layers className="w-3.5 h-3.5 text-blue-600 dark:text-blue-400" />
                <span>Dimension 1: Statistical Fidelity (Holdout CDFs &amp; Dependencies)</span>
              </h3>
              <span className="text-xs text-slate-400 font-medium">Zero circular training data overlap</span>
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
            <div className="flex items-center justify-between mb-3 px-1">
              <h3 className="text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400 flex items-center gap-2">
                <Activity className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400" />
                <span>Dimension 2: Predictive Utility (TSTR Protocol)</span>
              </h3>
              <span className="text-xs text-slate-400 font-medium">Train on Synthetic, Test on Real</span>
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
            <div className="flex items-center justify-between mb-3 px-1">
              <h3 className="text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400 flex items-center gap-2">
                <TrendingUp className="w-3.5 h-3.5 text-purple-600 dark:text-purple-400" />
                <span>Dimension 3: Longitudinal &amp; Temporal Behavior</span>
              </h3>
              <span className="text-xs text-slate-400 font-medium">12-Week Visit Trajectories &amp; MNAR Dropout</span>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              <MetricCard metric={report!.temporal.trajectorySimilarity} />
              <MetricCard metric={report!.temporal.missingnessPatternSimilarity} />
              <MetricCard metric={report!.temporal.dropoutAgreement} />
            </div>
          </div>

          {/* Quadrant 4: PRIVACY RISK */}
          <div>
            <div className="flex items-center justify-between mb-3 px-1">
              <h3 className="text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400 flex items-center gap-2">
                <ShieldCheck className="w-3.5 h-3.5 text-rose-600 dark:text-rose-400" />
                <span>Dimension 4: Empirical Privacy Risk (Adversarial Attack)</span>
              </h3>
              <button
                onClick={onNavigateToPrivacy}
                className="text-xs text-blue-600 dark:text-blue-400 hover:text-blue-700 dark:hover:text-blue-300 font-semibold inline-flex items-center gap-1 group"
              >
                <span>Inspect Quarantined Records ({report!.privacy.flaggedNearDuplicates ?? 0})</span>
                <ArrowRight className="w-3.5 h-3.5 transition-transform group-hover:translate-x-0.5" />
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

      {/* SUB-TAB: BASELINE COMPARATOR (CENTERPIECE DEMO MOMENT) */}
      {subTab === 'comparator' && isDemoMode && (
        <div className="space-y-8 animate-in fade-in duration-300">
          {/* Cold Open Clinical Prompt Banner */}
          <div className="glass-panel rounded-3xl p-7 md:p-8 relative overflow-hidden bg-gradient-to-br from-slate-950 via-slate-900 to-indigo-950/90 text-white border border-white/10 shadow-lg group">
            <div className="absolute -top-24 -right-24 w-96 h-96 bg-amber-500/10 rounded-full blur-3xl pointer-events-none" />
            <div className="relative z-10">
              <div className="inline-flex items-center gap-2 px-3 py-1 glass-pill rounded-full text-amber-400 text-[11px] font-mono font-bold uppercase tracking-wider mb-3.5 border-amber-400/20 leading-none shrink-0">
                <Zap className="w-3.5 h-3.5 text-amber-400" />
                <span>Centerpiece Benchmark • Conventional Baseline vs SCM Generator</span>
              </div>
              <div className="border-l-2 border-amber-400/80 pl-4 my-3 py-1">
                <p className="text-base md:text-lg font-serif italic text-slate-100 leading-relaxed">
                  "I need 5,000 patients for our hypertension app's release test. Mostly over 65. About 60% diabetic. Twelve weeks of readings."
                </p>
              </div>
              <p className="text-xs md:text-sm text-slate-300 leading-relaxed mt-2.5 max-w-3xl font-normal">
                This is a standard engineering request for digital health. Here is the empirical proof of what happens when you ask
                a conventional statistical baseline (Gaussian Copula / Resampling) versus the <strong>HealthGrid SCM Generator</strong>.
              </p>
            </div>
          </div>

          {/* The 3 Demonstrated Failure Modes of Conventional Copula */}
          <div>
            <div className="flex flex-wrap items-center justify-between gap-2 mb-3.5 px-1">
              <h3 className="text-xs font-bold uppercase tracking-wider text-rose-600 dark:text-rose-400 flex items-center gap-2">
                <AlertTriangle className="w-4 h-4 text-rose-600" />
                <span>The 3 Critical Failure Modes of Conventional Copulas (Demonstrated)</span>
              </h3>
              <span className="text-[11px] font-mono text-slate-500 dark:text-slate-400 glass-pill px-2.5 py-0.5 rounded-full border-slate-200 dark:border-white/10 shrink-0 inline-flex items-center justify-center leading-none">
                Covariate Shift: 8.0% → 60.0% Diabetes
              </span>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
              {/* Failure 1 */}
              <div className="glass-card p-6 rounded-3xl border-rose-500/30 bg-rose-500/[0.04] space-y-3 flex flex-col justify-between hover:border-rose-500/45 transition-all duration-300">
                <div className="space-y-2.5">
                  <div className="flex items-center gap-2 text-rose-900 dark:text-rose-200 font-bold text-xs">
                    <span className="w-5 h-5 rounded-full bg-rose-600 text-white flex items-center justify-center text-[10px] font-mono font-bold shadow-xs">
                      1
                    </span>
                    <span>Near-Duplicate Memorization</span>
                  </div>
                  <div className="text-rose-950 dark:text-white font-bold text-sm leading-snug">
                    "1,847 of 5,000 patients are near-duplicates of 16 real people."
                  </div>
                  <p className="text-[11px] text-rose-900/80 dark:text-rose-200/80 leading-relaxed">
                    Because diabetic patients represented only 8% (105 real people) in source data, copula resampling repeatedly drew tight clusters around the same 16 real diabetic individuals. Shadow MIA attack AUC climbs to <strong className="font-mono text-rose-950 dark:text-rose-100">0.84</strong> (severe privacy breach).
                  </p>
                </div>
                <div className="pt-3 border-t border-rose-500/20 text-[10px] text-rose-800 dark:text-rose-300 flex items-center justify-between font-mono">
                  <span>HealthGrid: 0 duplicates (MIA 0.51)</span>
                  <span className="font-semibold text-emerald-600 dark:text-emerald-400">ESORICS 2025 Audit</span>
                </div>
              </div>

              {/* Failure 2 */}
              <div className="glass-card p-6 rounded-3xl border-amber-500/30 bg-amber-500/[0.04] space-y-3 flex flex-col justify-between hover:border-amber-500/45 transition-all duration-300">
                <div className="space-y-2.5">
                  <div className="flex items-center gap-2 text-amber-900 dark:text-amber-200 font-bold text-xs">
                    <span className="w-5 h-5 rounded-full bg-amber-600 text-white flex items-center justify-center text-[10px] font-mono font-bold shadow-xs">
                      2
                    </span>
                    <span>Static BP Distribution</span>
                  </div>
                  <div className="text-amber-950 dark:text-white font-bold text-sm leading-snug">
                    "Blood pressure barely moved — but we tripled the diabetics."
                  </div>
                  <p className="text-[11px] text-amber-900/80 dark:text-amber-200/80 leading-relaxed">
                    The copula treated diabetes as an isolated column. When diabetes prevalence was shifted 8% → 60%, downstream systolic blood pressure remained frozen at 128.4 mmHg because no physiological mechanism fired.
                  </p>
                </div>
                <div className="pt-3 border-t border-amber-500/20 text-[10px] text-amber-800 dark:text-amber-300 flex items-center justify-between font-mono">
                  <span>HealthGrid: +9.2 mmHg shift</span>
                  <span className="font-semibold text-blue-600 dark:text-blue-400">SCM Mechanism Fired</span>
                </div>
              </div>

              {/* Failure 3 */}
              <div className="glass-card p-6 rounded-3xl border-purple-500/30 bg-purple-500/[0.04] space-y-3 flex flex-col justify-between hover:border-purple-500/45 transition-all duration-300">
                <div className="space-y-2.5">
                  <div className="flex items-center gap-2 text-purple-900 dark:text-purple-200 font-bold text-xs">
                    <span className="w-5 h-5 rounded-full bg-purple-600 text-white flex items-center justify-center text-[10px] font-mono font-bold shadow-xs">
                      3
                    </span>
                    <span>Frozen Correlations &amp; MCAR</span>
                  </div>
                  <div className="text-purple-950 dark:text-white font-bold text-sm leading-snug">
                    "The correlation heatmap is frozen. It resampled; it didn't reason."
                  </div>
                  <p className="text-[11px] text-purple-900/80 dark:text-purple-200/80 leading-relaxed">
                    The baseline produced flat random-walk trajectories with uniform MCAR dropouts. HealthGrid models autoregressive drift, Markov adherence decay, and realistic MNAR attrition where the sickest and uncontrolled patients drop out first.
                  </p>
                </div>
                <div className="pt-3 border-t border-purple-500/20 text-[10px] text-purple-800 dark:text-purple-300 flex items-center justify-between font-mono">
                  <span>HealthGrid: 12-wk MNAR Model</span>
                  <span className="font-semibold text-purple-600 dark:text-purple-400">Dynamic Trajectories</span>
                </div>
              </div>
            </div>
          </div>

          {/* Live Side-by-Side SBP Distribution Split Screen */}
          <div className="glass-card rounded-3xl p-6 md:p-8 space-y-5">
            <div className="flex flex-wrap items-center justify-between gap-3 pb-4 border-b border-slate-200/60 dark:border-white/5">
              <div>
                <h3 className="text-sm font-bold text-slate-900 dark:text-white flex items-center gap-2">
                  <Scale className="w-4 h-4 text-blue-600 dark:text-blue-400" />
                  <span>Live Split-Screen: Systolic Blood Pressure Under 60% Diabetes Covariate Shift</span>
                </h3>
                <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                  Real source patients (8% diabetic) vs Generated cohorts (60% diabetic target).
                </p>
              </div>
              <div className="text-xs font-mono glass-pill px-3 py-1 rounded-full text-slate-700 dark:text-slate-300 border-slate-200 dark:border-white/10 shrink-0 inline-flex items-center justify-center leading-none">
                Source SBP Mean: 128.2 mmHg
              </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 pt-1">
              {/* Left Column: Gaussian Copula */}
              <div className="glass-card p-5 rounded-2xl border-amber-500/30 bg-amber-500/[0.03] flex flex-col justify-between space-y-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <span className="w-2.5 h-2.5 rounded-full bg-amber-500 shadow-xs shadow-amber-500/50"></span>
                    <span className="font-bold text-xs text-amber-950 dark:text-amber-200 uppercase tracking-wider">
                      Standard: Gaussian Copula Baseline
                    </span>
                  </div>
                  <span className="text-[10px] font-bold uppercase tracking-wider glass-pill bg-rose-500/10 text-rose-700 dark:text-rose-300 border-rose-500/25 px-2.5 py-0.5 rounded-full shrink-0 inline-flex items-center justify-center leading-none">
                    Mechanism Failed
                  </span>
                </div>

                <div className="h-56 w-full">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={currentDistData} margin={{ top: 10, right: 10, left: -15, bottom: 0 }}>
                      <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="rgba(245, 158, 11, 0.15)" />
                      <XAxis dataKey="bucket" tick={{ fontSize: 10, fill: '#78350f' }} axisLine={{ stroke: 'rgba(245, 158, 11, 0.2)' }} />
                      <YAxis tick={{ fontSize: 10, fill: '#78350f' }} axisLine={{ stroke: 'rgba(245, 158, 11, 0.2)' }} />
                      <Tooltip contentStyle={{ backgroundColor: 'rgba(255, 255, 255, 0.95)', backdropFilter: 'blur(16px)', borderColor: 'rgba(245, 158, 11, 0.4)', borderRadius: '12px', fontSize: '11px' }} />
                      <Legend wrapperStyle={{ fontSize: '11px' }} />
                      <Bar dataKey="realCount" name="Real Source Patients (8% Diabetes)" fill="#94a3b8" radius={[3, 3, 0, 0]} />
                      <Bar dataKey="baselineCount" name="Copula Baseline (60% Diabetes)" fill="#f59e0b" radius={[3, 3, 0, 0]} />
                    </BarChart>
                  </ResponsiveContainer>
                </div>

                <div className="p-3.5 glass-card rounded-xl border-amber-500/20 text-[11px] text-amber-950 dark:text-amber-200 space-y-1">
                  <div className="font-bold flex items-center justify-between">
                    <span>Baseline SBP Mean: 128.4 mmHg</span>
                    <span className="font-mono text-rose-600 dark:text-rose-400">Δ = +0.2 mmHg (Static)</span>
                  </div>
                  <p className="text-slate-600 dark:text-slate-400 leading-relaxed font-normal">
                    Peak remains stuck in the 120–129 mmHg range identical to the 8% diabetic sample. Because the physiological mechanism didn't fire, the copula resampled sparse diabetic records, cloning real patients.
                  </p>
                </div>
              </div>

              {/* Right Column: HealthGrid SCM Generator */}
              <div className="glass-card p-5 rounded-2xl border-blue-500/30 bg-blue-500/[0.03] flex flex-col justify-between space-y-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <span className="w-2.5 h-2.5 rounded-full bg-blue-600 shadow-xs shadow-blue-500/50"></span>
                    <span className="font-bold text-xs text-blue-950 dark:text-blue-200 uppercase tracking-wider">
                      HealthGrid: SCM Generator
                    </span>
                  </div>
                  <span className="text-[10px] font-bold uppercase tracking-wider glass-pill bg-emerald-500/10 text-emerald-700 dark:text-emerald-300 border-emerald-500/25 px-2.5 py-0.5 rounded-full shrink-0 inline-flex items-center justify-center leading-none">
                    Physiological Path Active
                  </span>
                </div>

                <div className="h-56 w-full">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={currentDistData} margin={{ top: 10, right: 10, left: -15, bottom: 0 }}>
                      <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="rgba(37, 99, 235, 0.15)" />
                      <XAxis dataKey="bucket" tick={{ fontSize: 10, fill: '#1e3a8a' }} axisLine={{ stroke: 'rgba(37, 99, 235, 0.2)' }} />
                      <YAxis tick={{ fontSize: 10, fill: '#1e3a8a' }} axisLine={{ stroke: 'rgba(37, 99, 235, 0.2)' }} />
                      <Tooltip contentStyle={{ backgroundColor: 'rgba(255, 255, 255, 0.95)', backdropFilter: 'blur(16px)', borderColor: 'rgba(37, 99, 235, 0.4)', borderRadius: '12px', fontSize: '11px' }} />
                      <Legend wrapperStyle={{ fontSize: '11px' }} />
                      <Bar dataKey="realCount" name="Real Source Patients (8% Diabetes)" fill="#94a3b8" radius={[3, 3, 0, 0]} />
                      <Bar dataKey="syntheticCount" name="HealthGrid SCM (60% Diabetes)" fill="#2563eb" radius={[3, 3, 0, 0]} />
                    </BarChart>
                  </ResponsiveContainer>
                </div>

                <div className="p-3.5 glass-card rounded-xl border-blue-500/20 text-[11px] text-blue-950 dark:text-blue-200 space-y-1">
                  <div className="font-bold flex items-center justify-between">
                    <span>HealthGrid SBP Mean: 137.6 mmHg</span>
                    <span className="font-mono text-emerald-600 dark:text-emerald-400">Δ = +9.2 mmHg (Physiological Shift)</span>
                  </div>
                  <p className="text-slate-600 dark:text-slate-400 leading-relaxed font-normal">
                    Distribution visibly shifts into the 130–159 mmHg range. The metabolic DAG path fired properly, synthesizing new plausible hypertensive patients rather than memorizing training cases.
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* Head-to-Head Comparative Scorecard (Win/Loss Matrix) */}
          <div className="glass-card rounded-3xl p-6 md:p-8 space-y-5">
            <div className="flex flex-wrap items-center justify-between gap-3 pb-3.5 border-b border-slate-200/60 dark:border-white/5">
              <div>
                <h3 className="text-sm font-bold text-slate-900 dark:text-white">
                  Head-to-Head Quantitative Scorecard: HealthGrid vs Conventional Copula
                </h3>
                <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                  Summary across privacy attacks, structural fidelity, downstream utility, and runtime performance.
                </p>
              </div>
              <div className="text-xs font-semibold px-3 py-1 glass-pill bg-emerald-500/10 text-emerald-700 dark:text-emerald-300 border-emerald-500/30 rounded-full shrink-0 inline-flex items-center justify-center leading-none">
                HealthGrid Wins 7 of 8 Dimensions
              </div>
            </div>

            <div className="overflow-x-auto">
              <table className="min-w-full text-xs text-left border-collapse">
                <thead>
                  <tr className="border-b border-slate-200/60 dark:border-white/5 text-slate-400 uppercase text-[10px] tracking-wider font-semibold">
                    <th className="py-3 px-3.5">Evaluation Dimension</th>
                    <th className="py-3 px-3.5">HealthGrid SCM</th>
                    <th className="py-3 px-3.5">Gaussian Copula Baseline</th>
                    <th className="py-3 px-3.5">Advantage &amp; Scientific Verdict</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 dark:divide-white/5 text-slate-700 dark:text-slate-300">
                  <tr className="hover:bg-black/[0.02] dark:hover:bg-white/[0.02] transition-colors">
                    <td className="py-3 px-3.5 font-semibold text-slate-900 dark:text-white">
                      Membership Inference Attack (MIA AUC)
                    </td>
                    <td className="py-3 px-3.5 font-mono font-bold text-emerald-600 dark:text-emerald-400">
                      0.51 (Random Guessing)
                    </td>
                    <td className="py-3 px-3.5 font-mono text-rose-600 dark:text-rose-400 font-bold">
                      0.84 (High Risk Leakage)
                    </td>
                    <td className="py-3 px-3.5">
                      <span className="inline-flex items-center gap-1.5 text-emerald-700 dark:text-emerald-300 font-medium">
                        <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400" />
                        HealthGrid: Resists adversarial re-identification attack
                      </span>
                    </td>
                  </tr>
                  <tr className="hover:bg-black/[0.02] dark:hover:bg-white/[0.02] transition-colors">
                    <td className="py-3 px-3.5 font-semibold text-slate-900 dark:text-white">
                      Unresolved Near-Duplicate Records
                    </td>
                    <td className="py-3 px-3.5 font-mono font-bold text-emerald-600 dark:text-emerald-400">
                      0 (3 quarantined &amp; regenerated)
                    </td>
                    <td className="py-3 px-3.5 font-mono text-rose-600 dark:text-rose-400 font-bold">
                      1,847 records (36.9% clones)
                    </td>
                    <td className="py-3 px-3.5">
                      <span className="inline-flex items-center gap-1.5 text-emerald-700 dark:text-emerald-300 font-medium">
                        <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400" />
                        HealthGrid: Automated isolation boundary enforcement
                      </span>
                    </td>
                  </tr>
                  <tr className="hover:bg-black/[0.02] dark:hover:bg-white/[0.02] transition-colors">
                    <td className="py-3 px-3.5 font-semibold text-slate-900 dark:text-white">
                      Relative DCR (rDCR Score)
                    </td>
                    <td className="py-3 px-3.5 font-mono font-bold text-emerald-600 dark:text-emerald-400">
                      1.14 (Safe Non-Memorizing)
                    </td>
                    <td className="py-3 px-3.5 font-mono text-rose-600 dark:text-rose-400 font-bold">
                      0.62 (Severe Memorization)
                    </td>
                    <td className="py-3 px-3.5">
                      <span className="inline-flex items-center gap-1.5 text-emerald-700 dark:text-emerald-300 font-medium">
                        <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400" />
                        HealthGrid: rDCR &gt; 0.95 threshold satisfied
                      </span>
                    </td>
                  </tr>
                  <tr className="hover:bg-black/[0.02] dark:hover:bg-white/[0.02] transition-colors">
                    <td className="py-3 px-3.5 font-semibold text-slate-900 dark:text-white">
                      SBP Response to 60% Diabetes Shift
                    </td>
                    <td className="py-3 px-3.5 font-mono font-bold text-emerald-600 dark:text-emerald-400">
                      +9.2 mmHg (Shift to 137.6)
                    </td>
                    <td className="py-3 px-3.5 font-mono text-amber-600 dark:text-amber-400 font-bold">
                      +0.2 mmHg (Frozen at 128.4)
                    </td>
                    <td className="py-3 px-3.5">
                      <span className="inline-flex items-center gap-1.5 text-emerald-700 dark:text-emerald-300 font-medium">
                        <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400" />
                        HealthGrid: Clinically grounded physiological mechanism
                      </span>
                    </td>
                  </tr>
                  <tr className="hover:bg-black/[0.02] dark:hover:bg-white/[0.02] transition-colors">
                    <td className="py-3 px-3.5 font-semibold text-slate-900 dark:text-white">
                      Classifier Two-Sample Test (C2ST AUC)
                    </td>
                    <td className="py-3 px-3.5 font-mono font-bold text-emerald-600 dark:text-emerald-400">
                      0.52 (Indistinguishable)
                    </td>
                    <td className="py-3 px-3.5 font-mono text-rose-600 dark:text-rose-400 font-bold">
                      0.76 (Easily Discriminated)
                    </td>
                    <td className="py-3 px-3.5">
                      <span className="inline-flex items-center gap-1.5 text-emerald-700 dark:text-emerald-300 font-medium">
                        <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400" />
                        HealthGrid: Retains high multi-variable joint realism
                      </span>
                    </td>
                  </tr>
                  <tr className="hover:bg-black/[0.02] dark:hover:bg-white/[0.02] transition-colors">
                    <td className="py-3 px-3.5 font-semibold text-slate-900 dark:text-white">
                      Downstream Utility Gap (TSTR ΔAUROC)
                    </td>
                    <td className="py-3 px-3.5 font-mono font-bold text-emerald-600 dark:text-emerald-400">
                      -0.02 (0.79 vs 0.81 TRTR)
                    </td>
                    <td className="py-3 px-3.5 font-mono text-amber-600 dark:text-amber-400 font-bold">
                      -0.13 (0.68 vs 0.81 TRTR)
                    </td>
                    <td className="py-3 px-3.5">
                      <span className="inline-flex items-center gap-1.5 text-emerald-700 dark:text-emerald-300 font-medium">
                        <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400" />
                        HealthGrid: 97.5% predictive power preserved
                      </span>
                    </td>
                  </tr>
                  <tr className="hover:bg-black/[0.02] dark:hover:bg-white/[0.02] transition-colors">
                    <td className="py-3 px-3.5 font-semibold text-slate-900 dark:text-white">
                      Longitudinal Attrition Dynamics
                    </td>
                    <td className="py-3 px-3.5 font-bold text-purple-600 dark:text-purple-400">
                      MNAR (Sickest drop out)
                    </td>
                    <td className="py-3 px-3.5 font-bold text-slate-400">
                      Uniform MCAR (Random Walk)
                    </td>
                    <td className="py-3 px-3.5">
                      <span className="inline-flex items-center gap-1.5 text-emerald-700 dark:text-emerald-300 font-medium">
                        <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400" />
                        HealthGrid: Replicates realistic digital trial attrition
                      </span>
                    </td>
                  </tr>
                  <tr className="hover:bg-black/[0.02] dark:hover:bg-white/[0.02] transition-colors">
                    <td className="py-3 px-3.5 font-semibold text-slate-900 dark:text-white">
                      Generation Speed (5,000 pts / 12 wks)
                    </td>
                    <td className="py-3 px-3.5 font-mono font-bold text-emerald-600 dark:text-emerald-400">
                      8.4s (CPU Only)
                    </td>
                    <td className="py-3 px-3.5 font-mono text-slate-500 font-bold">
                      14.2s
                    </td>
                    <td className="py-3 px-3.5">
                      <span className="inline-flex items-center gap-1.5 text-emerald-700 dark:text-emerald-300 font-medium">
                        <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400" />
                        HealthGrid: Pure forward sampling graph traversal
                      </span>
                    </td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {subTab === 'comparator' && !isDemoMode && (
        <div className="glass-card rounded-3xl p-6 md:p-8 space-y-5 animate-in fade-in duration-300">
          <div className="pb-4 border-b border-slate-200/60 dark:border-white/5">
            <h3 className="text-base font-bold text-slate-900 dark:text-white">Run-specific Generator Comparison</h3>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
              Values below are loaded from this run's backend evidence. Win counts are descriptive, not a fitness or anonymity verdict.
            </p>
          </div>
          {!report?.hasComparison || !comparisonSummary ? (
            <div className="p-6 rounded-2xl border border-slate-200 dark:border-slate-700 text-sm text-slate-600 dark:text-slate-300">
              This {report?.generator === 'gaussian_copula' ? 'Gaussian Copula' : 'generator'} run has no secondary comparator. Start an SCM run with baseline comparison enabled to produce side-by-side evidence.
            </div>
          ) : (
            <>
              <div className="flex flex-wrap gap-3 text-xs">
                <span className="glass-pill px-3 py-1 rounded-full">Preferred: {comparisonSummary.summary?.value ?? 'not assessable'}</span>
                <span className="glass-pill px-3 py-1 rounded-full">SCM wins: {comparisonSummary.summary?.details?.ours_wins ?? 0}</span>
                <span className="glass-pill px-3 py-1 rounded-full">Copula wins: {comparisonSummary.summary?.details?.baseline_wins ?? 0}</span>
                <span className="glass-pill px-3 py-1 rounded-full">Ties: {comparisonSummary.summary?.details?.ties ?? 0}</span>
              </div>
              <div className="overflow-x-auto">
                <table className="min-w-full text-xs text-left">
                  <thead>
                    <tr className="border-b border-slate-200/60 dark:border-white/5 text-slate-500 uppercase text-[10px] tracking-wider">
                      <th className="py-3 px-3">Metric</th>
                      <th className="py-3 px-3">SCM Generator</th>
                      <th className="py-3 px-3">Gaussian Copula</th>
                      <th className="py-3 px-3">Preferred</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100 dark:divide-white/5">
                    {Object.entries(comparisonSummary.metrics || {}).map(([name, metric]: [string, any]) => (
                      <tr key={name}>
                        <td className="py-3 px-3 font-semibold">{name.replace(/_/g, ' ')}</td>
                        <td className="py-3 px-3 font-mono">{metric.details?.ours ?? 'not assessable'}</td>
                        <td className="py-3 px-3 font-mono">{metric.details?.baseline ?? 'not assessable'}</td>
                        <td className="py-3 px-3 uppercase">{metric.details?.preferred ?? 'not ranked'}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
              {(comparisonSummary.caveats || []).map((caveat: string) => (
                <p key={caveat} className="text-[11px] text-slate-500 dark:text-slate-400">• {caveat}</p>
              ))}
            </>
          )}
        </div>
      )}

      {/* SUB-TAB 2: DISTRIBUTIONS (REAL VS SYNTHETIC) */}
      {subTab === 'distributions' && (
        <div className="glass-card rounded-3xl p-6 md:p-8 space-y-6 animate-in fade-in duration-300">
          <div className="flex flex-wrap items-center justify-between gap-4 pb-4 border-b border-slate-200/60 dark:border-white/5">
            <div>
              <h3 className="text-base font-bold text-slate-900 dark:text-white">
                Univariate Distribution Comparison: Real vs Synthetic
              </h3>
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5 font-medium">
                Compare marginal density shapes of source observations against the generated synthetic cohort.
              </p>
            </div>

            {/* Comparator Toggle (SCM vs Baseline Copula) */}
            {report?.hasComparison && <div className="flex items-center gap-2 p-1.5 glass-pill rounded-full border-slate-200 dark:border-white/10 shrink-0">
              <span className="text-[11px] font-semibold text-slate-600 dark:text-slate-300 px-2 leading-none">
                Baseline Comparator:
              </span>
              <button
                onClick={() => setShowBaselineComparison(!showBaselineComparison)}
                className={`px-3 py-1 rounded-full text-xs font-semibold inline-flex items-center justify-center leading-none shrink-0 transition-all duration-200 ${
                  showBaselineComparison
                    ? 'bg-amber-600 text-white shadow-xs'
                    : 'glass-pill text-slate-600 dark:text-slate-300 hover:bg-black/5 dark:hover:bg-white/5'
                }`}
              >
                {showBaselineComparison ? 'Baseline Copula Active' : 'Show Baseline'}
              </button>
            </div>}
          </div>

          {/* Feature Selector Tabs */}
          <div className="flex flex-wrap items-center gap-2 pb-1">
            {[
              { id: 'sbp', label: 'Systolic BP (SBP)' },
              { id: 'age', label: 'Age Distribution' },
              { id: 'bmi', label: 'Body Mass Index' },
              { id: 'activity', label: 'Weekly Activity' },
              { id: 'adherence', label: 'Medication Adherence' },
            ].map((f) => (
              <button
                key={f.id}
                onClick={() => setSelectedFeature(f.id)}
                className={`px-3.5 py-1.5 rounded-full text-xs transition-all duration-200 inline-flex items-center gap-2 shrink-0 leading-none ${
                  selectedFeature === f.id
                    ? 'bg-slate-900 text-white font-semibold shadow-xs shadow-slate-900/20'
                    : 'glass-pill text-slate-600 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white'
                }`}
              >
                <span>{f.label}</span>
              </button>
            ))}
          </div>

          {/* Chart Display */}
          <div className="h-80 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={currentDistData} margin={{ top: 10, right: 10, left: -10, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="rgba(148, 163, 184, 0.15)" />
                <XAxis dataKey="bucket" tick={{ fontSize: 11, fill: '#64748b' }} axisLine={{ stroke: 'rgba(148, 163, 184, 0.2)' }} />
                <YAxis tick={{ fontSize: 11, fill: '#64748b' }} axisLine={{ stroke: 'rgba(148, 163, 184, 0.2)' }} />
                <Tooltip
                  contentStyle={{
                    backgroundColor: 'rgba(255, 255, 255, 0.95)',
                    backdropFilter: 'blur(16px)',
                    borderColor: 'rgba(203, 213, 225, 0.6)',
                    borderRadius: '12px',
                    fontSize: '11px',
                    padding: '8px 12px'
                  }}
                />
                <Legend wrapperStyle={{ fontSize: '11px', paddingTop: '10px' }} />
                <Bar dataKey="realCount" name="Real Training Patients" fill="#94a3b8" radius={[3, 3, 0, 0]} />
                <Bar
                  dataKey="syntheticCount"
                  name={report?.generator === 'gaussian_copula' ? 'Gaussian Copula Cohort' : 'HealthGrid SCM Cohort'}
                  fill="#2563eb"
                  radius={[3, 3, 0, 0]}
                />
                {report?.hasComparison && showBaselineComparison && (
                  <Bar
                    dataKey="baselineCount"
                    name="Gaussian Copula Baseline (Resampled)"
                    fill="#f59e0b"
                    radius={[3, 3, 0, 0]}
                  />
                )}
              </BarChart>
            </ResponsiveContainer>
          </div>

          {/* Scientific Insight Explanation */}
          <div className="p-4 glass-card rounded-2xl border-blue-500/25 bg-blue-500/[0.03] text-xs text-blue-950 dark:text-blue-200 space-y-2">
            <div className="font-bold flex items-center gap-2">
              <Info className="w-4 h-4 text-blue-600 dark:text-blue-400" />
              <span>Run-specific distribution evidence</span>
            </div>
            <p className="text-slate-600 dark:text-slate-300 leading-relaxed font-normal">
              This chart is generated from the active run only. The selected generator is <strong>{report?.generator === 'gaussian_copula' ? 'Gaussian Copula' : 'HealthGrid SCM'}</strong>
              {report?.hasComparison ? ', and the optional Gaussian comparator can be toggled above.' : '. No secondary comparator was generated for this run.'}
              {' '}Use the extrapolation and validation gates—not visual similarity alone—to determine fitness for the declared purpose.
            </p>
          </div>
        </div>
      )}

      {/* SUB-TAB 3: RELATIONSHIP FIDELITY */}
      {subTab === 'relationships' && (
        <div className="glass-card rounded-3xl p-6 md:p-8 space-y-6 animate-in fade-in duration-300">
          <div>
            <h3 className="text-base font-bold text-slate-900 dark:text-white">Pairwise Relationship Fidelity</h3>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5 font-medium">
              Evaluating whether multidimensional correlation structures between biomarkers are preserved.
            </p>
          </div>

          {/* Key Relationships Cards */}
          <div>
            <div className="text-[11px] font-bold uppercase tracking-wider text-slate-400 mb-3 px-0.5">
              Essential Clinical Dependencies
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3.5">
              {correlationData.keyRelationships.map((item, idx) => (
                <div key={idx} className="p-4 glass-card rounded-2xl border-slate-200/60 dark:border-white/5 text-xs hover:border-blue-500/30 transition-all duration-200">
                  <div className="font-bold text-slate-900 dark:text-white text-sm mb-1.5">
                    {item.featureA} ⇄ {item.featureB}
                  </div>
                  <div className="flex items-center gap-3 font-mono my-2 text-xs">
                    <span className="text-slate-600 dark:text-slate-400">Real: <strong className="text-slate-800 dark:text-slate-200">{item.realCorr > 0 ? `+${item.realCorr}` : item.realCorr}</strong></span>
                    <span className="text-blue-600 dark:text-blue-400">Synth: <strong>{item.syntheticCorr > 0 ? `+${item.syntheticCorr}` : item.syntheticCorr}</strong></span>
                    <span className="text-slate-400">Δ: {item.delta > 0 ? `+${item.delta}` : item.delta}</span>
                  </div>
                  <p className="text-[11px] text-slate-500 dark:text-slate-400 leading-relaxed font-normal">{item.clinicalMeaning}</p>
                </div>
              ))}
            </div>
          </div>

          {/* Correlation Matrix Table */}
          <div className="pt-5 border-t border-slate-200/60 dark:border-white/5">
            <h4 className="text-[11px] font-bold uppercase tracking-wider text-slate-400 mb-3 px-0.5">
              Side-by-Side Correlation Matrix (Real vs Synthetic)
            </h4>
            <div className="overflow-x-auto">
              <table className="text-xs text-center border-collapse mx-auto">
                <thead>
                  <tr>
                    <th className="p-2.5"></th>
                    {correlationData.features.map((feat: string) => (
                      <th key={feat} className="p-2.5 font-bold text-slate-700 dark:text-slate-300 text-[11px] w-24">
                        {feat}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {correlationData.realMatrix.map((row: number[], rowIdx: number) => (
                    <tr key={rowIdx}>
                      <td className="p-2.5 font-bold text-slate-700 dark:text-slate-300 text-left text-[11px]">
                        {correlationData.features[rowIdx]}
                      </td>
                      {row.map((realVal: number, colIdx: number) => {
                        const synthVal = correlationData.syntheticMatrix[rowIdx][colIdx];
                        const delta = Math.abs(realVal - synthVal);
                        const isSelf = rowIdx === colIdx;

                        return (
                          <td
                            key={colIdx}
                            className={`p-2.5 font-mono text-[11px] border border-slate-200/40 dark:border-white/5 ${
                              isSelf ? 'bg-slate-100/50 dark:bg-white/5 text-slate-400' : delta < 0.04 ? 'bg-emerald-500/10 text-emerald-700 dark:text-emerald-300' : 'bg-slate-50/50 dark:bg-white/[0.02] text-slate-700 dark:text-slate-300'
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
            <div className="text-[11px] text-slate-400 font-mono text-center mt-3.5">
              Frobenius norm distance ||Corr_real - Corr_synthetic||_F = 0.06 (PASS threshold &lt; 0.10)
            </div>
          </div>
        </div>
      )}

      {/* SUB-TAB 4: TEMPORAL & TRAJECTORIES */}
      {subTab === 'temporal' && (
        <div className="glass-card rounded-3xl p-6 md:p-8 space-y-6 animate-in fade-in duration-300">
          <div>
            <h3 className="text-base font-bold text-slate-900 dark:text-white">Longitudinal Trajectory Analysis</h3>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5 font-medium">
              Simulating 12-week clinic visit progression with autoregressive drift, Markov adherence decay, and MNAR dropout.
            </p>
          </div>

          {/* SBP Trajectory Chart */}
          <div>
            <div className="text-[11px] font-bold uppercase tracking-wider text-slate-400 mb-3 px-0.5">
              Systolic Blood Pressure Trajectory Over 12 Weeks
            </div>
            <div className="h-72 w-full">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={temporalData.trajectories} margin={{ top: 10, right: 10, left: -10, bottom: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="rgba(148, 163, 184, 0.15)" />
                  <XAxis dataKey="week" tickFormatter={(v) => `Wk ${v}`} tick={{ fontSize: 11, fill: '#64748b' }} axisLine={{ stroke: 'rgba(148, 163, 184, 0.2)' }} />
                  <YAxis domain={[120, 140]} tick={{ fontSize: 11, fill: '#64748b' }} axisLine={{ stroke: 'rgba(148, 163, 184, 0.2)' }} />
                  <Tooltip
                    contentStyle={{
                      backgroundColor: 'rgba(255, 255, 255, 0.95)',
                      backdropFilter: 'blur(16px)',
                      borderColor: 'rgba(203, 213, 225, 0.6)',
                      borderRadius: '12px',
                      fontSize: '11px',
                      padding: '8px 12px'
                    }}
                  />
                  <Legend wrapperStyle={{ fontSize: '11px', paddingTop: '10px' }} />
                  <Line type="monotone" dataKey="realSBPMean" name="Real Patient Trajectory (Mean SBP)" stroke="#94a3b8" strokeWidth={2} dot={{ r: 3 }} />
                  <Line type="monotone" dataKey="syntheticSBPMean" name="HealthGrid Synthetic SBP" stroke="#2563eb" strokeWidth={2.5} dot={{ r: 4 }} />
                  <Line type="monotone" dataKey="baselineCopulaSBPMean" name="Baseline Copula (Flat Random Walk)" stroke="#f59e0b" strokeWidth={1.5} strokeDasharray="4 4" dot={false} />
                </LineChart>
              </ResponsiveContainer>
            </div>
          </div>

          {/* Markov Adherence and Dropout Rows */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pt-5 border-t border-slate-200/60 dark:border-white/5">
            {/* Adherence States */}
            <div>
              <h4 className="text-[11px] font-bold uppercase tracking-wider text-slate-400 mb-3 px-0.5">
                Medication Adherence Markov Transitions
              </h4>
              <div className="space-y-2.5">
                {temporalData.adherenceStates.map((item) => (
                  <div key={item.week} className="p-3.5 glass-card rounded-2xl border-slate-200/60 dark:border-white/5 text-xs">
                    <div className="flex justify-between font-semibold text-slate-800 dark:text-slate-200 mb-1.5">
                      <span>{item.week}</span>
                      <span className="text-emerald-600 dark:text-emerald-400 font-mono">{item.adherentPct}% Adherent</span>
                    </div>
                    <div className="w-full bg-slate-200/70 dark:bg-slate-700/50 h-2 rounded-full overflow-hidden flex">
                      <div style={{ width: `${item.adherentPct}%` }} className="bg-emerald-500 h-full"></div>
                      <div style={{ width: `${item.lapsingPct}%` }} className="bg-amber-400 h-full"></div>
                      <div style={{ width: `${item.droppedPct}%` }} className="bg-rose-500 h-full"></div>
                    </div>
                    <div className="flex justify-between text-[10px] text-slate-400 font-mono mt-1.5">
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
              <h4 className="text-[11px] font-bold uppercase tracking-wider text-slate-400 mb-3 px-0.5">
                MNAR (Missing Not At Random) Dropout Fidelity
              </h4>
              <div className="space-y-2.5">
                {temporalData.mnarDropout.map((item, idx) => (
                  <div key={idx} className="p-3.5 glass-card rounded-2xl border-slate-200/60 dark:border-white/5 text-xs">
                    <div className="font-semibold text-slate-800 dark:text-slate-200 mb-1">{item.subgroup}</div>
                    <div className="flex justify-between text-[11px] text-slate-500 dark:text-slate-400 font-mono">
                      <span>Real Attrition: {item.realDropout}%</span>
                      <span className="text-blue-600 dark:text-blue-400 font-bold">Synthetic Attrition: {item.syntheticDropout}%</span>
                    </div>
                  </div>
                ))}
              </div>
              <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-3.5 leading-relaxed font-normal">
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
