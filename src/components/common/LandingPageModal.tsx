import React from 'react';
import { X, ArrowRight, ShieldCheck, Activity, Database, CheckCircle, Sliders, FileText } from 'lucide-react';

interface LandingPageModalProps {
  isOpen: boolean;
  onClose: () => void;
  onStartCohort: () => void;
  onExploreWorkflow: () => void;
}

export const LandingPageModal: React.FC<LandingPageModalProps> = ({
  isOpen,
  onClose,
  onStartCohort,
  onExploreWorkflow,
}) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/40 backdrop-blur-md animate-in fade-in duration-300">
      <div className="glass-sheet rounded-3xl max-w-4xl w-full max-h-[90vh] flex flex-col shadow-2xl overflow-hidden border border-white/60 dark:border-white/10 scale-in-95 duration-200">
        {/* Header bar */}
        <div className="px-6 py-4 border-b border-slate-200/60 dark:border-white/5 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-7 h-7 rounded-xl bg-slate-900 dark:bg-white flex items-center justify-center p-1 text-white dark:text-slate-900 shadow-xs">
              <svg viewBox="0 0 32 32" className="w-full h-full" fill="none">
                <circle cx="10" cy="10" r="3" fill="#38bdf8" />
                <circle cx="22" cy="10" r="3" fill="#0ea5e9" />
                <circle cx="10" cy="22" r="3" fill="#0284c7" />
                <circle cx="22" cy="22" r="3" fill="#2563eb" />
                <circle cx="16" cy="16" r="3" fill="#10b981" />
              </svg>
            </div>
            <span className="font-bold text-slate-900 dark:text-white text-sm tracking-tight">HealthGrid Clinical Platform</span>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 glass-pill rounded-full text-slate-400 hover:text-slate-700 dark:hover:text-white transition-all active:scale-90"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Scrollable Content */}
        <div className="p-8 md:p-10 overflow-y-auto space-y-10">
          {/* Hero Section */}
          <div className="max-w-2xl relative">
            <div className="inline-flex items-center gap-2 text-[11px] font-semibold text-blue-600 dark:text-blue-400 glass-pill border-blue-500/20 px-3 py-1 rounded-full mb-3.5 leading-none shrink-0">
              <Activity className="w-3.5 h-3.5" />
              <span>Clinical Research Data Engine</span>
            </div>
            <h1 className="text-3xl md:text-4xl font-extrabold text-slate-900 dark:text-white tracking-tight leading-tight">
              HealthGrid
            </h1>
            <p className="text-lg font-semibold text-slate-700 dark:text-slate-300 mt-1.5 tracking-tight">
              Generate synthetic cohorts. Validate before you deploy.
            </p>
            <p className="text-xs md:text-sm text-slate-600 dark:text-slate-400 mt-3 leading-relaxed font-normal">
              HealthGrid empowers clinical researchers and digital health teams to formulate customizable synthetic cohorts
              from patient microdata and rigorously audit empirical evidence across Kolmogorov-Smirnov fidelity, TSTR predictive utility,
              longitudinal temporal trajectories, and adversarial membership inference risk.
            </p>

            <div className="flex flex-wrap items-center gap-3 mt-6">
              <button
                onClick={() => {
                  onClose();
                  onStartCohort();
                }}
                className="px-5 py-2.5 bg-blue-600 hover:bg-blue-500 text-white rounded-full text-xs font-semibold inline-flex items-center justify-center gap-2 leading-none shrink-0 transition-all duration-200 shadow-md shadow-blue-500/25 hover:shadow-lg hover:shadow-blue-500/35 active:scale-98"
              >
                <span>Create a Cohort</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </button>
              <button
                onClick={() => {
                  onClose();
                  onExploreWorkflow();
                }}
                className="px-5 py-2.5 glass-pill hover:bg-white/80 dark:hover:bg-white/10 text-slate-700 dark:text-slate-200 rounded-full text-xs font-semibold inline-flex items-center justify-center leading-none shrink-0 transition-all duration-200 active:scale-98"
              >
                Explore Workflow &amp; Validation
              </button>
            </div>
          </div>

          {/* 6-Step Workflow */}
          <div>
            <div className="text-[11px] font-bold text-slate-600 dark:text-slate-400 uppercase tracking-wider mb-4 px-0.5">
              How It Works — The 6-Stage Evidence Loop
            </div>
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-3">
              {[
                { step: '01', title: 'Upload', desc: 'Import CSV clinical sample (N=200–5,000)' },
                { step: '02', title: 'Profile', desc: 'Inspect schema, missingness & correlations' },
                { step: '03', title: 'Design', desc: 'Tune prevalence & evaluate extrapolation' },
                { step: '04', title: 'Generate', desc: 'SCM structural propagation & longitudinal visit engine' },
                { step: '05', title: 'Validate', desc: 'Holdout KS, TSTR AUROC & adversarial MIA attack' },
                { step: '06', title: 'Approve', desc: 'Signed Cohort Passport for declared purpose' },
              ].map((item) => (
                <div key={item.step} className="p-4 glass-card rounded-2xl border-slate-200/60 dark:border-white/5 text-left hover:border-blue-500/30 transition-all duration-200">
                  <span className="text-xs font-mono font-bold text-blue-600 dark:text-blue-400 block mb-1">{item.step}</span>
                  <div className="text-xs font-bold text-slate-900 dark:text-white mb-1">{item.title}</div>
                  <p className="text-[11px] text-slate-600 dark:text-slate-300 leading-normal font-normal">{item.desc}</p>
                </div>
              ))}
            </div>
          </div>

          {/* Why HealthGrid Pillars */}
          <div className="pt-4 border-t border-slate-200/60 dark:border-white/5">
            <div className="text-[11px] font-bold text-slate-600 dark:text-slate-400 uppercase tracking-wider mb-4 px-0.5">
              Why HealthGrid?
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              <div className="p-4.5 glass-card rounded-2xl border-slate-200/60 dark:border-white/5">
                <div className="text-xs font-bold text-slate-900 dark:text-white mb-1.5 flex items-center gap-2">
                  <CheckCircle className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
                  <span>Evidence-Driven</span>
                </div>
                <p className="text-xs text-slate-600 dark:text-slate-300 leading-relaxed font-normal">
                  Validation is never circular. Metrics are evaluated against held-out real patient test splits never seen by the generator.
                </p>
              </div>

              <div className="p-4.5 glass-card rounded-2xl border-slate-200/60 dark:border-white/5">
                <div className="text-xs font-bold text-slate-900 dark:text-white mb-1.5 flex items-center gap-2">
                  <Sliders className="w-4 h-4 text-blue-600 dark:text-blue-400" />
                  <span>Purpose-Specific</span>
                </div>
                <p className="text-xs text-slate-600 dark:text-slate-300 leading-relaxed font-normal">
                  There is no single "realism score". Cohort suitability is certified against declared intended uses: Software QA, ML Dev, or Publication.
                </p>
              </div>

              <div className="p-4.5 glass-card rounded-2xl border-slate-200/60 dark:border-white/5">
                <div className="text-xs font-bold text-slate-900 dark:text-white mb-1.5 flex items-center gap-2">
                  <ShieldCheck className="w-4 h-4 text-purple-600 dark:text-purple-400" />
                  <span>Privacy-Aware</span>
                </div>
                <p className="text-xs text-slate-600 dark:text-slate-300 leading-relaxed font-normal">
                  Evaluates real shadow-model Membership Inference Attacks (MIA) and quarantines near-duplicate records instead of relying on discredited proxies.
                </p>
              </div>

              <div className="p-4.5 glass-card rounded-2xl border-slate-200/60 dark:border-white/5">
                <div className="text-xs font-bold text-slate-900 dark:text-white mb-1.5 flex items-center gap-2">
                  <Activity className="w-4 h-4 text-slate-700 dark:text-slate-300" />
                  <span>Honest Extrapolation</span>
                </div>
                <p className="text-xs text-slate-600 dark:text-slate-300 leading-relaxed font-normal">
                  When user cohorts shift outside observed sample density, the Extrapolation Meter transparently reports assumption risk.
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="px-6 py-4 border-t border-slate-200/60 dark:border-white/5 flex items-center justify-between text-xs text-slate-600 dark:text-slate-400 font-medium">
          <span>HealthGrid Platform Architecture — Precision Medical AI</span>
          <button
            onClick={onClose}
            className="font-semibold text-slate-800 dark:text-slate-200 hover:text-blue-600 dark:hover:text-blue-400 transition-colors"
          >
            Enter Workspace →
          </button>
        </div>
      </div>
    </div>
  );
};
