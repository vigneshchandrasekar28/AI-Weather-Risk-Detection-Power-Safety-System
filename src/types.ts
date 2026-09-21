/**
 * Types for AI Weather Risk Detection and Power Safety System
 */

export interface GeocodedLocation {
  name: string;
  state?: string;
  country: string;
  lat: number;
  lon: number;
  displayName: string;
}

export interface WeatherData {
  city: string;
  country: string;
  state?: string;
  lat?: number;
  lon?: number;
  displayLocation: string;
  temp: number; // Celsius
  humidity: number; // %
  windSpeedKmh: number; // km/h
  windSpeedMs: number; // m/s
  rainfallMm: number; // mm/hr
  condition: string; // e.g. "Clear", "Rain", "Thunderstorm", "Squall"
  description: string;
  conditionId: number;
  icon: string;
}

export type RiskLevel = 'LOW' | 'MEDIUM' | 'HIGH';
export type PowerRecommendation = 'POWER ON' | 'POWER OFF';

export interface RiskBreakdown {
  rainfallRisk: number;
  windRisk: number;
  stormConditionRisk: number;
  humidityRisk: number;
}

export interface RiskAnalysis {
  score: number; // 0 - 100
  level: RiskLevel;
  recommendation: PowerRecommendation;
  reasons: string[];
  breakdown: RiskBreakdown;
  safetyMargin: number; // 100 - score
  explanation?: string;
  factors?: {
    rainfall: number;
    wind: number;
    storm: number;
    humidity: number;
  };
}

export interface ForecastItem {
  time: string; // e.g. "12:00 PM"
  dateTime: string;
  dayName: string;
  dateStr: string;
  temp: number;
  tempMin: number;
  tempMax: number;
  humidity: number;
  windSpeedKmh: number;
  rainfallMm: number;
  pop: number; // probability of precipitation in % (0 - 100)
  condition: string;
  description: string;
  conditionId: number;
  icon: string;
}

export interface DailyForecast {
  dayName: string;
  dateStr: string;
  tempMin: number;
  tempMax: number;
  rainProb: number;
  rainfallMm: number;
  windSpeedKmh: number;
  condition: string;
  description: string;
  icon: string;
}

export interface MonitoredLocationItem {
  id: string;
  location: GeocodedLocation;
  weather: WeatherData;
  risk: RiskAnalysis;
  lastUpdated: string;
}

export interface SystemEventLogItem {
  id: string;
  timestamp: string;
  type?: 'weather_update' | 'risk_change' | 'hazard_detected' | 'monitoring' | 'power_advisory' | 'system';
  message: string;
  severity: 'info' | 'warning' | 'critical' | 'success';
}

export interface AcademicScenario {
  id: string;
  name: string;
  badge: string;
  targetRisk: RiskLevel;
  weather: WeatherData;
}

export interface ProjectFile {
  name: string;
  path: string;
  language: string;
  content: string;
  description: string;
}

export interface SheetFileSummary {
  id: string;
  name: string;
  modifiedTime?: string;
  webViewLink?: string;
}

export interface TelemetrySpreadsheetLog {
  timestamp: string;
  location: string;
  lat: number | string;
  lon: number | string;
  temp: number;
  rainfallMm: number;
  windSpeedKmh: number;
  humidity: number;
  condition: string;
  riskScore: number;
  riskLevel: RiskLevel;
  recommendation: PowerRecommendation;
  factors: string;
}
