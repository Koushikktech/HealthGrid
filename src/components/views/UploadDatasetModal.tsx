import React, { useState } from 'react';
import { Modal } from '../common/Modal';
import { UploadCloud, FileText, CheckCircle2, AlertCircle, Sparkles, Database } from 'lucide-react';
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
    } catch {
      setUploadStep('failed');
      setErrorMessage('The uploaded file could not be processed. Check that it is a valid CSV and contains readable column headers.');
    }
  };

  const handleLoadDemoSample = async () => {
    setUploadStep('uploading');
    setErrorMessage(null);
    try {
      // Load bundled clinical demo sample
      setUploadedInfo({
        filename: 'cardiometabolic_study_n1314.csv',
        sizeBytes: 284000,
        rows: 1314,
        cols: 14,
        datasetId: 'ds-clinical-001',
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
      subtitle="Supported: CSV tabular records up to 50 MB with standard column headers"
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
              className={`p-8 border-2 border-dashed rounded-lg text-center cursor-pointer transition-colors ${
                dragActive ? 'border-blue-500 bg-blue-50/50' : 'border-slate-300 hover:border-slate-400 bg-slate-50/50'
              }`}
            >
              <UploadCloud className="w-10 h-10 text-slate-400 mx-auto mb-3" />
              <div className="text-sm font-semibold text-slate-800">
                Drop CSV file here, or{' '}
                <label className="text-blue-600 hover:underline cursor-pointer">
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
              <p className="text-xs text-slate-500 mt-1">Comma-delimited CSV up to 50 MB</p>
            </div>

            {/* Quick Demo Sample Loader */}
            <div className="mt-4 pt-4 border-t border-slate-200 flex items-center justify-between">
              <div className="text-xs text-slate-500">
                Evaluating without a local file?
              </div>
              <button
                type="button"
                onClick={handleLoadDemoSample}
                className="text-xs font-semibold text-blue-700 bg-blue-50 hover:bg-blue-100 border border-blue-200 px-3 py-1.5 rounded transition-colors flex items-center gap-1.5"
              >
                <Database className="w-3.5 h-3.5" />
                <span>Load Bundled Clinical Sample (N=1,314)</span>
              </button>
            </div>
          </div>
        )}

        {/* Uploading State */}
        {uploadStep === 'uploading' && (
          <div className="p-8 text-center bg-slate-50 rounded-lg border border-slate-200">
            <div className="w-8 h-8 border-2 border-blue-600 border-t-transparent rounded-full animate-spin mx-auto mb-3"></div>
            <div className="text-sm font-semibold text-slate-800">Uploading dataset...</div>
            <p className="text-xs text-slate-500 mt-1">Transferring CSV file to local workspace memory.</p>
          </div>
        )}

        {/* Uploaded State - Ready to Profile */}
        {uploadStep === 'uploaded' && uploadedInfo && (
          <div className="space-y-4">
            <div className="p-4 bg-slate-50 rounded-lg border border-slate-200 text-xs space-y-2">
              <div className="flex items-center justify-between font-semibold text-slate-900 pb-2 border-b border-slate-200">
                <span className="flex items-center gap-2">
                  <FileText className="w-4 h-4 text-blue-600" />
                  {uploadedInfo.filename}
                </span>
                <span className="text-emerald-700 bg-emerald-50 border border-emerald-200 px-2 py-0.5 rounded text-[11px]">
                  Uploaded
                </span>
              </div>
              <div className="grid grid-cols-3 gap-2 text-slate-600 pt-1">
                <div>Size: {(uploadedInfo.sizeBytes / 1024).toFixed(1)} KB</div>
                <div>Detected Rows: {uploadedInfo.rows.toLocaleString()}</div>
                <div>Detected Columns: {uploadedInfo.cols}</div>
              </div>
              <div className="text-[11px] text-slate-500 pt-1">
                Validation status: Structure verified. Ready for profiling.
              </div>
            </div>

            <div className="flex items-center justify-between pt-2">
              <button
                type="button"
                onClick={resetState}
                className="text-xs text-slate-600 hover:text-slate-800 underline"
              >
                Choose another file
              </button>
              <button
                type="button"
                onClick={handleRunProfile}
                className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded text-xs font-semibold transition-colors flex items-center gap-1.5 shadow-xs"
              >
                <span>Profile Dataset</span>
              </button>
            </div>
          </div>
        )}

        {/* Profiling State */}
        {uploadStep === 'profiling' && (
          <div className="p-8 text-center bg-slate-50 rounded-lg border border-slate-200">
            <div className="w-8 h-8 border-2 border-blue-600 border-t-transparent rounded-full animate-spin mx-auto mb-3"></div>
            <div className="text-sm font-semibold text-slate-800">Profiling dataset...</div>
            <p className="text-xs text-slate-500 mt-1">
              Calculating schema distributions, missingness percentages, and correlation bounds.
            </p>
          </div>
        )}

        {/* Failure / Error State */}
        {uploadStep === 'failed' && (
          <div className="p-4 bg-rose-50 border border-rose-200 rounded-lg text-xs text-rose-900">
            <div className="flex items-start gap-2 mb-3">
              <AlertCircle className="w-4 h-4 text-rose-600 shrink-0 mt-0.5" />
              <div>
                <strong className="block font-semibold">Unable to profile dataset</strong>
                <p className="mt-1">{errorMessage}</p>
              </div>
            </div>
            <div className="flex items-center gap-3 pt-2">
              <button
                onClick={resetState}
                className="px-3 py-1.5 bg-rose-600 hover:bg-rose-700 text-white rounded text-xs font-medium"
              >
                Try Again
              </button>
              <button
                onClick={onClose}
                className="text-slate-600 hover:text-slate-800 text-xs underline"
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
