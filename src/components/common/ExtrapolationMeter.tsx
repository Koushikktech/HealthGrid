import React from 'react';
import { ExtrapolationAssessment } from '../../types';
import { AlertCircle, CheckCircle2, AlertTriangle, HelpCircle } from 'lucide-react';

interface ExtrapolationMeterProps {
  assessment: ExtrapolationAssessment;
  compact?: boolean;
}

export const ExtrapolationMeter: React.FC<ExtrapolationMeterProps> = ({
  assessment,
  compact = false,
}) => {
  const { overallRisk, status, supportOverlapScore, metrics } = assessment;

  let badgeBg = 'bg-emerald-500/10 text-emerald-700 dark:text-emerald-300 border-emerald-500/30';
  let RiskIcon = CheckCircle2;
  let statusText = 'INTERPOLATION (Within Support)';

  if (overallRisk === 'HIGH') {
    badgeBg = 'bg-rose-500/10 text-rose-700 dark:text-rose-300 border-rose-500/30';
    RiskIcon = AlertCircle;
    statusText = 'REVIEW REQUIRED (Extrapolation)';
  } else if (overallRisk === 'MODERATE') {
    badgeBg = 'bg-amber-500/10 text-amber-700 dark:text-amber-300 border-amber-500/30';
    RiskIcon = AlertTriangle;
    statusText = 'MILD EXTRAPOLATION (Mechanism Driven)';
  }

  if (compact) {
    return (
      <div className="p-3.5 glass-card rounded-2xl">
        <div className="flex items-center justify-between gap-2">
          <div className="flex items-center gap-2">
            <span className="text-xs font-semibold text-slate-700 dark:text-slate-300">Extrapolation Risk:</span>
            <span className={`text-xs px-2.5 py-0.5 rounded-full border font-semibold glass-pill shrink-0 inline-flex items-center justify-center leading-none ${badgeBg}`}>
              {overallRisk} RISK
            </span>
          </div>
          <span className="text-xs text-slate-500 dark:text-slate-400 font-mono">
            Support Overlap: {supportOverlapScore}%
          </span>
        </div>
      </div>
    );
  }

  return (
    <div className="glass-card rounded-3xl p-6 md:p-7">
      <div className="flex flex-wrap items-start justify-between gap-3 pb-4 border-b border-slate-200/60 dark:border-white/5">
        <div>
          <div className="flex items-center gap-2 mb-1.5">
            <h3 className="text-sm font-bold text-slate-900 dark:text-white uppercase tracking-wider">
              Extrapolation Meter
            </h3>
            <span className="text-[10px] glass-pill text-slate-600 dark:text-slate-300 px-2 py-0.5 rounded-full font-mono uppercase tracking-wider shrink-0 inline-flex items-center justify-center leading-none">
              Honesty Indicator
            </span>
          </div>
          <p className="text-xs text-slate-600 dark:text-slate-300 max-w-xl leading-relaxed">
            Quantifies how far the requested synthetic cohort diverges from observed sample support.
            Differentiates <strong>empirical interpolation</strong> from <strong>model-assumed extrapolation</strong>.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <span className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-semibold glass-pill shrink-0 leading-none ${badgeBg}`}>
            <RiskIcon className="w-3.5 h-3.5" />
            <span>{statusText}</span>
          </span>
        </div>
      </div>

      <div className="mt-5 space-y-3.5">
        {metrics.map((item, idx) => {
          const barColor =
            item.riskLevel === 'high'
              ? 'bg-rose-500 shadow-xs shadow-rose-500/40'
              : item.riskLevel === 'moderate'
              ? 'bg-amber-500 shadow-xs shadow-amber-500/40'
              : 'bg-emerald-500 shadow-xs shadow-emerald-500/40';

          const riskLabel =
            item.riskLevel === 'high'
              ? 'High Extrapolation'
              : item.riskLevel === 'moderate'
              ? 'Moderate'
              : 'Low (Within Support)';

          const riskBadge =
            item.riskLevel === 'high'
              ? 'text-rose-700 dark:text-rose-300 bg-rose-500/10 border-rose-500/20'
              : item.riskLevel === 'moderate'
              ? 'text-amber-700 dark:text-amber-300 bg-amber-500/10 border-amber-500/20'
              : 'text-emerald-700 dark:text-emerald-300 bg-emerald-500/10 border-emerald-500/20';

          return (
            <div key={idx} className="p-3.5 rounded-2xl bg-slate-50/70 dark:bg-white/[0.02] border border-slate-200/60 dark:border-white/5 transition-all hover:border-blue-500/20">
              <div className="flex items-center justify-between gap-2 mb-1.5">
                <div className="flex items-center gap-2">
                  <span className="text-xs font-semibold text-slate-800 dark:text-slate-200">{item.dimension}</span>
                  <span className={`text-[10px] px-2 py-0.5 rounded-full border font-semibold shrink-0 inline-flex items-center justify-center leading-none ${riskBadge}`}>
                    {riskLabel}
                  </span>
                </div>
                <div className="text-right text-[11px] text-slate-500 dark:text-slate-400 font-mono">
                  <span>Req: <strong className="text-slate-800 dark:text-slate-200">{item.requestedValue}</strong></span>
                  <span className="mx-1.5 text-slate-300 dark:text-slate-600">|</span>
                  <span>Observed: {item.observedBaseline}</span>
                </div>
              </div>

              {/* Statistical Support Bar */}
              <div className="w-full bg-slate-200/70 dark:bg-slate-700/50 h-2 rounded-full overflow-hidden my-2.5">
                <div
                  className={`h-full ${barColor} transition-all duration-500 rounded-full`}
                  style={{ width: `${Math.max(8, item.score)}%` }}
                ></div>
              </div>

              <p className="text-[11px] text-slate-600 dark:text-slate-400 leading-relaxed">
                {item.note}
              </p>
            </div>
          );
        })}
      </div>

      <div className="mt-5 pt-3.5 border-t border-slate-200/60 dark:border-white/5 flex flex-wrap items-center justify-between gap-2 text-xs text-slate-500 dark:text-slate-400">
        <span className="flex items-center gap-1.5">
          <HelpCircle className="w-3.5 h-3.5 text-slate-400" />
          Higher extrapolation relies on structural model assumptions rather than sample density.
        </span>
        <span className="font-mono text-slate-700 dark:text-slate-300 font-medium">
          Source Support Overlap: {supportOverlapScore}%
        </span>
      </div>
    </div>
  );
};
