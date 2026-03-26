import { useState } from "react";
import "../Styles/ForgotPassword.css";

const ForgotPassword = () => {

  const [step, setStep] = useState(1); // 1=email, 2=otp, 3=new password
  const [email, setEmail] = useState("");
  const [otp, setOtp] = useState("");
  const [password, setPassword] = useState("");
  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(false);

  // ==============================
  // Send OTP
  // ==============================
  const sendOtp = async () => {
    if (!email) {
      setMessage("Enter your email 📧");
      return;
    }

    try {
      setLoading(true);

      const res = await fetch(
        "http://localhost/weather-backend/api/sendOtp.php",
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ email }),
        }
      );

      const data = await res.json();

      if (data.status === "success") {
        setStep(2);
        setMessage("OTP sent to your email ✅");
      } else {
        setMessage(data.message || "User not found ❌");
      }

    } catch {
      setMessage("Server error ⚠️");
    } finally {
      setLoading(false);
    }
  };

  // ==============================
  // Verify OTP
  // ==============================
  const verifyOtp = async () => {
    if (!otp) {
      setMessage("Enter OTP 🔢");
      return;
    }

    try {
      setLoading(true);

      const res = await fetch(
        "http://localhost/weather-backend/api/verifyOtp.php",
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ email, otp }),
        }
      );

      const data = await res.json();

      if (data.status === "success") {
        setStep(3);
        setMessage("OTP verified ✅");
      } else {
        setMessage("Invalid OTP ❌");
      }

    } catch {
      setMessage("Server error ⚠️");
    } finally {
      setLoading(false);
    }
  };

  // ==============================
  // Reset Password
  // ==============================
  const resetPassword = async () => {
    if (password.length < 6) {
      setMessage("Password must be 6+ characters 🔒");
      return;
    }

    try {
      setLoading(true);

      const res = await fetch(
        "http://localhost/weather-backend/api/resetPassword.php",
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ email, password }),
        }
      );

      const data = await res.json();

      if (data.status === "success") {
        setMessage("Password reset successful 🎉");
        setStep(1);
      } else {
        setMessage("Error resetting password ❌");
      }

    } catch {
      setMessage("Server error ⚠️");
    } finally {
      setLoading(false);
    }
  };

  // ==============================
  // UI
  // ==============================
  return (
    <div className="forgot-container">

      <div className="forgot-box">

        <h2>🔐 Forgot Password</h2>

        {message && <p className="message">{message}</p>}

        {/* Step 1 */}
        {step === 1 && (
          <>
            <input
              type="email"
              placeholder="Enter your email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
            />
            <button onClick={sendOtp}>
              {loading ? "Sending..." : "Send OTP"}
            </button>
          </>
        )}

        {/* Step 2 */}
        {step === 2 && (
          <>
            <input
              type="text"
              placeholder="Enter OTP"
              value={otp}
              onChange={(e) => setOtp(e.target.value)}
            />
            <button onClick={verifyOtp}>
              {loading ? "Verifying..." : "Verify OTP"}
            </button>
          </>
        )}

        {/* Step 3 */}
        {step === 3 && (
          <>
            <input
              type="password"
              placeholder="Enter new password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
            />
            <button onClick={resetPassword}>
              {loading ? "Resetting..." : "Reset Password"}
            </button>
          </>
        )}

      </div>
    </div>
  );
};

export default ForgotPassword;