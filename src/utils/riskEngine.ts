import { WeatherData, RiskAnalysis, RiskLevel, PowerRecommendation } from '../types';

/**
 * Transparent Rule-Based AI Risk Analysis Engine
 * Evaluates meteorological parameters to calculate a safety score (0 - 100).
 */
export function evaluateWeatherRisk(data: WeatherData): RiskAnalysis {
  let score = 0;
  const reasons: string[] = [];
  const breakdown = {
    rainfallRisk: 0,
    windRisk: 0,
    stormConditionRisk: 0,
    humidityRisk: 0
  };

  // 1. Rainfall Impact
  if (data.rainfallMm > 30.0) {
    const pts = 40;
    breakdown.rainfallRisk = pts;
    score += pts;
    reasons.push(`Torrential precipitation (${data.rainfallMm.toFixed(1)} mm/hr) detected; critical substation water ingress & short-circuit risk.`);
  } else if (data.rainfallMm > 15.0) {
    const pts = 30;
    breakdown.rainfallRisk = pts;
    score += pts;
    reasons.push(`Heavy rainfall (${data.rainfallMm.toFixed(1)} mm/hr); elevated moisture infiltration into distribution switchgear.`);
  } else if (data.rainfallMm > 5.0) {
    const pts = 18;
    breakdown.rainfallRisk = pts;
    score += pts;
    reasons.push(`Moderate rainfall (${data.rainfallMm.toFixed(1)} mm/hr); wet grounding telemetry advisories active.`);
  } else if (data.rainfallMm > 0.1) {
    const pts = 8;
    breakdown.rainfallRisk = pts;
    score += pts;
    reasons.push(`Light rainfall (${data.rainfallMm.toFixed(1)} mm/hr); within safe dielectric operating thresholds.`);
  }

  // 2. Wind Velocity Hazard
  if (data.windSpeedKmh >= 65.0) {
    const pts = 38;
    breakdown.windRisk = pts;
    score += pts;
    reasons.push(`Destructive storm-force winds (${data.windSpeedKmh.toFixed(1)} km/h); extreme probability of snapped conductors and downed power lines.`);
  } else if (data.windSpeedKmh >= 45.0) {
    const pts = 26;
    breakdown.windRisk = pts;
    score += pts;
    reasons.push(`Gale-force winds (${data.windSpeedKmh.toFixed(1)} km/h); intense mechanical stress on distribution poles and cross-arms.`);
  } else if (data.windSpeedKmh >= 25.0) {
    const pts = 14;
    breakdown.windRisk = pts;
    score += pts;
    reasons.push(`Moderate winds (${data.windSpeedKmh.toFixed(1)} km/h); tree branch clearance monitoring advised.`);
  }

  // 3. Severe Weather Classifications (Thunderstorm, Squall, Tornado)
  const condLower = data.condition.toLowerCase();
  const descLower = data.description.toLowerCase();
  let condPts = 0;

  if (
    (data.conditionId >= 200 && data.conditionId < 300) ||
    condLower.includes('thunder') ||
    descLower.includes('thunder')
  ) {
    condPts = 42;
    reasons.push(`Active thunderstorm & lightning surge threat detected (${data.description}); high risk of transformer burnouts and transient surges.`);
  } else if (
    [771, 781].includes(data.conditionId) ||
    condLower.includes('squall') ||
    condLower.includes('tornado')
  ) {
    condPts = 45;
    reasons.push(`Violent atmospheric squall/tornado alert (${data.description}); infrastructure mechanical failure hazard.`);
  } else if (
    [502, 503, 504, 522].includes(data.conditionId)
  ) {
    condPts = 20;
    reasons.push(`Intense heavy precipitation classification (${data.description}).`);
  } else if (condLower.includes('snow') || condLower.includes('ice')) {
    condPts = 25;
    reasons.push('Freezing condition alert; ice accumulation risk on power lines.');
  }
  breakdown.stormConditionRisk = condPts;
  score += condPts;

  // 4. Relative Humidity & Wet Saturation Hazard
  let humPts = 0;
  if (data.humidity >= 90 && (data.rainfallMm > 0 || ['rain', 'thunderstorm', 'drizzle'].includes(condLower))) {
    humPts = 8;
    reasons.push(`Atmospheric humidity near saturation (${data.humidity}%) combined with precipitation degrades insulator dielectric strength.`);
  } else if (data.humidity >= 95) {
    humPts = 5;
    reasons.push(`High relative humidity (${data.humidity}%); condensation monitoring recommended.`);
  }
  breakdown.humidityRisk = humPts;
  score += humPts;

  // Clamp strictly between 0 and 100
  const finalScore = Math.max(0, Math.min(100, Math.round(score)));

  // Risk Level and Power Recommendation
  let level: RiskLevel = 'LOW';
  let recommendation: PowerRecommendation = 'POWER ON';

  if (finalScore >= 60) {
    level = 'HIGH';
    recommendation = 'POWER OFF';
    if (reasons.length === 0) {
      reasons.push('Cumulative weather hazard indices surpass critical electrical safety margins.');
    }
  } else if (finalScore >= 30) {
    level = 'MEDIUM';
    recommendation = 'POWER ON';
    if (reasons.length === 0) {
      reasons.push('Moderate meteorological conditions; power distribution permitted with continuous telemetry monitoring.');
    }
  } else {
    level = 'LOW';
    recommendation = 'POWER ON';
    if (reasons.length === 0) {
      reasons.push('Calm and stable meteorological conditions. All parameters are well within safe operating thresholds.');
    }
  }

  // Generate transparent human-readable explanation based strictly on actual weather data
  let explanation = '';
  const factorDescriptions: string[] = [];

  if (data.rainfallMm > 15.0) {
    factorDescriptions.push(`heavy precipitation (${data.rainfallMm.toFixed(1)} mm/hr)`);
  } else if (data.rainfallMm > 5.0) {
    factorDescriptions.push(`moderate rainfall (${data.rainfallMm.toFixed(1)} mm/hr)`);
  }

  if (data.windSpeedKmh >= 45.0) {
    factorDescriptions.push(`high wind velocity (${data.windSpeedKmh.toFixed(1)} km/h)`);
  } else if (data.windSpeedKmh >= 25.0) {
    factorDescriptions.push(`gusty winds (${data.windSpeedKmh.toFixed(1)} km/h)`);
  }

  if (
    (data.conditionId >= 200 && data.conditionId < 300) ||
    data.condition.toLowerCase().includes('thunder') ||
    data.description.toLowerCase().includes('thunder')
  ) {
    factorDescriptions.push(`active lightning and thunderstorm activity (${data.description})`);
  } else if (data.condition.toLowerCase().includes('squall')) {
    factorDescriptions.push(`violent atmospheric squalls (${data.description})`);
  }

  if (level === 'HIGH') {
    if (factorDescriptions.length > 0) {
      explanation = `Risk is HIGH (${finalScore}/100) because ${factorDescriptions.join(' combined with ')} detected in ${data.city}. These conditions dramatically elevate the probability of snapped distribution lines, waterlogged substations, and transformer burnouts. Feeder isolation is simulated for grid safety.`;
    } else {
      explanation = `Risk is HIGH (${finalScore}/100) because cumulative meteorological stress indices have crossed the threshold for safe distribution in ${data.city}.`;
    }
  } else if (level === 'MEDIUM') {
    if (factorDescriptions.length > 0) {
      explanation = `Risk is MEDIUM (${finalScore}/100) due to ${factorDescriptions.join(' alongside ')} in ${data.city}. Power distribution remains active, but continuous monitoring is advised to detect rapid storm escalation.`;
    } else {
      explanation = `Risk is MEDIUM (${finalScore}/100) with moderate atmospheric activity in ${data.city}. Parameters remain within operable margins under ongoing supervision.`;
    }
  } else {
    explanation = `Risk is LOW (${finalScore}/100) because atmospheric conditions in ${data.city} are calm and stable, with wind speed of ${data.windSpeedKmh.toFixed(1)} km/h, negligible rainfall (${data.rainfallMm.toFixed(1)} mm/hr), and normal humidity (${data.humidity}%). Distribution grid operations are fully safe.`;
  }

  const factors = {
    rainfall: breakdown.rainfallRisk,
    wind: breakdown.windRisk,
    storm: breakdown.stormConditionRisk,
    humidity: breakdown.humidityRisk
  };

  return {
    score: finalScore,
    level,
    recommendation,
    reasons,
    breakdown,
    safetyMargin: Math.max(0, 100 - finalScore),
    explanation,
    factors
  };
}
