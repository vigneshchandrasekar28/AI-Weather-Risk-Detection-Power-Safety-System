import React from 'react';
import { AlertTriangle, Zap, ShieldCheck } from 'lucide-react';

export const Header: React.FC = () => {
  return (
    <header className="space-y-4">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          {/* Top Badge: ⚡ AI POWER SAFETY */}
          <div className="flex items-center gap-2.5 mb-2 flex-wrap">
            <div className="inline-flex items-center gap-2 bg-slate-900 text-white text-sm font-black px-4 py-1.5 rounded-xl tracking-wider shadow-sm">
              <Zap className="w-4 h-4 text-sky-400 fill-sky-400" />
              <span>⚡ AI POWER SAFETY</span>
            </div>
            <span className="inline-flex items-center gap-2 bg-emerald-50 text-emerald-800 border border-emerald-200 text-xs sm:text-sm font-black px-3 py-1 rounded-full">
              <span className="w-2 h-2 rounded-full bg-emerald-500 animate-ping"></span>
              <span className="w-1.5 h-1.5 -ml-3 rounded-full bg-emerald-600"></span>
              Live Grid Hazard Monitoring
            </span>
            <span className="text-slate-500 text-xs sm:text-sm font-bold bg-slate-100 border border-slate-200 px-2.5 py-1 rounded-lg">
              Academic Software Prototype
            </span>
          </div>

          {/* Large Bold Main Title */}
          <h1 className="text-3xl sm:text-4xl lg:text-5xl font-black text-slate-900 tracking-tight leading-tight">
            AI Weather Risk Detection &amp; Power Safety System
          </h1>
          <p className="text-base sm:text-lg text-slate-600 font-semibold mt-1">
            Real-time meteorological risk evaluation and automated simulated power safety advisory
          </p>
        </div>
      </div>

      {/* Mandatory Safety Disclaimer Banner */}
      <div
        id="academicSafetyDisclaimer"
        className="flex items-start gap-3 bg-amber-50 border-2 border-amber-300 rounded-2xl p-4 sm:p-5 text-amber-950 shadow-xs"
      >
        <AlertTriangle className="w-6 h-6 text-amber-600 shrink-0 mt-0.5" />
        <div className="text-xs sm:text-sm leading-relaxed space-y-1">
          <div>
            <strong className="font-black text-amber-950 uppercase tracking-wide">
              Academic Demonstration Prototype &bull; Safety Notice:
            </strong>
          </div>
          <p className="font-semibold text-amber-900">
            &ldquo;Simulation only — this system does not control real electrical power.&rdquo; It does not physically connect to electrical mains, power switches, power grids, or household appliances. All outputs are simulated recommendations for college project demonstrations.
          </p>
          <p className="text-xs text-amber-800">
            * The risk thresholds used by this prototype are demonstration rules and are not official electrical safety standards.
          </p>
        </div>
      </div>
    </header>
  );
};
