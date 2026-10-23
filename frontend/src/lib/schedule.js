const DAY_CODES = ['SUN', 'MON', 'TUE', 'WED', 'THU', 'FRI', 'SAT']

export function isDueOn(treatment, dateStr) {
  if (treatment.startDate && dateStr < treatment.startDate) return false
  if (treatment.endDate && dateStr > treatment.endDate) return false
  if (treatment.schedule === 'DAILY') return true
  const code = DAY_CODES[new Date(`${dateStr}T00:00:00`).getDay()]
  return treatment.schedule.split(',').includes(code)
}
