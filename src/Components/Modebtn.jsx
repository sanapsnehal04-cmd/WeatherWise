// ==========================================
// Modebtn.jsx (Improved)
// Global Dark / Light Mode Toggle
// ==========================================

import React, { useState, useEffect } from "react";
import "../Styles/Weather.css";

const Modebtn = () => {

  // ==============================
  // Load saved theme
  // ==============================
  const [darkMode, setDarkMode] = useState(
    () => localStorage.getItem("theme") === "dark"
  );

  // ==============================
  // Toggle mode
  // ==============================
  const toggleMode = () => {
    setDarkMode(prev => !prev);
  };

  // ==============================
  // Apply theme globally
  // ==============================
  useEffect(() => {

    const theme = darkMode ? "dark" : "light";

    // ✅ Save to localStorage
    localStorage.setItem("theme", theme);

    // ✅ Apply class to body (BEST PRACTICE)
    document.body.classList.remove("light", "dark");
    document.body.classList.add(theme);

  }, [darkMode]);

  return (
    <button className="toggleBtn" onClick={toggleMode}>
      {darkMode ? "☀ Light Mode" : "🌙 Dark Mode"}
    </button>
  );
};

export default Modebtn;