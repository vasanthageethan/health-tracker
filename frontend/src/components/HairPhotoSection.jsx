import { useEffect, useRef, useState } from 'react'
import { getHairPhotos, uploadHairPhoto } from '../api'
import { todayStr } from '../lib/dates'
import AuthImage from './AuthImage'

const VIEWS = ['HAIRLINE', 'TEMPLES', 'CROWN']

export default function HairPhotoSection({ onChanged }) {
  const [photos, setPhotos] = useState([])
  const [form, setForm] = useState({ date: todayStr(), view: 'HAIRLINE', sheddingNote: '', sideEffectNote: '' })
  const fileInput = useRef(null)

  useEffect(() => {
    getHairPhotos().then((p) => setPhotos(p ?? []))
  }, [])

  async function handleUpload() {
    const file = fileInput.current?.files?.[0]
    if (!file) return
    const created = await uploadHairPhoto({ ...form, file })
    setPhotos((prev) => [created, ...prev])
    fileInput.current.value = ''
    setForm((f) => ({ ...f, sheddingNote: '', sideEffectNote: '' }))
    onChanged?.()
  }

  return (
    <section className="card">
      <h2>Hair photos</h2>

      {VIEWS.map((view) => {
        const shots = photos.filter((p) => p.view === view).sort((a, b) => a.date.localeCompare(b.date))
        if (shots.length === 0) return null
        const baseline = shots[0]
        const latest = shots[shots.length - 1]
        return (
          <div key={view} className="photo-compare">
            <h3>{view}</h3>
            <div className="photo-pair">
              <figure>
                <AuthImage photoId={baseline.id} alt={`${view} baseline`} />
                <figcaption>Baseline · {baseline.date}</figcaption>
              </figure>
              {latest.id !== baseline.id && (
                <figure>
                  <AuthImage photoId={latest.id} alt={`${view} latest`} />
                  <figcaption>Latest · {latest.date}</figcaption>
                </figure>
              )}
            </div>
          </div>
        )
      })}

      <div className="workout-form">
        <input type="date" value={form.date} onChange={(e) => setForm((f) => ({ ...f, date: e.target.value }))} />
        <select value={form.view} onChange={(e) => setForm((f) => ({ ...f, view: e.target.value }))}>
          {VIEWS.map((v) => <option key={v} value={v}>{v}</option>)}
        </select>
        <input type="file" accept="image/*" capture="environment" ref={fileInput} />
        <input placeholder="shedding note" value={form.sheddingNote}
          onChange={(e) => setForm((f) => ({ ...f, sheddingNote: e.target.value }))} />
        <input placeholder="side-effect note" value={form.sideEffectNote}
          onChange={(e) => setForm((f) => ({ ...f, sideEffectNote: e.target.value }))} />
        <button onClick={handleUpload}>Add photo</button>
      </div>
    </section>
  )
}
