import React from 'react';
import { X, ShieldAlert, BookOpen, AlertTriangle, FileText } from 'lucide-react';

interface ComplianceNotesModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const ComplianceNotesModal: React.FC<ComplianceNotesModalProps> = ({ isOpen, onClose }) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-xs">
      <div className="bg-white rounded-lg border border-slate-300 max-w-2xl w-full max-h-[90vh] flex flex-col shadow-xl">
        {/* Modal Header */}
        <div className="p-5 border-b border-slate-200 flex items-start justify-between gap-4">
          <div className="flex items-center gap-2.5">
            <BookOpen className="w-5 h-5 text-blue-600" />
            <div>
              <h2 className="text-base font-bold text-slate-900">Research & Compliance Considerations</h2>
              <p className="text-xs text-slate-500">
                Informational guidance for statistical review, Institutional Review Boards (IRBs), and DPOs
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="text-slate-400 hover:text-slate-600 p-1 rounded hover:bg-slate-100 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Body */}
        <div className="p-6 overflow-y-auto space-y-4 text-xs text-slate-700 leading-relaxed">
          <div className="p-3 bg-amber-50 border border-amber-200 rounded text-amber-900 flex items-start gap-2.5">
            <AlertTriangle className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
            <div>
              <strong className="block font-semibold">Important Informational Disclaimer:</strong>
              HealthGrid provides technical statistical calculations and empirical privacy metrics. These outputs do
              not constitute legal advice, statutory certification, or an official guarantee of legal anonymity.
            </div>
          </div>

          <div>
            <h3 className="text-xs font-bold uppercase tracking-wider text-slate-800 mb-1.5">
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
            <h3 className="text-xs font-bold uppercase tracking-wider text-slate-800 mb-1.5">
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
            <h3 className="text-xs font-bold uppercase tracking-wider text-slate-800 mb-1.5">
              3. Regulatory Evaluation Guidance (FDA SAFE & Synthetic Data Protocols)
            </h3>
            <p>
              When synthetic cohorts are leveraged in digital health software QA or exploratory modeling, literature-aligned
              evaluation dimensions (Fidelity, Utility, Temporal coherence, and Privacy) must be demonstrated against
              held-out real patient partitions. Circular validation (validating on the exact data used to train the generator)
              is strictly avoided in HealthGrid's holdout evaluation suite.
            </p>
          </div>

          <div>
            <h3 className="text-xs font-bold uppercase tracking-wider text-slate-800 mb-1.5">
              4. Extrapolation Beyond Observed Sample Support
            </h3>
            <p>
              When user requests exceed the observed support of small healthcare datasets (e.g., requesting 60% diabetic
              prevalence from an 8% sample), standard conditional resampling generates duplicated identical records.
              HealthGrid uses clinically seeded structural causal mechanisms to propagate downstream physiological shifts
              (such as elevated blood pressure), and prominently flags extrapolation uncertainty on the Extrapolation Meter.
            </p>
          </div>
        </div>

        {/* Modal Footer */}
        <div className="p-4 border-t border-slate-200 bg-slate-50 flex items-center justify-between">
          <span className="text-[11px] text-slate-500">
            For institutional compliance questions, consult your organization's legal and privacy counsel.
          </span>
          <button
            onClick={onClose}
            className="px-4 py-1.5 bg-slate-800 hover:bg-slate-900 text-white rounded text-xs font-medium transition-colors"
          >
            Close Notes
          </button>
        </div>
      </div>
    </div>
  );
};
