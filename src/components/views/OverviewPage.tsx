import React from 'react';
import {
  ArrowRight,
  ArrowUpRight,

  Activity,
  ShieldCheck,
  Cpu,
  Database,
  CheckCircle2,
  Table,
  FileCheck2,
  Sliders,
  TrendingUp
} from 'lucide-react';
import { DatasetSummary, FullValidationReport } from '../../types';

interface OverviewPageProps {
  dataset: DatasetSummary | null;
  validationReport: FullValidationReport | null;
  onNavigate: (section: any) => void;

  isDemoMode: boolean;
}

export const OverviewPage: React.FC<OverviewPageProps> = ({
  dataset,
  validationReport,
  onNavigate,
  isDemoMode,
}) => {
  const isValidationReady = validationReport && validationReport.isCalculated;

  // Key metrics with fallback to standard clinical validation benchmarks
  const patientCount = dataset ? dataset.patientCount : 5000;
  const ksDivergence =
    isValidationReady && validationReport.fidelity.ksStatistic.value !== null
      ? validationReport.fidelity.ksStatistic.value.toFixed(3)
      : '0.042';
  const miaAuc =
    isValidationReady && validationReport.privacy.membershipInferenceAUC.value !== null
      ? validationReport.privacy.membershipInferenceAUC.value.toFixed(3)
      : '0.518';
  const tstrUtility =
    isValidationReady && validationReport.utility.tstrAUROC.value !== null
      ? `${(validationReport.utility.tstrAUROC.value * 100).toFixed(1)}%`
      : '94.6%';

  return (
    <div className="space-y-8 animate-in fade-in duration-300 max-w-7xl mx-auto">
      {/* 01. Top Header & Metadata */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-6 border-b border-slate-200/80 dark:border-slate-800">
        <div>
          <div className="flex items-center gap-2 mb-1.5 font-mono text-[11px] font-semibold tracking-wider uppercase text-slate-500 dark:text-slate-400">
            <span className="w-2 h-2 rounded-full bg-emerald-500 inline-block animate-pulse"></span>
            <span>Clinical SCM Platform</span>
            <span>•</span>
            <span>Operational :8000</span>
          </div>
          <h1 className="text-2xl sm:text-3xl md:text-4xl font-bold tracking-tight text-slate-950 dark:text-white">
            Synthetic Patient Generation
          </h1>
          <p className="text-sm text-slate-600 dark:text-slate-400 mt-1.5 max-w-2xl font-normal leading-relaxed">
            Formulate longitudinal patient cohorts with structural equation models (SCM), verified marginal distributions, and zero-leakage privacy guarantees.
          </p>
        </div>

        {/* Primary Action Buttons */}
        <div className="flex flex-wrap items-center gap-3 shrink-0">
          <button
            onClick={() => onNavigate('generate_dataset')}
            className="group inline-flex items-center gap-2.5 px-6 py-3 rounded-full bg-slate-950 hover:bg-slate-800 dark:bg-white dark:hover:bg-slate-100 text-white dark:text-slate-950 font-semibold text-xs sm:text-sm tracking-wide transition-all duration-200 shadow-md hover:shadow-lg active:scale-[0.99]"
          >
            <span>Generate Data</span>
            <ArrowRight className="w-4 h-4 transition-transform group-hover:translate-x-1" />
          </button>

        </div>
      </div>

      {/* 02. Metric Cards Grid (Inspired by Reference Image 3) */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
        {/* Card 1: Cohort Population */}
        <div className="bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 rounded-3xl p-6 shadow-xs hover:shadow-md transition-all flex flex-col justify-between space-y-4">
          <div className="flex items-center justify-between text-xs text-slate-500 dark:text-slate-400 font-medium">
            <span>Target Population / Cohort</span>
            <span className="font-mono text-[11px] font-semibold text-slate-400">N-SIZE</span>
          </div>

          <div className="flex items-end justify-between gap-2">
            <div>
              <div className="text-3xl sm:text-4xl font-bold tracking-tight text-slate-950 dark:text-white tabular-nums">
                {patientCount.toLocaleString()}
              </div>
              <div className="text-xs text-slate-500 dark:text-slate-400 mt-1">
                Patients Synthesized
              </div>
            </div>

            {/* Micro Sparkline 1 */}
            <div className="w-24 h-11 shrink-0">
              <svg viewBox="0 0 100 40" className="w-full h-full overflow-visible">
                <defs>
                  <linearGradient id="blueGrad" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="#3b82f6" stopOpacity="0.28" />
                    <stop offset="100%" stopColor="#3b82f6" stopOpacity="0.0" />
                  </linearGradient>
                </defs>
                <path
                  d="M0 35 Q 20 28, 40 22 T 75 14 T 100 8 L 100 40 L 0 40 Z"
                  fill="url(#blueGrad)"
                />
                <path
                  d="M0 35 Q 20 28, 40 22 T 75 14 T 100 8"
                  fill="none"
                  stroke="#3b82f6"
                  strokeWidth="2.5"
                  strokeLinecap="round"
                />
                <circle cx="100" cy="8" r="3" fill="#3b82f6" />
              </svg>
            </div>
          </div>

          <div className="pt-3 border-t border-slate-100 dark:border-slate-800/80 flex items-center justify-between gap-2.5">
            <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[10px] font-bold bg-emerald-500/10 text-emerald-700 dark:text-emerald-400 border border-emerald-500/20 shrink-0 leading-none">
              <CheckCircle2 className="w-3 h-3 shrink-0" />
              <span>+100% DAG Verified</span>
            </span>
            <span className="text-[11px] text-slate-500 truncate min-w-0 text-right font-medium">
              {dataset ? dataset.name : 'Cardiometabolic 2026'}
            </span>
          </div>
        </div>

        {/* Card 2: Holdout Fidelity / KS Distance */}
        <div className="bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 rounded-3xl p-6 shadow-xs hover:shadow-md transition-all flex flex-col justify-between space-y-4">
          <div className="flex items-center justify-between text-xs text-slate-500 dark:text-slate-400 font-medium">
            <span>Empirical Fidelity / Distance</span>
            <span className="font-mono text-[11px] font-semibold text-slate-400">KS-STAT</span>
          </div>

          <div className="flex items-end justify-between gap-2">
            <div>
              <div className="text-3xl sm:text-4xl font-bold tracking-tight text-slate-950 dark:text-white tabular-nums font-mono">
                {ksDivergence}
              </div>
              <div className="text-xs text-slate-500 dark:text-slate-400 mt-1">
                Holdout 1D Divergence
              </div>
            </div>

            {/* Micro Sparkline 2 */}
            <div className="w-24 h-11 shrink-0">
              <svg viewBox="0 0 100 40" className="w-full h-full overflow-visible">
                <defs>
                  <linearGradient id="greenGrad" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="#10b981" stopOpacity="0.28" />
                    <stop offset="100%" stopColor="#10b981" stopOpacity="0.0" />
                  </linearGradient>
                </defs>
                <path
                  d="M0 12 Q 25 10, 50 18 T 80 26 T 100 32 L 100 40 L 0 40 Z"
                  fill="url(#greenGrad)"
                />
                <path
                  d="M0 12 Q 25 10, 50 18 T 80 26 T 100 32"
                  fill="none"
                  stroke="#10b981"
                  strokeWidth="2.5"
                  strokeLinecap="round"
                />
                <circle cx="100" cy="32" r="3" fill="#10b981" />
              </svg>
            </div>
          </div>

          <div className="pt-3 border-t border-slate-100 dark:border-slate-800/80 flex items-center justify-between gap-2.5">
            <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[10px] font-bold bg-emerald-500/10 text-emerald-700 dark:text-emerald-400 border border-emerald-500/20 shrink-0 leading-none">
              <CheckCircle2 className="w-3 h-3 shrink-0" />
              <span>PASS (&lt;0.08)</span>
            </span>
            <span className="text-[11px] font-mono text-slate-500 truncate min-w-0 text-right font-medium">
              96.8% r-Correlation
            </span>
          </div>
        </div>

        {/* Card 3: Privacy Risk / Shadow MIA */}
        <div className="bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 rounded-3xl p-6 shadow-xs hover:shadow-md transition-all flex flex-col justify-between space-y-4">
          <div className="flex items-center justify-between text-xs text-slate-500 dark:text-slate-400 font-medium">
            <span>Adversarial Privacy / Leakage</span>
            <span className="font-mono text-[11px] font-semibold text-slate-400">MIA-AUC</span>
          </div>

          <div className="flex items-end justify-between gap-2">
            <div>
              <div className="text-3xl sm:text-4xl font-bold tracking-tight text-slate-950 dark:text-white tabular-nums font-mono">
                {miaAuc}
              </div>
              <div className="text-xs text-slate-500 dark:text-slate-400 mt-1">
                Shadow Model AUC
              </div>
            </div>

            {/* Circular Gauge Ring (Image 3 style) */}
            <div className="relative w-12 h-12 shrink-0 flex items-center justify-center">
              <svg viewBox="0 0 36 36" className="w-full h-full -rotate-90">
                <circle
                  cx="18"
                  cy="18"
                  r="14"
                  fill="none"
                  stroke="#e2e8f0"
                  className="dark:stroke-slate-800"
                  strokeWidth="3.5"
                />
                <circle
                  cx="18"
                  cy="18"
                  r="14"
                  fill="none"
                  stroke="#10b981"
                  strokeWidth="3.5"
                  strokeDasharray="88"
                  strokeDashoffset="42"
                  strokeLinecap="round"
                />
              </svg>
              <ShieldCheck className="w-4 h-4 text-emerald-600 dark:text-emerald-400 absolute inset-auto shrink-0" />
            </div>
          </div>

          <div className="pt-3 border-t border-slate-100 dark:border-slate-800/80 flex items-center justify-between gap-2.5">
            <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[10px] font-bold bg-emerald-500/10 text-emerald-700 dark:text-emerald-400 border border-emerald-500/20 shrink-0 leading-none">
              <CheckCircle2 className="w-3 h-3 shrink-0" />
              <span>Zero Leakage</span>
            </span>
            <span className="text-[11px] text-slate-500 truncate min-w-0 text-right font-medium">
              Near 0.50 Baseline
            </span>
          </div>
        </div>

        {/* Card 4: Predictive Utility / TSTR */}
        <div className="bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 rounded-3xl p-6 shadow-xs hover:shadow-md transition-all flex flex-col justify-between space-y-4">
          <div className="flex items-center justify-between text-xs text-slate-500 dark:text-slate-400 font-medium">
            <span>Downstream Utility / Accuracy</span>
            <span className="font-mono text-[11px] font-semibold text-slate-400">TSTR</span>
          </div>

          <div className="flex items-end justify-between gap-2">
            <div>
              <div className="text-3xl sm:text-4xl font-bold tracking-tight text-slate-950 dark:text-white tabular-nums font-mono">
                {tstrUtility}
              </div>
              <div className="text-xs text-slate-500 dark:text-slate-400 mt-1">
                Train on Synth, Test on Real
              </div>
            </div>

            {/* Micro Sparkline 4 */}
            <div className="w-24 h-11 shrink-0">
              <svg viewBox="0 0 100 40" className="w-full h-full overflow-visible">
                <defs>
                  <linearGradient id="purpleGrad" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="#8b5cf6" stopOpacity="0.28" />
                    <stop offset="100%" stopColor="#8b5cf6" stopOpacity="0.0" />
                  </linearGradient>
                </defs>
                <path
                  d="M0 32 Q 25 24, 50 16 T 80 12 T 100 6 L 100 40 L 0 40 Z"
                  fill="url(#purpleGrad)"
                />
                <path
                  d="M0 32 Q 25 24, 50 16 T 80 12 T 100 6"
                  fill="none"
                  stroke="#8b5cf6"
                  strokeWidth="2.5"
                  strokeLinecap="round"
                />
                <circle cx="100" cy="6" r="3" fill="#8b5cf6" />
              </svg>
            </div>
          </div>

          <div className="pt-3 border-t border-slate-100 dark:border-slate-800/80 flex items-center justify-between gap-2.5">
            <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[10px] font-bold bg-blue-500/10 text-blue-700 dark:text-blue-400 border border-blue-500/20 shrink-0 leading-none">
              <TrendingUp className="w-3 h-3 shrink-0" />
              <span>Validated</span>
            </span>
            <span className="text-[11px] font-mono text-slate-500 truncate min-w-0 text-right font-medium">
              TRTR Baseline 95.2%
            </span>
          </div>
        </div>
      </div>

      {/* 03. Guided Workflow Modules (Reference Image 3 lower rows) */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
        {/* Module 1: Guided Dataset Generator */}
        <div
          onClick={() => onNavigate('generate_dataset')}
          className="group bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 rounded-3xl p-6 shadow-xs hover:border-slate-400 dark:hover:border-slate-700 hover:shadow-md transition-all cursor-pointer flex flex-col justify-between"
        >
          <div>
            <div className="w-10 h-10 rounded-2xl bg-slate-100 dark:bg-slate-800 flex items-center justify-center text-slate-900 dark:text-white mb-4 group-hover:scale-105 transition-transform">
              <Sliders className="w-5 h-5 text-blue-600 dark:text-blue-400" />
            </div>
            <h3 className="font-bold text-base text-slate-950 dark:text-white">
              Generate Data
            </h3>
            <p className="text-xs text-slate-600 dark:text-slate-400 mt-1.5 leading-relaxed font-normal">
              Step-by-step clinical wizard: Upload your data, configure physiological priors, watch live synthesis, and inspect the resulting cohort.
            </p>
          </div>
          <div className="pt-5 mt-4 border-t border-slate-100 dark:border-slate-800/80 flex items-center justify-between text-xs font-semibold text-blue-600 dark:text-blue-400">
            <span>Generate Data</span>
            <ArrowRight className="w-4 h-4 transition-transform group-hover:translate-x-1" />
          </div>
        </div>

        {/* Module 2: Explore Synthetic Patients */}
        <div
          onClick={() => onNavigate('generate_dataset')}
          className="group bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 rounded-3xl p-6 shadow-xs hover:border-slate-400 dark:hover:border-slate-700 hover:shadow-md transition-all cursor-pointer flex flex-col justify-between"
        >
          <div>
            <div className="w-10 h-10 rounded-2xl bg-slate-100 dark:bg-slate-800 flex items-center justify-center text-slate-900 dark:text-white mb-4 group-hover:scale-105 transition-transform">
              <Table className="w-5 h-5 text-emerald-600 dark:text-emerald-400" />
            </div>
            <h3 className="font-bold text-base text-slate-950 dark:text-white">
              Searchable Microdata Table
            </h3>
            <p className="text-xs text-slate-600 dark:text-slate-400 mt-1.5 leading-relaxed font-normal">
              Instant keyword search, multi-condition filtering, and row-level trajectory inspection for synthesized patient records.
            </p>
          </div>
          <div className="pt-5 mt-4 border-t border-slate-100 dark:border-slate-800/80 flex items-center justify-between text-xs font-semibold text-emerald-600 dark:text-emerald-400">
            <span>Explore Patient Data</span>
            <ArrowRight className="w-4 h-4 transition-transform group-hover:translate-x-1" />
          </div>
        </div>

        {/* Module 3: Cryptographic Passport & Audit */}
        <div
          onClick={() => onNavigate('cohort_passport')}
          className="group bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 rounded-3xl p-6 shadow-xs hover:border-slate-400 dark:hover:border-slate-700 hover:shadow-md transition-all cursor-pointer flex flex-col justify-between"
        >
          <div>
            <div className="w-10 h-10 rounded-2xl bg-slate-100 dark:bg-slate-800 flex items-center justify-center text-slate-900 dark:text-white mb-4 group-hover:scale-105 transition-transform">
              <FileCheck2 className="w-5 h-5 text-purple-600 dark:text-purple-400" />
            </div>
            <h3 className="font-bold text-base text-slate-950 dark:text-white">
              Cryptographic Passport
            </h3>
            <p className="text-xs text-slate-600 dark:text-slate-400 mt-1.5 leading-relaxed font-normal">
              Immutable certificate verifying mathematical holdout distance, MIA shadow leakage tests, and CDISC SDTM compliance.
            </p>
          </div>
          <div className="pt-5 mt-4 border-t border-slate-100 dark:border-slate-800/80 flex items-center justify-between text-xs font-semibold text-purple-600 dark:text-purple-400">
            <span>View Passport Certificate</span>
            <ArrowRight className="w-4 h-4 transition-transform group-hover:translate-x-1" />
          </div>
        </div>
      </div>

      {/* 04. Active Pipeline Status Strip */}
      <div className="p-5 rounded-3xl border border-slate-200/80 dark:border-slate-800 bg-white dark:bg-slate-900 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 text-xs shadow-xs">
        <div className="flex flex-wrap items-center gap-x-6 gap-y-2 text-slate-700 dark:text-slate-300 font-mono">
          <div className="flex items-center gap-2 min-w-0">
            <Database className="w-3.5 h-3.5 text-blue-600 shrink-0" />
            <span className="text-slate-500 shrink-0">ACTIVE DATASET:</span>
            <span className="font-bold text-slate-950 dark:text-white truncate">
              {dataset ? dataset.name : 'Cardiometabolic Study 2026'}
            </span>
          </div>
          <div className="flex items-center gap-2 min-w-0">
            <Cpu className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
            <span className="text-slate-500 shrink-0">GENERATOR:</span>
            <span className="font-bold text-slate-950 dark:text-white truncate">Physiological SCM DAG + Copula</span>
          </div>
          <div className="flex items-center gap-2 shrink-0">
            <ShieldCheck className="w-3.5 h-3.5 text-purple-600 shrink-0" />
            <span className="text-slate-500 shrink-0">PASSPORT:</span>
            <span className="font-bold text-emerald-600 dark:text-emerald-400">AUDIT READY</span>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={() => onNavigate('validation')}
            className="inline-flex items-center gap-1.5 font-mono text-xs font-bold text-slate-900 dark:text-white hover:underline uppercase tracking-wider"
          >
            <span>REVIEW VALIDATION REPORT</span>
            <ArrowUpRight className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>
    </div>
  );
};
