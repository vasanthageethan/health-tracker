export function todayStr() {
  const d = new Date()
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`
}

export function yesterdayOf(dateStr) {
  return daysBefore(dateStr, 1)
}

export function daysBefore(dateStr, n) {
  return shiftDays(dateStr, -n)
}

export function daysAfter(dateStr, n) {
  return shiftDays(dateStr, n)
}

function shiftDays(dateStr, n) {
  const d = new Date(`${dateStr}T00:00:00`)
  d.setDate(d.getDate() + n)
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`
}
