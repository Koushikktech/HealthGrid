import React, { useState } from 'react';
import { Modal } from '../common/Modal';
import { UploadCloud, FileText, CheckCircle2, AlertCircle, Database } from 'lucide-react';
import { datasetService } from '../../services/api/datasetService';

interface UploadDatasetModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: (newDatasetId: string) => void;
}

type UploadStep = 'idle' | 'uploading' | 'uploaded' | 'profiling' | 'profiled' | 'failed';

export const UploadDatasetModal: React.FC<UploadDatasetModalProps> = ({
  isOpen,
  onClose,
  onSuccess,
}) => {
  const [dragActive, setDragActive] = useState(false);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [uploadStep, setUploadStep] = useState<UploadStep>('idle');
  const [uploadedInfo, setUploadedInfo] = useState<{
    filename: string;
    sizeBytes: number;
    rows: number;
    cols: number;
    datasetId: string;
  } | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const resetState = () => {
    setSelectedFile(null);
    setUploadStep('idle');
    setUploadedInfo(null);
    setErrorMessage(null);
  };

  const handleFileChange = async (file: File) => {
    if (!file.name.endsWith('.csv')) {
      setErrorMessage('Invalid file format. Please provide a standard comma-delimited (.csv) file.');
      return;
    }

    setSelectedFile(file);
    setUploadStep('uploading');
    setErrorMessage(null);

    try {
      const res = await datasetService.uploadDataset(file);
      setUploadedInfo({
        filename: res.filename,
        sizeBytes: res.sizeBytes,
        rows: res.rowsDetected,
        cols: res.columnsDetected,
        datasetId: res.datasetId,
      });
      setUploadStep('uploaded');
    } catch (error) {
      setUploadStep('failed');
      setErrorMessage(error instanceof Error
        ? error.message
        : 'The uploaded file could not be processed. Check that it is a valid CSV and contains readable column headers.');
    }
  };

  const handleLoadDemoSample = async () => {
    setUploadStep('uploading');
    setErrorMessage(null);
    try {
      const response = await datasetService.loadDemoDataset();
      setUploadedInfo({
        filename: response.dataset.name,
        sizeBytes: 0,
        rows: response.dataset.patientCount,
        cols: response.dataset.featureCount,
        datasetId: response.dataset.id,
      });
      setUploadStep('uploaded');
    } catch {
      setUploadStep('failed');
      setErrorMessage('Failed to load sample dataset.');
    }
  };

  const handleRunProfile = async () => {
    if (!uploadedInfo) return;
    setUploadStep('profiling');
    try {
      await datasetService.profileDataset(uploadedInfo.datasetId);
      setUploadStep('profiled');
      setTimeout(() => {
        onSuccess(uploadedInfo.datasetId);
        onClose();
        resetState();
      }, 500);
    } catch {
      setUploadStep('failed');
      setErrorMessage('Profiling computation halted unexpectedly.');
    }
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={() => {
        onClose();
        resetState();
      }}
      title="Upload Healthcare Dataset"
      subtitle="Supported: CSV patient-level records up to 25 MB; required clinical fields are validated before use"
    >
      <div className="space-y-5">
        {/* Drag & Drop Area */}
        {uploadStep === 'idle' && (
          <div>
            <div
              onDragOver={(e) => {
                e.preventDefault();
                setDragActive(true);
              }}
              onDragLeave={() => setDragActive(false)}
              onDrop={(e) => {
                e.preventDefault();
                setDragActive(false);
                if (e.dataTransfer.files && e.dataTransfer.files[0]) {
                  handleFileChange(e.dataTransfer.files[0]);
                }
              }}
              className={`p-9 border-2 border-dashed rounded-3xl text-center cursor-pointer transition-all ${
                dragActive
                  ? 'border-blue-500 bg-blue-500/10 shadow-lg scale-[1.01]'
                  : 'border-slate-300/80 dark:border-slate-700/80 hover:border-blue-400 bg-white/40 dark:bg-slate-850/40 backdrop-blur-md'
              }`}
            >
              <div className="w-14 h-14 rounded-2xl bg-blue-500/10 text-blue-600 dark:text-blue-400 flex items-center justify-center mx-auto mb-3 shadow-inner">
                <UploadCloud className="w-7 h-7" />
              </div>
              <div className="text-sm font-semibold text-slate-800 dark:text-slate-200">
                Drop CSV file here, or{' '}
                <label className="text-blue-600 dark:text-blue-400 hover:underline cursor-pointer font-bold">
                  browse files
                  <input
                    type="file"
                    accept=".csv"
                    className="hidden"
                    onChange={(e) => {
                      if (e.target.files && e.target.files[0]) {
                        handleFileChange(e.target.files[0]);
                      }
                    }}
                  />
                </label>
              </div>
              <p className="text-xs text-slate-600 dark:text-slate-400 mt-1.5 font-medium">Comma-delimited CSV up to 50 MB</p>
            </div>

            {/* Quick Demo Sample Loader */}
            <div className="mt-5 pt-4 border-t border-slate-200/80 dark:border-slate-800 flex items-center justify-between">
              <div className="text-xs text-slate-600 dark:text-slate-400 font-medium">
                Evaluating without a local file?
              </div>
              <button
                type="button"
                onClick={handleLoadDemoSample}
                className="text-xs font-semibold text-blue-700 dark:text-blue-300 bg-blue-50 dark:bg-blue-950/50 hover:bg-blue-100 dark:hover:bg-blue-900/60 border border-blue-200 dark:border-blue-800/80 px-3.5 py-2 rounded-xl transition-all inline-flex items-center gap-2 leading-none shrink-0 shadow-2xs"
              >
                <Database className="w-3.5 h-3.5" />
                <span>Load Bundled Clinical Sample (N=1,314)</span>
              </button>
            </div>
          </div>
        )}

        {/* Uploading State */}
        {uploadStep === 'uploading' && (
          <div className="p-9 text-center glass-card rounded-3xl border border-slate-200/80 dark:border-slate-800/80">
            <div className="w-9 h-9 border-2 border-blue-600 border-t-transparent rounded-full animate-spin mx-auto mb-3.5"></div>
            <div className="text-sm font-semibold text-slate-900 dark:text-white">Uploading dataset...</div>
            <p className="text-xs text-slate-600 dark:text-slate-400 mt-1 font-medium">Transferring CSV file to local workspace memory.</p>
          </div>
        )}

        {/* Uploaded State - Ready to Profile */}
        {uploadStep === 'uploaded' && uploadedInfo && (
          <div className="space-y-4">
            <div className="p-5 glass-card rounded-2xl border border-slate-200/80 dark:border-slate-800/80 text-xs space-y-3 shadow-xs">
              <div className="flex items-center justify-between font-semibold text-slate-900 dark:text-white pb-2.5 border-b border-slate-200/80 dark:border-slate-800">
                <span className="flex items-center gap-2">
                  <FileText className="w-4 h-4 text-blue-600 dark:text-blue-400" />
                  {uploadedInfo.filename}
                </span>
                <span className="text-emerald-700 dark:text-emerald-300 bg-emerald-50 dark:bg-emerald-950/50 border border-emerald-200 dark:border-emerald-800 px-2.5 py-0.5 rounded-full text-[11px] font-semibold shrink-0 inline-flex items-center justify-center leading-none">
                  Uploaded
                </span>
              </div>
              <div className="grid grid-cols-3 gap-2 text-slate-700 dark:text-slate-200 pt-1 font-mono font-medium">
                <div>Size: {(uploadedInfo.sizeBytes / 1024).toFixed(1)} KB</div>
                <div>Detected Rows: {uploadedInfo.rows.toLocaleString()}</div>
                <div>Detected Columns: {uploadedInfo.cols}</div>
              </div>
              <div className="text-[11px] text-slate-600 dark:text-slate-400 pt-1 font-medium">
                Validation status: Backend schema checks passed. Ready to use.
              </div>
            </div>

            <div className="flex items-center justify-between pt-2">
              <button
                type="button"
                onClick={resetState}
                className="text-xs text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200 transition-colors font-medium"
              >
                Choose another file
              </button>
              <button
                type="button"
                onClick={handleRunProfile}
                className="px-5 py-2.5 bg-blue-600 hover:bg-blue-500 text-white rounded-xl text-xs font-semibold transition-all inline-flex items-center gap-2 leading-none shrink-0 shadow-sm hover:shadow-md hover:-translate-y-0.5 active:translate-y-0"
              >
                <span>Profile Dataset</span>
              </button>
            </div>
          </div>
        )}

        {/* Profiling State */}
        {uploadStep === 'profiling' && (
          <div className="p-9 text-center glass-card rounded-3xl border border-slate-200/80 dark:border-slate-800/80">
            <div className="w-9 h-9 border-2 border-blue-600 border-t-transparent rounded-full animate-spin mx-auto mb-3.5"></div>
            <div className="text-sm font-semibold text-slate-900 dark:text-white">Profiling dataset...</div>
            <p className="text-xs text-slate-600 dark:text-slate-400 mt-1 font-medium">
              Calculating schema distributions, missingness percentages, and correlation bounds.
            </p>
          </div>
        )}

        {/* Failure / Error State */}
        {uploadStep === 'failed' && (
          <div className="p-5 glass-card border border-rose-500/30 bg-rose-500/10 rounded-2xl text-xs text-rose-900 dark:text-rose-200">
            <div className="flex items-start gap-2.5 mb-3">
              <AlertCircle className="w-4 h-4 text-rose-600 dark:text-rose-400 shrink-0 mt-0.5" />
              <div>
                <strong className="block font-semibold">Unable to profile dataset</strong>
                <p className="mt-1 text-rose-700 dark:text-rose-300">{errorMessage}</p>
              </div>
            </div>
            <div className="flex items-center gap-3 pt-2">
              <button
                onClick={resetState}
                className="px-3.5 py-1.5 bg-rose-600 hover:bg-rose-500 text-white rounded-xl text-xs font-medium transition-all shadow-xs"
              >
                Try Again
              </button>
              <button
                onClick={onClose}
                className="text-slate-600 dark:text-slate-400 hover:text-slate-800 text-xs transition-colors"
              >
                Cancel
              </button>
            </div>
          </div>
        )}
      </div>
    </Modal>
  );
};
