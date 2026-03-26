//----------------------------------------------
// Favorite.jsx (CSS Updated - No Logic Change)
//----------------------------------------------

import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import "../Styles/Favorite.css"; 

const Favorites = () => {

  const [favorites, setFavorites] = useState([]);
  const [deletingCity, setDeletingCity] = useState(null);
  const [weatherData, setWeatherData] = useState({});
  const [search, setSearch] = useState(""); 
  const [pinnedCity, setPinnedCity] = useState(
    localStorage.getItem("pinned_city") || null
  ); 

  // ✅ FIX: correct key
  const userId = localStorage.getItem("user_id");
  const navigate = useNavigate();

  // ==============================
  // Fetch Favorites
  // ==============================
  useEffect(() => {

    if (!userId) return;

    fetch(`http://localhost/weather-backend/api/getFavorites.php?user_id=${userId}`)
      .then(res => res.json())
      .then(data => {
        setFavorites(data);
        fetchWeatherForFavorites(data);
      })
      .catch(() => console.log("Failed to fetch favorites"));

  }, [userId]);

  // ==============================
  // Fetch Weather for Each City
  // ==============================
  const fetchWeatherForFavorites = async (favList) => {

    const apiKey = import.meta.env.VITE_APP_ID;

    const tempData = {};

    await Promise.all(
      favList.map(async (item) => {
        try {
          const res = await fetch(
            `https://api.openweathermap.org/data/2.5/weather?q=${item.city}&units=metric&appid=${apiKey}`
          );
          const data = await res.json();

          // ✅ Safety check
          if (!data.main) {
            tempData[item.city] = null;
            return;
          }

          tempData[item.city] = {
            temp: Math.round(data.main.temp),
            condition: data.weather[0].main,
            icon: data.weather[0].icon
          };

        } catch {
          tempData[item.city] = null;
        }
      })
    );

    setWeatherData(tempData);
  };

  // ==============================
  // Pin City
  // ==============================
  const handlePin = (city) => {
    localStorage.setItem("pinned_city", city);
    setPinnedCity(city);
  };

  // ==============================
  // Remove Favorite (with animation)
  // ==============================
  const removeFavorite = async (city) => {

    setDeletingCity(city); 

    setTimeout(async () => {
      try {
        await fetch(
          "http://localhost/weather-backend/api/deleteFavorite.php",
          {
            method: "POST",
            headers: {
              "Content-Type": "application/json"
            },
            body: JSON.stringify({
              user_id: userId,
              city
            })
          }
        );

        setFavorites(prev => prev.filter(item => item.city !== city));
        setDeletingCity(null);

      } catch {
        alert("Error removing favorite");
        setDeletingCity(null);
      }
    }, 300); 
  };

  // ==============================
  // Filter + Sort
  // ==============================
  const filteredFavorites = favorites
    .filter(item =>
      item.city.toLowerCase().includes(search.toLowerCase())
    )
    .sort((a, b) => {
      if (a.city === pinnedCity) return -1;
      if (b.city === pinnedCity) return 1;
      return 0;
    });


  return (

    <div className="fav-container">

    <div className="fav-particles"></div>
    
    <div className="fav-header">
      <h2 className="fav-title">⭐ Favorite Cities</h2>

      {/* 🔍 Search */}
      <input
        className="fav-search"
        placeholder="Search city..."
        value={search}
        onChange={(e) => setSearch(e.target.value)}
      />
      </div>

      {filteredFavorites.length === 0 ? (

        <p className="fav-empty">No favorites found</p>

      ) : (

        <div className="fav-grid">

          {filteredFavorites.map((item, index) => {

            const weather = weatherData[item.city];

            return (
              <div key={index} 
              className={`fav-card ${deletingCity === item.city ? "removing" : ""} ${pinnedCity === item.city ? "pinned" : ""}`}>

                <div
                  className="fav-city-section"
                  onClick={() => navigate(`/weather?city=${item.city}`)}
                >
                  <span className="fav-city">
                    📍 {item.city}
                    {pinnedCity === item.city && " 📌"}
                  </span>

                  {weather ? (
                    <div className="fav-weather">
                      <img src={`https://openweathermap.org/img/wn/${weather.icon}@2x.png`} />
                      <span>{weather.temp}°C</span>
                      <small>{weather.condition}</small>
                    </div>
                  ) : (
                    <div className="fav-skeleton">
                      <div className="skeleton-line"></div>
                      <div className="skeleton-line short"></div>
                    </div>
                  )}
                </div>

                <div className="fav-actions">
                  <button onClick={() => handlePin(item.city)}>📌</button>
                  <button
                    className="fav-delete"
                    onClick={() => removeFavorite(item.city)}
                  >
                    ❌
                  </button>
                </div>

              </div>
            );
          })}

        </div>

      )}

    </div>
  );
};

export default Favorites;