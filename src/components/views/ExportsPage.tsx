import React, { useState } from 'react';
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
  const artifactStatus: ExportArtifactStatus = exportService.getArtifactStatus(runId);
  const [downloadNotice, setDownloadNotice] = useState<string | null>(null);

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
      exportService.downloadPassportJSON(runId, {
        runId,
        exportedAt: new Date().toISOString(),
        dataset: 'Clinical Cardiometabolic Study Dataset',
        syntheticRecords: 5000,
        purpose: 'qa',
        verdict: 'PASS',
      });
      setDownloadNotice('cohort_passport.json download initiated.');
      setTimeout(() => setDownloadNotice(null), 4000);
    } catch (err: any) {
      alert(err.message || 'Passport artifact not available yet.');
    }
  };

  const handlePrintPDF = () => {
    exportService.triggerPrintReport();
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-wrap items-center justify-between gap-4 pb-4 border-b border-slate-200">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-slate-900">Artifact Exports</h1>
          <p className="text-xs text-slate-500 mt-1">
            Download certified synthetic datasets, JSON specifications, and validation audit documents.
          </p>
        </div>
        <div className="text-xs text-slate-500 font-mono">
          Run ID: <strong>{runId}</strong>
        </div>
      </div>

      {/* Download Alert Notice */}
      {downloadNotice && (
        <div className="p-3 bg-emerald-50 border border-emerald-300 rounded text-emerald-900 text-xs flex items-center gap-2">
          <CheckCircle2 className="w-4 h-4 text-emerald-600" />
          <span>{downloadNotice}</span>
        </div>
      )}

      {/* Export Items Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Item 1: Synthetic CSV */}
        <div className="bg-white rounded-lg border border-slate-200 p-5 flex flex-col justify-between space-y-4">
          <div>
            <div className="w-10 h-10 rounded bg-blue-50 border border-blue-100 flex items-center justify-center text-blue-600 mb-3">
              <FileText className="w-5 h-5" />
            </div>
            <h3 className="text-sm font-bold text-slate-900">Synthetic Patient Records</h3>
            <p className="text-xs text-slate-500 mt-1 leading-relaxed">
              Standard tabular comma-delimited export containing all synthesized cross-sectional and visit features.
            </p>
            <div className="mt-4 pt-3 border-t border-slate-100 text-xs text-slate-600 space-y-1 font-mono">
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
                className="w-full py-2 bg-blue-600 hover:bg-blue-700 text-white rounded text-xs font-semibold flex items-center justify-center gap-2 transition-colors shadow-xs"
              >
                <Download className="w-3.5 h-3.5" />
                <span>Download Synthetic CSV</span>
              </button>
            ) : (
              <button
                disabled
                className="w-full py-2 bg-slate-100 text-slate-400 border border-slate-200 rounded text-xs font-semibold cursor-not-allowed"
              >
                Not available yet
              </button>
            )}
          </div>
        </div>

        {/* Item 2: Cohort Passport JSON */}
        <div className="bg-white rounded-lg border border-slate-200 p-5 flex flex-col justify-between space-y-4">
          <div>
            <div className="w-10 h-10 rounded bg-purple-50 border border-purple-100 flex items-center justify-center text-purple-600 mb-3">
              <FileCheck2 className="w-5 h-5" />
            </div>
            <h3 className="text-sm font-bold text-slate-900">Cohort Passport (Machine-Readable)</h3>
            <p className="text-xs text-slate-500 mt-1 leading-relaxed">
              Complete JSON manifest documenting model parameters, holdout validation scores, and quarantine logs.
            </p>
            <div className="mt-4 pt-3 border-t border-slate-100 text-xs text-slate-600 space-y-1 font-mono">
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
                className="w-full py-2 bg-white hover:bg-slate-50 border border-slate-300 text-slate-800 rounded text-xs font-semibold flex items-center justify-center gap-2 transition-colors"
              >
                <Download className="w-3.5 h-3.5 text-slate-500" />
                <span>Export Passport JSON</span>
              </button>
            ) : (
              <button
                disabled
                className="w-full py-2 bg-slate-100 text-slate-400 border border-slate-200 rounded text-xs font-semibold cursor-not-allowed"
              >
                Not available yet
              </button>
            )}
            <button
              onClick={onViewPassport}
              className="w-full text-center text-xs text-blue-600 hover:text-blue-800 font-medium py-1"
            >
              View Passport Document →
            </button>
          </div>
        </div>

        {/* Item 3: Validation Audit Report PDF */}
        <div className="bg-white rounded-lg border border-slate-200 p-5 flex flex-col justify-between space-y-4">
          <div>
            <div className="w-10 h-10 rounded bg-emerald-50 border border-emerald-100 flex items-center justify-center text-emerald-600 mb-3">
              <Printer className="w-5 h-5" />
            </div>
            <h3 className="text-sm font-bold text-slate-900">Validation Audit Report (PDF)</h3>
            <p className="text-xs text-slate-500 mt-1 leading-relaxed">
              Formatted clinical documentation for compliance committees, biostatistics review, and institutional archiving.
            </p>
            <div className="mt-4 pt-3 border-t border-slate-100 text-xs text-slate-600 space-y-1 font-mono">
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
                className="w-full py-2 bg-slate-900 hover:bg-slate-800 text-white rounded text-xs font-semibold flex items-center justify-center gap-2 transition-colors shadow-xs"
              >
                <Printer className="w-3.5 h-3.5" />
                <span>Print / Save Audit PDF</span>
              </button>
            ) : (
              <button
                disabled
                className="w-full py-2 bg-slate-100 text-slate-400 border border-slate-200 rounded text-xs font-semibold cursor-not-allowed"
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
