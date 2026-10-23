const BASE = `http://${window.location.hostname}:8080/api`

async function request(path, options) {
  const res = await fetch(`${BASE}${path}`, {
    headers: { 'Content-Type': 'application/json' },
    ...options,
  })
  if (res.status === 404) return null
  if (!res.ok) throw new Error(`${options?.method ?? 'GET'} ${path} failed: ${res.status}`)
  if (res.status === 204) return null
  return res.json()
}

export const getDailyLog = (date) => request(`/daily-logs/${date}`)
export const saveDailyLog = (date, log) =>
  request(`/daily-logs/${date}`, { method: 'PUT', body: JSON.stringify(log) })

export const getTreatments = () => request('/treatments')
export const getTreatmentLogs = (date) => request(`/treatment-logs?date=${date}`)
export const saveTreatmentLog = (date, treatmentId, log) =>
  request(`/treatment-logs/${date}/${treatmentId}`, { method: 'PUT', body: JSON.stringify(log) })

export const getWorkouts = (date) => request(`/workouts?date=${date}`)
export const createWorkout = (workout) =>
  request('/workouts', { method: 'POST', body: JSON.stringify(workout) })
export const deleteWorkout = (id) => request(`/workouts/${id}`, { method: 'DELETE' })

export const getDueStatus = () => request('/due-status')

export const getBodyMeasurements = () => request('/body-measurements')
export const createBodyMeasurement = (m) =>
  request('/body-measurements', { method: 'POST', body: JSON.stringify(m) })

export const getFitnessTests = () => request('/fitness-tests')
export const createFitnessTests = (results) =>
  request('/fitness-tests', { method: 'POST', body: JSON.stringify(results) })

export const getLabResults = () => request('/lab-results')
export const createLabResults = (results) =>
  request('/lab-results', { method: 'POST', body: JSON.stringify(results) })

export const getHairPhotos = () => request('/hair-photos')
export const hairPhotoImageUrl = (id) => `${BASE}/hair-photos/${id}/image`
export async function uploadHairPhoto({ date, view, sheddingNote, sideEffectNote, file }) {
  const form = new FormData()
  form.append('date', date)
  form.append('view', view)
  if (sheddingNote) form.append('sheddingNote', sheddingNote)
  if (sideEffectNote) form.append('sideEffectNote', sideEffectNote)
  form.append('file', file)
  const res = await fetch(`${BASE}/hair-photos`, { method: 'POST', body: form })
  if (!res.ok) throw new Error(`POST /hair-photos failed: ${res.status}`)
  return res.json()
}
