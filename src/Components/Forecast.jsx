import React, { useEffect, useState } from "react"
import { useLocation, useNavigate } from "react-router-dom"

import {
  XAxis, YAxis,
  Tooltip, ResponsiveContainer,
  BarChart, Bar,
  PieChart, Pie,
  CartesianGrid, Area, AreaChart, Cell
} from "recharts"

import "../Styles/Forecast.css"

const Forecast = () => {

  const [forecast, setForecast] = useState([])
  const [hourlyData, setHourlyData] = useState({})
  const [selectedDay, setSelectedDay] = useState(null)
  const [activeIndex, setActiveIndex] = useState(null)
  const COLORS = ["#60a5fa", "#34d399", "#f97316"]

  const navigate = useNavigate()
  const city = new URLSearchParams(useLocation().search).get("city")

  useEffect(() => {
    const fetchData = async () => {

      const res = await fetch(
        `https://api.openweathermap.org/data/2.5/forecast?q=${city}&units=metric&appid=${import.meta.env.VITE_APP_ID}`
      )
      const data = await res.json()

      const daily = {}
      const hourly = {}

      data.list.forEach(item => {
        const date = item.dt_txt.split(" ")[0]

        // HOURLY DATA
        if (!hourly[date]) hourly[date] = []
        hourly[date].push({
          time: item.dt_txt.split(" ")[1].slice(0, 5),
          temp: item.main.temp,
          pop: item.pop ? Math.round(item.pop * 100) : 0
        })

        // DAILY DATA
        if (!daily[date]) {
          daily[date] = {
            temps: [],
            min: item.main.temp,
            max: item.main.temp,
            pop: 0,
            weather: item.weather
          }
        }

        daily[date].temps.push(item.main.temp)

        // UPDATE MIN/MAX
        daily[date].min = Math.min(daily[date].min, item.main.temp)
        daily[date].max = Math.max(daily[date].max, item.main.temp)

        // TAKE MAX POP (rain chance of day)
        daily[date].pop = Math.max(daily[date].pop, item.pop || 0)
      })

      const dates = Object.keys(daily).sort()

      // TODAY (first date)
      const todayDate = dates[0]

      // NEXT 6 FULL DAYS
      const nextDays = dates.slice(1, 7)

      // TODAY OBJECT (partial data)
      const todayData = {
        dt_txt: todayDate,
        temp: daily[todayDate].temps.reduce((a, b) => a + b, 0) / daily[todayDate].temps.length,
        min: daily[todayDate].min,
        max: daily[todayDate].max,
        pop: Math.round(daily[todayDate].pop * 100),
        weather: daily[todayDate].weather,
        isToday: true
      }

      // FULL DAYS
      const processedDays = nextDays.map(date => ({
        dt_txt: date,
        temp: daily[date].temps.reduce((a, b) => a + b, 0) / daily[date].temps.length,
        min: daily[date].min,
        max: daily[date].max,
        pop: Math.round(daily[date].pop * 100),
        weather: daily[date].weather,
        isToday: false
      }))

      setForecast([todayData, ...processedDays])
      setHourlyData(hourly)

    }

    fetchData()
  }, [city])

  // ================= SAFE DATA =================
  const temps = forecast.map(f => f.temp)
  const avgTemp = temps.length ? Math.round(temps.reduce((a,b)=>a+b,0)/temps.length) : 0
  const maxTemp = temps.length ? Math.max(...temps) : 0
  const minTemp = temps.length ? Math.min(...temps) : 0

  const bestDay = forecast.length ? forecast.reduce((a,b)=>a.temp>b.temp?a:b) : null
  const worstDay = forecast.length ? forecast.reduce((a,b)=>a.temp<b.temp?a:b) : null

  const alerts =
  minTemp < 0
    ? "❄ Freezing temperatures"
    : maxTemp > 35
    ? "🔥 Heatwave alert"
    : forecast.some(f => f.pop > 70)
    ? "🌧 Heavy rain expected"
    : ""

  const chartData = forecast.map(f => ({
    day: new Date(f.dt_txt).toLocaleDateString("en-US",{weekday:"short"}),
    temp: Math.round(f.temp)
  }))

  const pieData = [
    { name: "Cold", value: forecast.filter(f=>f.temp<15).length },
    { name: "Mild", value: forecast.filter(f=>f.temp>=15 && f.temp<=30).length },
    { name: "Hot", value: forecast.filter(f=>f.temp>30).length }
  ]

  const getTempClass = (temp) => {
    if (temp < 15) return "cold"
    if (temp <= 30) return "mild"
    return "hot"
  }

  const getAIInsight = () => {
    if (!forecast.length) return "Analyzing weather..."

    const temps = forecast.map(f => f.temp)
    const pops = forecast.map(f => f.pop)

    const avg = temps.reduce((a,b)=>a+b,0)/temps.length
    const max = Math.max(...temps)
    const min = Math.min(...temps)
    const rainDays = pops.filter(p => p > 60).length

    let insight = ""

    // Temperature logic
    if (avg >= 20 && avg <= 28) {
      insight += "Weather is comfortable for most outdoor activities. "
    } else if (max > 35) {
      insight += "High heat levels detected — avoid outdoor exposure during peak hours. "
    } else if (min < 10) {
      insight += "Cold conditions expected — layering is recommended. "
    }

    // Rain logic
    if (rainDays >= 3) {
      insight += "Frequent rainfall may disrupt travel plans. "
    } else if (rainDays > 0) {
      insight += "Occasional rain expected — keep an umbrella handy. "
    }

    // Variation logic
    if (max - min > 10) {
      insight += "Significant temperature variation throughout the week. "
    }

    // Final recommendation
    insight += `Best day for outdoor plans is ${getPlanDay()}.`

    return insight
  }

  const CustomTooltip = ({ active, payload, label }) => {
    if (active && payload && payload.length) {
      return (
        <div style={{
          background: "rgba(15,23,42,0.9)",
          padding: "10px 14px",
          borderRadius: "10px",
          border: "1px solid rgba(255,255,255,0.1)",
          color: "#fff",
          backdropFilter: "blur(6px)"
        }}>
          <p style={{ fontSize: "13px", opacity: 0.7 }}>{label}</p>
          <p style={{ fontSize: "16px", fontWeight: "bold" }}>
            🌡 {payload[0].value}°C
          </p>
        </div>
      )
    }
    return null
  }

  // ================= WEEKLY SUMMARY =================
  const getSummary = () => {
    if (!forecast.length) return ""

    const temps = forecast.map(f => f.temp)
    const pops = forecast.map(f => f.pop)

    const rising = temps[temps.length - 1] > temps[0]
    const rainDays = pops.filter(p => p > 60).length

    let text = ""

    if (rising) text += "Temperature will gradually rise through the week. "
    else text += "Temperature will gradually decrease through the week. "

    if (rainDays > 2) text += "Frequent rainfall expected. "
    else if (rainDays > 0) text += "Some rainy days ahead. "
    else text += "Mostly dry weather expected. "

    text += "Mid-week looks most stable."

    return text
  }

  // ================= COMFORT SCORE =================
  const getComfortScore = () => {
    if (!forecast.length) return 0

    const avg = avgTemp

    if (avg >= 20 && avg <= 28) return 9
    if (avg >= 15 && avg < 20) return 7
    if (avg > 28 && avg <= 34) return 6
    return 4
  }

  // ================= PLAN DAY =================
  const getPlanDay = () => {
    if (!bestDay) return ""

    return new Date(bestDay.dt_txt).toLocaleDateString("en-US", {
      weekday: "long"
    })
  }

  // ================= TREND =================

  const getTrendDirection = () => {
    if (!forecast.length) return "";

    const temps = forecast.map(f => f.temp);
    return temps[temps.length - 1] > temps[0]
      ? "📈 Rising Trend"
      : "📉 Falling Trend";
  };

  const getRainTrend = () => {
    const rainy = forecast.filter(f => f.pop > 60).length;

    if (rainy >= 3) return "Rainy Week";
    if (rainy > 0) return "Mixed Weather";
    return "Dry Week";
  };

  const getStabilityScore = () => {
    if (!forecast.length) return 0;

    const temps = forecast.map(f => f.temp);
    const diff = Math.max(...temps) - Math.min(...temps);

    if (diff < 5) return 9;
    if (diff < 10) return 7;
    return 5;
  };

  const getRiskLevel = () => {
    const risky = forecast.filter(f => f.pop > 70).length;

    if (risky >= 3) return "🔴 High Risk";
    if (risky > 0) return "🟡 Medium Risk";
    return "🟢 Low Risk";
  };

  //==================================
  //UI
  //==================================

  return (
    <div className="forecast-page">

      {/* HEADER */}
      <div className="forecast-header">
        <button onClick={()=>navigate("/weather")} className="back-btn"> ← Back</button>
        <h1 className="title">5 - Day Forecast - {city}</h1>
        {alerts && <div className="alert-badge">{alerts}</div>}
      </div>

      {/* HERO */}
      <div className="top-section">
        <div className="forecast-grid">
          
        {/* CARDS */}
          {forecast.map((day, i) => (
            <div
              key={i}
              className={`forecast-card 
                ${getTempClass(day.temp)} 
                ${selectedDay === day.dt_txt ? "active" : ""}
                ${bestDay?.dt_txt === day.dt_txt ? "best-day" : ""}`}
              onClick={() => setSelectedDay(day.dt_txt)}
            >
              <p className="day">
                {day.isToday ? "Today" :
                  new Date(day.dt_txt).toLocaleDateString("en-US",{weekday:"short"})}
              </p>

              <img src={`https://openweathermap.org/img/wn/${day.weather[0]?.icon}@2x.png`} alt="" />

              <h3>{Math.round(day.temp)}°C</h3>
              <p className="feels">Feels like {Math.round(day.temp + 1)}°C</p>

              <p className="minmax">
                ↓ {Math.round(day.min)}° || ↑ {Math.round(day.max)}°
              </p>
            </div>
          ))}
        </div>

        <div className="summary-card">
          <h3>🌍 Weekly Summary</h3>
          <p>{getAIInsight()}</p>
        </div>  
      </div>


      {/* HOURLY PANEL */}
      {selectedDay && (
        <div className="hourly-panel">
          <h3>Hourly Forecast</h3>
          <div className="hourly-container">
            {hourlyData[selectedDay]?.map((h,i)=>(
              <div key={i} className="hour-card">
                <p>{h.time}</p>
                <h4>{Math.round(h.temp)}°</h4>
                <p>☁ {h.pop}%</p>
              </div>
            ))}
          </div>
        </div>
      )}

    {/* INSIGHTS SECTION (NEW) */}
    <h2 className="section-title">🧠 Insights</h2>

      <div className="insights-wrapper">

        {/* LEFT - HIGHLIGHTS */}
        <div className="highlights-card">
          <h3>🌟 Highlights</h3>

          <div className="highlights-grid">
            <div className="stat">
              <span className="label">Avg</span>
              <span className="value">{avgTemp}°C</span>
            </div>

            <div className="stat">
              <span className="label">Max</span>
              <span className="value">{maxTemp}°C</span>
            </div>

            <div className="stat">
              <span className="label">Min</span>
              <span className="value">{minTemp}°C</span>
            </div>

            <div className="stat">
              <span className="label">Best</span>
              <span className="value">
                {bestDay && new Date(bestDay.dt_txt).toLocaleDateString("en-US",{weekday:"long"})}
              </span>
            </div>

            <div className="stat">
              <span className="label">Worst</span>
              <span className="value">
                {worstDay && new Date(worstDay.dt_txt).toLocaleDateString("en-US",{weekday:"long"})}
              </span>
            </div>
          </div>

          {/* Progress */}
          <div className="progress-wrapper">
            <span className="progress-label">Weekly Stability</span>
            <div className="progress-bar">
              <div
                className="progress-fill"
                style={{ width: `${getStabilityScore() * 10}%` }}
              />
            </div>
          </div>
        </div>

        {/* RIGHT - METRICS */}
        <div className="metrics-grid">

          <div className="metric-card">
            <p>📊 Comfort</p>
            <h4>{getComfortScore()}/10</h4>
          </div>

          <div className="metric-card">
            <p>📅 Plan Day</p>
            <h4>{getPlanDay()}</h4>
          </div>

          <div className="metric-card">
            <p>☁ Trend</p>
            <h4>{getRainTrend()}</h4>
          </div>

          <div className="metric-card">
            <p>📈 Direction</p>
            <h4>{getTrendDirection()}</h4>
          </div>

          <div className="metric-card">
            <p>⚖ Stability</p>
            <h4>{getStabilityScore()}/10</h4>
          </div>

          <div className="metric-card">
            <p>⚠ Risk</p>
            <h4>{getRiskLevel()}</h4>
          </div>

        </div>

      </div>

      {/* GRAPHS */}
      <h2 className="section-title">📊 Analytics</h2>
      <div className="graph-grid">

        <div className="graph">
          <h4>Temperature Trend</h4>
          <ResponsiveContainer height={220}>
            <AreaChart
              data={chartData}
              onMouseMove={(e) => {
                if (e && typeof e.activeTooltipIndex === "number") {
                  setActiveIndex(e.activeTooltipIndex)
                }
              }}
              onMouseLeave={() => setActiveIndex(null)}
            >
              <defs>
                <linearGradient id="tempGradient" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="#38bdf8" stopOpacity={0.9}/>
                  <stop offset="100%" stopColor="#38bdf8" stopOpacity={0}/>
                </linearGradient>
              </defs>

              <CartesianGrid stroke="rgba(255,255,255,0.08)" />

              <XAxis dataKey="day" stroke="#94a3b8"/>
              <YAxis stroke="#94a3b8"/>

              <Tooltip content={<CustomTooltip />} />

              <Area
                type="monotone"
                dataKey="temp"
                stroke="#38bdf8"
                fill="url(#tempGradient)"
                strokeWidth={3}
                isAnimationActive={true}
                animationDuration={1200}
                dot={(props) => {
                  const { cx, cy, index } = props
                  return (
                    <circle
                      cx={cx}
                      cy={cy}
                      r={index === activeIndex ? 6 : 3}
                      fill={index === activeIndex ? "#22d3ee" : "#38bdf8"}
                    />
                  )
                }}
              />
            </AreaChart>
          </ResponsiveContainer>
        </div>

        <div className="graph">
          <h4>Temperature Bars</h4>
          <ResponsiveContainer height={220}>
            <BarChart
              data={chartData}
              onMouseMove={(e) => {
                if (e && e.activeTooltipIndex !== undefined) {
                  setActiveIndex(e.activeTooltipIndex)
                }
              }}
              onMouseLeave={() => setActiveIndex(null)}
            >
              <CartesianGrid stroke="rgba(255,255,255,0.08)" />

              <XAxis dataKey="day" stroke="#94a3b8"/>
              <YAxis stroke="#94a3b8"/>

              <Tooltip content={<CustomTooltip />} />

              <Bar dataKey="temp" radius={[8, 8, 0, 0]}>
                {chartData.map((entry, index) => (
                  <Cell
                    key={index}
                    fill={index === activeIndex ? "#22d3ee" : "#38bdf8"}
                  />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </div>

        <div className="graph">
          <h4>Distribution</h4>
          <ResponsiveContainer height={220}>
            <PieChart>
              <Tooltip />

              <Pie
                data={pieData}
                dataKey="value"
                outerRadius={80}
                innerRadius={45}
                paddingAngle={3}
                isAnimationActive={true}
                animationDuration={1200}
              >
                {pieData.map((entry, index) => (
                  <Cell
                    key={index}
                    fill={COLORS[index]}
                    stroke={index === activeIndex ? "#fff" : "none"}
                    strokeWidth={2}
                  />
                ))}
              </Pie>
            </PieChart>
          </ResponsiveContainer>
        </div>

      </div>

    </div>
  )
}

export default Forecast