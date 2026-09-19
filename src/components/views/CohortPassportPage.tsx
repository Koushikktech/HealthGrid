import React, { useState, useEffect, useRef } from 'react';
import { CohortPassportData, PurposeProfile, FullValidationReport } from '../../types';
import { StatusBadge } from '../common/StatusBadge';
import { passportService } from '../../services/api/passportService';
import { exportService } from '../../services/api/exportService';
import { evaluateFitnessForPurpose } from '../../data/fixtures/demoValidation';
import {
  FileCheck2,
  Download,
  Printer,
  ShieldCheck,
  CheckCircle2,
  AlertTriangle,
  XCircle,
  FileText,
  Clock,
  Layers,
  Activity,
  GitBranch,
  Lock,
  Info,
  ArrowLeft
} from 'lucide-react';


interface CohortPassportPageProps {
  runId: string;
  validationReport: FullValidationReport | null;
  isDemoMode: boolean;
  onBack?: () => void;
}

const formatMetricNumber = (val: any, digits = 4): string => {
  if (val === null || val === undefined || val === '') return 'Awaiting';
  const num = typeof val === 'number' ? val : Number(val);
  if (isNaN(num)) return String(val);
  if (Number.isInteger(num)) return num.toLocaleString();
  return num.toFixed(digits);
};

const cleanComplianceNote = (note: string): string => {
  return note.replace(/(\d+\.\d{5,})/g, (match) => {
    const n = parseFloat(match);
    return isNaN(n) ? match : n.toFixed(4);
  });
};

export const CohortPassportPage: React.FC<CohortPassportPageProps> = ({
  runId,
  validationReport,
  isDemoMode,
  onBack,
}) => {
  const [selectedPurpose, setSelectedPurpose] = useState<PurposeProfile>('qa');
  const [passportData, setPassportData] = useState<CohortPassportData | null>(null);
  const [passportError, setPassportError] = useState<string | null>(null);
  const requestSequence = useRef(0);

  useEffect(() => {
    const sequence = ++requestSequence.current;
    setPassportData(null);
    setPassportError(null);
    passportService.getPassport(runId, selectedPurpose).then((res) => {
      if (requestSequence.current === sequence) setPassportData(res.passport);
    }).catch((error) => {
      if (requestSequence.current === sequence) {
        setPassportError(error instanceof Error ? error.message : 'Unable to load Cohort Passport.');
      }
    });
    return () => {
      if (requestSequence.current === sequence) requestSequence.current += 1;
    };
  }, [runId, selectedPurpose]);

  const demoEvaluation = isDemoMode
    ? evaluateFitnessForPurpose(validationReport, selectedPurpose)
    : null;
  const currentVerdict = passportData?.purposeVerdict || demoEvaluation?.verdict || 'PENDING';
  const currentRationale = passportData?.verdictRationale || demoEvaluation?.rationale || 'Awaiting backend verdict evaluation.';

  const handleDownloadJSON = () => {
    if (passportData) {
      exportService.downloadPassportJSON(runId, passportData);
    }
  };

  const handleDownloadCSV = () => {
    exportService.downloadCSV(runId);
  };

  const handlePrint = () => {
    exportService.triggerPrintReport();
  };

  if (passportError) {
    return <div className="p-8 text-center text-rose-600 text-xs">{passportError}</div>;
  }
  if (!passportData) {
    return <div className="p-8 text-center text-slate-500 text-xs">Loading Cohort Passport artifact...</div>;
  }

  const isCalculated = Boolean(validationReport?.isCalculated);

  return (
    <div className="space-y-6 animate-in fade-in duration-300">
      {/* Header & Export Actions */}
      <div className="flex flex-wrap items-center justify-between gap-4 pb-5 border-b border-slate-200/80 dark:border-slate-800 no-print">
        <div className="flex items-center gap-3.5">
          {onBack && (
            <button
              onClick={onBack}
              className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors text-xs font-semibold shadow-2xs cursor-pointer active:scale-95"
              title="Return to previous screen"
            >
              <ArrowLeft className="w-3.5 h-3.5" />
              <span>Back</span>
            </button>
          )}
          <div>
            <div className="flex items-center gap-3">
              <h1 className="text-2xl font-bold tracking-tight text-slate-900 dark:text-white">Cohort Passport</h1>
              <span className="text-xs px-3 py-1 rounded-full font-mono glass-pill text-slate-800 dark:text-slate-200 border-slate-200 dark:border-white/10 shadow-2xs shrink-0 inline-flex items-center justify-center leading-none">
                {passportData.passportId}
              </span>
            </div>
            <p className="text-xs text-slate-600 dark:text-slate-400 mt-1 font-medium">
              Hash-linked technical evidence for purpose-specific empirical validation.
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2.5">
          <button
            onClick={handleDownloadCSV}
            className="px-4 py-2 glass-pill hover:bg-white/80 dark:hover:bg-slate-800 text-slate-700 dark:text-slate-200 rounded-xl text-xs font-semibold inline-flex items-center gap-2 transition-all duration-200 active:scale-95 shadow-2xs shrink-0 leading-none"
          >
            <Download className="w-3.5 h-3.5 text-slate-500 dark:text-slate-400" />
            <span>Export CSV</span>
          </button>
          <button
            onClick={handleDownloadJSON}
            className="px-4 py-2 glass-pill hover:bg-white/80 dark:hover:bg-slate-800 text-slate-700 dark:text-slate-200 rounded-xl text-xs font-semibold inline-flex items-center gap-2 transition-all duration-200 active:scale-95 shadow-2xs shrink-0 leading-none"
          >
            <Download className="w-3.5 h-3.5 text-slate-500 dark:text-slate-400" />
            <span>Export JSON</span>
          </button>
          <button
            onClick={handlePrint}
            className="px-4 py-2 bg-slate-900 hover:bg-slate-800 dark:bg-blue-600 dark:hover:bg-blue-500 text-white rounded-xl text-xs font-semibold inline-flex items-center gap-2 transition-all duration-200 shadow-sm shadow-slate-900/20 active:scale-95 shrink-0 leading-none"
          >
            <Printer className="w-3.5 h-3.5" />
            <span>Print / PDF</span>
          </button>
        </div>
      </div>

      {/* Interactive Purpose Selector */}
      <div className="glass-card rounded-3xl p-6 md:p-7 no-print space-y-4">
        <div className="flex flex-wrap items-center justify-between gap-3 pb-3 border-b border-slate-200/60 dark:border-white/5">
          <div>
            <h3 className="text-xs font-bold uppercase tracking-wider text-slate-900 dark:text-white">
              Intended Purpose &amp; Dynamic Approval Evaluation
            </h3>
            <p className="text-xs text-slate-600 dark:text-slate-400 mt-0.5 font-medium">
              Validation is purpose-dependent. Select the intended use to dynamically re-evaluate statistical and privacy gates.
            </p>
          </div>
          <div className="flex items-center gap-2.5">
            <span className="text-xs font-semibold text-slate-700 dark:text-slate-300">Calculated Verdict:</span>
            <StatusBadge status={currentVerdict} size="md" />
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 pt-1">
          {[
            {
              id: 'qa' as PurposeProfile,
              title: 'Software QA & Pipeline Load Testing',
              desc: 'Relaxes strict distribution match; mandates valid schema types, realistic ranges, and basic privacy.',
            },
            {
              id: 'ml_dev' as PurposeProfile,
              title: 'Machine Learning Model Development',
              desc: 'Mandates high downstream utility (TSTR ΔAUROC < 0.05), feature importance agreement, and moderate privacy.',
            },
            {
              id: 'publication' as PurposeProfile,
              title: 'External Sharing & Scientific Dissemination',
              desc: 'Strictest gate: requires minimal holdout KS divergence, MIA attack AUC near 0.50, and zero quarantined near-duplicates.',
            },
          ].map((item) => {
            const isSelected = selectedPurpose === item.id;
            return (
              <div
                key={item.id}
                onClick={() => setSelectedPurpose(item.id)}
                className={`p-4 rounded-2xl border cursor-pointer transition-all duration-200 text-xs flex flex-col justify-between ${
                  isSelected
                    ? 'border-blue-500/70 bg-blue-500/10 shadow-xs shadow-blue-500/15'
                    : 'glass-card border-slate-200/60 dark:border-white/5 hover:border-blue-500/30'
                }`}
              >
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <span className={`font-bold ${isSelected ? 'text-blue-700 dark:text-blue-300' : 'text-slate-900 dark:text-white'}`}>
                      {item.title}
                    </span>
                    <input
                      type="radio"
                      name="purposeProfile"
                      checked={isSelected}
                      onChange={() => setSelectedPurpose(item.id)}
                      className="accent-blue-600"
                    />
                  </div>
                  <p className="text-[11px] text-slate-600 dark:text-slate-300 leading-relaxed font-normal">{item.desc}</p>
                </div>
              </div>
            );
          })}
        </div>

        {/* Dynamic Rationale Callout */}
        <div className="p-4 glass-card rounded-2xl border-blue-500/25 bg-blue-500/[0.03] text-xs flex items-start gap-2.5">
          <Info className="w-4 h-4 text-blue-600 dark:text-blue-400 shrink-0 mt-0.5" />
          <div>
            <span className="font-bold text-blue-950 dark:text-blue-200">Verdict Rationale: </span>
            <span className="text-slate-700 dark:text-slate-300 leading-relaxed font-normal">{currentRationale}</span>
          </div>
        </div>
        {passportData.verdictGates && passportData.verdictGates.length > 0 && (
          <div className="overflow-x-auto rounded-2xl border border-slate-200 dark:border-slate-800">
            <table className="min-w-full text-xs text-left">
              <thead className="bg-slate-50 dark:bg-slate-900 text-slate-500 uppercase text-[10px] tracking-wider">
                <tr><th className="p-3">Evidence gate</th><th className="p-3">Observed</th><th className="p-3">Required</th><th className="p-3">Result</th></tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                {passportData.verdictGates.map((gate) => (
                  <tr key={gate.metric}>
                    <td className="p-3 font-semibold">{gate.metric.replace(/_/g, ' ')}</td>
                    <td className="p-3 font-mono">{gate.value === null ? 'not assessable' : formatMetricNumber(gate.value, 4)}</td>
                    <td className="p-3 font-mono">{gate.threshold}</td>
                    <td className="p-3"><StatusBadge status={gate.result.toUpperCase() as CohortPassportData['purposeVerdict']} size="sm" /></td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Official Cohort Passport Document Container */}
      <div className="bg-white/95 dark:bg-slate-900/95 rounded-3xl border border-slate-200/80 dark:border-white/10 p-8 md:p-10 shadow-xl shadow-black/5 max-w-4xl mx-auto backdrop-blur-xl print:border-0 print:p-0 print:shadow-none">
        {/* Document Header */}
        <div className="flex items-start justify-between border-b-2 border-slate-900 dark:border-white/20 pb-6">
          <div className="flex items-center gap-3.5">
            <div className="w-11 h-11 rounded-2xl bg-slate-900 dark:bg-white flex items-center justify-center p-2 text-white dark:text-slate-900 shadow-md">
              <svg viewBox="0 0 32 32" className="w-full h-full" fill="none">
                <circle cx="10" cy="10" r="3" fill="#38bdf8" />
                <circle cx="22" cy="10" r="3" fill="#0ea5e9" />
                <circle cx="10" cy="22" r="3" fill="#0284c7" />
                <circle cx="22" cy="22" r="3" fill="#2563eb" />
                <circle cx="16" cy="16" r="3" fill="#10b981" />
              </svg>
            </div>
            <div>
              <div className="text-[10px] font-mono font-bold uppercase tracking-widest text-slate-600 dark:text-slate-400">
                HealthGrid Evidence Standard
              </div>
              <h2 className="text-2xl font-bold text-slate-900 dark:text-white tracking-tight">Synthetic Cohort Passport</h2>
            </div>
          </div>

          <div className="text-right">
            <div className="text-xs text-slate-600 dark:text-slate-400 font-mono font-medium">Passport ID: {passportData.passportId}</div>
            <div className="text-xs text-slate-600 dark:text-slate-400 font-mono font-medium mt-0.5">Issued: {passportData.issuedAt}</div>
            <div className="mt-2 flex justify-end">
              <StatusBadge status={currentVerdict} size="md" />
            </div>
          </div>
        </div>

        {/* Dataset Provenance & Target Spec */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 py-6 border-b border-slate-200/80 dark:border-white/10 text-xs">
          <div>
            <span className="text-slate-600 dark:text-slate-400 block font-medium">Source Dataset:</span>
            <strong className="text-slate-900 dark:text-white font-semibold text-sm">{passportData.datasetTitle}</strong>
          </div>
          <div>
            <span className="text-slate-600 dark:text-slate-400 block font-medium">Observed Sample:</span>
            <strong className="text-slate-900 dark:text-white font-mono text-sm">{passportData.datasetSourceSampleN.toLocaleString()} records</strong>
          </div>
          <div>
            <span className="text-slate-600 dark:text-slate-400 block font-medium">Synthesized Cohort:</span>
            <strong className="text-slate-900 dark:text-white font-mono text-sm">{passportData.syntheticTargetN.toLocaleString()} records</strong>
          </div>
          <div>
            <span className="text-slate-600 dark:text-slate-400 block font-medium">Generator Architecture:</span>
            <strong className="text-slate-900 dark:text-white font-semibold text-sm">{passportData.generationModelName}</strong>
          </div>
        </div>

        {/* Validation Scorecard Matrix */}
        <div className="py-6 border-b border-slate-200/80 dark:border-white/10 space-y-4">
          <h3 className="text-[11px] font-bold uppercase tracking-wider text-slate-600 dark:text-slate-400">
            Holdout Validation Evidence Summary
          </h3>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 text-xs">
            <div className="p-4 glass-card rounded-2xl border-slate-200/60 dark:border-white/5 overflow-hidden">
              <div className="text-slate-600 dark:text-slate-400 text-[11px] font-semibold truncate">Holdout KS Divergence</div>
              <div
                className="text-lg font-bold text-slate-900 dark:text-white my-1 font-mono tracking-tight truncate"
                title={isCalculated && validationReport?.fidelity.ksStatistic.value !== null ? String(validationReport?.fidelity.ksStatistic.value) : undefined}
              >
                {isCalculated ? formatMetricNumber(validationReport?.fidelity.ksStatistic.value, 4) : 'Awaiting'}
              </div>
              <StatusBadge
                status={isCalculated ? validationReport?.fidelity.ksStatistic.status || 'NOT_CALCULATED' : 'NOT_CALCULATED'}
                size="sm"
              />
            </div>

            <div className="p-4 glass-card rounded-2xl border-slate-200/60 dark:border-white/5 overflow-hidden">
              <div className="text-slate-600 dark:text-slate-400 text-[11px] font-semibold truncate">TSTR AUROC Predictive Gap</div>
              <div
                className="text-lg font-bold text-slate-900 dark:text-white my-1 font-mono tracking-tight truncate"
                title={isCalculated && validationReport?.utility.aurocDifference.value !== null ? String(validationReport?.utility.aurocDifference.value) : undefined}
              >
                {isCalculated ? formatMetricNumber(validationReport?.utility.aurocDifference.value, 4) : 'Awaiting'}
              </div>
              <StatusBadge
                status={isCalculated ? validationReport?.utility.aurocDifference.status || 'NOT_CALCULATED' : 'NOT_CALCULATED'}
                size="sm"
              />
            </div>

            <div className="p-4 glass-card rounded-2xl border-slate-200/60 dark:border-white/5 overflow-hidden">
              <div className="text-slate-600 dark:text-slate-400 text-[11px] font-semibold truncate">Adversarial MIA Attack AUC</div>
              <div
                className="text-lg font-bold text-slate-900 dark:text-white my-1 font-mono tracking-tight truncate"
                title={isCalculated && validationReport?.privacy.membershipInferenceAUC.value !== null ? String(validationReport?.privacy.membershipInferenceAUC.value) : undefined}
              >
                {isCalculated ? formatMetricNumber(validationReport?.privacy.membershipInferenceAUC.value, 4) : 'Awaiting'}
              </div>
              <StatusBadge
                status={isCalculated ? validationReport?.privacy.membershipInferenceAUC.status || 'NOT_CALCULATED' : 'NOT_CALCULATED'}
                size="sm"
              />
            </div>

            <div className="p-4 glass-card rounded-2xl border-slate-200/60 dark:border-white/5 overflow-hidden">
              <div className="text-slate-600 dark:text-slate-400 text-[11px] font-semibold truncate">Quarantined Near-Duplicates</div>
              <div className="text-lg font-bold text-slate-900 dark:text-white my-1 font-mono tracking-tight truncate">
                {isCalculated ? `${validationReport?.privacy.flaggedNearDuplicates ?? 0} records` : 'Awaiting'}
              </div>
              <StatusBadge
                status={isCalculated && validationReport?.privacy.flaggedNearDuplicates ? 'REVIEW' : 'PASS'}
                size="sm"
              />
            </div>
          </div>
        </div>

        {/* Intended Purpose & Approval Rationale */}
        <div className="py-6 border-b border-slate-200/80 dark:border-white/10 text-xs space-y-2.5">
          <h3 className="text-[11px] font-bold uppercase tracking-wider text-slate-600 dark:text-slate-400">
            Intended Purpose Certification
          </h3>
          <div className="flex items-center gap-2">
            <span className="font-semibold text-slate-700 dark:text-slate-300">Declared Target Use:</span>
            <span className="font-bold text-blue-700 dark:text-blue-400 uppercase tracking-wide">
              {selectedPurpose === 'qa'
                ? 'Software QA & Pipeline Load Testing'
                : selectedPurpose === 'ml_dev'
                ? 'Machine Learning Model Development'
                : 'External Sharing & Publication'}
            </span>
          </div>
          <p className="text-slate-700 dark:text-slate-300 leading-relaxed font-normal">{currentRationale}</p>
        </div>

        {/* Research & Compliance Notes */}
        <div className="py-6 border-b border-slate-200/80 dark:border-white/10 text-xs space-y-2.5">
          <h3 className="text-[11px] font-bold uppercase tracking-wider text-slate-600 dark:text-slate-400 flex items-center gap-1.5">
            <Lock className="w-3.5 h-3.5 text-slate-500 dark:text-slate-400" />
            <span>{passportData.complianceConsiderations.title}</span>
          </h3>
          <ul className="space-y-1.5 list-disc pl-5 text-slate-700 dark:text-slate-300 font-normal">
            {passportData.complianceConsiderations.notes.map((note, idx) => (
              <li key={idx} className="leading-relaxed break-words">
                {cleanComplianceNote(note)}
              </li>
            ))}
          </ul>
        </div>

        {/* SHA-256 Verifiable Checksum slot */}
        <div className="pt-6 flex flex-wrap items-center justify-between gap-4 text-[11px] text-slate-600 dark:text-slate-400 font-mono">
          <div>
            <span className="text-slate-600 dark:text-slate-400 block mb-0.5 font-medium">Dataset SHA-256 Integrity Checksum:</span>
            <span className="text-slate-900 dark:text-slate-100 select-all font-semibold break-all">
              {passportData.sha256Checksum ? passportData.sha256Checksum : 'Pending calculation from backend'}
            </span>
          </div>
          <div className="text-right text-slate-600 dark:text-slate-400 font-medium">
            Evaluated by {passportData.generationModelName}
          </div>
        </div>
      </div>
    </div>
  );
};
