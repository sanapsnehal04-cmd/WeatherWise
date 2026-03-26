// ==============================
// App.jsx
// Main routing controller of the application
// ==============================

import { Routes, Route, useNavigate, useLocation} from "react-router-dom";
import { useEffect } from "react";

// Pages / Components
import Weather from "./Components/Weathers";
import Login from "./Components/Login";
import Navbar from "./Components/Navbar";
import PrivateRoute from "./Components/PrivateRoute";
import SearchHistory from "./Components/SearchHistory";
import Welcome from "./Components/Welcome";
import Search from "./Components/Search";
import Favorites from "./Components/Favorite";
import Forecast from "./Components/Forecast";
import Register from "./Components/Register";
import UserPreferences from "./Components/UserPreferences";
import AdminDashboard from "./Components/AdminDashboard";
import AdminRoute from "./Components/AdminRoute";
import ForgotPassword from "./Components/ForgotPassword";

const App = () => {

  useEffect(() => {
    const savedTheme = localStorage.getItem("theme") || "light";

    document.body.classList.remove("light", "dark");
    document.body.classList.add(savedTheme);
  }, []);
  
  const navigate = useNavigate();
  const location = useLocation();

  // ==============================
  // Navigate from Welcome → Login
  // ==============================
  const handleEnter = () => navigate("/login");

  // ==============================
  // Routes where Navbar is hidden
  // ==============================
  const hideNavbarRoutes = ["/", "/login", "/register","/forgot_password"];
  
  return (
    <>
      {/* Navbar (hidden on specific routes) */}
      {!hideNavbarRoutes.includes(location.pathname) && <Navbar />}

      <Routes>

        {/* Public Routes */}
        <Route path="/" element={<Welcome onEnter={handleEnter} />} />
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />

        {/* Protected Routes */}

        <Route
          path="/admin"
          element={
            <AdminRoute>
              <AdminDashboard />
            </AdminRoute>
          }
        />

        <Route
          path="/search"
          element={
            <PrivateRoute>
              <Search />
            </PrivateRoute>
          }
        />

        <Route
          path="/preferences"
          element={
            <PrivateRoute>
              <UserPreferences />
            </PrivateRoute>
          }
        />

        <Route
          path="/forecast"
          element={
            <PrivateRoute>
              <Forecast />
            </PrivateRoute>
          }
        />

        <Route
          path="/weather"
          element={
            <PrivateRoute>
              <Weather />
            </PrivateRoute>
          }
        />

        <Route
          path="/search-history"
          element={
            <PrivateRoute>
              <SearchHistory />
            </PrivateRoute>
          }
        />

        <Route
          path="/favorites"
          element={
            <PrivateRoute>
              <Favorites />
            </PrivateRoute>
          }
        />

      </Routes>
    </>
  );
};

export default App;