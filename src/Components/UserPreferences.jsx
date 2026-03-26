import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import "../Styles/UserPreferences.css";

const UserPreferences = () => {

  const navigate = useNavigate();

  const [form, setForm] = useState({
    minTemp: "",
    maxTemp: "",
    humidity: "medium",
    wind: "medium",
    lifestyle: "normal"
  });

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = async () => {
    const user_id = localStorage.getItem("user_id");

    if (!user_id) return alert("Login required");

    try {
      const res = await fetch("http://localhost/weather-backend/api/savePreferences.php", {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify({
          user_id,
          ...form
        })
      });

      const data = await res.json();

      if (data.status === "success") {
        alert("Preferences saved ✅");
        navigate("/weather");
      } else {
        alert("Error saving preferences");
      }

    } catch {
      alert("Server error");
    }
  };

  return (
    <div className="pref-container">

      <h2>🌦 Set Your Weather Preferences</h2>

      <div className="pref-form">

        <input
          type="number"
          name="minTemp"
          placeholder="Preferred Min Temp (°C)"
          onChange={handleChange}
        />

        <input
          type="number"
          name="maxTemp"
          placeholder="Preferred Max Temp (°C)"
          onChange={handleChange}
        />

        <select name="humidity" onChange={handleChange}>
          <option value="low">Low Humidity</option>
          <option value="medium">Medium Humidity</option>
          <option value="high">High Humidity</option>
        </select>

        <select name="wind" onChange={handleChange}>
          <option value="low">Low Wind</option>
          <option value="medium">Medium Wind</option>
          <option value="high">High Wind</option>
        </select>

        <select name="lifestyle" onChange={handleChange}>
          <option value="normal">Normal</option>
          <option value="travel">Travel</option>
          <option value="sports">Sports</option>
          <option value="indoor">Indoor</option>
        </select>

        <button onClick={handleSubmit}>
          Save Preferences
        </button>

      </div>

    </div>
  );
};

export default UserPreferences;