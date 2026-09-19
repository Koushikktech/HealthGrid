import React, { useState, useMemo } from 'react';
import { CohortConfiguration, DatasetSummary } from '../../types';
import { ExtrapolationMeter } from '../common/ExtrapolationMeter';
import { CausalDAGView } from '../common/CausalDAGView';
import { generationService } from '../../services/api/generationService';
import {
  Sliders,
  Play,
  Info,
  ShieldCheck,
  AlertTriangle,
  GitBranch,
  Activity,
  Layers
} from 'lucide-react';

interface CohortBuilderPageProps {
  dataset: DatasetSummary;
  onStartRun: (config: CohortConfiguration) => void;
}

export const CohortBuilderPage: React.FC<CohortBuilderPageProps> = ({
  dataset,
  onStartRun,
}) => {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [config, setConfig] = useState<CohortConfiguration>({
    targetPatients: 5000,
    minAge: 18,
    maxAge: 89,
    diabetesPct: 60,
    hypertensionEnabled: dataset.supportsHypertension !== false,
    hypertensionPct: 70,
    malePct: 50,
    femalePct: 50,
    adherencePct: 75,
    activityLevel: 'Moderate',
    studyDurationWeeks: 12,
    treatmentStatus: 'All',
    modelType: 'causal_generator',
  });

  // Calculate live extrapolation assessment based on active slider positions
  const assessment = useMemo(() => {
    return generationService.calculateExtrapolation(config);
  }, [config]);

  const updateConfig = <K extends keyof CohortConfiguration>(key: K, val: CohortConfiguration[K]) => {
    setConfig((prev) => ({ ...prev, [key]: val }));
  };

  const handleSexChange = (male: number) => {
    setConfig((prev) => ({
      ...prev,
      malePct: male,
      femalePct: 100 - male,
    }));
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-300">
      {/* Header */}
      <div className="flex flex-wrap items-center justify-between gap-4 pb-5 border-b border-slate-200/80 dark:border-slate-800">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-slate-900 dark:text-white">Cohort Builder</h1>
          <p className="text-xs text-slate-600 dark:text-slate-400 mt-1 font-medium">
            Define target population envelopes and physiological generation parameters.
          </p>
        </div>
        <div className="flex items-center gap-2">
          <span className="text-xs text-slate-600 dark:text-slate-400 font-medium">Source Dataset:</span>
          <span className="text-xs font-bold text-slate-900 dark:text-slate-100 glass-pill px-3 py-1.5 rounded-xl border-slate-200/80 dark:border-slate-700 shadow-2xs shrink-0 inline-flex items-center gap-1.5 leading-none">
            {dataset.name} <span className="text-slate-500 dark:text-slate-400 font-mono text-xs">(N={dataset.patientCount.toLocaleString()})</span>
          </span>
        </div>
      </div>

      {/* Main Grid: Left Controls, Right Live Summary & Extrapolation */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* LEFT PANE: Configuration Controls (5 cols) */}
        <div className="lg:col-span-5 space-y-5">
          <div className="glass-card rounded-3xl p-6 md:p-7 space-y-6">
            <div className="flex items-center justify-between pb-3.5 border-b border-slate-200/80 dark:border-slate-800">
              <span className="text-xs font-bold text-slate-900 dark:text-white uppercase tracking-wider flex items-center gap-2">
                <Sliders className="w-3.5 h-3.5 text-blue-600 dark:text-blue-400" />
                <span>Target Parameters</span>
              </span>
              <button
                type="button"
                onClick={() =>
                  setConfig({
                    targetPatients: 5000,
                    minAge: 18,
                    maxAge: 89,
                    diabetesPct: 60,
                    hypertensionEnabled: dataset.supportsHypertension !== false,
                    hypertensionPct: 70,
                    malePct: 50,
                    femalePct: 50,
                    adherencePct: 75,
                    activityLevel: 'Moderate',
                    studyDurationWeeks: 12,
                    treatmentStatus: 'All',
                    modelType: 'causal_generator',
                  })
                }
                className="text-xs text-blue-600 dark:text-blue-400 hover:text-blue-700 dark:hover:text-blue-300 font-bold transition-colors"
              >
                Reset Defaults
              </button>
            </div>

            {/* Target Patients */}
            <div className="space-y-1.5">
              <div className="flex justify-between items-center text-xs">
                <label className="font-semibold text-slate-900 dark:text-slate-100">Target Patients</label>
                <span className="font-mono font-bold text-blue-600 dark:text-blue-400 glass-pill px-2.5 py-0.5 rounded-lg text-xs border-blue-500/20 shrink-0 inline-flex items-center justify-center leading-none">
                  {config.targetPatients.toLocaleString()} patients
                </span>
              </div>
              <input
                type="range"
                min="500"
                max="25000"
                step="500"
                value={config.targetPatients}
                onChange={(e) => updateConfig('targetPatients', Number(e.target.value))}
                className="w-full h-1.5 bg-slate-200 dark:bg-slate-700 rounded-lg appearance-none cursor-pointer accent-blue-600"
              />
              <div className="flex justify-between text-xs text-slate-600 dark:text-slate-400 font-mono mt-0.5 px-0.5">
                <span>500</span>
                <span className="font-semibold text-slate-700 dark:text-slate-300">Source: 1,314</span>
                <span>25,000</span>
              </div>
            </div>

            {/* Diabetes Prevalence Slider */}
            <div className="space-y-1.5">
              <div className="flex justify-between items-center text-xs">
                <div>
                  <label className="font-semibold text-slate-900 dark:text-slate-100">Type-2 Diabetes Prevalence</label>
                  <span className="text-xs text-slate-600 dark:text-slate-400 font-medium block mt-0.5">Source sample baseline: 8.0%</span>
                </div>
                <span className="font-mono font-bold text-blue-600 dark:text-blue-400 glass-pill px-2.5 py-0.5 rounded-lg text-xs border-blue-500/20 shrink-0 inline-flex items-center justify-center leading-none">
                  {config.diabetesPct}%
                </span>
              </div>
              <input
                type="range"
                min="0"
                max="90"
                step="5"
                value={config.diabetesPct}
                onChange={(e) => updateConfig('diabetesPct', Number(e.target.value))}
                className="w-full h-1.5 bg-slate-200 dark:bg-slate-700 rounded-lg appearance-none cursor-pointer accent-blue-600"
              />
              {config.diabetesPct > 30 && (
                <div className="mt-1.5 flex items-center gap-1.5 text-xs text-amber-800 dark:text-amber-300 glass-card bg-amber-500/10 p-2.5 rounded-xl border-amber-300/60 font-medium">
                  <AlertTriangle className="w-4 h-4 shrink-0 text-amber-600 dark:text-amber-400" />
                  <span>Covariate shift: 7.5x higher than observed source sample</span>
                </div>
              )}
            </div>

            {/* Hypertension Prevalence Slider */}
            {config.hypertensionEnabled && <div className="space-y-1.5">
              <div className="flex justify-between items-center text-xs">
                <div>
                  <label className="font-semibold text-slate-900 dark:text-slate-100">Hypertension Prevalence</label>
                  <span className="text-xs text-slate-600 dark:text-slate-400 font-medium block mt-0.5">Source baseline: 34.6%</span>
                </div>
                <span className="font-mono font-bold text-slate-800 dark:text-slate-200 glass-pill px-2.5 py-0.5 rounded-lg text-xs shrink-0 inline-flex items-center justify-center leading-none">
                  {config.hypertensionPct}%
                </span>
              </div>
              <input
                type="range"
                min="10"
                max="95"
                step="5"
                value={config.hypertensionPct}
                onChange={(e) => updateConfig('hypertensionPct', Number(e.target.value))}
                className="w-full h-1.5 bg-slate-200 dark:bg-slate-700 rounded-lg appearance-none cursor-pointer accent-blue-600"
              />
            </div>}

            {/* Age Range */}
            <div className="space-y-2">
              <div className="flex justify-between items-center text-xs">
                <label className="font-semibold text-slate-900 dark:text-slate-100">Age Envelope</label>
                <span className="font-mono text-slate-700 dark:text-slate-300 text-xs font-semibold">
                  {config.minAge} – {config.maxAge} years
                </span>
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <span className="text-xs text-slate-600 dark:text-slate-400 block mb-1 font-semibold">Min Age</span>
                  <input
                    type="number"
                    min="18"
                    max="65"
                    value={config.minAge}
                    onChange={(e) => updateConfig('minAge', Number(e.target.value))}
                    className="w-full px-3 py-2 text-xs rounded-xl border border-slate-300 dark:border-white/15 bg-white/70 dark:bg-slate-900/70 text-slate-900 dark:text-white outline-none focus:ring-2 focus:ring-blue-500/30 transition-all font-mono font-medium"
                  />
                </div>
                <div>
                  <span className="text-xs text-slate-600 dark:text-slate-400 block mb-1 font-semibold">Max Age</span>
                  <input
                    type="number"
                    min="50"
                    max="95"
                    value={config.maxAge}
                    onChange={(e) => updateConfig('maxAge', Number(e.target.value))}
                    className="w-full px-3 py-2 text-xs rounded-xl border border-slate-300 dark:border-white/15 bg-white/70 dark:bg-slate-900/70 text-slate-900 dark:text-white outline-none focus:ring-2 focus:ring-blue-500/30 transition-all font-mono font-medium"
                  />
                </div>
              </div>
            </div>

            {/* Sex Ratio */}
            <div className="space-y-1.5">
              <div className="flex justify-between items-center text-xs">
                <label className="font-semibold text-slate-900 dark:text-slate-100">Sex Distribution</label>
                <span className="font-mono text-xs text-slate-700 dark:text-slate-300 font-semibold">
                  {config.femalePct}% F / {config.malePct}% M
                </span>
              </div>
              <input
                type="range"
                min="20"
                max="80"
                step="5"
                value={config.malePct}
                onChange={(e) => handleSexChange(Number(e.target.value))}
                className="w-full h-1.5 bg-slate-200 dark:bg-slate-700 rounded-lg appearance-none cursor-pointer accent-blue-600"
              />
            </div>

            {/* Medication Adherence */}
            <div className="space-y-1.5">
              <div className="flex justify-between items-center text-xs">
                <div>
                  <label className="font-semibold text-slate-900 dark:text-slate-100">Medication Adherence Target</label>
                  <span className="text-xs text-slate-600 dark:text-slate-400 block mt-0.5 font-medium">Baseline mean compliance: 74.6%</span>
                </div>
                <span className="font-mono font-bold text-slate-800 dark:text-slate-200 glass-pill px-2.5 py-0.5 rounded-lg text-xs shrink-0 inline-flex items-center justify-center leading-none">
                  {config.adherencePct}%
                </span>
              </div>
              <input
                type="range"
                min="30"
                max="95"
                step="5"
                value={config.adherencePct}
                onChange={(e) => updateConfig('adherencePct', Number(e.target.value))}
                className="w-full h-1.5 bg-slate-200 dark:bg-slate-700 rounded-lg appearance-none cursor-pointer accent-blue-600"
              />
            </div>

            {/* Activity Level & Duration */}
            <div className="grid grid-cols-2 gap-3 pt-1">
              <div>
                <label className="text-xs font-semibold text-slate-900 dark:text-slate-100 block mb-1.5">Activity Level</label>
                <select
                  value={config.activityLevel}
                  onChange={(e) => updateConfig('activityLevel', e.target.value as any)}
                  className="w-full px-3 py-2 text-xs rounded-xl border border-slate-300 dark:border-white/15 bg-white/70 dark:bg-slate-900/70 text-slate-900 dark:text-white outline-none focus:ring-2 focus:ring-blue-500/30 transition-all cursor-pointer font-medium"
                >
                  <option value="Low">Low (&lt;60 min/wk)</option>
                  <option value="Moderate">Moderate (60-180m)</option>
                  <option value="High">High (&gt;180m/wk)</option>
                </select>
              </div>
              <div>
                <label className="text-xs font-semibold text-slate-900 dark:text-slate-100 block mb-1.5">Study Duration</label>
                <select
                  value={config.studyDurationWeeks}
                  onChange={(e) => updateConfig('studyDurationWeeks', Number(e.target.value))}
                  className="w-full px-3 py-2 text-xs rounded-xl border border-slate-300 dark:border-white/15 bg-white/70 dark:bg-slate-900/70 text-slate-900 dark:text-white outline-none focus:ring-2 focus:ring-blue-500/30 transition-all cursor-pointer font-medium"
                >
                  <option value={8}>8 Weeks</option>
                  <option value={12}>12 Weeks (Standard)</option>
                  <option value={24}>24 Weeks</option>
                </select>
              </div>
            </div>

            {/* Generation Model Selection */}
            <div className="pt-3 border-t border-slate-200/80 dark:border-slate-800">
              <label className="text-xs font-bold uppercase tracking-wider text-slate-600 dark:text-slate-400 block mb-3">
                Generation Model
              </label>
              <div className="space-y-3">
                <label
                  className={`flex items-start gap-3.5 p-3.5 rounded-2xl border cursor-pointer transition-all duration-200 ${
                    config.modelType === 'causal_generator'
                      ? 'border-blue-500/60 bg-blue-500/10 shadow-xs shadow-blue-500/10'
                      : 'border-slate-200 dark:border-slate-800 hover:bg-black/[0.02] dark:hover:bg-white/[0.02]'
                  }`}
                >
                  <input
                    type="radio"
                    name="modelType"
                    checked={config.modelType === 'causal_generator'}
                    onChange={() => updateConfig('modelType', 'causal_generator')}
                    className="mt-0.5 accent-blue-600"
                  />
                  <div>
                    <div className="text-xs font-bold text-slate-950 dark:text-white flex items-center gap-2">
                      <span>HealthGrid SCM / Conditional Generator</span>
                      <span className="text-[10px] glass-pill border-blue-500/30 text-blue-700 dark:text-blue-300 px-2.5 py-0.5 rounded-full font-bold shrink-0 inline-flex items-center justify-center leading-none">
                        Recommended
                      </span>
                    </div>
                    <p className="text-xs text-slate-700 dark:text-slate-300 mt-1 leading-relaxed">
                      Propagates requests through clinically seeded SCM. Shifting diabetes to 60% realistically elevates
                      downstream blood pressure without repeating training patients.
                    </p>
                  </div>
                </label>

                <label
                  className={`flex items-start gap-3.5 p-3.5 rounded-2xl border cursor-pointer transition-all duration-200 ${
                    config.modelType === 'gaussian_copula_baseline'
                      ? 'border-amber-500/60 bg-amber-500/10 shadow-xs'
                      : 'border-slate-200 dark:border-slate-800 hover:bg-black/[0.02] dark:hover:bg-white/[0.02]'
                  }`}
                >
                  <input
                    type="radio"
                    name="modelType"
                    checked={config.modelType === 'gaussian_copula_baseline'}
                    onChange={() => updateConfig('modelType', 'gaussian_copula_baseline')}
                    className="mt-0.5 accent-amber-600"
                  />
                  <div>
                    <div className="text-xs font-bold text-slate-950 dark:text-white">
                      Gaussian Copula Baseline (Resampling Comparator)
                    </div>
                    <p className="text-xs text-slate-600 dark:text-slate-400 mt-1 leading-relaxed">
                      Standard library approach. Resamples observed diabetic rows; will freeze correlation matrices and
                      create near-duplicate clusters.
                    </p>
                  </div>
                </label>
              </div>
            </div>

            {/* Launch Action */}
            <div className="pt-2">
              <button
                type="button"
                disabled={isSubmitting}
                onClick={async () => {
                  setIsSubmitting(true);
                  try {
                    await onStartRun(config);
                  } finally {
                    setIsSubmitting(false);
                  }
                }}
                className="w-full py-3 px-5 bg-blue-600 hover:bg-blue-500 disabled:bg-blue-400 text-white rounded-xl text-xs font-semibold inline-flex items-center justify-center gap-2 leading-none transition-all duration-200 shadow-md shadow-blue-500/25 hover:shadow-lg hover:shadow-blue-500/35 active:scale-98"
              >
                {isSubmitting ? (
                  <>
                    <span className="w-3.5 h-3.5 border-2 border-white border-t-transparent rounded-full animate-spin"></span>
                    <span>Queuing Generation Pipeline...</span>
                  </>
                ) : (
                  <>
                    <Play className="w-3.5 h-3.5 fill-current" />
                    <span>Generate Synthetic Cohort ({config.targetPatients.toLocaleString()} Patients)</span>
                  </>
                )}
              </button>
            </div>
          </div>
        </div>

        {/* RIGHT PANE: Live Extrapolation Assessment & Physiological DAG (7 cols) */}
        <div className="lg:col-span-7 space-y-6">
          {/* Live Extrapolation Meter */}
          <ExtrapolationMeter assessment={assessment} />

          {/* Clinically Seeded Model DAG */}
          <CausalDAGView />
        </div>
      </div>
    </div>
  );
};
