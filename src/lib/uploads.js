import { uploadImage } from './providers.js'
import { uploadMedia } from '../components/widgets/media.js'

const KEY = 'comfyfield.uploads'

// Recent uploads for the media picker, newest first. The files live in .comfyfield/media; this browser keeps the list.
export function recentUploads() {
  try { return JSON.parse(localStorage.getItem(KEY)) || [] } catch { return [] }
}

function remember(up) {
  try { localStorage.setItem(KEY, JSON.stringify([up, ...recentUploads().filter((u) => u.url !== up.url)].slice(0, 60))) } catch {}
}

export const kindOf = (file) => (file.type || '').split('/')[0]

// Sends any image, video or audio file to /api/upload, so a model can read it, and adds it to the recent list.
export async function uploadFile(file) {
  const kind = kindOf(file)
  const up = kind === 'image' ? await uploadImage(file) : await uploadMedia(file)
  const out = await withRatio({ url: up.url, name: file.name, kind, ...(up.ratio && { ratio: up.ratio }) })
  remember(out)
  return out
}

// Adds the pixel ratio ('1024:768') to a picked image or video that lacks one; crop, mask and video fields need it.
export function withRatio(it) {
  if (/^\d+:\d+$/.test(it.ratio || '') && Number(it.ratio.split(':')[0]) > 32) return Promise.resolve(it)
  if (it.kind !== 'image' && it.kind !== 'video') return Promise.resolve(it)
  return new Promise((resolve) => {
    const done = (w, h) => resolve(w && h ? { ...it, ratio: `${w}:${h}` } : it)
    if (it.kind === 'image') {
      const img = new Image()
      img.onload = () => done(img.naturalWidth, img.naturalHeight)
      img.onerror = () => done()
      img.src = it.url
    } else {
      const v = document.createElement('video')
      v.preload = 'metadata'
      v.onloadedmetadata = () => done(v.videoWidth, v.videoHeight)
      v.onerror = () => done()
      v.src = it.url
    }
  })
}

// The first file on the clipboard, if any. Screenshots paste as image files.
export const pastedFile = (e) => [...(e.clipboardData?.files || [])][0] || null
