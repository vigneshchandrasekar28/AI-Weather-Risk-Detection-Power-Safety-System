import React, { useState } from 'react';
import { MonitoredLocationItem, GeocodedLocation } from '../types';
import { Layers, Plus, Trash2, ExternalLink, ShieldCheck, AlertOctagon, CheckCircle2, MapPin, Search } from 'lucide-react';
import { POPULAR_INDIAN_LOCATIONS, searchIndianLocations } from '../utils/indiaGeocoding';

interface MultiLocationMonitoringProps {
  monitoredList: MonitoredLocationItem[];
  activeLocationName: string;
  onSelectLocation: (loc: GeocodedLocation) => void;
  onAddLocation: (loc: GeocodedLocation) => void;
  onRemoveLocation: (id: string) => void;
}

export const MultiLocationMonitoring: React.FC<MultiLocationMonitoringProps> = ({
  monitoredList,
  activeLocationName,
  onSelectLocation,
  onAddLocation,
  onRemoveLocation
}) => {
  const [selectedToAdd, setSelectedToAdd] = useState<string>('');
  const [customSearchQuery, setCustomSearchQuery] = useState<string>('');
  const [searchFeedback, setSearchFeedback] = useState<string | null>(null);
  const [isAddingCustom, setIsAddingCustom] = useState<boolean>(false);

  const handleAddFromSelect = () => {
    if (!selectedToAdd) return;
    const found = POPULAR_INDIAN_LOCATIONS.find((l) => l.name.toLowerCase() === selectedToAdd.toLowerCase());
    if (found) {
      onAddLocation(found);
      setSelectedToAdd('');
      setSearchFeedback(null);
    }
  };

  const handleAddCustomLocation = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    const query = customSearchQuery.trim();
    if (!query) return;

    setIsAddingCustom(true);
    setSearchFeedback(null);
    try {
      const res = await searchIndianLocations(query);
      if (res.isForeign) {
        setSearchFeedback('Please search for a location within India.');
      } else if (res.success && res.results.length > 0) {
        const targetLoc = res.results[0];
        const alreadyExists = monitoredList.some(
          (m) => m.location.name.toLowerCase() === targetLoc.name.toLowerCase()
        );
        if (alreadyExists) {
          setSearchFeedback(`"${targetLoc.name}" is already in your monitored list.`);
        } else {
          onAddLocation(targetLoc);
          setCustomSearchQuery('');
          setSearchFeedback(`Added ${targetLoc.displayName} to monitoring.`);
          setTimeout(() => setSearchFeedback(null), 3000);
        }
      } else {
        setSearchFeedback(`Location "${query}" not found in India.`);
      }
    } catch (err: any) {
      setSearchFeedback(err.message || 'Error finding location.');
    } finally {
      setIsAddingCustom(false);
    }
  };

  // Filter out locations already monitored
  const availableToAdd = POPULAR_INDIAN_LOCATIONS.filter(
    (pop) => !monitoredList.some((m) => m.location.name.toLowerCase() === pop.name.toLowerCase())
  );

  return (
    <section id="multiLocationMonitoringSection" className="bg-white border border-slate-200 rounded-2xl p-6 shadow-xs space-y-4">
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 pb-3 border-b border-slate-100">
        <div>
          <div className="flex items-center gap-2">
            <Layers className="w-4 h-4 text-sky-600" />
            <h3 className="text-xs font-extrabold uppercase tracking-wider text-slate-800">
              Multi-Location Indian Grid Telemetry ({monitoredList.length} Monitored)
            </h3>
          </div>
          <p className="text-xs text-slate-500 mt-0.5">
            Add and track any city, town, or district in India simultaneously
          </p>
        </div>

        {/* Add Location: Custom Search Input + Dropdown */}
        <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2">
          {/* Custom text search to add ANY Indian location */}
          <form onSubmit={handleAddCustomLocation} className="flex items-center gap-1.5">
            <div className="relative flex-1 sm:w-56">
              <input
                type="text"
                value={customSearchQuery}
                onChange={(e) => {
                  setCustomSearchQuery(e.target.value);
                  if (searchFeedback) setSearchFeedback(null);
                }}
                placeholder="Type any Indian location..."
                className="w-full text-xs rounded-lg border border-slate-300 bg-slate-50 px-3 py-1.5 font-medium text-slate-900 focus:bg-white focus:border-sky-500 focus:outline-none"
              />
            </div>
            <button
              type="submit"
              disabled={!customSearchQuery.trim() || isAddingCustom}
              className="px-3 py-1.5 bg-sky-600 text-white rounded-lg text-xs font-bold hover:bg-sky-700 disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer flex items-center gap-1 transition-all shrink-0"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>Add</span>
            </button>
          </form>

          <span className="text-xs text-slate-400 self-center hidden sm:inline">or</span>

          {/* Quick select dropdown */}
          <div className="flex items-center gap-1.5">
            <select
              value={selectedToAdd}
              onChange={(e) => {
                setSelectedToAdd(e.target.value);
                if (e.target.value) {
                  const found = POPULAR_INDIAN_LOCATIONS.find((l) => l.name.toLowerCase() === e.target.value.toLowerCase());
                  if (found) {
                    onAddLocation(found);
                    setSelectedToAdd('');
                  }
                }
              }}
              className="text-xs rounded-lg border border-slate-300 bg-slate-50 px-2.5 py-1.5 font-medium text-slate-700 focus:border-sky-500 focus:outline-none"
            >
              <option value="">+ Quick Presets...</option>
              {availableToAdd.slice(0, 25).map((loc) => (
                <option key={loc.name} value={loc.name}>
                  {loc.name}, {loc.state || 'IN'}
                </option>
              ))}
            </select>
          </div>
        </div>
      </div>

      {searchFeedback && (
        <div className={`p-2.5 rounded-lg text-xs font-medium ${
          searchFeedback.includes('Added') ? 'bg-emerald-50 text-emerald-800 border border-emerald-200' : 'bg-amber-50 text-amber-800 border border-amber-200'
        }`}>
          {searchFeedback}
        </div>
      )}

      {/* Grid of Monitored Location Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
        {monitoredList.map((item) => {
          const isActive = item.location.displayName === activeLocationName || item.location.name === activeLocationName;
          const isHigh = item.risk.level === 'HIGH';
          const isMed = item.risk.level === 'MEDIUM';

          return (
            <div
              key={item.id}
              className={`rounded-xl p-4 border transition-all relative flex flex-col justify-between gap-3 ${
                isActive
                  ? 'border-sky-500 ring-2 ring-sky-100 bg-sky-50/40'
                  : 'border-slate-200 bg-slate-50 hover:bg-white hover:border-slate-300'
              }`}
            >
              <div className="flex items-start justify-between gap-2">
                <div className="min-w-0">
                  <div className="flex items-center gap-1.5">
                    <span className="font-extrabold text-sm text-slate-900 truncate">
                      {item.location.name}
                    </span>
                    {isActive && (
                      <span className="text-[9px] font-black uppercase px-1.5 py-0.5 rounded bg-sky-600 text-white shrink-0">
                        Active
                      </span>
                    )}
                  </div>
                  <span className="text-[11px] text-slate-500 block truncate">
                    {item.location.state ? `${item.location.state}, India` : 'India'}
                  </span>
                </div>

                {/* Remove button */}
                <button
                  type="button"
                  title="Remove from monitored list"
                  onClick={() => onRemoveLocation(item.id)}
                  className="text-slate-400 hover:text-red-600 p-1 rounded transition-all cursor-pointer"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                </button>
              </div>

              {/* Weather & Temp */}
              <div className="flex items-center justify-between py-1">
                <div>
                  <div className="text-2xl font-black font-mono text-slate-900">
                    {item.weather.temp}&deg;C
                  </div>
                  <div className="text-[11px] font-semibold text-slate-600">
                    {item.weather.condition}
                  </div>
                </div>

                <div className="text-right">
                  <div className="text-[10px] font-bold uppercase text-slate-400">
                    Risk Score
                  </div>
                  <div
                    className={`text-lg font-black font-mono ${
                      isHigh ? 'text-red-600' : isMed ? 'text-amber-600' : 'text-emerald-600'
                    }`}
                  >
                    {item.risk.score}/100
                  </div>
                </div>
              </div>

              {/* Risk Badge & Switch View Button */}
              <div className="pt-2 border-t border-slate-200/60 flex items-center justify-between gap-2">
                <span
                  className={`text-[10px] font-black px-2 py-0.5 rounded-full uppercase border ${
                    isHigh
                      ? 'bg-red-50 text-red-700 border-red-200'
                      : isMed
                      ? 'bg-amber-50 text-amber-700 border-amber-200'
                      : 'bg-emerald-50 text-emerald-700 border-emerald-200'
                  }`}
                >
                  {item.risk.level}
                </span>

                {!isActive && (
                  <button
                    type="button"
                    onClick={() => onSelectLocation(item.location)}
                    className="text-xs font-bold text-sky-600 hover:text-sky-800 flex items-center gap-1 cursor-pointer transition-all"
                  >
                    <span>View Dashboard</span>
                    <ExternalLink className="w-3 h-3" />
                  </button>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </section>
  );
};
