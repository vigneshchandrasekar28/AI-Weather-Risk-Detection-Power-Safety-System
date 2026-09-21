import React, { useState } from 'react';
import { RiskAnalysis, WeatherData } from '../types';
import {
  Zap,
  Activity,
  AlertOctagon,
  ShieldCheck,
  ShieldAlert,
  Info,
  ChevronDown,
  ChevronUp,
  FileSpreadsheet,
  CheckCircle2,
  AlertTriangle,
  Flame,
  CloudRain,
  Wind,
  Droplets,
  CloudLightning,
  Clock,
  Brain
} from 'lucide-react';
import { GoogleSheetsIntegration } from './GoogleSheetsIntegration';

interface CoreDashboardPanelsProps {
  weather: WeatherData;
  risk: RiskAnalysis;
  lastUpdated?: string;
  autoLogSheets: boolean;
  onToggleAutoLog: (val: boolean) => void;
  onAddLog: (message: string, severity?: 'info' | 'warning' | 'critical' | 'success', type?: any) => void;
}

export const CoreDashboardPanels: React.FC<CoreDashboardPanelsProps> = ({
  weather,
  risk,
  lastUpdated,
  autoLogSheets,
  onToggleAutoLog,
  onAddLog
}) => {
  const [showFormulaDetails, setShowFormulaDetails] = useState<boolean>(false);
  const [showSheetsSync, setShowSheetsSync] = useState<boolean>(false);

  const isHigh = risk.level === 'HIGH';
  const isMed = risk.level === 'MEDIUM';
  const isLow = risk.level === 'LOW';

  // Safe factor weights (protect against undefined risk.factors or breakdown)
  const rainfallPts = risk.factors?.rainfall ?? risk.breakdown?.rainfallRisk ?? 0;
  const windPts = risk.factors?.wind ?? risk.breakdown?.windRisk ?? 0;
  const stormPts = risk.factors?.storm ?? risk.breakdown?.stormConditionRisk ?? 0;
  const humidityPts = risk.factors?.humidity ?? risk.breakdown?.humidityRisk ?? 0;

  // Specific Detected Hazard Reasons based on real API weather telemetry
  const weatherLower = ((weather?.condition || '') + ' ' + (weather?.description || '')).toLowerCase();
  const isStorm =
    weatherLower.includes('thunder') ||
    weatherLower.includes('storm') ||
    weatherLower.includes('lightning') ||
    ((weather?.conditionId ?? 0) >= 200 && (weather?.conditionId ?? 0) < 300);

  const rainfallVal = weather?.rainfallMm ?? 0;
  const windSpeedVal = weather?.windSpeedKmh ?? 0;
  const humidityVal = weather?.humidity ?? 0;

  const isHeavyRain = rainfallVal >= 15;
  const isModerateRain = rainfallVal > 0 && rainfallVal < 15;
  const isStrongWind = windSpeedVal >= 40;
  const isModerateWind = windSpeedVal >= 25 && windSpeedVal < 40;
  const isHighHumidity = humidityVal >= 85;

  // Build the list of detected reasons for "Why is the system predicting this risk?"
  const detectedRiskFactors: { icon: string; title: string; detail: string; isRisk: boolean }[] = [
    {
      icon: '🌧',
      title: isHeavyRain
        ? 'Heavy rainfall detected'
        : isModerateRain
        ? 'Moderate rainfall detected'
        : 'Rainfall within safe limits',
      detail: `${rainfallVal} mm/hr (Safe threshold: <10 mm)`,
      isRisk: isHeavyRain || isModerateRain
    },
    {
      icon: '💨',
      title: isStrongWind
        ? 'Strong wind detected'
        : isModerateWind
        ? 'Elevated wind velocity detected'
        : 'Wind speed within safe limits',
      detail: `${windSpeedVal} km/h (Safe threshold: <30 km/h)`,
      isRisk: isStrongWind || isModerateWind
    },
    {
      icon: '⛈',
      title: isStorm ? 'Thunderstorm detected' : 'No thunderstorm activity detected',
      detail: isStorm ? 'Atmospheric electrical discharge & lightning risk' : 'No active lightning telemetry',
      isRisk: isStorm
    },
    {
      icon: '💧',
      title: isHighHumidity ? 'High atmospheric humidity detected' : 'Relative humidity normal',
      detail: `${humidityVal}% (Condensation & dielectric stress limit: 85%)`,
      isRisk: isHighHumidity
    }
  ];

  // Hero Card text & subtext
  let heroTitle = 'POWER ON';
  let heroSubtext = 'Weather conditions are currently normal.';
  let heroBadge = '🟢';
  let heroCardTheme = 'from-emerald-500/10 via-emerald-50 to-white border-emerald-400 text-emerald-950';

  if (isHigh) {
    heroTitle = 'POWER OFF RECOMMENDED';
    heroSubtext = 'High weather-related risk detected.';
    heroBadge = '🔴';
    heroCardTheme = 'from-red-500/15 via-rose-50 to-white border-red-500 text-red-950 ring-4 ring-red-500/10';
  } else if (isMed) {
    heroTitle = 'POWER ON — MONITOR';
    heroSubtext = 'Moderate weather-related risk detected.';
    heroBadge = '🟡';
    heroCardTheme = 'from-amber-500/15 via-yellow-50 to-white border-amber-400 text-amber-950 ring-4 ring-amber-500/10';
  }

  return (
    <div className="space-y-6">
      
      {/* ========================================================================= */}
      {/* 1. CENTRAL HERO POWER SAFETY STATUS & 2. AI RISK PREDICTION (SIDE-BY-SIDE) */}
      {/* ========================================================================= */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        
        {/* HERO CARD: ⚡ POWER SAFETY STATUS (7 Cols on large screens) */}
        <section
          id="powerSafetyStatusHeroCard"
          aria-label="Power Safety Status"
          className={`lg:col-span-7 bg-gradient-to-br ${heroCardTheme} border-3 rounded-3xl p-6 sm:p-8 shadow-xl flex flex-col justify-between gap-6 transition-all relative overflow-hidden`}
        >
          {/* Subtle background glow circle */}
          <div className={`absolute -right-16 -top-16 w-56 h-56 rounded-full blur-3xl opacity-30 pointer-events-none ${
            isHigh ? 'bg-red-500' : isMed ? 'bg-amber-500' : 'bg-emerald-500'
          }`} />

          {/* Card Eyebrow */}
          <div className="flex items-center justify-between border-b border-slate-200/80 pb-3">
            <div className="flex items-center gap-2">
              <Zap className={`w-5 h-5 ${isHigh ? 'text-red-600 fill-red-600' : isMed ? 'text-amber-600 fill-amber-600' : 'text-emerald-600 fill-emerald-600'}`} />
              <span className="text-xs sm:text-sm font-black uppercase tracking-widest text-slate-800">
                ⚡ POWER SAFETY STATUS &bull; HERO DECISION
              </span>
            </div>
            <span className="text-xs font-bold px-3 py-1 rounded-full bg-white/90 border border-slate-300 text-slate-700 shadow-2xs">
              Automated Output
            </span>
          </div>

          {/* Giant Hero Decision State */}
          <div className="space-y-3 my-2">
            <div className="flex items-center gap-3">
              <span className="text-3xl sm:text-4xl">{heroBadge}</span>
              <span className="text-xs sm:text-sm font-bold uppercase tracking-wider text-slate-500">
                Current Grid Advisory Recommendation
              </span>
            </div>

            {/* EXTREMELY LARGE & BOLD POWER ON / POWER OFF RECOMMENDED */}
            <h2
              className={`text-4xl sm:text-5xl lg:text-6xl font-black tracking-tight leading-none ${
                isHigh ? 'text-red-600' : isMed ? 'text-amber-600' : 'text-emerald-600'
              }`}
            >
              {heroTitle}
            </h2>

            <p className="text-base sm:text-xl font-bold text-slate-700 pt-1">
              {heroSubtext}
            </p>
          </div>

          {/* High-Contrast Risk Level & Risk Score Stat Callouts */}
          <div className="grid grid-cols-2 gap-4 bg-white/90 border border-slate-200 rounded-2xl p-4 sm:p-5 shadow-xs">
            {/* Risk Level Callout */}
            <div className="border-r border-slate-200 pr-4">
              <span className="text-xs font-bold uppercase tracking-wider text-slate-400 block mb-1">
                Risk Level:
              </span>
              <span
                className={`text-2xl sm:text-3xl font-black tracking-tight ${
                  isHigh ? 'text-red-600' : isMed ? 'text-amber-600' : 'text-emerald-600'
                }`}
              >
                {risk.level}
              </span>
            </div>

            {/* Risk Score Callout */}
            <div className="pl-2">
              <span className="text-xs font-bold uppercase tracking-wider text-slate-400 block mb-1">
                Risk Score:
              </span>
              <span className="text-3xl sm:text-4xl font-black font-mono text-slate-900 tracking-tight">
                {risk.score} <span className="text-lg font-bold text-slate-400 font-sans">/ 100</span>
              </span>
            </div>
          </div>

          {/* Academic Simulation Mandate */}
          <div className="bg-white/80 border border-slate-200/90 rounded-2xl p-4 space-y-1">
            <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-slate-500">
              <Info className="w-3.5 h-3.5 text-sky-600" />
              <span>Simulated Action Directive ({weather.city}):</span>
            </div>
            <p className="text-sm sm:text-base font-semibold text-slate-800 leading-snug">
              {isHigh
                ? `High meteorological hazard detected in ${weather.city}. Software prototype recommends simulated electrical feeder trip to prevent equipment surge and short circuits.`
                : isMed
                ? `Moderate atmospheric disturbance in ${weather.city}. Simulated power remains ON under active telemetry monitoring.`
                : `Normal ambient conditions in ${weather.city}. Simulated electrical distribution energized at full load capacity.`}
            </p>
          </div>

          {/* Mandatory Disclaimer */}
          <div className="pt-2 border-t border-slate-200/80 flex items-start gap-2 text-xs text-slate-500">
            <span className="text-amber-500 font-bold shrink-0">⚠️</span>
            <span>
              <strong>Simulation only</strong> — this system does not control real electrical power, physical switches, or hardware.
            </span>
          </div>
        </section>

        {/* 2. 🧠 AI WEATHER RISK PREDICTION (5 Cols on large screens) */}
        <section
          id="aiWeatherRiskPredictionCard"
          aria-label="AI Weather Risk Prediction"
          className="lg:col-span-5 bg-white border-2 border-slate-200 rounded-3xl p-6 sm:p-7 shadow-xl flex flex-col justify-between gap-5 transition-all"
        >
          {/* Card Header */}
          <div className="flex items-center justify-between border-b border-slate-100 pb-3">
            <div className="flex items-center gap-2">
              <Activity className="w-5 h-5 text-sky-600" />
              <h3 className="text-xs sm:text-sm font-black uppercase tracking-widest text-slate-800">
                🧠 AI WEATHER RISK PREDICTION
              </h3>
            </div>
            <span
              className={`text-xs font-black px-3 py-1 rounded-full uppercase tracking-wider border ${
                isHigh
                  ? 'bg-red-50 text-red-700 border-red-200'
                  : isMed
                  ? 'bg-amber-50 text-amber-700 border-amber-200'
                  : 'bg-emerald-50 text-emerald-700 border-emerald-200'
              }`}
            >
              {risk.level}
            </span>
          </div>

          {/* Very Large Risk Score Gauge */}
          <div className="bg-slate-50 border border-slate-200/80 rounded-2xl p-5 space-y-3">
            <div className="flex items-baseline justify-between">
              <div>
                <span className="text-xs font-bold uppercase tracking-wider text-slate-400 block">
                  Calculated Risk Score
                </span>
                <div className="flex items-baseline gap-1 font-mono mt-0.5">
                  <span
                    className={`text-5xl sm:text-6xl font-black tracking-tight leading-none ${
                      isHigh ? 'text-red-600' : isMed ? 'text-amber-600' : 'text-emerald-600'
                    }`}
                  >
                    {risk.score}
                  </span>
                  <span className="text-xl font-bold text-slate-400 font-sans">/ 100</span>
                </div>
              </div>

              <div className="text-right">
                <span className="text-xs font-bold uppercase tracking-wider text-slate-400 block">
                  Safety Category
                </span>
                <span
                  className={`text-xl font-black uppercase tracking-tight block ${
                    isHigh ? 'text-red-600' : isMed ? 'text-amber-600' : 'text-emerald-600'
                  }`}
                >
                  {risk.level} RISK
                </span>
              </div>
            </div>

            {/* Visual Risk Bar */}
            <div className="w-full bg-slate-200 h-3.5 rounded-full overflow-hidden p-0.5">
              <div
                className={`h-full rounded-full transition-all duration-700 ${
                  isHigh ? 'bg-red-600' : isMed ? 'bg-amber-500' : 'bg-emerald-500'
                }`}
                style={{ width: `${Math.min(100, Math.max(5, risk.score))}%` }}
              />
            </div>
          </div>

          {/* "Why is the system predicting this risk?" Section */}
          <div className="space-y-2.5">
            <h4 className="text-xs sm:text-sm font-black uppercase tracking-wider text-slate-700 flex items-center gap-1.5">
              <span>Why is the system predicting this risk?</span>
            </h4>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs sm:text-sm">
              {detectedRiskFactors.map((item, idx) => (
                <div
                  key={idx}
                  className={`p-2.5 rounded-xl border flex items-start gap-2 ${
                    item.isRisk
                      ? 'bg-red-50/70 border-red-200 text-red-950 font-bold'
                      : 'bg-slate-50 border-slate-200 text-slate-700'
                  }`}
                >
                  <span className="text-base shrink-0">{item.icon}</span>
                  <div className="min-w-0">
                    <span className="block leading-tight">{item.title}</span>
                    <span className="text-[11px] opacity-75 block font-normal">{item.detail}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* AI Explanation Box (Based on real API weather data) */}
          <div className="bg-sky-50/70 border border-sky-200 rounded-2xl p-4 space-y-1">
            <div className="text-xs font-black uppercase tracking-wider text-sky-800 flex items-center gap-1.5">
              <Brain className="w-3.5 h-3.5 text-sky-600" />
              <span>AI Explanation:</span>
            </div>
            <p className="text-xs sm:text-sm font-semibold text-slate-800 leading-relaxed">
              &ldquo;{risk.explanation}&rdquo;
            </p>
          </div>

          {/* Collapsible Factor Breakdown toggle */}
          <div className="pt-2 border-t border-slate-100 flex items-center justify-between text-xs">
            <button
              type="button"
              onClick={() => setShowFormulaDetails(!showFormulaDetails)}
              className="font-bold text-sky-600 hover:text-sky-800 flex items-center gap-1 cursor-pointer transition-colors"
            >
              <span>{showFormulaDetails ? 'Hide' : 'View'} Mathematical Factor Weights</span>
              {showFormulaDetails ? <ChevronUp className="w-3.5 h-3.5" /> : <ChevronDown className="w-3.5 h-3.5" />}
            </button>
            <span className="text-slate-400 font-mono text-[11px]">
              Rain: +{rainfallPts} &bull; Wind: +{windPts} &bull; Storm: +{stormPts}
            </span>
          </div>

          {/* Expanded Factor Breakdown */}
          {showFormulaDetails && (
            <div className="bg-slate-50 border border-slate-200 rounded-2xl p-4 space-y-3 text-xs animate-in fade-in">
              <div className="font-extrabold text-slate-900 uppercase tracking-wider pb-1 border-b border-slate-200">
                Demonstration Risk Score Formula:
              </div>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 font-mono">
                <div className="bg-white p-2 rounded-lg border border-slate-200">
                  <div className="text-[10px] text-slate-400">Rainfall</div>
                  <div className="font-black text-slate-800">+{rainfallPts} pts</div>
                </div>
                <div className="bg-white p-2 rounded-lg border border-slate-200">
                  <div className="text-[10px] text-slate-400">Wind</div>
                  <div className="font-black text-slate-800">+{windPts} pts</div>
                </div>
                <div className="bg-white p-2 rounded-lg border border-slate-200">
                  <div className="text-[10px] text-slate-400">Storm / Lightning</div>
                  <div className="font-black text-slate-800">+{stormPts} pts</div>
                </div>
                <div className="bg-white p-2 rounded-lg border border-slate-200">
                  <div className="text-[10px] text-slate-400">Humidity</div>
                  <div className="font-black text-slate-800">+{humidityPts} pts</div>
                </div>
              </div>
              <p className="text-[11px] text-slate-500 italic">
                * Demonstration thresholds: Rain &ge;30mm (+40), Wind &ge;50km/h (+35), Storm (+30), Humidity &ge;85% (+10). Max 100.
              </p>
            </div>
          )}
        </section>
      </div>

      {/* Optional Google Sheets Cloud Sync Drawer */}
      <div className="pt-2">
        <button
          type="button"
          onClick={() => setShowSheetsSync(!showSheetsSync)}
          className="text-xs sm:text-sm font-bold text-slate-600 hover:text-slate-900 flex items-center gap-1.5 cursor-pointer bg-white px-4 py-2 rounded-xl border border-slate-200 shadow-2xs transition-all"
        >
          <FileSpreadsheet className="w-4 h-4 text-emerald-600" />
          <span>{showSheetsSync ? 'Hide' : 'Configure'} Google Sheets Telemetry Cloud Export</span>
          {showSheetsSync ? <ChevronUp className="w-3.5 h-3.5" /> : <ChevronDown className="w-3.5 h-3.5" />}
        </button>

        {showSheetsSync && (
          <div className="mt-3 animate-in fade-in">
            <GoogleSheetsIntegration
              currentWeather={weather}
              currentRisk={risk}
              autoLogEnabled={autoLogSheets}
              onToggleAutoLog={onToggleAutoLog}
              onNotification={(n) => onAddLog(n.message, n.type === 'error' ? 'critical' : 'success')}
            />
          </div>
        )}
      </div>

    </div>
  );
};
