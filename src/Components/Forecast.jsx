import React, { useEffect, useState } from "react"
import { useLocation, useNavigate } from "react-router-dom"

import {
  LineChart, Line, XAxis, YAxis,
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

      const processed = [todayData, ...processedDays]
      setForecast(processed)
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

  const getSmartAdvice = () => {
    let tips = []

    if (!forecast.length) return tips

    const temps = forecast.map(f => f.temp)
    const pops = forecast.map(f => f.pop)

    const max = Math.max(...temps)
    const min = Math.min(...temps)
    const avg = temps.reduce((a,b)=>a+b,0)/temps.length

    // 🌡 Temperature based
    if (max > 35) tips.push("🔥 High temperatures expected — stay hydrated")
    if (min < 5) tips.push("🧥 Cold weather — wear warm clothes")

    // 🌧 Rain based
    if (pops.some(p => p > 70)) tips.push("🌧 Heavy rain likely — carry umbrella")
    else if (pops.some(p => p > 40)) tips.push("☁ Light rain possible")

    // 🌤 Comfort
    if (avg >= 18 && avg <= 28) tips.push("🌤 Weather looks pleasant for outings")

    // 🌬 Wind-like logic (approx using temp variation)
    if (max - min > 10) tips.push("🌡 Big temperature variation — dress in layers")

    // fallback
    if (tips.length === 0) {
      tips.push("🌈 Overall stable weather conditions")
      tips.push("🚶 Good time for outdoor activities")
    }

    return tips.slice(0, 4) // limit to 4
  }

  const CustomTooltip = ({ active, payload, label }) => {
    if (active && payload && payload.length) {
      return (
        <div style={{
          background: "#1e293b",
          padding: "10px",
          borderRadius: "10px",
          color: "white"
        }}>
          <p>{label}</p>
          <p>🌡 Temp: {payload[0].value}°C</p>
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

  // ================= RAIN TREND =================
  const getRainTrend = () => {
    const rainy = forecast.filter(f => f.pop > 60).length

    if (rainy >= 3) return "Rainy Week"
    if (rainy > 0) return "Mixed Weather"
    return "Dry Week"
  }

  const getTrendDirection = () => {
    if (!forecast.length) return "";

    const temps = forecast.map(f => f.temp);
    return temps[temps.length - 1] > temps[0]
      ? "📈 Rising Trend"
      : "📉 Falling Trend";
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
        <button onClick={()=>navigate("/weather")} className="back-btn">← Back</button>
        <h2 className="title"><b>5 - Day Forecast - {city}</b></h2>
        {alerts && <div className="alert">{alerts}</div>}
      </div>

      {/* CARDS WITH HOURLY */}
      <div className="forecast-grid">
        {forecast.map((day, i) => {

          const active = selectedDay === day.dt_txt

          return (
            <div
              key={i}
              className={`forecast-card ${active ? "active" : ""}`}
              onClick={() => setSelectedDay(active ? null : day.dt_txt)}
            >
              {/* DAY */}
              <p className="day">
                {day.isToday
                  ? "Today"
                  : new Date(day.dt_txt).toLocaleDateString("en-US", {
                      weekday: "short"
                    })}
              </p>

              {/* ICON */}
              <img
                src={`https://openweathermap.org/img/wn/${day.weather[0]?.icon || "01d"}@2x.png`}
                alt=""
              />

              {/* TEMP */}
              <h3>{Math.round(day.temp)}°C</h3>

              {/* MIN / MAX (approx since avg used) */}
              <p className="minmax">
                ↓ {Math.round(day.min)}° | ↑ {Math.round(day.max)}°
              </p>

              {/* RAIN % (not available → fallback 0) */}
              <p className="rain">☁ {day.pop}% </p>

              {/* RATING */}
              <p className="rating">
                ⭐ {Math.min(10, Math.round(day.temp / 3))}/10
              </p>

              {/* HOURLY STRIP */}
              {active && (
              <div className="hourly-wrapper">
                <div className="hourly-strip">
                  {hourlyData[day.dt_txt]?.slice(0,6).map((h, j) => (
                    <div key={j} className="hour-box">
                      <p>{h.time}</p>
                      <span>{Math.round(h.temp)}°</span>
                      <span>☁ {h.pop}%</span>
                    </div>
                  ))}
                </div>
                </div>
              )}
            </div>
          )
        })}
      </div>

      {/* INSIGHT STRIP */}
      <div className="insight-strip">

        <div className="box">
          <p><b>Temperature Analysis--</b></p>
          <p>🌡 Avg: {avgTemp}°C</p>
          <p>🔥 Max: {maxTemp}°C</p>
          <p>❄ Min: {minTemp}°C</p>
        </div>

        <div className="box">
          <p><b>According to WeatherWise-- </b></p>
          <p>  .</p>
          {bestDay && <p>🌟Best Weather Day: {new Date(bestDay.dt_txt).toLocaleDateString("en-US",{weekday:"long"})}</p>}
          {worstDay && <p> ⚠ Worst Weather Day: {new Date(worstDay.dt_txt).toLocaleDateString("en-US",{weekday:"long"})}</p>}
        </div>

        <div className="box">
          <p><b>💡 Advice </b></p>
          <ul className="advice-list">
            {getSmartAdvice().map((tip, i) => (
              <li key={i}>{tip}</li>
            ))}
          </ul>
        </div>

      </div>

      {/* ================= BOTTOM SECTION ================= */}
      <div className="bottom-section">

        {/* LEFT - SUMMARY */}
        <div className="summary-card">
          <h3><em>🌍 Weekly Summary</em></h3>
          <p>{getSummary()}</p>

          <div className="insight">
            🤖 Weather insight: Conditions remain stable with moderate variations.
          </div>
        </div>

        {/* RIGHT - GRID */}
        <div className="extras-grid">

          <div className="extra-box">
            <h4><big>📊 Comfort</big></h4>
            <p>{getComfortScore()}/10</p>
          </div>

          <div className="extra-box">
            <h4><big>📅 Plan Day</big></h4>
            <p>{getPlanDay()}</p>
          </div>

          <div className="extra-box">
            <h4><big>☁ Trend</big></h4>
            <p>{getRainTrend()}</p>
          </div>

          <div className="extra-box">
            <h4><big>📊 Trend</big></h4>
            <p>{getTrendDirection()}</p>
          </div>

          <div className="extra-box">
            <h4><big>⚖ Stability</big></h4>
            <p>{getStabilityScore()}/10</p>
          </div>

          <div className="extra-box">
            <h4><big>⚠ Risk</big></h4>
            <p>{getRiskLevel()}</p>
          </div>

        </div>

      </div>

  

      {/* GRAPHS */}
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
                  <stop offset="0%" stopColor="#00e0ff" stopOpacity={0.8}/>
                  <stop offset="100%" stopColor="#00e0ff" stopOpacity={0}/>
                </linearGradient>
              </defs>

              <CartesianGrid stroke="rgba(255,255,255,0.1)" />

              <XAxis dataKey="day" stroke="#ccc"/>
              <YAxis stroke="#ccc"/>

              <Tooltip content={<CustomTooltip />} />

              <Area
                type="monotone"
                dataKey="temp"
                stroke="#00e0ff"
                fill="url(#tempGradient)"
                strokeWidth={3}
                dot={(props) => {
                  const { cx, cy } = props
                  return (
                    <circle
                      cx={cx}
                      cy={cy}
                      r={4}
                      fill="#00e0ff"
                    />
                  )
                }}
              />
            </AreaChart>
          </ResponsiveContainer>
        </div>

        <div className="graph">
          <h4>Humidity</h4>
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
              <CartesianGrid stroke="rgba(255,255,255,0.1)" />

              <XAxis dataKey="day" stroke="#ccc"/>
              <YAxis stroke="#ccc"/>

              <Tooltip content={<CustomTooltip />} />

              <Bar dataKey="temp">
                {chartData?.map((entry, index) => (
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
                outerRadius={70}
                innerRadius={40}
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