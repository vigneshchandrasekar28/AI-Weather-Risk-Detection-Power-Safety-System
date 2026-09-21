import React from 'react';
import { Layers, ShieldAlert, Cpu, Activity } from 'lucide-react';

export const ArchitectureMatrix: React.FC = () => {
  return (
    <section className="bg-white border border-slate-200 rounded-xl p-5 shadow-xs space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="text-xs font-bold uppercase tracking-wider text-slate-700 flex items-center gap-2">
          <Layers className="w-4 h-4 text-sky-600" />
          Rule-Based AI Decision Engine Architecture
        </h3>
        <span className="text-[11px] font-semibold text-slate-500">Academic Logic Model</span>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-3.5">
        {/* Low Risk */}
        <div className="bg-emerald-50/70 border border-emerald-200 rounded-lg p-3.5 space-y-1.5">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-extrabold px-2 py-0.5 rounded bg-emerald-100 text-emerald-800 border border-emerald-300">
              0 - 29 : LOW RISK
            </span>
            <span className="text-xs font-bold text-emerald-800">POWER ON</span>
          </div>
          <h4 className="text-xs font-bold text-slate-900">Normal Safe Grid Operation</h4>
          <p className="text-xs text-slate-600 leading-relaxed">
            Precipitation &le; 5mm/hr, wind gusts &le; 25km/h. Overhead distribution lines and substations remain within nominal mechanical and electrical tolerances.
          </p>
        </div>

        {/* Medium Risk */}
        <div className="bg-amber-50/70 border border-amber-200 rounded-lg p-3.5 space-y-1.5">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-extrabold px-2 py-0.5 rounded bg-amber-100 text-amber-800 border border-amber-300">
              30 - 59 : MEDIUM RISK
            </span>
            <span className="text-xs font-bold text-amber-800">POWER ON (Advisory)</span>
          </div>
          <h4 className="text-xs font-bold text-slate-900">Supervised Distribution</h4>
          <p className="text-xs text-slate-600 leading-relaxed">
            Moderate rainfall (5-15mm) or winds (25-45km/h). Power remains energized with advisory alert logs; automated telemetry polls weather updates every 30 seconds.
          </p>
        </div>

        {/* High Risk */}
        <div className="bg-red-50/70 border border-red-200 rounded-lg p-3.5 space-y-1.5">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-extrabold px-2 py-0.5 rounded bg-red-100 text-red-800 border border-red-300">
              60 - 100 : HIGH RISK
            </span>
            <span className="text-xs font-bold text-red-800">POWER OFF</span>
          </div>
          <h4 className="text-xs font-bold text-slate-900">Simulated Preventive Isolation</h4>
          <p className="text-xs text-slate-600 leading-relaxed">
            Thunderstorms with lightning surges, cyclone winds &ge; 45km/h, or torrential flooding (&gt;15mm/hr). Immediate software recommendation to isolate feeders to prevent transformer fires.
          </p>
        </div>
      </div>

      <div className="text-[11px] text-slate-500 bg-slate-50 rounded-lg p-2.5 flex items-center justify-between flex-wrap gap-2">
        <span className="flex items-center gap-1.5">
          <Cpu className="w-3.5 h-3.5 text-slate-400" />
          <strong>Formula:</strong> Risk Score = min(100, RainfallPts [max 40] + WindPts [max 38] + ConditionPts [max 45] + HumidityPts [max 8])
        </span>
        <span className="font-mono text-slate-600">Threshold: Score &ge; 60 &rarr; POWER OFF</span>
      </div>
    </section>
  );
};
