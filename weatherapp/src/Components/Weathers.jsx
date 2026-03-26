import './Weather.css'
import React, { useEffect, useRef, useState } from 'react'
import search_icon from '../assets/search.png'
import clear_icon from '../assets/clear.png'
import cloud_icon from '../assets/cloud.png'
import drizzle_icon from '../assets/drizzle.png'
import rain_icon from '../assets/rain.png'
import snow_icon from '../assets/snow.png'
import humidity_icon from '../assets/humidity.png'
import wind_icon from '../assets/wind.png'

console.log("this is sachin ")

const Weather = () => {
 
  const inputRef =useRef()
  const [weatherData,setWeatherData]=useState(false);  
  const allIcons={
    "01d":clear_icon,
    "01n":clear_icon,
    "02d":cloud_icon,
    "02n":cloud_icon,
    "03d":cloud_icon,
    "03n":cloud_icon,
    "04d":drizzle_icon,
    "04n":drizzle_icon,
    "09d":rain_icon,
    "09n":rain_icon,
    "10d":rain_icon,
    "10n":rain_icon,
    "13d":snow_icon,
    "13n":snow_icon,
  }

  const search = async (city)=>{
    if (city===""){
      alert("Please enter City Name");
      return;
    }
    try{

      const url=`https://api.openweathermap.org/data/2.5/weather?q=${city}&units=metric&appid=${import.meta.env.VITE_APP_ID}`
      const response= await fetch(url)    
      const data = await response.json()
      if(!response.ok)
      {
        alert(data.message);
        return;
      }
      console.log(data)
      const icon =allIcons[data.weather[0].icon] || clear_icon;
      setWeatherData({
        humidity: data.main.humidity,
        windSpeed: data.wind.speed,
        temprature: Math.floor(data.main.temp),
        location: data.name,
        icon:icon
      
      })
    }
    catch(err)
    {
      setWeatherData(false)
      console.error("Error in fetching Weather Data")
    }
  }      
  useEffect(()=>{
search("Dubai");
  },[])

  //modeBtn
const [darkMode,setDarkMode]=useState(false)
const toggle=(()=>{
  setDarkMode(mode=>!mode);
  document.body.style.backgroundColor=darkMode?'white':'black';
  document.body.style.color=darkMode?'black':'white';
  document.body.style.border='2px solid white'
  document.backgroundImage={cloud_icon}
})  


  return (
    

    <div className="weather">
      <div className="search-bar">
        <input ref={inputRef} type="text" placeholder='Search City' />
        <img src={search_icon} alt="srchicon" onClick={()=>search(inputRef.current.value)}/>
      </div>

      {weatherData?<>
      <img src={weatherData.icon} alt="clear-icon" className='weather-icon'/>
      <p className='temprature'>{weatherData.temprature}<sup>o</sup>c</p>
      <p className='location'>{weatherData.location}</p>
      <div className="weather-data">
        <div className="col">
          <img src={humidity_icon} alt="" />
          <div>
            <p>{weatherData.humidity} %</p>
            <span>Humidity</span>
          </div>
        </div>
        <div className="col">
          <img src={wind_icon} alt="" />
          <div>
            <p>{weatherData.windSpeed} Km/hr</p>
            <span>wind speed</span>
          </div>
        </div>
      </div>
      </>:<><h1>No data Available</h1></>} {/* here u can remove h1 tag if you don't want it */}
      <button className='toggleBtn' onClick={toggle}>Mode</button>
      {/* here if weatherData is available then it will be displayed otherWise it won't be displayed */}

    </div>
  )
}

export default Weather






// const ModeBtn=(()=>{
// const [darkMode,setDarkMode]=useState(false);
// const toggleBtn=((e)=>{
//     setDarkMode(Mode =>!Mode);
//     document.body.style.backgroundColor=darkMode?'black':'white';
    
// });

//     return(
//         <>
//         <button onClick={toggleBtn}>ModeBtn</button>
//         </>
//     )
// })
// export default ModeBtn