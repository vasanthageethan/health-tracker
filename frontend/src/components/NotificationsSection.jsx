import { useEffect, useState } from 'react'
import { getVapidPublicKey, subscribePush, unsubscribePush, sendTestPush } from '../api'
import { urlBase64ToUint8Array } from '../lib/push'

export default function NotificationsSection() {
  const [supported, setSupported] = useState(true)
  const [enabled, setEnabled] = useState(false)
  const [status, setStatus] = useState('')

  useEffect(() => {
    if (!('serviceWorker' in navigator) || !('PushManager' in window)) {
      setSupported(false)
      return
    }
    navigator.serviceWorker.ready
      .then((reg) => reg.pushManager.getSubscription())
      .then((sub) => setEnabled(!!sub))
      .catch(() => setSupported(false))
  }, [])

  async function handleEnable() {
    setStatus('')
    try {
      const permission = await Notification.requestPermission()
      if (permission !== 'granted') {
        setStatus('Permission denied.')
        return
      }
      const { publicKey } = await getVapidPublicKey()
      const registration = await navigator.serviceWorker.ready
      const subscription = await registration.pushManager.subscribe({
        userVisibleOnly: true,
        applicationServerKey: urlBase64ToUint8Array(publicKey),
      })
      const json = subscription.toJSON()
      await subscribePush({ endpoint: json.endpoint, keys: { p256dh: json.keys.p256dh, auth: json.keys.auth } })
      setEnabled(true)
      setStatus('Notifications on.')
    } catch (e) {
      setStatus(`Could not enable: ${e.message}`)
    }
  }

  async function handleDisable() {
    setStatus('')
    const registration = await navigator.serviceWorker.ready
    const subscription = await registration.pushManager.getSubscription()
    if (subscription) {
      await unsubscribePush(subscription.endpoint)
      await subscription.unsubscribe()
    }
    setEnabled(false)
    setStatus('Notifications off.')
  }

  async function handleTest() {
    setStatus('Sending…')
    const result = await sendTestPush()
    setStatus(`Sent to ${result.sent} device(s).`)
  }

  if (!supported) {
    return (
      <section className="card">
        <h2>Notifications</h2>
        <p className="status">Push notifications aren't supported in this browser.</p>
      </section>
    )
  }

  return (
    <section className="card">
      <h2>Notifications</h2>
      <p className="status">Evening reminder (9pm) if today isn't logged, or a hair-routine item is still due.</p>
      <div className="workout-form">
        <button onClick={enabled ? handleDisable : handleEnable}>
          {enabled ? 'Turn off notifications' : 'Turn on notifications'}
        </button>
        {enabled && <button onClick={handleTest}>Send test notification</button>}
      </div>
      {status && <p className="status">{status}</p>}
    </section>
  )
}
