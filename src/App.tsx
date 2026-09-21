import { useState, useEffect, useCallback, useRef } from 'react';
import { Header } from './components/Header';
import { SearchControls } from './components/SearchControls';
import { SystemConceptFlow } from './components/SystemConceptFlow';
import { WeatherMetricsGrid } from './components/WeatherMetricsGrid';
import { CoreDashboardPanels } from './components/CoreDashboardPanels';
import { SmartAlertPanel } from './components/SmartAlertPanel';
import { WeatherForecastPanel } from './components/WeatherForecastPanel';
import { AutoMonitoringBar } from './components/AutoMonitoringBar';
import { RiskHistoryChart, HistoryPoint } from './components/RiskHistoryChart';
import { MultiLocationMonitoring } from './components/MultiLocationMonitoring';
import { WeatherMapSection } from './components/WeatherMapSection';
import { SystemEventLogPanel } from './components/SystemEventLogPanel';
import { AboutAndWorkflow } from './components/AboutAndWorkflow';
import { GoogleSheetsIntegration } from './components/GoogleSheetsIntegration';

import { 
  WeatherData, 
  RiskAnalysis, 
  RiskLevel,
  AcademicScenario, 
  GeocodedLocation, 
  ForecastItem, 
  DailyForecast,
  MonitoredLocationItem,
  SystemEventLogItem
} from './types';
import { evaluateWeatherRisk } from './utils/riskEngine';
import { ACADEMIC_SCENARIOS } from './data/projectFiles';
import { 
  searchIndianLocations, 
  fetchWeatherForCoordinates, 
  fetchForecastForCoordinates,
  POPULAR_INDIAN_LOCATIONS 
} from './utils/indiaGeocoding';
import { CheckCircle2, RefreshCw } from 'lucide-react';

export default function App() {
  // Default location: Coimbatore, Tamil Nadu, IN
  const defaultLocation = POPULAR_INDIAN_LOCATIONS[0];
  const [currentLocation, setCurrentLocation] = useState<GeocodedLocation>(defaultLocation);
  
  const [apiKey, setApiKey] = useState<string>(() => {
    return localStorage.getItem('openweather_api_key') || '';
  });

  // Default scenario (Safe Clear Weather)
  const defaultScenario = ACADEMIC_SCENARIOS[0];
  const [weather, setWeather] = useState<WeatherData>(defaultScenario.weather);
  const [risk, setRisk] = useState<RiskAnalysis>(() => evaluateWeatherRisk(defaultScenario.weather));
  const [lastUpdated, setLastUpdated] = useState<string>(() => {
    return new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  });
  const [activeScenarioId, setActiveScenarioId] = useState<string | null>(defaultScenario.id);

  // Forecast state
  const [forecastHourly, setForecastHourly] = useState<ForecastItem[]>([]);
  const [forecastDaily, setForecastDaily] = useState<DailyForecast[]>([]);
  const [isForecastLoading, setIsForecastLoading] = useState<boolean>(false);

  // Loading & operational states
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [loadingMessage, setLoadingMessage] = useState<string>('');
  const [autoRefresh, setAutoRefresh] = useState<boolean>(false);
  const [refreshIntervalMinutes, setRefreshIntervalMinutes] = useState<number>(5);
  const [refreshCountdown, setRefreshCountdown] = useState<number>(300); // 5 mins in seconds
  const [autoLogSheets, setAutoLogSheets] = useState<boolean>(false);
  const [alert, setAlert] = useState<{ type: 'error' | 'success'; message: string } | null>(null);
  const [searchError, setSearchError] = useState<string | null>(null);

  // Telemetry History for responsive risk chart
  const [history, setHistory] = useState<HistoryPoint[]>([
    { time: '09:30', score: 14, location: 'Coimbatore', level: 'LOW' },
    { time: '09:45', score: 18, location: 'Coimbatore', level: 'LOW' },
    { time: '10:00', score: 15, location: 'Coimbatore', level: 'LOW' },
    { time: '10:15', score: 20, location: 'Coimbatore', level: 'LOW' },
    { time: '10:30', score: 16, location: 'Coimbatore', level: 'LOW' }
  ]);

  // System Event Log
  const [systemLogs, setSystemLogs] = useState<SystemEventLogItem[]>([
    {
      id: 'init-1',
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' }),
      type: 'system',
      message: 'AI Weather Risk & Power Safety system initialized for Indian grid monitoring.',
      severity: 'info'
    },
    {
      id: 'init-2',
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' }),
      type: 'system',
      message: 'Geocoding resolver set to India boundaries only (country=IN).',
      severity: 'success'
    }
  ]);

  const addLog = useCallback(
    (
      message: string,
      severity: 'info' | 'warning' | 'critical' | 'success' = 'info',
      type: SystemEventLogItem['type'] = 'system'
    ) => {
      const newLog: SystemEventLogItem = {
        id: 'log-' + Date.now() + '-' + Math.random().toString(36).substring(2, 6),
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' }),
        type,
        message,
        severity
      };
      setSystemLogs((prev) => [newLog, ...prev.slice(0, 49)]); // Keep last 50
    },
    []
  );

  // Multi-location monitoring pool (pre-populated with top Indian hubs)
  const [monitoredList, setMonitoredList] = useState<MonitoredLocationItem[]>(() => {
    return POPULAR_INDIAN_LOCATIONS.slice(0, 4).map((loc, idx) => {
      const w: WeatherData = {
        city: loc.name,
        country: 'IN',
        displayLocation: loc.displayName,
        temp: 26 + (idx * 2) % 6,
        humidity: 62 + idx * 4,
        windSpeedKmh: 12 + idx * 3,
        windSpeedMs: 3.3,
        rainfallMm: idx === 1 ? 4.2 : 0,
        condition: idx === 1 ? 'Rain' : 'Clouds',
        description: idx === 1 ? 'light rain' : 'scattered clouds',
        conditionId: idx === 1 ? 500 : 802,
        icon: idx === 1 ? '10d' : '03d',
        lat: loc.lat,
        lon: loc.lon
      };
      const r = evaluateWeatherRisk(w);
      return {
        id: `mon-${loc.name.toLowerCase()}`,
        location: loc,
        weather: w,
        risk: r,
        lastUpdated: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
      };
    });
  });

  // Sync API key to browser storage
  useEffect(() => {
    if (apiKey) {
      localStorage.setItem('openweather_api_key', apiKey);
    } else {
      localStorage.removeItem('openweather_api_key');
    }
  }, [apiKey]);

  const addHistoryRecord = (score: number, locName: string, level: any) => {
    const timeStr = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    setHistory((prev) => {
      const next = [...prev, { time: timeStr, score, location: locName, level }];
      if (next.length > 20) return next.slice(-20);
      return next;
    });
  };

  /**
   * Loads initial forecast for Coimbatore on mount
   */
  useEffect(() => {
    let isMounted = true;
    const loadInitialForecast = async () => {
      try {
        const fc = await fetchForecastForCoordinates(defaultLocation, weather, apiKey);
        if (isMounted) {
          setForecastHourly(fc.hourly);
          setForecastDaily(fc.daily);
        }
      } catch (e) {
        console.warn('Initial forecast fetch warning:', e);
      }
    };
    loadInitialForecast();
    return () => {
      isMounted = false;
    };
  }, []);

  /**
   * Loads weather & forecast for a verified Indian geocoded location and runs AI risk analysis.
   */
  const handleSelectLocation = async (location: GeocodedLocation) => {
    setIsLoading(true);
    setLoadingMessage(`Resolving live telemetry for ${location.displayName}...`);
    setSearchError(null);
    setAlert(null);

    try {
      if (location.country !== 'IN') {
        setSearchError('Please search for a location within India.');
        addLog(`Rejected geocoding for "${location.name}": outside India territory.`, 'warning');
        setIsLoading(false);
        return;
      }

      setCurrentLocation(location);
      addLog(`Selected Indian location: ${location.displayName} (${location.lat.toFixed(2)}°N, ${location.lon.toFixed(2)}°E).`);

      // 1. Fetch live current weather
      const fetchedWeather = await fetchWeatherForCoordinates(location, apiKey);
      
      // 2. Evaluate AI Risk
      setLoadingMessage('Computing AI grid vulnerability risk scores...');
      const computedRisk = evaluateWeatherRisk(fetchedWeather);

      setWeather(fetchedWeather);
      setRisk(computedRisk);
      setActiveScenarioId(null);

      const timeNow = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
      setLastUpdated(timeNow);
      addHistoryRecord(computedRisk.score, location.name, computedRisk.level);

      // Log to system events
      addLog(
        `Weather updated for ${location.name}: ${fetchedWeather.temp}°C, Rain ${fetchedWeather.rainfallMm}mm, Wind ${fetchedWeather.windSpeedKmh}km/h.`,
        'info'
      );
      addLog(
        `AI Risk Analysis for ${location.name}: Score ${computedRisk.score}/100 [${computedRisk.level}]. Advisory: ${computedRisk.recommendation}.`,
        computedRisk.level === 'HIGH' ? 'critical' : computedRisk.level === 'MEDIUM' ? 'warning' : 'success'
      );

      // Update in monitored list if present
      setMonitoredList((prev) =>
        prev.map((item) =>
          item.location.name.toLowerCase() === location.name.toLowerCase()
            ? { ...item, weather: fetchedWeather, risk: computedRisk, lastUpdated: timeNow }
            : item
        )
      );

      setAlert({
        type: 'success',
        message: `Live telemetry updated for ${location.displayName}. AI Risk: ${computedRisk.score}/100 (${computedRisk.level}) → Safety Action: ${computedRisk.recommendation}`
      });

      // 3. Fetch Forecast in background
      setIsForecastLoading(true);
      fetchForecastForCoordinates(location, fetchedWeather, apiKey)
        .then((fc) => {
          setForecastHourly(fc.hourly);
          setForecastDaily(fc.daily);
        })
        .catch((err) => {
          console.warn('Forecast error:', err);
        })
        .finally(() => {
          setIsForecastLoading(false);
        });

    } catch (err: any) {
      setSearchError(err.message || 'Error retrieving weather for this location.');
      addLog(`Failed weather retrieval for ${location.name}: ${err.message}`, 'critical');
    } finally {
      setIsLoading(false);
      setLoadingMessage('');
    }
  };

  /**
   * Search input handler with OpenWeather geocoding and country verification
   */
  const handleSearchQuery = async (queryText: string): Promise<boolean> => {
    setIsLoading(true);
    setLoadingMessage(`Geocoding "${queryText}" via OpenWeather API...`);
    setSearchError(null);
    setAlert(null);

    try {
      const result = await searchIndianLocations(queryText, apiKey);

      if (result.isForeign) {
        setSearchError(result.message || 'Please search for a location within India.');
        addLog(`Geocoding search query "${queryText}" rejected: outside India.`, 'warning');
        setIsLoading(false);
        return false;
      }

      if (!result.success || result.results.length === 0) {
        setSearchError(
          result.message ||
            `Location '${queryText}' not found in India. Please verify spelling or enter another Indian city/town.`
        );
        addLog(`No Indian location matched "${queryText}".`, 'warning');
        setIsLoading(false);
        return false;
      }

      const targetLoc = result.results[0];
      await handleSelectLocation(targetLoc);
      return true;
    } catch (err: any) {
      setSearchError(err.message || 'Unable to complete geocoding search.');
      addLog(`Geocoding error for "${queryText}": ${err.message}`, 'critical');
      setIsLoading(false);
      return false;
    }
  };

  /**
   * Academic scenario tester for College Viva evaluation
   */
  const handleSelectScenario = (scenario: AcademicScenario) => {
    setActiveScenarioId(scenario.id);
    setWeather(scenario.weather);
    const computedRisk = evaluateWeatherRisk(scenario.weather);
    setRisk(computedRisk);
    
    const scenarioLoc: GeocodedLocation = {
      name: scenario.weather.city,
      country: 'IN',
      lat: scenario.weather.lat || 11.0168,
      lon: scenario.weather.lon || 76.9558,
      displayName: scenario.weather.displayLocation
    };
    setCurrentLocation(scenarioLoc);

    const timeNow = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    setLastUpdated(timeNow);
    addHistoryRecord(computedRisk.score, scenarioLoc.name, computedRisk.level);
    setSearchError(null);

    addLog(`Viva Scenario Activated: "${scenario.name}". Risk Score: ${computedRisk.score}/100. Action: ${computedRisk.recommendation}.`, 
      computedRisk.level === 'HIGH' ? 'critical' : 'info'
    );

    setAlert({
      type: 'success',
      message: `Viva Scenario Activated: "${scenario.name}". Risk Score: ${computedRisk.score}/100 (${computedRisk.level}) → Safety Action: ${computedRisk.recommendation}.`
    });

    // Update simulated forecast for scenario
    fetchForecastForCoordinates(scenarioLoc, scenario.weather, apiKey)
      .then((fc) => {
        setForecastHourly(fc.hourly);
        setForecastDaily(fc.daily);
      })
      .catch((e) => console.warn(e));
  };

  /**
   * Multi-Location Monitoring: Add & Remove Handlers
   */
  const handleAddMonitoredLocation = async (loc: GeocodedLocation) => {
    try {
      const w = await fetchWeatherForCoordinates(loc, apiKey);
      const r = evaluateWeatherRisk(w);
      const newItem: MonitoredLocationItem = {
        id: `mon-${loc.name.toLowerCase()}-${Date.now()}`,
        location: loc,
        weather: w,
        risk: r,
        lastUpdated: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
      };
      setMonitoredList((prev) => [...prev, newItem]);
      addLog(`Added ${loc.displayName} to Monitored Locations list.`, 'success');
    } catch (err: any) {
      addLog(`Could not add ${loc.displayName}: ${err.message}`, 'warning');
    }
  };

  const handleRemoveMonitoredLocation = (id: string) => {
    setMonitoredList((prev) => prev.filter((item) => item.id !== id));
    addLog('Removed location from multi-monitoring pool.', 'info');
  };

  /**
   * Configurable Auto-refresh timer (5, 10, 15, or 30 minutes)
   */
  useEffect(() => {
    const totalSeconds = refreshIntervalMinutes * 60;
    if (!autoRefresh) {
      setRefreshCountdown(totalSeconds);
      return;
    }

    const interval = setInterval(() => {
      setRefreshCountdown((prev) => {
        if (prev <= 1) {
          addLog(`Auto-monitoring triggered: refreshing telemetry for ${currentLocation.displayName}...`, 'info');
          handleSelectLocation(currentLocation);
          return totalSeconds;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(interval);
  }, [autoRefresh, refreshIntervalMinutes, currentLocation, apiKey]);

  const handleChangeRefreshInterval = (mins: number) => {
    setRefreshIntervalMinutes(mins);
    setRefreshCountdown(mins * 60);
    addLog(`Auto-monitoring interval changed to ${mins} minutes.`, 'info');
  };

  // Track risk transitions (LOW -> HIGH or HIGH -> LOW) to show automated system alerts
  const prevRiskLevelRef = useRef<RiskLevel>(risk.level);
  useEffect(() => {
    const prev = prevRiskLevelRef.current;
    if (prev !== risk.level) {
      if (risk.level === 'HIGH') {
        setAlert({
          type: 'error',
          message: `⚠️ HIGH WEATHER RISK DETECTED in ${currentLocation.displayName}! Severe atmospheric hazards detected. Recommended Action: 🔴 POWER OFF RECOMMENDED.`
        });
        addLog(`CRITICAL: Weather risk escalated to HIGH (${risk.score}/100) in ${currentLocation.displayName}. Simulated power cutoff advised.`, 'critical');
      } else if (risk.level === 'LOW' && prev === 'HIGH') {
        setAlert({
          type: 'success',
          message: `✓ WEATHER CONDITIONS NORMAL: Weather hazards have subsided in ${currentLocation.displayName}. Recommended Action: 🟢 POWER ON.`
        });
        addLog(`RECOVERY: Weather conditions normalized to LOW risk (${risk.score}/100) in ${currentLocation.displayName}. Simulated power restoration authorized.`, 'success');
      }
      prevRiskLevelRef.current = risk.level;
    }
  }, [risk.level, risk.score, currentLocation.displayName, addLog]);

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 font-sans p-4 sm:p-6 md:p-8 flex flex-col justify-between">
      <div className="max-w-6xl mx-auto w-full space-y-6">
        
        {/* 1. Header with Title, AI Power Safety Badge & Mandatory Academic Prototype Disclaimer */}
        <Header />

        {/* 2. Indian City / Location Geocoding Search Bar with Autocomplete & Viva Scenarios */}
        <SearchControls
          currentLocationName={currentLocation.displayName}
          onSelectLocation={handleSelectLocation}
          onSearchQuery={handleSearchQuery}
          onSelectScenario={handleSelectScenario}
          activeScenarioId={activeScenarioId}
          isLoading={isLoading}
          apiKey={apiKey}
          setApiKey={setApiKey}
          searchError={searchError}
          setSearchError={setSearchError}
        />

        {/* 3. CORE SYSTEM PIPELINE & DECISION FLOW (Most Important Conceptual Visual) */}
        <SystemConceptFlow
          currentLevel={risk.level}
          currentScore={risk.score}
        />

        {/* Loading Progress Indicator Overlay / Banner */}
        {isLoading && (
          <div className="p-4 bg-sky-50 border-2 border-sky-300 rounded-2xl text-sm font-bold text-sky-900 flex items-center gap-3 animate-in fade-in duration-150 shadow-sm">
            <RefreshCw className="w-5 h-5 text-sky-600 animate-spin shrink-0" />
            <span>{loadingMessage || 'Processing meteorological telemetry...'}</span>
          </div>
        )}

        {/* Automated System Transition Alert Banner */}
        {alert && !isLoading && (
          <div
            id="systemAlertBanner"
            className={`flex items-start gap-3 p-4 rounded-2xl text-sm sm:text-base border-2 transition-all animate-in fade-in duration-150 shadow-sm ${
              alert.type === 'error'
                ? 'bg-red-50 text-red-950 border-red-400'
                : 'bg-emerald-50 text-emerald-950 border-emerald-400'
            }`}
          >
            <CheckCircle2 className={`w-5 h-5 shrink-0 mt-0.5 ${alert.type === 'error' ? 'text-red-600' : 'text-emerald-600'}`} />
            <div className="flex-1 leading-normal font-bold">{alert.message}</div>
            <button
              type="button"
              onClick={() => setAlert(null)}
              className="text-slate-500 hover:text-slate-800 font-black px-1.5 text-lg cursor-pointer"
            >
              &times;
            </button>
          </div>
        )}

        {/* 4. SMART ALERT PANEL (High-Visibility Decision Alert: POWER OFF / POWER ON) */}
        <SmartAlertPanel
          risk={risk}
          weather={weather}
          detectionTime={lastUpdated}
        />

        {/* 5. HERO DECISION SECTION: POWER SAFETY STATUS & AI WEATHER RISK PREDICTION */}
        <CoreDashboardPanels
          risk={risk}
          weather={weather}
          lastUpdated={lastUpdated}
          autoLogSheets={autoLogSheets}
          onToggleAutoLog={setAutoLogSheets}
          onAddLog={addLog}
        />

        {/* 6. SECONDARY WEATHER TELEMETRY: CURRENT WEATHER INFORMATION (5 Cards) */}
        <WeatherMetricsGrid 
          weather={weather} 
          locationName={currentLocation.displayName}
          lastUpdated={lastUpdated}
        />

        {/* 7. UPCOMING WEATHER RISK (Forecast-based Risk Modeling & Multi-hour Decisions) */}
        <WeatherForecastPanel
          hourly={forecastHourly}
          daily={forecastDaily}
          cityName={currentLocation.name}
          isLoading={isForecastLoading}
        />

        {/* 8. AUTO MONITORING ENGINE (ON/OFF, Cycle Countdown, Interval Settings) */}
        <AutoMonitoringBar
          autoRefresh={autoRefresh}
          onToggleAutoRefresh={() => {
            const next = !autoRefresh;
            setAutoRefresh(next);
            addLog(next ? `Auto-monitoring activated (${refreshIntervalMinutes}m cycle).` : 'Auto-monitoring deactivated.', 'info');
          }}
          refreshIntervalMinutes={refreshIntervalMinutes}
          onChangeRefreshInterval={handleChangeRefreshInterval}
          refreshCountdown={refreshCountdown}
          cityName={currentLocation.name}
        />

        {/* 9. AI RISK HISTORY & TELEMETRY TREND LINE CHART */}
        <RiskHistoryChart
          history={history}
          currentScore={risk.score}
        />

        {/* 10. MULTI-LOCATION MONITORING (Any Indian city/town) */}
        <MultiLocationMonitoring
          monitoredList={monitoredList}
          activeLocationName={currentLocation.displayName}
          onSelectLocation={handleSelectLocation}
          onAddLocation={handleAddMonitoredLocation}
          onRemoveLocation={handleRemoveMonitoredLocation}
        />

        {/* 11. INTERACTIVE REGIONAL WEATHER & LOCATION MAP (Leaflet) */}
        <WeatherMapSection
          location={currentLocation}
          weather={weather}
          risk={risk}
        />

        {/* 12. SYSTEM EVENT LOG AUDIT STREAM */}
        <SystemEventLogPanel
          logs={systemLogs}
          onClearLogs={() => setSystemLogs([])}
        />

        {/* 13. ACADEMIC WORKFLOW & PROJECT METHODOLOGY */}
        <AboutAndWorkflow />

      </div>

      {/* Academic Prototype Footer */}
      <footer className="max-w-6xl mx-auto w-full mt-12 pt-6 border-t border-slate-200 text-center text-xs text-slate-500 space-y-1">
        <p className="font-bold text-slate-800">
          AI Weather Risk Detection and Power Safety System &bull; Academic Software Prototype
        </p>
        <p>
          Student College Project Demonstration &bull; Geocoded OpenWeatherMap Telemetry &bull; India Locations Only
        </p>
        <p className="text-[11px] text-slate-400">
          Software-only simulation for academic evaluation. Does NOT connect to or physically control electrical mains power or hardware.
        </p>
      </footer>
    </div>
  );
}
