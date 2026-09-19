import React from 'react';
import { X, ShieldAlert, BookOpen, AlertTriangle, FileText } from 'lucide-react';

interface ComplianceNotesModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const ComplianceNotesModal: React.FC<ComplianceNotesModalProps> = ({ isOpen, onClose }) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/50 backdrop-blur-md transition-all duration-300">
      <div className="glass-sheet rounded-3xl border border-slate-200/80 dark:border-white/10 max-w-2xl w-full max-h-[90vh] flex flex-col shadow-2xl overflow-hidden animate-in fade-in zoom-in-95 duration-200">
        {/* Modal Header */}
        <div className="p-5 sm:p-6 border-b border-slate-200/80 dark:border-slate-800 flex items-start justify-between gap-4 bg-white/70 dark:bg-slate-900/70 backdrop-blur-md">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-blue-50 dark:bg-blue-950/60 border border-blue-200 dark:border-blue-800/80 flex items-center justify-center text-blue-600 dark:text-blue-400 shadow-2xs shrink-0">
              <BookOpen className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-base sm:text-lg font-bold text-slate-900 dark:text-white tracking-tight">Research &amp; Compliance Considerations</h2>
              <p className="text-xs text-slate-600 dark:text-slate-400 mt-0.5 font-medium">
                Informational guidance for statistical review, Institutional Review Boards (IRBs), and DPOs
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="w-8 h-8 rounded-full glass-pill hover:bg-white dark:hover:bg-slate-800 flex items-center justify-center text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white transition-all shadow-2xs"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Modal Body */}
        <div className="p-6 overflow-y-auto space-y-5 text-xs text-slate-700 dark:text-slate-300 leading-relaxed">
          <div className="p-4 bg-amber-500/10 border border-amber-500/30 rounded-2xl text-amber-950 dark:text-amber-200 flex items-start gap-3">
            <AlertTriangle className="w-4 h-4 text-amber-600 dark:text-amber-400 shrink-0 mt-0.5" />
            <div>
              <strong className="block font-semibold mb-0.5">Important Informational Disclaimer:</strong>
              HealthGrid provides technical statistical calculations and empirical privacy metrics. These outputs do
              not constitute legal advice, statutory certification, or an official guarantee of legal anonymity.
            </div>
          </div>

          <div>
            <h3 className="text-xs font-bold uppercase tracking-wider text-slate-900 dark:text-white mb-1.5">
              1. Empirical Privacy vs Legal Anonymity
            </h3>
            <p>
              Contemporary privacy research (such as ESORICS 2025: <em>The DCR Delusion</em>) establishes that simple
              distance-based metrics (Distance-to-Closest-Record) can be insufficient on their own. HealthGrid runs
              adversarial shadow-model Membership Inference Attacks (MIA AUC) and flags near-duplicate records for manual
              isolation. A low attack AUC (e.g. ~0.50) is strong technical evidence, but does not override jurisdictional
              legal definitions of personally identifiable health information (PHI).
            </p>
          </div>

          <div>
            <h3 className="text-xs font-bold uppercase tracking-wider text-slate-900 dark:text-white mb-1.5">
              2. India DPDP Act (2023 / Rules 2025) Operational Context
            </h3>
            <p>
              Under the Digital Personal Data Protection Act framework, effectively anonymized data sits outside statutory
              penalties. However, regulatory authorities and EDPB-aligned guidance caution against unvalidated
              "anonymity-washing." The Cohort Passport is designed to supply Data Protection Officers (DPOs) with auditable,
              empirical attack benchmarks, train-vs-holdout divergence ratios, and quarantined record logs.
            </p>
          </div>

          <div>
            <h3 className="text-xs font-bold uppercase tracking-wider text-slate-900 dark:text-white mb-1.5">
              3. Regulatory Evaluation Guidance (FDA SAFE &amp; Synthetic Data Protocols)
            </h3>
            <p>
              When synthetic cohorts are leveraged in digital health software QA or exploratory modeling, literature-aligned
              evaluation dimensions (Fidelity, Utility, Temporal coherence, and Privacy) must be demonstrated against
              held-out real patient partitions. Circular validation (validating on the exact data used to train the generator)
              is strictly avoided in HealthGrid's holdout evaluation suite.
            </p>
          </div>

          <div>
            <h3 className="text-xs font-bold uppercase tracking-wider text-slate-900 dark:text-white mb-1.5">
              4. Extrapolation Beyond Observed Sample Support
            </h3>
            <p>
              When user requests exceed the observed support of small healthcare datasets (e.g., requesting 60% diabetic
              prevalence from an 8% sample), standard conditional resampling generates duplicated identical records.
              HealthGrid uses clinically seeded structural physiological mechanisms to propagate downstream physiological shifts
              (such as elevated blood pressure), and prominently flags extrapolation uncertainty on the Extrapolation Meter.
            </p>
          </div>
        </div>

        {/* Modal Footer */}
        <div className="p-4 border-t border-slate-200/80 dark:border-slate-800 bg-white/40 dark:bg-slate-900/40 backdrop-blur-xs flex items-center justify-between text-xs">
          <span className="text-[11px] text-slate-600 dark:text-slate-400 font-medium">
            For institutional compliance questions, consult your organization's legal and privacy counsel.
          </span>
          <button
            onClick={onClose}
            className="px-4 py-2 bg-slate-900 hover:bg-slate-800 dark:bg-blue-600 dark:hover:bg-blue-500 text-white rounded-xl text-xs font-semibold transition-all shadow-xs"
          >
            Close Notes
          </button>
        </div>
      </div>
    </div>
  );
};
