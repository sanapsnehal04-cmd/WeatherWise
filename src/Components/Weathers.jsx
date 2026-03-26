// ==========================================
// Weather.jsx 
// ==========================================

import "../Styles/Weather.css";
import React, { useEffect, useState } from "react";
import { useNavigate, useLocation } from "react-router-dom";

// Icons
import clear_icon from "../assets/clear.png";
import cloud_icon from "../assets/cloud.png";
import drizzle_icon from "../assets/drizzle.png";
import rain_icon from "../assets/rain.png";
import snow_icon from "../assets/snow.png";
import humidity_icon from "../assets/humidity.png";
import wind_icon from "../assets/wind.png";

const Weather = () => {
  const navigate = useNavigate();
  const location = useLocation();

  const [weatherData, setWeatherData] = useState(null);
  const [loading, setLoading] = useState(false);
  const [userPref, setUserPref] = useState(null);
  const [alerts, setAlerts] = useState([]);

  // ==============================
  // Icon Mapping
  // ==============================
  const iconMap = {
    "01d": clear_icon, "01n": clear_icon,
    "02d": cloud_icon, "02n": cloud_icon,
    "03d": cloud_icon, "03n": cloud_icon,
    "04d": drizzle_icon, "04n": drizzle_icon,
    "09d": rain_icon, "09n": rain_icon,
    "10d": rain_icon, "10n": rain_icon,
    "13d": snow_icon, "13n": snow_icon
  };

  // ==============================
  // Fetch Weather
  // ==============================
  const fetchWeather = async (city) => {
    if (!city) return;

    setLoading(true);

    try {
      const url = `https://api.openweathermap.org/data/2.5/weather?q=${city}&units=metric&appid=${import.meta.env.VITE_APP_ID}`;
      const res = await fetch(url);
      const data = await res.json();

      if (!res.ok) {
        alert(data.message);
        return;
      }

      const weatherMain = data.weather[0].main;
      const icon = iconMap[data.weather[0].icon] || clear_icon;

      // Background handling
      const bgClasses = ["sunny-bg", "cloud-bg", "rain-bg", "snow-bg"];
      document.body.classList.remove(...bgClasses);

      const bgMap = {
        Clear: "sunny-bg",
        Clouds: "cloud-bg",
        Rain: "rain-bg",
        Drizzle: "rain-bg",
        Snow: "snow-bg"
      };

      if (bgMap[weatherMain]) {
        document.body.classList.add(bgMap[weatherMain]);
      }

      const windKm = Math.floor(data.wind.speed * 3.6);

      setWeatherData({
        location: data.name,
        temperature: Math.floor(data.main.temp),
        humidity: data.main.humidity,
        windSpeed: data.wind.speed,
        icon,
        windKm,
        weatherMain,
        sunrise: data.sys.sunrise,
        sunset: data.sys.sunset,
        timezone: data.timezone
      });

      fetchAlerts(data.name);

    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  // ==============================
  // Fetch preference
  // ==============================
  
  const fetchPreferences = async () => {
    const user_id = localStorage.getItem("user_id");
    if (!user_id) return;

    try {
      const res = await fetch(
        `http://localhost/weather-backend/api/getPreferences.php?user_id=${user_id}`
      );

      const data = await res.json();

      if (data.status === "exists") {
        setUserPref(data.data);
      }

    } catch (err) {
      console.log("Preference fetch error");
    }
  };  

  // ==============================
  // Fetch Alert
  // ==============================

  const fetchAlerts = async (city) => {
    try {
      const res = await fetch(
        `http://localhost/weather-backend/api/getAlerts.php?city=${city}`
      );
      const data = await res.json();
      setAlerts(data || []);
    } catch {
      setAlerts([]);
    }
  };

  // ==============================
  // Effects
  // ==============================
  useEffect(() => {
    const params = new URLSearchParams(location.search);
    fetchWeather(params.get("city") || "Pune");
  }, [location.search]);

  useEffect(() => {
    fetchPreferences();
  }, []);

  // ==============================
  // Helpers
  // ==============================
  const getSunProgress = () => {
  if (!weatherData) return 0;

  // Current UTC time (in seconds)
  const nowUTC = Math.floor(Date.now() / 1000);

  // Convert to city's local time
  const localNow = nowUTC + weatherData.timezone;

  const sunrise = weatherData.sunrise;
  const sunset = weatherData.sunset;

  if (localNow < sunrise) return 0;
  if (localNow > sunset) return 100;

  const progress = ((localNow - sunrise) / (sunset - sunrise)) * 100;

  return Math.min(Math.max(progress, 0), 100);
};

  const formatTime = (unix, timezone) => {
    if (!unix) return "--:--";
    const date = new Date((unix + timezone) * 1000);
    return date.toUTCString().slice(17, 22);
  };

  const toFahrenheit = (celsius) => {
    return (celsius * 9/5) + 32;
  };

  const getDuration = (start, end) => {
    const diff = end - start;
    const h = Math.floor(diff / 3600);
    const m = Math.floor((diff % 3600) / 60);
    return `${h}h ${m}m`;
  };

  const getGoldenHour = (sunrise, sunset, timezone) => ({
    morning: `${formatTime(sunrise, timezone)} - ${formatTime(sunrise + 3600, timezone)}`,
    evening: `${formatTime(sunset - 3600, timezone)} - ${formatTime(sunset, timezone)}`
  });

  const getWeatherAdvice = (t, c) => {
    if (c === "Rain") return "🌧 Carry umbrella";
    if (c === "Snow") return "❄ Wear warm clothes";
    if (t >= 35) return "🔥 Stay hydrated";
    if (t >= 25) return "☀ Nice weather";
    if (t >= 15) return "🌤 Pleasant";
    if (t >= 5) return "🧥 Carry jacket";
    return "❄ Very cold";
  };

  const getTodayScore = (temp, humidity, wind) => {
    let score = 10;

    if (temp > 35 || temp < 10) score -= 3;
    if (humidity > 80) score -= 2;
    if (wind > 20) score -= 1;

    return Math.max(score, 1);
  };

  const getBestTimeToday = (temp) => {
  if (temp > 35) return "🌇 Evening (6PM - 8PM)";
  if (temp < 15) return "☀ Afternoon (12PM - 3PM)";
  return "🌤 Anytime is comfortable";
};

  const getWeatherPersonality = (temp, condition) => {
    if (condition === "Rain") return "🌧 Moody Rainy Day";
    if (temp > 35) return "🔥 Aggressive Heat Day";
    if (temp >= 25) return "🌤 Energetic Bright Day";
    if (temp >= 15) return "😌 Calm Pleasant Day";
    return "❄ Quiet Cold Day";
  };

  const getFeelsLikeText = (temp, humidity) => {
    if (temp > 35 && humidity > 70) return "🥵 Hot & Humid";
    if (temp > 35) return "🔥 Dry Heat";
    if (temp >= 25) return "🌤 Warm & Comfortable";
    if (temp >= 15) return "😌 Pleasant";
    return "❄ Cold";
  };

  const getPersonalizedAdvice = (temp) => {
    if (!userPref) return "";

    if (temp > userPref.preferred_temp_max) {
      return "🔥 Too hot for your comfort";
    }

    if (temp < userPref.preferred_temp_min) {
      return "❄ Too cold for your comfort";
    }

    return "✅ Perfect weather for you";
  };

  const getComfortScore = (temp, humidity, wind) => {
  if (!userPref) return null;

  let score = 10;

  if (temp > userPref.preferred_temp_max || temp < userPref.preferred_temp_min) {
    score -= 4;
  }

  if (humidity > 80) score -= 2;
  if (wind > 20) score -= 1;

  return Math.max(score, 1);
};

  // ==============================
  // Location Weather
  // ==============================
  const getLocationWeather = () => {
    if (!navigator.geolocation) {
      alert("Geolocation not supported");
      return;
    }

    navigator.geolocation.getCurrentPosition(
      async ({ coords }) => {
        const url = `https://api.openweathermap.org/data/2.5/weather?lat=${coords.latitude}&lon=${coords.longitude}&units=metric&appid=${import.meta.env.VITE_APP_ID}`;
        const res = await fetch(url);
        const data = await res.json();

        if (data.name) {
          navigate(`/weather?city=${data.name}`);
        }
      },
      () => alert("Location permission denied")
    );
  };

  // ==============================
  // Favorites
  // ==============================
  const addFavorite = async () => {
    if (!weatherData) return;

    const user_id = localStorage.getItem("user_id");
    if (!user_id) return alert("Login required");

    try {
      const res = await fetch("http://localhost/weather-backend/api/saveFavorite.php", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ user_id, city: weatherData.location })
      });

      const data = await res.json();

      if (data.status === "success") alert("Added to favorites ⭐");
      else if (data.status === "exists") alert("Already in favorites");
      else alert("Error saving favorite");

    } catch {
      alert("Server error");
    }
  };

  // ==============================
  // UI
  // ==============================

console.log("Weather Data:", weatherData);

if (weatherData) {
  console.log("SYS:", weatherData.sys);

  if (weatherData) {
  console.log("NOW:", new Date());
  console.log("Sunrise:", new Date(weatherData.sunrise * 1000));
  console.log("Sunset:", new Date(weatherData.sunset * 1000));
  console.log("Progress:", getSunProgress());
}
}



  if (loading) {
    return (
      <div className="weather-dashboard">
        <div className="loader"></div>
      </div>
    );
  }

  if (!weatherData) {
    return <h3>No data available</h3>;
  }

  return (
    <div className="weather-dashboard">

      {/* ✅ ALERT AT TOP LEVEL */}
      {alerts.length > 0 && (
        <div className="alert-banner">
          {alerts.map((a, i) => (
            <p key={i}>⚠ {a.message}</p>
          ))}
        </div>
      )}

      <div className="weather-layout">

        {/* LEFT PANEL */}
        <div className="left-panel">
          <div className="insight-card">
            <h4>🧠 Today Insights</h4>
            <p>🎯 Score: {getTodayScore(weatherData.temperature, weatherData.humidity, weatherData.windKm)}/10</p>
            <p>⏱ {getBestTimeToday(weatherData.temperature)}</p>
            <p>{getWeatherPersonality(weatherData.temperature, weatherData.weatherMain)}</p>
          </div>

          <div className="insight-card">
            <h4>🌅 Day Progress</h4>
            <div className="sun-bar">
              <div className="sun-progress" style={{ width: `${getSunProgress()}%` }}></div>
            </div>
          </div>
        </div>


        {/* MAIN */}
        <div className="weather">
          <img src={weatherData.icon} className="weather-icon" alt="" />

          <h1 className="temp">
            {weatherData.temperature}°C 
            <span className="temp-f">
              / {toFahrenheit(weatherData.temperature).toFixed(1)}°F
            </span>
          </h1>
          <p className="location">{weatherData.location}</p>

          <div className="weather-advice">
            {getWeatherAdvice(weatherData.temperature, weatherData.weatherMain)}

            {userPref && (
              <p className="personal-advice">
                {getPersonalizedAdvice(weatherData.temperature)}
              </p>
            )}
          </div>

          <div className="weather-data">
            <div className="col">
              <img src={humidity_icon} alt="" />
              <div>
                <p>{weatherData.humidity}%</p>
                <span>Humidity</span>
              </div>
            </div>

            <div className="col">
              <img src={wind_icon} alt="" />
              <div>
                <p>{Math.floor(weatherData.windSpeed * 3.6)} Km/hr</p>
                <span>Wind Speed</span>
              </div>
            </div>
          </div>

          {userPref && (
            <div className="comfort-score">
              ⭐ Comfort Score: {getComfortScore(
                weatherData.temperature,
                weatherData.humidity,
                weatherData.windSpeed * 3.6
              )} / 10
            </div>
          )}

          <div className="weather-buttons">
            <button onClick={() => navigate("/search")}>🔍 Search More</button>
            <button onClick={getLocationWeather}>📍Use My Location</button>
            <button onClick={() => navigate(`/forecast?city=${weatherData.location}`)}>📅 Forecast</button>
            <button onClick={addFavorite}>⭐Add to Favorite</button>
          </div>
        </div>

        {/* RIGHT PANEL */}
        <div className="right-panel">

          <div className="insight-card">
            <h4>🌍 Day Cycle</h4>
            <div className="row"><span>🌅</span><span>{formatTime(weatherData.sunrise, weatherData.timezone)}</span></div>
            <div className="row"><span>🌇</span><span>{formatTime(weatherData.sunset, weatherData.timezone)}</span></div>
            <div className="row"><span>☀️</span><span>{getDuration(weatherData.sunrise, weatherData.sunset)}</span></div>
            <div className="row"><span>🌙</span><span>{getDuration(weatherData.sunset, weatherData.sunrise + 86400)}</span></div>
          </div>

          <div className="insight-card">
            <h4>🌇 Light</h4>
            <p>{getGoldenHour(weatherData.sunrise, weatherData.sunset, weatherData.timezone).morning}</p>
            <p>{getGoldenHour(weatherData.sunrise, weatherData.sunset, weatherData.timezone).evening}</p>
          </div>

          <div className="insight-card">
            <h4>🌡 Feel</h4>
            <p>{getFeelsLikeText(weatherData.temperature, weatherData.humidity)}</p>
            {userPref && <p>{getPersonalizedAdvice(weatherData.temperature)}</p>}
          </div>

        </div>

      </div>
    </div>
  );
};

export default Weather;