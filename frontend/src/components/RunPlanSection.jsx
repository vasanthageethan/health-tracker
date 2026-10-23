import { useEffect, useState } from 'react'
import { getRunPlanCurrent, initRunPlan } from '../api'

export default function RunPlanSection() {
  const [plan, setPlan] = useState(undefined) // undefined = loading, null = not initialized
  const [form, setForm] = useState({ baseKm: '', startPct: '0.7', weeklyIncrease: '0.1' })

  useEffect(() => {
    getRunPlanCurrent().then((p) => setPlan(p))
  }, [])

  async function handleInit() {
    if (!form.baseKm) return
    const created = await initRunPlan({
      baseKm: Number(form.baseKm),
      startPct: Number(form.startPct),
      weeklyIncrease: Number(form.weeklyIncrease),
    })
    setPlan({ ...created, actualKm: 0, overPlan: false })
  }

  if (plan === undefined) return null

  if (plan === null) {
    return (
      <section className="card">
        <h2>Run restart plan</h2>
        <p className="status">Set your pre-break weekly volume to start the plan.</p>
        <div className="workout-form">
          <label>Old weekly volume (km)
            <input type="number" value={form.baseKm} onChange={(e) => setForm((f) => ({ ...f, baseKm: e.target.value }))} />
          </label>
          <label>Starting % of old volume
            <input type="number" step="0.05" value={form.startPct} onChange={(e) => setForm((f) => ({ ...f, startPct: e.target.value }))} />
          </label>
          <label>Weekly increase
            <input type="number" step="0.05" value={form.weeklyIncrease} onChange={(e) => setForm((f) => ({ ...f, weeklyIncrease: e.target.value }))} />
          </label>
          <button onClick={handleInit}>Start plan</button>
        </div>
      </section>
    )
  }

  const pct = Math.round((plan.actualKm / plan.plannedKm) * 100)
  return (
    <section className="card">
      <h2>Run restart plan</h2>
      <div className={`due-row ${plan.overPlan ? 'overdue' : 'ok'}`}>
        <span>This week ({plan.weekStart})</span>
        <span>{plan.actualKm.toFixed(1)} / {plan.plannedKm.toFixed(1)}km ({pct}%)</span>
      </div>
      {plan.overPlan && <p className="overdue">More than 10% over plan — ease off.</p>}
    </section>
  )
}
