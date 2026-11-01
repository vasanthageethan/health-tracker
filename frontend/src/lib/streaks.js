import { isDueOn } from './schedule'

/** null = nothing due that day (doesn't break or extend a streak), else true/false. */
function isAdherentDay(treatments, treatmentLogs, date) {
  const due = treatments.filter((t) => isDueOn(t, date))
  if (due.length === 0) return null
  return due.every((t) => treatmentLogs.some((l) => l.date === date && l.treatmentId === t.id && l.done))
}

/** `days` ascending (oldest first), ending today. Returns { current, best }. */
export function computeAdherenceStreaks(treatments, treatmentLogs, days) {
  let best = 0
  let running = 0
  for (const d of days) {
    const result = isAdherentDay(treatments, treatmentLogs, d)
    if (result === null) continue
    if (result) {
      running += 1
      best = Math.max(best, running)
    } else {
      running = 0
    }
  }

  let current = 0
  for (let i = days.length - 1; i >= 0; i--) {
    const result = isAdherentDay(treatments, treatmentLogs, days[i])
    if (result === null) continue
    if (!result) break
    current += 1
  }

  return { current, best }
}

/** `days` ascending, ending today. `loggedDates` is a Set of date strings with a saved daily log. */
export function computeDailyLogStreaks(loggedDates, days) {
  let best = 0
  let running = 0
  for (const d of days) {
    if (loggedDates.has(d)) {
      running += 1
      best = Math.max(best, running)
    } else {
      running = 0
    }
  }

  let current = 0
  for (let i = days.length - 1; i >= 0; i--) {
    if (!loggedDates.has(days[i])) break
    current += 1
  }

  return { current, best }
}

if (import.meta.env.DEV) {
  const treatments = [{ id: 1, schedule: 'DAILY', startDate: '2026-01-01', endDate: null }]
  const days = ['2026-10-25', '2026-10-26', '2026-10-27', '2026-10-28', '2026-10-29']

  const brokenMidway = computeAdherenceStreaks(treatments, [
    { date: '2026-10-25', treatmentId: 1, done: true },
    { date: '2026-10-26', treatmentId: 1, done: true },
    { date: '2026-10-27', treatmentId: 1, done: false },
    { date: '2026-10-28', treatmentId: 1, done: true },
    { date: '2026-10-29', treatmentId: 1, done: true },
  ], days)
  console.assert(brokenMidway.current === 2, `streaks self-check: current streak should only count back to the break, got ${brokenMidway.current}`)
  console.assert(brokenMidway.best === 2, `streaks self-check: best streak should be the longest run (2), got ${brokenMidway.best}`)

  const perfect = computeAdherenceStreaks(treatments, days.map((d) => ({ date: d, treatmentId: 1, done: true })), days)
  console.assert(perfect.current === 5 && perfect.best === 5, 'streaks self-check: a perfect run should give current === best === day count')

  const logStreak = computeDailyLogStreaks(new Set(['2026-10-27', '2026-10-28', '2026-10-29']), days)
  console.assert(logStreak.current === 3, `streaks self-check: daily-log current streak should be 3, got ${logStreak.current}`)
}
