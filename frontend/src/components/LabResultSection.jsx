import { useEffect, useState } from 'react'
import { getLabResults, createLabResults } from '../api'
import { todayStr } from '../lib/dates'

const EMPTY_ROW = { testName: '', value: '', unit: '', refLow: '', refHigh: '' }

export default function LabResultSection({ onChanged }) {
  const [results, setResults] = useState([])
  const [date, setDate] = useState(todayStr())
  const [rows, setRows] = useState([{ ...EMPTY_ROW }])

  useEffect(() => {
    getLabResults().then((all) => {
      if (!all?.length) return
      const mostRecentDate = all[0].date
      setResults(all.filter((r) => r.date === mostRecentDate))
    })
  }, [])

  function updateRow(i, field, value) {
    setRows((prev) => prev.map((r, idx) => (idx === i ? { ...r, [field]: value } : r)))
  }

  async function handleSubmit() {
    const payload = rows
      .filter((r) => r.testName && r.value !== '')
      .map((r) => ({
        date,
        testName: r.testName,
        value: Number(r.value),
        unit: r.unit || null,
        refLow: r.refLow ? Number(r.refLow) : null,
        refHigh: r.refHigh ? Number(r.refHigh) : null,
      }))
    if (payload.length === 0) return
    const created = await createLabResults(payload)
    setResults(created)
    setRows([{ ...EMPTY_ROW }])
    onChanged?.()
  }

  return (
    <section className="card">
      <h2>Labs</h2>
      {results.length > 0 && (
        <div>
          <p className="status">Last draw ({results[0].date}):</p>
          {results.map((r) => (
            <div key={r.id} className="workout-row">
              <span>{r.testName}: {r.value}{r.unit ?? ''}</span>
              {r.inRange === false && <span className="overdue">out of range · retest {r.retestDue}</span>}
            </div>
          ))}
        </div>
      )}

      <div className="workout-form">
        <input type="date" value={date} onChange={(e) => setDate(e.target.value)} />
        {rows.map((row, i) => (
          <div key={i} className="lab-row">
            <input placeholder="test name (HbA1c...)" value={row.testName}
              onChange={(e) => updateRow(i, 'testName', e.target.value)} />
            <input type="number" step="0.01" placeholder="value" value={row.value}
              onChange={(e) => updateRow(i, 'value', e.target.value)} />
            <input placeholder="unit" value={row.unit}
              onChange={(e) => updateRow(i, 'unit', e.target.value)} />
            <input type="number" step="0.01" placeholder="ref low" value={row.refLow}
              onChange={(e) => updateRow(i, 'refLow', e.target.value)} />
            <input type="number" step="0.01" placeholder="ref high" value={row.refHigh}
              onChange={(e) => updateRow(i, 'refHigh', e.target.value)} />
          </div>
        ))}
        <button type="button" onClick={() => setRows((prev) => [...prev, { ...EMPTY_ROW }])}>+ Add test</button>
        <button onClick={handleSubmit}>Save draw</button>
      </div>
    </section>
  )
}
