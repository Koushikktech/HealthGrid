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

  let bg = 'bg-slate-100 text-slate-700 border-slate-300';
  let Icon = HelpCircle;
  let label = status;

  if (norm === 'PASS' || norm === 'COMPLETE' || norm === 'VALIDATED') {
    bg = 'bg-emerald-50 text-emerald-800 border-emerald-300';
    Icon = CheckCircle2;
    label = norm === 'VALIDATED' ? 'Validated' : norm === 'COMPLETE' ? 'Complete' : 'PASS';
  } else if (norm === 'CONDITIONAL') {
    bg = 'bg-amber-50 text-amber-800 border-amber-300';
    Icon = AlertTriangle;
    label = 'CONDITIONAL';
  } else if (norm === 'REVIEW') {
    bg = 'bg-amber-50 text-amber-800 border-amber-300';
    Icon = AlertTriangle;
    label = 'REVIEW';
  } else if (norm === 'FAIL' || norm === 'FAILED') {
    bg = 'bg-rose-50 text-rose-800 border-rose-300';
    Icon = XCircle;
    label = norm === 'FAILED' ? 'Failed' : 'FAIL';
  } else if (norm === 'PENDING' || norm === 'RUNNING' || norm === 'GENERATING') {
    bg = 'bg-sky-50 text-sky-800 border-sky-300';
    Icon = Clock;
    label = norm === 'GENERATING' ? 'Generating...' : norm === 'RUNNING' ? 'Running...' : 'Pending';
  } else if (norm === 'NOT_CALCULATED' || norm === 'NOT YET CALCULATED') {
    bg = 'bg-slate-100 text-slate-600 border-slate-300';
    Icon = HelpCircle;
    label = 'Not Yet Calculated';
  }

  const sizeClass = size === 'sm' ? 'px-2 py-0.5 text-xs' : 'px-2.5 py-1 text-xs';

  return (
    <span
      className={`inline-flex items-center gap-1.5 font-medium rounded border ${bg} ${sizeClass} tracking-wide`}
    >
      {showIcon && <Icon className={size === 'sm' ? 'w-3 h-3' : 'w-3.5 h-3.5 shrink-0'} />}
      <span>{label}</span>
    </span>
  );
};
