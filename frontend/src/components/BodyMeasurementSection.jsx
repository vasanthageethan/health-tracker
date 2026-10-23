import { useEffect, useState } from 'react'
import { getBodyMeasurements, createBodyMeasurement } from '../api'
import { todayStr } from '../lib/dates'

export default function BodyMeasurementSection({ onChanged }) {
  const [list, setList] = useState([])
  const [form, setForm] = useState({ date: todayStr(), waistCm: '', heightCm: '', bpSystolic: '', bpDiastolic: '' })

  useEffect(() => {
    getBodyMeasurements().then((items) => {
      setList(items ?? [])
      const lastHeight = (items ?? []).find((m) => m.heightCm)?.heightCm
      if (lastHeight) setForm((f) => ({ ...f, heightCm: lastHeight }))
    })
  }, [])

  async function handleSubmit() {
    if (!form.waistCm && !form.bpSystolic) return
    const created = await createBodyMeasurement({
      date: form.date,
      waistCm: form.waistCm ? Number(form.waistCm) : null,
      heightCm: form.heightCm ? Number(form.heightCm) : null,
      bpSystolic: form.bpSystolic ? Number(form.bpSystolic) : null,
      bpDiastolic: form.bpDiastolic ? Number(form.bpDiastolic) : null,
    })
    setList((prev) => [created, ...prev])
    setForm((f) => ({ ...f, waistCm: '', bpSystolic: '', bpDiastolic: '' }))
    onChanged?.()
  }

  return (
    <section className="card">
      <h2>Waist &amp; blood pressure</h2>
      {list.slice(0, 5).map((m) => (
        <div key={m.id} className="workout-row">
          <span>
            {m.date}
            {m.waistCm ? ` · waist ${m.waistCm}cm` : ''}
            {m.ratio ? ` (ratio ${m.ratio.toFixed(2)})` : ''}
            {m.bpSystolic ? ` · BP ${m.bpSystolic}/${m.bpDiastolic}` : ''}
          </span>
        </div>
      ))}

      <div className="workout-form">
        <input type="date" value={form.date} onChange={(e) => setForm((f) => ({ ...f, date: e.target.value }))} />
        <input type="number" step="0.1" placeholder="waist (cm)" value={form.waistCm}
          onChange={(e) => setForm((f) => ({ ...f, waistCm: e.target.value }))} />
        <input type="number" step="0.1" placeholder="height (cm)" value={form.heightCm}
          onChange={(e) => setForm((f) => ({ ...f, heightCm: e.target.value }))} />
        <input type="number" placeholder="BP systolic" value={form.bpSystolic}
          onChange={(e) => setForm((f) => ({ ...f, bpSystolic: e.target.value }))} />
        <input type="number" placeholder="BP diastolic" value={form.bpDiastolic}
          onChange={(e) => setForm((f) => ({ ...f, bpDiastolic: e.target.value }))} />
        <button onClick={handleSubmit}>Save</button>
      </div>
    </section>
  )
}
