import { useEffect, useState } from 'react'
import { getDailyLogsRange, getWorkoutsRange, getTreatmentLogsRange, getTreatments, getBodyMeasurements, getCurrentTargets } from '../api'
import { todayStr, daysBefore } from '../lib/dates'
import { computeScorecard } from '../lib/trends'
import TrendChart from './TrendChart'

const RANGES = [{ label: '4 weeks', weeks: 4 }, { label: '12 weeks', weeks: 12 }, { label: '26 weeks', weeks: 26 }]

export default function TrendsView() {
  const [rangeWeeks, setRangeWeeks] = useState(4)
  const [dailyLogs, setDailyLogs] = useState([])
  const [workouts, setWorkouts] = useState([])
  const [bodyMeasurements, setBodyMeasurements] = useState([])
  const [treatmentLogs, setTreatmentLogs] = useState([])
  const [treatments, setTreatments] = useState([])
  const [targets, setTargets] = useState({})

  const to = todayStr()
  const from = daysBefore(to, rangeWeeks * 7)
  const weekStart = daysBefore(to, 6)

  useEffect(() => {
    getDailyLogsRange(from, to).then((l) => setDailyLogs(l ?? []))
    getWorkoutsRange(from, to).then((w) => setWorkouts(w ?? []))
    getTreatmentLogsRange(from, to).then((l) => setTreatmentLogs(l ?? []))
    getTreatments().then((t) => setTreatments(t ?? []))
    getBodyMeasurements().then((m) => setBodyMeasurements((m ?? []).filter((x) => x.date >= from)))
    getCurrentTargets().then((t) => setTargets(t ?? {}))
  }, [from, to])

  const weeklyLogs = dailyLogs.filter((l) => l.date >= weekStart)
  const weeklyWorkouts = workouts.filter((w) => w.date >= weekStart)
  const weeklyTreatmentLogs = treatmentLogs.filter((l) => l.date >= weekStart)
  const scorecard = computeScorecard({
    dailyLogs: weeklyLogs, workouts: weeklyWorkouts, treatmentLogs: weeklyTreatmentLogs,
    treatments, from: weekStart, to, targets,
  })

  const weightPoints = dailyLogs.map((l) => ({ date: l.date, value: l.weightKg }))
  const hrPoints = dailyLogs.map((l) => ({ date: l.date, value: l.restingHr }))
  const ratioPoints = [...bodyMeasurements].sort((a, b) => a.date.localeCompare(b.date))
    .map((m) => ({ date: m.date, value: m.ratio }))

  return (
    <>
      <section className="card">
        <h2>This week: {scorecard.metCount} of {scorecard.total}</h2>
        {scorecard.items.map((item) => (
          <div key={item.label} className={`due-row ${item.met ? 'ok' : 'overdue'}`}>
            <span>{item.label}</span>
            <span>{item.detail}</span>
          </div>
        ))}
      </section>

      <section className="card">
        <div className="range-selector">
          {RANGES.map((r) => (
            <button key={r.weeks} className={rangeWeeks === r.weeks ? 'active' : ''}
              onClick={() => setRangeWeeks(r.weeks)}>{r.label}</button>
          ))}
        </div>
        <TrendChart label="Weight" unit="kg" points={weightPoints} />
        <TrendChart label="Waist-to-height ratio" unit="" points={ratioPoints} />
        <TrendChart label="Resting heart rate" unit="bpm" points={hrPoints} />
      </section>
    </>
  )
}
