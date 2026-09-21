import React from 'react';
import { RiskAnalysis, WeatherData } from '../types';
import { AlertTriangle, CheckCircle2, ShieldAlert, Clock, AlertOctagon, Zap } from 'lucide-react';

interface SmartAlertPanelProps {
  risk: RiskAnalysis;
  weather: WeatherData;
  detectionTime: string;
  onDismiss?: () => void;
}

export const SmartAlertPanel: React.FC<SmartAlertPanelProps> = ({
  risk,
  weather,
  detectionTime
}) => {
  const isHigh = risk.level === 'HIGH';
  const isMed = risk.level === 'MEDIUM';

  // Build specific detected reasons based on real API weather telemetry
  const reasonsList: string[] = [];
  if (weather.rainfallMm >= 15) {
    reasonsList.push('Heavy rainfall detected');
  } else if (weather.rainfallMm > 0) {
    reasonsList.push(`Rainfall detected (${weather.rainfallMm} mm)`);
  }

  if (weather.windSpeedKmh >= 40) {
    reasonsList.push('Strong wind detected');
  } else if (weather.windSpeedKmh >= 25) {
    reasonsList.push(`Elevated wind velocity (${weather.windSpeedKmh} km/h)`);
  }

  const conditionLower = (weather.condition + ' ' + weather.description).toLowerCase();
  if (conditionLower.includes('thunder') || conditionLower.includes('storm') || conditionLower.includes('lightning') || (weather.conditionId >= 200 && weather.conditionId < 300)) {
    reasonsList.push('Thunderstorm detected');
  }

  if (weather.humidity >= 85) {
    reasonsList.push('High atmospheric humidity');
  }

  const reasonString = reasonsList.length > 0
    ? reasonsList.join(' + ')
    : 'Elevated composite atmospheric risk score.';

  if (!isHigh && !isMed) {
    // NORMAL CONDITIONS STATE
    return (
      <div
        id="smartAlertNormal"
        className="bg-emerald-50 border-2 border-emerald-300 rounded-3xl p-5 sm:p-6 shadow-md text-emerald-950 flex flex-col sm:flex-row sm:items-center justify-between gap-4 transition-all"
      >
        <div className="flex items-center gap-4">
          <div className="w-14 h-14 rounded-2xl bg-emerald-600 text-white flex items-center justify-center shrink-0 shadow-sm text-2xl">
            ✓
          </div>
          <div>
            <div className="flex items-center gap-2 flex-wrap">
              <h3 className="text-xl sm:text-2xl font-black text-emerald-900 tracking-tight">
                WEATHER CONDITIONS NORMAL
              </h3>
              <span className="px-3 py-1 bg-emerald-600 text-white font-black text-xs uppercase tracking-wider rounded-lg">
                🟢 POWER ON
              </span>
            </div>
            <p className="text-sm sm:text-base font-semibold text-emerald-800 mt-1">
              The system is currently detecting low weather-related risk in {weather.city}.
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2 text-xs sm:text-sm font-bold text-emerald-700 bg-emerald-100/70 border border-emerald-200 px-3 py-1.5 rounded-xl self-start sm:self-auto shrink-0 font-mono">
          <Clock className="w-4 h-4 text-emerald-600" />
          <span>Verified at {detectionTime}</span>
        </div>
      </div>
    );
  }

  if (isMed) {
    // MEDIUM CONDITIONS STATE
    return (
      <div
        id="smartAlertMedium"
        className="bg-amber-50 border-2 border-amber-300 rounded-3xl p-5 sm:p-6 shadow-md text-amber-950 flex flex-col sm:flex-row sm:items-center justify-between gap-4 transition-all"
      >
        <div className="flex items-center gap-4">
          <div className="w-14 h-14 rounded-2xl bg-amber-500 text-white flex items-center justify-center shrink-0 shadow-sm text-2xl">
            ⚡
          </div>
          <div>
            <div className="flex items-center gap-2 flex-wrap">
              <h3 className="text-xl sm:text-2xl font-black text-amber-950 tracking-tight">
                MODERATE WEATHER RISK DETECTED
              </h3>
              <span className="px-3 py-1 bg-amber-600 text-white font-black text-xs uppercase tracking-wider rounded-lg">
                🟡 POWER ON — MONITOR
              </span>
            </div>
            <p className="text-sm sm:text-base font-semibold text-amber-900 mt-1">
              <strong>Reason: </strong> {reasonString}
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2 text-xs sm:text-sm font-bold text-amber-800 bg-amber-100/70 border border-amber-200 px-3 py-1.5 rounded-xl self-start sm:self-auto shrink-0 font-mono">
          <Clock className="w-4 h-4 text-amber-600" />
          <span>{detectionTime}</span>
        </div>
      </div>
    );
  }

  // HIGH RISK STATE - CRITICAL ALERT
  return (
    <div
      id="smartAlertHighRisk"
      className="bg-gradient-to-r from-red-50 via-rose-50 to-red-100/90 border-3 border-red-500 rounded-3xl p-6 sm:p-8 shadow-xl text-red-950 space-y-4 animate-in fade-in duration-300"
    >
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-3 border-b border-red-200">
        <div className="flex items-center gap-4">
          <div className="w-16 h-16 rounded-2xl bg-red-600 text-white flex items-center justify-center shrink-0 shadow-lg text-3xl animate-pulse">
            ⚠️
          </div>
          <div>
            <div className="flex items-center gap-2 flex-wrap">
              <h3 className="text-2xl sm:text-3xl font-black text-red-700 tracking-tight">
                HIGH WEATHER RISK DETECTED
              </h3>
              <span className="px-3.5 py-1 bg-red-600 text-white font-black text-sm uppercase tracking-wider rounded-xl shadow-sm">
                🔴 POWER OFF RECOMMENDED
              </span>
            </div>
            <p className="text-sm sm:text-base text-red-900 font-semibold mt-1">
              Automated atmospheric hazard detection for {weather.city}.
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2 text-xs sm:text-sm font-bold text-red-700 bg-white/90 border border-red-200 px-3.5 py-1.5 rounded-xl self-start sm:self-auto shrink-0 font-mono">
          <Clock className="w-4 h-4 text-red-600" />
          <span>Detected: {detectionTime}</span>
        </div>
      </div>

      <div className="bg-white/90 border border-red-200 rounded-2xl p-4 sm:p-5 space-y-1.5">
        <div className="text-xs sm:text-sm font-black uppercase tracking-wider text-red-600 flex items-center gap-1.5">
          <span>Reason:</span>
        </div>
        <p className="text-base sm:text-lg font-extrabold text-slate-900">
          {reasonString}.
        </p>
        <p className="text-xs sm:text-sm text-slate-600">
          Composite Risk Score: <strong className="text-red-600 font-mono font-black">{risk.score}/100</strong> &bull; Level: <strong className="text-red-600 font-black">{risk.level}</strong>. Software prototype advises simulated protective feeder trip.
        </p>
      </div>
    </div>
  );
};
