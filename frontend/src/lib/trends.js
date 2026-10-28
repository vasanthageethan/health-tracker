import { isDueOn } from './schedule'
import { daysAfter } from './dates'

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
  const strengthTarget = targetValue(targets, 'STRENGTH_SESSIONS', 3)
  const runsTarget = targetValue(targets, 'RUNS', 2)
  const cardioTarget = targetValue(targets, 'CARDIO_MINUTES', 150)
  const proteinPerKg = targetValue(targets, 'PROTEIN_PER_KG', 1.6)
  const adherenceTarget = targetValue(targets, 'HAIR_ADHERENCE_PCT', 90)

  const sleepValues = dailyLogs.map((l) => l.sleepHours).filter((v) => v != null)
  const avgSleep = average(sleepValues)

  const onScheduleNights = dailyLogs.filter((l) => l.onSchedule === true).length

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
    { label: `Strength ${strengthTarget}x`, met: strengthCount >= strengthTarget, detail: `${strengthCount}` },
    { label: `Runs ${runsTarget}x`, met: runCount >= runsTarget, detail: `${runCount}` },
    { label: `Cardio ${cardioTarget}min total`, met: cardioMinutes >= cardioTarget, detail: `${cardioMinutes}min` },
    { label: `Protein ${proteinTarget.toFixed(0)}g`, met: avgProtein != null && avgProtein >= proteinTarget, detail: avgProtein != null ? `${avgProtein.toFixed(0)}g avg` : 'no data' },
    { label: 'Hair routine adherence', met: adherence != null && adherence * 100 >= adherenceTarget, detail: adherence != null ? `${Math.round(adherence * 100)}%` : 'no data' },
  ]

  return { items, metCount: items.filter((i) => i.met).length, total: items.length }
}

/** 7-day buckets from `from` to `to`, last bucket may be shorter. */
export function weeklyBuckets(from, to) {
  const buckets = []
  let start = from
  while (start <= to) {
    const end = daysAfter(start, 6) > to ? to : daysAfter(start, 6)
    buckets.push({ start, end })
    start = daysAfter(start, 7)
  }
  return buckets
}

/** One point per week: strength-session count and total cardio (run + other) minutes. */
export function computeWeeklyWorkoutTrend(workouts, buckets) {
  return buckets.map((b) => {
    const inWeek = workouts.filter((w) => w.date >= b.start && w.date <= b.end)
    return {
      date: b.start,
      strengthCount: inWeek.filter((w) => w.type === 'STRENGTH').length,
      cardioMinutes: inWeek.filter((w) => w.type === 'RUN' || w.type === 'CARDIO')
        .reduce((sum, w) => sum + (w.minutes ?? 0), 0),
    }
  })
}

/** One point per week: % of due hair-routine items actually marked done. */
export function computeWeeklyAdherenceTrend(treatments, treatmentLogs, buckets) {
  return buckets.map((b) => {
    const days = daysInRange(b.start, b.end)
    let due = 0
    let done = 0
    for (const day of days) {
      for (const t of treatments) {
        if (!isDueOn(t, day)) continue
        due += 1
        if (treatmentLogs.some((l) => l.date === day && l.treatmentId === t.id && l.done)) done += 1
      }
    }
    return { date: b.start, value: due > 0 ? Math.round((done / due) * 100) : null }
  })
}

/** Groups fitness-test or lab-result rows by their code/name for per-metric trend charts. */
export function groupByKey(rows, keyField) {
  const groups = {}
  for (const row of rows) {
    const key = row[keyField]
    if (!groups[key]) groups[key] = []
    groups[key].push({ date: row.date, value: row.value, unit: row.unit })
  }
  for (const key of Object.keys(groups)) {
    groups[key].sort((a, b) => a.date.localeCompare(b.date))
  }
  return groups
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
  console.assert(result.items[2].met === true, 'trends self-check: strength target should pass at 3 sessions')
  console.assert(result.items[6].met === true, 'trends self-check: single due item done should be 100% adherence')

  const endedTreatment = computeScorecard({
    dailyLogs: [], workouts: [], treatmentLogs: [],
    treatments: [{ id: 1, schedule: 'DAILY', startDate: '2026-01-01', endDate: '2026-10-01' }],
    from: '2026-10-20', to: '2026-10-20',
  })
  console.assert(endedTreatment.items[6].detail === 'no data', 'trends self-check: treatment ended before range should not count as due')

  const buckets = weeklyBuckets('2026-10-01', '2026-10-15')
  console.assert(buckets.length === 3, `trends self-check: expected 3 weekly buckets for a 15-day range, got ${buckets.length}`)
  console.assert(buckets[2].start === '2026-10-15' && buckets[2].end === '2026-10-15', 'trends self-check: final bucket should be clipped to the range end')

  const workoutTrend = computeWeeklyWorkoutTrend(
    [{ date: '2026-10-02', type: 'STRENGTH' }, { date: '2026-10-03', type: 'RUN', minutes: 30 }],
    buckets,
  )
  console.assert(workoutTrend[0].strengthCount === 1 && workoutTrend[0].cardioMinutes === 30, 'trends self-check: weekly workout trend should bucket by date')

  const adherenceTrend = computeWeeklyAdherenceTrend(
    [{ id: 1, schedule: 'DAILY', startDate: '2026-01-01', endDate: null }],
    [{ date: '2026-10-01', treatmentId: 1, done: true }],
    [{ start: '2026-10-01', end: '2026-10-01' }],
  )
  console.assert(adherenceTrend[0].value === 100, 'trends self-check: single due item done should be 100% weekly adherence')

  const grouped = groupByKey([{ date: '2026-10-01', testCode: 'PUSHUPS', value: 20, unit: 'reps' }], 'testCode')
  console.assert(grouped.PUSHUPS?.length === 1, 'trends self-check: groupByKey should bucket rows by their key field')

  const outOfOrder = groupByKey([
    { date: '2026-10-22', testCode: 'PUSHUPS', value: 22, unit: 'reps' },
    { date: '2026-09-02', testCode: 'PUSHUPS', value: 18, unit: 'reps' },
  ], 'testCode')
  console.assert(outOfOrder.PUSHUPS[0].date === '2026-09-02' && outOfOrder.PUSHUPS[1].date === '2026-10-22',
    'trends self-check: groupByKey must sort points chronologically regardless of input order')
}
