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
      <div className="glass-card p-4 sm:p-5 rounded-2xl animate-pulse">
        <div className="h-4 bg-slate-200/70 rounded-full w-2/3 mb-3"></div>
        <div className="h-8 bg-slate-200/70 rounded-xl w-1/3 mb-2"></div>
        <div className="h-3 bg-slate-200/50 rounded-full w-full mb-2"></div>
        <div className="h-3 bg-slate-200/50 rounded-full w-4/5"></div>
      </div>
    );
  }

  return (
    <div className="glass-card p-4 sm:p-5 rounded-2xl transition-all duration-200 hover:-translate-y-0.5 hover:shadow-md hover:border-blue-200/50 flex flex-col justify-between group">
      <div>
        <div className="flex items-start justify-between gap-2 mb-2">
          <h4 className="text-xs font-bold text-slate-900 dark:text-white tracking-tight leading-snug min-w-0 pr-1">{metric.name}</h4>
          <StatusBadge status={metric.status} size="sm" />
        </div>

        <div className="my-2.5">
          {isCalculated ? (
            <div className="flex items-baseline gap-2 flex-wrap">
              <span className="text-2xl font-bold tracking-tight text-slate-900 dark:text-white tabular-nums">
                {typeof metric.value === 'number'
                  ? Number.isInteger(metric.value)
                    ? metric.value.toLocaleString()
                    : metric.value.toFixed(3)
                  : metric.value}
              </span>
              <span className="text-[11px] text-slate-600 dark:text-slate-400 font-mono tracking-tight font-medium">
                {metric.threshold}
              </span>
            </div>
          ) : (
            <div className="py-1">
              <span className="text-xs italic font-medium text-slate-600 dark:text-slate-400 glass-pill px-2.5 py-1 rounded-full inline-flex items-center leading-none shrink-0">
                Awaiting Run
              </span>
            </div>
          )}
        </div>

        <p className="text-[11px] text-slate-600 dark:text-slate-300 leading-relaxed mb-2 tracking-tight font-normal">
          {isCalculated ? metric.shortEvidence : 'Awaiting validation execution on this cohort.'}
        </p>
      </div>

      <div className="pt-2.5 border-t border-slate-200/80 dark:border-slate-800 text-[10px] text-slate-600 dark:text-slate-400 flex items-center gap-1.5 font-mono font-medium min-w-0">
        <Info className="w-3 h-3 text-slate-500 dark:text-slate-400 shrink-0" />
        <span className="truncate min-w-0">{metric.benchmark}</span>
      </div>
    </div>
  );
};
