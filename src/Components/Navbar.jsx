// ==========================================
// Navbar.jsx 
// ==========================================

import { useNavigate, useLocation } from "react-router-dom";
import { useEffect, useState } from "react";
import { Home, Star, Clock, Settings, Sun, Moon } from "lucide-react";
import "../Styles/Navbar.css";

const Navbar = () => {

  const navigate = useNavigate();
  const location = useLocation();

  // ✅ FIX: correct key
  const userEmail = localStorage.getItem("user_email");
  const role = localStorage.getItem("user_role");

  const handleLogout = () => {

    // ✅ Clear all local storage (user_id, role, email, etc.)
    localStorage.clear();

    // ✅ Destroy backend session
    fetch("http://localhost/weather-backend/api/logout.php", {
      method: "POST",
      credentials: "include"
    }).catch(err => console.error("Logout error:", err));

    // ✅ Redirect to login
    navigate("/login");
  };
  
  // ✅ Helper for active link
  const isActive = (path) => location.pathname.startsWith(path);

  const [darkMode, setDarkMode] = useState(
    localStorage.getItem("theme") === "dark"
  );

  const toggleTheme = () => {
    document.body.classList.toggle("dark");

    const isDark = document.body.classList.contains("dark");
    setDarkMode(isDark);

    localStorage.setItem("theme", isDark ? "dark" : "light");
  };

  useEffect(() => {
    const savedTheme = localStorage.getItem("theme");

    if (savedTheme === "dark") {
      document.body.classList.add("dark");
      setDarkMode(true);
    }
  }, []);

  return (
    <nav className="navbar">

      {/* App Title */}
      <h3 onClick={() => navigate("/weather")} className="nav-title">
        🌤 WeatherWise
      </h3>

      {/* Navigation Links */}
      <div className="nav-links">

        <span
          className={isActive("/preferences") ? "active" : ""}
          onClick={() => navigate("/preferences")}
        >
          <Settings/> Preferences
        </span>

        <span
          className={isActive("/weather") ? "active" : ""}
          onClick={() => navigate("/weather")}
        >
          <Home/> Dashboard
        </span>

        <span
          className={isActive("/search-history") ? "active" : ""}
          onClick={() => navigate("/search-history")}
        >
          <Clock/> History
        </span>

        <span
          className={isActive("/favorites") ? "active" : ""}
          onClick={() => navigate("/favorites")}
        >
          <Star/> Favorites
        </span>

      </div>

      {/* User + Logout & Theme */}
      <div className="nav-user">

        {role === "admin" && (
          <span onClick={() => navigate("/admin")}>
            🧑‍💼 Admin
          </span>
        )}
        
        {userEmail && (
          <div className="user-box">
            <span className="user-email">{userEmail}</span>
          </div>
        )}

        <div className="nav-actions">

         <label className="theme-switch">
          <input
            type="checkbox"
            checked={darkMode}
            onChange={toggleTheme}
          />
          <span className="slider">
            <Sun className="icon sun" size={14} />
            <Moon className="icon moon" size={14} />
          </span>
        </label>

          <button className="logout-btn" onClick={handleLogout}>
            Logout
          </button>

        </div>

      </div>

    </nav>
  );
};

export default Navbar;