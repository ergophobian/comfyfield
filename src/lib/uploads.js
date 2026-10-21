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
  const out = { url: up.url, name: file.name, kind, ...(up.ratio && { ratio: up.ratio }) }
  remember(out)
  return out
}

// The first file on the clipboard, if any. Screenshots paste as image files.
export const pastedFile = (e) => [...(e.clipboardData?.files || [])][0] || null
