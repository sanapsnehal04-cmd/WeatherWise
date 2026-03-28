// ==============================
// Register.jsx
// ==============================


import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import "../Styles/Register.css";

export default function Register() {

  const navigate = useNavigate();

  // ==============================
  // State
  // ==============================
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);

  // Validation
  const [validEmail, setValidEmail] = useState(false);
  const [validLength, setValidLength] = useState(false);
  const [hasNumber, setHasNumber] = useState(false);
  const [hasUpper, setHasUpper] = useState(false);

  // 🌙 Dark Mode State
  const [darkMode, setDarkMode] = useState(
    localStorage.getItem("theme") === "dark"
  );

  // Apply theme class to body (IMPORTANT)
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
  // Live Validation
  // ==============================
  useEffect(() => {
    const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    setValidEmail(emailPattern.test(email));

    setValidLength(password.length >= 6);
    setHasNumber(/\d/.test(password));
    setHasUpper(/[A-Z]/.test(password));
  }, [email, password]);

  const isFormValid =
    validEmail && validLength && hasNumber && hasUpper;

  // ==============================
  // Handle Register
  // ==============================
  const handleRegister = async (e) => {
    e.preventDefault();

    if (!isFormValid) {
      toast.error("Please fix validation errors");
      return;
    }

    try {
      setLoading(true);

      const response = await fetch(
        "http://localhost/weather-backend/api/register.php",
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            email: email.trim().toLowerCase(),
            password: password.trim()
          })
        }
      );

      const data = await response.json();

      if (data.status === "success") {
        toast.success("Registration Successful 🎉");
        setTimeout(() => navigate("/login"), 1500);

      } else if (data.status === "exists") {
        toast.error("Email already registered");

      } else {
        toast.error(data.message || "Registration failed");
      }

    } catch (error) {
      toast.error("Server error");
    } finally {
      setLoading(false);
    }
  };

  // ==============================
  // UI
  // ==============================
  return (
    <div className={`register-container ${darkMode ? "dark" : ""}`}>

      <ToastContainer position="top-center" autoClose={2000} />

      {/* 🌙 MODE TOGGLE */}
      <div className="mode-toggle">
        <button onClick={() => setDarkMode(!darkMode)} />
      </div>

      {/* Card */}
      <div className="register-card">

        <h1 className="reg-title">🌤 WeatherWise</h1>
        <p className="reg-subtitle">Create your account to get started</p>

        <form onSubmit={handleRegister}>

          {/* Email */}
          <div className="input-group">
            <input
              type="email"
              placeholder="Email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
            />
            {!validEmail && email && (
              <p className="error">Invalid email</p>
            )}
          </div>

          {/* Password */}
          <div className="input-group">
            <input
              type={showPassword ? "text" : "password"}
              placeholder="Password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
            />

            <span
              className="toggle-eye"
              onClick={() => setShowPassword(!showPassword)}
            >
            </span>

            <div className="password-rules">
              <p className={validLength ? "valid" : ""}>• 6+ characters</p>
              <p className={hasNumber ? "valid" : ""}>• 1 number</p>
              <p className={hasUpper ? "valid" : ""}>• 1 uppercase</p>
            </div>
          </div>

          {/* Button */}
          <button type="submit" disabled={!isFormValid || loading}>
            {loading ? "Creating..." : "Register"}
          </button>

        </form>

        <p className="redirect">
          Already have an account?{" "}
          <span onClick={() => navigate("/login")}>Login</span>
        </p>

      </div>

    </div>
  );
}