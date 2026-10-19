import { useState } from 'react'
import { useLocation } from 'react-router-dom'
import { coverArt, heroArt, pageArtId } from '../lib/formats/art.js'

// Failed or missing art leaves the caller's existing gradient visible.
export function ArtImage({ id, src = coverArt[id], alt = '', className = '', width = 768, height = 432 }) {
  const [failed, setFailed] = useState(null)
  if (!src || failed === src) return null
  return <img className={`art-image ${className}`} src={src} alt={alt} width={width} height={height}
    loading="lazy" decoding="async" onError={() => setFailed(src)} />
}

export function PageArt({ id, className = '' }) {
  const { pathname } = useLocation()
  const page = id || pageArtId(pathname)
  const src = heroArt(page)
  return src ? <div className={`page-art ${className}`} data-art={page}><ArtImage src={src} width={1600} height={900} alt="" /></div> : null
}
