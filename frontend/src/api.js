const BASE = `http://${window.location.hostname}:8080/api`
const TOKEN_KEY = 'health-tracker-token'

export const getToken = () => localStorage.getItem(TOKEN_KEY)
export const setToken = (token) => localStorage.setItem(TOKEN_KEY, token)
export const clearToken = () => localStorage.removeItem(TOKEN_KEY)

function authHeaders() {
  const token = getToken()
  return token ? { Authorization: `Bearer ${token}` } : {}
}

async function request(path, options) {
  const res = await fetch(`${BASE}${path}`, {
    headers: { 'Content-Type': 'application/json', ...authHeaders() },
    ...options,
  })
  if (res.status === 401) {
    clearToken()
    window.location.reload()
    return new Promise(() => {}) // reloading; never resolve
  }
  if (res.status === 404) return null
  if (!res.ok) throw new Error(`${options?.method ?? 'GET'} ${path} failed: ${res.status}`)
  if (res.status === 204) return null
  return res.json()
}

export const getAuthStatus = () => request('/auth/status')
export async function setupAuth(pin) {
  const res = await fetch(`${BASE}/auth/setup`, {
    method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ pin }),
  })
  if (!res.ok) return null
  const data = await res.json()
  setToken(data.token)
  return data
}
export async function loginAuth(pin) {
  const res = await fetch(`${BASE}/auth/login`, {
    method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ pin }),
  })
  if (!res.ok) return null
  const data = await res.json()
  setToken(data.token)
  return data
}

export const getDailyLog = (date) => request(`/daily-logs/${date}`)
export const saveDailyLog = (date, log) =>
  request(`/daily-logs/${date}`, { method: 'PUT', body: JSON.stringify(log) })
export const getDailyLogsRange = (from, to) => request(`/daily-logs?from=${from}&to=${to}`)

export const getTreatments = () => request('/treatments')
export const getTreatmentLogs = (date) => request(`/treatment-logs?date=${date}`)
export const getTreatmentLogsRange = (from, to) => request(`/treatment-logs?from=${from}&to=${to}`)
export const saveTreatmentLog = (date, treatmentId, log) =>
  request(`/treatment-logs/${date}/${treatmentId}`, { method: 'PUT', body: JSON.stringify(log) })

export const getWorkouts = (date) => request(`/workouts?date=${date}`)
export const getWorkoutsRange = (from, to) => request(`/workouts?from=${from}&to=${to}`)
export const createWorkout = (workout) =>
  request('/workouts', { method: 'POST', body: JSON.stringify(workout) })
export const deleteWorkout = (id) => request(`/workouts/${id}`, { method: 'DELETE' })

export const getRunPlanCurrent = () => request('/run-plan/current')
export const initRunPlan = (plan) => request('/run-plan/init', { method: 'POST', body: JSON.stringify(plan) })

export const getWeatherToday = () => request('/weather/today')

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

// <img> tags can't send our Authorization header, so photos are fetched as blobs instead.
export async function fetchHairPhotoBlobUrl(id) {
  const res = await fetch(`${BASE}/hair-photos/${id}/image`, { headers: authHeaders() })
  if (!res.ok) return null
  return URL.createObjectURL(await res.blob())
}
export async function uploadHairPhoto({ date, view, sheddingNote, sideEffectNote, file }) {
  const form = new FormData()
  form.append('date', date)
  form.append('view', view)
  if (sheddingNote) form.append('sheddingNote', sheddingNote)
  if (sideEffectNote) form.append('sideEffectNote', sideEffectNote)
  form.append('file', file)
  const res = await fetch(`${BASE}/hair-photos`, { method: 'POST', headers: authHeaders(), body: form })
  if (res.status === 401) {
    clearToken()
    window.location.reload()
    return new Promise(() => {})
  }
  if (!res.ok) throw new Error(`POST /hair-photos failed: ${res.status}`)
  return res.json()
}
