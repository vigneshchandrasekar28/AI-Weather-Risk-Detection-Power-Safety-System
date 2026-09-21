import { useState, useEffect } from 'react';
import { User } from 'firebase/auth';
import {
  FileSpreadsheet,
  PlusCircle,
  ExternalLink,
  RefreshCw,
  CheckCircle2,
  AlertCircle,
  LogOut,
  FolderOpen,
  ArrowRight,
  Database,
  History,
  ShieldAlert
} from 'lucide-react';
import { WeatherData, RiskAnalysis, SheetFileSummary } from '../types';
import {
  initAuth,
  googleSignIn,
  logout,
  getAccessToken
} from '../utils/firebaseAuth';
import {
  createTelemetrySpreadsheet,
  appendTelemetryLog,
  readRecentTelemetryRows,
  listUserSpreadsheets,
  getSpreadsheetDetails,
  TELEMETRY_SHEET_HEADERS
} from '../utils/googleSheetsService';

interface GoogleSheetsIntegrationProps {
  currentWeather: WeatherData;
  currentRisk: RiskAnalysis;
  autoLogEnabled: boolean;
  onToggleAutoLog: (enabled: boolean) => void;
  onNotification?: (msg: { type: 'success' | 'error'; message: string }) => void;
}

export function GoogleSheetsIntegration({
  currentWeather,
  currentRisk,
  autoLogEnabled,
  onToggleAutoLog,
  onNotification
}: GoogleSheetsIntegrationProps) {
  const [user, setUser] = useState<User | null>(null);
  const [accessToken, setAccessToken] = useState<string | null>(null);
  const [isAuthLoading, setIsAuthLoading] = useState<boolean>(true);
  const [isSigningIn, setIsSigningIn] = useState<boolean>(false);

  // Active Spreadsheet State
  const [spreadsheetId, setSpreadsheetId] = useState<string>(() => {
    return localStorage.getItem('active_telemetry_spreadsheet_id') || '';
  });
  const [spreadsheetTitle, setSpreadsheetTitle] = useState<string>(() => {
    return localStorage.getItem('active_telemetry_spreadsheet_title') || '';
  });
  const [spreadsheetUrl, setSpreadsheetUrl] = useState<string>(() => {
    return localStorage.getItem('active_telemetry_spreadsheet_url') || '';
  });
  const [sheetTabName, setSheetTabName] = useState<string>('Telemetry_Logs');

  // Sheet data preview
  const [tableRows, setTableRows] = useState<string[][]>([]);
  const [tableHeaders, setTableHeaders] = useState<string[]>(TELEMETRY_SHEET_HEADERS);
  const [isLoadingRows, setIsLoadingRows] = useState<boolean>(false);
  const [isLoggingRow, setIsLoggingRow] = useState<boolean>(false);

  // Drive sheets list
  const [driveSheets, setDriveSheets] = useState<SheetFileSummary[]>([]);
  const [isLoadingDrive, setIsLoadingDrive] = useState<boolean>(false);
  const [showDrivePicker, setShowDrivePicker] = useState<boolean>(false);
  const [manualInput, setManualInput] = useState<string>('');

  // Confirmation Modal state for user data mutation (MANDATORY per Workspace guidelines)
  const [confirmModal, setConfirmModal] = useState<{
    isOpen: boolean;
    title: string;
    description: string;
    actionType: 'create_sheet' | 'append_row';
    payload?: any;
  } | null>(null);

  // Initialize auth state listener
  useEffect(() => {
    const unsubscribe = initAuth(
      (currentUser, token) => {
        setUser(currentUser);
        setAccessToken(token);
        setIsAuthLoading(false);
      },
      () => {
        setUser(null);
        setAccessToken(null);
        setIsAuthLoading(false);
      }
    );
    return () => unsubscribe();
  }, []);

  // Save spreadsheet selection to local cache
  useEffect(() => {
    if (spreadsheetId) {
      localStorage.setItem('active_telemetry_spreadsheet_id', spreadsheetId);
      localStorage.setItem('active_telemetry_spreadsheet_title', spreadsheetTitle);
      localStorage.setItem('active_telemetry_spreadsheet_url', spreadsheetUrl);
    }
  }, [spreadsheetId, spreadsheetTitle, spreadsheetUrl]);

  // Handle Google Sign In
  const handleSignIn = async () => {
    setIsSigningIn(true);
    try {
      const res = await googleSignIn();
      if (res) {
        setUser(res.user);
        setAccessToken(res.accessToken);
        onNotification?.({
          type: 'success',
          message: `Signed in as ${res.user.displayName || res.user.email} with Google Sheets permissions.`
        });
      }
    } catch (err: any) {
      if (
        err?.code === 'auth/popup-closed-by-user' ||
        err?.code === 'auth/cancelled-popup-request' ||
        err?.message?.includes('popup-closed-by-user')
      ) {
        return;
      }
      onNotification?.({
        type: 'error',
        message: err.message || 'Google sign-in encountered an error.'
      });
    } finally {
      setIsSigningIn(false);
    }
  };

  // Handle Sign Out
  const handleSignOut = async () => {
    await logout();
    setUser(null);
    setAccessToken(null);
    setTableRows([]);
    onNotification?.({
      type: 'success',
      message: 'Signed out from Google account. Access token cleared.'
    });
  };

  // Fetch recent rows whenever spreadsheet is selected or updated
  const refreshSheetRows = async () => {
    const token = accessToken || getAccessToken();
    if (!token || !spreadsheetId) return;

    setIsLoadingRows(true);
    try {
      const data = await readRecentTelemetryRows(token, spreadsheetId, sheetTabName, 10);
      setTableHeaders(data.headers);
      setTableRows(data.rows);
    } catch (err: any) {
      console.warn('Could not load sheet preview rows:', err);
      // If tab wasn't found, try first tab
      try {
        const details = await getSpreadsheetDetails(token, spreadsheetId);
        if (details.sheetNames.length > 0 && details.sheetNames[0] !== sheetTabName) {
          const fallbackTab = details.sheetNames[0];
          setSheetTabName(fallbackTab);
          const data2 = await readRecentTelemetryRows(token, spreadsheetId, fallbackTab, 10);
          setTableHeaders(data2.headers);
          setTableRows(data2.rows);
        }
      } catch (e2) {
        // Tab not populated yet
      }
    } finally {
      setIsLoadingRows(false);
    }
  };

  useEffect(() => {
    if (accessToken && spreadsheetId) {
      refreshSheetRows();
    }
  }, [accessToken, spreadsheetId]);

  // Fetch user's Google Drive spreadsheets
  const handleLoadDriveSheets = async () => {
    const token = accessToken || getAccessToken();
    if (!token) return;

    setIsLoadingDrive(true);
    setShowDrivePicker(true);
    try {
      const files = await listUserSpreadsheets(token);
      setDriveSheets(files);
    } catch (err: any) {
      onNotification?.({
        type: 'error',
        message: `Failed to list Google Drive files: ${err.message}`
      });
    } finally {
      setIsLoadingDrive(false);
    }
  };

  // Request Confirmation: Create New Spreadsheet
  const requestCreateSpreadsheet = () => {
    setConfirmModal({
      isOpen: true,
      title: 'Create New Telemetry Google Spreadsheet?',
      description: `This will create a new Google Spreadsheet titled "⚡ AI Power Safety Telemetry Log - ${new Date().toISOString().split('T')[0]}" in your Google Drive, complete with formatted column headers and frozen rows.`,
      actionType: 'create_sheet'
    });
  };

  // Execute Spreadsheet Creation after explicit confirmation
  const executeCreateSpreadsheet = async () => {
    const token = accessToken || getAccessToken();
    if (!token) return;

    setIsLoadingRows(true);
    try {
      const created = await createTelemetrySpreadsheet(token);
      setSpreadsheetId(created.spreadsheetId);
      setSpreadsheetTitle(`⚡ AI Power Safety Telemetry Log - ${new Date().toISOString().split('T')[0]}`);
      setSpreadsheetUrl(created.spreadsheetUrl);
      setSheetTabName(created.sheetName);
      setShowDrivePicker(false);

      onNotification?.({
        type: 'success',
        message: 'Google Spreadsheet successfully created and connected to this dashboard!'
      });

      // Also log the current active weather telemetry immediately
      await appendTelemetryLog(token, created.spreadsheetId, created.sheetName, currentWeather, currentRisk);
      await refreshSheetRows();
    } catch (err: any) {
      onNotification?.({
        type: 'error',
        message: `Error creating spreadsheet: ${err.message}`
      });
    } finally {
      setIsLoadingRows(false);
      setConfirmModal(null);
    }
  };

  // Request Confirmation: Append Row
  const requestAppendRow = () => {
    if (!spreadsheetId) {
      onNotification?.({
        type: 'error',
        message: 'Please create or connect a Google Spreadsheet first.'
      });
      return;
    }

    setConfirmModal({
      isOpen: true,
      title: 'Log Telemetry Row to Google Sheets?',
      description: `Append current telemetry for ${currentWeather.displayLocation} (Temp: ${currentWeather.temp}°C, Rain: ${currentWeather.rainfallMm} mm, Wind: ${currentWeather.windSpeedKmh} km/h, AI Risk: ${currentRisk.score}/100, Power: ${currentRisk.recommendation}) to sheet "${spreadsheetTitle || spreadsheetId}"?`,
      actionType: 'append_row'
    });
  };

  // Execute Append Row after explicit confirmation
  const executeAppendRow = async () => {
    const token = accessToken || getAccessToken();
    if (!token || !spreadsheetId) return;

    setIsLoggingRow(true);
    try {
      await appendTelemetryLog(token, spreadsheetId, sheetTabName, currentWeather, currentRisk);
      onNotification?.({
        type: 'success',
        message: `Logged telemetry row for ${currentWeather.displayLocation} to Google Sheets.`
      });
      await refreshSheetRows();
    } catch (err: any) {
      onNotification?.({
        type: 'error',
        message: `Failed to log to Google Sheets: ${err.message}`
      });
    } finally {
      setIsLoggingRow(false);
      setConfirmModal(null);
    }
  };

  // Auto-log effect when weather/risk changes if autoLogEnabled is true
  useEffect(() => {
    if (!autoLogEnabled || !user || !spreadsheetId) return;
    const token = accessToken || getAccessToken();
    if (!token) return;

    // Silent append for auto-log
    appendTelemetryLog(token, spreadsheetId, sheetTabName, currentWeather, currentRisk)
      .then(() => refreshSheetRows())
      .catch((e) => console.warn('Auto-log failed:', e));
  }, [currentWeather.displayLocation, currentWeather.temp, currentRisk.score]);

  // Connect spreadsheet via ID or URL
  const handleConnectManual = async () => {
    const token = accessToken || getAccessToken();
    if (!token || !manualInput.trim()) return;

    // Extract ID from full URL if pasted
    let id = manualInput.trim();
    const urlMatch = id.match(/\/spreadsheets\/d\/([a-zA-Z0-9-_]+)/);
    if (urlMatch && urlMatch[1]) {
      id = urlMatch[1];
    }

    try {
      setIsLoadingRows(true);
      const details = await getSpreadsheetDetails(token, id);
      setSpreadsheetId(id);
      setSpreadsheetTitle(details.title);
      setSpreadsheetUrl(details.webUrl);
      if (details.sheetNames.length > 0) {
        setSheetTabName(details.sheetNames[0]);
      }
      setManualInput('');
      setShowDrivePicker(false);
      onNotification?.({
        type: 'success',
        message: `Connected to Google Sheet: "${details.title}"`
      });
    } catch (err: any) {
      onNotification?.({
        type: 'error',
        message: `Failed to verify spreadsheet: ${err.message}`
      });
    } finally {
      setIsLoadingRows(false);
    }
  };

  return (
    <div className="bg-white border border-slate-200 rounded-2xl shadow-sm p-5 space-y-5">
      {/* Header Banner */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-100 pb-4">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-emerald-50 border border-emerald-200 flex items-center justify-center text-emerald-600 shrink-0 shadow-xs">
            <FileSpreadsheet className="w-5 h-5" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h3 className="text-base font-bold text-slate-900">Google Sheets Telemetry Sync</h3>
              <span className="text-[11px] font-semibold uppercase tracking-wider px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-800 border border-emerald-200">
                Workspace API
              </span>
            </div>
            <p className="text-xs text-slate-500 mt-0.5">
              Stream live weather telemetry, risk scores, and Power ON/OFF audit records directly to your Google Sheets.
            </p>
          </div>
        </div>

        {/* User Auth Status / Action */}
        <div className="flex items-center gap-2 shrink-0">
          {isAuthLoading ? (
            <div className="text-xs text-slate-400 flex items-center gap-1.5">
              <RefreshCw className="w-3.5 h-3.5 animate-spin text-slate-400" />
              Checking auth...
            </div>
          ) : user ? (
            <div className="flex items-center gap-2 bg-slate-50 border border-slate-200 rounded-lg p-1.5 pl-2.5">
              {user.photoURL ? (
                <img
                  src={user.photoURL}
                  alt={user.displayName || 'User'}
                  className="w-6 h-6 rounded-full border border-slate-300"
                  referrerPolicy="no-referrer"
                />
              ) : (
                <div className="w-6 h-6 rounded-full bg-emerald-600 text-white text-[11px] flex items-center justify-center font-bold">
                  {(user.displayName || user.email || 'G')[0].toUpperCase()}
                </div>
              )}
              <div className="text-left leading-tight pr-1">
                <p className="text-xs font-bold text-slate-800 truncate max-w-[130px]">
                  {user.displayName || user.email}
                </p>
                <p className="text-[10px] text-emerald-600 font-semibold flex items-center gap-1">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-500"></span>
                  Connected
                </p>
              </div>
              <button
                type="button"
                onClick={handleSignOut}
                title="Sign out of Google"
                className="p-1.5 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-md transition-colors cursor-pointer"
              >
                <LogOut className="w-3.5 h-3.5" />
              </button>
            </div>
          ) : (
            /* Official Google GSI Button */
            <button
              type="button"
              onClick={handleSignIn}
              disabled={isSigningIn}
              className="gsi-material-button text-xs"
            >
              <div className="gsi-material-button-state"></div>
              <div className="gsi-material-button-content-wrapper">
                <div className="gsi-material-button-icon">
                  <svg version="1.1" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 48 48" style={{ display: 'block' }}>
                    <path fill="#EA4335" d="M24 9.5c3.54 0 6.71 1.22 9.21 3.6l6.85-6.85C35.9 2.38 30.47 0 24 0 14.62 0 6.51 5.38 2.56 13.22l7.98 6.19C12.43 13.72 17.74 9.5 24 9.5z"></path>
                    <path fill="#4285F4" d="M46.98 24.55c0-1.57-.15-3.09-.38-4.55H24v9.02h12.94c-.58 2.96-2.26 5.48-4.78 7.18l7.73 6c4.51-4.18 7.09-10.36 7.09-17.65z"></path>
                    <path fill="#FBBC05" d="M10.53 28.59c-.48-1.45-.76-2.99-.76-4.59s.27-3.14.76-4.59l-7.98-6.19C.92 16.46 0 20.12 0 24c0 3.88.92 7.54 2.56 10.78l7.97-6.19z"></path>
                    <path fill="#34A853" d="M24 48c6.48 0 11.93-2.13 15.89-5.81l-7.73-6c-2.15 1.45-4.92 2.3-8.16 2.3-6.26 0-11.57-4.22-13.47-9.91l-7.98 6.19C6.51 42.62 14.62 48 24 48z"></path>
                    <path fill="none" d="M0 0h48v48H0z"></path>
                  </svg>
                </div>
                <span className="gsi-material-button-contents">
                  {isSigningIn ? 'Connecting...' : 'Sign in with Google'}
                </span>
              </div>
            </button>
          )}
        </div>
      </div>

      {!user ? (
        <div className="bg-slate-50 border border-slate-200 rounded-xl p-6 text-center space-y-3">
          <div className="w-12 h-12 bg-white border border-slate-200 rounded-2xl mx-auto flex items-center justify-center text-emerald-600 shadow-xs">
            <Database className="w-6 h-6" />
          </div>
          <div className="max-w-md mx-auto space-y-1">
            <h4 className="text-sm font-bold text-slate-800">Connect Google Sheets to Start Logging</h4>
            <p className="text-xs text-slate-500 leading-relaxed">
              Sign in with your Google Account to export telemetry logs, record power isolation events, and generate spreadsheet reports for academic viva evaluation.
            </p>
          </div>
          <div className="pt-2">
            <button
              type="button"
              onClick={handleSignIn}
              disabled={isSigningIn}
              className="gsi-material-button shadow-xs cursor-pointer"
            >
              <div className="gsi-material-button-state"></div>
              <div className="gsi-material-button-content-wrapper">
                <div className="gsi-material-button-icon">
                  <svg version="1.1" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 48 48" style={{ display: 'block' }}>
                    <path fill="#EA4335" d="M24 9.5c3.54 0 6.71 1.22 9.21 3.6l6.85-6.85C35.9 2.38 30.47 0 24 0 14.62 0 6.51 5.38 2.56 13.22l7.98 6.19C12.43 13.72 17.74 9.5 24 9.5z"></path>
                    <path fill="#4285F4" d="M46.98 24.55c0-1.57-.15-3.09-.38-4.55H24v9.02h12.94c-.58 2.96-2.26 5.48-4.78 7.18l7.73 6c4.51-4.18 7.09-10.36 7.09-17.65z"></path>
                    <path fill="#FBBC05" d="M10.53 28.59c-.48-1.45-.76-2.99-.76-4.59s.27-3.14.76-4.59l-7.98-6.19C.92 16.46 0 20.12 0 24c0 3.88.92 7.54 2.56 10.78l7.97-6.19z"></path>
                    <path fill="#34A853" d="M24 48c6.48 0 11.93-2.13 15.89-5.81l-7.73-6c-2.15 1.45-4.92 2.3-8.16 2.3-6.26 0-11.57-4.22-13.47-9.91l-7.98 6.19C6.51 42.62 14.62 48 24 48z"></path>
                    <path fill="none" d="M0 0h48v48H0z"></path>
                  </svg>
                </div>
                <span className="gsi-material-button-contents">Sign in with Google</span>
              </div>
            </button>
          </div>
        </div>
      ) : (
        <div className="space-y-4">
          {/* Active Spreadsheet Details and Quick Actions */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {/* Column 1: Connected Sheet info */}
            <div className="md:col-span-2 bg-slate-50 border border-slate-200 rounded-xl p-4 flex flex-col justify-between">
              <div>
                <div className="flex items-center justify-between gap-2">
                  <span className="text-[11px] font-bold text-slate-500 uppercase tracking-wider">
                    Connected Spreadsheet
                  </span>
                  {spreadsheetId && (
                    <a
                      href={spreadsheetUrl || `https://docs.google.com/spreadsheets/d/${spreadsheetId}/edit`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-1 text-xs font-semibold text-emerald-600 hover:text-emerald-700 hover:underline"
                    >
                      Open in Google Sheets <ExternalLink className="w-3 h-3" />
                    </a>
                  )}
                </div>

                {spreadsheetId ? (
                  <div className="mt-2 space-y-1">
                    <p className="text-sm font-bold text-slate-900 truncate">
                      {spreadsheetTitle || 'AI Power Safety Telemetry Log'}
                    </p>
                    <p className="text-[11px] text-slate-500 font-mono truncate">
                      ID: {spreadsheetId} &bull; Tab: <span className="font-semibold text-slate-700">{sheetTabName}</span>
                    </p>
                  </div>
                ) : (
                  <div className="mt-2 text-xs text-amber-700 bg-amber-50 border border-amber-200 p-2.5 rounded-lg flex items-center gap-2">
                    <AlertCircle className="w-4 h-4 shrink-0 text-amber-600" />
                    <span>No spreadsheet selected yet. Create a new one or select from Google Drive.</span>
                  </div>
                )}
              </div>

              {/* Action Buttons */}
              <div className="mt-4 pt-3 border-t border-slate-200 flex flex-wrap items-center gap-2">
                <button
                  type="button"
                  onClick={requestCreateSpreadsheet}
                  disabled={isLoadingRows}
                  className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg text-xs font-bold transition-all shadow-xs cursor-pointer"
                >
                  <PlusCircle className="w-3.5 h-3.5" />
                  Create New Spreadsheet
                </button>

                <button
                  type="button"
                  onClick={handleLoadDriveSheets}
                  disabled={isLoadingDrive}
                  className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-white border border-slate-300 hover:bg-slate-50 text-slate-700 rounded-lg text-xs font-semibold transition-all cursor-pointer"
                >
                  <FolderOpen className="w-3.5 h-3.5 text-slate-500" />
                  {isLoadingDrive ? 'Loading Drive...' : 'Pick from Drive'}
                </button>

                {spreadsheetId && (
                  <button
                    type="button"
                    onClick={refreshSheetRows}
                    disabled={isLoadingRows}
                    title="Refresh rows from sheet"
                    className="inline-flex items-center gap-1 px-2.5 py-1.5 bg-white border border-slate-300 hover:bg-slate-50 text-slate-600 rounded-lg text-xs font-medium cursor-pointer"
                  >
                    <RefreshCw className={`w-3.5 h-3.5 ${isLoadingRows ? 'animate-spin text-emerald-600' : ''}`} />
                    Refresh
                  </button>
                )}
              </div>
            </div>

            {/* Column 2: Log Row Controls */}
            <div className="bg-slate-50 border border-slate-200 rounded-xl p-4 flex flex-col justify-between">
              <div>
                <span className="text-[11px] font-bold text-slate-500 uppercase tracking-wider">
                  Telemetry Logging Controls
                </span>
                <p className="text-xs text-slate-600 mt-1">
                  Log active metrics for <strong className="text-slate-900">{currentWeather.displayLocation}</strong>:
                </p>
                <div className="mt-2 text-[11px] space-y-1 bg-white border border-slate-200 rounded-md p-2 text-slate-600 font-mono">
                  <div>Temp: <span className="font-bold text-slate-800">{currentWeather.temp}°C</span> | Rain: <span className="font-bold text-slate-800">{currentWeather.rainfallMm}mm</span></div>
                  <div>Risk: <span className="font-bold text-slate-800">{currentRisk.score}/100</span> ({currentRisk.level})</div>
                  <div>State: <span className={`font-bold ${currentRisk.recommendation === 'POWER OFF' ? 'text-rose-600' : 'text-emerald-600'}`}>{currentRisk.recommendation}</span></div>
                </div>
              </div>

              <div className="mt-4 pt-3 border-t border-slate-200 space-y-2">
                <button
                  type="button"
                  onClick={requestAppendRow}
                  disabled={!spreadsheetId || isLoggingRow}
                  className="w-full inline-flex items-center justify-center gap-1.5 px-3 py-2 bg-slate-900 hover:bg-slate-800 disabled:bg-slate-300 text-white rounded-lg text-xs font-bold transition-all shadow-xs cursor-pointer"
                >
                  <FileSpreadsheet className="w-3.5 h-3.5 text-emerald-400" />
                  {isLoggingRow ? 'Appending Row...' : 'Log Current Telemetry'}
                </button>

                {/* Auto-Log Toggle */}
                <label className="flex items-center justify-between cursor-pointer pt-1 px-1">
                  <span className="text-[11px] font-semibold text-slate-700">Auto-Log on Weather Check</span>
                  <input
                    type="checkbox"
                    checked={autoLogEnabled}
                    onChange={(e) => onToggleAutoLog(e.target.checked)}
                    className="w-4 h-4 text-emerald-600 rounded border-slate-300 focus:ring-emerald-500 cursor-pointer"
                  />
                </label>
              </div>
            </div>
          </div>

          {/* Drive Sheets Picker Dialog / Drawer */}
          {showDrivePicker && (
            <div className="bg-slate-50 border border-slate-200 rounded-xl p-4 space-y-3">
              <div className="flex items-center justify-between">
                <h4 className="text-xs font-bold text-slate-800 flex items-center gap-1.5">
                  <FolderOpen className="w-4 h-4 text-emerald-600" />
                  Choose an Existing Google Spreadsheet from your Drive
                </h4>
                <button
                  type="button"
                  onClick={() => setShowDrivePicker(false)}
                  className="text-slate-400 hover:text-slate-600 text-sm font-bold px-1"
                >
                  &times;
                </button>
              </div>

              {/* Manual Input field */}
              <div className="flex gap-2">
                <input
                  type="text"
                  value={manualInput}
                  onChange={(e) => setManualInput(e.target.value)}
                  placeholder="Paste Google Spreadsheet URL or ID..."
                  className="flex-1 text-xs border border-slate-300 rounded-lg px-3 py-1.5 focus:outline-none focus:border-emerald-500 bg-white"
                />
                <button
                  type="button"
                  onClick={handleConnectManual}
                  disabled={!manualInput.trim()}
                  className="px-3 py-1.5 bg-slate-800 hover:bg-slate-900 disabled:bg-slate-200 text-white rounded-lg text-xs font-bold cursor-pointer"
                >
                  Connect
                </button>
              </div>

              {/* Drive files list */}
              {driveSheets.length > 0 ? (
                <div className="max-h-48 overflow-y-auto space-y-1 pr-1 border border-slate-200 rounded-lg bg-white p-2">
                  {driveSheets.map((file) => (
                    <div
                      key={file.id}
                      onClick={() => {
                        setSpreadsheetId(file.id);
                        setSpreadsheetTitle(file.name);
                        setSpreadsheetUrl(file.webViewLink || `https://docs.google.com/spreadsheets/d/${file.id}/edit`);
                        setShowDrivePicker(false);
                      }}
                      className="p-2 hover:bg-emerald-50 hover:border-emerald-200 border border-transparent rounded-lg flex items-center justify-between text-xs cursor-pointer transition-colors"
                    >
                      <div className="flex items-center gap-2 truncate">
                        <FileSpreadsheet className="w-4 h-4 text-emerald-600 shrink-0" />
                        <span className="font-semibold text-slate-800 truncate">{file.name}</span>
                      </div>
                      <span className="text-[10px] text-slate-400 shrink-0 font-mono">
                        {file.modifiedTime ? new Date(file.modifiedTime).toLocaleDateString() : ''}
                      </span>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-xs text-slate-500 italic p-2 text-center">
                  No spreadsheets found in Drive or list loading.
                </p>
              )}
            </div>
          )}

          {/* Telemetry Spreadsheet Preview Table */}
          {spreadsheetId && (
            <div className="border border-slate-200 rounded-xl overflow-hidden bg-white shadow-2xs">
              <div className="px-4 py-2.5 bg-slate-900 text-white flex items-center justify-between text-xs">
                <div className="flex items-center gap-2">
                  <History className="w-3.5 h-3.5 text-emerald-400" />
                  <span className="font-bold">Recent Telemetry Rows in Sheet</span>
                  <span className="text-[10px] bg-slate-800 text-slate-300 px-1.5 py-0.5 rounded font-mono">
                    {tableRows.length} recent entries
                  </span>
                </div>
                <a
                  href={spreadsheetUrl || `https://docs.google.com/spreadsheets/d/${spreadsheetId}/edit`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-emerald-300 hover:text-white flex items-center gap-1 font-semibold"
                >
                  View Full Google Sheet <ExternalLink className="w-3 h-3" />
                </a>
              </div>

              {isLoadingRows ? (
                <div className="p-8 text-center text-xs text-slate-400 flex items-center justify-center gap-2">
                  <RefreshCw className="w-4 h-4 animate-spin text-emerald-600" />
                  Loading sheet records from Google Cloud...
                </div>
              ) : tableRows.length === 0 ? (
                <div className="p-8 text-center space-y-1">
                  <p className="text-xs font-semibold text-slate-700">No telemetry records logged yet.</p>
                  <p className="text-[11px] text-slate-500">
                    Click "Log Current Telemetry" above to write the first record into this sheet.
                  </p>
                </div>
              ) : (
                <div className="overflow-x-auto max-h-60">
                  <table className="w-full text-left text-xs border-collapse">
                    <thead>
                      <tr className="bg-slate-50 border-b border-slate-200 text-slate-600 text-[11px] font-bold">
                        <th className="p-2.5 pl-3">Timestamp</th>
                        <th className="p-2.5">Location</th>
                        <th className="p-2.5">Temp (°C)</th>
                        <th className="p-2.5">Rain (mm)</th>
                        <th className="p-2.5">Wind (km/h)</th>
                        <th className="p-2.5">Condition</th>
                        <th className="p-2.5">AI Risk Score</th>
                        <th className="p-2.5">Power Action</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100 font-mono text-[11px]">
                      {tableRows.map((row, idx) => {
                        const ts = row[0] ? new Date(row[0]).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : '—';
                        const loc = row[1] || '—';
                        const temp = row[4] !== undefined ? `${row[4]}°C` : '—';
                        const rain = row[5] !== undefined ? `${row[5]} mm` : '—';
                        const wind = row[6] !== undefined ? `${row[6]} km/h` : '—';
                        const cond = row[8] || '—';
                        const score = row[9] || '—';
                        const action = row[11] || '—';
                        const isOff = String(action).toUpperCase().includes('OFF');

                        return (
                          <tr key={idx} className="hover:bg-slate-50 transition-colors">
                            <td className="p-2.5 pl-3 text-slate-500 whitespace-nowrap">{ts}</td>
                            <td className="p-2.5 font-sans font-medium text-slate-800 truncate max-w-[140px]">{loc}</td>
                            <td className="p-2.5 text-slate-700">{temp}</td>
                            <td className="p-2.5 text-slate-700">{rain}</td>
                            <td className="p-2.5 text-slate-700">{wind}</td>
                            <td className="p-2.5 font-sans text-slate-600 truncate max-w-[120px]">{cond}</td>
                            <td className="p-2.5 font-bold text-slate-800">{score}/100</td>
                            <td className="p-2.5">
                              <span
                                className={`px-2 py-0.5 rounded text-[10px] font-sans font-bold ${
                                  isOff
                                    ? 'bg-rose-100 text-rose-800 border border-rose-200'
                                    : 'bg-emerald-100 text-emerald-800 border border-emerald-200'
                                }`}
                              >
                                {action}
                              </span>
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          )}
        </div>
      )}

      {/* Explicit User Confirmation Dialog (MANDATORY per Workspace guidelines) */}
      {confirmModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/50 backdrop-blur-xs p-4">
          <div className="bg-white rounded-2xl max-w-md w-full border border-slate-200 shadow-xl p-5 space-y-4 animate-in fade-in zoom-in-95">
            <div className="flex items-start gap-3">
              <div className="w-10 h-10 rounded-xl bg-amber-50 border border-amber-200 text-amber-600 flex items-center justify-center shrink-0">
                <ShieldAlert className="w-5 h-5" />
              </div>
              <div>
                <h3 className="text-sm font-bold text-slate-900">{confirmModal.title}</h3>
                <p className="text-xs text-slate-600 mt-1 leading-relaxed">
                  {confirmModal.description}
                </p>
              </div>
            </div>

            <div className="flex items-center justify-end gap-2 pt-2 border-t border-slate-100">
              <button
                type="button"
                onClick={() => setConfirmModal(null)}
                className="px-3.5 py-1.5 text-xs font-semibold text-slate-600 hover:text-slate-800 bg-slate-100 hover:bg-slate-200 rounded-lg transition-colors cursor-pointer"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={() => {
                  if (confirmModal.actionType === 'create_sheet') {
                    executeCreateSpreadsheet();
                  } else if (confirmModal.actionType === 'append_row') {
                    executeAppendRow();
                  }
                }}
                className="px-4 py-1.5 text-xs font-bold text-white bg-emerald-600 hover:bg-emerald-700 rounded-lg transition-all shadow-xs cursor-pointer"
              >
                Confirm & Proceed
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
