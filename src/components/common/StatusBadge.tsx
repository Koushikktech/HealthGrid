import React from 'react';
import { StatusVerdict } from '../../types';
import { CheckCircle2, AlertTriangle, XCircle, Clock, HelpCircle } from 'lucide-react';

interface StatusBadgeProps {
  status: StatusVerdict | string;
  size?: 'sm' | 'md';
  showIcon?: boolean;
}

export const StatusBadge: React.FC<StatusBadgeProps> = ({
  status,
  size = 'md',
  showIcon = true,
}) => {
  const norm = (status || '').toUpperCase();

  let bg = 'bg-slate-500/10 text-slate-700 dark:text-slate-300 border-slate-300/40 dark:border-slate-700';
  let Icon = HelpCircle;
  let label = status;
  let dotColor = 'bg-slate-400';

  if (norm === 'PASS' || norm === 'COMPLETE' || norm === 'VALIDATED') {
    bg = 'bg-emerald-500/15 text-emerald-950 dark:text-emerald-300 border-emerald-400/35 dark:border-emerald-500/30 shadow-emerald-500/5';
    Icon = CheckCircle2;
    dotColor = 'bg-emerald-500';
    label = norm === 'VALIDATED' ? 'Validated' : norm === 'COMPLETE' ? 'Complete' : 'PASS';
  } else if (norm === 'CONDITIONAL') {
    bg = 'bg-amber-500/15 text-amber-950 dark:text-amber-300 border-amber-400/40 dark:border-amber-500/30 shadow-amber-500/5';
    Icon = AlertTriangle;
    dotColor = 'bg-amber-500';
    label = 'CONDITIONAL';
  } else if (norm === 'REVIEW') {
    bg = 'bg-amber-500/15 text-amber-950 dark:text-amber-300 border-amber-400/40 dark:border-amber-500/30 shadow-amber-500/5';
    Icon = AlertTriangle;
    dotColor = 'bg-amber-500';
    label = 'REVIEW';
  } else if (norm === 'FAIL' || norm === 'FAILED') {
    bg = 'bg-rose-500/15 text-rose-950 dark:text-rose-300 border-rose-400/40 dark:border-rose-500/30 shadow-rose-500/5';
    Icon = XCircle;
    dotColor = 'bg-rose-500';
    label = norm === 'FAILED' ? 'Failed' : 'FAIL';
  } else if (norm === 'PENDING' || norm === 'RUNNING' || norm === 'GENERATING') {
    bg = 'bg-sky-500/15 text-sky-950 dark:text-sky-300 border-sky-400/40 dark:border-sky-500/30 shadow-sky-500/5';
    Icon = Clock;
    dotColor = 'bg-sky-500 animate-pulse';
    label = norm === 'GENERATING' ? 'Generating...' : norm === 'RUNNING' ? 'Running...' : 'Pending';
  } else if (norm === 'NOT_CALCULATED' || norm === 'NOT YET CALCULATED') {
    bg = 'bg-slate-500/10 text-slate-700 dark:text-slate-300 border-slate-300/50 dark:border-slate-700';
    Icon = HelpCircle;
    dotColor = 'bg-slate-400';
    label = 'Not Yet Calculated';
  }

  const sizeClass = size === 'sm' ? 'px-2.5 py-1 text-[10px]' : 'px-3 py-1.5 text-[11px]';

  return (
    <span
      className={`inline-flex items-center gap-1.5 font-semibold rounded-full border backdrop-blur-md shadow-2xs ${bg} ${sizeClass} tracking-tight shrink-0 leading-none select-none whitespace-nowrap transition-all duration-150`}
    >
      {showIcon ? (
        <Icon className={size === 'sm' ? 'w-3 h-3 shrink-0' : 'w-3.5 h-3.5 shrink-0'} />
      ) : (
        <span className={`w-1.5 h-1.5 rounded-full ${dotColor} shrink-0`} />
      )}
      <span className="leading-none">{label}</span>
    </span>
  );
};
