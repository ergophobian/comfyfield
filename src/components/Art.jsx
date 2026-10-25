import { useEffect, useRef, useState } from 'react'
import { useLocation } from 'react-router-dom'
import { artEntry, heroArt, pageArtId } from '../lib/formats/art.js'
import { createCoverPlayback } from '../lib/artPlayback.js'

const playback = createCoverPlayback()

function useStillCover() {
  const blocked = () => window.matchMedia('(prefers-reduced-motion: reduce)').matches || navigator.connection?.saveData === true
  const [still, setStill] = useState(blocked)
  useEffect(() => {
    const media = window.matchMedia('(prefers-reduced-motion: reduce)')
    const connection = navigator.connection
    const update = () => setStill(blocked())
    media.addEventListener('change', update)
    connection?.addEventListener('change', update)
    update()
    return () => {
      media.removeEventListener('change', update)
      connection?.removeEventListener('change', update)
    }
  }, [])
  return still
}

function VideoCover({ entry, className, width, height }) {
  const ref = useRef(null)
  const stillOnly = useStillCover()
  const [failed, setFailed] = useState(false)
  const [playing, setPlaying] = useState(false)
  const [imageFailed, setImageFailed] = useState([])
  const poster = [entry.poster, entry.still].find((src) => src && !imageFailed.includes(src))
  const enabled = !stillOnly && !failed

  useEffect(() => {
    const video = ref.current
    if (!enabled || !video || !window.IntersectionObserver) return
    const cover = playback.add(video, () => setFailed(true))
    const observer = new IntersectionObserver(([item]) => {
      cover.visibility(item.isIntersecting ? item.intersectionRatio : 0)
    }, { threshold: [0, 0.5] })
    observer.observe(video)
    const updateVisibility = () => playback.schedule()
    document.addEventListener('visibilitychange', updateVisibility)
    return () => {
      observer.disconnect()
      document.removeEventListener('visibilitychange', updateVisibility)
      cover.remove()
    }
  }, [enabled])

  return <span className={`art-image art-media ${className}`} aria-hidden="true" data-video-cover={entry.video}>
    {poster && <img className="art-image" src={poster} alt="" width={width} height={height} loading="lazy" decoding="async"
      onError={() => setImageFailed((failed) => [...failed, poster])} />}
    {enabled && <video ref={ref} className={`art-image art-video${playing ? ' is-playing' : ''}`} src={entry.video}
      width={width} height={height} muted loop playsInline preload="none" poster={poster} aria-hidden="true"
      onPlaying={() => setPlaying(true)} onPause={() => setPlaying(false)} onError={() => setFailed(true)} />}
  </span>
}

// Failed or missing art leaves the caller's existing gradient visible.
export function ArtImage({ id, src, alt = '', className = '', width = 768, height = 432 }) {
  const entry = artEntry(id, src)
  const [failed, setFailed] = useState(null)
  if (entry.video) return <VideoCover key={entry.video} entry={entry} className={className} width={width} height={height} />
  if (!entry.still || failed === entry.still) return null
  return <img className={`art-image ${className}`} src={entry.still} alt={alt} width={width} height={height}
    loading="lazy" decoding="async" onError={() => setFailed(entry.still)} />
}

export function PageArt({ id, className = '' }) {
  const { pathname } = useLocation()
  const page = id || pageArtId(pathname)
  const src = heroArt(page)
  return src ? <div className={`page-art ${className}`} data-art={page}><ArtImage id={page} src={src} width={1600} height={900} alt="" /></div> : null
}
