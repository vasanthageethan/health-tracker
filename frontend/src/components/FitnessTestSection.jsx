import { useEffect, useState } from 'react'
import { getFitnessTests, createFitnessTests } from '../api'
import { todayStr } from '../lib/dates'

const TESTS = [
  { code: 'PUSHUPS', label: 'Push-ups', unit: 'reps' },
  { code: 'DEAD_HANG', label: 'Dead hang', unit: 'sec' },
  { code: 'PULLUPS', label: 'Pull-ups', unit: 'reps' },
  { code: 'PLANK', label: 'Plank', unit: 'sec' },
  { code: 'COOPER', label: 'Cooper 12-min run', unit: 'km' },
  { code: 'SQUAT_HOLD', label: 'Deep squat hold', unit: 'sec' },
  { code: 'TOE_TOUCH', label: 'Toe touch (1 = reached)', unit: 'pass' },
  { code: 'IIEF5', label: 'IIEF-5 / SHIM score', unit: 'score' },
]

export default function FitnessTestSection({ onChanged }) {
  const [latest, setLatest] = useState([])
  const [date, setDate] = useState(todayStr())
  const [values, setValues] = useState({})

  useEffect(() => {
    getFitnessTests().then((all) => {
      if (!all?.length) return
      const mostRecentDate = all[0].date
      setLatest(all.filter((t) => t.date === mostRecentDate))
    })
  }, [])

  async function handleSubmit() {
    const results = TESTS
      .filter((t) => values[t.code] !== undefined && values[t.code] !== '')
      .map((t) => ({ date, testCode: t.code, value: Number(values[t.code]), unit: t.unit }))
    if (results.length === 0) return
    const created = await createFitnessTests(results)
    setLatest(created)
    setValues({})
    onChanged?.()
  }

  return (
    <section className="card">
      <h2>Fitness test battery</h2>
      {latest.length > 0 && (
        <p className="status">Last check-in ({latest[0].date}): {latest.map((t) => `${t.testCode} ${t.value}${t.unit}`).join(', ')}</p>
      )}

      <div className="workout-form">
        <input type="date" value={date} onChange={(e) => setDate(e.target.value)} />
        {TESTS.map((t) => (
          <label key={t.code}>{t.label} ({t.unit})
            <input type="number" value={values[t.code] ?? ''}
              onChange={(e) => setValues((v) => ({ ...v, [t.code]: e.target.value }))} />
          </label>
        ))}
        <button onClick={handleSubmit}>Save check-in</button>
      </div>
    </section>
  )
}
