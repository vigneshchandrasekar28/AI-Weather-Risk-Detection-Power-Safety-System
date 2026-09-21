import React from 'react';
import { SystemEventLogItem } from '../types';
import { Terminal, ShieldAlert, AlertTriangle, CheckCircle2, Clock, Trash2 } from 'lucide-react';

interface SystemEventLogPanelProps {
  logs: SystemEventLogItem[];
  onClearLogs?: () => void;
}

export const SystemEventLogPanel: React.FC<SystemEventLogPanelProps> = ({
  logs,
  onClearLogs
}) => {
  return (
    <section id="systemEventLogSection" className="bg-white border border-slate-200 rounded-2xl p-6 shadow-xs space-y-4">
      <div className="flex items-center justify-between pb-2 border-b border-slate-100">
        <div className="flex items-center gap-2">
          <Terminal className="w-4 h-4 text-sky-600" />
          <h3 className="text-xs font-extrabold uppercase tracking-wider text-slate-800">
            System Event Log ({logs.length})
          </h3>
        </div>
        {onClearLogs && logs.length > 0 && (
          <button
            type="button"
            onClick={onClearLogs}
            className="text-xs font-semibold text-slate-400 hover:text-slate-700 flex items-center gap-1 cursor-pointer transition-all"
          >
            <Trash2 className="w-3.5 h-3.5" />
            <span>Clear Log</span>
          </button>
        )}
      </div>

      <div className="bg-slate-900 text-slate-100 rounded-xl p-4 font-mono text-xs max-h-60 overflow-y-auto space-y-2 select-text shadow-inner">
        {logs.length === 0 ? (
          <div className="text-slate-500 py-4 text-center italic">
            No system events recorded yet. Event stream will populate automatically.
          </div>
        ) : (
          logs.map((log) => {
            const isCrit = log.severity === 'critical';
            const isWarn = log.severity === 'warning';
            const isSucc = log.severity === 'success';

            return (
              <div
                key={log.id}
                className="flex items-start gap-2.5 py-1 border-b border-slate-800/80 last:border-0"
              >
                <span className="text-slate-500 text-[11px] shrink-0">{log.timestamp}</span>
                <span
                  className={`text-[9px] font-black uppercase px-1.5 py-0.2 rounded shrink-0 ${
                    isCrit
                      ? 'bg-red-500/20 text-red-400 border border-red-500/30'
                      : isWarn
                      ? 'bg-amber-500/20 text-amber-300 border border-amber-500/30'
                      : isSucc
                      ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30'
                      : 'bg-slate-700/50 text-slate-300'
                  }`}
                >
                  {log.severity}
                </span>
                <span
                  className={`flex-1 text-[11px] leading-snug ${
                    isCrit ? 'text-red-300 font-semibold' : isWarn ? 'text-amber-200' : 'text-slate-200'
                  }`}
                >
                  {log.message}
                </span>
              </div>
            );
          })
        )}
      </div>
    </section>
  );
};
