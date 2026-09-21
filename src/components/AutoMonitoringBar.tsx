import React from 'react';
import { RefreshCw, Play, Pause, Clock, Activity, ShieldCheck } from 'lucide-react';

interface AutoMonitoringBarProps {
  autoRefresh: boolean;
  onToggleAutoRefresh: () => void;
  refreshIntervalMinutes: number;
  onChangeRefreshInterval: (mins: number) => void;
  refreshCountdown: number;
  cityName: string;
}

export const AutoMonitoringBar: React.FC<AutoMonitoringBarProps> = ({
  autoRefresh,
  onToggleAutoRefresh,
  refreshIntervalMinutes,
  onChangeRefreshInterval,
  refreshCountdown,
  cityName
}) => {
  const formatCountdown = (totalSecs: number) => {
    const mins = Math.floor(totalSecs / 60);
    const secs = totalSecs % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  return (
    <section
      id="autoMonitoringSection"
      aria-label="Automatic Weather Monitoring"
      className={`rounded-3xl p-5 sm:p-6 border-2 transition-all shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-4 ${
        autoRefresh
          ? 'bg-sky-50/80 border-sky-300 text-sky-950 ring-2 ring-sky-200/60'
          : 'bg-white border-slate-200 text-slate-800'
      }`}
    >
      <div className="flex items-center gap-3.5">
        <div
          className={`w-12 h-12 rounded-2xl flex items-center justify-center text-xl shrink-0 transition-all ${
            autoRefresh
              ? 'bg-sky-600 text-white shadow-md'
              : 'bg-slate-100 text-slate-500 border border-slate-200'
          }`}
        >
          <Activity className={`w-6 h-6 ${autoRefresh ? 'animate-pulse text-white' : 'text-slate-400'}`} />
        </div>
        <div>
          <div className="flex items-center gap-2">
            <span className="text-xs sm:text-sm font-black uppercase tracking-wider text-slate-900">
              ⚡ AUTO MONITORING ENGINE
            </span>
            <span
              className={`text-[11px] font-black uppercase px-2.5 py-0.5 rounded-full ${
                autoRefresh
                  ? 'bg-sky-600 text-white animate-pulse'
                  : 'bg-slate-200 text-slate-600'
              }`}
            >
              {autoRefresh ? 'ACTIVE' : 'STANDBY'}
            </span>
          </div>
          <p className="text-xs sm:text-sm text-slate-600 font-medium mt-0.5">
            {autoRefresh
              ? `Automatically querying live weather for ${cityName} and recalculating power recommendations.`
              : 'Continuous automated background polling is currently paused. Activate to auto-refresh.'}
          </p>
        </div>
      </div>

      {/* Controls & Countdown */}
      <div className="flex flex-wrap items-center gap-3 self-start md:self-auto">
        {autoRefresh && (
          <div className="flex items-center gap-2 bg-white/90 border border-sky-200 px-3.5 py-2 rounded-xl text-xs sm:text-sm font-mono font-bold text-sky-900 shadow-2xs">
            <Clock className="w-4 h-4 text-sky-600" />
            <span>Next Poll: {formatCountdown(refreshCountdown)}</span>
          </div>
        )}

        {/* Interval Dropdown */}
        <div className="flex items-center gap-1.5 text-xs font-bold text-slate-600">
          <span>Interval:</span>
          <select
            value={refreshIntervalMinutes}
            onChange={(e) => onChangeRefreshInterval(Number(e.target.value))}
            className="text-xs sm:text-sm font-bold rounded-xl border border-slate-300 bg-white px-3 py-2 text-slate-900 focus:border-sky-500 focus:outline-none cursor-pointer"
          >
            <option value={5}>5 mins</option>
            <option value={10}>10 mins</option>
            <option value={15}>15 mins</option>
            <option value={30}>30 mins</option>
          </select>
        </div>

        {/* Big ON / OFF Toggle Button */}
        <button
          type="button"
          id="autoMonitoringToggleBtn"
          onClick={onToggleAutoRefresh}
          className={`px-5 py-2.5 rounded-xl font-black text-sm sm:text-base flex items-center gap-2 cursor-pointer shadow-sm transition-all ${
            autoRefresh
              ? 'bg-red-600 hover:bg-red-700 active:bg-red-800 text-white'
              : 'bg-slate-900 hover:bg-slate-800 active:bg-slate-950 text-white'
          }`}
        >
          {autoRefresh ? (
            <>
              <Pause className="w-4 h-4" />
              <span>TURN OFF</span>
            </>
          ) : (
            <>
              <Play className="w-4 h-4 text-sky-400" />
              <span>TURN ON</span>
            </>
          )}
        </button>
      </div>
    </section>
  );
};
