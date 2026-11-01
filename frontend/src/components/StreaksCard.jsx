import { useEffect, useState } from 'react'
import { getTreatments, getTreatmentLogsRange, getDailyLogsRange } from '../api'
import { todayStr, daysBefore, lastNDays } from '../lib/dates'
import { computeAdherenceStreaks, computeDailyLogStreaks } from '../lib/streaks'

const WINDOW_DAYS = 180

export default function StreaksCard() {
  const [treatments, setTreatments] = useState([])
  const [treatmentLogs, setTreatmentLogs] = useState([])
  const [dailyLogDates, setDailyLogDates] = useState(new Set())

  useEffect(() => {
    const to = todayStr()
    const from = daysBefore(to, WINDOW_DAYS - 1)
    getTreatments().then((t) => setTreatments(t ?? []))
    getTreatmentLogsRange(from, to).then((l) => setTreatmentLogs(l ?? []))
    getDailyLogsRange(from, to).then((logs) => setDailyLogDates(new Set((logs ?? []).map((l) => l.date))))
  }, [])

  const days = lastNDays(todayStr(), WINDOW_DAYS)
  const adherence = computeAdherenceStreaks(treatments, treatmentLogs, days)
  const dailyLog = computeDailyLogStreaks(dailyLogDates, days)

  return (
    <section className="card streaks-card">
      <h2>Streaks</h2>
      <div className="streak-row">
        <div className="streak-stat">
          <span className="streak-number">{adherence.current}</span>
          <span className="streak-label">day routine streak</span>
        </div>
        <div className="streak-stat">
          <span className="streak-number">{dailyLog.current}</span>
          <span className="streak-label">day logging streak</span>
        </div>
      </div>
      <p className="status">Best ever: {adherence.best}-day routine · {dailyLog.best}-day logging</p>
    </section>
  )
}
