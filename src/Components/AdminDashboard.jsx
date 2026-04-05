import React, { useEffect, useState } from "react";
import "../Styles/Admin.css";
import CountUp from "react-countup";

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
    const fetchAll = () => {
      fetch("http://localhost/weather-backend/api/adminStats.php", { credentials: "include" })
        .then(res => res.json())
        .then(setStats);

      fetch("http://localhost/weather-backend/api/getAlerts.php", { credentials: "include" })
        .then(res => res.json())
        .then(setAlerts);

      fetch("http://localhost/weather-backend/api/getDailyStats.php", { credentials: "include" })
        .then(res => res.json())
        .then(setDailyStats);

      fetch("http://localhost/weather-backend/api/getUsers.php", { credentials: "include" })
        .then(res => res.json())
        .then(setUsers);

      fetch("http://localhost/weather-backend/api/getTrends.php", { credentials: "include" })
        .then(res => res.json())
        .then(setTrends);

      fetch("http://localhost/weather-backend/api/getTopUser.php", { credentials: "include" })
      .then(res => res.json())
      .then(data => setTopUser(data))
    };

    fetchAll(); // initial load
    const interval = setInterval(fetchAll, 10000); // every 10 sec
    return () => clearInterval(interval);
  }, []);

  const currentWeek = dailyStats.slice(-7);
  const previousWeek = dailyStats.slice(-14, -7);

  const currentTotal = currentWeek.reduce((sum, d) => sum + d.count, 0);
  const previousTotal = previousWeek.reduce((sum, d) => sum + d.count, 0);

  const percentChange =
    previousTotal === 0
      ? 100
      : ((currentTotal - previousTotal) / previousTotal) * 100;

  const trendType =
    percentChange > 5
      ? "up"
      : percentChange < -5
      ? "down"
      : "neutral";

  let trendLabel = "Stable";
  let trendClass = "neutral";

  if (percentChange > 10) {
    trendLabel = "Strong Growth";
    trendClass = "up";
  } else if (percentChange > 3) {
    trendLabel = "Increasing";
    trendClass = "up";
  } else if (percentChange < -10) {
    trendLabel = "Sharp Drop";
    trendClass = "down";
  } else if (percentChange < -3) {
    trendLabel = "Decreasing";
    trendClass = "down";
  }

  let insightText = "Usage is stable.";

  if (trendClass === "up") {
    insightText = `Search activity rising, driven by ${
      trends?.topCity?.city || "user demand"
    }`;
  }

  if (trendClass === "down") {
    insightText =
      "User engagement is dropping, monitor alerts or UX issues.";
  }

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
          <div className="status live">
            <span className="pulse"></span>
            System Healthy
          </div>
        </div>

        {/* DASHBOARD */}
        {activeTab === "dashboard" && (
          <>

            {/* STATS */}
            <div className="stats-grid">

              <div className="stat-card modern blue">
                <div>
                  <h4>Users</h4>
                  <p><CountUp end={stats.users} duration={1.5} /></p>
                </div>
                <div className="stat-icon">👤</div>
              </div>

              <div className="stat-card modern purple">
                <div>
                  <h4>Searches</h4>
                  <p><CountUp end={stats.searches} duration={1.5} /></p>
                </div>
                <div className="stat-icon">🔍</div>
              </div>

              <div className="stat-card modern orange">
                <div>
                  <h4>Favorites</h4>
                  <p><CountUp end={stats.favorites} duration={1.5} /></p>
                </div>
                <div className="stat-icon">⭐</div>
              </div>

            </div>

            {/* INSIGHTS */}
            <div className="insights-grid">

              {topUser && (
                <div className="insight-card modern">
                <div className="recent-activity">
                <h4>🏆 Top User</h4> </div>

                <p className="primary">{topUser.email}</p>

                <div className="progress-bar">
                  <div
                    className="progress-fill"
                    style={{ width: `${Math.min(topUser.searches, 100)}%` }}
                  ></div>
                </div>

                <span>{topUser.searches} searches</span>
                </div>
              )}

              {trends?.topCity && (
                <div className="insight-card modern">
                  <div className="recent-activity">
                  <h4>🌍 Trending City</h4> </div>
                  <p>{trends.topCity.city}</p> 
                  <span>{trends.topCity.count} searches</span>
                </div>
              )}

              <div className="insight-card modern alert">           
                  <div className="recent-activity">
                  <h4>🚨 Active Alerts</h4> </div>            
                    <p>{alerts.length}</p>
                    <span>Live monitoring</span>
              </div>
            </div>


            {/* MINI ANALYTICS */}
            <div className="mini-analytics">

              <div className="mid-grid">
                <div className="mini-card">

                  <h4>📊 Weekly Searches</h4>
                  <p className="big">{currentTotal}</p>

                  <span className={`trend ${trendType}`}>
                    {trendType === "up" && `↑ ${percentChange.toFixed(1)}% from last week`}
                    {trendType === "down" && `↓ ${Math.abs(percentChange).toFixed(1)}% from last week`}
                    {trendType === "neutral" && `→ No significant change`}
                  </span>

                  <ResponsiveContainer width="100%" height={80}>
                    <BarChart data={dailyStats}>
                      <Bar dataKey="count" radius={[4,4,0,0]} />
                    </BarChart>
                  </ResponsiveContainer>
                  </div>

                  <div className="mini-card">

                    <h4>📈 Trend Insight</h4>
                    <p className={`trend-label ${trendClass}`}>
                      {trendClass === "up" && "📈 " + trendLabel}
                      {trendClass === "down" && "📉 " + trendLabel}
                      {trendClass === "neutral" && "➖ Stable"}
                    </p>
                    <span className="sub-text">AI-based analysis</span>
                    <span>{insightText}</span>
                  </div>
                </div>
              </div>

            {/* RECENT ALERTS */}
            <div className="recent-activity-alert">

              <h3>🕒 Recent Alerts</h3>

              {alerts.length > 0 ? (
                alerts.slice(0, 4).map(a => (
                  <div key={a.id} className="activity-item">
                    <div>
                      <strong>📍 {a.city}</strong>
                      <p>{a.message}</p>
                    </div>
                    <span className="dot"></span>
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
          <div className="analytics-layout">

            {/* MAIN CHART */}
            <div className="chart-card modern">
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
                  <XAxis dataKey="day" />
                  <YAxis />
                  <Tooltip />

                  <Bar
                    dataKey="count"
                    radius={[8, 8, 0, 0]}
                    animationDuration={1200}
                  />
                </BarChart>
              </ResponsiveContainer>
            </div>

            {/* SIDE ANALYTICS */}
            <div className="analytics-side">

              {/* TRENDING CITY */}
              <div className="mini-card-modern">
                <h4>🌍 Trending City</h4>
                <p>{trends?.topCity?.city}</p>

                <div className="progress-bar">
                  <div
                    className="progress-fill city"
                    style={{ width: "70%" }}
                  ></div>
                </div>

                <span>{trends?.topCity?.count} searches</span>
              </div>

              {/* TREND INSIGHT */}
              <div className="mini-card-modern">
                <h4>📈 Trend Insight</h4>

                <p className={`trend-label ${trends?.trend === "increasing" ? "up" : "down"}`}>
                  {trends?.trend === "increasing" ? "📈 Increasing" : "📉 Decreasing"}
                </p>

                <span className="sub-text">Based on weekly data</span>
              </div>

            </div>
          </div>
        )}

        {/* USERS */}
        {activeTab === "users" && (
          <div className="users-layout">

            {/* TOP USER CARD */}
            {topUser && (
              <div className="mini-card modern">
                <h4>🏆 Top User</h4>
                <p>{topUser.email}</p>

                <div className="progress-bar">
                  <div className="progress-fill"></div>
                </div>

                <span>{topUser.searches} searches</span>
              </div>
            )}

            {/* USERS TABLE */}
            <div className="table-card modern">
              <h3>👤 All Users</h3>

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

          </div>
        )}

        {/* ALERTS */}
        {activeTab === "alerts" && (
          <div className="alerts-layout">

            {/* ADD ALERT */}
            <div className="mini-card modern">
              <h3>➕ Add Alert</h3>

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
            </div>

            {/* ALERT LIST */}
            <div className="alert-card-container modern">
              <h3>🚨 Active Alerts</h3>

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
                <p style={{ opacity: 0.6 }}>No active alerts</p>
              )}
            </div>

          </div>
        )}

      </div>
    </div>
  );
};

export default AdminDashboard;