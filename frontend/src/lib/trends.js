const DAY_CODES = ['SUN', 'MON', 'TUE', 'WED', 'THU', 'FRI', 'SAT']

function isDueOn(schedule, dateStr) {
  if (schedule === 'DAILY') return true
  const code = DAY_CODES[new Date(`${dateStr}T00:00:00`).getDay()]
  return schedule.split(',').includes(code)
}

function average(values) {
  return values.length ? values.reduce((a, b) => a + b, 0) / values.length : null
}

function daysInRange(from, to) {
  const days = []
  const d = new Date(`${from}T00:00:00`)
  const end = new Date(`${to}T00:00:00`)
  while (d <= end) {
    days.push(d.toISOString().slice(0, 10))
    d.setDate(d.getDate() + 1)
  }
  return days
}

/**
 * Computes the 8-item weekly scorecard against the fixed targets from the use-case doc.
 * Hair-routine adherence passes at >=90% (not a strict 100%) to allow one missed dose.
 */
export function computeScorecard({ dailyLogs, workouts, treatmentLogs, treatments, from, to }) {
  const sleepValues = dailyLogs.map((l) => l.sleepHours).filter((v) => v != null)
  const avgSleep = average(sleepValues)

  const onScheduleNights = dailyLogs.filter((l) => l.onSchedule === true).length

  const hrValues = dailyLogs.map((l) => l.restingHr).filter((v) => v != null)
  const avgHr = average(hrValues)

  const strengthCount = workouts.filter((w) => w.type === 'STRENGTH').length
  const runCount = workouts.filter((w) => w.type === 'RUN').length
  const cardioMinutes = workouts
    .filter((w) => w.type === 'RUN' || w.type === 'CARDIO')
    .reduce((sum, w) => sum + (w.minutes ?? 0), 0)

  const proteinValues = dailyLogs.map((l) => l.proteinG).filter((v) => v != null)
  const avgProtein = average(proteinValues)
  const weightEntries = dailyLogs.map((l) => l.weightKg).filter((v) => v != null)
  const latestWeight = weightEntries.length ? weightEntries[weightEntries.length - 1] : null
  const proteinTarget = latestWeight ? latestWeight * 1.6 : 134

  const days = daysInRange(from, to)
  let due = 0
  let done = 0
  for (const day of days) {
    for (const t of treatments) {
      if (!isDueOn(t.schedule, day)) continue
      due += 1
      if (treatmentLogs.some((l) => l.date === day && l.treatmentId === t.id && l.done)) done += 1
    }
  }
  const adherence = due > 0 ? done / due : null

  const items = [
    { label: 'Sleep 7–9h avg', met: avgSleep != null && avgSleep >= 7 && avgSleep <= 9, detail: avgSleep != null ? `${avgSleep.toFixed(1)}h avg` : 'no data' },
    { label: 'On-schedule nights (5+)', met: onScheduleNights >= 5, detail: `${onScheduleNights}/${days.length}` },
    { label: 'Resting HR under 70', met: avgHr != null && avgHr < 70, detail: avgHr != null ? `${avgHr.toFixed(0)} avg` : 'no data' },
    { label: 'Strength 3x', met: strengthCount >= 3, detail: `${strengthCount}` },
    { label: 'Runs 2x', met: runCount >= 2, detail: `${runCount}` },
    { label: 'Cardio 150min total', met: cardioMinutes >= 150, detail: `${cardioMinutes}min` },
    { label: `Protein ${proteinTarget.toFixed(0)}g`, met: avgProtein != null && avgProtein >= proteinTarget, detail: avgProtein != null ? `${avgProtein.toFixed(0)}g avg` : 'no data' },
    { label: 'Hair routine adherence', met: adherence != null && adherence >= 0.9, detail: adherence != null ? `${Math.round(adherence * 100)}%` : 'no data' },
  ]

  return { items, metCount: items.filter((i) => i.met).length, total: items.length }
}

if (import.meta.env.DEV) {
  const result = computeScorecard({
    dailyLogs: [{ date: '2026-10-20', sleepHours: 8, onSchedule: true, restingHr: 60, proteinG: 150, weightKg: 85 }],
    workouts: [
      { type: 'STRENGTH', minutes: 60 }, { type: 'STRENGTH', minutes: 45 }, { type: 'STRENGTH', minutes: 50 },
      { type: 'RUN', minutes: 30 }, { type: 'RUN', minutes: 40 },
    ],
    treatmentLogs: [{ date: '2026-10-20', treatmentId: 1, done: true }],
    treatments: [{ id: 1, schedule: 'DAILY' }],
    from: '2026-10-20', to: '2026-10-20',
  })
  console.assert(result.items[0].met === true, 'trends self-check: sleep target should pass')
  console.assert(result.items[3].met === true, 'trends self-check: strength target should pass at 3 sessions')
  console.assert(result.items[7].met === true, 'trends self-check: single due item done should be 100% adherence')
}
