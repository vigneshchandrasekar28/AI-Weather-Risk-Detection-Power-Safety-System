import React from 'react';
import { Zap, ShieldCheck, ShieldAlert, AlertOctagon, CheckCircle2, Info, ArrowUpRight } from 'lucide-react';
import { RiskAnalysis, WeatherData } from '../types';

interface RecommendationCardProps {
  risk: RiskAnalysis;
  weather: WeatherData;
  lastUpdated: string;
}

export const RecommendationCard: React.FC<RecommendationCardProps> = ({
  risk,
  weather,
  lastUpdated
}) => {
  const isPowerOff = risk.recommendation === 'POWER OFF';

  // Badge styles
  const getBadgeStyle = () => {
    switch (risk.level) {
      case 'HIGH':
        return 'bg-red-100 text-red-800 border-red-300';
      case 'MEDIUM':
        return 'bg-amber-100 text-amber-800 border-amber-300';
      case 'LOW':
      default:
        return 'bg-emerald-100 text-emerald-800 border-emerald-300';
    }
  };

  const getProgressFill = () => {
    switch (risk.level) {
      case 'HIGH':
        return 'bg-red-600';
      case 'MEDIUM':
        return 'bg-amber-500';
      case 'LOW':
      default:
        return 'bg-emerald-600';
    }
  };

  return (
    <section
      id="powerRecommendationSection"
      className={`rounded-2xl border p-6 shadow-sm transition-all duration-300 ${
        isPowerOff
          ? 'bg-gradient-to-b from-white to-red-50/50 border-red-200 ring-1 ring-red-300/40'
          : 'bg-gradient-to-b from-white to-emerald-50/40 border-emerald-200 ring-1 ring-emerald-300/30'
      }`}
    >
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between pb-4 border-b border-slate-200/80 gap-2">
        <div className="flex items-center gap-2">
          <span className="text-xs font-bold uppercase tracking-wider text-slate-500">
            Simulated Grid Safety Decision
          </span>
          <span className="text-slate-300">•</span>
          <span className="text-xs font-medium text-slate-700">{weather.displayLocation}</span>
        </div>
        <span className="text-xs font-mono text-slate-500">
          Updated: {lastUpdated}
        </span>
      </div>

      {/* Primary Split: Big Decision vs Risk Score */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-center py-6">
        {/* Left Column: Big POWER ON / POWER OFF display */}
        <div className="lg:col-span-5 flex flex-col items-center justify-center text-center p-6 bg-white border border-slate-200 rounded-xl shadow-xs space-y-2">
          <div className="p-3.5 rounded-full mb-1">
            {isPowerOff ? (
              <div className="w-16 h-16 rounded-full bg-red-100 border-2 border-red-300 flex items-center justify-center text-red-600 shadow-inner">
                <AlertOctagon className="w-9 h-9 animate-bounce" />
              </div>
            ) : (
              <div className="w-16 h-16 rounded-full bg-emerald-100 border-2 border-emerald-300 flex items-center justify-center text-emerald-600 shadow-inner">
                <Zap className="w-9 h-9" />
              </div>
            )}
          </div>

          <div className="space-y-0.5">
            <span className="text-xs uppercase tracking-widest font-bold text-slate-400">
              Recommended Action
            </span>
            <div
              id="powerStateLabel"
              className={`text-4xl md:text-5xl font-black tracking-tight leading-none ${
                isPowerOff ? 'text-red-700' : 'text-emerald-700'
              }`}
            >
              {risk.recommendation}
            </div>
          </div>

          <p className="text-[11px] font-semibold text-slate-500 uppercase tracking-wider pt-2 border-t border-slate-100 w-full">
            {isPowerOff
              ? 'Simulated Protective Isolation Triggered'
              : 'Safe Distribution Permitted (Simulated)'}
          </p>
        </div>

        {/* Right Column: Risk Level & Risk Score Gauge */}
        <div className="lg:col-span-7 space-y-4">
          <div className="flex items-center justify-between flex-wrap gap-2">
            <div className="flex items-center gap-2">
              <span className="text-xs font-bold text-slate-500 uppercase tracking-wide">
                Assessed Risk Level:
              </span>
              <span
                id="riskLevelBadge"
                className={`text-xs font-extrabold uppercase px-3 py-1 rounded-full border tracking-wide ${getBadgeStyle()}`}
              >
                {risk.level} RISK
              </span>
            </div>

            <div className="text-xs font-semibold text-slate-500">
              Safety Margin: <span className="font-bold text-slate-800">{risk.safetyMargin}%</span>
            </div>
          </div>

          {/* Risk Score Progress Bar */}
          <div className="bg-white border border-slate-200 rounded-xl p-4 shadow-xs space-y-2">
            <div className="flex items-baseline justify-between">
              <span className="text-sm font-bold text-slate-800">
                AI Meteorological Risk Score
              </span>
              <div className="flex items-baseline gap-1">
                <span id="riskScoreNumber" className="text-2xl font-black font-mono text-slate-900">
                  {risk.score}
                </span>
                <span className="text-xs font-medium text-slate-400">/ 100</span>
              </div>
            </div>

            {/* Visual Gauge */}
            <div className="w-full h-3 bg-slate-100 rounded-full overflow-hidden p-0.5 border border-slate-200">
              <div
                id="riskScoreProgressBar"
                style={{ width: `${Math.min(100, Math.max(0, risk.score))}%` }}
                className={`h-full rounded-full transition-all duration-500 ${getProgressFill()}`}
              />
            </div>

            {/* Threshold scale labels */}
            <div className="flex justify-between text-[11px] font-semibold text-slate-500 pt-0.5">
              <span>0 (Calm)</span>
              <span className="text-emerald-700">LOW (0 - 29)</span>
              <span className="text-amber-700">MEDIUM (30 - 59)</span>
              <span className="text-red-700">HIGH (60 - 100)</span>
            </div>
          </div>

          {/* Decision Summary line */}
          <div className="text-xs text-slate-600 bg-slate-50/80 border border-slate-200/80 rounded-lg p-2.5 flex items-center gap-2">
            <Info className="w-4 h-4 text-sky-600 shrink-0" />
            <span>
              {isPowerOff
                ? 'High risk index detected: Immediate software advisory to isolate power feeder lines to protect transformers.'
                : 'Risk index is within acceptable operational tolerance; power lines remain safely energized.'}
            </span>
          </div>
        </div>
      </div>

      {/* Rule Engine Diagnostic Reasoning */}
      <div className="mt-2 pt-4 border-t border-slate-200/80 space-y-2">
        <h3 className="text-xs font-bold uppercase tracking-wider text-slate-700 flex items-center gap-2">
          <span>📋</span> Rule Engine Diagnostic Reasoning ({risk.reasons.length} Factors Identified)
        </h3>
        <ul className="space-y-1.5 pl-1">
          {risk.reasons.map((reason, index) => (
            <li
              key={index}
              className="text-xs text-slate-700 flex items-start gap-2 leading-relaxed"
            >
              <span className="text-sky-600 font-bold">•</span>
              <span>{reason}</span>
            </li>
          ))}
        </ul>
      </div>
    </section>
  );
};
