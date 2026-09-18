import React from 'react';
import { Loader2 } from 'lucide-react';

interface LoadingSkeletonProps {
  label?: string;
  subtext?: string;
  variant?: 'card' | 'table' | 'chart' | 'page';
}

export const LoadingSkeleton: React.FC<LoadingSkeletonProps> = ({
  label = 'Processing...',
  subtext = 'Performing mathematical calculations on sample data.',
  variant = 'page',
}) => {
  return (
    <div className="w-full p-8 flex flex-col items-center justify-center text-center">
      <div className="flex items-center justify-center w-10 h-10 rounded-full bg-blue-50 border border-blue-100 mb-3 text-blue-600">
        <Loader2 className="w-5 h-5 animate-spin" />
      </div>
      <h4 className="text-sm font-bold text-slate-800 tracking-tight">{label}</h4>
      <p className="text-xs text-slate-500 max-w-sm mt-1 mb-6 leading-relaxed">{subtext}</p>

      {/* Structured placeholder lines */}
      <div className="w-full max-w-md space-y-2.5 animate-pulse">
        <div className="h-3 bg-slate-200 rounded w-full"></div>
        <div className="h-3 bg-slate-100 rounded w-5/6 mx-auto"></div>
        <div className="h-3 bg-slate-200 rounded w-4/6 mx-auto"></div>
      </div>
    </div>
  );
};
