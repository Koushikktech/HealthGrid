import React from 'react';
import { LucideIcon, FileSpreadsheet } from 'lucide-react';

interface EmptyStateProps {
  title: string;
  description: string;
  actionLabel?: string;
  onAction?: () => void;
  icon?: LucideIcon;
}

export const EmptyState: React.FC<EmptyStateProps> = ({
  title,
  description,
  actionLabel,
  onAction,
  icon: Icon = FileSpreadsheet,
}) => {
  return (
    <div className="p-8 text-center glass-card rounded-3xl border-2 border-dashed border-slate-300/80 dark:border-slate-700/80 max-w-lg mx-auto my-6 shadow-sm">
      <div className="w-12 h-12 rounded-2xl bg-slate-100 dark:bg-slate-800 flex items-center justify-center mx-auto mb-3.5 text-slate-500 dark:text-slate-400 shadow-inner">
        <Icon className="w-6 h-6" />
      </div>
      <h3 className="text-sm font-bold text-slate-900 dark:text-white mb-1.5">{title}</h3>
      <p className="text-xs text-slate-600 dark:text-slate-400 mb-4 max-w-sm mx-auto leading-relaxed font-normal">{description}</p>
      {actionLabel && onAction && (
        <button
          onClick={onAction}
          className="px-4 py-2 bg-blue-600 hover:bg-blue-500 text-white rounded-xl text-xs font-semibold transition-all shadow-sm hover:shadow-md hover:-translate-y-0.5 active:translate-y-0"
        >
          {actionLabel}
        </button>
      )}
    </div>
  );
};
