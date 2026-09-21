import { WeatherData, RiskAnalysis, SheetFileSummary } from '../types';

export const TELEMETRY_SHEET_HEADERS = [
  'Timestamp (UTC)',
  'Location',
  'Latitude',
  'Longitude',
  'Temperature (°C)',
  'Rainfall (mm/h)',
  'Wind Speed (km/h)',
  'Humidity (%)',
  'Weather Condition',
  'AI Risk Score (0-100)',
  'Risk Level',
  'Simulated Power State',
  'Primary Risk Reasons'
];

/**
 * Lists the user's recent Google Sheets from Google Drive
 */
export async function listUserSpreadsheets(accessToken: string): Promise<SheetFileSummary[]> {
  try {
    const q = encodeURIComponent("mimeType='application/vnd.google-apps.spreadsheet' and trashed=false");
    const url = `https://www.googleapis.com/drive/v3/files?q=${q}&orderBy=modifiedTime desc&pageSize=12&fields=files(id,name,modifiedTime,webViewLink)`;
    
    const res = await fetch(url, {
      headers: {
        Authorization: `Bearer ${accessToken}`,
        Accept: 'application/json'
      }
    });

    if (!res.ok) {
      const errData = await res.json().catch(() => ({}));
      throw new Error(errData.error?.message || `Failed to fetch Drive files (${res.status})`);
    }

    const data = await res.json();
    return (data.files || []).map((file: any) => ({
      id: file.id,
      name: file.name,
      modifiedTime: file.modifiedTime,
      webViewLink: file.webViewLink || `https://docs.google.com/spreadsheets/d/${file.id}/edit`
    }));
  } catch (error: any) {
    console.error('Error listing user spreadsheets:', error);
    throw error;
  }
}

/**
 * Creates a brand new Google Spreadsheet dedicated for AI Power Safety Telemetry logging.
 */
export async function createTelemetrySpreadsheet(
  accessToken: string,
  customTitle?: string
): Promise<{ spreadsheetId: string; spreadsheetUrl: string; sheetName: string }> {
  const dateStr = new Date().toISOString().split('T')[0];
  const title = customTitle?.trim() || `⚡ AI Power Safety Telemetry Log - ${dateStr}`;

  const requestBody = {
    properties: {
      title
    },
    sheets: [
      {
        properties: {
          title: 'Telemetry_Logs',
          gridProperties: {
            frozenRowCount: 1
          }
        },
        data: [
          {
            startRow: 0,
            startColumn: 0,
            rowData: [
              {
                values: TELEMETRY_SHEET_HEADERS.map((header) => ({
                  userEnteredValue: { stringValue: header },
                  userEnteredFormat: {
                    backgroundColor: { red: 0.06, green: 0.09, blue: 0.16 }, // slate-900
                    textFormat: {
                      bold: true,
                      foregroundColor: { red: 1.0, green: 1.0, blue: 1.0 },
                      fontSize: 10
                    },
                    horizontalAlignment: 'CENTER'
                  }
                }))
              }
            ]
          }
        ]
      }
    ]
  };

  const res = await fetch('https://sheets.googleapis.com/v4/spreadsheets', {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${accessToken}`,
      'Content-Type': 'application/json'
    },
    body: JSON.stringify(requestBody)
  });

  if (!res.ok) {
    const errData = await res.json().catch(() => ({}));
    throw new Error(errData.error?.message || `Failed to create spreadsheet (${res.status})`);
  }

  const data = await res.json();
  const spreadsheetId = data.spreadsheetId;
  const spreadsheetUrl = data.spreadsheetUrl || `https://docs.google.com/spreadsheets/d/${spreadsheetId}/edit`;

  return {
    spreadsheetId,
    spreadsheetUrl,
    sheetName: 'Telemetry_Logs'
  };
}

/**
 * Reads tab names for an existing spreadsheet to identify or create the telemetry tab
 */
export async function getSpreadsheetDetails(
  accessToken: string,
  spreadsheetId: string
): Promise<{ title: string; sheetNames: string[]; webUrl: string }> {
  const res = await fetch(`https://sheets.googleapis.com/v4/spreadsheets/${spreadsheetId}?fields=properties.title,sheets.properties.title`, {
    headers: {
      Authorization: `Bearer ${accessToken}`
    }
  });

  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    throw new Error(err.error?.message || `Failed to read spreadsheet (${res.status})`);
  }

  const data = await res.json();
  const title = data.properties?.title || 'Google Spreadsheet';
  const sheetNames = (data.sheets || []).map((s: any) => s.properties?.title || 'Sheet1');

  return {
    title,
    sheetNames,
    webUrl: `https://docs.google.com/spreadsheets/d/${spreadsheetId}/edit`
  };
}

/**
 * Appends a weather telemetry log row to the target Google Spreadsheet.
 */
export async function appendTelemetryLog(
  accessToken: string,
  spreadsheetId: string,
  sheetName: string,
  weather: WeatherData,
  risk: RiskAnalysis
): Promise<{ updatedRange: string; updatedRows: number }> {
  const rowValues = [
    new Date().toISOString(),
    weather.displayLocation || weather.city,
    weather.lat !== undefined ? weather.lat : '',
    weather.lon !== undefined ? weather.lon : '',
    weather.temp,
    weather.rainfallMm,
    weather.windSpeedKmh,
    weather.humidity,
    `${weather.condition} (${weather.description})`,
    risk.score,
    risk.level,
    risk.recommendation,
    risk.reasons.length > 0 ? risk.reasons.join('; ') : 'All parameters inside nominal operating limits'
  ];

  const range = `${sheetName}!A:M`;
  const url = `https://sheets.googleapis.com/v4/spreadsheets/${spreadsheetId}/values/${encodeURIComponent(range)}:append?valueInputOption=USER_ENTERED&insertDataOption=INSERT_ROWS`;

  const res = await fetch(url, {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${accessToken}`,
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({
      values: [rowValues]
    })
  });

  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    throw new Error(err.error?.message || `Failed to append telemetry to sheet (${res.status})`);
  }

  const data = await res.json();
  return {
    updatedRange: data.updates?.updatedRange || range,
    updatedRows: data.updates?.updatedRows || 1
  };
}

/**
 * Fetches recent telemetry rows from the sheet for live in-dashboard inspection
 */
export async function readRecentTelemetryRows(
  accessToken: string,
  spreadsheetId: string,
  sheetName: string,
  limit: number = 15
): Promise<{ headers: string[]; rows: string[][] }> {
  const range = `${sheetName}!A1:M50`;
  const url = `https://sheets.googleapis.com/v4/spreadsheets/${spreadsheetId}/values/${encodeURIComponent(range)}`;

  const res = await fetch(url, {
    headers: {
      Authorization: `Bearer ${accessToken}`
    }
  });

  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    throw new Error(err.error?.message || `Failed to read sheet data (${res.status})`);
  }

  const data = await res.json();
  const allRows: string[][] = data.values || [];

  if (allRows.length === 0) {
    return { headers: TELEMETRY_SHEET_HEADERS, rows: [] };
  }

  const headers = allRows[0];
  const dataRows = allRows.slice(1).reverse().slice(0, limit);

  return {
    headers,
    rows: dataRows
  };
}
