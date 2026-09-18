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
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-xs">
      <div className="bg-white rounded-lg border border-slate-300 max-w-4xl w-full max-h-[92vh] flex flex-col shadow-2xl overflow-hidden">
        {/* Header bar */}
        <div className="px-6 py-4 border-b border-slate-200 flex items-center justify-between bg-slate-50">
          <div className="flex items-center gap-2.5">
            <div className="w-6 h-6 rounded bg-slate-900 flex items-center justify-center p-1">
              <svg viewBox="0 0 32 32" className="w-full h-full" fill="none">
                <circle cx="10" cy="10" r="3" fill="#38bdf8" />
                <circle cx="22" cy="10" r="3" fill="#0ea5e9" />
                <circle cx="10" cy="22" r="3" fill="#0284c7" />
                <circle cx="22" cy="22" r="3" fill="#2563eb" />
                <circle cx="16" cy="16" r="3" fill="#10b981" />
              </svg>
            </div>
            <span className="font-bold text-slate-900 text-sm tracking-tight">HealthGrid Clinical Platform</span>
          </div>
          <button
            onClick={onClose}
            className="text-slate-400 hover:text-slate-700 p-1 rounded hover:bg-slate-200/50 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Scrollable Content */}
        <div className="p-8 overflow-y-auto space-y-10">
          {/* Hero Section */}
          <div className="max-w-2xl">
            <div className="inline-block text-[11px] font-semibold text-blue-800 bg-blue-50 border border-blue-200 px-2.5 py-1 rounded mb-3">
              Clinical Research Data Software
            </div>
            <h1 className="text-3xl font-extrabold text-slate-900 tracking-tight leading-tight">
              HealthGrid
            </h1>
            <p className="text-lg font-medium text-slate-700 mt-1">
              Generate synthetic cohorts. Validate before you use them.
            </p>
            <p className="text-sm text-slate-600 mt-3 leading-relaxed">
              HealthGrid helps clinical researchers and digital health teams create customizable synthetic healthcare cohorts
              from small datasets and rigorously evaluate statistical fidelity, downstream predictive utility, longitudinal temporal
              behavior, and empirical privacy risk before deployment.
            </p>

            <div className="flex flex-wrap items-center gap-3 mt-6">
              <button
                onClick={() => {
                  onClose();
                  onStartCohort();
                }}
                className="px-4 py-2.5 bg-blue-600 hover:bg-blue-700 text-white rounded text-xs font-semibold flex items-center gap-2 transition-colors shadow-xs"
              >
                <span>Create a Cohort</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </button>
              <button
                onClick={() => {
                  onClose();
                  onExploreWorkflow();
                }}
                className="px-4 py-2.5 bg-white hover:bg-slate-50 text-slate-700 border border-slate-300 rounded text-xs font-semibold transition-colors"
              >
                Explore Workflow & Validation
              </button>
            </div>
          </div>

          {/* 6-Step Workflow */}
          <div>
            <div className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-4">
              How It Works — The 6-Stage Evidence Loop
            </div>
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-3">
              {[
                { step: '01', title: 'Upload', desc: 'Import CSV clinical sample (N=200–5,000)' },
                { step: '02', title: 'Profile', desc: 'Inspect schema, missingness & correlations' },
                { step: '03', title: 'Design', desc: 'Tune prevalence & evaluate extrapolation' },
                { step: '04', title: 'Generate', desc: 'SCM causal propagation & longitudinal visit engine' },
                { step: '05', title: 'Validate', desc: 'Holdout KS, TSTR AUROC & adversarial MIA attack' },
                { step: '06', title: 'Approve', desc: 'Signed Cohort Passport for declared purpose' },
              ].map((item) => (
                <div key={item.step} className="p-3.5 bg-slate-50 border border-slate-200 rounded text-left">
                  <span className="text-xs font-mono font-bold text-blue-600 block mb-1">{item.step}</span>
                  <div className="text-xs font-bold text-slate-900 mb-1">{item.title}</div>
                  <p className="text-[11px] text-slate-600 leading-normal">{item.desc}</p>
                </div>
              ))}
            </div>
          </div>

          {/* Why HealthGrid Pillars */}
          <div className="pt-4 border-t border-slate-200">
            <div className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-4">
              Why HealthGrid?
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              <div className="p-4 border border-slate-200 rounded bg-white">
                <div className="text-xs font-bold text-slate-900 mb-1.5 flex items-center gap-1.5">
                  <CheckCircle className="w-4 h-4 text-emerald-600" />
                  Evidence-Driven
                </div>
                <p className="text-xs text-slate-600 leading-relaxed">
                  Validation is never circular. Metrics are evaluated against held-out real patient test splits never seen by the generator.
                </p>
              </div>

              <div className="p-4 border border-slate-200 rounded bg-white">
                <div className="text-xs font-bold text-slate-900 mb-1.5 flex items-center gap-1.5">
                  <Sliders className="w-4 h-4 text-blue-600" />
                  Purpose-Specific
                </div>
                <p className="text-xs text-slate-600 leading-relaxed">
                  There is no single "realism score". Cohort suitability is certified against declared intended uses: Software QA, ML Dev, or Publication.
                </p>
              </div>

              <div className="p-4 border border-slate-200 rounded bg-white">
                <div className="text-xs font-bold text-slate-900 mb-1.5 flex items-center gap-1.5">
                  <ShieldCheck className="w-4 h-4 text-purple-600" />
                  Privacy-Aware
                </div>
                <p className="text-xs text-slate-600 leading-relaxed">
                  Evaluates real shadow-model Membership Inference Attacks (MIA) and quarantines near-duplicate records instead of relying on discredited proxies.
                </p>
              </div>

              <div className="p-4 border border-slate-200 rounded bg-white">
                <div className="text-xs font-bold text-slate-900 mb-1.5 flex items-center gap-1.5">
                  <Activity className="w-4 h-4 text-slate-700" />
                  Honest Extrapolation
                </div>
                <p className="text-xs text-slate-600 leading-relaxed">
                  When user cohorts shift outside observed sample density, the Extrapolation Meter transparently reports assumption risk.
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="px-6 py-3.5 bg-slate-50 border-t border-slate-200 flex items-center justify-between text-xs text-slate-500">
          <span>HealthGrid Platform Architecture — Light Mode Enterprise Suite</span>
          <button
            onClick={onClose}
            className="font-medium text-slate-700 hover:text-slate-900"
          >
            Enter Workspace
          </button>
        </div>
      </div>
    </div>
  );
};
