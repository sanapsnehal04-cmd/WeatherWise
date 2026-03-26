import { useState, useEffect, useRef } from "react";
import { useNavigate, Link } from "react-router-dom";
import "../Styles/Login.css";

// 🎥 Videos
import videoLight from "../assets/moving_clouds.mp4";
import videoDark from "../assets/night_sky.mp4";

const Login = () => {

  // ==============================
  // State
  // ==============================
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState("");

  // 🌗 Theme
  const [darkMode, setDarkMode] = useState(
    localStorage.getItem("theme") === "dark"
  );

  const videoRef = useRef(null);
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

  useEffect(() => {
    if (videoRef.current) {
      videoRef.current.load();
      videoRef.current.play().catch((err) => {
        console.warn("Autoplay blocked:", err);
      });
    }
  }, [darkMode]);

  // ==============================
  // Validation
  // ==============================
  const validate = () => {
    if (!email || !password) {
      return "Please fill all fields ⚠️";
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

    if (!emailRegex.test(email)) {
      return "Enter a valid email address 📧";
    }

    if (password.length < 6) {
      return "Password must be at least 6 characters 🔒";
    }

    return null;
  };

  // ==============================
  // Handle Login
  // ==============================
  const handleSubmit = async (e) => {
    e.preventDefault();
    setErrorMsg("");

    const validationError = validate();
    if (validationError) {
      setErrorMsg(validationError);
      return;
    }

    try {
      setLoading(true);

      const res = await fetch(
        "http://localhost/weather-backend/api/login.php",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ email, password }),
        }
      );

      if (!res.ok) throw new Error("HTTP error");

      let data;
      try {
        data = await res.json();
      } catch {
        throw new Error("Invalid JSON response");
      }

      if (data.status === "success") {
        localStorage.setItem("user_id", data.user.id);
        localStorage.setItem("user_email", data.user.email);
        localStorage.setItem("user_role", data.user.role);

        // 🔥 Admin redirect
        if (data.user.role === "admin") {
          navigate("/admin");
          return;
        }

        // 🔍 Check preferences
        try {
          const prefRes = await fetch(
            `http://localhost/weather-backend/api/getPreferences.php?user_id=${data.user.id}`
          );

          const prefData = await prefRes.json();

          if (prefData.status === "exists") {
            navigate("/weather");
          } else {
            navigate("/preferences");
          }
        } catch {
          navigate("/weather");
        }

      } else {
        setErrorMsg(
          data.message || "User not registered or wrong credentials ❌"
        );
      }

    } catch (error) {
      console.error(error);
      setErrorMsg("Server error ⚠️ Please try again later.");
    } finally {
      setLoading(false);
    }
  };

  // ==============================
  // UI
  // ==============================
  return (
    <>
      {/* 🎥 Background */}
      <video
        key={darkMode ? "dark" : "light"}
        ref={videoRef}
        autoPlay
        muted
        loop
        playsInline
        className="bg-video"
      >
        <source src={darkMode ? videoDark : videoLight} type="video/mp4" />
      </video>

      {/* 🌫 Overlay */}
      <div className="overlay"></div>

      {/* 🌗 Theme Toggle */}
      <div className="theme-toggle" onClick={() => setDarkMode(!darkMode)}>
        {darkMode ? "🌙" : "☀️"}
      </div>

      <div className="login-container">
        <div className="login-box">

          <h2 className="login-title">🌦 WeatherWise</h2>
          <p className="login-subtitle">Welcome back! Login to continue...</p>

          <form onSubmit={handleSubmit}>

            {/* Error Message */}
            {errorMsg && (
              <div className="error-message">
                {errorMsg}
              </div>
            )}

            {/* Email */}
            <div className="input-group">
              <input
                type="email"
                required
                autoComplete="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
              />
              <label>Email</label>
            </div>

            {/* Password */}
            <div className="input-group password-group">
              <input
                type={showPassword ? "text" : "password"}
                required
                autoComplete="current-password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
              />
              <label>Password</label>

              <span
                className="toggle-password"
                onClick={() => setShowPassword(!showPassword)}
              >
                {showPassword ? "🙈" : "👁"}
              </span>
              <p className="forgot-link">
                <Link to="/forgot-password">Forgot Password?</Link>
              </p>
            </div>

            {/* Button */}
            <button type="submit" disabled={loading}>
              {loading ? "⏳ Logging in..." : "Login"}
            </button>

          </form>

          <p className="register-text">
            Don’t have an account? <Link to="/register">Register</Link>
          </p>

        </div>
      </div>
    </>
  );
};

export default Login;