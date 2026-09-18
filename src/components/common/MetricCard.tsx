import React from 'react';
import { ValidationMetricItem } from '../../types';
import { StatusBadge } from './StatusBadge';
import { Info } from 'lucide-react';

interface MetricCardProps {
  metric: ValidationMetricItem;
  isLoading?: boolean;
}

export const MetricCard: React.FC<MetricCardProps> = ({ metric, isLoading = false }) => {
  const isCalculated = metric.value !== null && metric.status !== 'NOT_CALCULATED';

  if (isLoading) {
    return (
      <div className="bg-white p-4 rounded-lg border border-slate-200 animate-pulse">
        <div className="h-4 bg-slate-200 rounded w-2/3 mb-3"></div>
        <div className="h-7 bg-slate-200 rounded w-1/3 mb-2"></div>
        <div className="h-3 bg-slate-100 rounded w-full mb-2"></div>
        <div className="h-3 bg-slate-100 rounded w-4/5"></div>
      </div>
    );
  }

  return (
    <div className="bg-white p-4 rounded-lg border border-slate-200 hover:border-slate-300 transition-colors shadow-none flex flex-col justify-between">
      <div>
        <div className="flex items-start justify-between gap-2 mb-2">
          <h4 className="text-sm font-semibold text-slate-800 leading-snug">{metric.name}</h4>
          <StatusBadge status={metric.status} size="sm" />
        </div>

        <div className="my-2.5">
          {isCalculated ? (
            <div className="flex items-baseline gap-2">
              <span className="text-2xl font-bold tracking-tight text-slate-900 tabular-nums">
                {typeof metric.value === 'number'
                  ? Number.isInteger(metric.value)
                    ? metric.value.toLocaleString()
                    : metric.value.toFixed(3)
                  : metric.value}
              </span>
              <span className="text-xs text-slate-500 font-mono">
                Threshold: {metric.threshold}
              </span>
            </div>
          ) : (
            <div className="py-1">
              <span className="text-sm italic font-medium text-slate-500 bg-slate-100 px-2.5 py-1 rounded">
                Not yet calculated
              </span>
            </div>
          )}
        </div>

        <p className="text-xs text-slate-600 leading-relaxed mb-2">
          {isCalculated ? metric.shortEvidence : 'Awaiting validation execution on this cohort.'}
        </p>
      </div>

      <div className="pt-2 border-t border-slate-100 text-[11px] text-slate-500 flex items-center gap-1.5">
        <Info className="w-3 h-3 text-slate-400 shrink-0" />
        <span className="truncate">{metric.benchmark}</span>
      </div>
    </div>
  );
};
