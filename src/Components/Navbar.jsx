// ==========================================
// Navbar.jsx 
// ==========================================

import { useNavigate, useLocation } from "react-router-dom";
import "../Styles/Navbar.css";

const Navbar = () => {

  const navigate = useNavigate();
  const location = useLocation();

  // ✅ FIX: correct key
  const userEmail = localStorage.getItem("user_email");
  const role = localStorage.getItem("user_role");

  const handleLogout = () => {
    localStorage.removeItem("user_id");
    localStorage.removeItem("user_email");

    navigate("/login");
  };
  
  // ✅ Helper for active link
  const isActive = (path) => location.pathname === path;

  return (
    <nav className="navbar">

      {/* App Title */}
      <h3 onClick={() => navigate("/weather")} className="nav-title">
        🌤 WeatherWise
      </h3>

      {/* Navigation Links */}
      <div className="nav-links">

        <span
          className={isActive("/weather") ? "active" : ""}
          onClick={() => navigate("/weather")}
        >
          🏠 Dashboard
        </span>

        <span
          className={isActive("/search-history") ? "active" : ""}
          onClick={() => navigate("/search-history")}
        >
         🕒 History 
        </span>

        <span
          className={isActive("/favorites") ? "active" : ""}
          onClick={() => navigate("/favorites")}
        >
         ⭐ Favorites 
        </span>

      </div>

      {/* User + Logout */}
      <div className="nav-user">

        {role === "admin" && (
          <span onClick={() => navigate("/admin")}>
            🧑‍💼 Admin
          </span>
        )}
        
        {userEmail && (
          <div className="user-box">
          <span className="user-text">
            Welcome, {userEmail}
          </span> </div>
        )}

        <button className="logout-btn" onClick={handleLogout}>
          Logout
        </button>

      </div>

    </nav>
  );
};

export default Navbar;