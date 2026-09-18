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
  const [config, setConfig] = useState<CohortConfiguration>({
    targetPatients: 5000,
    minAge: 18,
    maxAge: 89,
    diabetesPct: 60,
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
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-wrap items-center justify-between gap-4 pb-4 border-b border-slate-200">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-slate-900">Cohort Builder</h1>
          <p className="text-xs text-slate-500 mt-1">
            Define the target population and generation parameters for HealthGrid to synthesize.
          </p>
        </div>
        <div className="flex items-center gap-2">
          <span className="text-xs text-slate-500 font-medium">Source Dataset:</span>
          <span className="text-xs font-semibold text-slate-800 bg-slate-100 px-2 py-1 rounded">
            {dataset.name} (N={dataset.patientCount})
          </span>
        </div>
      </div>

      {/* Main Grid: Left Controls, Right Live Summary & Extrapolation */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* LEFT PANE: Configuration Controls (5 cols) */}
        <div className="lg:col-span-5 space-y-5">
          <div className="bg-white rounded-lg border border-slate-200 p-5 space-y-5">
            <div className="flex items-center justify-between pb-3 border-b border-slate-200">
              <span className="text-xs font-bold text-slate-900 uppercase tracking-wider flex items-center gap-1.5">
                <Sliders className="w-3.5 h-3.5 text-blue-600" />
                Target Population Parameters
              </span>
              <button
                type="button"
                onClick={() =>
                  setConfig({
                    targetPatients: 5000,
                    minAge: 18,
                    maxAge: 89,
                    diabetesPct: 60,
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
                className="text-[11px] text-blue-600 hover:text-blue-800 font-medium"
              >
                Reset Defaults
              </button>
            </div>

            {/* Target Patients */}
            <div>
              <div className="flex justify-between items-center text-xs mb-1.5">
                <label className="font-semibold text-slate-700">Target Patients</label>
                <span className="font-mono font-bold text-blue-700 bg-blue-50 px-2 py-0.5 rounded border border-blue-200 text-xs">
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
                className="w-full accent-blue-600 cursor-pointer"
              />
              <div className="flex justify-between text-[10px] text-slate-400 font-mono mt-0.5">
                <span>500</span>
                <span>Source: 1,314</span>
                <span>25,000</span>
              </div>
            </div>

            {/* Diabetes Prevalence Slider */}
            <div>
              <div className="flex justify-between items-center text-xs mb-1.5">
                <div>
                  <label className="font-semibold text-slate-700">Type-2 Diabetes Prevalence</label>
                  <span className="text-[10px] text-slate-400 block">Source sample baseline: 8.0%</span>
                </div>
                <span className="font-mono font-bold text-blue-700 bg-blue-50 px-2 py-0.5 rounded border border-blue-200 text-xs">
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
                className="w-full accent-blue-600 cursor-pointer"
              />
              {config.diabetesPct > 30 && (
                <div className="mt-1 flex items-center gap-1 text-[11px] text-amber-700">
                  <AlertTriangle className="w-3 h-3 shrink-0" />
                  <span>Covariate shift: 7.5x higher than observed source sample</span>
                </div>
              )}
            </div>

            {/* Hypertension Prevalence Slider */}
            <div>
              <div className="flex justify-between items-center text-xs mb-1.5">
                <div>
                  <label className="font-semibold text-slate-700">Hypertension Prevalence</label>
                  <span className="text-[10px] text-slate-400 block">Source baseline: 34.6%</span>
                </div>
                <span className="font-mono font-bold text-slate-800 bg-slate-100 px-2 py-0.5 rounded text-xs">
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
                className="w-full accent-blue-600 cursor-pointer"
              />
            </div>

            {/* Age Range */}
            <div>
              <div className="flex justify-between items-center text-xs mb-1.5">
                <label className="font-semibold text-slate-700">Age Envelope</label>
                <span className="font-mono text-slate-700 text-xs">
                  {config.minAge} – {config.maxAge} years
                </span>
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <span className="text-[10px] text-slate-400 block mb-1">Min Age</span>
                  <input
                    type="number"
                    min="18"
                    max="65"
                    value={config.minAge}
                    onChange={(e) => updateConfig('minAge', Number(e.target.value))}
                    className="w-full px-2.5 py-1.5 text-xs border border-slate-300 rounded bg-white"
                  />
                </div>
                <div>
                  <span className="text-[10px] text-slate-400 block mb-1">Max Age</span>
                  <input
                    type="number"
                    min="50"
                    max="95"
                    value={config.maxAge}
                    onChange={(e) => updateConfig('maxAge', Number(e.target.value))}
                    className="w-full px-2.5 py-1.5 text-xs border border-slate-300 rounded bg-white"
                  />
                </div>
              </div>
            </div>

            {/* Sex Ratio */}
            <div>
              <div className="flex justify-between items-center text-xs mb-1.5">
                <label className="font-semibold text-slate-700">Sex Distribution</label>
                <span className="font-mono text-xs text-slate-600">
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
                className="w-full accent-blue-600 cursor-pointer"
              />
            </div>

            {/* Medication Adherence */}
            <div>
              <div className="flex justify-between items-center text-xs mb-1.5">
                <div>
                  <label className="font-semibold text-slate-700">Medication Adherence Target</label>
                  <span className="text-[10px] text-slate-400 block">Baseline mean compliance: 74.6%</span>
                </div>
                <span className="font-mono font-bold text-slate-800 bg-slate-100 px-2 py-0.5 rounded text-xs">
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
                className="w-full accent-blue-600 cursor-pointer"
              />
            </div>

            {/* Activity Level & Duration */}
            <div className="grid grid-cols-2 gap-3 pt-1">
              <div>
                <label className="text-xs font-semibold text-slate-700 block mb-1">Activity Level</label>
                <select
                  value={config.activityLevel}
                  onChange={(e) => updateConfig('activityLevel', e.target.value as any)}
                  className="w-full px-2.5 py-1.5 text-xs border border-slate-300 rounded bg-white"
                >
                  <option value="Low">Low (&lt;60 min/wk)</option>
                  <option value="Moderate">Moderate (60-180m)</option>
                  <option value="High">High (&gt;180m/wk)</option>
                </select>
              </div>
              <div>
                <label className="text-xs font-semibold text-slate-700 block mb-1">Study Duration</label>
                <select
                  value={config.studyDurationWeeks}
                  onChange={(e) => updateConfig('studyDurationWeeks', Number(e.target.value))}
                  className="w-full px-2.5 py-1.5 text-xs border border-slate-300 rounded bg-white"
                >
                  <option value={8}>8 Weeks</option>
                  <option value={12}>12 Weeks (Standard)</option>
                  <option value={24}>24 Weeks</option>
                </select>
              </div>
            </div>

            {/* Generation Model Selection */}
            <div className="pt-3 border-t border-slate-200">
              <label className="text-xs font-bold uppercase tracking-wider text-slate-700 block mb-2">
                Generation Model
              </label>
              <div className="space-y-2">
                <label
                  className={`flex items-start gap-3 p-3 rounded-md border cursor-pointer transition-colors ${
                    config.modelType === 'causal_generator'
                      ? 'border-blue-600 bg-blue-50/50'
                      : 'border-slate-200 hover:bg-slate-50'
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
                    <div className="text-xs font-bold text-slate-900 flex items-center gap-1.5">
                      <span>HealthGrid Causal / Conditional Generator</span>
                      <span className="text-[10px] bg-blue-100 text-blue-800 px-1.5 py-0.2 rounded font-semibold">
                        Recommended
                      </span>
                    </div>
                    <p className="text-[11px] text-slate-600 mt-0.5">
                      Propagates requests through clinically seeded SCM. Shifting diabetes to 60% realistically elevates
                      downstream blood pressure without repeating training patients.
                    </p>
                  </div>
                </label>

                <label
                  className={`flex items-start gap-3 p-3 rounded-md border cursor-pointer transition-colors ${
                    config.modelType === 'gaussian_copula_baseline'
                      ? 'border-amber-600 bg-amber-50/40'
                      : 'border-slate-200 hover:bg-slate-50'
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
                    <div className="text-xs font-bold text-slate-900">
                      Gaussian Copula Baseline (Resampling Comparator)
                    </div>
                    <p className="text-[11px] text-slate-500 mt-0.5">
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
                onClick={() => onStartRun(config)}
                className="w-full py-2.5 px-4 bg-blue-600 hover:bg-blue-700 text-white rounded text-xs font-semibold flex items-center justify-center gap-2 transition-colors shadow-xs"
              >
                <Play className="w-3.5 h-3.5 fill-current" />
                <span>Generate Synthetic Cohort ({config.targetPatients.toLocaleString()} Patients)</span>
              </button>
            </div>
          </div>
        </div>

        {/* RIGHT PANE: Live Extrapolation Assessment & Causal DAG (7 cols) */}
        <div className="lg:col-span-7 space-y-5">
          {/* Live Extrapolation Meter */}
          <ExtrapolationMeter assessment={assessment} />

          {/* Clinically Seeded Model DAG */}
          <CausalDAGView />
        </div>
      </div>
    </div>
  );
};
