import { AcademicScenario, ProjectFile } from '../types';

export const ACADEMIC_SCENARIOS: AcademicScenario[] = [
  {
    id: 'safe_clear',
    name: 'Coimbatore Fair & Safe',
    badge: '☀️ Safe (Low Risk)',
    targetRisk: 'LOW',
    weather: {
      city: 'Coimbatore',
      country: 'IN',
      displayLocation: 'Coimbatore, Tamil Nadu, India',
      temp: 28.5,
      humidity: 52,
      windSpeedKmh: 11.5,
      windSpeedMs: 3.2,
      rainfallMm: 0.0,
      condition: 'Clear',
      description: 'clear blue sky',
      conditionId: 800,
      icon: '01d'
    }
  },
  {
    id: 'monsoon_moderate',
    name: 'Coimbatore Monsoon Rain',
    badge: '🌧️ Monsoon (Medium Risk)',
    targetRisk: 'MEDIUM',
    weather: {
      city: 'Coimbatore',
      country: 'IN',
      displayLocation: 'Coimbatore, Tamil Nadu, India',
      temp: 24.0,
      humidity: 88,
      windSpeedKmh: 30.6,
      windSpeedMs: 8.5,
      rainfallMm: 8.2,
      condition: 'Rain',
      description: 'moderate monsoon rainfall',
      conditionId: 501,
      icon: '10d'
    }
  },
  {
    id: 'severe_thunderstorm',
    name: 'Severe Thunderstorm & Lightning',
    badge: '⛈️ Thunderstorm (High Risk)',
    targetRisk: 'HIGH',
    weather: {
      city: 'Coimbatore',
      country: 'IN',
      displayLocation: 'Coimbatore, Tamil Nadu, India',
      temp: 22.0,
      humidity: 94,
      windSpeedKmh: 63.0,
      windSpeedMs: 17.5,
      rainfallMm: 22.5,
      condition: 'Thunderstorm',
      description: 'severe thunderstorm with frequent lightning strikes',
      conditionId: 212,
      icon: '11d'
    }
  },
  {
    id: 'cyclone_gale',
    name: 'Cyclone - Gale Force Winds',
    badge: '🌪️ Cyclone (High Risk)',
    targetRisk: 'HIGH',
    weather: {
      city: 'Coimbatore',
      country: 'IN',
      displayLocation: 'Coimbatore, Tamil Nadu, India',
      temp: 21.0,
      humidity: 96,
      windSpeedKmh: 93.6,
      windSpeedMs: 26.0,
      rainfallMm: 35.0,
      condition: 'Squall',
      description: 'destructive squalls and cyclonic gusts',
      conditionId: 771,
      icon: '50d'
    }
  },
  {
    id: 'flood_downpour',
    name: 'Torrential Urban Downpour',
    badge: '🌊 Flood Risk (High Risk)',
    targetRisk: 'HIGH',
    weather: {
      city: 'Coimbatore',
      country: 'IN',
      displayLocation: 'Coimbatore, Tamil Nadu, India',
      temp: 23.5,
      humidity: 98,
      windSpeedKmh: 50.4,
      windSpeedMs: 14.0,
      rainfallMm: 48.0,
      condition: 'Rain',
      description: 'torrential downpour with substation inundation risk',
      conditionId: 503,
      icon: '09d'
    }
  }
];

export const PYTHON_PROJECT_FILES: ProjectFile[] = [
  {
    name: 'app.py',
    path: 'AI-Power-System/app.py',
    language: 'python',
    description: 'Main Flask web server & rule-based AI risk engine',
    content: `"""
AI Weather Risk Detection and Power Safety System
Academic Software Prototype for College Project Demonstration
Author: Jeeva (Student Project)
Tech Stack: Python 3, Flask, HTML5, CSS3, JavaScript, OpenWeatherMap API, python-dotenv, requests

IMPORTANT SAFETY NOTICE:
This is a SOFTWARE-ONLY prototype for academic demonstration.
It does NOT control real electrical mains power or connect to electrical hardware.
All POWER ON / POWER OFF outputs are simulated advisory recommendations.
"""

import os
import datetime
import requests
from flask import Flask, render_template, request, jsonify
from dotenv import load_dotenv

# Load environment variables from .env file
load_dotenv()

app = Flask(__name__)

# Security: Read API key from environment variable
WEATHER_API_KEY = os.getenv("WEATHER_API_KEY", "").strip()

# Default city configuration
DEFAULT_CITY = "Coimbatore,IN"
DEFAULT_CITY_DISPLAY = "Coimbatore, Tamil Nadu, India"

def evaluate_weather_risk(temp, humidity, wind_kmh, rainfall_mm, condition_name, condition_id, description):
    score = 0
    reasons = []
    breakdown = {
        "rainfall_risk": 0,
        "wind_risk": 0,
        "storm_condition_risk": 0,
        "humidity_risk": 0
    }
    
    # 1. Rainfall Assessment
    if rainfall_mm > 30.0:
        rain_pts = 40
        reasons.append(f"Torrential rainfall ({rainfall_mm:.1f} mm) detected; severe substation water ingress & short-circuit risk.")
    elif rainfall_mm > 15.0:
        rain_pts = 30
        reasons.append(f"Heavy rainfall ({rainfall_mm:.1f} mm) recorded; high moisture infiltration risk.")
    elif rainfall_mm > 5.0:
        rain_pts = 18
        reasons.append(f"Moderate rainfall ({rainfall_mm:.1f} mm) present; wet grounding advisories active.")
    elif rainfall_mm > 0.1:
        rain_pts = 8
        reasons.append(f"Light precipitation ({rainfall_mm:.1f} mm); minimal immediate dielectric threat.")
    else:
        rain_pts = 0
    breakdown["rainfall_risk"] = rain_pts
    score += rain_pts

    # 2. Wind Speed Hazard
    if wind_kmh >= 65.0:
        wind_pts = 38
        reasons.append(f"Destructive storm-force winds ({wind_kmh:.1f} km/h); extreme probability of downed overhead power lines.")
    elif wind_kmh >= 45.0:
        wind_pts = 26
        reasons.append(f"Gale-force winds ({wind_kmh:.1f} km/h); high mechanical strain on distribution poles and conductors.")
    elif wind_kmh >= 25.0:
        wind_pts = 14
        reasons.append(f"Moderate wind speed ({wind_kmh:.1f} km/h); increased tree branch sway near power corridors.")
    else:
        wind_pts = 0
    breakdown["wind_risk"] = wind_pts
    score += wind_pts

    # 3. Severe Weather Conditions
    cond_pts = 0
    if 200 <= condition_id < 300 or "thunderstorm" in condition_name.lower() or "thunderstorm" in description.lower():
        cond_pts = 42
        reasons.append(f"Thunderstorm & active lightning hazard detected ({description.capitalize()}); critical surge risk for transformers.")
    elif condition_id in [771, 781] or "squall" in condition_name.lower() or "tornado" in condition_name.lower():
        cond_pts = 45
        reasons.append(f"Severe atmospheric squall/tornado event detected ({description.capitalize()}).")
    elif 502 <= condition_id <= 504 or condition_id == 522:
        cond_pts = 20
        reasons.append(f"Extreme heavy intensity rain classification ({description.capitalize()}).")
    elif condition_name.lower() in ["snow", "freezing rain"]:
        cond_pts = 25
        reasons.append("Freezing precipitation alert; ice accumulation risk on electrical lines.")
    breakdown["storm_condition_risk"] = cond_pts
    score += cond_pts

    # 4. High Humidity & Moisture Saturation
    hum_pts = 0
    if humidity >= 90 and (rainfall_mm > 0 or condition_name.lower() in ["rain", "thunderstorm", "drizzle"]):
        hum_pts = 8
        reasons.append(f"Near-saturated relative humidity ({humidity}%) with precipitation exacerbates insulator flashover.")
    elif humidity >= 95:
        hum_pts = 5
        reasons.append(f"Extreme relative humidity ({humidity}%); surface condensation monitoring recommended.")
    breakdown["humidity_risk"] = hum_pts
    score += hum_pts

    risk_score = max(0, min(100, score))

    if risk_score >= 60:
        risk_level = "HIGH"
        recommendation = "POWER OFF"
    elif risk_score >= 30:
        risk_level = "MEDIUM"
        recommendation = "POWER ON"
    else:
        risk_level = "LOW"
        recommendation = "POWER ON"

    return {
        "score": risk_score,
        "level": risk_level,
        "recommendation": recommendation,
        "reasons": reasons,
        "breakdown": breakdown
    }

@app.route("/")
def index():
    return render_template("index.html", default_city=DEFAULT_CITY_DISPLAY)

@app.route("/api/weather", methods=["GET", "POST"])
def get_weather_and_analyze():
    city_query = request.args.get("city", "").strip() or DEFAULT_CITY
    # OpenWeatherMap API Call logic
    # ...
    return jsonify({"success": True})

if __name__ == "__main__":
    port = int(os.getenv("FLASK_PORT", 5000))
    app.run(host="0.0.0.0", port=port, debug=True)`
  },
  {
    name: 'requirements.txt',
    path: 'AI-Power-System/requirements.txt',
    language: 'text',
    description: 'Python project dependencies',
    content: `Flask==3.0.3
python-dotenv==1.0.1
requests==2.32.3
gunicorn==22.0.0`
  },
  {
    name: '.env',
    path: 'AI-Power-System/.env',
    language: 'bash',
    description: 'Secret environment variables file',
    content: `# OpenWeatherMap API Key
# 1. Sign up for a free account at https://openweathermap.org/api
# 2. Generate a free API key under your profile
# 3. Paste your key below
WEATHER_API_KEY=YOUR_API_KEY

# Flask Configuration
FLASK_PORT=5000
FLASK_DEBUG=True`
  },
  {
    name: '.gitignore',
    path: 'AI-Power-System/.gitignore',
    language: 'text',
    description: 'Git ignore rules preventing .env and venv leak',
    content: `__pycache__/
*.py[cod]
venv/
.venv/
.env
.DS_Store`
  },
  {
    name: 'templates/index.html',
    path: 'AI-Power-System/templates/index.html',
    language: 'html',
    description: 'HTML5 dashboard interface with semantic tags',
    content: `<!-- Templates index.html - Rendered by Flask -->
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8" />
  <title>AI Weather Risk Detection and Power Safety System</title>
  <link rel="stylesheet" href="{{ url_for('static', filename='style.css') }}" />
</head>
<body>
  <!-- Academic Dashboard Content -->
</body>
</html>`
  },
  {
    name: 'static/style.css',
    path: 'AI-Power-System/static/style.css',
    language: 'css',
    description: 'CSS styling for dashboard cards and risk meters',
    content: `/* Clean, modern styling with high-contrast colors for college viva */`
  },
  {
    name: 'static/script.js',
    path: 'AI-Power-System/static/script.js',
    language: 'javascript',
    description: 'DOM controller for dynamic updates and API polling',
    content: `// Client-side controller for weather fetch, auto-refresh and scenario simulation`
  },
  {
    name: 'README.md',
    path: 'AI-Power-System/README.md',
    language: 'markdown',
    description: 'Comprehensive academic documentation with terminal commands',
    content: `# AI Weather Risk Detection and Power Safety System
Academic Software Prototype for College Project Demonstration`
  }
];
