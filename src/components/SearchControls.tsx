import React, { useState, useEffect, useRef } from 'react';
import { MapPin, Search, RefreshCw, Key, X, Play, AlertCircle, Compass } from 'lucide-react';
import { ACADEMIC_SCENARIOS } from '../data/projectFiles';
import { AcademicScenario, GeocodedLocation } from '../types';
import { searchIndianLocations, POPULAR_INDIAN_LOCATIONS } from '../utils/indiaGeocoding';

interface SearchControlsProps {
  currentLocationName: string;
  onSelectLocation: (location: GeocodedLocation) => void;
  onSearchQuery: (query: string) => Promise<boolean>;
  onSelectScenario: (scenario: AcademicScenario) => void;
  activeScenarioId: string | null;
  isLoading: boolean;
  apiKey: string;
  setApiKey: (key: string) => void;
  searchError: string | null;
  setSearchError: (err: string | null) => void;
}

export const SearchControls: React.FC<SearchControlsProps> = ({
  currentLocationName,
  onSelectLocation,
  onSearchQuery,
  onSelectScenario,
  activeScenarioId,
  isLoading,
  apiKey,
  setApiKey,
  searchError,
  setSearchError
}) => {
  const [query, setQuery] = useState('');
  const [showKeyInput, setShowKeyInput] = useState(false);
  const [suggestions, setSuggestions] = useState<GeocodedLocation[]>([]);
  const [isSearchingSuggestions, setIsSearchingSuggestions] = useState(false);
  const [showDropdown, setShowDropdown] = useState(false);
  const [highlightedIndex, setHighlightedIndex] = useState(-1);

  const containerRef = useRef<HTMLDivElement>(null);
  const debounceTimerRef = useRef<NodeJS.Timeout | null>(null);

  // Close suggestions dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setShowDropdown(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Debounced autocomplete suggestions for Indian locations
  useEffect(() => {
    const trimmed = query.trim();
    if (trimmed.length < 2) {
      setSuggestions([]);
      setShowDropdown(false);
      return;
    }

    if (debounceTimerRef.current) {
      clearTimeout(debounceTimerRef.current);
    }

    debounceTimerRef.current = setTimeout(async () => {
      setIsSearchingSuggestions(true);
      const res = await searchIndianLocations(trimmed, apiKey);
      setIsSearchingSuggestions(false);

      if (res.isForeign) {
        setSearchError(res.message || 'Please search for a location within India.');
        setSuggestions([]);
        setShowDropdown(false);
      } else if (res.success && res.results.length > 0) {
        setSuggestions(res.results);
        setShowDropdown(true);
        setHighlightedIndex(-1);
      } else {
        setSuggestions([]);
        setShowDropdown(false);
      }
    }, 250);

    return () => {
      if (debounceTimerRef.current) {
        clearTimeout(debounceTimerRef.current);
      }
    };
  }, [query, apiKey, setSearchError]);

  const handleLocationClick = (loc: GeocodedLocation) => {
    setSearchError(null);
    setQuery(loc.displayName);
    setShowDropdown(false);
    onSelectLocation(loc);
  };

  const handleFormSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const trimmed = query.trim();
    if (!trimmed) {
      setSearchError('Please enter an Indian city or location name.');
      return;
    }

    if (showDropdown && highlightedIndex >= 0 && suggestions[highlightedIndex]) {
      handleLocationClick(suggestions[highlightedIndex]);
      return;
    }

    setShowDropdown(false);
    await onSearchQuery(trimmed);
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (!showDropdown || suggestions.length === 0) return;

    if (e.key === 'ArrowDown') {
      e.preventDefault();
      setHighlightedIndex((prev) => (prev < suggestions.length - 1 ? prev + 1 : 0));
    } else if (e.key === 'ArrowUp') {
      e.preventDefault();
      setHighlightedIndex((prev) => (prev > 0 ? prev - 1 : suggestions.length - 1));
    } else if (e.key === 'Enter' && highlightedIndex >= 0) {
      e.preventDefault();
      handleLocationClick(suggestions[highlightedIndex]);
    } else if (e.key === 'Escape') {
      setShowDropdown(false);
    }
  };

  return (
    <section className="bg-white border-2 border-slate-200 rounded-3xl p-6 sm:p-7 shadow-sm space-y-5">
      {/* Current Location & Interactive Search Bar */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-5">
        
        {/* 2. LOCATION DISPLAY */}
        <div className="flex items-center gap-3.5">
          <div className="w-12 h-12 rounded-2xl bg-sky-50 text-sky-600 flex items-center justify-center text-2xl shrink-0 border border-sky-200 shadow-2xs">
            <MapPin className="w-6 h-6 text-sky-600" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="text-xs font-black uppercase tracking-wider text-slate-500">
                Active Indian Location
              </span>
              <span className="inline-flex items-center gap-1 text-xs font-black px-2 py-0.5 rounded-md bg-orange-50 text-orange-700 border border-orange-200">
                🇮🇳 Sovereign India
              </span>
            </div>
            <strong id="currentLocationDisplay" className="text-xl sm:text-2xl font-black text-slate-900 tracking-tight block mt-0.5">
              📍 {currentLocationName}
            </strong>
          </div>
        </div>

        {/* 1. Indian City / Location Search Box */}
        <div ref={containerRef} className="relative flex-1 max-w-2xl">
          <div className="mb-1.5 flex items-center justify-between">
            <span className="text-xs sm:text-sm font-black uppercase tracking-wider text-slate-700 flex items-center gap-1.5">
              <span>📍 Search Indian Location</span>
            </span>
            <span className="text-xs text-slate-400 font-semibold hidden sm:inline">
              Any Indian city, town, or district
            </span>
          </div>

          <form onSubmit={handleFormSubmit} className="flex items-center gap-2">
            <div className="relative flex-1">
              <input
                id="citySearchInput"
                type="text"
                value={query}
                onChange={(e) => {
                  setQuery(e.target.value);
                  setSearchError(null);
                }}
                onKeyDown={handleKeyDown}
                onFocus={() => {
                  if (suggestions.length > 0) setShowDropdown(true);
                }}
                placeholder="Search any Indian city / town / district (e.g. Coimbatore, Chennai, Pollachi)"
                autoComplete="off"
                className="w-full pl-4 pr-10 py-3.5 bg-slate-50 hover:bg-white focus:bg-white border-2 border-slate-300 focus:border-sky-600 rounded-2xl text-base font-semibold text-slate-900 outline-none transition-all focus:ring-4 focus:ring-sky-500/15"
              />
              
              {query ? (
                <button
                  type="button"
                  id="clearSearchBtn"
                  onClick={() => {
                    setQuery('');
                    setSuggestions([]);
                    setShowDropdown(false);
                    setSearchError(null);
                  }}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 p-1 cursor-pointer"
                  title="Clear search"
                >
                  <X className="w-5 h-5" />
                </button>
              ) : isSearchingSuggestions ? (
                <RefreshCw className="w-5 h-5 animate-spin text-slate-400 absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none" />
              ) : null}
            </div>

            <button
              type="submit"
              id="checkWeatherBtn"
              disabled={isLoading}
              className="inline-flex items-center justify-center gap-2 px-6 py-3.5 bg-slate-900 hover:bg-slate-800 active:bg-slate-950 disabled:opacity-70 text-white text-base font-black rounded-2xl shadow-md transition-all shrink-0 cursor-pointer"
            >
              {isLoading ? (
                <>
                  <RefreshCw className="w-5 h-5 animate-spin text-sky-400" />
                  <span>CHECKING...</span>
                </>
              ) : (
                <>
                  <Search className="w-5 h-5 text-sky-400" />
                  <span>CHECK WEATHER</span>
                </>
              )}
            </button>

            <button
              type="button"
              id="apiKeySettingsBtn"
              onClick={() => setShowKeyInput(!showKeyInput)}
              title="Configure OpenWeatherMap API Key"
              className={`p-2.5 border rounded-xl transition-colors cursor-pointer shrink-0 ${
                apiKey
                  ? 'bg-emerald-50 border-emerald-300 text-emerald-700'
                  : 'bg-slate-50 border-slate-300 text-slate-500 hover:bg-slate-100'
              }`}
            >
              <Key className="w-4 h-4" />
            </button>
          </form>

          {/* Autocomplete Suggestions Dropdown */}
          {showDropdown && suggestions.length > 0 && (
            <div
              id="searchSuggestionsDropdown"
              className="absolute left-0 right-0 top-full mt-1.5 bg-white border border-slate-200 rounded-xl shadow-lg z-50 overflow-hidden divide-y divide-slate-100 animate-in fade-in slide-in-from-top-1 duration-150"
            >
              <div className="px-3 py-1.5 bg-slate-50 text-[10px] font-bold uppercase tracking-wider text-slate-400 flex items-center justify-between">
                <span>Select Indian Location</span>
                <span>OpenWeather Geocoded</span>
              </div>
              <ul className="max-h-60 overflow-y-auto">
                {suggestions.map((item, index) => {
                  const isHighlighted = highlightedIndex === index;
                  return (
                    <li
                      key={`${item.name}-${item.lat}-${item.lon}-${index}`}
                      onClick={() => handleLocationClick(item)}
                      onMouseEnter={() => setHighlightedIndex(index)}
                      className={`px-3.5 py-2.5 cursor-pointer flex items-center justify-between text-xs transition-colors ${
                        isHighlighted ? 'bg-sky-50 text-sky-950 font-bold' : 'hover:bg-slate-50 text-slate-800'
                      }`}
                    >
                      <div className="flex items-center gap-2">
                        <MapPin className="w-3.5 h-3.5 text-sky-600 shrink-0" />
                        <div>
                          <span className="font-semibold text-slate-900">{item.name}</span>
                          <span className="text-slate-500 ml-1.5 font-normal">
                            {item.state ? `${item.state}, ` : ''}IN
                          </span>
                        </div>
                      </div>
                      <span className="text-[10px] font-mono text-slate-400">
                        {item.lat.toFixed(2)}°N, {item.lon.toFixed(2)}°E
                      </span>
                    </li>
                  );
                })}
              </ul>
            </div>
          )}
        </div>
      </div>

      {/* Error / Validation Notification (e.g. Non-Indian Location) */}
      {searchError && (
        <div
          id="searchErrorBanner"
          className="flex items-start gap-2.5 p-3 rounded-xl text-xs bg-amber-50 text-amber-900 border border-amber-200 animate-in fade-in duration-150"
        >
          <AlertCircle className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
          <div className="flex-1 font-semibold leading-normal">{searchError}</div>
          <button
            type="button"
            onClick={() => setSearchError(null)}
            className="text-amber-600 hover:text-amber-800 font-bold text-sm px-1"
          >
            &times;
          </button>
        </div>
      )}

      {/* Popular Indian City Quick Chips */}
      <div className="flex items-center gap-1.5 flex-wrap text-xs text-slate-500">
        <span className="font-bold text-slate-400 text-[11px] uppercase tracking-wider flex items-center gap-1 mr-1">
          <Compass className="w-3.5 h-3.5 text-slate-400" />
          Popular:
        </span>
        {['Coimbatore', 'Chennai', 'Pollachi', 'Ooty', 'Madurai', 'Salem', 'Erode', 'Tiruppur', 'Trichy', 'Bengaluru', 'Mumbai', 'Delhi', 'Kolkata'].map((name) => {
          return (
            <button
              key={name}
              type="button"
              onClick={() => {
                const found = POPULAR_INDIAN_LOCATIONS.find(
                  (l) => l.name.toLowerCase() === name.toLowerCase()
                );
                if (found) {
                  handleLocationClick(found);
                } else {
                  onSearchQuery(name);
                }
              }}
              className="px-2 py-0.5 rounded-md bg-slate-100 hover:bg-sky-100 hover:text-sky-900 border border-slate-200 hover:border-sky-300 text-slate-700 transition-colors text-[11px] font-medium cursor-pointer"
            >
              {name}
            </button>
          );
        })}
      </div>

      {/* Optional API key settings */}
      {showKeyInput && (
        <div className="bg-sky-50/80 border border-sky-200 rounded-xl p-3.5 space-y-2 text-xs animate-in fade-in duration-150">
          <div className="flex items-center justify-between">
            <span className="font-bold text-sky-900 flex items-center gap-1.5">
              <Key className="w-3.5 h-3.5 text-sky-600" />
              OpenWeatherMap API Key (Geocoding &amp; Weather API)
            </span>
            <span className="text-sky-700 text-[11px]">Stored safely in browser</span>
          </div>
          <div className="flex gap-2">
            <input
              type="password"
              value={apiKey}
              onChange={(e) => setApiKey(e.target.value)}
              placeholder="Paste your OpenWeatherMap API key (e.g. 5a1b2c3d...)"
              className="flex-1 px-3 py-1.5 bg-white border border-sky-300 rounded-lg text-slate-900 font-mono text-xs outline-none"
            />
            {apiKey && (
              <button
                type="button"
                onClick={() => setApiKey('')}
                className="px-3 py-1 bg-sky-200 hover:bg-sky-300 text-sky-900 font-bold rounded-lg cursor-pointer"
              >
                Clear
              </button>
            )}
          </div>
          <p className="text-[11px] text-sky-800 leading-normal">
            Uses OpenWeather Geocoding API (<code className="bg-sky-100 px-1 py-0.5 rounded font-mono">/geo/1.0/direct?q=...&amp;country=IN</code>) to locate coordinates and verify Indian boundaries before querying Current Weather. If no API key is provided, the system seamlessly uses realistic meteorological approximations so testing continues uninterrupted.
          </p>
        </div>
      )}

      {/* Quick Scenarios for College Viva */}
      <div className="pt-3 border-t border-slate-100 flex flex-col sm:flex-row sm:items-center justify-between gap-2.5">
        <span className="text-xs font-bold uppercase tracking-wider text-slate-500 flex items-center gap-1.5 shrink-0">
          <Play className="w-3.5 h-3.5 text-sky-600 fill-sky-600" />
          Quick Scenarios for Viva:
        </span>
        <div className="flex flex-wrap gap-1.5">
          {ACADEMIC_SCENARIOS.map((scenario) => {
            const isActive = activeScenarioId === scenario.id;
            return (
              <button
                key={scenario.id}
                type="button"
                onClick={() => onSelectScenario(scenario)}
                className={`text-xs px-2.5 py-1 rounded-lg border transition-all cursor-pointer font-medium ${
                  isActive
                    ? 'bg-slate-900 border-slate-900 text-white font-bold shadow-xs'
                    : 'bg-slate-50 hover:bg-slate-100 border-slate-200 text-slate-700'
                }`}
              >
                {scenario.badge}
              </button>
            );
          })}
        </div>
      </div>
    </section>
  );
};
