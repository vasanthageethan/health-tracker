import { useEffect, useState } from 'react'
import { fetchHairPhotoBlobUrl } from '../api'

export default function AuthImage({ photoId, alt }) {
  const [src, setSrc] = useState(null)

  useEffect(() => {
    let objectUrl = null
    fetchHairPhotoBlobUrl(photoId).then((url) => {
      objectUrl = url
      setSrc(url)
    })
    return () => { if (objectUrl) URL.revokeObjectURL(objectUrl) }
  }, [photoId])

  if (!src) return <div className="photo-placeholder" />
  return <img src={src} alt={alt} />
}
