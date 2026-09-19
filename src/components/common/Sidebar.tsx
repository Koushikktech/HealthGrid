import React, { useEffect } from 'react';
import {
  LayoutDashboard,
  Sliders,
  History,
  CheckCheck,
  ShieldAlert,
  FileCheck2,
  Download,
  BookOpen,
  ArrowUpRight,
  X
} from 'lucide-react';

export type MainNavSection =
  | 'overview'
  | 'generate_dataset'
  | 'generation_runs'
  | 'validation'
  | 'privacy'
  | 'cohort_passport'
  | 'exports';

interface SidebarProps {
  isOpen: boolean;
  onClose: () => void;
  currentSection: MainNavSection;
  onSelectSection: (section: MainNavSection) => void;
  onOpenComplianceNotes: () => void;
}

export const Sidebar: React.FC<SidebarProps> = ({
  isOpen,
  onClose,
  currentSection,
  onSelectSection,
  onOpenComplianceNotes,
}) => {
  // Close drawer on Escape key press
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && isOpen) {
        onClose();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  const navItems: {
    id: MainNavSection;
    num: string;
    label: string;
    desc: string;
    icon: React.FC<{ className?: string }>;
  }[] = [
    {
      id: 'overview',
      num: '01',
      label: 'Overview',
      desc: 'Platform summary & synthesis telemetry',
      icon: LayoutDashboard,
    },
    {
      id: 'generate_dataset',
      num: '02',
      label: 'Generate Data',
      desc: '5-step guided flow: Upload, parameters, synthesis & data explorer',
      icon: Sliders,
    },
    {
      id: 'generation_runs',
      num: '03',
      label: 'Generation Runs',
      desc: 'Active jobs, pipeline logs & artifact builds',
      icon: History,
    },
    {
      id: 'validation',
      num: '04',
      label: 'Validation Engine',
      desc: 'Kolmogorov-Smirnov, pairwise & correlation fidelity',
      icon: CheckCheck,
    },
    {
      id: 'privacy',
      num: '05',
      label: 'Privacy Risk Audit',
      desc: 'MIA shadow attack & nearest-neighbor leakage',
      icon: ShieldAlert,
    },
    {
      id: 'cohort_passport',
      num: '06',
      label: 'Cohort Passport',
      desc: 'Cryptographic empirical integrity certificate',
      icon: FileCheck2,
    },
    {
      id: 'exports',
      num: '07',
      label: 'Data Exports',
      desc: 'CDISC SDTM, Parquet, CSV & FHIR resources',
      icon: Download,
    },
  ];

  return (
    <div className="fixed inset-0 z-50 overflow-hidden select-none">
      {/* Backdrop */}
      <div
        onClick={onClose}
        className="fixed inset-0 bg-slate-950/40 dark:bg-black/70 backdrop-blur-xs transition-opacity animate-in fade-in duration-200"
        aria-hidden="true"
      />

      {/* Slide-Over Menu Panel */}
      <div className="fixed inset-y-0 right-0 max-w-full flex pl-8">
        <aside
          role="dialog"
          aria-modal="true"
          aria-label="Navigation Menu"
          className="w-screen max-w-md bg-white dark:bg-slate-950 border-l border-slate-200 dark:border-slate-800 shadow-2xl flex flex-col justify-between p-6 sm:p-8 animate-in slide-in-from-right duration-200 overflow-y-auto"
        >
          {/* Header */}
          <div className="flex items-center justify-between pb-6 border-b border-slate-200/80 dark:border-slate-800/80">
            <div
              onClick={() => {
                onSelectSection('overview');
                onClose();
              }}
              className="cursor-pointer group select-none"
              title="Go to Overview"
            >
              <span className="font-mono text-[11px] uppercase tracking-widest text-slate-500 dark:text-slate-400 font-semibold group-hover:text-blue-600 transition-colors">
                Menu / Workspace
              </span>
              <h2 className="text-lg font-bold tracking-tight text-slate-950 dark:text-white mt-0.5 group-hover:text-blue-600 transition-colors">
                HealthGrid SCM
              </h2>
            </div>
            <button
              onClick={onClose}
              className="w-9 h-9 rounded-full border border-slate-200 dark:border-slate-800 flex items-center justify-center text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-900 transition-colors"
              aria-label="Close menu"
            >
              <X className="w-4 h-4" />
            </button>
          </div>

          {/* Navigation Items */}
          <nav className="py-6 space-y-1.5 flex-1">
            {navItems.map((item) => {
              const isActive = currentSection === item.id;
              const Icon = item.icon;
              return (
                <button
                  key={item.id}
                  onClick={() => {
                    onSelectSection(item.id);
                    onClose();
                  }}
                  className={`w-full group text-left px-4 py-3 rounded-2xl flex items-start gap-3.5 transition-all duration-150 ${
                    isActive
                      ? 'bg-slate-900 text-white dark:bg-white dark:text-slate-950 shadow-sm'
                      : 'hover:bg-slate-100 dark:hover:bg-slate-900 text-slate-800 dark:text-slate-200'
                  }`}
                >
                  <span
                    className={`font-mono text-[11px] font-semibold pt-0.5 ${
                      isActive
                        ? 'text-slate-300 dark:text-slate-600'
                        : 'text-slate-500 dark:text-slate-500 group-hover:text-slate-900 dark:group-hover:text-white'
                    }`}
                  >
                    {item.num}
                  </span>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between">
                      <span className="font-bold text-sm tracking-tight">{item.label}</span>
                      <ArrowUpRight
                        className={`w-4 h-4 opacity-0 -translate-x-1 translate-y-1 transition-all group-hover:opacity-100 group-hover:translate-x-0 group-hover:translate-y-0 ${
                          isActive ? 'opacity-100 translate-x-0 translate-y-0 text-white dark:text-slate-950' : 'text-slate-500'
                        }`}
                      />
                    </div>
                    <p
                      className={`text-[11px] truncate mt-0.5 ${
                        isActive
                          ? 'text-slate-300 dark:text-slate-600'
                          : 'text-slate-500 dark:text-slate-400'
                      }`}
                    >
                      {item.desc}
                    </p>
                  </div>
                </button>
              );
            })}
          </nav>

          {/* Footer: Compliance & Version */}
          <div className="pt-5 border-t border-slate-200/80 dark:border-slate-800/80 space-y-3">
            <button
              onClick={() => {
                onOpenComplianceNotes();
                onClose();
              }}
              className="w-full flex items-center justify-between px-4 py-2.5 rounded-xl border border-slate-200 dark:border-slate-800 text-xs font-semibold text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-900 transition-colors"
            >
              <div className="flex items-center gap-2">
                <BookOpen className="w-3.5 h-3.5 text-slate-500" />
                <span>Compliance &amp; Method Notes</span>
              </div>
              <ArrowUpRight className="w-3.5 h-3.5 text-slate-500" />
            </button>

            <div className="flex items-center justify-between px-1 text-[10px] font-mono text-slate-500 dark:text-slate-400">
              <span>CLINICAL SCM v2.4.0</span>
              <span>PRESS [ESC] TO CLOSE</span>
            </div>
          </div>
        </aside>
      </div>
    </div>
  );
};
