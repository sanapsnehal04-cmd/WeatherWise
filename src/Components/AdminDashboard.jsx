import React, { useEffect, useState } from "react";
import "../Styles/Admin.css";

const AdminDashboard = () => {

  const [stats, setStats] = useState(null);
  const [alerts, setAlerts] = useState([]);
  const [message, setMessage] = useState("");
  const [city, setCity] = useState("");

  useEffect(() => {

    // Fetch stats
    fetch("http://localhost/weather-backend/api/adminStats.php")
      .then(res => res.json())
      .then(data => setStats(data))
      .catch(err => console.error("Stats error:", err));

    // Fetch alerts
    fetch("http://localhost/weather-backend/api/getAlerts.php")
      .then(res => res.json())
      .then(data => setAlerts(data))
      .catch(err => console.error("Alerts error:", err));

  }, []);

  const handleAddAlert = async () => {
    if (!message || !city) return alert("Fill all fields");

    try {
      await fetch("http://localhost/weather-backend/api/addAlert.php", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ message, city })
      });

      setMessage("");
      setCity("");

      window.location.reload(); // kept as per your original logic

    } catch (err) {
      console.error("Add alert error:", err);
    }
  };

  const deleteAlert = async (id) => {
    try {
      await fetch("http://localhost/weather-backend/api/deleteAlert.php", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id })
      });

      setAlerts(prev => prev.filter(a => a.id !== id));

    } catch (err) {
      console.error("Delete alert error:", err);
    }
  };

  if (!stats) return <h2>Loading...</h2>;

  return (
    <div className="admin-container">

      <h2>🧑‍💼 Admin Dashboard</h2>

      <div className="admin-cards">
        <div className="card">👥 Users: {stats.users}</div>
        <div className="card">🔍 Searches: {stats.searches}</div>
        <div className="card">⭐ Favorites: {stats.favorites}</div>
      </div>

      <div className="top-cities">
        <h3>🌍 Top Searched Cities</h3>

        {stats.topCities && stats.topCities.map((c, i) => (
          <p key={i}>{c.city} ({c.count})</p>
        ))}
      </div>

      <div className="alert-section">

        <h3>🚨 Manage Alerts</h3>

        <div className="alert-form">
          <input
            placeholder="City (or 'global')"
            value={city}
            onChange={(e) => setCity(e.target.value)}
          />

          <input
            placeholder="Alert message"
            value={message}
            onChange={(e) => setMessage(e.target.value)}
          />

          <button onClick={handleAddAlert}>➕ Add</button>
        </div>

        <div className="alert-list">
          {alerts.length > 0 ? (
            alerts.map(a => (
              <div key={a.id} className="alert-card">
                <span>📍 {a.city}</span>
                <p>{a.message}</p>
                <button onClick={() => deleteAlert(a.id)}>❌</button>
              </div>
            ))
          ) : (
            <p>No alerts available 🚀</p>
          )}
        </div>

      </div>

    </div>
  );
};

export default AdminDashboard;