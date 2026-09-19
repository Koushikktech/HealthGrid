import React, { useState } from 'react';
import { GitBranch, Info, Check, ShieldCheck } from 'lucide-react';

interface DAGNode {
  id: string;
  label: string;
  category: 'root' | 'mediator' | 'target' | 'longitudinal';
  description: string;
}

interface DAGEdge {
  from: string;
  to: string;
  type: 'prior-seeded' | 'learned-from-sample';
  coefficient: string;
  rationale: string;
}

const NODES: DAGNode[] = [
  { id: 'age', label: 'Age', category: 'root', description: 'Chronological age (Years)' },
  { id: 'sex', label: 'Sex', category: 'root', description: 'Biological sex distribution' },
  { id: 'bmi', label: 'BMI', category: 'mediator', description: 'Body Mass Index (kg/m²)' },
  { id: 'diabetes', label: 'Type-2 Diabetes', category: 'mediator', description: 'Glycemic diagnosis & resistance' },
  { id: 'activity', label: 'Physical Activity', category: 'mediator', description: 'Weekly active minutes' },
  { id: 'pain', label: 'Pain Score', category: 'mediator', description: 'NRS subjective pain scale' },
  { id: 'adherence', label: 'Adherence', category: 'longitudinal', description: 'Medication compliance Markov state' },
  { id: 'sbp', label: 'Systolic BP', category: 'target', description: 'Clinical endpoint / resting blood pressure' },
];

const EDGES: DAGEdge[] = [
  { from: 'age', to: 'diabetes', type: 'prior-seeded', coefficient: '+0.41', rationale: 'Metabolic incidence increases with age' },
  { from: 'age', to: 'sbp', type: 'learned-from-sample', coefficient: '+0.44', rationale: 'Arterial stiffness baseline drift' },
  { from: 'bmi', to: 'diabetes', type: 'learned-from-sample', coefficient: '+0.35', rationale: 'Adiposity risk on insulin sensitivity' },
  { from: 'diabetes', to: 'sbp', type: 'prior-seeded', coefficient: '+0.46', rationale: 'Vascular endothelial comorbidity (shifts SBP forward)' },
  { from: 'pain', to: 'activity', type: 'prior-seeded', coefficient: '-0.51', rationale: 'Feedback loop: elevated pain suppresses daily activity' },
  { from: 'activity', to: 'sbp', type: 'learned-from-sample', coefficient: '-0.38', rationale: 'Cardiorespiratory fitness lowers resting BP' },
  { from: 'adherence', to: 'sbp', type: 'prior-seeded', coefficient: '-0.31', rationale: 'Pharmacological treatment effect conditional on compliance' },
];

export const CausalDAGView: React.FC = () => {
  const [selectedEdge, setSelectedEdge] = useState<DAGEdge | null>(null);

  return (
    <div className="glass-card rounded-3xl p-6 md:p-7">
      <div className="flex flex-wrap items-start justify-between gap-3 pb-4 border-b border-slate-200/60 dark:border-white/5">
        <div>
          <div className="flex items-center gap-2 mb-1.5">
            <GitBranch className="w-4 h-4 text-blue-600 dark:text-blue-400" />
            <h3 className="text-sm font-bold text-slate-900 dark:text-white uppercase tracking-wider">
              Clinically Seeded Model Structure
            </h3>
            <span className="text-[10px] glass-pill text-blue-600 dark:text-blue-400 border-blue-500/25 px-2 py-0.5 rounded-full font-mono uppercase tracking-wider font-semibold shrink-0 inline-flex items-center justify-center leading-none">
              Inspectable SCM
            </span>
          </div>
          <p className="text-xs text-slate-600 dark:text-slate-300 max-w-2xl leading-relaxed">
            Relationships shown here represent <strong>model assumptions</strong> used for synthetic cohort generation
            and are <strong>not claims of empirical discovery</strong>. When cohort parameters are steered beyond sample support,
            physiological values propagate along these pathways rather than blindly repeating training records.
          </p>
        </div>

        <div className="flex items-center gap-2 text-xs">
          <span className="inline-flex items-center gap-1.5 text-slate-700 dark:text-slate-300 glass-pill px-3 py-1 rounded-full border-slate-200/80 dark:border-white/10 leading-none shrink-0">
            <span className="w-2 h-2 rounded-full bg-blue-600 shadow-xs shadow-blue-500/50"></span> Prior-Seeded
          </span>
          <span className="inline-flex items-center gap-1.5 text-slate-700 dark:text-slate-300 glass-pill px-3 py-1 rounded-full border-slate-200/80 dark:border-white/10 leading-none shrink-0">
            <span className="w-2 h-2 rounded-full bg-emerald-600 shadow-xs shadow-emerald-500/50"></span> Learned from Sample
          </span>
        </div>
      </div>

      {/* Visual Graph Diagram */}
      <div className="my-5 p-5 rounded-2xl bg-slate-50/70 dark:bg-white/[0.02] border border-slate-200/60 dark:border-white/5 overflow-x-auto">
        <div className="min-w-[620px] relative py-2">
          {/* Node Grid Layout */}
          <div className="grid grid-cols-4 gap-6 items-center">
            {/* Column 1: Roots */}
            <div className="space-y-3">
              <span className="text-[10px] font-bold text-slate-600 dark:text-slate-400 uppercase tracking-wider block mb-1">
                Root Variables
              </span>
              <div className="p-3.5 glass-card rounded-2xl border-slate-200/80 dark:border-white/10 shadow-xs">
                <span className="text-xs font-bold text-slate-900 dark:text-white">Age</span>
                <p className="text-[10px] text-slate-600 dark:text-slate-400 mt-0.5 font-medium">Exogenous root</p>
              </div>
              <div className="p-3.5 glass-card rounded-2xl border-slate-200/80 dark:border-white/10 shadow-xs">
                <span className="text-xs font-bold text-slate-900 dark:text-white">Sex</span>
                <p className="text-[10px] text-slate-600 dark:text-slate-400 mt-0.5 font-medium">Exogenous root</p>
              </div>
              <div className="p-3.5 glass-card rounded-2xl border-slate-200/80 dark:border-white/10 shadow-xs">
                <span className="text-xs font-bold text-slate-900 dark:text-white">Pain Score</span>
                <p className="text-[10px] text-slate-600 dark:text-slate-400 mt-0.5 font-medium">Baseline NRS</p>
              </div>
            </div>

            {/* Column 2: Mediators */}
            <div className="space-y-3">
              <span className="text-[10px] font-bold text-slate-600 dark:text-slate-400 uppercase tracking-wider block mb-1">
                Mediating Variables
              </span>
              <div className="p-3.5 glass-card rounded-2xl border-blue-500/25 bg-blue-500/[0.03] shadow-xs">
                <span className="text-xs font-bold text-blue-700 dark:text-blue-300">Type-2 Diabetes</span>
                <p className="text-[10px] text-slate-600 dark:text-slate-400 mt-0.5 font-mono font-medium">f(Age, BMI)</p>
              </div>
              <div className="p-3.5 glass-card rounded-2xl border-blue-500/25 bg-blue-500/[0.03] shadow-xs">
                <span className="text-xs font-bold text-blue-700 dark:text-blue-300">BMI</span>
                <p className="text-[10px] text-slate-600 dark:text-slate-400 mt-0.5 font-mono font-medium">f(Age, Sex)</p>
              </div>
              <div className="p-3.5 glass-card rounded-2xl border-blue-500/25 bg-blue-500/[0.03] shadow-xs">
                <span className="text-xs font-bold text-blue-700 dark:text-blue-300">Physical Activity</span>
                <p className="text-[10px] text-slate-600 dark:text-slate-400 mt-0.5 font-mono font-medium">f(Pain, Age)</p>
              </div>
            </div>

            {/* Column 3: Longitudinal Process */}
            <div className="space-y-3">
              <span className="text-[10px] font-bold text-slate-600 dark:text-slate-400 uppercase tracking-wider block mb-1">
                Longitudinal Engine
              </span>
              <div className="p-3.5 glass-card rounded-2xl border-purple-500/25 bg-purple-500/[0.03] shadow-xs">
                <span className="text-xs font-bold text-purple-700 dark:text-purple-300">Adherence Markov</span>
                <p className="text-[10px] text-slate-600 dark:text-slate-400 mt-0.5 font-medium">Adherent → Lapsing → Drop</p>
              </div>
              <div className="p-3.5 glass-card rounded-2xl border-purple-500/25 bg-purple-500/[0.03] shadow-xs">
                <span className="text-xs font-bold text-purple-700 dark:text-purple-300">MNAR Dropout</span>
                <p className="text-[10px] text-slate-600 dark:text-slate-400 mt-0.5 font-mono font-medium">f(Pain, SBP severity)</p>
              </div>
            </div>

            {/* Column 4: Endpoint / Target */}
            <div className="space-y-3">
              <span className="text-[10px] font-bold text-slate-600 dark:text-slate-400 uppercase tracking-wider block mb-1">
                Physiological Endpoint
              </span>
              <div className="p-4 bg-slate-900 dark:bg-slate-850 text-white rounded-2xl border border-slate-800 dark:border-slate-700 shadow-md shadow-slate-900/20">
                <span className="text-xs font-bold text-emerald-400">Systolic Blood Pressure</span>
                <p className="text-[10px] text-slate-300 mt-1 font-mono leading-relaxed">
                  f(Age, Diabetes, BMI, Activity, Adherence) + ε
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Inspectable Physiological Edges Table */}
      <div className="mt-5">
        <h4 className="text-[11px] font-bold uppercase tracking-wider text-slate-600 dark:text-slate-400 mb-2.5 px-0.5">
          Inspectable Mechanism Pathways
        </h4>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-2.5">
          {EDGES.map((edge, idx) => {
            const isPrior = edge.type === 'prior-seeded';
            const isSelected = selectedEdge === edge;
            return (
              <div
                key={idx}
                onClick={() => setSelectedEdge(edge)}
                className={`p-3 rounded-2xl border cursor-pointer transition-all duration-200 text-xs ${
                  isSelected
                    ? 'border-blue-500 bg-blue-500/10 shadow-xs'
                    : 'glass-card border-slate-200/60 dark:border-white/5 hover:border-blue-500/30'
                }`}
              >
                <div className="flex items-center justify-between mb-1.5">
                  <span className="font-semibold text-slate-900 dark:text-white">
                    {edge.from} → {edge.to}
                  </span>
                  <span
                    className={`text-[10px] px-2 py-0.5 rounded-full border font-semibold shrink-0 inline-flex items-center justify-center leading-none ${
                      isPrior
                        ? 'bg-blue-500/10 text-blue-700 dark:text-blue-300 border-blue-500/20'
                        : 'bg-emerald-500/10 text-emerald-700 dark:text-emerald-300 border-emerald-500/20'
                    }`}
                  >
                    {isPrior ? 'Prior-Seeded' : 'Learned'}
                  </span>
                </div>
                <div className="text-[11px] text-slate-600 dark:text-slate-400 truncate font-medium">{edge.rationale}</div>
              </div>
            );
          })}
        </div>
      </div>

      {selectedEdge && (
        <div className="mt-4 p-4 glass-card rounded-2xl border-blue-500/30 bg-blue-500/5 text-xs flex items-start justify-between gap-3 animate-in fade-in duration-200">
          <div>
            <span className="font-bold text-blue-900 dark:text-blue-200">
              Selected Mechanism: {selectedEdge.from} → {selectedEdge.to} ({selectedEdge.coefficient})
            </span>
            <p className="text-blue-800 dark:text-blue-300 mt-1 leading-relaxed">{selectedEdge.rationale}</p>
          </div>
          <button
            onClick={() => setSelectedEdge(null)}
            className="text-blue-600 dark:text-blue-400 hover:text-blue-800 dark:hover:text-blue-200 font-semibold shrink-0 text-xs px-2.5 py-1 glass-pill rounded-full border-blue-500/20 inline-flex items-center justify-center leading-none"
          >
            Dismiss
          </button>
        </div>
      )}

      <div className="mt-5 pt-3.5 border-t border-slate-200/60 dark:border-white/5 flex flex-wrap items-center justify-between gap-2 text-xs text-slate-600 dark:text-slate-400">
        <span className="flex items-center gap-1.5">
          <Info className="w-3.5 h-3.5 text-slate-500 dark:text-slate-400" />
          Pre-seeded from NHANES &amp; AHA literature; inspect or calibrate prior to cohort generation.
        </span>
        <span className="text-slate-700 dark:text-slate-300 font-mono font-semibold">7 Active Physiological Edges</span>
      </div>
    </div>
  );
};
