import { useEffect, useState } from 'react'
import { getTreatments, createTreatment, updateTreatment, getCurrentTargets, createTarget } from '../api'
import { todayStr } from '../lib/dates'

const TARGET_LABELS = {
  SLEEP_MIN_HOURS: 'Sleep minimum (hours)',
  SLEEP_MAX_HOURS: 'Sleep maximum (hours)',
  ON_SCHEDULE_NIGHTS: 'On-schedule nights per week',
  STRENGTH_SESSIONS: 'Strength sessions per week',
  RUNS: 'Runs per week',
  CARDIO_MINUTES: 'Cardio minutes per week',
  PROTEIN_PER_KG: 'Protein (g per kg body weight)',
  HAIR_ADHERENCE_PCT: 'Hair routine adherence (%)',
}

export default function SettingsView() {
  const [treatments, setTreatments] = useState([])
  const [targets, setTargets] = useState({})
  const [editValues, setEditValues] = useState({})
  const [newTreatment, setNewTreatment] = useState({ name: '', schedule: 'DAILY', startDate: todayStr() })

  useEffect(() => {
    refreshAll()
  }, [])

  function refreshAll() {
    getTreatments().then((t) => setTreatments(t ?? []))
    getCurrentTargets().then((t) => setTargets(t ?? {}))
  }

  async function handleAddTreatment() {
    if (!newTreatment.name || !newTreatment.schedule) return
    await createTreatment({ ...newTreatment, endDate: null })
    setNewTreatment({ name: '', schedule: 'DAILY', startDate: todayStr() })
    refreshAll()
  }

  async function handleEndTreatment(t) {
    await updateTreatment(t.id, { ...t, endDate: todayStr() })
    refreshAll()
  }

  async function handleSaveTarget(code) {
    const value = editValues[code]
    if (value === undefined || value === '') return
    const current = targets[code]
    await createTarget({ metricCode: code, comparator: current?.comparator ?? 'GTE', value: Number(value) })
    setEditValues((v) => ({ ...v, [code]: undefined }))
    refreshAll()
  }

  const activeTreatments = treatments.filter((t) => !t.endDate)
  const endedTreatments = treatments.filter((t) => t.endDate)

  return (
    <>
      <section className="card">
        <h2>Hair routine items</h2>
        {activeTreatments.map((t) => (
          <div key={t.id} className="workout-row">
            <span>{t.name} · {t.schedule}</span>
            <button onClick={() => handleEndTreatment(t)}>End</button>
          </div>
        ))}

        <div className="workout-form">
          <input placeholder="name" value={newTreatment.name}
            onChange={(e) => setNewTreatment((f) => ({ ...f, name: e.target.value }))} />
          <input placeholder="schedule (DAILY or MON,WED,FRI)" value={newTreatment.schedule}
            onChange={(e) => setNewTreatment((f) => ({ ...f, schedule: e.target.value }))} />
          <input type="date" value={newTreatment.startDate}
            onChange={(e) => setNewTreatment((f) => ({ ...f, startDate: e.target.value }))} />
          <button onClick={handleAddTreatment}>Add treatment</button>
        </div>

        {endedTreatments.length > 0 && (
          <>
            <p className="status">Ended</p>
            {endedTreatments.map((t) => (
              <div key={t.id} className="workout-row">
                <span>{t.name} · {t.schedule} · ended {t.endDate}</span>
              </div>
            ))}
          </>
        )}
      </section>

      <section className="card">
        <h2>Scorecard targets</h2>
        {Object.entries(TARGET_LABELS).map(([code, label]) => (
          <div key={code} className="target-row">
            <span>{label}</span>
            <input type="number" step="0.1" value={editValues[code] ?? targets[code]?.value ?? ''}
              onChange={(e) => setEditValues((v) => ({ ...v, [code]: e.target.value }))} />
            <button onClick={() => handleSaveTarget(code)}>Save</button>
          </div>
        ))}
      </section>
    </>
  )
}
