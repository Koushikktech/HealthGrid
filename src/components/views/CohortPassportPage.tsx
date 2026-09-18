import React, { useState, useEffect } from 'react';
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
  Info
} from 'lucide-react';


interface CohortPassportPageProps {
  runId: string;
  validationReport: FullValidationReport | null;
  isDemoMode: boolean;
}

export const CohortPassportPage: React.FC<CohortPassportPageProps> = ({
  runId,
  validationReport,
  isDemoMode,
}) => {
  const [selectedPurpose, setSelectedPurpose] = useState<PurposeProfile>('qa');
  const [passportData, setPassportData] = useState<CohortPassportData | null>(null);

  useEffect(() => {
    passportService.getPassport(runId, selectedPurpose).then((res) => {
      setPassportData(res.passport);
    });
  }, [runId, selectedPurpose]);

  const purposeEvaluation = evaluateFitnessForPurpose(validationReport, selectedPurpose);

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

  if (!passportData) {
    return <div className="p-8 text-center text-slate-500 text-xs">Loading Cohort Passport artifact...</div>;
  }

  const isCalculated = validationReport && validationReport.isCalculated;

  return (
    <div className="space-y-6">
      {/* Header & Export Actions */}
      <div className="flex flex-wrap items-center justify-between gap-4 pb-4 border-b border-slate-200 no-print">
        <div>
          <div className="flex items-center gap-2.5">
            <h1 className="text-2xl font-bold tracking-tight text-slate-900">Cohort Passport</h1>
            <span className="text-xs px-2 py-0.5 rounded font-mono bg-slate-100 text-slate-700 border border-slate-300">
              {passportData.passportId}
            </span>
          </div>
          <p className="text-xs text-slate-500 mt-1">
            Formal technical evidence document certifying fitness-for-purpose and empirical validation.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={handleDownloadCSV}
            className="px-3 py-1.5 bg-white hover:bg-slate-50 border border-slate-300 rounded text-slate-700 text-xs font-semibold flex items-center gap-1.5 transition-colors"
          >
            <Download className="w-3.5 h-3.5 text-slate-500" />
            <span>Export CSV</span>
          </button>
          <button
            onClick={handleDownloadJSON}
            className="px-3 py-1.5 bg-white hover:bg-slate-50 border border-slate-300 rounded text-slate-700 text-xs font-semibold flex items-center gap-1.5 transition-colors"
          >
            <Download className="w-3.5 h-3.5 text-slate-500" />
            <span>Export JSON</span>
          </button>
          <button
            onClick={handlePrint}
            className="px-3.5 py-1.5 bg-slate-900 hover:bg-slate-800 text-white rounded text-xs font-semibold flex items-center gap-1.5 transition-colors shadow-xs"
          >
            <Printer className="w-3.5 h-3.5" />
            <span>Print / Save PDF</span>
          </button>
        </div>
      </div>

      {/* Interactive Purpose Selector (Requirement 12) */}
      <div className="bg-white rounded-lg border border-slate-200 p-5 no-print space-y-3">
        <div className="flex flex-wrap items-center justify-between gap-2">
          <div>
            <h3 className="text-xs font-bold uppercase tracking-wider text-slate-900">
              Intended Purpose &amp; Dynamic Approval Evaluation
            </h3>
            <p className="text-xs text-slate-500">
              Validation is purpose-dependent. Select the intended use to dynamically re-evaluate statistical and privacy gates.
            </p>
          </div>
          <div className="flex items-center gap-2">
            <span className="text-xs font-medium text-slate-600">Calculated Verdict:</span>
            <StatusBadge status={purposeEvaluation.verdict} size="md" />
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-3 pt-2">
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
                className={`p-3.5 rounded-lg border cursor-pointer transition-colors text-xs ${
                  isSelected
                    ? 'bg-blue-50/70 border-blue-600 shadow-xs'
                    : 'bg-slate-50/50 hover:bg-slate-100 border-slate-200'
                }`}
              >
                <div className="flex items-center justify-between mb-1.5">
                  <span className={`font-bold ${isSelected ? 'text-blue-950' : 'text-slate-800'}`}>
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
                <p className="text-[11px] text-slate-600 leading-relaxed">{item.desc}</p>
              </div>
            );
          })}
        </div>

        {/* Dynamic Rationale Callout */}
        <div className="p-3 bg-slate-50 rounded border border-slate-200 text-xs flex items-start gap-2">
          <Info className="w-4 h-4 text-blue-600 shrink-0 mt-0.5" />
          <div>
            <span className="font-semibold text-slate-900">Verdict Rationale: </span>
            <span className="text-slate-700">{purposeEvaluation.rationale}</span>
          </div>
        </div>
      </div>

      {/* Official Cohort Passport Document Container */}
      <div className="bg-white rounded-lg border border-slate-300 p-8 shadow-xs max-w-4xl mx-auto print:border-0 print:p-0">
        {/* Document Header */}
        <div className="flex items-start justify-between border-b-2 border-slate-900 pb-5">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded bg-slate-900 flex items-center justify-center p-2 text-white">
              <svg viewBox="0 0 32 32" className="w-full h-full" fill="none">
                <circle cx="10" cy="10" r="3" fill="#38bdf8" />
                <circle cx="22" cy="10" r="3" fill="#0ea5e9" />
                <circle cx="10" cy="22" r="3" fill="#0284c7" />
                <circle cx="22" cy="22" r="3" fill="#2563eb" />
                <circle cx="16" cy="16" r="3" fill="#10b981" />
              </svg>
            </div>
            <div>
              <div className="text-xs font-mono font-bold uppercase tracking-widest text-slate-500">
                HealthGrid Evidence Standard
              </div>
              <h2 className="text-xl font-bold text-slate-900">Synthetic Cohort Passport</h2>
            </div>
          </div>

          <div className="text-right">
            <div className="text-xs text-slate-500 font-mono">Passport ID: {passportData.passportId}</div>
            <div className="text-xs text-slate-500 font-mono">Issued: {passportData.issuedAt}</div>
            <div className="mt-1">
              <StatusBadge status={purposeEvaluation.verdict} size="md" />
            </div>
          </div>
        </div>

        {/* Dataset Provenance & Target Spec */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 py-5 border-b border-slate-200 text-xs">
          <div>
            <span className="text-slate-500 block">Source Dataset:</span>
            <strong className="text-slate-900">{passportData.datasetTitle}</strong>
          </div>
          <div>
            <span className="text-slate-500 block">Observed Sample:</span>
            <strong className="text-slate-900 font-mono">{passportData.datasetSourceSampleN.toLocaleString()} records</strong>
          </div>
          <div>
            <span className="text-slate-500 block">Synthesized Cohort:</span>
            <strong className="text-slate-900 font-mono">{passportData.syntheticTargetN.toLocaleString()} records</strong>
          </div>
          <div>
            <span className="text-slate-500 block">Generator Architecture:</span>
            <strong className="text-slate-900">{passportData.generationModelName}</strong>
          </div>
        </div>

        {/* Validation Scorecard Matrix */}
        <div className="py-5 border-b border-slate-200 space-y-4">
          <h3 className="text-xs font-bold uppercase tracking-wider text-slate-800">
            Holdout Validation Evidence Summary
          </h3>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 text-xs">
            <div className="p-3 bg-slate-50 rounded border border-slate-200">
              <div className="text-slate-500 text-[11px]">Holdout KS Divergence</div>
              <div className="text-base font-bold text-slate-900 my-0.5 font-mono">
                {isCalculated ? validationReport.fidelity.ksStatistic.value : 'Awaiting'}
              </div>
              <StatusBadge
                status={isCalculated ? validationReport.fidelity.ksStatistic.status : 'NOT_CALCULATED'}
                size="sm"
              />
            </div>

            <div className="p-3 bg-slate-50 rounded border border-slate-200">
              <div className="text-slate-500 text-[11px]">TSTR AUROC Predictive Gap</div>
              <div className="text-base font-bold text-slate-900 my-0.5 font-mono">
                {isCalculated ? validationReport.utility.aurocDifference.value : 'Awaiting'}
              </div>
              <StatusBadge
                status={isCalculated ? validationReport.utility.aurocDifference.status : 'NOT_CALCULATED'}
                size="sm"
              />
            </div>

            <div className="p-3 bg-slate-50 rounded border border-slate-200">
              <div className="text-slate-500 text-[11px]">Adversarial MIA Attack AUC</div>
              <div className="text-base font-bold text-slate-900 my-0.5 font-mono">
                {isCalculated ? validationReport.privacy.membershipInferenceAUC.value : 'Awaiting'}
              </div>
              <StatusBadge
                status={isCalculated ? validationReport.privacy.membershipInferenceAUC.status : 'NOT_CALCULATED'}
                size="sm"
              />
            </div>

            <div className="p-3 bg-slate-50 rounded border border-slate-200">
              <div className="text-slate-500 text-[11px]">Quarantined Near-Duplicates</div>
              <div className="text-base font-bold text-slate-900 my-0.5 font-mono">
                {isCalculated ? `${validationReport.privacy.flaggedNearDuplicates} records` : 'Awaiting'}
              </div>
              <StatusBadge
                status={isCalculated && validationReport.privacy.flaggedNearDuplicates ? 'REVIEW' : 'PASS'}
                size="sm"
              />
            </div>
          </div>
        </div>

        {/* Intended Purpose & Approval Rationale */}
        <div className="py-5 border-b border-slate-200 text-xs space-y-2">
          <h3 className="text-xs font-bold uppercase tracking-wider text-slate-800">
            Intended Purpose Certification
          </h3>
          <div className="flex items-center gap-2">
            <span className="font-semibold text-slate-700">Declared Target Use:</span>
            <span className="font-bold text-blue-900 uppercase">
              {selectedPurpose === 'qa'
                ? 'Software QA & Pipeline Load Testing'
                : selectedPurpose === 'ml_dev'
                ? 'Machine Learning Model Development'
                : 'External Sharing & Publication'}
            </span>
          </div>
          <p className="text-slate-600 leading-relaxed">{purposeEvaluation.rationale}</p>
        </div>

        {/* Research & Compliance Notes (Requirement 2 & 11) */}
        <div className="py-5 border-b border-slate-200 text-xs space-y-2.5">
          <h3 className="text-xs font-bold uppercase tracking-wider text-slate-800 flex items-center gap-1.5">
            <Lock className="w-3.5 h-3.5 text-slate-500" />
            {passportData.complianceConsiderations.title}
          </h3>
          <ul className="space-y-1.5 list-disc pl-5 text-slate-600">
            {passportData.complianceConsiderations.notes.map((note, idx) => (
              <li key={idx} className="leading-relaxed">
                {note}
              </li>
            ))}
          </ul>
        </div>

        {/* SHA-256 Verifiable Checksum slot */}
        <div className="pt-5 flex flex-wrap items-center justify-between gap-4 text-[11px] text-slate-500 font-mono">
          <div>
            <span className="text-slate-400 block">Dataset SHA-256 Integrity Checksum:</span>
            <span className="text-slate-700 select-all font-semibold">
              {passportData.sha256Checksum ? passportData.sha256Checksum : 'Pending calculation from backend'}
            </span>
          </div>
          <div className="text-right text-slate-400">
            Evaluated by HealthGrid SCM Core
          </div>
        </div>
      </div>
    </div>
  );
};
