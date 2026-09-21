import React from 'react';
import { RiskLevel } from '../types';
import { CloudRain, Brain, BarChart3, TrafficCone, Zap, ArrowRight, ArrowDown, CheckCircle2, AlertOctagon, ShieldAlert } from 'lucide-react';

interface SystemConceptFlowProps {
  currentLevel: RiskLevel;
  currentScore: number;
}

export const SystemConceptFlow: React.FC<SystemConceptFlowProps> = ({
  currentLevel,
  currentScore
}) => {
  const isHigh = currentLevel === 'HIGH';
  const isMed = currentLevel === 'MEDIUM';
  const isLow = currentLevel === 'LOW';

  return (
    <section
      id="systemConceptFlowSection"
      aria-label="System Decision Flow Pipeline"
      className="bg-gradient-to-b from-slate-900 via-slate-900 to-slate-950 text-white rounded-3xl p-6 sm:p-8 shadow-xl border border-slate-800 space-y-6"
    >
      {/* Concept Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-4 border-b border-slate-800/80">
        <div>
          <div className="flex items-center gap-2">
            <span className="w-2.5 h-2.5 rounded-full bg-sky-400 animate-ping"></span>
            <span className="text-xs sm:text-sm font-black uppercase tracking-widest text-sky-400">
              CORE SYSTEM PIPELINE &bull; HOW IT WORKS
            </span>
          </div>
          <h2 className="text-xl sm:text-2xl lg:text-3xl font-black tracking-tight text-white mt-1">
            Weather Data &rarr; AI Risk Analysis &rarr; Power Safety Decision
          </h2>
          <p className="text-sm sm:text-base text-slate-400 mt-1 max-w-3xl">
            The automated safety pipeline continuously ingests live meteorological data, computes multi-hazard risk, and determines simulated electrical power distribution.
          </p>
        </div>

        <div className="bg-slate-800/80 border border-slate-700/80 rounded-2xl px-4 py-3 shrink-0 flex items-center gap-3">
          <span className="text-xs font-bold text-slate-400 uppercase tracking-wider block">
            Current Status:
          </span>
          <span
            className={`text-sm sm:text-base font-black px-3 py-1 rounded-xl uppercase tracking-wider flex items-center gap-1.5 ${
              isHigh
                ? 'bg-red-500/20 text-red-400 border border-red-500/40'
                : isMed
                ? 'bg-amber-500/20 text-amber-400 border border-amber-500/40'
                : 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/40'
            }`}
          >
            {isHigh ? (
              <AlertOctagon className="w-4 h-4 text-red-400" />
            ) : isMed ? (
              <ShieldAlert className="w-4 h-4 text-amber-400" />
            ) : (
              <CheckCircle2 className="w-4 h-4 text-emerald-400" />
            )}
            {isHigh ? 'HIGH RISK' : isMed ? 'MEDIUM RISK' : 'LOW RISK'} ({currentScore}/100)
          </span>
        </div>
      </div>

      {/* 5-Step Pipeline Steps */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-3 relative">
        {/* Step 1 */}
        <div className="bg-slate-800/60 border border-slate-700/60 hover:border-slate-600 rounded-2xl p-4 flex flex-col justify-between gap-3 transition-all">
          <div className="flex items-center justify-between">
            <span className="text-2xl">🌦</span>
            <span className="text-[11px] font-black text-slate-400 uppercase tracking-wider">Step 1</span>
          </div>
          <div>
            <h3 className="text-base sm:text-lg font-black text-white">WEATHER DATA</h3>
            <p className="text-xs sm:text-sm text-slate-400 mt-1">
              Live OpenWeather telemetry: Temp, Rain, Wind, Humidity
            </p>
          </div>
          <div className="hidden lg:flex justify-end text-slate-600">
            <ArrowRight className="w-4 h-4" />
          </div>
        </div>

        {/* Step 2 */}
        <div className="bg-slate-800/60 border border-slate-700/60 hover:border-slate-600 rounded-2xl p-4 flex flex-col justify-between gap-3 transition-all">
          <div className="flex items-center justify-between">
            <span className="text-2xl">🧠</span>
            <span className="text-[11px] font-black text-slate-400 uppercase tracking-wider">Step 2</span>
          </div>
          <div>
            <h3 className="text-base sm:text-lg font-black text-white">AI RISK ANALYSIS</h3>
            <p className="text-xs sm:text-sm text-slate-400 mt-1">
              Multi-hazard weighted matrix &amp; pattern recognition
            </p>
          </div>
          <div className="hidden lg:flex justify-end text-slate-600">
            <ArrowRight className="w-4 h-4" />
          </div>
        </div>

        {/* Step 3 */}
        <div className="bg-slate-800/60 border border-slate-700/60 hover:border-slate-600 rounded-2xl p-4 flex flex-col justify-between gap-3 transition-all">
          <div className="flex items-center justify-between">
            <span className="text-2xl">📊</span>
            <span className="text-[11px] font-black text-slate-400 uppercase tracking-wider">Step 3</span>
          </div>
          <div>
            <h3 className="text-base sm:text-lg font-black text-white">RISK SCORE</h3>
            <p className="text-xs sm:text-sm text-slate-400 mt-1">
              Calculated 0 to 100 mathematical risk index
            </p>
          </div>
          <div className="hidden lg:flex justify-end text-slate-600">
            <ArrowRight className="w-4 h-4" />
          </div>
        </div>

        {/* Step 4 */}
        <div className="bg-slate-800/60 border border-slate-700/60 hover:border-slate-600 rounded-2xl p-4 flex flex-col justify-between gap-3 transition-all">
          <div className="flex items-center justify-between">
            <span className="text-2xl">🚦</span>
            <span className="text-[11px] font-black text-slate-400 uppercase tracking-wider">Step 4</span>
          </div>
          <div>
            <h3 className="text-base sm:text-lg font-black text-white">RISK LEVEL</h3>
            <p className="text-xs sm:text-sm text-slate-400 mt-1">
              Threshold mapping: LOW (0-29), MED (30-59), HIGH (60+)
            </p>
          </div>
          <div className="hidden lg:flex justify-end text-slate-600">
            <ArrowRight className="w-4 h-4" />
          </div>
        </div>

        {/* Step 5 */}
        <div className={`rounded-2xl p-4 flex flex-col justify-between gap-3 transition-all border-2 ${
          isHigh
            ? 'bg-red-950/40 border-red-500 text-red-200'
            : isMed
            ? 'bg-amber-950/40 border-amber-500 text-amber-200'
            : 'bg-emerald-950/40 border-emerald-500 text-emerald-200'
        }`}>
          <div className="flex items-center justify-between">
            <span className="text-2xl">⚡</span>
            <span className="text-[11px] font-black uppercase tracking-wider text-sky-400">Step 5 &bull; Outcome</span>
          </div>
          <div>
            <h3 className="text-base sm:text-lg font-black text-white">SAFETY DECISION</h3>
            <p className="text-xs sm:text-sm text-slate-300 mt-1 font-bold">
              {isHigh ? '🔴 POWER OFF RECOMMENDED' : isMed ? '🟡 POWER ON — MONITOR' : '🟢 POWER ON'}
            </p>
          </div>
        </div>
      </div>

      {/* Decision Pathways: Normal vs Risky Weather */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-2">
        {/* Pathway 1: Normal Weather */}
        <div
          className={`rounded-2xl p-5 border transition-all flex items-center justify-between gap-4 ${
            isLow
              ? 'bg-emerald-950/50 border-emerald-500 ring-2 ring-emerald-500/40'
              : 'bg-slate-800/40 border-slate-700/60 opacity-80'
          }`}
        >
          <div className="space-y-1">
            <div className="flex items-center gap-2">
              <span className="text-lg">🌤</span>
              <span className="text-xs sm:text-sm font-black uppercase tracking-wider text-emerald-400">
                NORMAL WEATHER
              </span>
            </div>
            <p className="text-xs sm:text-sm text-slate-300">
              Low rain (&lt;5mm), safe wind (&lt;30km/h), clear conditions
            </p>
            <div className="text-xs font-semibold text-slate-400 flex items-center gap-1 pt-1">
              <span>Risk: 0–29</span>
              <span>&rarr;</span>
              <span className="text-emerald-400 font-bold">LOW RISK</span>
            </div>
          </div>

          <div className="text-right shrink-0">
            <span className="text-xs text-slate-400 block font-bold uppercase tracking-wider mb-1">
              Simulated Decision
            </span>
            <span className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl bg-emerald-500 text-slate-950 font-black text-sm sm:text-base tracking-wide shadow-lg">
              <span className="text-base">🟢</span> POWER ON
            </span>
          </div>
        </div>

        {/* Pathway 2: Risky / Dangerous Weather */}
        <div
          className={`rounded-2xl p-5 border transition-all flex items-center justify-between gap-4 ${
            isHigh
              ? 'bg-red-950/50 border-red-500 ring-2 ring-red-500/40'
              : 'bg-slate-800/40 border-slate-700/60 opacity-80'
          }`}
        >
          <div className="space-y-1">
            <div className="flex items-center gap-2">
              <span className="text-lg">⛈</span>
              <span className="text-xs sm:text-sm font-black uppercase tracking-wider text-red-400">
                RISKY / DANGEROUS WEATHER
              </span>
            </div>
            <p className="text-xs sm:text-sm text-slate-300">
              Heavy rain (&ge;15mm), strong gusts (&ge;40km/h), or thunderstorm
            </p>
            <div className="text-xs font-semibold text-slate-400 flex items-center gap-1 pt-1">
              <span>Risk: 60–100</span>
              <span>&rarr;</span>
              <span className="text-red-400 font-bold">HIGH RISK</span>
            </div>
          </div>

          <div className="text-right shrink-0">
            <span className="text-xs text-slate-400 block font-bold uppercase tracking-wider mb-1">
              Simulated Decision
            </span>
            <span className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl bg-red-600 text-white font-black text-sm sm:text-base tracking-wide shadow-lg">
              <span className="text-base">🔴</span> POWER OFF RECOMMENDED
            </span>
          </div>
        </div>
      </div>
    </section>
  );
};
