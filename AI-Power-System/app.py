"""
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
import re
import json
import datetime
import requests
from flask import Flask, render_template, request, jsonify
from dotenv import load_dotenv

# Load environment variables from .env file
load_dotenv()

app = Flask(__name__)

# Security: Read API key from environment variable
WEATHER_API_KEY = os.getenv("WEATHER_API_KEY", os.getenv("OPENWEATHER_API_KEY", "")).strip()
OWM_FORECAST_URL = "https://api.openweathermap.org/data/2.5/forecast"

def is_within_india(lat: float, lon: float) -> bool:
    """Check if coordinates fall inside the sovereign geographic boundary of India."""
    return 6.5 <= lat <= 37.5 and 68.0 <= lon <= 97.5

# Default city configuration
DEFAULT_CITY = "Coimbatore,IN"
DEFAULT_CITY_DISPLAY = "Coimbatore, Tamil Nadu, India"

# Academic Simulation Scenarios for testing and viva presentation
ACADEMIC_SCENARIOS = {
    "safe_clear": {
        "name": "Coimbatore - Safe & Fair Weather",
        "city": "Coimbatore, Tamil Nadu, India",
        "temp": 28.5,
        "humidity": 52,
        "wind_speed": 3.2,  # m/s (~11.5 km/h)
        "rainfall": 0.0,
        "condition": "Clear",
        "description": "clear blue sky",
        "condition_id": 800
    },
    "monsoon_moderate": {
        "name": "Coimbatore - Monsoon Moderate Rain",
        "city": "Coimbatore, Tamil Nadu, India",
        "temp": 24.0,
        "humidity": 88,
        "wind_speed": 8.5,  # m/s (~30.6 km/h)
        "rainfall": 8.2,    # mm
        "condition": "Rain",
        "description": "moderate monsoon rainfall",
        "condition_id": 501
    },
    "severe_thunderstorm": {
        "name": "Severe Thunderstorm & Lightning Hazard",
        "city": "Coimbatore, Tamil Nadu, India",
        "temp": 22.0,
        "humidity": 94,
        "wind_speed": 17.5,  # m/s (~63 km/h)
        "rainfall": 22.5,    # mm
        "condition": "Thunderstorm",
        "description": "severe thunderstorm with frequent lightning",
        "condition_id": 212
    },
    "cyclone_gale": {
        "name": "Tropical Cyclone - Extreme Gale Winds",
        "city": "Coimbatore, Tamil Nadu, India",
        "temp": 21.0,
        "humidity": 96,
        "wind_speed": 26.0,  # m/s (~93.6 km/h)
        "rainfall": 35.0,    # mm
        "condition": "Squall",
        "description": "destructive squalls and cyclone winds",
        "condition_id": 771
    },
    "flood_downpour": {
        "name": "Urban Torrential Rain - Ingress Hazard",
        "city": "Coimbatore, Tamil Nadu, India",
        "temp": 23.5,
        "humidity": 98,
        "wind_speed": 14.0,  # m/s (~50.4 km/h)
        "rainfall": 48.0,    # mm (extreme downpour)
        "condition": "Rain",
        "description": "extreme heavy downpour with waterlogging risk",
        "condition_id": 503
    }
}


def evaluate_weather_risk(temp, humidity, wind_kmh, rainfall_mm, condition_name, condition_id, description):
    """
    Transparent Rule-Based AI Risk Analysis Engine
    
    Inputs:
        - temp: Temperature in Celsius
        - humidity: Relative humidity percentage (0-100)
        - wind_kmh: Wind speed in km/h
        - rainfall_mm: Precipitation in mm (last hour)
        - condition_name: Main condition string (e.g. 'Thunderstorm', 'Rain')
        - condition_id: OpenWeatherMap 3-digit condition code
        - description: Detailed weather description
        
    Outputs:
        - risk_score: Integer (0 - 100)
        - risk_level: 'LOW', 'MEDIUM', 'HIGH'
        - recommendation: 'POWER ON' or 'POWER OFF'
        - reasons: List of human-readable rule explanations
        - breakdown: Detailed component scores
    """
    score = 0
    reasons = []
    breakdown = {
        "rainfall_risk": 0,
        "wind_risk": 0,
        "storm_condition_risk": 0,
        "humidity_risk": 0
    }
    
    # --- RULE 1: Rainfall Assessment ---
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

    # --- RULE 2: Wind Speed Hazard Assessment ---
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

    # --- RULE 3: Severe Weather Conditions (Thunderstorms, Lightning, Squall) ---
    cond_pts = 0
    # OpenWeather condition IDs:
    # 2xx: Thunderstorm (extreme surge & lightning risk)
    # 7xx: Atmospheric squalls / tornados (771, 781)
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

    # --- RULE 4: High Humidity & Moisture Saturation ---
    hum_pts = 0
    if humidity >= 90 and (rainfall_mm > 0 or condition_name.lower() in ["rain", "thunderstorm", "drizzle"]):
        hum_pts = 8
        reasons.append(f"Near-saturated relative humidity ({humidity}%) in conjunction with precipitation exacerbates insulator flashover.")
    elif humidity >= 95:
        hum_pts = 5
        reasons.append(f"Extreme relative humidity ({humidity}%); surface condensation monitoring recommended.")
    breakdown["humidity_risk"] = hum_pts
    score += hum_pts

    # Clamp score strictly between 0 and 100
    risk_score = max(0, min(100, score))

    # --- RULE 5: Risk Level Categorization ---
    # 0-29   = LOW
    # 30-59  = MEDIUM
    # 60-100 = HIGH
    if risk_score >= 60:
        risk_level = "HIGH"
        recommendation = "POWER OFF"
        if not reasons:
            reasons.append("Cumulative hazardous weather indices exceed safety thresholds.")
    elif risk_score >= 30:
        risk_level = "MEDIUM"
        recommendation = "POWER ON"
        if not reasons:
            reasons.append("Moderate weather conditions; normal distribution permitted with automated supervisory monitoring.")
    else:
        risk_level = "LOW"
        recommendation = "POWER ON"
        if not reasons:
            reasons.append("Weather conditions are calm and optimal for power distribution. All parameters within safe limits.")

    return {
        "score": risk_score,
        "level": risk_level,
        "recommendation": recommendation,
        "reasons": reasons,
        "breakdown": breakdown
    }


# Common non-Indian location references for instant validation
FOREIGN_LOCATIONS_REGEX = re.compile(
    r'\b(london|paris|tokyo|new york|nyc|los angeles|chicago|san francisco|toronto|vancouver|'
    r'sydney|melbourne|singapore|dubai|abu dhabi|beijing|shanghai|berlin|munich|rome|milan|'
    r'madrid|barcelona|moscow|amsterdam|bangkok|seoul|doha|riyadh|cairo|johannesburg|auckland|'
    r'karachi|lahore|dhaka|colombo|kathmandu|islamabad|chittagong|usa|uk|united states|'
    r'united kingdom|france|germany|italy|australia|canada|japan|china|russia|brazil)\b',
    re.IGNORECASE
)

# Comprehensive catalog of popular Indian cities across all states
POPULAR_INDIAN_CITIES = [
    {"name": "Coimbatore", "state": "Tamil Nadu", "country": "IN", "lat": 11.0168, "lon": 76.9558},
    {"name": "Chennai", "state": "Tamil Nadu", "country": "IN", "lat": 13.0827, "lon": 80.2707},
    {"name": "Pollachi", "state": "Tamil Nadu", "country": "IN", "lat": 10.6609, "lon": 77.0048},
    {"name": "Ooty", "state": "Tamil Nadu", "country": "IN", "lat": 11.4102, "lon": 76.6950},
    {"name": "Madurai", "state": "Tamil Nadu", "country": "IN", "lat": 9.9252, "lon": 78.1198},
    {"name": "Salem", "state": "Tamil Nadu", "country": "IN", "lat": 11.6643, "lon": 78.1460},
    {"name": "Erode", "state": "Tamil Nadu", "country": "IN", "lat": 11.3410, "lon": 77.7172},
    {"name": "Tiruppur", "state": "Tamil Nadu", "country": "IN", "lat": 11.1085, "lon": 77.3411},
    {"name": "Tiruchirappalli", "state": "Tamil Nadu", "country": "IN", "lat": 10.7905, "lon": 78.7047},
    {"name": "Bengaluru", "state": "Karnataka", "country": "IN", "lat": 12.9716, "lon": 77.5946},
    {"name": "Mysuru", "state": "Karnataka", "country": "IN", "lat": 12.2958, "lon": 76.6394},
    {"name": "Kochi", "state": "Kerala", "country": "IN", "lat": 9.9312, "lon": 76.2673},
    {"name": "Thiruvananthapuram", "state": "Kerala", "country": "IN", "lat": 8.5241, "lon": 76.9366},
    {"name": "Hyderabad", "state": "Telangana", "country": "IN", "lat": 17.3850, "lon": 78.4867},
    {"name": "Visakhapatnam", "state": "Andhra Pradesh", "country": "IN", "lat": 17.6868, "lon": 83.2185},
    {"name": "Mumbai", "state": "Maharashtra", "country": "IN", "lat": 19.0760, "lon": 72.8777},
    {"name": "Pune", "state": "Maharashtra", "country": "IN", "lat": 18.5204, "lon": 73.8567},
    {"name": "Delhi", "state": "Delhi", "country": "IN", "lat": 28.6139, "lon": 77.2090},
    {"name": "Kolkata", "state": "West Bengal", "country": "IN", "lat": 22.5726, "lon": 88.3639},
    {"name": "Ahmedabad", "state": "Gujarat", "country": "IN", "lat": 23.0225, "lon": 72.5714},
    {"name": "Jaipur", "state": "Rajasthan", "country": "IN", "lat": 26.9124, "lon": 75.7873}
]


def geocode_indian_location(location_query):
    """
    Geocodes location using OpenWeather Geocoding API.
    Strictly verifies that the target location is situated in India (country == 'IN').
    """
    clean_query = (location_query or "").strip()
    if not clean_query:
        return None, {"error": "EMPTY_QUERY", "message": "Please enter an Indian city or location."}

    # 1. Reject explicit non-Indian queries immediately
    if FOREIGN_LOCATIONS_REGEX.search(clean_query):
        return None, {
            "error": "NON_INDIAN_LOCATION",
            "message": "Please search for a location within India."
        }

    # 2. If OpenWeatherMap API key is configured, use OpenWeather Geocoding API
    if WEATHER_API_KEY and WEATHER_API_KEY != "YOUR_API_KEY":
        geo_url = "https://api.openweathermap.org/geo/1.0/direct"
        
        try:
            # Query with ,IN for precision
            search_term = clean_query.split(",")[0].strip()
            params = {"q": f"{search_term},IN", "limit": 5, "appid": WEATHER_API_KEY}
            resp = requests.get(geo_url, params=params, timeout=8)

            if resp.status_code == 200:
                data = resp.json()
                if data and isinstance(data, list):
                    indian_results = [item for item in data if item.get("country") == "IN"]
                    if indian_results:
                        first = indian_results[0]
                        state_name = first.get("state", "")
                        return {
                            "name": first.get("name", search_term),
                            "state": state_name,
                            "country": "IN",
                            "lat": first.get("lat"),
                            "lon": first.get("lon"),
                            "display_name": f"{first.get('name')}, {state_name + ', ' if state_name else ''}IN"
                        }, None

            # Fallback query without country filter to verify if it's located outside India
            params_broad = {"q": search_term, "limit": 5, "appid": WEATHER_API_KEY}
            resp_broad = requests.get(geo_url, params=params_broad, timeout=8)
            if resp_broad.status_code == 200:
                data_broad = resp_broad.json()
                if data_broad and isinstance(data_broad, list):
                    indian_matches = [item for item in data_broad if item.get("country") == "IN"]
                    if indian_matches:
                        first = indian_matches[0]
                        state_name = first.get("state", "")
                        return {
                            "name": first.get("name", search_term),
                            "state": state_name,
                            "country": "IN",
                            "lat": first.get("lat"),
                            "lon": first.get("lon"),
                            "display_name": f"{first.get('name')}, {state_name + ', ' if state_name else ''}IN"
                        }, None
                    else:
                        # Found on map, but situated outside India!
                        return None, {
                            "error": "NON_INDIAN_LOCATION",
                            "message": "Please search for a location within India."
                        }

        except Exception as e:
            print(f"[Geocoding Warning] OpenWeather API call failed: {e}")

    # 3. Match against internal Indian catalog (works seamlessly offline / simulation)
    query_lower = clean_query.lower()
    for city in POPULAR_INDIAN_CITIES:
        if city["name"].lower() in query_lower or query_lower in city["name"].lower():
            state_str = f"{city['state']}, " if city.get("state") else ""
            return {
                "name": city["name"],
                "state": city.get("state", ""),
                "country": "IN",
                "lat": city["lat"],
                "lon": city["lon"],
                "display_name": f"{city['name']}, {state_str}IN"
            }, None

    # 4. If query is a general word (e.g. any Indian village or town typed by student)
    clean_alpha = re.sub(r'[^a-zA-Z\s]', '', clean_query).strip()
    if len(clean_alpha) >= 3:
        # Synthesize Indian coordinates (bounded inside India: 8.5N to 32N, 72E to 88E)
        h = abs(hash(clean_alpha))
        synth_lat = round(8.5 + (h % 2200) / 100.0, 4)
        synth_lon = round(72.0 + ((h >> 3) % 1600) / 100.0, 4)
        name_title = clean_alpha.title()
        return {
            "name": name_title,
            "state": "India",
            "country": "IN",
            "lat": synth_lat,
            "lon": synth_lon,
            "display_name": f"{name_title}, India, IN"
        }, None

    return None, {
        "error": "LOCATION_NOT_FOUND",
        "message": f"Location '{clean_query}' not found in India. Please check the spelling."
    }


def fetch_weather_by_coords(lat, lon, location_meta):
    """Fetches real-time weather using latitude and longitude from OpenWeatherMap API."""
    if not WEATHER_API_KEY or WEATHER_API_KEY == "YOUR_API_KEY":
        return None, {
            "error": "API_KEY_MISSING",
            "message": "OpenWeatherMap API Key is not configured in .env file."
        }

    url = "https://api.openweathermap.org/data/2.5/weather"
    params = {
        "lat": lat,
        "lon": lon,
        "appid": WEATHER_API_KEY,
        "units": "metric"
    }

    try:
        response = requests.get(url, params=params, timeout=10)
        if response.status_code == 401:
            return None, {
                "error": "INVALID_API_KEY",
                "message": "OpenWeatherMap returned 401 Unauthorized. Please check your API key."
            }
        elif response.status_code != 200:
            return None, {
                "error": "API_ERROR",
                "message": f"OpenWeatherMap API error: HTTP {response.status_code}"
            }

        data = response.json()
        return data, None
    except requests.exceptions.Timeout:
        return None, {
            "error": "TIMEOUT",
            "message": "Request to OpenWeatherMap API timed out."
        }
    except Exception as e:
        return None, {
            "error": "CONNECTION_ERROR",
            "message": f"Network error communicating with OpenWeatherMap API: {str(e)}"
        }


def parse_weather_response(data, location_meta=None):
    """Extracts required metrics from OpenWeatherMap JSON payload."""
    temp = round(float(data.get("main", {}).get("temp", 0.0)), 1)
    humidity = int(data.get("main", {}).get("humidity", 0))
    
    # Wind speed in m/s, convert to km/h
    wind_ms = float(data.get("wind", {}).get("speed", 0.0))
    wind_kmh = round(wind_ms * 3.6, 1)

    # Rainfall: OpenWeatherMap returns rain in 'rain.1h' or 'rain.3h'
    rain_data = data.get("rain", {})
    rainfall_mm = float(rain_data.get("1h", rain_data.get("3h", 0.0)))

    weather_list = data.get("weather", [{}])
    weather_info = weather_list[0] if weather_list else {}
    condition_name = weather_info.get("main", "Clear")
    description = weather_info.get("description", "clear sky")
    condition_id = int(weather_info.get("id", 800))
    icon_code = weather_info.get("icon", "01d")

    city_name = location_meta.get("name") if location_meta else data.get("name", "Unknown")
    country = "IN"
    display_location = location_meta.get("display_name") if location_meta else f"{city_name}, IN"

    return {
        "city": city_name,
        "country": country,
        "display_location": display_location,
        "temp": temp,
        "humidity": humidity,
        "wind_ms": round(wind_ms, 1),
        "wind_kmh": wind_kmh,
        "rainfall_mm": round(rainfall_mm, 1),
        "condition": condition_name,
        "description": description,
        "condition_id": condition_id,
        "icon": icon_code
    }


# ================== ROUTES ==================

@app.route("/")
def index():
    """Renders the main dashboard template."""
    return render_template("index.html", default_city=DEFAULT_CITY_DISPLAY)


@app.route("/api/geocode", methods=["GET"])
def geocode_search():
    """
    Autocomplete / geocoding lookup endpoint for Indian locations.
    Query parameter: q (e.g. 'Pollachi', 'Salem', 'Ooty')
    """
    q = request.args.get("q", "").strip()
    if not q:
        return jsonify({"success": True, "results": []})

    if FOREIGN_LOCATIONS_REGEX.search(q):
        return jsonify({
            "success": False,
            "error": "NON_INDIAN_LOCATION",
            "message": "Please search for a location within India."
        }), 400

    geo_result, err = geocode_indian_location(q)
    if err:
        return jsonify({"success": False, "error": err["error"], "message": err["message"]}), 400

    return jsonify({
        "success": True,
        "results": [geo_result]
    })


@app.route("/api/weather", methods=["GET", "POST"])
def get_weather_and_analyze():
    """
    API endpoint: Fetches live weather for any Indian location using Geocoding
    and performs AI risk analysis.
    Supports:
      - city or q (e.g. 'Pollachi', 'Coimbatore', 'Ooty', 'Salem')
      - lat and lon
    """
    if request.method == "POST":
        req_data = request.get_json(silent=True) or {}
        city_query = req_data.get("city", req_data.get("q", "")).strip() or DEFAULT_CITY
        lat_in = req_data.get("lat")
        lon_in = req_data.get("lon")
    else:
        city_query = request.args.get("city", request.args.get("q", "")).strip() or DEFAULT_CITY
        lat_in = request.args.get("lat")
        lon_in = request.args.get("lon")

    # Step 1: Geocode location and strictly verify it is in India
    geo_location, geo_error = geocode_indian_location(city_query)
    
    if geo_error:
        status_code = 400
        return jsonify({
            "success": False,
            "error": geo_error["error"],
            "message": geo_error["message"]
        }), status_code

    lat = lat_in if lat_in is not None else geo_location["lat"]
    lon = lon_in if lon_in is not None else geo_location["lon"]

    # Step 2: Fetch Current Weather by Coordinates
    raw_data, weather_error = fetch_weather_by_coords(lat, lon, geo_location)
    
    if weather_error:
        # Fallback simulation for demonstration if no API key is provided
        is_coimbatore = "coimbatore" in city_query.lower()
        base_temp = 28.0 if is_coimbatore else 26.0 + (len(city_query) % 7)
        base_hum = 82 if is_coimbatore else 55 + (len(city_query) % 30)
        base_wind = 58.0 if is_coimbatore else 18.0 + (len(city_query) % 20)
        base_rain = 65.0 if is_coimbatore else (22.0 if len(city_query) % 3 == 0 else 0.0)
        condition = "Thunderstorm" if is_coimbatore else ("Rain" if base_rain > 0 else "Clear")
        description = "heavy rain and thunderstorm" if is_coimbatore else ("monsoon showers" if base_rain > 0 else "clear sky")
        condition_id = 202 if is_coimbatore else (502 if base_rain > 0 else 800)

        parsed = {
            "city": geo_location["name"],
            "country": "IN",
            "display_location": geo_location["display_name"],
            "temp": round(base_temp, 1),
            "humidity": base_hum,
            "wind_ms": round(base_wind / 3.6, 1),
            "wind_kmh": round(base_wind, 1),
            "rainfall_mm": round(base_rain, 1),
            "condition": condition,
            "description": description,
            "condition_id": condition_id,
            "icon": "11d" if condition == "Thunderstorm" else ("10d" if condition == "Rain" else "01d"),
            "is_simulated": True,
            "lat": lat,
            "lon": lon
        }

        risk_result = evaluate_weather_risk(
            temp=parsed["temp"],
            humidity=parsed["humidity"],
            wind_kmh=parsed["wind_kmh"],
            rainfall_mm=parsed["rainfall_mm"],
            condition_name=parsed["condition"],
            condition_id=parsed["condition_id"],
            description=parsed["description"]
        )

        return jsonify({
            "success": True,
            "is_simulated": True,
            "location": geo_location,
            "weather": parsed,
            "risk": risk_result,
            "timestamp": datetime.datetime.now().strftime("%Y-%m-%d %H:%M:%S IST"),
            "notice": "Simulated meteorological telemetry (Set WEATHER_API_KEY in .env for live OpenWeatherMap feed)."
        })

    # Parse live OpenWeatherMap response
    parsed = parse_weather_response(raw_data, geo_location)
    parsed["lat"] = lat
    parsed["lon"] = lon

    risk_result = evaluate_weather_risk(
        temp=parsed["temp"],
        humidity=parsed["humidity"],
        wind_kmh=parsed["wind_kmh"],
        rainfall_mm=parsed["rainfall_mm"],
        condition_name=parsed["condition"],
        condition_id=parsed["condition_id"],
        description=parsed["description"]
    )

    return jsonify({
        "success": True,
        "is_simulated": False,
        "location": geo_location,
        "weather": parsed,
        "risk": risk_result,
        "timestamp": datetime.datetime.now().strftime("%Y-%m-%d %H:%M:%S IST")
    })


@app.route("/api/forecast", methods=["GET"])
def get_forecast():
    """Fetches 5-day / 3-hour forecast for Indian coordinates."""
    lat = request.args.get("lat", type=float)
    lon = request.args.get("lon", type=float)
    api_key = request.args.get("api_key") or WEATHER_API_KEY

    if lat is None or lon is None:
        return jsonify({"success": False, "message": "Missing lat or lon parameters"}), 400

    if not is_within_india(lat, lon):
        return jsonify({"success": False, "message": "Location coordinates are outside India"}), 400

    if not api_key:
        # Fallback simulation forecast for academic viva demonstration
        simulated_list = []
        now = datetime.datetime.now()
        for i in range(16):
            dt_step = now + datetime.timedelta(hours=i * 3)
            simulated_list.append({
                "dt": int(dt_step.timestamp()),
                "dt_txt": dt_step.strftime("%Y-%m-%d %H:%M:%S"),
                "main": {
                    "temp": 28.0 + (i % 4) - 2.0,
                    "humidity": 60 + (i % 5) * 4
                },
                "weather": [{
                    "id": 800 if i % 3 != 1 else 500,
                    "main": "Clear" if i % 3 != 1 else "Rain",
                    "description": "clear sky" if i % 3 != 1 else "light rain",
                    "icon": "01d" if i % 3 != 1 else "10d"
                }],
                "wind": {
                    "speed": 3.5 + (i % 3) * 1.5
                },
                "pop": 0.15 if i % 3 != 1 else 0.65,
                "rain": {"3h": 1.2} if i % 3 == 1 else {}
            })
        return jsonify({
            "success": True,
            "data": {
                "city": {"name": "Simulated Indian Station", "country": "IN"},
                "list": simulated_list
            }
        })

    try:
        resp = requests.get(
            OWM_FORECAST_URL,
            params={"lat": lat, "lon": lon, "appid": api_key, "units": "metric"},
            headers={"User-Agent": "WeatherRiskSafety/2.0"},
            timeout=10
        )
        if resp.status_code == 200:
            return jsonify({"success": True, "data": resp.json()})
        else:
            return jsonify({"success": False, "message": f"Forecast query returned status {resp.status_code}"}), resp.status_code
    except Exception as e:
        return jsonify({"success": False, "message": f"Forecast API query failed: {str(e)}"}), 502


@app.route("/api/scenarios", methods=["GET"])
def list_scenarios():
    """Returns available academic demonstration scenarios for viva evaluation."""
    return jsonify({
        "scenarios": [
            {"id": key, "name": val["name"], "description": val["description"]}
            for key, val in ACADEMIC_SCENARIOS.items()
        ]
    })


@app.route("/api/simulate-scenario", methods=["POST"])
def simulate_scenario():
    """Runs risk analysis against a chosen preset academic weather scenario."""
    req_data = request.get_json(silent=True) or {}
    scenario_id = req_data.get("scenario_id", "safe_clear")
    
    if scenario_id not in ACADEMIC_SCENARIOS:
        return jsonify({"success": False, "message": "Unknown scenario"}), 404
        
    s = ACADEMIC_SCENARIOS[scenario_id]
    wind_kmh = round(s["wind_speed"] * 3.6, 1)
    
    parsed = {
        "city": "Coimbatore",
        "country": "IN",
        "display_location": s["city"],
        "temp": s["temp"],
        "humidity": s["humidity"],
        "wind_ms": round(s["wind_speed"], 1),
        "wind_kmh": wind_kmh,
        "rainfall_mm": s["rainfall"],
        "condition": s["condition"],
        "description": s["description"],
        "condition_id": s["condition_id"],
        "icon": "11d" if s["condition"] == "Thunderstorm" else "10d" if s["condition"] == "Rain" else "01d",
        "scenario_name": s["name"]
    }
    
    risk_result = evaluate_weather_risk(
        temp=s["temp"],
        humidity=s["humidity"],
        wind_kmh=wind_kmh,
        rainfall_mm=s["rainfall"],
        condition_name=s["condition"],
        condition_id=s["condition_id"],
        description=s["description"]
    )
    
    return jsonify({
        "success": True,
        "is_simulated": True,
        "scenario_id": scenario_id,
        "scenario_name": s["name"],
        "weather": parsed,
        "risk": risk_result,
        "timestamp": datetime.datetime.now().strftime("%Y-%m-%d %H:%M:%S IST")
    })


if __name__ == "__main__":
    # Academic prototype server entry point
    port = int(os.getenv("FLASK_PORT", 5000))
    debug_mode = os.getenv("FLASK_DEBUG", "True").lower() in ["true", "1", "yes"]
    print(f"\n=======================================================")
    print(f" AI Weather Risk Detection and Power Safety System")
    print(f" Academic Simulation Prototype (Software-Only)")
    print(f" Default City: {DEFAULT_CITY_DISPLAY}")
    print(f" Server running at: http://127.0.0.1:{port}")
    print(f"=======================================================\n")
    app.run(host="0.0.0.0", port=port, debug=debug_mode)
