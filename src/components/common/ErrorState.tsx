import React from 'react';
import { AlertCircle, RefreshCw, FileQuestion } from 'lucide-react';

interface ErrorStateProps {
  title?: string;
  message: string;
  onRetry?: () => void;
  actionLabel?: string;
}

export const ErrorState: React.FC<ErrorStateProps> = ({
  title = 'Processing Issue Encountered',
  message,
  onRetry,
  actionLabel = 'Try Again',
}) => {
  return (
    <div className="p-6 bg-rose-50/60 border border-rose-200 rounded-lg max-w-lg mx-auto my-6 text-slate-800">
      <div className="flex items-start gap-3">
        <AlertCircle className="w-5 h-5 text-rose-600 shrink-0 mt-0.5" />
        <div className="flex-1">
          <h4 className="text-sm font-bold text-rose-900 mb-1">{title}</h4>
          <p className="text-xs text-rose-800 leading-relaxed mb-3">{message}</p>
          {onRetry && (
            <button
              onClick={onRetry}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-white border border-rose-300 hover:bg-rose-100/50 text-rose-900 rounded text-xs font-semibold transition-colors"
            >
              <RefreshCw className="w-3.5 h-3.5" />
              <span>{actionLabel}</span>
            </button>
          )}
        </div>
      </div>
    </div>
  );
};
