import React, { useEffect, useState } from 'react';
import { exportService, ExportArtifactStatus } from '../../services/api/exportService';
import { Download, FileText, FileCheck2, Printer, CheckCircle2, AlertCircle } from 'lucide-react';

interface ExportsPageProps {
  runId: string;
  onViewPassport: () => void;
  isDemoMode: boolean;
}

export const ExportsPage: React.FC<ExportsPageProps> = ({
  runId,
  onViewPassport,
  isDemoMode,
}) => {
  const [artifactStatus, setArtifactStatus] = useState<ExportArtifactStatus | null>(null);
  const [artifactError, setArtifactError] = useState<string | null>(null);
  const [downloadNotice, setDownloadNotice] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;
    setArtifactStatus(null);
    setArtifactError(null);
    exportService.getArtifactStatus(runId).then((status) => {
      if (!cancelled) setArtifactStatus(status);
    }).catch((error) => {
      if (!cancelled) setArtifactError(error instanceof Error ? error.message : 'Unable to load artifacts.');
    });
    return () => { cancelled = true; };
  }, [runId, isDemoMode]);

  const handleDownloadCSV = () => {
    try {
      exportService.downloadCSV(runId);
      setDownloadNotice('healthgrid_synthetic_cohort.csv download initiated.');
      setTimeout(() => setDownloadNotice(null), 4000);
    } catch (err: any) {
      alert(err.message || 'CSV artifact not available yet.');
    }
  };

  const handleDownloadJSON = () => {
    try {
      exportService.downloadPassportJSON(runId, { runId, status: 'demo_preview' });
      setDownloadNotice('cohort_passport.json download initiated.');
      setTimeout(() => setDownloadNotice(null), 4000);
    } catch (err: any) {
      alert(err.message || 'Passport artifact not available yet.');
    }
  };

  const handlePrintPDF = () => {
    exportService.downloadPassportPDF(runId);
  };

  if (artifactError) {
    return <div className="p-8 text-center text-rose-600 text-xs">{artifactError}</div>;
  }
  if (!artifactStatus) {
    return <div className="p-8 text-center text-slate-500 text-xs">Loading artifacts for the active run...</div>;
  }

  return (
    <div className="space-y-6 animate-in fade-in duration-300">
      {/* Header */}
      <div className="flex flex-wrap items-center justify-between gap-4 pb-5 border-b border-slate-200/80 dark:border-slate-800">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-slate-900 dark:text-white">Artifact Exports</h1>
          <p className="text-xs text-slate-600 dark:text-slate-400 mt-1 font-medium">
            Download generated datasets, hash-linked manifests, and validation evidence documents.
          </p>
        </div>
        <div className="text-xs text-slate-600 dark:text-slate-400 font-mono font-medium">
          Run ID: <strong className="text-slate-900 dark:text-white">{runId}</strong>
        </div>
      </div>

      {/* Download Alert Notice */}
      {downloadNotice && (
        <div className="p-3 bg-emerald-500/10 border border-emerald-500/30 rounded-xl text-emerald-900 dark:text-emerald-200 text-xs flex items-center gap-2">
          <CheckCircle2 className="w-4 h-4 text-emerald-600 dark:text-emerald-400 shrink-0" />
          <span>{downloadNotice}</span>
        </div>
      )}

      {/* Export Items Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Item 1: Synthetic CSV */}
        <div className="glass-card rounded-3xl p-6 flex flex-col justify-between space-y-4 hover:shadow-md transition-all">
          <div>
            <div className="w-10 h-10 rounded-2xl bg-blue-50 dark:bg-blue-950/60 border border-blue-200 dark:border-blue-800/80 flex items-center justify-center text-blue-600 dark:text-blue-400 mb-3 shadow-2xs">
              <FileText className="w-5 h-5" />
            </div>
            <h3 className="text-sm font-bold text-slate-900 dark:text-white">Synthetic Patient Records</h3>
            <p className="text-xs text-slate-600 dark:text-slate-300 mt-1.5 leading-relaxed">
              Standard tabular comma-delimited export containing all synthesized cross-sectional and visit features.
            </p>
            <div className="mt-4 pt-3 border-t border-slate-200/80 dark:border-slate-800 text-xs text-slate-600 dark:text-slate-400 space-y-1 font-mono">
              <div>Format: CSV</div>
              <div>Records: {artifactStatus.hasCSV ? `${artifactStatus.csvRecordCount.toLocaleString()} patients` : '—'}</div>
              <div>File Size: {artifactStatus.csvFileSize}</div>
              <div>Generated: {artifactStatus.generatedAt}</div>
            </div>
          </div>

          <div>
            {artifactStatus.hasCSV ? (
              <button
                onClick={handleDownloadCSV}
                className="w-full py-2.5 bg-blue-600 hover:bg-blue-500 text-white rounded-xl text-xs font-semibold inline-flex items-center justify-center gap-2 leading-none transition-all shadow-sm hover:shadow-md hover:-translate-y-0.5 active:translate-y-0"
              >
                <Download className="w-3.5 h-3.5" />
                <span>Download Synthetic CSV</span>
              </button>
            ) : (
              <button
                disabled
                className="w-full py-2.5 bg-slate-100 dark:bg-slate-800/50 text-slate-400 dark:text-slate-500 border border-slate-200 dark:border-slate-700 rounded-xl text-xs font-semibold cursor-not-allowed inline-flex items-center justify-center leading-none"
              >
                Not available yet
              </button>
            )}
          </div>
        </div>

        {/* Item 2: Cohort Passport JSON */}
        <div className="glass-card rounded-3xl p-6 flex flex-col justify-between space-y-4 hover:shadow-md transition-all">
          <div>
            <div className="w-10 h-10 rounded-2xl bg-purple-50 dark:bg-purple-950/60 border border-purple-200 dark:border-purple-800/80 flex items-center justify-center text-purple-600 dark:text-purple-400 mb-3 shadow-2xs">
              <FileCheck2 className="w-5 h-5" />
            </div>
            <h3 className="text-sm font-bold text-slate-900 dark:text-white">Cohort Passport (JSON)</h3>
            <p className="text-xs text-slate-600 dark:text-slate-300 mt-1.5 leading-relaxed">
              Complete JSON manifest documenting model parameters, holdout validation scores, and quarantine logs.
            </p>
            <div className="mt-4 pt-3 border-t border-slate-200/80 dark:border-slate-800 text-xs text-slate-600 dark:text-slate-400 space-y-1 font-mono">
              <div>Format: JSON Schema v2.4</div>
              <div>Verification: SHA-256 Checksum</div>
              <div>Integrity: Hash-linked to CSV</div>
              <div>Generated: {artifactStatus.generatedAt}</div>
            </div>
          </div>

          <div className="space-y-2">
            {artifactStatus.hasJSON ? (
              <button
                onClick={handleDownloadJSON}
                className="w-full py-2.5 glass-pill hover:bg-white/80 dark:hover:bg-slate-800 text-slate-800 dark:text-slate-200 rounded-xl text-xs font-semibold inline-flex items-center justify-center gap-2 leading-none transition-all shadow-xs"
              >
                <Download className="w-3.5 h-3.5 text-slate-500 dark:text-slate-400" />
                <span>Export Passport JSON</span>
              </button>
            ) : (
              <button
                disabled
                className="w-full py-2.5 bg-slate-100 dark:bg-slate-800/50 text-slate-400 dark:text-slate-500 border border-slate-200 dark:border-slate-700 rounded-xl text-xs font-semibold cursor-not-allowed inline-flex items-center justify-center leading-none"
              >
                Not available yet
              </button>
            )}
            <button
              onClick={onViewPassport}
              className="w-full text-center text-xs text-blue-600 dark:text-blue-400 hover:text-blue-700 dark:hover:text-blue-300 font-semibold py-1 transition-colors"
            >
              View Passport Document →
            </button>
          </div>
        </div>

        {/* Item 3: Validation Audit Report PDF */}
        <div className="glass-card rounded-3xl p-6 flex flex-col justify-between space-y-4 hover:shadow-md transition-all">
          <div>
            <div className="w-10 h-10 rounded-2xl bg-emerald-50 dark:bg-emerald-950/60 border border-emerald-200 dark:border-emerald-800/80 flex items-center justify-center text-emerald-600 dark:text-emerald-400 mb-3 shadow-2xs">
              <Printer className="w-5 h-5" />
            </div>
            <h3 className="text-sm font-bold text-slate-900 dark:text-white">Validation Audit Report (PDF)</h3>
            <p className="text-xs text-slate-600 dark:text-slate-300 mt-1.5 leading-relaxed">
              Formatted clinical documentation for compliance committees, biostatistics review, and institutional archiving.
            </p>
            <div className="mt-4 pt-3 border-t border-slate-200/80 dark:border-slate-800 text-xs text-slate-600 dark:text-slate-400 space-y-1 font-mono">
              <div>Format: PDF (Print / Rendered)</div>
              <div>Pages: Comprehensive Evidence</div>
              <div>Audit Trail: Timestamped</div>
              <div>Generated: {artifactStatus.generatedAt}</div>
            </div>
          </div>

          <div>
            {artifactStatus.hasPDFReport ? (
              <button
                onClick={handlePrintPDF}
                className="w-full py-2.5 bg-slate-900 hover:bg-slate-800 dark:bg-blue-600 dark:hover:bg-blue-500 text-white rounded-xl text-xs font-semibold inline-flex items-center justify-center gap-2 leading-none transition-all shadow-sm active:scale-98"
              >
                <Printer className="w-3.5 h-3.5" />
                <span>Download Audit PDF</span>
              </button>
            ) : (
              <button
                disabled
                className="w-full py-2.5 bg-slate-100 dark:bg-slate-800/50 text-slate-400 dark:text-slate-500 border border-slate-200 dark:border-slate-700 rounded-xl text-xs font-semibold cursor-not-allowed"
              >
                Not available yet
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
