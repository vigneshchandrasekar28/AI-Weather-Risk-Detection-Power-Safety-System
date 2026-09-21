import React, { useState } from 'react';
import { ForecastItem, DailyForecast, RiskLevel } from '../types';
import {
  Calendar,
  Clock,
  CloudRain,
  Wind,
  Droplets,
  Sun,
  CloudLightning,
  ChevronRight,
  ShieldCheck,
  AlertOctagon,
  ShieldAlert,
  Zap,
  Sparkles
} from 'lucide-react';

interface WeatherForecastPanelProps {
  hourly: ForecastItem[];
  daily: DailyForecast[];
  cityName: string;
  isLoading?: boolean;
}

// Helper to compute demonstration risk score & level for forecast telemetry
function computeForecastRisk(item: ForecastItem): { score: number; level: RiskLevel; decision: string } {
  let score = 0;

  // Rainfall factor
  if (item.rainfallMm >= 30) score += 40;
  else if (item.rainfallMm >= 15) score += 25;
  else if (item.rainfallMm >= 5) score += 15;
  else if (item.rainfallMm > 0) score += 5;

  // Wind factor
  if (item.windSpeedKmh >= 50) score += 35;
  else if (item.windSpeedKmh >= 35) score += 20;
  else if (item.windSpeedKmh >= 25) score += 10;

  // Thunderstorm / lightning factor
  const cond = item.condition.toLowerCase();
  if (cond.includes('thunder') || cond.includes('storm') || cond.includes('lightning')) {
    score += 30;
  }

  // Humidity factor
  if (item.humidity >= 85) score += 10;
  else if (item.humidity >= 75) score += 5;

  score = Math.min(100, score);

  if (score >= 60) {
    return { score, level: 'HIGH', decision: 'POWER OFF RECOMMENDED' };
  } else if (score >= 30) {
    return { score, level: 'MEDIUM', decision: 'MONITOR' };
  } else {
    return { score, level: 'LOW', decision: 'POWER ON' };
  }
}

export const WeatherForecastPanel: React.FC<WeatherForecastPanelProps> = ({
  hourly,
  daily,
  cityName,
  isLoading = false
}) => {
  const [activeTab, setActiveTab] = useState<'hourly' | 'daily'>('hourly');

  return (
    <section
      id="upcomingWeatherRiskSection"
      aria-label="Upcoming Weather Risk and Forecast"
      className="bg-white border-2 border-slate-200 rounded-3xl p-6 sm:p-8 shadow-sm space-y-6"
    >
      {/* Header with Title and Mode Switcher */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-slate-100">
        <div>
          <div className="flex items-center gap-2">
            <span className="text-xl">🔮</span>
            <h3 className="text-sm sm:text-base font-black uppercase tracking-wider text-slate-900">
              UPCOMING WEATHER RISK &bull; {cityName}
            </h3>
          </div>
          <p className="text-xs sm:text-sm text-slate-500 mt-0.5">
            Predictive multi-hour atmospheric risk modeling and simulated power safety recommendations
          </p>
        </div>

        {/* Mode Toggle: Next 24 Hours vs Next 5 Days */}
        <div className="inline-flex rounded-xl bg-slate-100 p-1 self-start sm:self-auto text-xs sm:text-sm font-bold">
          <button
            type="button"
            onClick={() => setActiveTab('hourly')}
            className={`px-4 py-2 rounded-lg transition-all cursor-pointer flex items-center gap-1.5 ${
              activeTab === 'hourly'
                ? 'bg-white text-slate-900 shadow-sm font-black'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            <Clock className="w-4 h-4 text-sky-600" />
            <span>Next 24 Hours</span>
          </button>
          <button
            type="button"
            onClick={() => setActiveTab('daily')}
            className={`px-4 py-2 rounded-lg transition-all cursor-pointer flex items-center gap-1.5 ${
              activeTab === 'daily'
                ? 'bg-white text-slate-900 shadow-sm font-black'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            <Calendar className="w-4 h-4 text-indigo-600" />
            <span>Next 5 Days</span>
          </button>
        </div>
      </div>

      {isLoading ? (
        <div className="py-12 text-center space-y-3">
          <div className="w-10 h-10 border-3 border-sky-600 border-t-transparent rounded-full animate-spin mx-auto" />
          <p className="text-sm font-bold text-slate-500">Retrieving real-time forecast data for {cityName}...</p>
        </div>
      ) : activeTab === 'hourly' ? (
        /* Hourly / 3-hour Upcoming Risk Timeline (Next 24 Hours) */
        <div className="space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {hourly.slice(0, 8).map((item, idx) => {
              const { score, level, decision } = computeForecastRisk(item);
              const isHigh = level === 'HIGH';
              const isMed = level === 'MEDIUM';

              return (
                <div
                  key={idx}
                  className={`rounded-2xl p-5 border-2 transition-all flex flex-col justify-between gap-3 ${
                    isHigh
                      ? 'bg-red-50/70 border-red-300 text-red-950 shadow-sm'
                      : isMed
                      ? 'bg-amber-50/70 border-amber-300 text-amber-950 shadow-sm'
                      : 'bg-emerald-50/50 border-emerald-200/80 text-emerald-950 hover:bg-emerald-50'
                  }`}
                >
                  {/* Time + Risk Level */}
                  <div className="flex items-center justify-between">
                    <span className="font-mono text-sm sm:text-base font-black text-slate-900 bg-white/90 px-2.5 py-1 rounded-lg border border-slate-200">
                      {item.time}
                    </span>
                    <span
                      className={`text-[11px] font-black uppercase px-2.5 py-1 rounded-full border ${
                        isHigh
                          ? 'bg-red-600 text-white border-red-700'
                          : isMed
                          ? 'bg-amber-500 text-white border-amber-600'
                          : 'bg-emerald-600 text-white border-emerald-700'
                      }`}
                    >
                      {level} RISK ({score}/100)
                    </span>
                  </div>

                  {/* Simulated Power Decision Badge */}
                  <div className="py-1">
                    <span className="text-[10px] font-bold uppercase tracking-wider text-slate-500 block mb-1">
                      Power Decision:
                    </span>
                    <div
                      className={`text-base sm:text-lg font-black tracking-tight flex items-center gap-1.5 ${
                        isHigh ? 'text-red-600' : isMed ? 'text-amber-700' : 'text-emerald-700'
                      }`}
                    >
                      <span className="text-xl">{isHigh ? '🔴' : isMed ? '🟡' : '🟢'}</span>
                      <span>{decision}</span>
                    </div>
                  </div>

                  {/* Weather Parameters */}
                  <div className="pt-2 border-t border-slate-200/80 flex items-center justify-between text-xs font-semibold text-slate-700">
                    <span className="text-base font-mono font-black text-slate-900">{Math.round(item.temp)}&deg;C</span>
                    <span>{item.condition}</span>
                    <span className="text-slate-500">{item.windSpeedKmh} km/h</span>
                    {item.rainfallMm > 0 && (
                      <span className="text-sky-700 font-bold">{item.rainfallMm} mm</span>
                    )}
                  </div>
                </div>
              );
            })}
          </div>

          <div className="p-3.5 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-500 flex items-center gap-2">
            <span className="text-sky-600 font-bold">ℹ️</span>
            <span>
              <strong>Demonstration Risk Prediction Model: </strong>
              Upcoming risk is calculated dynamically from live OpenWeather forecast feeds using calibrated precipitation, wind velocity, and thunderstorm detection rules.
            </span>
          </div>
        </div>
      ) : (
        /* Next 5 Days Daily Forecast Cards */
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-3.5">
          {daily.map((item, idx) => {
            const isStormy = item.condition.toLowerCase().includes('thunder') || item.rainfallMm > 20;

            return (
              <div
                key={idx}
                className={`rounded-2xl p-4 border transition-all text-center space-y-3 ${
                  isStormy
                    ? 'bg-purple-50/60 border-purple-300'
                    : 'bg-slate-50 border-slate-200 hover:bg-white'
                }`}
              >
                <div className="font-bold text-sm text-slate-900 pb-1 border-b border-slate-200/80">
                  {item.day}
                </div>

                <div className="space-y-1">
                  <div className="text-2xl font-black font-mono text-slate-900">
                    {Math.round(item.tempMax)}&deg; / {Math.round(item.tempMin)}&deg;
                  </div>
                  <div className="text-xs font-semibold text-slate-600">{item.condition}</div>
                </div>

                <div className="text-[11px] text-slate-500 space-y-0.5 pt-1 border-t border-slate-200/60">
                  <div>Rain: {item.rainfallMm} mm</div>
                  <div>Wind: {item.windSpeedKmh} km/h</div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </section>
  );
};
