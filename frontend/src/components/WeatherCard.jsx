import { useEffect, useState } from 'react'
import { getWeatherToday } from '../api'

export default function WeatherCard() {
  const [weather, setWeather] = useState(null)

  useEffect(() => {
    getWeatherToday().then(setWeather)
  }, [])

  if (!weather) return null

  return (
    <section className="card">
      <h2>Today's run weather — {weather.city}</h2>
      <p>High {weather.highF.toFixed(0)}°F / Low {weather.lowF.toFixed(0)}°F · warmest around {weather.warmestHour}</p>
      <p className="status">{weather.clothingGuide}</p>
    </section>
  )
}
