import React, { useEffect, useState } from "react";
import "../Styles/Admin.css";

import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  CartesianGrid
} from "recharts";

const AdminDashboard = () => {

  const [stats, setStats] = useState(null);
  const [alerts, setAlerts] = useState([]);
  const [message, setMessage] = useState("");
  const [city, setCity] = useState("");
  const [dailyStats, setDailyStats] = useState([]);
  const [users, setUsers] = useState([]);
  const [topUser, setTopUser] = useState(null);
  const [trends, setTrends] = useState(null);
  const [expiry, setExpiry] = useState("");
  const [activeTab, setActiveTab] = useState("dashboard");

  useEffect(() => {

    fetch("http://localhost/weather-backend/api/adminStats.php", {
      credentials: "include"
    })
      .then(res => res.json())
      .then(data => setStats(data))
      .catch(err => console.error(err));

    fetch("http://localhost/weather-backend/api/getAlerts.php", {
      credentials: "include"
    })
      .then(res => res.json())
      .then(data => setAlerts(data))
      .catch(err => console.error(err));

    fetch("http://localhost/weather-backend/api/getDailyStats.php", {
      credentials: "include"
    })
      .then(res => res.json())
      .then(data => setDailyStats(data))
      .catch(err => console.error(err));

    fetch("http://localhost/weather-backend/api/getUsers.php", {
      credentials: "include"
    })
      .then(res => res.json())
      .then(data => setUsers(data))
      .catch(err => console.error(err));

    fetch("http://localhost/weather-backend/api/getTopUser.php", {
      credentials: "include"
    })
      .then(res => res.json())
      .then(data => setTopUser(data))
      .catch(err => console.error(err));

    fetch("http://localhost/weather-backend/api/getTrends.php", {
      credentials: "include"
    })
      .then(res => res.json())
      .then(data => setTrends(data))
      .catch(err => console.error(err));

  }, []);

  const handleAddAlert = async () => {
    if (!message || !city) {
      alert("Fill all fields");
      return;
    }

    try {
      const res = await fetch("http://localhost/weather-backend/api/addAlert.php", {
        credentials: "include",
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          message,
          city,
          expiry: expiry ? Number(expiry) : null
        })
      });

      const data = await res.json(); 
      console.log("Response:", data);

      if (data.status === "success") {
        setMessage("");
        setCity("");
        setExpiry("");

        const updated = await fetch("http://localhost/weather-backend/api/getAlerts.php", {
          credentials: "include"
        });

        const newAlerts = await updated.json();
        setAlerts(newAlerts);
      } else {
        alert("Failed to add alert");
      }

    } catch (err) {
      console.error("Add alert error:", err);
    }
  };

  const deleteAlert = async (id) => {
    try {
      await fetch("http://localhost/weather-backend/api/deleteAlert.php", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({ id })
      });

      setAlerts(prev => prev.filter(a => a.id !== id));

    } catch (err) {
      console.error(err);
    }
  };

  if (!stats) return <h2>Loading...</h2>;

  return (
    <div className="admin-layout">

      {/* Sidebar */}
      <aside className="sidebar">
        <h2>🌦 Weather Admin</h2>
        <nav>
          <p
            className={activeTab === "dashboard" ? "active" : ""}
            onClick={() => setActiveTab("dashboard")}
          >
            Dashboard
          </p>

          <p
            className={activeTab === "analytics" ? "active" : ""}
            onClick={() => setActiveTab("analytics")}
          >
            Analytics
          </p>

          <p
            className={activeTab === "users" ? "active" : ""}
            onClick={() => setActiveTab("users")}
          >
            Users
          </p>

          <p
            className={activeTab === "alerts" ? "active" : ""}
            onClick={() => setActiveTab("alerts")}
          >
            Alerts
          </p>
        </nav>
      </aside>

      {/* Main Content */}
      <div className="main-content">

        {/* Header */}
        <div className="header">
          <div>
            <h2>Admin Dashboard</h2>
            <p>Weather Monitoring System</p>
          </div>
          <div className="status">🟢 System Healthy</div>
        </div>

        {/* DASHBOARD */}
        {activeTab === "dashboard" && (
          <>

            {/* STATS */}
            <div className="stats-grid">
              <div className="stat-card">
                <h4>Users</h4>
                <p>{stats.users}</p>
              </div>
              <div className="stat-card">
                <h4>Searches</h4>
                <p>{stats.searches}</p>
              </div>
              <div className="stat-card">
                <h4>Favorites</h4>
                <p>{stats.favorites}</p>
              </div>
            </div>

            {/* INSIGHTS */}
            <div className="insights-grid">

              {topUser && (
                <div className="insight-card">
                  <h4>🏆 Top User</h4>
                  <p>{topUser.email}</p>
                  <span>{topUser.searches} searches</span>
                </div>
              )}

              {trends?.topCity && (
                <div className="insight-card">
                  <h4>🌍 Trending City</h4>
                  <p>{trends.topCity.city}</p>
                  <span>{trends.topCity.count} searches</span>
                </div>
              )}

              <div className="insight-card">
                <h4>🚨 Active Alerts</h4>
                <p>{alerts.length}</p>
                <span>Currently running</span>
              </div>

            </div>

            {/* MINI ANALYTICS */}
            <div className="mini-analytics">

              <div className="mini-card">
                <h4>📊 Weekly Searches</h4>
                <p>
                  {dailyStats.reduce((sum, d) => sum + d.count, 0)}
                </p>
              </div>

              <div className="mini-card">
                <h4>📈 Trend Insight</h4>
                <p>{trends?.trend || "No data available"}</p>
              </div>

            </div>

            {/* RECENT ALERTS */}
            <div className="recent-activity">

              <h3>🕒 Recent Alerts</h3>

              {alerts.length > 0 ? (
                alerts.slice(0, 3).map(a => (
                  <div key={a.id} className="activity-item">
                    <span>📍 {a.city}</span>
                    <small>{a.message}</small>
                  </div>
                ))
              ) : (
                <p style={{ opacity: 0.6 }}>No recent alerts</p>
              )}

            </div>

          </>
        )}

        {/* ANALYTICS */}
        {activeTab === "analytics" && (
          <div className="charts-grid">

            <div className="chart-card">
              <h3>📊 Weekly Activity</h3>

              <ResponsiveContainer width="100%" height={300}>
                <BarChart
                  data={dailyStats.map(d => ({
                    ...d,
                    day: new Date(d.date).toLocaleDateString("en-IN", {
                      weekday: "short"
                    })
                  }))}
                >
                  <CartesianGrid strokeDasharray="3 3" opacity={0.2} />
                  <XAxis dataKey="day" stroke="#94a3b8" />
                  <YAxis stroke="#94a3b8" />
                  <Tooltip
                    contentStyle={{
                      background: "#020617",
                      border: "1px solid #334155",
                      borderRadius: "10px",
                      color: "#fff"
                    }}
                  />

                  <Bar dataKey="count" fill="url(#barGradient)" radius={[8, 8, 0, 0]}>
                    <defs>
                      <linearGradient id="barGradient" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="0%" stopColor="#60a5fa" stopOpacity={1}/>
                        <stop offset="100%" stopColor="#2563eb" stopOpacity={0.8}/>
                      </linearGradient>
                    </defs>
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            </div>

            <div className="chart-card">
              <h3>🌍 Top Cities</h3>

              {stats.topCities && stats.topCities.map((c, i) => {
                const max = Math.max(...stats.topCities.map(x => x.count), 1);

                return (
                  <div key={i} className="city-row modern">
                    
                    <div className="city-rank">#{i + 1}</div>

                    <div className="city-details">
                      <span className="city-name">{c.city}</span>
                      <span className="city-count">{c.count}</span>
                    </div>

                    <div className="city-bar">
                      <div
                        className="city-fill"
                        style={{ width: `${(c.count / max) * 100}%` }}
                      ></div>
                    </div>

                  </div>
                );
              })}
            </div>

          </div>
        )}

        {/* USERS */}
        {activeTab === "users" && (
          <div className="table-card">
            <h3>👤 Users</h3>

            <div className="user-header">
              <span>Email</span>
              <span>Searches</span>
              <span>Favorites</span>
            </div>

            {users.map((u) => (
              <div key={u.id} className="user-row">
                <span>{u.email}</span>
                <span>{u.searches}</span>
                <span>{u.favorites}</span>
              </div>
            ))}
          </div>
        )}

        {/* ALERTS */}
        {activeTab === "alerts" && (
          <div className="alert-card-container">
            <h3>🚨 Alerts</h3>

            <div className="alert-form modern">

              <input
                placeholder="📍 City"
                value={city}
                onChange={(e) => setCity(e.target.value)}
              />

              <input
                placeholder="💬 Message"
                value={message}
                onChange={(e) => setMessage(e.target.value)}
              />

              <input
                type="number"
                placeholder="⏱ Expiry (hrs)"
                value={expiry}
                onChange={(e) => setExpiry(e.target.value)}
              />

              <button onClick={handleAddAlert}>
                ➕ Add Alert
              </button>

            </div>

            <div>
              {alerts.length > 0 ? (
                alerts.map(a => (
                <div key={a.id} className="alert-card modern">
                  <div>
                    <strong>📍 {a.city}</strong>
                    <p>{a.message}</p>
                  </div>

                  <button onClick={() => deleteAlert(a.id)}>✖</button>
                </div>
                ))
              ) : (
                <p style={{ opacity: 0.6 }}>🚀 No active alerts</p>
              )}
            </div>

          </div>
        )}

      </div>
    </div>
  );
};

export default AdminDashboard;