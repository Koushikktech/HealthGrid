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
    <div className="bg-white rounded-lg border border-slate-200 p-5">
      <div className="flex flex-wrap items-start justify-between gap-3 pb-4 border-b border-slate-200">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <GitBranch className="w-4 h-4 text-blue-600" />
            <h3 className="text-sm font-bold text-slate-900 uppercase tracking-wider">
              Clinically Seeded Model Structure
            </h3>
            <span className="text-[11px] bg-blue-50 text-blue-700 border border-blue-200 px-2 py-0.5 rounded font-medium">
              Inspectable SCM
            </span>
          </div>
          <p className="text-xs text-slate-600 max-w-2xl leading-relaxed">
            Relationships shown here represent <strong>model assumptions</strong> used for synthetic cohort generation
            and are <strong>not claims of causal discovery</strong>. When cohort parameters are steered beyond sample support,
            physiological values propagate along these pathways rather than blindly repeating training records.
          </p>
        </div>

        <div className="flex items-center gap-2 text-xs">
          <span className="inline-flex items-center gap-1 text-slate-600 bg-slate-50 px-2 py-1 rounded border border-slate-200">
            <span className="w-2 h-2 rounded-full bg-blue-600"></span> Prior-Seeded
          </span>
          <span className="inline-flex items-center gap-1 text-slate-600 bg-slate-50 px-2 py-1 rounded border border-slate-200">
            <span className="w-2 h-2 rounded-full bg-emerald-600"></span> Learned from Sample
          </span>
        </div>
      </div>

      {/* Visual Graph Diagram */}
      <div className="my-5 p-4 bg-slate-50 rounded-lg border border-slate-200 overflow-x-auto">
        <div className="min-w-[620px] relative py-2">
          {/* Node Grid Layout */}
          <div className="grid grid-cols-4 gap-6 items-center">
            {/* Column 1: Roots */}
            <div className="space-y-4">
              <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block mb-1">
                Root Variables
              </span>
              <div className="p-3 bg-white rounded border border-slate-300 shadow-xs">
                <span className="text-xs font-bold text-slate-900">Age</span>
                <p className="text-[10px] text-slate-500">Exogenous root</p>
              </div>
              <div className="p-3 bg-white rounded border border-slate-300 shadow-xs">
                <span className="text-xs font-bold text-slate-900">Sex</span>
                <p className="text-[10px] text-slate-500">Exogenous root</p>
              </div>
              <div className="p-3 bg-white rounded border border-slate-300 shadow-xs">
                <span className="text-xs font-bold text-slate-900">Pain Score</span>
                <p className="text-[10px] text-slate-500">Baseline NRS</p>
              </div>
            </div>

            {/* Column 2: Mediators */}
            <div className="space-y-4">
              <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block mb-1">
                Mediating Variables
              </span>
              <div className="p-3 bg-white rounded border border-blue-200 shadow-xs">
                <span className="text-xs font-bold text-blue-900">Type-2 Diabetes</span>
                <p className="text-[10px] text-slate-500">f(Age, BMI)</p>
              </div>
              <div className="p-3 bg-white rounded border border-blue-200 shadow-xs">
                <span className="text-xs font-bold text-blue-900">BMI</span>
                <p className="text-[10px] text-slate-500">f(Age, Sex)</p>
              </div>
              <div className="p-3 bg-white rounded border border-blue-200 shadow-xs">
                <span className="text-xs font-bold text-blue-900">Physical Activity</span>
                <p className="text-[10px] text-slate-500">f(Pain, Age)</p>
              </div>
            </div>

            {/* Column 3: Longitudinal Process */}
            <div className="space-y-4">
              <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block mb-1">
                Longitudinal Engine
              </span>
              <div className="p-3 bg-white rounded border border-purple-200 shadow-xs">
                <span className="text-xs font-bold text-purple-900">Adherence Markov</span>
                <p className="text-[10px] text-slate-500">Adherent → Lapsing → Drop</p>
              </div>
              <div className="p-3 bg-white rounded border border-purple-200 shadow-xs">
                <span className="text-xs font-bold text-purple-900">MNAR Dropout</span>
                <p className="text-[10px] text-slate-500">f(Pain, SBP severity)</p>
              </div>
            </div>

            {/* Column 4: Endpoint / Target */}
            <div className="space-y-4">
              <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block mb-1">
                Physiological Endpoint
              </span>
              <div className="p-4 bg-slate-900 text-white rounded border border-slate-800 shadow-xs">
                <span className="text-xs font-bold text-emerald-400">Systolic Blood Pressure</span>
                <p className="text-[10px] text-slate-300 mt-1">
                  f(Age, Diabetes, BMI, Activity, Adherence) + Residual Noise
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Inspectable Causal Edges Table */}
      <div className="mt-4">
        <h4 className="text-xs font-bold text-slate-800 mb-2 uppercase tracking-wide">
          Inspectable Mechanism Pathways
        </h4>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-2">
          {EDGES.map((edge, idx) => {
            const isPrior = edge.type === 'prior-seeded';
            return (
              <div
                key={idx}
                onClick={() => setSelectedEdge(edge)}
                className="p-2.5 bg-slate-50 hover:bg-blue-50/50 rounded border border-slate-200 cursor-pointer transition-colors text-xs"
              >
                <div className="flex items-center justify-between mb-1">
                  <span className="font-semibold text-slate-900">
                    {edge.from} → {edge.to}
                  </span>
                  <span
                    className={`text-[10px] px-1.5 py-0.2 rounded border font-medium ${
                      isPrior
                        ? 'bg-blue-50 text-blue-700 border-blue-200'
                        : 'bg-emerald-50 text-emerald-700 border-emerald-200'
                    }`}
                  >
                    {isPrior ? 'Prior-Seeded' : 'Learned'}
                  </span>
                </div>
                <div className="text-[11px] text-slate-600 truncate">{edge.rationale}</div>
              </div>
            );
          })}
        </div>
      </div>

      {selectedEdge && (
        <div className="mt-3 p-3 bg-blue-50/60 rounded border border-blue-200 text-xs flex items-start justify-between gap-2">
          <div>
            <span className="font-bold text-blue-900">
              Selected Mechanism: {selectedEdge.from} → {selectedEdge.to} ({selectedEdge.coefficient})
            </span>
            <p className="text-blue-800 mt-0.5">{selectedEdge.rationale}</p>
          </div>
          <button
            onClick={() => setSelectedEdge(null)}
            className="text-blue-600 hover:text-blue-800 font-medium shrink-0"
          >
            Dismiss
          </button>
        </div>
      )}

      <div className="mt-4 pt-3 border-t border-slate-100 flex items-center justify-between text-xs text-slate-500">
        <span className="flex items-center gap-1.5">
          <Info className="w-3.5 h-3.5 text-slate-400" />
          Pre-seeded from NHANES & AHA cardiometabolic literature; parameters can be inspected or adjusted prior to generation.
        </span>
        <span className="text-slate-700 font-medium">7 Active Causal Edges</span>
      </div>
    </div>
  );
};
