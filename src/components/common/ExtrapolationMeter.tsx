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

  let badgeBg = 'bg-emerald-50 text-emerald-800 border-emerald-300';
  let RiskIcon = CheckCircle2;
  let statusText = 'INTERPOLATION (Within Observed Support)';

  if (overallRisk === 'HIGH') {
    badgeBg = 'bg-rose-50 text-rose-800 border-rose-300';
    RiskIcon = AlertCircle;
    statusText = 'REVIEW REQUIRED (Substantial Extrapolation)';
  } else if (overallRisk === 'MODERATE') {
    badgeBg = 'bg-amber-50 text-amber-800 border-amber-300';
    RiskIcon = AlertTriangle;
    statusText = 'MILD EXTRAPOLATION (Mechanism Driven)';
  }

  if (compact) {
    return (
      <div className="p-3 bg-slate-50 rounded-lg border border-slate-200">
        <div className="flex items-center justify-between gap-2">
          <div className="flex items-center gap-2">
            <span className="text-xs font-semibold text-slate-700">Extrapolation Risk:</span>
            <span className={`text-xs px-2 py-0.5 rounded border font-medium ${badgeBg}`}>
              {overallRisk} RISK
            </span>
          </div>
          <span className="text-xs text-slate-500 font-mono">
            Support Overlap: {supportOverlapScore}%
          </span>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-lg border border-slate-200 p-5">
      <div className="flex flex-wrap items-start justify-between gap-3 pb-4 border-b border-slate-200">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <h3 className="text-sm font-bold text-slate-900 uppercase tracking-wider">
              Extrapolation Meter
            </h3>
            <span className="text-[11px] bg-slate-100 text-slate-600 px-2 py-0.5 rounded font-mono">
              Honesty Indicator
            </span>
          </div>
          <p className="text-xs text-slate-600 max-w-xl leading-relaxed">
            Quantifies how far the requested synthetic cohort diverges from the observed sample support.
            Differentiates <strong>empirical interpolation</strong> from <strong>model-assumed extrapolation</strong>.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <span className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded text-xs font-semibold border ${badgeBg}`}>
            <RiskIcon className="w-4 h-4" />
            <span>{statusText}</span>
          </span>
        </div>
      </div>

      <div className="mt-4 space-y-3.5">
        {metrics.map((item, idx) => {
          const barColor =
            item.riskLevel === 'high'
              ? 'bg-rose-500'
              : item.riskLevel === 'moderate'
              ? 'bg-amber-500'
              : 'bg-emerald-600';

          const riskLabel =
            item.riskLevel === 'high'
              ? 'High Extrapolation'
              : item.riskLevel === 'moderate'
              ? 'Moderate'
              : 'Low (Within Support)';

          const riskBadge =
            item.riskLevel === 'high'
              ? 'text-rose-700 bg-rose-50 border-rose-200'
              : item.riskLevel === 'moderate'
              ? 'text-amber-700 bg-amber-50 border-amber-200'
              : 'text-emerald-700 bg-emerald-50 border-emerald-200';

          return (
            <div key={idx} className="p-3 rounded bg-slate-50 border border-slate-200/80">
              <div className="flex items-center justify-between gap-2 mb-1.5">
                <div className="flex items-center gap-2">
                  <span className="text-xs font-semibold text-slate-800">{item.dimension}</span>
                  <span className={`text-[10px] px-1.5 py-0.5 rounded border font-medium ${riskBadge}`}>
                    {riskLabel}
                  </span>
                </div>
                <div className="text-right text-[11px] text-slate-500 font-mono">
                  <span>Req: <strong>{item.requestedValue}</strong></span>
                  <span className="mx-1.5 text-slate-300">|</span>
                  <span>Observed: {item.observedBaseline}</span>
                </div>
              </div>

              {/* Statistical Support Bar */}
              <div className="w-full bg-slate-200 h-1.5 rounded-full overflow-hidden my-2">
                <div
                  className={`h-full ${barColor} transition-all duration-300 rounded-full`}
                  style={{ width: `${Math.max(8, item.score)}%` }}
                ></div>
              </div>

              <p className="text-[11px] text-slate-600 leading-normal">
                {item.note}
              </p>
            </div>
          );
        })}
      </div>

      <div className="mt-4 pt-3 border-t border-slate-100 flex items-center justify-between text-xs text-slate-500">
        <span className="flex items-center gap-1.5">
          <HelpCircle className="w-3.5 h-3.5 text-slate-400" />
          Higher extrapolation relies strictly on causal assumptions rather than sample density.
        </span>
        <span className="font-mono text-slate-700 font-medium">
          Source Support Overlap: {supportOverlapScore}%
        </span>
      </div>
    </div>
  );
};
