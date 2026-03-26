// ==========================================
// Search.jsx 
// ==========================================

import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import search_icon from "../assets/search.png";
import "../Styles/Search.css";

const Search = () => {

  const [city, setCity] = useState("");
  const [suggestions, setSuggestions] = useState([]);
  const [darkMode, setDarkMode] = useState(
    () => localStorage.getItem("theme") === "dark"
  );

  const navigate = useNavigate();

  // ==============================
  // Apply Theme
  // ==============================
  useEffect(() => {
    if (darkMode) {
      document.body.classList.add("dark");
      localStorage.setItem("theme", "dark");
    } else {
      document.body.classList.remove("dark");
      localStorage.setItem("theme", "light");
    }
  }, [darkMode]);

  // ==============================
  // Handle Search
  // ==============================
  const handleSearch = () => {
    const trimmedCity = city.trim();

    if (!trimmedCity) {
      alert("Please enter city name");
      return;
    }

    setSuggestions([]);
    navigate(`/weather?city=${trimmedCity}`);
  };

  // ==============================
  // Enter Key
  // ==============================
  const handleKeyDown = (e) => {
    if (e.key === "Enter") {
      handleSearch();
    }
  };

  // ==============================
  // Fetch Suggestions
  // ==============================
  const fetchSuggestions = async (query) => {

    const trimmed = query.trim();

    if (!trimmed) {
      setSuggestions([]);
      return;
    }

    try {
      const url =
        `https://api.openweathermap.org/geo/1.0/direct?q=${trimmed}&limit=5&appid=${import.meta.env.VITE_APP_ID}`;

      const res = await fetch(url);
      const data = await res.json();

      const cities = [...new Set(data.map(item => item.name))];

      setSuggestions(cities);

    } catch {
      console.log("Suggestion error");
    }
  };

  return (

    <div className="search-page">

      {/*Mode button - top right*/}
      <button className="mode-btn" 
      onClick={() => setDarkMode(prev => !prev)}
      >
        {darkMode ? "🌙" : "☀️"}  
      </button>

      {/*Section */}
      <div className="search-hero">
        <h1 className="search-title">Discover Weather Instantly</h1>
        <p className="search-subtitle">
          Get real-time weather updates for any city worldwide 🌍
        </p>
      </div>

      {/*Search Box */}
      <div className="search-container">
        <div className="search-box">

          <input type="text"
                placeholder="Search the location..."
                value={city}
                onChange={(e) => {
                  setCity(e.target.value);
                  fetchSuggestions(e.target.value);
                }}
                onKeyDown={handleKeyDown}
          />

          <img src={search_icon}
                alt="search" onClick={handleSearch}
          />
        </div>

        {/* Suggestions */}
        {suggestions.length > 0 && (
          <div className="suggestions-box">

            {suggestions.map((item, index) => (
              <div
                key={index}
                className="suggestion-item"
                onClick={() => {
                  setCity(item);
                  setSuggestions([]);
                  navigate(`/weather?city=${item}`);
                }}
              >
                {item}
              </div>
            ))}

          </div>
        )}

      </div>

    </div>
  );
};

export default Search;