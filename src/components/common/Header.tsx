import React, { useState, useEffect } from 'react';
import { apiClient, AppDataSourceMode } from '../../services/api/apiClient';

interface HeaderProps {
  onOpenOverview: () => void;
  isMenuOpen: boolean;
  onToggleMenu: () => void;
}

export const Header: React.FC<HeaderProps> = ({
  onOpenOverview,
  isMenuOpen,
  onToggleMenu,
}) => {
  const [dataMode, setDataMode] = useState<AppDataSourceMode>(apiClient.getMode());

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
    <header className="sticky top-0 z-40 w-full border-b border-slate-200/80 dark:border-slate-800 bg-white/95 dark:bg-slate-950/95 backdrop-blur-md transition-colors duration-200">
      <div className="w-full max-w-7xl mx-auto px-4 sm:px-8 h-16 flex items-center justify-between gap-4">
        {/* Left: Brand + API Status */}
        <div className="flex items-center gap-4 sm:gap-6">
          <div
            onClick={onOpenOverview}
            className="flex items-center gap-2.5 cursor-pointer group select-none"
            title="Go to Overview"
          >
            {/* Minimalist Vector Logo */}
            <div className="w-7 h-7 rounded-lg bg-slate-950 dark:bg-white flex items-center justify-center transition-transform duration-200 group-hover:scale-105">
              <svg viewBox="0 0 24 24" className="w-4 h-4 text-white dark:text-slate-950" fill="currentColor">
                <circle cx="6" cy="6" r="2.5" />
                <circle cx="18" cy="6" r="2.5" />
                <circle cx="6" cy="18" r="2.5" />
                <circle cx="18" cy="18" r="2.5" />
                <path d="M6 6L18 18M18 6L6 18" stroke="currentColor" strokeWidth="1.5" strokeOpacity="0.4" />
                <circle cx="12" cy="12" r="2" fill="#10b981" />
              </svg>
            </div>
            <span className="font-bold text-sm sm:text-base tracking-tight text-slate-950 dark:text-white uppercase">
              HealthGrid
            </span>
          </div>

          {/* Connected API Status Indicator */}
          <button
            onClick={toggleMode}
            title={`Active data source: ${dataMode === 'connected_api' ? 'Live REST API (:8000)' : 'Demo Preview (Offline)'}. Click to switch.`}
            className={`inline-flex items-center gap-2 px-2.5 py-1 rounded-full text-[11px] font-mono font-medium border leading-none shrink-0 transition-all duration-150 ${
              dataMode === 'connected_api'
                ? 'border-emerald-500/30 bg-emerald-500/10 text-emerald-800 dark:text-emerald-300 hover:bg-emerald-500/15'
                : 'border-amber-500/30 bg-amber-500/10 text-amber-800 dark:text-amber-300 hover:bg-amber-500/15'
            }`}
          >
            <span className="relative flex h-1.5 w-1.5">
              {dataMode === 'connected_api' && (
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
              )}
              <span
                className={`relative inline-flex rounded-full h-1.5 w-1.5 ${
                  dataMode === 'connected_api' ? 'bg-emerald-500' : 'bg-amber-500'
                }`}
              ></span>
            </span>
            <span className="uppercase tracking-wider text-[10px] font-semibold leading-none">
              {dataMode === 'connected_api' ? 'Connected :8000' : 'Demo Mode'}
            </span>
          </button>
        </div>

        {/* Right: Collapsible Menu Button */}
        <div className="flex items-center gap-3">
          <button
            onClick={onToggleMenu}
            className={`inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full text-xs font-mono font-bold tracking-widest uppercase leading-none shrink-0 transition-all duration-200 border ${
              isMenuOpen
                ? 'bg-slate-950 text-white dark:bg-white dark:text-slate-950 border-slate-950 dark:border-white shadow-xs'
                : 'border-slate-300 dark:border-slate-800 text-slate-900 dark:text-white hover:bg-slate-100 dark:hover:bg-slate-900'
            }`}
            aria-label="Toggle Menu"
          >
            <span>{isMenuOpen ? 'CLOSE' : 'MENU'}</span>
            {isMenuOpen ? (
              <span className="text-xs font-medium leading-none">✕</span>
            ) : (
              <span className="text-sm font-bold leading-none tracking-tighter">=</span>
            )}
          </button>
        </div>
      </div>
    </header>
  );
};

