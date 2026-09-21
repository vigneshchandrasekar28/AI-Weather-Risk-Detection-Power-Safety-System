# AI Weather Risk Detection and Power Safety System

An academic software prototype that monitors meteorological conditions in real-time via OpenWeatherMap API, analyzes multi-parameter disaster risks with a transparent rule-based AI engine, and generates simulated electrical grid safety recommendations (**POWER ON** / **POWER OFF**).

> ⚠️ **ACADEMIC SAFETY DISCLAIMER & SCOPE LIMITATION**
> **This is a SOFTWARE-ONLY prototype built strictly for college project demonstration and evaluation.**
> It does **NOT** control real electrical mains power, physical circuit breakers, relays, or high-voltage hardware. All "POWER ON" and "POWER OFF" signals are simulated advisory recommendations displayed on screen.

---

## 1. Problem Statement

Severe weather phenomena such as thunderstorms, lightning surges, gale-force cyclonic winds, and torrential urban downpours account for extensive power grid infrastructure damage, transformer explosions, short-circuits, and life-threatening electrical hazards. Traditional power distribution operations often rely on manual interventions or post-fault circuit tripping after physical damage has already occurred. There is an academic need for automated, proactive meteorological risk assessment systems that predict electrical infrastructure vulnerability before faults happen.

---

## 2. Project Objective

- Fetch live meteorological data for any target city (default: **Coimbatore, Tamil Nadu, India**) using OpenWeatherMap API.
- Compute an explainable, multi-factor meteorological risk score ($0 - 100$) using a transparent rule-based AI decision engine.
- Categorize risk levels into **LOW**, **MEDIUM**, and **HIGH**.
- Provide automated simulated power grid recommendations:
  - **LOW / MEDIUM RISK** $\rightarrow$ **POWER ON** (safe distribution permitted with continuous telemetry).
  - **HIGH RISK** $\rightarrow$ **POWER OFF** (simulated emergency isolation recommendation to avert surges and accidents).
- Deliver an intuitive, responsive web dashboard with live cards, a visual risk score gauge, auto-refresh capabilities, and pre-configured academic evaluation scenarios for college viva testing.

---

## 3. Key Features

- **Live Weather Integration**: Real-time retrieval of ambient temperature, precipitation rate, wind velocity, atmospheric humidity, and weather classification codes.
- **Rule-Based AI Engine**: Transparent, auditable rule matrix assessing precipitation thresholds, gale gusts, thunderstorm classifications, and relative humidity saturation.
- **Explainable Reasoning**: Detailed bullet-point diagnostic explanation justifying why a specific risk score and power status were recommended.
- **Simulated Power Recommendation**: Prominent visual state banner showing simulated **POWER ON** or **POWER OFF** status.
- **College Viva Simulation Presets**: Built-in test scenarios (Fair Weather, Monsoon Rain, Severe Thunderstorm, Cyclone Gale, Urban Flood Downpour) allowing examiners to test both LOW, MEDIUM, and HIGH states immediately even without stormy conditions outside.
- **Auto-Refresh Simulation**: Optional periodic timer (30s) automatically checking the latest weather updates.
- **Secure Architecture**: API keys stored strictly in `.env` and loaded securely via `python-dotenv`.

---

## 4. System Architecture & Workflow

```
               +-----------------------------------+
               |       OpenWeatherMap API          |
               +-----------------+-----------------+
                                 |
                                 | JSON Payload (temp, rain, wind, condition, humidity)
                                 v
               +-----------------+-----------------+
               |        Flask Backend (app.py)     |
               |       (python-dotenv & requests)  |
               +-----------------+-----------------+
                                 |
                                 v
               +-----------------------------------+
               |    Transparent Rule-Based AI      |
               |         Risk Engine               |
               |                                   |
               |  - Rainfall Risk (0 - 40 pts)     |
               |  - Wind Speed Risk (0 - 38 pts)   |
               |  - Thunder/Lightning (0 - 42 pts) |
               |  - Moisture/Humidity (0 - 8 pts)  |
               +-----------------+-----------------+
                                 |
                                 v
               +-----------------+-----------------+
               |    Risk Score Calculation (0-100) |
               |                                   |
               |    0 - 29   : LOW                 |
               |    30 - 59  : MEDIUM              |
               |    60 - 100 : HIGH                |
               +-----------------+-----------------+
                                 |
                                 v
        +------------------------+------------------------+
        |                                                 |
        v (Score 0-59)                                    v (Score 60-100)
+---------------+----------------+       +----------------+---------------+
|     Simulated Recommendation   |       |     Simulated Recommendation   |
|            POWER ON            |       |            POWER OFF           |
| (Normal/Monitored Distribution)|       | (Simulated Protective Isolation|
+---------------+----------------+       +----------------+---------------+
        |                                                 |
        +------------------------+------------------------+
                                 |
                                 v
               +-----------------+-----------------+
               |      Modern Web Dashboard         |
               |     (HTML5, CSS3, JavaScript)     |
               |                                   |
               |  - Real-Time Weather Cards        |
               |  - Risk Progress Meter            |
               |  - Itemized Reason Breakdown      |
               |  - Viva Scenario Switcher         |
               +-----------------------------------+
```

---

## 5. Technologies Used

| Technology | Purpose |
| :--- | :--- |
| **Python 3** | Core backend language |
| **Flask (3.0.3)** | Lightweight WSGI web framework and REST API |
| **python-dotenv** | Environment variable management for API key security |
| **requests** | HTTP library for calling OpenWeatherMap API |
| **HTML5 & CSS3** | Modern semantic structure and responsive dashboard layout |
| **JavaScript (ES6+)** | Dynamic DOM updates, asynchronous fetch calls, and countdown timer |
| **OpenWeatherMap API**| Meteorological telemetry data provider |

---

## 6. Project Structure

```
AI-Power-System/
│
├── app.py                  # Main Flask application and AI rule engine
├── requirements.txt        # Python package dependencies
├── .env.example            # Sample environment variables template
├── .gitignore              # Ignores .env, bytecode, and virtual environments
├── README.md               # Complete academic documentation
│
├── templates/
│   └── index.html          # Main web dashboard interface
│
└── static/
    ├── style.css           # Styling, typography, and responsive layout
    └── script.js           # Client-side controller, API fetch, and scenarios
```

---

## 7. Prerequisites & Installation Steps

### Step 1: Open Terminal & Navigate to Project Directory
Open your terminal or command prompt and change directory to `AI-Power-System`:

```bash
cd AI-Power-System
```

### Step 2: Create a Python Virtual Environment
Creating a virtual environment ensures isolated dependencies:

**On Windows (Command Prompt / PowerShell):**
```bash
python -m venv venv
venv\Scripts\activate
```

**On macOS / Linux:**
```bash
python3 -m venv venv
source venv/bin/activate
```

### Step 3: Install Required Dependencies
Install the required packages using pip:
```bash
pip install -r requirements.txt
```

---

## 8. OpenWeatherMap API Key Setup

1. Go to [https://openweathermap.org/api](https://openweathermap.org/api) and sign up for a free account.
2. Navigate to **My API Keys** in your profile dashboard and generate a free API key.
3. Copy `.env.example` to `.env`:
   ```bash
   cp .env.example .env
   ```
4. Open `.env` in any text editor and replace `YOUR_API_KEY` with your actual key:
   ```env
   WEATHER_API_KEY=your_actual_api_key_here
   FLASK_PORT=5000
   FLASK_DEBUG=True
   ```
5. Save the file.
*(Note: Newly registered OpenWeatherMap keys typically take 10 to 30 minutes to activate globally).*

---

## 9. How to Run the Application

With your virtual environment activated, run:

```bash
python app.py
```

You should see output similar to:
```
=======================================================
 AI Weather Risk Detection and Power Safety System
 Academic Simulation Prototype (Software-Only)
 Default City: Coimbatore, Tamil Nadu, India
 Server running at: http://127.0.0.1:5000
=======================================================
```

Open your web browser and navigate to:
```
http://127.0.0.1:5000
```

---

## 10. How to Test the Project (Step-by-Step)

1. **Verify Default City**: Upon loading, the system automatically queries **Coimbatore, Tamil Nadu, India** and renders the ambient temperature, humidity, rainfall, and wind velocity.
2. **Search Other Locations**: Type any city name (e.g. `Chennai`, `Mumbai`, `Delhi`, `London`) in the input box and click **Check Weather & Analyze Risk**.
3. **Simulate Academic Test Scenarios (Recommended for College Viva)**:
   - Click **☀️ Fair Weather**: Demonstrates **LOW Risk (< 30)** and **POWER ON** recommendation.
   - Click **🌧️ Monsoon Rain**: Demonstrates **MEDIUM Risk (30 - 59)** with cautionary monitoring and **POWER ON**.
   - Click **⛈️ Thunderstorm**: Demonstrates **HIGH Risk (60 - 100)** triggering **POWER OFF** recommendation with lightning surge warnings.
   - Click **🌪️ Cyclone Gale**: Demonstrates **HIGH Risk** with power line snapping hazards.
   - Click **🌊 Downpour**: Demonstrates **HIGH Risk** with substation water ingress warnings.
4. **Test Auto-Refresh**: Enable the **Auto-Refresh Simulation** toggle to observe the 30-second countdown and automated polling.
5. **Inspect Error Handling**:
   - Search for a non-existent city (e.g. `InvalidCityXYZ123`) to see the graceful 404 alert.
   - Remove or misconfigure the API key to see the friendly diagnostic alert offering automatic fallback simulation.

---

## 11. Example Output

### Scenario: Severe Thunderstorm in Coimbatore
- **Location**: Coimbatore, Tamil Nadu, India
- **Temperature**: 22.0 °C
- **Precipitation**: 22.5 mm/hr
- **Wind Speed**: 63.0 km/h (17.5 m/s)
- **Relative Humidity**: 94%
- **Condition**: Severe Thunderstorm (Code 212)
- **Calculated Risk Index**: **84 / 100**
- **Risk Level**: **HIGH RISK**
- **Simulated Recommendation**: **POWER OFF**
- **Rule Engine Diagnostic Reasoning**:
  - *Thunderstorm & active lightning hazard detected (Severe thunderstorm with frequent lightning); critical surge risk for transformers.*
  - *Gale-force winds (63.0 km/h); high mechanical strain on distribution poles and conductors.*
  - *Heavy rainfall (22.5 mm) recorded; high moisture infiltration risk.*
  - *Near-saturated relative humidity (94%) in conjunction with precipitation exacerbates insulator flashover.*

---

## 12. Future Enhancements

- **Machine Learning Integration**: Upgrade rule-based scoring with historical outage datasets using Random Forest or XGBoost classifiers.
- **Geographic Information Systems (GIS)**: Implement interactive Leaflet.js / OpenLayers maps displaying feeder-line hazard zones.
- **IoT Supervisory Telemetry**: Interface with ESP32 microcontrollers measuring local barometric pressure and wind anemometers for localized edge computing.
- **Automated SMS / Telegram Alerts**: Integrate Twilio or Telegram Bot API to broadcast power cut advisories to consumers before storms hit.

---

## 13. License & Academic Integrity

This project is submitted for academic demonstration and degree evaluation purposes. All code is distributed under the MIT License for educational usage.
