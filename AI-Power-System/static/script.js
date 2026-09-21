/**
 * AI POWER SAFETY - Client-Side Controller
 * Dynamic Live Weather Data Polling, Rule Engine Evaluation & Auto Monitoring
 */

document.addEventListener("DOMContentLoaded", () => {
  // DOM Elements - Location & Search
  const cityInput = document.getElementById("cityInput");
  const clearCityBtn = document.getElementById("clearCityBtn");
  const weatherSearchForm = document.getElementById("weatherSearchForm");
  const checkWeatherBtn = document.getElementById("checkWeatherBtn");
  const locationDisplay = document.getElementById("locationDisplay");
  const scenarioChips = document.querySelectorAll(".scenario-chip");

  // DOM Elements - Weather Cards
  const tempValue = document.getElementById("tempValue");
  const tempSubtext = document.getElementById("tempSubtext");
  const rainValue = document.getElementById("rainValue");
  const rainSubtext = document.getElementById("rainSubtext");
  const windValue = document.getElementById("windValue");
  const windSubtext = document.getElementById("windSubtext");
  const humidityValue = document.getElementById("humidityValue");
  const humiditySubtext = document.getElementById("humiditySubtext");
  const weatherConditionValue = document.getElementById("weatherConditionValue");
  const weatherIconSymbol = document.getElementById("weatherIconSymbol");
  const weatherDescriptionSubtext = document.getElementById("weatherDescriptionSubtext");

  // DOM Elements - Power Safety Recommendation
  const powerRecommendationCard = document.getElementById("powerRecommendationCard");
  const powerStatusSymbol = document.getElementById("powerStatusSymbol");
  const powerStatusText = document.getElementById("powerStatusText");
  const powerReasonText = document.getElementById("powerReasonText");

  // DOM Elements - AI Risk Analysis
  const riskLevelBadge = document.getElementById("riskLevelBadge");
  const riskScoreValue = document.getElementById("riskScoreValue");
  const gaugeBarFill = document.getElementById("gaugeBarFill");
  const factorRain = document.getElementById("factorRain");
  const factorWind = document.getElementById("factorWind");
  const factorThunder = document.getElementById("factorThunder");
  const aiExplanationText = document.getElementById("aiExplanationText");

  // DOM Elements - Operations (Status, Auto Monitoring, History)
  const statusApi = document.getElementById("statusApi");
  const autoMonitorToggle = document.getElementById("autoMonitorToggle");
  const monitorStatusDesc = document.getElementById("monitorStatusDesc");
  const lastUpdatedTimestamp = document.getElementById("lastUpdatedTimestamp");
  const countdownBarWrap = document.getElementById("countdownBarWrap");
  const countdownLabel = document.getElementById("countdownLabel");
  const countdownFill = document.getElementById("countdownFill");
  const riskHistoryList = document.getElementById("riskHistoryList");

  // Alert Banner
  const statusAlert = document.getElementById("statusAlert");
  const alertMessage = document.getElementById("alertMessage");
  const closeAlertBtn = document.getElementById("closeAlertBtn");

  // State
  let countdownTimer = null;
  let countdownSeconds = 30;
  const historyRecords = [
    { time: "10:00", score: 35 },
    { time: "10:05", score: 42 },
    { time: "10:10", score: 55 },
    { time: "10:15", score: 72 }
  ];

  function showAlert(message, isError = false) {
    if (!statusAlert) return;
    alertMessage.textContent = message;
    statusAlert.className = isError ? "alert-banner error" : "alert-banner";
    statusAlert.classList.remove("hidden");
  }

  function hideAlert() {
    if (statusAlert) statusAlert.classList.add("hidden");
  }

  if (closeAlertBtn) {
    closeAlertBtn.addEventListener("click", hideAlert);
  }

  function formatCurrentTime() {
    const now = new Date();
    return now.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  }

  // Render Risk History Bars
  function renderHistory() {
    if (!riskHistoryList) return;
    riskHistoryList.innerHTML = "";
    
    // Show up to 4 most recent records
    const recent = historyRecords.slice(-4);
    recent.forEach((rec, idx) => {
      const isLatest = idx === recent.length - 1;
      let barClass = "bar-low";
      if (rec.score >= 60) barClass = "bar-high";
      else if (rec.score >= 30) barClass = "bar-med";

      const item = document.createElement("div");
      item.className = `history-item ${isLatest ? "active-history" : ""}`;
      item.innerHTML = `
        <span class="history-time">${rec.time}</span>
        <div class="history-bar-track">
          <div class="history-bar-fill ${barClass}" style="width: ${Math.min(100, Math.max(5, rec.score))}%;"></div>
        </div>
        <span class="history-val ${isLatest ? "font-bold" : ""}">${rec.score}</span>
      `;
      riskHistoryList.appendChild(item);
    });
  }

  // Update UI with incoming data
  function updateDashboard(data) {
    const weather = data.weather;
    const risk = data.risk;
    const isPowerOff = risk.recommendation === "POWER OFF" || risk.score >= 60;

    // 1. Update Location Display
    if (locationDisplay) {
      locationDisplay.textContent = weather.display_location || weather.city || cityInput.value || "Coimbatore, Tamil Nadu";
    }

    // 2. Update Live Weather Cards
    if (tempValue) tempValue.textContent = Number(weather.temp).toFixed(0);
    if (tempSubtext) {
      tempSubtext.textContent = weather.temp > 35 ? "Elevated ambient transformer thermal stress" : "Nominal Substation Thermal Range";
    }

    const rainMm = Number(weather.rainfall_mm || 0);
    if (rainValue) rainValue.textContent = rainMm.toFixed(1);
    if (rainSubtext) {
      if (rainMm >= 25) rainSubtext.textContent = "Torrential Downpour / Substation Flood Threat";
      else if (rainMm >= 10) rainSubtext.textContent = "Heavy Precipitation Accumulation Rate";
      else if (rainMm > 0) rainSubtext.textContent = "Light to Moderate Rainfall";
      else rainSubtext.textContent = "Precipitation Accumulation Rate (Dry)";
    }

    const windKmh = Number(weather.wind_kmh || 0);
    if (windValue) windValue.textContent = windKmh.toFixed(0);
    if (windSubtext) {
      if (windKmh >= 60) windSubtext.textContent = "Severe Wind Gale (Downed Conductor Threat)";
      else if (windKmh >= 40) windSubtext.textContent = "High Mechanical Strain on Feeder Lines";
      else windSubtext.textContent = "Distribution Line Strain Watch (Normal)";
    }

    if (humidityValue) humidityValue.textContent = Math.round(weather.humidity);
    if (humiditySubtext) {
      humiditySubtext.textContent = weather.humidity > 85 ? "High moisture; watch insulator surface tracking" : "Insulator Dielectric Margin";
    }

    if (weatherConditionValue) {
      weatherConditionValue.textContent = weather.description || weather.condition || "Clear";
    }
    if (weatherDescriptionSubtext) {
      weatherDescriptionSubtext.textContent = `Classification: ${weather.condition || "Nominal"}`;
    }

    // Dynamic Weather Icon
    if (weatherIconSymbol) {
      const cond = (weather.condition || "").toLowerCase();
      const desc = (weather.description || "").toLowerCase();
      if (cond.includes("thunder") || desc.includes("thunder") || desc.includes("lightning")) {
        weatherIconSymbol.textContent = "⛈";
      } else if (cond.includes("rain") || desc.includes("rain") || desc.includes("drizzle")) {
        weatherIconSymbol.textContent = "🌧";
      } else if (cond.includes("wind") || cond.includes("squall") || desc.includes("gale")) {
        weatherIconSymbol.textContent = "💨";
      } else if (cond.includes("cloud") || desc.includes("cloud")) {
        weatherIconSymbol.textContent = "⛅";
      } else {
        weatherIconSymbol.textContent = "☀️";
      }
    }

    // 3. Update AI Risk Analysis
    const score = Math.max(0, Math.min(100, Math.round(risk.score)));
    if (riskScoreValue) riskScoreValue.textContent = score;

    const level = (risk.level || "LOW").toUpperCase();
    if (riskLevelBadge) {
      riskLevelBadge.textContent = level;
      riskLevelBadge.className = `risk-level-badge level-${level.toLowerCase()}`;
    }

    if (gaugeBarFill) {
      gaugeBarFill.style.width = `${Math.max(4, score)}%`;
      gaugeBarFill.className = `gauge-bar-fill fill-${level.toLowerCase()}`;
    }

    // Update Risk Factors
    if (factorRain) {
      if (rainMm >= 25) {
        factorRain.textContent = "HIGH";
        factorRain.className = "factor-severity severity-high";
      } else if (rainMm >= 8) {
        factorRain.textContent = "MODERATE";
        factorRain.className = "factor-severity severity-med";
      } else {
        factorRain.textContent = "LOW";
        factorRain.className = "factor-severity severity-low";
      }
    }

    if (factorWind) {
      if (windKmh >= 50) {
        factorWind.textContent = "HIGH";
        factorWind.className = "factor-severity severity-high";
      } else if (windKmh >= 30) {
        factorWind.textContent = "MODERATE";
        factorWind.className = "factor-severity severity-med";
      } else {
        factorWind.textContent = "LOW";
        factorWind.className = "factor-severity severity-low";
      }
    }

    if (factorThunder) {
      const cond = (weather.condition || "").toLowerCase();
      const desc = (weather.description || "").toLowerCase();
      const isThunder = cond.includes("thunder") || desc.includes("thunder") || desc.includes("lightning");
      if (isThunder) {
        factorThunder.textContent = "DETECTED";
        factorThunder.className = "factor-severity severity-high";
      } else {
        factorThunder.textContent = "NOT DETECTED";
        factorThunder.className = "factor-severity severity-none";
      }
    }

    // Dynamic Explanation
    if (aiExplanationText) {
      if (risk.reasons && risk.reasons.length > 0) {
        aiExplanationText.textContent = risk.reasons.join(" ");
      } else if (isPowerOff) {
        aiExplanationText.textContent = "Heavy rainfall and strong wind are contributing to the current weather risk.";
      } else {
        aiExplanationText.textContent = "Weather conditions are currently safe. All telemetry metrics remain inside operating margins.";
      }
    }

    // 4. Update Power Safety Recommendation
    if (powerRecommendationCard) {
      if (isPowerOff) {
        powerRecommendationCard.className = "power-recommendation-card state-power-off";
        if (powerStatusSymbol) powerStatusSymbol.textContent = "🛑";
        if (powerStatusText) powerStatusText.textContent = "POWER OFF";
        if (powerReasonText) {
          powerReasonText.textContent = '"High weather risk detected. Feeder lines simulated disconnect recommended."';
        }
      } else {
        powerRecommendationCard.className = "power-recommendation-card state-power-on";
        if (powerStatusSymbol) powerStatusSymbol.textContent = "⚡";
        if (powerStatusText) powerStatusText.textContent = "POWER ON";
        if (powerReasonText) {
          powerReasonText.textContent = '"Weather conditions are currently safe."';
        }
      }
    }

    // 5. Update Status & Timestamp
    const formattedTime = formatCurrentTime();
    if (lastUpdatedTimestamp) {
      lastUpdatedTimestamp.textContent = `Last updated: ${formattedTime}`;
    }

    // 6. Record to History
    historyRecords.push({ time: formattedTime, score });
    if (historyRecords.length > 8) historyRecords.shift();
    renderHistory();
  }

  // Fetch live weather data from Flask API
  async function fetchWeather(city = "") {
    const targetCity = city.trim() || cityInput.value.trim() || "Coimbatore, Tamil Nadu";
    hideAlert();
    
    if (checkWeatherBtn) {
      checkWeatherBtn.disabled = true;
      checkWeatherBtn.innerHTML = '<span class="btn-icon">⏳</span> Checking...';
    }

    try {
      const response = await fetch(`/api/weather?city=${encodeURIComponent(targetCity)}`);
      const data = await response.json();

      if (data.success && data.weather && data.risk) {
        updateDashboard(data);
        if (data.is_simulated) {
          showAlert("OpenWeatherMap live key inactive: Displaying simulated telemetry for demonstration.", false);
        }
      } else {
        showAlert(data.message || "Could not fetch weather data. Please verify city name.", true);
      }
    } catch (err) {
      console.warn("API request error, running local demonstration fallback:", err);
      // Fallback demonstration response to keep viva presentation smooth
      const fallback = createDemoData(targetCity);
      updateDashboard(fallback);
      showAlert(`Loaded demonstration data for ${targetCity}.`, false);
    } finally {
      if (checkWeatherBtn) {
        checkWeatherBtn.disabled = false;
        checkWeatherBtn.innerHTML = '<span class="btn-icon">🔍</span> Check Weather';
      }
    }
  }

  // Fallback demo dataset generator
  function createDemoData(city) {
    const isStorm = city.toLowerCase().includes("thunder") || city.toLowerCase().includes("storm");
    return {
      weather: {
        city: city.split(",")[0],
        display_location: city,
        temp: isStorm ? 22 : 28.5,
        rainfall_mm: isStorm ? 65 : 0.0,
        wind_kmh: isStorm ? 58 : 14.0,
        humidity: isStorm ? 88 : 56,
        condition: isStorm ? "Thunderstorm" : "Clear Sky",
        description: isStorm ? "heavy rain and thunderstorm" : "clear sky"
      },
      risk: {
        score: isStorm ? 78 : 14,
        level: isStorm ? "HIGH" : "LOW",
        recommendation: isStorm ? "POWER OFF" : "POWER ON",
        reasons: isStorm 
          ? ["Heavy rainfall and strong wind are contributing to the current weather risk.", "Active lightning surge hazard detected."]
          : ["Atmospheric parameters within safe grid distribution margins."]
      }
    };
  }

  // Quick Scenarios for College Viva Demonstration
  async function loadScenario(scenarioId) {
    hideAlert();
    try {
      const res = await fetch(`/api/simulate-scenario/${scenarioId}`);
      if (res.ok) {
        const data = await res.json();
        if (data.success) {
          updateDashboard(data);
          cityInput.value = data.weather.display_location || "Coimbatore, Tamil Nadu";
          showAlert(`Scenario Loaded: "${scenarioId.replace('_', ' ').toUpperCase()}"`, false);
          return;
        }
      }
    } catch (e) {
      // Offline / fallback scenario map
    }

    // Direct scenario mapping if API endpoint is unavailable
    const scenarioMap = {
      safe_clear: {
        weather: { display_location: "Coimbatore, Tamil Nadu", temp: 28, rainfall_mm: 0, wind_kmh: 12, humidity: 52, condition: "Clear", description: "clear sky" },
        risk: { score: 12, level: "LOW", recommendation: "POWER ON", reasons: ["Weather conditions are calm and optimal for power distribution."] }
      },
      monsoon_moderate: {
        weather: { display_location: "Coimbatore, Tamil Nadu", temp: 24, rainfall_mm: 8.5, wind_kmh: 32, humidity: 86, condition: "Rain", description: "moderate monsoon rain" },
        risk: { score: 44, level: "MEDIUM", recommendation: "POWER ON", reasons: ["Moderate monsoon precipitation. Power maintained with active supervisory alerts."] }
      },
      severe_thunderstorm: {
        weather: { display_location: "Coimbatore, Tamil Nadu", temp: 22, rainfall_mm: 65, wind_kmh: 58, humidity: 92, condition: "Thunderstorm", description: "severe thunderstorm & lightning" },
        risk: { score: 85, level: "HIGH", recommendation: "POWER OFF", reasons: ["Severe thunderstorm and high winds (58 km/h). Immediate feeder isolation recommended."] }
      },
      cyclone_gale: {
        weather: { display_location: "Coimbatore, Tamil Nadu", temp: 23, rainfall_mm: 35, wind_kmh: 75, humidity: 90, condition: "Squall", description: "cyclonic gale winds" },
        risk: { score: 88, level: "HIGH", recommendation: "POWER OFF", reasons: ["Destructive wind velocity (75 km/h) creates extreme probability of snapped overhead conductors."] }
      },
      flood_downpour: {
        weather: { display_location: "Coimbatore, Tamil Nadu", temp: 21, rainfall_mm: 85, wind_kmh: 42, humidity: 96, condition: "Rain", description: "torrential cloudburst" },
        risk: { score: 79, level: "HIGH", recommendation: "POWER OFF", reasons: ["Torrential cloudburst (85 mm). Critical flooding and water ingress threat at local distribution substations."] }
      }
    };

    if (scenarioMap[scenarioId]) {
      updateDashboard(scenarioMap[scenarioId]);
      cityInput.value = "Coimbatore, Tamil Nadu";
      showAlert(`Scenario Loaded: "${scenarioId.replace('_', ' ').toUpperCase()}"`, false);
    }
  }

  // Autocomplete and Suggestions Dropdown
  const geoSuggestionsList = document.getElementById("geoSuggestionsList");
  let suggestDebounce = null;

  async function fetchSuggestions(query) {
    if (!geoSuggestionsList) return;
    const clean = query.trim();
    if (clean.length < 2) {
      geoSuggestionsList.classList.add("hidden");
      geoSuggestionsList.innerHTML = "";
      return;
    }

    try {
      const res = await fetch(`/api/geocode?q=${encodeURIComponent(clean)}`);
      const data = await res.json();

      if (!data.success && data.error === "NON_INDIAN_LOCATION") {
        showAlert(data.message || "Please search for a location within India.", true);
        geoSuggestionsList.classList.add("hidden");
        return;
      }

      if (data.success && data.results && data.results.length > 0) {
        geoSuggestionsList.innerHTML = "";
        data.results.forEach((loc) => {
          const div = document.createElement("div");
          div.className = "geo-suggestion-item";
          div.innerHTML = `
            <span><strong>${loc.name}</strong>, ${loc.state ? loc.state + ', ' : ''}IN</span>
            <small style="color: var(--text-muted); font-size: 0.75rem;">${loc.lat.toFixed(2)}°N, ${loc.lon.toFixed(2)}°E</small>
          `;
          div.addEventListener("click", () => {
            cityInput.value = loc.display_name || `${loc.name}, IN`;
            geoSuggestionsList.classList.add("hidden");
            fetchWeather(loc.display_name, loc.lat, loc.lon);
          });
          geoSuggestionsList.appendChild(div);
        });
        geoSuggestionsList.classList.remove("hidden");
      } else {
        geoSuggestionsList.classList.add("hidden");
      }
    } catch (e) {
      geoSuggestionsList.classList.add("hidden");
    }
  }

  if (cityInput) {
    cityInput.addEventListener("input", (e) => {
      clearTimeout(suggestDebounce);
      suggestDebounce = setTimeout(() => {
        fetchSuggestions(e.target.value);
      }, 300);
    });

    document.addEventListener("click", (e) => {
      if (geoSuggestionsList && !geoSuggestionsList.contains(e.target) && e.target !== cityInput) {
        geoSuggestionsList.classList.add("hidden");
      }
    });
  }

  // Popular Indian Location Quick Chips
  const popularChips = document.querySelectorAll(".city-quick-chip");
  popularChips.forEach((btn) => {
    btn.addEventListener("click", () => {
      const cityName = btn.getAttribute("data-city");
      if (cityName) {
        cityInput.value = cityName;
        if (geoSuggestionsList) geoSuggestionsList.classList.add("hidden");
        fetchWeather(cityName);
      }
    });
  });

  // Event Listeners
  if (weatherSearchForm) {
    weatherSearchForm.addEventListener("submit", (e) => {
      e.preventDefault();
      if (geoSuggestionsList) geoSuggestionsList.classList.add("hidden");
      fetchWeather(cityInput.value);
    });
  }

  if (checkWeatherBtn) {
    checkWeatherBtn.addEventListener("click", () => {
      if (geoSuggestionsList) geoSuggestionsList.classList.add("hidden");
      fetchWeather(cityInput.value);
    });
  }

  if (clearCityBtn) {
    clearCityBtn.addEventListener("click", () => {
      cityInput.value = "Coimbatore, Tamil Nadu";
      if (geoSuggestionsList) geoSuggestionsList.classList.add("hidden");
      fetchWeather("Coimbatore, Tamil Nadu");
    });
  }

  scenarioChips.forEach((chip) => {
    chip.addEventListener("click", () => {
      const scenarioId = chip.getAttribute("data-scenario");
      if (scenarioId) loadScenario(scenarioId);
    });
  });

  // 7. Auto Monitoring Controller
  function startAutoMonitoring() {
    countdownSeconds = 30;
    if (monitorStatusDesc) {
      monitorStatusDesc.textContent = "Automatically checking weather conditions";
    }
    if (countdownBarWrap) countdownBarWrap.classList.remove("hidden");

    clearInterval(countdownTimer);
    countdownTimer = setInterval(() => {
      countdownSeconds--;
      if (countdownLabel) countdownLabel.textContent = `Next check in: ${countdownSeconds}s`;
      if (countdownFill) countdownFill.style.width = `${(countdownSeconds / 30) * 100}%`;

      if (countdownSeconds <= 0) {
        countdownSeconds = 30;
        fetchWeather(cityInput.value);
      }
    }, 1000);
  }

  function stopAutoMonitoring() {
    clearInterval(countdownTimer);
    if (monitorStatusDesc) {
      monitorStatusDesc.textContent = "Click toggle to enable continuous automatic checking.";
    }
    if (countdownBarWrap) countdownBarWrap.classList.add("hidden");
  }

  if (autoMonitorToggle) {
    autoMonitorToggle.addEventListener("change", (e) => {
      if (e.target.checked) {
        startAutoMonitoring();
      } else {
        stopAutoMonitoring();
      }
    });
  }

  // Initialize
  renderHistory();
  // Fetch default city weather on startup
  fetchWeather("Coimbatore, Tamil Nadu");
});
