import { useEffect, useState } from 'react'
import {
  getDailyLog, saveDailyLog,
  getTreatments, getTreatmentLogs, saveTreatmentLog,
  getWorkouts, createWorkout, deleteWorkout,
} from '../api'
import { todayStr, yesterdayOf } from '../lib/dates'
import WeatherCard from './WeatherCard'
import RunPlanSection from './RunPlanSection'

const DAY_CODES = ['SUN', 'MON', 'TUE', 'WED', 'THU', 'FRI', 'SAT']

function isDueToday(schedule, date) {
  if (schedule === 'DAILY') return true
  const todayCode = DAY_CODES[new Date(`${date}T00:00:00`).getDay()]
  return schedule.split(',').includes(todayCode)
}

const EMPTY_LOG = {
  sleepHours: '', onSchedule: false, restingHr: '', weightKg: '',
  proteinG: '', alcoholDrinks: '', morningErection: false, notes: '',
}

export default function TodayView() {
  const [date, setDate] = useState(todayStr())
  const [log, setLog] = useState(EMPTY_LOG)
  const [treatments, setTreatments] = useState([])
  const [treatmentLogs, setTreatmentLogs] = useState({})
  const [workouts, setWorkouts] = useState([])
  const [newStrength, setNewStrength] = useState({ subtype: '', minutes: '' })
  const [newCardio, setNewCardio] = useState({ type: 'RUN', subtype: '', minutes: '', distanceKm: '', outdoor: false })
  const [status, setStatus] = useState('')
  const [runPlanRefreshKey, setRunPlanRefreshKey] = useState(0)

  useEffect(() => {
    getTreatments().then((t) => setTreatments(t ?? []))
  }, [])

  useEffect(() => {
    let active = true
    setStatus('')

    getDailyLog(date).then(async (existing) => {
      if (!active) return
      if (existing) {
        setLog({ ...EMPTY_LOG, ...existing })
        return
      }
      const prior = await getDailyLog(yesterdayOf(date))
      if (!active) return
      setLog(prior ? { ...EMPTY_LOG, ...prior } : EMPTY_LOG)
    })

    getTreatmentLogs(date).then((logs) => {
      if (!active) return
      const map = {}
      for (const l of logs ?? []) map[l.treatmentId] = l
      setTreatmentLogs(map)
    })

    getWorkouts(date).then((w) => active && setWorkouts(w ?? []))

    return () => { active = false }
  }, [date])

  function updateField(field, value) {
    setLog((prev) => ({ ...prev, [field]: value }))
  }

  async function handleSave() {
    setStatus('Saving…')
    const payload = {
      ...log,
      sleepHours: log.sleepHours === '' ? null : Number(log.sleepHours),
      restingHr: log.restingHr === '' ? null : Number(log.restingHr),
      weightKg: log.weightKg === '' ? null : Number(log.weightKg),
      proteinG: log.proteinG === '' ? null : Number(log.proteinG),
      alcoholDrinks: log.alcoholDrinks === '' ? null : Number(log.alcoholDrinks),
    }
    await saveDailyLog(date, payload)
    setStatus('Saved ✓')
  }

  async function handleToggleTreatment(treatmentId, done) {
    const existing = treatmentLogs[treatmentId] ?? {}
    const saved = await saveTreatmentLog(date, treatmentId, { ...existing, done })
    setTreatmentLogs((prev) => ({ ...prev, [treatmentId]: saved }))
  }

  async function handleAddStrength() {
    if (!newStrength.minutes) return
    const created = await createWorkout({
      date,
      type: 'STRENGTH',
      subtype: newStrength.subtype || null,
      minutes: Number(newStrength.minutes),
      distanceKm: null,
      outdoor: null,
    })
    setWorkouts((prev) => [created, ...prev])
    setNewStrength({ subtype: '', minutes: '' })
  }

  async function handleAddCardio() {
    if (!newCardio.minutes && !newCardio.distanceKm) return
    const created = await createWorkout({
      date,
      type: newCardio.type,
      subtype: newCardio.subtype || null,
      minutes: newCardio.minutes ? Number(newCardio.minutes) : null,
      distanceKm: newCardio.distanceKm ? Number(newCardio.distanceKm) : null,
      outdoor: newCardio.outdoor,
    })
    setWorkouts((prev) => [created, ...prev])
    setNewCardio({ type: 'RUN', subtype: '', minutes: '', distanceKm: '', outdoor: false })
    if (created.type === 'RUN') setRunPlanRefreshKey((k) => k + 1)
  }

  async function handleDeleteWorkout(id) {
    const deleted = workouts.find((w) => w.id === id)
    await deleteWorkout(id)
    setWorkouts((prev) => prev.filter((w) => w.id !== id))
    if (deleted?.type === 'RUN') setRunPlanRefreshKey((k) => k + 1)
  }

  const dueTreatments = treatments.filter((t) => isDueToday(t.schedule, date))
  const strengthWorkouts = workouts.filter((w) => w.type === 'STRENGTH')
  const cardioWorkouts = workouts.filter((w) => w.type === 'RUN' || w.type === 'CARDIO')

  return (
    <>
      <div className="day-picker">
        <input type="date" value={date} onChange={(e) => setDate(e.target.value)} />
      </div>

      <section className="card">
        <h2>Today</h2>

        <label>Sleep (hours)
          <input type="number" step="0.1" value={log.sleepHours}
            onChange={(e) => updateField('sleepHours', e.target.value)} />
        </label>

        <label className="checkbox">
          <input type="checkbox" checked={!!log.onSchedule}
            onChange={(e) => updateField('onSchedule', e.target.checked)} />
          Bed/wake on schedule
        </label>

        <label>Resting heart rate (bpm)
          <input type="number" value={log.restingHr}
            onChange={(e) => updateField('restingHr', e.target.value)} />
        </label>

        <label>Weight (kg)
          <input type="number" step="0.1" value={log.weightKg}
            onChange={(e) => updateField('weightKg', e.target.value)} />
        </label>

        <label>Protein (g)
          <input type="number" value={log.proteinG}
            onChange={(e) => updateField('proteinG', e.target.value)} />
        </label>

        <label>Alcoholic drinks
          <input type="number" value={log.alcoholDrinks}
            onChange={(e) => updateField('alcoholDrinks', e.target.value)} />
        </label>

        <label className="checkbox">
          <input type="checkbox" checked={!!log.morningErection}
            onChange={(e) => updateField('morningErection', e.target.checked)} />
          Morning erection
        </label>

        <label>Notes
          <textarea value={log.notes ?? ''} onChange={(e) => updateField('notes', e.target.value)} />
        </label>

        <button onClick={handleSave}>Save day</button>
        {status && <span className="status">{status}</span>}
      </section>

      <section className="card">
        <h2>Hair routine</h2>
        {dueTreatments.length === 0 && <p>Nothing due today.</p>}
        {dueTreatments.map((t) => (
          <label key={t.id} className="checkbox">
            <input type="checkbox" checked={!!treatmentLogs[t.id]?.done}
              onChange={(e) => handleToggleTreatment(t.id, e.target.checked)} />
            {t.name}
          </label>
        ))}
      </section>

      <section className="card">
        <h2>Strength</h2>
        {strengthWorkouts.map((w) => (
          <div key={w.id} className="workout-row">
            <span>{w.subtype ? `${w.subtype} · ` : ''}{w.minutes}min</span>
            <button onClick={() => handleDeleteWorkout(w.id)}>✕</button>
          </div>
        ))}

        <div className="workout-form">
          <input placeholder="type (calisthenics, gym...)" value={newStrength.subtype}
            onChange={(e) => setNewStrength((p) => ({ ...p, subtype: e.target.value }))} />
          <input type="number" placeholder="minutes" value={newStrength.minutes}
            onChange={(e) => setNewStrength((p) => ({ ...p, minutes: e.target.value }))} />
          <button onClick={handleAddStrength}>Add strength session</button>
        </div>
      </section>

      <WeatherCard />
      <RunPlanSection key={runPlanRefreshKey} />

      <section className="card">
        <h2>Cardio</h2>
        {cardioWorkouts.map((w) => (
          <div key={w.id} className="workout-row">
            <span>{w.type === 'RUN' ? 'Run' : 'Cardio'}{w.subtype ? ` · ${w.subtype}` : ''}{w.minutes ? ` · ${w.minutes}min` : ''}{w.distanceKm ? ` · ${w.distanceKm}km` : ''}</span>
            <button onClick={() => handleDeleteWorkout(w.id)}>✕</button>
          </div>
        ))}

        <div className="workout-form">
          <select value={newCardio.type}
            onChange={(e) => setNewCardio((p) => ({ ...p, type: e.target.value, subtype: '' }))}>
            <option value="RUN">Run</option>
            <option value="CARDIO">Other cardio</option>
          </select>
          {newCardio.type === 'RUN' ? (
            <select value={newCardio.subtype}
              onChange={(e) => setNewCardio((p) => ({ ...p, subtype: e.target.value }))}>
              <option value="">Run type…</option>
              <option value="Base">Base</option>
              <option value="Tempo">Tempo</option>
              <option value="Long">Long</option>
            </select>
          ) : (
            <input placeholder="type (treadmill, rower, bike...)" value={newCardio.subtype}
              onChange={(e) => setNewCardio((p) => ({ ...p, subtype: e.target.value }))} />
          )}
          <input type="number" placeholder="minutes" value={newCardio.minutes}
            onChange={(e) => setNewCardio((p) => ({ ...p, minutes: e.target.value }))} />
          <input type="number" placeholder="km" value={newCardio.distanceKm}
            onChange={(e) => setNewCardio((p) => ({ ...p, distanceKm: e.target.value }))} />
          <label className="checkbox">
            <input type="checkbox" checked={newCardio.outdoor}
              onChange={(e) => setNewCardio((p) => ({ ...p, outdoor: e.target.checked }))} />
            Outdoor
          </label>
          <button onClick={handleAddCardio}>Add cardio session</button>
        </div>
      </section>
    </>
  )
}
