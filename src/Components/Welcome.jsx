// ==========================================
// Welcome.jsx (Premium UI + Theme Toggle)
// ==========================================

import '../Styles/Welcome.css';

const Welcome = ({ onEnter }) => {

  const toggleTheme = () => {
    const isDark = document.body.classList.toggle("dark");
    localStorage.setItem("theme", isDark ? "dark" : "light");
  };

  return (
    <div className="welcome-page">

      {/* Theme Toggle */}
      <div className="theme-toggle" onClick={toggleTheme}>
        🌙Mode
      </div>

      {/* Overlay */}
      <div className="overlay"></div>
      
      {/* Stars (only visible in dark mode) */}
      <div className="stars"></div>

      {/* Main Content */}
      <div className="welcome-container">

        <h1 className="main-title">🌤 WeatherWise Insight</h1>

        <h2 className="tagline">Your Weather Buddy</h2>

        <p className="subtitle">
          Smart • Real-Time • Beautiful Weather Experience
        </p>

        <button className="enter-btn" onClick={onEnter}>
          Enter App →
        </button>

      </div>

      {/* Infinite Cloud Layers */}
      <div className="cloud-layer layer1">
        <div className="cloud"></div>
        <div className="cloud"></div>
        <div className="cloud"></div>
        <div className="cloud"></div>
        <div className="cloud"></div>
      </div>

      <div className="cloud-layer layer2">
        <div className="cloud"></div>
        <div className="cloud"></div>
        <div className="cloud"></div>
        <div className="cloud"></div>
        <div className="cloud"></div>
      </div>

      {/* Sun / Moon */}
      <div className="sun"></div>
      
    </div>
  );
};

export default Welcome;