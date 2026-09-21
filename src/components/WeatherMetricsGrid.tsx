import React from 'react';
import { Thermometer, CloudRain, Wind, Droplets, CloudLightning } from 'lucide-react';
import { WeatherData } from '../types';

interface WeatherMetricsGridProps {
  weather: WeatherData;
  locationName?: string;
  lastUpdated?: string;
}

export const WeatherMetricsGrid: React.FC<WeatherMetricsGridProps> = ({ weather, locationName, lastUpdated }) => {
  return (
    <section aria-label="Current Weather Telemetry" className="space-y-3">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-1">
        <h3 className="text-xs sm:text-sm font-black text-slate-500 uppercase tracking-wider flex items-center gap-2">
          <span>🌦 Current Weather Information &bull; Real-Time API Telemetry</span>
          {locationName && (
            <span className="text-sky-700 font-extrabold bg-sky-50 px-2.5 py-0.5 rounded-full border border-sky-200 normal-case">
              {locationName}
            </span>
          )}
        </h3>
        {lastUpdated && (
          <span className="text-xs text-slate-400 font-medium font-mono">
            Updated: {lastUpdated}
          </span>
        )}
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3.5">
        
        {/* 1. Temperature */}
        <div className="bg-white border border-slate-200 rounded-2xl p-4 shadow-xs flex flex-col justify-between gap-3 hover:-translate-y-0.5 transition-transform">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400">
              Temperature
            </span>
            <div className="w-8 h-8 rounded-lg bg-orange-50 text-orange-600 flex items-center justify-center">
              <Thermometer className="w-4 h-4" />
            </div>
          </div>
          <div>
            <div className="flex items-baseline gap-0.5 font-mono">
              <span className="text-3xl font-black text-slate-900 leading-none">
                {Math.round(weather.temp)}
              </span>
              <span className="text-sm font-bold text-slate-500">°C</span>
            </div>
            <p className="text-[11px] text-slate-400 mt-1">Ambient thermal level</p>
          </div>
        </div>

        {/* 2. Rainfall */}
        <div className="bg-white border border-slate-200 rounded-2xl p-4 shadow-xs flex flex-col justify-between gap-3 hover:-translate-y-0.5 transition-transform">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400">
              Rainfall
            </span>
            <div className="w-8 h-8 rounded-lg bg-sky-50 text-sky-600 flex items-center justify-center">
              <CloudRain className="w-4 h-4" />
            </div>
          </div>
          <div>
            <div className="flex items-baseline gap-0.5 font-mono">
              <span className="text-3xl font-black text-slate-900 leading-none">
                {weather.rainfallMm.toFixed(1)}
              </span>
              <span className="text-sm font-bold text-slate-500">mm</span>
            </div>
            <p className="text-[11px] text-slate-400 mt-1">
              {weather.rainfallMm > 25 ? 'Torrential flood threat' : weather.rainfallMm > 0 ? 'Precipitation active' : 'Dry / Normal'}
            </p>
          </div>
        </div>

        {/* 3. Wind Speed */}
        <div className="bg-white border border-slate-200 rounded-2xl p-4 shadow-xs flex flex-col justify-between gap-3 hover:-translate-y-0.5 transition-transform">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400">
              Wind Speed
            </span>
            <div className="w-8 h-8 rounded-lg bg-indigo-50 text-indigo-600 flex items-center justify-center">
              <Wind className="w-4 h-4" />
            </div>
          </div>
          <div>
            <div className="flex items-baseline gap-0.5 font-mono">
              <span className="text-3xl font-black text-slate-900 leading-none">
                {Math.round(weather.windSpeedKmh)}
              </span>
              <span className="text-sm font-bold text-slate-500">km/h</span>
            </div>
            <p className="text-[11px] text-slate-400 mt-1">
              {weather.windSpeedKmh >= 50 ? 'Severe gale strain' : 'Safe line tension'}
            </p>
          </div>
        </div>

        {/* 4. Humidity */}
        <div className="bg-white border border-slate-200 rounded-2xl p-4 shadow-xs flex flex-col justify-between gap-3 hover:-translate-y-0.5 transition-transform">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400">
              Humidity
            </span>
            <div className="w-8 h-8 rounded-lg bg-cyan-50 text-cyan-600 flex items-center justify-center">
              <Droplets className="w-4 h-4" />
            </div>
          </div>
          <div>
            <div className="flex items-baseline gap-0.5 font-mono">
              <span className="text-3xl font-black text-slate-900 leading-none">
                {weather.humidity}
              </span>
              <span className="text-sm font-bold text-slate-500">%</span>
            </div>
            <p className="text-[11px] text-slate-400 mt-1">Dielectric insulation margin</p>
          </div>
        </div>

        {/* 5. Weather Condition */}
        <div className="col-span-2 sm:col-span-1 bg-white border border-slate-200 rounded-2xl p-4 shadow-xs flex flex-col justify-between gap-3 hover:-translate-y-0.5 transition-transform">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400">
              Weather
            </span>
            <div className="w-8 h-8 rounded-lg bg-amber-50 text-amber-600 flex items-center justify-center">
              <CloudLightning className="w-4 h-4" />
            </div>
          </div>
          <div>
            <div className="text-lg font-black text-slate-900 capitalize truncate leading-tight">
              {weather.description || weather.condition}
            </div>
            <p className="text-[11px] text-slate-400 mt-1 truncate">
              {weather.condition} condition
            </p>
          </div>
        </div>

      </div>
    </section>
  );
};
