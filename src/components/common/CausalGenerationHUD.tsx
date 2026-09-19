import React, { useEffect, useRef, useState, useMemo } from 'react';
import {
  Activity,
  GitBranch,
  ShieldCheck,
  Cpu,
  Layers,
  Zap,
  Check,
  Sparkles,
  Database,
  Terminal,
} from 'lucide-react';
import { CohortConfiguration } from '../../types';

interface CausalGenerationHUDProps {
  progress: number;
  stage: number;
  message: string;
  config: CohortConfiguration;
  datasetName?: string;
}

export const CausalGenerationHUD: React.FC<CausalGenerationHUDProps> = ({
  progress,
  stage,
  message,
  config,
  datasetName = 'Cardiometabolic Reference Cohort',
}) => {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const [tickerTick, setTickerTick] = useState(0);

  // Smooth live telemetry values derived from progress
  const epoch = Math.min(100, Math.max(1, Math.floor(progress * 1.02)));
  const loss = Math.max(0.0312, 0.462 * Math.exp(-progress / 28) + 0.031).toFixed(4);
  const wasserstein = Math.max(0.0108, 0.194 * Math.exp(-progress / 32) + 0.011).toFixed(4);
  const generatedCount = Math.floor((progress / 100) * config.targetPatients);

  // Ticker timer for terminal telemetry updates
  useEffect(() => {
    const timer = setInterval(() => {
      setTickerTick((t) => (t + 1) % 1000);
    }, 120);
    return () => clearInterval(timer);
  }, []);

  // 3D Topographical Manifold Canvas Animation
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let animationFrameId: number;
    let time = 0;

    const render = () => {
      time += 0.025;

      const dpr = window.devicePixelRatio || 1;
      const width = canvas.clientWidth;
      const height = canvas.clientHeight;

      if (canvas.width !== width * dpr || canvas.height !== height * dpr) {
        canvas.width = width * dpr;
        canvas.height = height * dpr;
      }

      ctx.save();
      ctx.scale(dpr, dpr);
      ctx.clearRect(0, 0, width, height);

      // Background subtle grid coordinate lines
      ctx.strokeStyle = 'rgba(226, 232, 240, 0.6)'; // slate-200
      ctx.lineWidth = 0.5;
      const gridSpacing = 28;
      for (let x = 0; x < width; x += gridSpacing) {
        ctx.beginPath();
        ctx.moveTo(x, 0);
        ctx.lineTo(x, height);
        ctx.stroke();
      }
      for (let y = 0; y < height; y += gridSpacing) {
        ctx.beginPath();
        ctx.moveTo(0, y);
        ctx.lineTo(width, y);
        ctx.stroke();
      }

      // 3D Topographical Terrain Point Cloud / Wireframe
      // Grid dimensions
      const rows = 24;
      const cols = 36;
      const originX = width * 0.5;
      const originY = height * 0.62;

      // Camera / Isometric projection vectors
      const stepX = (width * 0.42) / cols;
      const stepY = (height * 0.28) / rows;
      const heightScale = height * 0.48 * Math.min(1.1, 0.2 + (progress / 100) * 0.95);

      // Compute 3D points
      const points: { x: number; y: number; z: number; screenX: number; screenY: number }[][] = [];

      for (let r = 0; r < rows; r++) {
        points[r] = [];
        const normY = (r / (rows - 1)) * 2 - 1; // -1 to 1

        for (let c = 0; c < cols; c++) {
          const normX = (c / (cols - 1)) * 2 - 1; // -1 to 1

          // Primary distribution peaks (Bimodal: Diabetes & Hypertension clusters)
          const peak1 =
            1.15 *
            Math.exp(-((normX - 0.12) ** 2 * 7.5 + (normY - 0.05) ** 2 * 9.0)) *
            (0.85 + 0.15 * Math.sin(time * 1.8 + normX * 4));

          const peak2 =
            0.85 *
            Math.exp(-((normX + 0.38) ** 2 * 9.0 + (normY + 0.22) ** 2 * 11.0)) *
            (0.88 + 0.12 * Math.cos(time * 2.2 + normY * 3));

          // Base harmonic ripple
          const ripple =
            0.08 * Math.sin(normX * 5 + time * 1.2) * Math.cos(normY * 4 + time * 1.0);

          // Fine rugged detail (like scientific point-cloud)
          const detail = 0.04 * Math.sin(normX * 16 + normY * 14 + time * 2);

          // Combined elevation
          const z = Math.max(0, peak1 + peak2 + ripple + detail);

          // Isometric 3D Projection
          const isoX = (c - cols / 2) * stepX - (r - rows / 2) * (stepX * 0.65);
          const isoY = (c - cols / 2) * (stepY * 0.4) + (r - rows / 2) * stepY;

          const screenX = originX + isoX;
          const screenY = originY + isoY - z * heightScale;

          points[r][c] = { x: normX, y: normY, z, screenX, screenY };
        }
      }

      // Draw wireframe contour lines along rows (back to front for depth)
      for (let r = 0; r < rows; r++) {
        // Contour line
        ctx.beginPath();
        for (let c = 0; c < cols; c++) {
          const pt = points[r][c];
          if (c === 0) ctx.moveTo(pt.screenX, pt.screenY);
          else ctx.lineTo(pt.screenX, pt.screenY);
        }

        const depthAlpha = 0.25 + (r / rows) * 0.55;
        ctx.strokeStyle = `rgba(30, 41, 59, ${depthAlpha * 0.4})`; // dark slate
        ctx.lineWidth = 0.8;
        ctx.stroke();

        // Point cloud dots along each row
        for (let c = 0; c < cols; c++) {
          const pt = points[r][c];
          const isHighPeak = pt.z > 0.45;
          const isMidPeak = pt.z > 0.15;

          // Vertical drop lines on prominent peaks (signature from reference image)
          if (isHighPeak && (c + r) % 3 === 0) {
            const baseFloorY = originY + ((c - cols / 2) * (stepY * 0.4) + (r - rows / 2) * stepY);
            ctx.beginPath();
            ctx.moveTo(pt.screenX, pt.screenY);
            ctx.lineTo(pt.screenX, baseFloorY);
            ctx.strokeStyle = 'rgba(59, 130, 246, 0.18)'; // light blue drop line
            ctx.lineWidth = 0.6;
            ctx.stroke();
          }

          // Dot render
          ctx.beginPath();
          const dotRadius = isHighPeak ? 2.0 : isMidPeak ? 1.4 : 0.9;
          ctx.arc(pt.screenX, pt.screenY, dotRadius, 0, Math.PI * 2);

          if (isHighPeak) {
            ctx.fillStyle = '#2563eb'; // blue-600
          } else if (isMidPeak) {
            ctx.fillStyle = '#0284c7'; // sky-600
          } else {
            ctx.fillStyle = 'rgba(71, 85, 105, 0.6)'; // slate-600
          }
          ctx.fill();
        }
      }

      // Bottom Frequency Spectrum (Waveform bars inspired by bottom graph in reference)
      const spectrumY = height - 32;
      const numBars = 32;
      const barWidth = 3;
      const barGap = 4;
      const startX = width * 0.08;

      ctx.fillStyle = 'rgba(100, 116, 139, 0.4)';
      ctx.font = '8px monospace';
      ctx.fillText('P(Y | do(X)) CAUSAL DENSITY', startX, spectrumY - 14);

      for (let b = 0; b < numBars; b++) {
        const barX = startX + b * (barWidth + barGap);
        const distFromCenter = Math.abs(b - numBars * 0.45) / (numBars * 0.45);
        const bellHeight = Math.max(0.1, 1 - distFromCenter ** 2);
        const dynamicFactor = 0.7 + 0.3 * Math.sin(time * 3 + b * 0.6);
        const barH = 18 * bellHeight * dynamicFactor * Math.min(1, 0.3 + (progress / 100) * 0.8);

        ctx.fillStyle = b > 10 && b < 22 ? '#2563eb' : 'rgba(148, 163, 184, 0.8)';
        ctx.fillRect(barX, spectrumY - barH, barWidth, barH);
      }

      ctx.restore();
      animationFrameId = requestAnimationFrame(render);
    };

    render();
    return () => cancelAnimationFrame(animationFrameId);
  }, [progress]);

  // DAG Nodes configuration
  const dagNodes = useMemo(
    () => [
      {
        id: 'age',
        name: 'Age',
        tier: 'Root',
        val: `${config.minAge}-${config.maxAge}y`,
        activeStage: 0,
        x: 16,
        y: 24,
      },
      {
        id: 'bmi',
        name: 'BMI / Adiposity',
        tier: 'Root',
        val: 'N(28.4, 4.2)',
        activeStage: 0,
        x: 16,
        y: 72,
      },
      {
        id: 'diabetes',
        name: 'Type-2 Diabetes',
        tier: 'Mediator',
        val: `${config.diabetesPct}% Target`,
        activeStage: 1,
        x: 50,
        y: 26,
      },
      {
        id: 'activity',
        name: 'Physical Activity',
        tier: 'Mediator',
        val: config.activityLevel,
        activeStage: 1,
        x: 50,
        y: 74,
      },
      {
        id: 'sbp',
        name: 'Systolic BP (mmHg)',
        tier: 'Endpoint',
        val: config.hypertensionEnabled ? `${config.hypertensionPct}% HTN` : 'Conditional',
        activeStage: 2,
        x: 84,
        y: 50,
      },
    ],
    [config]
  );

  return (
    <div className="max-w-6xl mx-auto space-y-4 animate-in fade-in duration-300 select-none py-2">
      {/* Outer Technical HUD Glass Container */}
      <div className="relative bg-white dark:bg-slate-900 border border-slate-200/90 dark:border-slate-800 rounded-3xl p-5 sm:p-7 shadow-xl shadow-slate-900/5 overflow-hidden">
        {/* Technical Corner Registration Markers (Aesthetic Plus Marks from reference) */}
        <span className="absolute top-3 left-3 text-[11px] font-mono text-slate-300 dark:text-slate-600 font-bold select-none">+</span>
        <span className="absolute top-3 right-3 text-[11px] font-mono text-slate-300 dark:text-slate-600 font-bold select-none">+</span>
        <span className="absolute bottom-3 left-3 text-[11px] font-mono text-slate-300 dark:text-slate-600 font-bold select-none">+</span>
        <span className="absolute bottom-3 right-3 text-[11px] font-mono text-slate-300 dark:text-slate-600 font-bold select-none">+</span>

        {/* Top HUD Telemetry Streamer Header */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-3 pb-4 border-b border-slate-100 dark:border-slate-800">
          <div className="flex items-center gap-2.5">
            <div className="relative flex items-center justify-center w-3 h-3">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-blue-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2 w-2 bg-blue-600"></span>
            </div>
            <div>
              <div className="text-[11px] font-mono font-bold tracking-[0.2em] text-blue-600 dark:text-blue-400 uppercase flex items-center gap-2">
                <span>SCM PHYSIOLOGICAL ENGINE RUNNING</span>
                <span className="text-[9px] px-2 py-0.5 rounded-md bg-blue-50 dark:bg-blue-950/50 text-blue-700 dark:text-blue-300 border border-blue-200 dark:border-blue-800">
                  GPU ACCELERATED
                </span>
              </div>
              <p className="text-xs font-semibold text-slate-800 dark:text-slate-200 mt-0.5">
                {message}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-4 text-right shrink-0">
            <div className="hidden sm:block font-mono text-[10px] text-slate-400 dark:text-slate-500">
              <div>GRID: [37.77°N, -122.41°W]</div>
              <div>SEED: NHANES-AHA-v2</div>
            </div>

            <div className="flex items-center gap-2 bg-slate-50 dark:bg-slate-800/80 px-4 py-2 rounded-2xl border border-slate-200/80 dark:border-slate-700/80">
              <span className="font-mono text-xl font-bold text-slate-900 dark:text-white tabular-nums">
                {progress}%
              </span>
              <span className="text-[10px] font-mono font-semibold text-blue-600 dark:text-blue-400 uppercase tracking-widest">
                STAGE 0{stage + 1}/04
              </span>
            </div>
          </div>
        </div>

        {/* Main 2-Column Scientific Layout */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-5 items-stretch my-4">
          {/* Left Column: 3D Topographical Distribution Manifold Canvas (7 cols) */}
          <div className="lg:col-span-7 rounded-2xl bg-slate-50/70 dark:bg-slate-950/50 border border-slate-200/80 dark:border-slate-800/80 relative overflow-hidden flex flex-col justify-between min-h-[360px]">
            {/* Canvas Header Ticker Overlay */}
            <div className="p-3 border-b border-slate-200/60 dark:border-slate-800/60 flex items-center justify-between z-10 bg-white/60 dark:bg-slate-900/60 backdrop-blur-xs">
              <div className="flex items-center gap-2">
                <Activity className="w-3.5 h-3.5 text-blue-600 dark:text-blue-400" />
                <span className="text-[10px] font-mono font-bold uppercase tracking-wider text-slate-700 dark:text-slate-300">
                  TOPOGRAPHICAL PROBABILITY MANIFOLD
                </span>
              </div>
              <span className="text-[10px] font-mono text-slate-500 dark:text-slate-400">
                SAMPLES: {generatedCount.toLocaleString()} / {config.targetPatients.toLocaleString()}
              </span>
            </div>

            {/* Canvas viewport */}
            <div className="flex-1 relative w-full h-[280px]">
              <canvas
                ref={canvasRef}
                className="absolute inset-0 w-full h-full block"
              />
            </div>

            {/* Bottom Coordinate Telemetry Footer */}
            <div className="px-3 py-1.5 border-t border-slate-200/60 dark:border-slate-800/60 bg-white/70 dark:bg-slate-900/70 backdrop-blur-xs flex items-center justify-between text-[9px] font-mono text-slate-400 dark:text-slate-500">
              <span>MANIFOLD: BIMODAL CARDIOMETABOLIC SURFACE</span>
              <span>WASSERSTEIN GAP: {wasserstein}</span>
            </div>
          </div>

          {/* Right Column: Dynamic DAG Graph + Live Training Telemetry (5 cols) */}
          <div className="lg:col-span-5 space-y-3.5 flex flex-col justify-between">
            {/* Dynamic DAG Graph Visualization */}
            <div className="p-4 rounded-2xl bg-slate-50/70 dark:bg-slate-950/50 border border-slate-200/80 dark:border-slate-800/80 space-y-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-1.5">
                  <GitBranch className="w-3.5 h-3.5 text-blue-600 dark:text-blue-400" />
                  <span className="text-[10px] font-mono font-bold uppercase tracking-wider text-slate-800 dark:text-slate-200">
                    PHYSIOLOGICAL DAG PROPAGATION
                  </span>
                </div>
                <span className="text-[9px] font-mono px-2 py-0.5 rounded-full bg-emerald-50 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800 font-semibold">
                  ACTIVE PATHS: 7
                </span>
              </div>

              {/* Interactive Mini-DAG Blueprint */}
              <div className="relative h-44 rounded-xl bg-white dark:bg-slate-900 border border-slate-200/70 dark:border-slate-800/70 overflow-hidden">
                {/* SVG Connecting Edges */}
                <svg className="absolute inset-0 w-full h-full pointer-events-none">
                  <defs>
                    <linearGradient id="edgeGrad" x1="0%" y1="0%" x2="100%" y2="0%">
                      <stop offset="0%" stopColor="#2563eb" stopOpacity="0.8" />
                      <stop offset="100%" stopColor="#10b981" stopOpacity="0.8" />
                    </linearGradient>
                  </defs>

                  {/* Age -> Diabetes */}
                  <line
                    x1="22%"
                    y1="24%"
                    x2="45%"
                    y2="26%"
                    stroke="#2563eb"
                    strokeWidth="1.5"
                    strokeDasharray="3 3"
                    className="animate-pulse"
                  />
                  {/* Age -> SBP */}
                  <path
                    d="M 22 24 C 45 10, 65 30, 80 50"
                    fill="none"
                    stroke="#94a3b8"
                    strokeWidth="1"
                    strokeDasharray="2 2"
                  />
                  {/* BMI -> Diabetes */}
                  <line
                    x1="22%"
                    y1="70%"
                    x2="45%"
                    y2="30%"
                    stroke="#2563eb"
                    strokeWidth="1.5"
                    strokeDasharray="3 3"
                  />
                  {/* BMI -> Activity */}
                  <line
                    x1="22%"
                    y1="72%"
                    x2="45%"
                    y2="74%"
                    stroke="#3b82f6"
                    strokeWidth="1"
                    strokeDasharray="2 2"
                  />
                  {/* Diabetes -> SBP */}
                  <line
                    x1="58%"
                    y1="28%"
                    x2="80%"
                    y2="48%"
                    stroke={stage >= 1 ? '#2563eb' : '#cbd5e1'}
                    strokeWidth="2"
                    strokeDasharray={stage >= 1 ? '4 4' : 'none'}
                    className={stage >= 1 ? 'animate-pulse' : ''}
                  />
                  {/* Activity -> SBP */}
                  <line
                    x1="58%"
                    y1="72%"
                    x2="80%"
                    y2="52%"
                    stroke={stage >= 1 ? '#10b981' : '#cbd5e1'}
                    strokeWidth="1.5"
                  />
                </svg>

                {/* Nodes on the Canvas */}
                {dagNodes.map((node) => {
                  const isNodeActive = stage >= node.activeStage;
                  const isCurrentlyFitting = stage === node.activeStage;

                  return (
                    <div
                      key={node.id}
                      style={{ left: `${node.x}%`, top: `${node.y}%` }}
                      className={`absolute -translate-x-1/2 -translate-y-1/2 px-2.5 py-1.5 rounded-xl border transition-all duration-300 z-10 ${
                        isCurrentlyFitting
                          ? 'bg-blue-50 dark:bg-blue-950/80 border-blue-500 ring-2 ring-blue-500/20 shadow-xs'
                          : isNodeActive
                          ? 'bg-white dark:bg-slate-800 border-slate-300 dark:border-slate-700 shadow-2xs'
                          : 'bg-slate-50 dark:bg-slate-900 border-slate-200 dark:border-slate-800 opacity-40'
                      }`}
                    >
                      <div className="flex items-center gap-1">
                        <span
                          className={`w-1.5 h-1.5 rounded-full ${
                            isCurrentlyFitting
                              ? 'bg-blue-600 animate-ping'
                              : isNodeActive
                              ? 'bg-emerald-500'
                              : 'bg-slate-300'
                          }`}
                        />
                        <span className="text-[10px] font-bold text-slate-900 dark:text-white leading-none whitespace-nowrap">
                          {node.name}
                        </span>
                      </div>
                      <div className="text-[8px] font-mono text-slate-500 dark:text-slate-400 mt-0.5 leading-none">
                        {node.val}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Real-Time Training Telemetry Console (Monospace Stats from reference) */}
            <div className="p-3.5 rounded-2xl bg-slate-950 text-slate-200 font-mono text-[10px] space-y-1.5 shadow-inner border border-slate-800">
              <div className="flex items-center justify-between pb-1.5 border-b border-slate-800 text-slate-400 text-[9px]">
                <span className="flex items-center gap-1.5 text-blue-400">
                  <Terminal className="w-3 h-3" />
                  <span>TRAINING TELEMETRY</span>
                </span>
                <span className="text-emerald-400 font-bold">CONVERGING</span>
              </div>

              <div className="grid grid-cols-2 gap-2 pt-1">
                <div>
                  <span className="text-slate-500 block text-[8px]">EPOCH ITERATION</span>
                  <span className="font-bold text-white tabular-nums">{epoch} / 100</span>
                </div>
                <div>
                  <span className="text-slate-500 block text-[8px]">STRUCTURAL LOSS</span>
                  <span className="font-bold text-emerald-400 tabular-nums">{loss}</span>
                </div>
                <div>
                  <span className="text-slate-500 block text-[8px]">PRIVACY BUDGET</span>
                  <span className="font-bold text-sky-400 tabular-nums">ε = 0.50, δ = 1e-5</span>
                </div>
                <div>
                  <span className="text-slate-500 block text-[8px]">QUARANTINE DCR</span>
                  <span className="font-bold text-amber-400 tabular-nums">0 Overfit Leaks</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Stepped Milestones Status Bar */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-2.5 pt-2 border-t border-slate-100 dark:border-slate-800 text-xs">
          {[
            { label: '01 Fitting DAG Priors', sub: 'P(BP | Age, BMI, Dx)' },
            { label: '02 Structural Equations', sub: 'Parametric Mechanistic Shift' },
            { label: `03 Sampling ${config.targetPatients.toLocaleString()} Patients`, sub: 'Forward Monte Carlo Paths' },
            { label: '04 Privacy & Passport Seal', sub: 'Differential Privacy ε=0.5' },
          ].map((st, i) => {
            const isDone = stage > i;
            const isCurrent = stage === i;

            return (
              <div
                key={i}
                className={`p-2.5 rounded-xl border flex items-center gap-2.5 transition-all duration-300 ${
                  isDone
                    ? 'border-emerald-500/30 bg-emerald-50/50 dark:bg-emerald-950/20 text-emerald-900 dark:text-emerald-200'
                    : isCurrent
                    ? 'border-blue-500 bg-blue-50/60 dark:bg-blue-950/40 text-blue-950 dark:text-blue-100 ring-1 ring-blue-500/30'
                    : 'border-slate-200/60 dark:border-slate-800/60 text-slate-400 dark:text-slate-600 opacity-60'
                }`}
              >
                <div className="w-4 h-4 rounded-full flex items-center justify-center shrink-0">
                  {isDone ? (
                    <Check className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400" />
                  ) : isCurrent ? (
                    <span className="w-2 h-2 rounded-full bg-blue-600 animate-ping" />
                  ) : (
                    <span className="w-1.5 h-1.5 rounded-full bg-slate-300 dark:bg-slate-700" />
                  )}
                </div>
                <div className="min-w-0 flex-1">
                  <div className="font-bold text-[11px] truncate leading-tight">{st.label}</div>
                  <div className="text-[9px] font-mono text-slate-500 dark:text-slate-400 truncate mt-0.5">
                    {st.sub}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};
