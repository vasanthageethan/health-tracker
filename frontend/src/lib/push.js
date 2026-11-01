/** Converts a VAPID base64url public key string into the Uint8Array pushManager.subscribe() expects. */
export function urlBase64ToUint8Array(base64String) {
  const padding = '='.repeat((4 - (base64String.length % 4)) % 4)
  const base64 = (base64String + padding).replace(/-/g, '+').replace(/_/g, '/')
  const raw = atob(base64)
  return Uint8Array.from([...raw].map((c) => c.charCodeAt(0)))
}

if (import.meta.env.DEV) {
  // A real VAPID public key is 65 raw bytes (uncompressed P-256 point) and always starts with 0x04.
  const decoded = urlBase64ToUint8Array('BN0-pTwVN_6vmwCTuwcP2WuRlyYjy_UdBDL2ufzsgimlPH4vPWFE3fT7OJd0i9UtsWUksXesNIVeP-Aj5jHfhnA')
  console.assert(decoded.length === 65, `push self-check: decoded VAPID key should be 65 bytes, got ${decoded.length}`)
  console.assert(decoded[0] === 4, `push self-check: decoded VAPID key should start with 0x04, got ${decoded[0]}`)
}
