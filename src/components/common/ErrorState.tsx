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
    <div className="p-6 glass-card bg-rose-500/10 border border-rose-500/25 rounded-3xl max-w-lg mx-auto my-6 text-slate-800 dark:text-slate-200 shadow-sm">
      <div className="flex items-start gap-3">
        <AlertCircle className="w-5 h-5 text-rose-600 dark:text-rose-400 shrink-0 mt-0.5" />
        <div className="flex-1">
          <h4 className="text-sm font-bold text-rose-950 dark:text-rose-200 mb-1">{title}</h4>
          <p className="text-xs text-rose-800 dark:text-rose-300 leading-relaxed mb-3 font-normal">{message}</p>
          {onRetry && (
            <button
              onClick={onRetry}
              className="inline-flex items-center gap-1.5 px-3.5 py-1.5 glass-pill border border-rose-300/80 dark:border-rose-800/80 hover:bg-white dark:hover:bg-slate-800 text-rose-900 dark:text-rose-200 rounded-xl text-xs font-semibold transition-all shadow-2xs"
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
