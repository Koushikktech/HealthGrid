import React, { useState, useEffect } from 'react';
import { apiClient, AppDataSourceMode } from '../../services/api/apiClient';
import { Database, Activity, ShieldCheck, ChevronDown, User, Server } from 'lucide-react';

interface HeaderProps {
  currentProject: string;
  onSelectProject: (proj: string) => void;
  onOpenLanding: () => void;
}

export const Header: React.FC<HeaderProps> = ({
  currentProject,
  onSelectProject,
  onOpenLanding,
}) => {
  const [dataMode, setDataMode] = useState<AppDataSourceMode>(apiClient.getMode());
  const [projectDropdownOpen, setProjectDropdownOpen] = useState(false);

  useEffect(() => {
    return apiClient.onModeChange((newMode) => {
      setDataMode(newMode);
    });
  }, []);

  const toggleMode = () => {
    const next = dataMode === 'demo_preview' ? 'connected_api' : 'demo_preview';
    apiClient.setMode(next);
    setDataMode(next);
  };

  return (
    <header className="bg-white border-b border-slate-200 sticky top-0 z-30">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between gap-4">
        {/* Brand & Tagline */}
        <div className="flex items-center gap-3">
          <div
            onClick={onOpenLanding}
            className="flex items-center gap-2.5 cursor-pointer group"
            title="View Platform Overview"
          >
            <div className="w-8 h-8 rounded bg-slate-900 flex items-center justify-center p-1.5 border border-slate-700">
              <svg viewBox="0 0 32 32" className="w-full h-full" fill="none">
                <circle cx="10" cy="10" r="3.5" fill="#38bdf8" />
                <circle cx="22" cy="10" r="3.5" fill="#0ea5e9" />
                <circle cx="10" cy="22" r="3.5" fill="#0284c7" />
                <circle cx="22" cy="22" r="3.5" fill="#2563eb" />
                <line x1="10" y1="10" x2="22" y2="10" stroke="#94a3b8" strokeWidth="1.5" strokeDasharray="2 1" />
                <line x1="10" y1="22" x2="22" y2="22" stroke="#94a3b8" strokeWidth="1.5" />
                <line x1="10" y1="10" x2="10" y2="22" stroke="#94a3b8" strokeWidth="1.5" />
                <line x1="22" y1="10" x2="22" y2="22" stroke="#94a3b8" strokeWidth="1.5" />
                <circle cx="16" cy="16" r="3" fill="#10b981" />
                <circle cx="16" cy="16" r="1.2" fill="#ffffff" />
              </svg>
            </div>
            <div>
              <div className="flex items-baseline gap-2">
                <span className="text-base font-bold text-slate-900 tracking-tight">HealthGrid</span>
                <span className="hidden sm:inline-block text-[10px] text-blue-700 bg-blue-50 border border-blue-200 px-1.5 py-0.2 rounded font-semibold uppercase tracking-wider">
                  v2.4 Clinical
                </span>
              </div>
              <p className="hidden md:block text-[11px] text-slate-500 -mt-0.5">
                Generate synthetic cohorts. Validate before you use them.
              </p>
            </div>
          </div>
        </div>

        {/* Project Selector & Status */}
        <div className="flex items-center gap-3">
          <div className="relative">
            <button
              onClick={() => setProjectDropdownOpen(!projectDropdownOpen)}
              className="flex items-center gap-2 px-3 py-1.5 bg-slate-50 hover:bg-slate-100 rounded border border-slate-200 text-xs font-medium text-slate-800 transition-colors"
            >
              <Database className="w-3.5 h-3.5 text-slate-500" />
              <span className="max-w-[180px] truncate">{currentProject}</span>
              <ChevronDown className="w-3 h-3 text-slate-400" />
            </button>

            {projectDropdownOpen && (
              <div className="absolute right-0 mt-1 w-64 bg-white rounded-lg shadow-lg border border-slate-200 py-1 z-50">
                <div className="px-3 py-1.5 text-[11px] font-semibold text-slate-400 uppercase tracking-wider">
                  Switch Active Project
                </div>
                {[
                  'Cardiometabolic Study 2026',
                  'Hypertension Digital Care Pilot (Phase II)',
                  'Diabetic Prevention Lifestyle Cohort',
                ].map((proj) => (
                  <button
                    key={proj}
                    onClick={() => {
                      onSelectProject(proj);
                      setProjectDropdownOpen(false);
                    }}
                    className={`w-full text-left px-3 py-2 text-xs hover:bg-slate-50 flex items-center justify-between ${
                      currentProject === proj ? 'font-semibold text-blue-700 bg-blue-50/50' : 'text-slate-700'
                    }`}
                  >
                    <span className="truncate">{proj}</span>
                    {currentProject === proj && <span className="w-1.5 h-1.5 rounded-full bg-blue-600"></span>}
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Honest Data Source Mode Indicator */}
          <div className="flex items-center">
            <button
              onClick={toggleMode}
              title="Click to toggle between Demo Development Preview and Live REST API mode"
              className={`flex items-center gap-1.5 px-2.5 py-1 rounded text-xs border font-medium transition-colors ${
                dataMode === 'demo_preview'
                  ? 'bg-amber-50 text-amber-800 border-amber-300 hover:bg-amber-100/70'
                  : 'bg-emerald-50 text-emerald-800 border-emerald-300 hover:bg-emerald-100/70'
              }`}
            >
              <Server className="w-3.5 h-3.5" />
              <span className="hidden sm:inline font-mono">
                {dataMode === 'demo_preview' ? 'Demo Fixture Mode' : 'Connected API Mode'}
              </span>
              <span className="text-[10px] uppercase font-bold opacity-75 underline decoration-dotted ml-0.5">
                Toggle
              </span>
            </button>
          </div>

          {/* User Profile */}
          <div className="hidden lg:flex items-center gap-2 pl-2 border-l border-slate-200 text-xs text-slate-600">
            <div className="w-7 h-7 rounded-full bg-slate-100 border border-slate-300 flex items-center justify-center text-slate-700 font-semibold text-xs">
              KM
            </div>
            <div>
              <div className="font-semibold text-slate-800 leading-tight">Dr. Kailas M.</div>
              <div className="text-[10px] text-slate-500">Lead Investigator</div>
            </div>
          </div>
        </div>
      </div>
    </header>
  );
};
