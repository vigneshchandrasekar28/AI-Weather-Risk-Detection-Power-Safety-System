import React, { useState } from 'react';
import { Activity, TrendingUp, Filter, Clock } from 'lucide-react';
import { RiskLevel } from '../types';

export interface HistoryPoint {
  time: string;
  score: number;
  location?: string;
  level?: RiskLevel;
}

interface RiskHistoryChartProps {
  history: HistoryPoint[];
  currentScore: number;
}

export const RiskHistoryChart: React.FC<RiskHistoryChartProps> = ({
  history,
  currentScore
}) => {
  const [filterRange, setFilterRange] = useState<'1h' | '6h' | '24h'>('1h');
  const [hoveredPoint, setHoveredPoint] = useState<HistoryPoint | null>(null);

  // Filter history points based on active range
  const displayPoints = React.useMemo(() => {
    if (history.length === 0) {
      return [{ time: 'Now', score: currentScore, level: (currentScore >= 60 ? 'HIGH' : currentScore >= 30 ? 'MEDIUM' : 'LOW') as RiskLevel }];
    }
    const maxCount = filterRange === '1h' ? 8 : filterRange === '6h' ? 14 : 20;
    return history.slice(-maxCount);
  }, [history, currentScore, filterRange]);

  const scores = displayPoints.map((p) => p.score);
  const avgScore = Math.round(scores.reduce((a, b) => a + b, 0) / (scores.length || 1));
  const maxScore = Math.max(...scores, currentScore);
  const minScore = Math.min(...scores, currentScore);

  // SVG Chart Dimensions
  const width = 600;
  const height = 180;
  const paddingX = 45;
  const paddingY = 25;
  const chartW = width - paddingX * 2;
  const chartH = height - paddingY * 2;

  // Calculate coordinates for SVG polyline
  const pointsCoords = displayPoints.map((pt, idx) => {
    const x =
      displayPoints.length <= 1
        ? width / 2
        : paddingX + (idx / (displayPoints.length - 1)) * chartW;
    const y = paddingY + chartH - (pt.score / 100) * chartH;
    return { x, y, pt };
  });

  const pathD = pointsCoords
    .map((c, i) => `${i === 0 ? 'M' : 'L'} ${c.x.toFixed(1)} ${c.y.toFixed(1)}`)
    .join(' ');

  const areaD =
    pointsCoords.length > 0
      ? `${pathD} L ${pointsCoords[pointsCoords.length - 1].x.toFixed(1)} ${(
          paddingY + chartH
        ).toFixed(1)} L ${pointsCoords[0].x.toFixed(1)} ${(
          paddingY + chartH
        ).toFixed(1)} Z`
      : '';

  return (
    <section id="riskHistoryChartSection" className="bg-white border border-slate-200 rounded-2xl p-6 shadow-xs space-y-4">
      {/* Header & Filter Controls */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-2 border-b border-slate-100">
        <div>
          <div className="flex items-center gap-2">
            <TrendingUp className="w-4 h-4 text-sky-600" />
            <h3 className="text-xs font-extrabold uppercase tracking-wider text-slate-800">
              AI Risk History & Telemetry Trend
            </h3>
          </div>
          <p className="text-xs text-slate-500 mt-0.5">
            Dynamic temporal progression of atmospheric risk scores (0–100)
          </p>
        </div>

        {/* Time Window Selector */}
        <div className="flex items-center gap-2">
          <div className="inline-flex rounded-lg bg-slate-100 p-0.5 text-xs font-semibold">
            {(['1h', '6h', '24h'] as const).map((range) => (
              <button
                key={range}
                type="button"
                onClick={() => setFilterRange(range)}
                className={`px-2.5 py-1 rounded-md transition-all cursor-pointer ${
                  filterRange === range
                    ? 'bg-white text-slate-900 shadow-xs font-bold'
                    : 'text-slate-500 hover:text-slate-900'
                }`}
              >
                {range === '1h' ? 'Last 1h' : range === '6h' ? 'Last 6h' : 'Last 24h'}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Stats Summary Bar */}
      <div className="grid grid-cols-3 gap-3 text-xs bg-slate-50 border border-slate-200/80 rounded-xl p-3">
        <div className="text-center sm:text-left">
          <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Current Score</span>
          <div className="text-lg font-black font-mono text-slate-900">{currentScore} / 100</div>
        </div>
        <div className="text-center sm:text-left">
          <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Window Avg</span>
          <div className="text-lg font-black font-mono text-slate-700">{avgScore} / 100</div>
        </div>
        <div className="text-center sm:text-left">
          <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Peak Hazard</span>
          <div className={`text-lg font-black font-mono ${maxScore >= 60 ? 'text-red-600' : 'text-slate-700'}`}>
            {maxScore} / 100
          </div>
        </div>
      </div>

      {/* Responsive SVG Chart */}
      <div className="relative w-full overflow-hidden bg-slate-50/50 rounded-xl border border-slate-200/80 p-2">
        <svg viewBox={`0 0 ${width} ${height}`} className="w-full h-44 select-none">
          {/* Risk Range Shading Bands */}
          {/* High Risk Band (60-100) */}
          <rect
            x={paddingX}
            y={paddingY}
            width={chartW}
            height={chartH * 0.4}
            fill="#fef2f2"
            opacity="0.8"
          />
          {/* Medium Risk Band (30-59) */}
          <rect
            x={paddingX}
            y={paddingY + chartH * 0.4}
            width={chartW}
            height={chartH * 0.3}
            fill="#fffbeb"
            opacity="0.8"
          />
          {/* Low Risk Band (0-29) */}
          <rect
            x={paddingX}
            y={paddingY + chartH * 0.7}
            width={chartW}
            height={chartH * 0.3}
            fill="#f0fdf4"
            opacity="0.8"
          />

          {/* Horizontal Threshold Guideline Lines */}
          <line
            x1={paddingX}
            y1={paddingY}
            x2={width - paddingX}
            y2={paddingY}
            stroke="#e2e8f0"
            strokeDasharray="3 3"
          />
          <line
            x1={paddingX}
            y1={paddingY + chartH * 0.4}
            x2={width - paddingX}
            y2={paddingY + chartH * 0.4}
            stroke="#fca5a5"
            strokeDasharray="3 3"
          />
          <line
            x1={paddingX}
            y1={paddingY + chartH * 0.7}
            x2={width - paddingX}
            y2={paddingY + chartH * 0.7}
            stroke="#fcd34d"
            strokeDasharray="3 3"
          />
          <line
            x1={paddingX}
            y1={paddingY + chartH}
            x2={width - paddingX}
            y2={paddingY + chartH}
            stroke="#86efac"
          />

          {/* Y Axis Labels */}
          <text x={paddingX - 8} y={paddingY + 4} textAnchor="end" className="text-[9px] fill-red-600 font-bold font-mono">
            100 (HIGH)
          </text>
          <text x={paddingX - 8} y={paddingY + chartH * 0.4 + 4} textAnchor="end" className="text-[9px] fill-amber-600 font-bold font-mono">
            60 (MED)
          </text>
          <text x={paddingX - 8} y={paddingY + chartH * 0.7 + 4} textAnchor="end" className="text-[9px] fill-emerald-600 font-bold font-mono">
            30 (LOW)
          </text>
          <text x={paddingX - 8} y={paddingY + chartH + 3} textAnchor="end" className="text-[9px] fill-slate-400 font-mono">
            0
          </text>

          {/* Gradient Fill under the line */}
          <defs>
            <linearGradient id="riskAreaGrad" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="#ef4444" stopOpacity="0.25" />
              <stop offset="50%" stopColor="#f59e0b" stopOpacity="0.15" />
              <stop offset="100%" stopColor="#10b981" stopOpacity="0.05" />
            </linearGradient>
          </defs>

          {areaD && <path d={areaD} fill="url(#riskAreaGrad)" />}

          {/* Connecting Line */}
          {pathD && (
            <path
              d={pathD}
              fill="none"
              stroke="#0284c7"
              strokeWidth="2.5"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          )}

          {/* Interactive Data Points */}
          {pointsCoords.map((c, i) => {
            const isLast = i === pointsCoords.length - 1;
            const ptColor =
              c.pt.score >= 60 ? '#ef4444' : c.pt.score >= 30 ? '#f59e0b' : '#10b981';

            return (
              <g
                key={i}
                className="cursor-pointer"
                onMouseEnter={() => setHoveredPoint(c.pt)}
                onMouseLeave={() => setHoveredPoint(null)}
              >
                {/* Outer halo */}
                <circle cx={c.x} cy={c.y} r={isLast ? 6 : 4} fill={ptColor} opacity={0.3} />
                {/* Core dot */}
                <circle
                  cx={c.x}
                  cy={c.y}
                  r={isLast ? 4 : 3}
                  fill={ptColor}
                  stroke="#ffffff"
                  strokeWidth="1.5"
                />
                {/* Time Label on bottom axis */}
                <text
                  x={c.x}
                  y={paddingY + chartH + 14}
                  textAnchor="middle"
                  className="text-[9px] fill-slate-400 font-mono"
                >
                  {c.pt.time}
                </text>
              </g>
            );
          })}
        </svg>

        {/* Hover Tooltip Overlay */}
        {hoveredPoint && (
          <div className="absolute top-3 right-4 bg-slate-900 text-white text-xs px-3 py-1.5 rounded-lg shadow-md pointer-events-none flex items-center gap-2">
            <span className="text-slate-300 font-mono">{hoveredPoint.time}</span>
            <span className="font-bold">&bull; Score: {hoveredPoint.score}/100</span>
            <span
              className={`text-[10px] font-black px-1.5 py-0.2 rounded uppercase ${
                hoveredPoint.score >= 60
                  ? 'bg-red-500 text-white'
                  : hoveredPoint.score >= 30
                  ? 'bg-amber-500 text-white'
                  : 'bg-emerald-500 text-white'
              }`}
            >
              {hoveredPoint.score >= 60 ? 'HIGH' : hoveredPoint.score >= 30 ? 'MEDIUM' : 'LOW'}
            </span>
          </div>
        )}
      </div>

      {/* Legend */}
      <div className="flex flex-wrap items-center justify-between text-[11px] text-slate-500 pt-1">
        <div className="flex items-center gap-4">
          <span className="flex items-center gap-1.5">
            <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 inline-block"></span>
            Low Risk (0-29) &bull; Safe
          </span>
          <span className="flex items-center gap-1.5">
            <span className="w-2.5 h-2.5 rounded-full bg-amber-500 inline-block"></span>
            Medium (30-59) &bull; Monitor
          </span>
          <span className="flex items-center gap-1.5">
            <span className="w-2.5 h-2.5 rounded-full bg-red-500 inline-block"></span>
            High (60-100) &bull; Power Off
          </span>
        </div>
        <span className="text-[10px] text-slate-400">
          Click any data point for exact coordinates
        </span>
      </div>
    </section>
  );
};
