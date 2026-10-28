import { useEffect, useRef, useState } from 'react'
import { getAuthStatus, setupAuth, loginAuth } from '../api'
import HeroIllustration from './HeroIllustration'

const LOCK_AFTER_MS = 5 * 60 * 1000

export default function AuthGate({ children }) {
  const [state, setState] = useState('checking') // checking | setup | locked | unlocked
  const [pin, setPin] = useState('')
  const [confirmPin, setConfirmPin] = useState('')
  const [error, setError] = useState('')
  const timerRef = useRef(null)

  useEffect(() => {
    getAuthStatus().then((s) => setState(s?.configured ? 'locked' : 'setup'))
  }, [])

  useEffect(() => {
    if (state !== 'unlocked') return

    const resetTimer = () => {
      clearTimeout(timerRef.current)
      timerRef.current = setTimeout(() => setState('locked'), LOCK_AFTER_MS)
    }
    resetTimer()

    const events = ['mousedown', 'keydown', 'touchstart', 'scroll']
    events.forEach((e) => window.addEventListener(e, resetTimer))
    return () => {
      clearTimeout(timerRef.current)
      events.forEach((e) => window.removeEventListener(e, resetTimer))
    }
  }, [state])

  async function handleSetup() {
    setError('')
    if (pin.length < 4) { setError('PIN must be at least 4 digits'); return }
    if (pin !== confirmPin) { setError('PINs do not match'); return }
    const result = await setupAuth(pin)
    if (!result) { setError('Setup failed'); return }
    setPin(''); setConfirmPin('')
    setState('unlocked')
  }

  async function handleUnlock() {
    setError('')
    const result = await loginAuth(pin)
    if (!result) { setError('Wrong PIN'); return }
    setPin('')
    setState('unlocked')
  }

  if (state === 'checking') return null
  if (state === 'unlocked') return children

  const isSetup = state === 'setup'
  return (
    <div className="page lock-screen">
      <HeroIllustration />
      <h1>Health Tracker</h1>
      <p>{isSetup ? 'Set a PIN to protect this app.' : 'Enter your PIN to unlock.'}</p>
      <input type="password" inputMode="numeric" placeholder="PIN" value={pin}
        onChange={(e) => setPin(e.target.value)}
        onKeyDown={(e) => e.key === 'Enter' && !isSetup && handleUnlock()} />
      {isSetup && (
        <input type="password" inputMode="numeric" placeholder="Confirm PIN" value={confirmPin}
          onChange={(e) => setConfirmPin(e.target.value)}
          onKeyDown={(e) => e.key === 'Enter' && handleSetup()} />
      )}
      {error && <p className="overdue">{error}</p>}
      <button onClick={isSetup ? handleSetup : handleUnlock}>{isSetup ? 'Set PIN' : 'Unlock'}</button>
    </div>
  )
}
