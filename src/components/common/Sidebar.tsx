import React from 'react';
import {
  LayoutDashboard,
  Database,
  Sliders,
  History,
  CheckCheck,
  ShieldAlert,
  FileCheck2,
  Download,
  BookOpen,
  HelpCircle,
  Cpu
} from 'lucide-react';

export type MainNavSection =
  | 'overview'
  | 'datasets'
  | 'cohort_builder'
  | 'generation_runs'
  | 'validation'
  | 'privacy'
  | 'cohort_passport'
  | 'exports';

interface SidebarProps {
  currentSection: MainNavSection;
  onSelectSection: (section: MainNavSection) => void;
  onOpenComplianceNotes: () => void;
}

export const Sidebar: React.FC<SidebarProps> = ({
  currentSection,
  onSelectSection,
  onOpenComplianceNotes,
}) => {
  const navItems: { id: MainNavSection; label: string; icon: React.FC<{ className?: string }> }[] = [
    { id: 'overview', label: 'Overview', icon: LayoutDashboard },
    { id: 'datasets', label: 'Datasets', icon: Database },
    { id: 'cohort_builder', label: 'Cohort Builder', icon: Sliders },
    { id: 'generation_runs', label: 'Generation Runs', icon: History },
    { id: 'validation', label: 'Validation', icon: CheckCheck },
    { id: 'privacy', label: 'Privacy Risk', icon: ShieldAlert },
    { id: 'cohort_passport', label: 'Cohort Passport', icon: FileCheck2 },
    { id: 'exports', label: 'Exports', icon: Download },
  ];

  return (
    <aside className="w-64 bg-white border-r border-slate-200 flex flex-col justify-between shrink-0 select-none">
      <div className="p-4">
        {/* Workspace Label */}
        <div className="px-3 mb-2 text-[11px] font-bold uppercase tracking-wider text-slate-400">
          Clinical Workspace
        </div>

        {/* Primary Navigation List */}
        <nav className="space-y-1">
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = currentSection === item.id;
            return (
              <button
                key={item.id}
                onClick={() => onSelectSection(item.id)}
                className={`w-full flex items-center gap-3 px-3 py-2 text-xs font-medium rounded-md transition-colors ${
                  isActive
                    ? 'bg-blue-50 text-blue-800 border-l-2 border-blue-600 font-semibold'
                    : 'text-slate-600 hover:text-slate-900 hover:bg-slate-50'
                }`}
              >
                <Icon className={`w-4 h-4 ${isActive ? 'text-blue-600' : 'text-slate-400'}`} />
                <span>{item.label}</span>
                {item.id === 'cohort_passport' && (
                  <span className="ml-auto text-[10px] bg-slate-100 text-slate-600 px-1.5 py-0.2 rounded font-mono">
                    Audit
                  </span>
                )}
              </button>
            );
          })}
        </nav>
      </div>

      {/* Bottom Section: Research & Compliance Notes & Engine Status */}
      <div className="p-4 border-t border-slate-200 bg-slate-50/50 space-y-3">
        <button
          onClick={onOpenComplianceNotes}
          className="w-full flex items-center gap-2.5 px-3 py-2 text-xs font-medium text-slate-600 hover:text-slate-900 hover:bg-white rounded border border-transparent hover:border-slate-200 transition-colors"
        >
          <BookOpen className="w-4 h-4 text-slate-400" />
          <span>Research & Compliance Notes</span>
        </button>

        <div className="p-3 bg-white rounded border border-slate-200 text-xs">
          <div className="flex items-center gap-2 text-slate-700 font-semibold mb-1">
            <Cpu className="w-3.5 h-3.5 text-emerald-600" />
            <span>Local Engine Active</span>
          </div>
          <p className="text-[11px] text-slate-500 leading-normal">
            Deterministic SCM. Low-parameter conditional model (CPU-efficient).
          </p>
        </div>

        <div className="text-[10px] text-slate-400 text-center font-mono">
          HealthGrid Clinical Core v2.4.0
        </div>
      </div>
    </aside>
  );
};
