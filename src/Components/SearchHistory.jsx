// ==========================================
// SearchHistory.jsx (Upgraded UI + UX)
// ==========================================

import '../Styles/SearchHistory.css'
import Modebtn from './Modebtn'

import React, { useEffect, useState } from 'react'
import { useNavigate } from "react-router-dom"

const SearchHistory = () => {

  const [searchHistory, setSearchHistory] = useState([])
  const [loading, setLoading] = useState(true)

  const navigate = useNavigate()
  const user_id = localStorage.getItem("user_id")

  // ==============================
  // Fetch History
  // ==============================
  useEffect(() => {

    if (!user_id) {
      setLoading(false)
      return
    }

    const fetchHistory = async () => {
      try {
        const res = await fetch(
          `http://localhost/weather-backend/api/getSearchHistory.php?user_id=${user_id}`
        )

        const data = await res.json()

        if (Array.isArray(data)) {
          // ✅ Latest first
          setSearchHistory(data.reverse())
        } else {
          setSearchHistory([])
        }

      } catch {
        console.log("Error fetching history")
        setSearchHistory([])
      } finally {
        setLoading(false)
      }
    }

    fetchHistory()

  }, [user_id])

  // ==============================
  // Group by Date
  // ==============================
  const groupHistory = (history) => {
    const groups = {
      today: [],
      yesterday: [],
      older: []
    }

    const now = new Date()

    history.forEach(item => {
      const itemDate = new Date(item.searched_at)

      const diffTime = now - itemDate
      const diffDays = Math.floor(diffTime / (1000 * 60 * 60 * 24))

      if (diffDays === 0) {
        groups.today.push(item)
      } else if (diffDays === 1) {
        groups.yesterday.push(item)
      } else {
        groups.older.push(item)
      }
    })

    return groups
  }

  const groupedHistory = groupHistory(searchHistory)

  // ==============================
  // Format Time
  // ==============================
  const formatTime = (time) =>
    new Date(time).toLocaleString()

  // ==============================
  // Navigation
  // ==============================
  const handleCityClick = (city) => {
    navigate(`/weather?city=${city}`)
  }

  const goBackToWeather = () => {
    navigate("/weather")
  }

  // ==============================
  // Remove (UI only)
  // ==============================
  const removeItem = (time) => {
    const updated = searchHistory.filter(
      item => item.searched_at !== time
    )
    setSearchHistory(updated)
  }

  // ==============================
  // Clear All (UI only)
  // ==============================
  const clearAll = () => {
    setSearchHistory([])
  }

  const HistoryCard = ({ item, index, handleCityClick, removeItem, isLatest }) => (
    <div
      className={`history-card ${isLatest ? "latest" : ""}`}
      onClick={() => handleCityClick(item.city)}
    >
      <span className="city-icon">📍</span>

      <div className="city-info">
        <span className="city-name">{item.city}</span>
        <span className="city-time">
          {new Date(item.searched_at).toLocaleString()}
        </span>
      </div>

      <button
        className="remove-btn"
        onClick={(e) => {
          e.stopPropagation()
          removeItem(item.searched_at)
        }}
      >
        ✖
      </button>
    </div>
  )

  // ==============================
  // UI
  // ==============================
  return (

    <div className="history-container">

      <div className="history-header">
        <h2 className="history-title">
          📜 Search History
        </h2>

        <span className="history-count">
          {searchHistory.length} items
        </span>
      </div>

      {/* Back Button */}
      <button
        className="searchHistory-btn back-btn"
        onClick={goBackToWeather}
      >
        ⬅ Back to Weather
      </button>

      {/* Loading */}
      {loading ? (

        <div className="loading-skeleton">
          {[...Array(4)].map((_, i) => (
            <div key={i} className="skeleton-card"></div>
          ))}
        </div>

      ) : searchHistory.length === 0 ? (

        <div className="empty-state">
          <p>🌍 No searches yet</p>
          <span>Start exploring weather around the world</span>
        </div>

      ) : (

        <>
        <div className="history-groups">

          {/* TODAY */}
          {groupedHistory.today.length > 0 && (
            <>
              <h3 className="group-title">📅 Today</h3>
              <div className="history-grid">
                {groupedHistory.today.map((item, index) => (
                  <HistoryCard
                    key={item.id || item.searched_at}
                    item={item}
                    index={index}
                    handleCityClick={handleCityClick}
                    removeItem={removeItem}
                    isLatest={index === 0}
                  />
                ))}
              </div>
            </>
          )}

          {/* YESTERDAY */}
          {groupedHistory.yesterday.length > 0 && (
            <>
              <h3 className="group-title">📅 Yesterday</h3>
              <div className="history-grid">
                {groupedHistory.yesterday.map((item, index) => (
                  <HistoryCard
                    key={item.id || item.searched_at}
                    item={item}
                    index={index}
                    handleCityClick={handleCityClick}
                    removeItem={removeItem}
                  />
                ))}
              </div>
            </>
          )}

          {/* OLDER */}
          {groupedHistory.older.length > 0 && (
            <>
              <h3 className="group-title">📅 Older</h3>
              <div className="history-grid">
                {groupedHistory.older.map((item, index) => (
                  <HistoryCard
                    key={item.id || item.searched_at}
                    item={item}
                    index={index}
                    handleCityClick={handleCityClick}
                    removeItem={removeItem}
                  />
                ))}
              </div>
            </>
          )}

        </div>

          {/* Clear All */}
          <button className="clear-history" onClick={clearAll}>
            🗑 Clear All
          </button>
        </>
      )}

      {/* Dark Mode */}
      <div className="mode-toggle">
        <Modebtn />
      </div>

    </div>
  )
}

export default SearchHistory