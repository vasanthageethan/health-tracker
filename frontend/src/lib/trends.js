import { isDueOn } from './schedule'

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

/** Falls back to the doc's own default if a target hasn't loaded or was never set. */
function targetValue(targets, code, fallback) {
  return targets?.[code]?.value ?? fallback
}

/**
 * Computes the weekly scorecard against the user's current targets (editable in Settings).
 * Hair-routine adherence target defaults to 90% (not a strict 100%) to allow one missed dose.
 */
export function computeScorecard({ dailyLogs, workouts, treatmentLogs, treatments, from, to, targets = {} }) {
  const sleepMin = targetValue(targets, 'SLEEP_MIN_HOURS', 7)
  const sleepMax = targetValue(targets, 'SLEEP_MAX_HOURS', 9)
  const onScheduleTarget = targetValue(targets, 'ON_SCHEDULE_NIGHTS', 5)
  const hrTarget = targetValue(targets, 'RESTING_HR', 70)
  const strengthTarget = targetValue(targets, 'STRENGTH_SESSIONS', 3)
  const runsTarget = targetValue(targets, 'RUNS', 2)
  const cardioTarget = targetValue(targets, 'CARDIO_MINUTES', 150)
  const proteinPerKg = targetValue(targets, 'PROTEIN_PER_KG', 1.6)
  const adherenceTarget = targetValue(targets, 'HAIR_ADHERENCE_PCT', 90)

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
  const proteinTarget = latestWeight ? latestWeight * proteinPerKg : 134

  const days = daysInRange(from, to)
  let due = 0
  let done = 0
  for (const day of days) {
    for (const t of treatments) {
      if (!isDueOn(t, day)) continue
      due += 1
      if (treatmentLogs.some((l) => l.date === day && l.treatmentId === t.id && l.done)) done += 1
    }
  }
  const adherence = due > 0 ? done / due : null

  const items = [
    { label: `Sleep ${sleepMin}–${sleepMax}h avg`, met: avgSleep != null && avgSleep >= sleepMin && avgSleep <= sleepMax, detail: avgSleep != null ? `${avgSleep.toFixed(1)}h avg` : 'no data' },
    { label: `On-schedule nights (${onScheduleTarget}+)`, met: onScheduleNights >= onScheduleTarget, detail: `${onScheduleNights}/${days.length}` },
    { label: `Resting HR under ${hrTarget}`, met: avgHr != null && avgHr < hrTarget, detail: avgHr != null ? `${avgHr.toFixed(0)} avg` : 'no data' },
    { label: `Strength ${strengthTarget}x`, met: strengthCount >= strengthTarget, detail: `${strengthCount}` },
    { label: `Runs ${runsTarget}x`, met: runCount >= runsTarget, detail: `${runCount}` },
    { label: `Cardio ${cardioTarget}min total`, met: cardioMinutes >= cardioTarget, detail: `${cardioMinutes}min` },
    { label: `Protein ${proteinTarget.toFixed(0)}g`, met: avgProtein != null && avgProtein >= proteinTarget, detail: avgProtein != null ? `${avgProtein.toFixed(0)}g avg` : 'no data' },
    { label: 'Hair routine adherence', met: adherence != null && adherence * 100 >= adherenceTarget, detail: adherence != null ? `${Math.round(adherence * 100)}%` : 'no data' },
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
    treatments: [{ id: 1, schedule: 'DAILY', startDate: '2026-01-01', endDate: null }],
    from: '2026-10-20', to: '2026-10-20',
  })
  console.assert(result.items[0].met === true, 'trends self-check: sleep target should pass')
  console.assert(result.items[3].met === true, 'trends self-check: strength target should pass at 3 sessions')
  console.assert(result.items[7].met === true, 'trends self-check: single due item done should be 100% adherence')

  const endedTreatment = computeScorecard({
    dailyLogs: [], workouts: [], treatmentLogs: [],
    treatments: [{ id: 1, schedule: 'DAILY', startDate: '2026-01-01', endDate: '2026-10-01' }],
    from: '2026-10-20', to: '2026-10-20',
  })
  console.assert(endedTreatment.items[7].detail === 'no data', 'trends self-check: treatment ended before range should not count as due')
}
