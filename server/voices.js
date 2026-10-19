import fs from 'node:fs'
import path from 'node:path'
import crypto from 'node:crypto'
import { spawn } from 'node:child_process'
import ffmpeg from 'ffmpeg-static'
import { voiceLimits as limits } from '../shared/voices.js'
import { libraryStore } from './library.js'

const fail = (message, status = 400) => { throw Object.assign(new Error(message), { status }) }
const rateBytes = limits.rate * 2

async function body(req) {
  const chunks = []
  let bytes = 0
  for await (const chunk of req) {
    bytes += chunk.length
    if (bytes > Math.ceil(limits.bytes * 4 / 3) + 8192) fail('Sample must be 11 MB or smaller.', 413)
    chunks.push(chunk)
  }
  try { return JSON.parse(Buffer.concat(chunks).toString('utf8')) }
  catch { fail('Invalid voice data.') }
}

export function decodeVoice(file) {
  return new Promise((resolve, reject) => {
    // M4a often needs backward seeks. Only audio containers are allowed, never playlists or network URLs.
    const child = spawn(ffmpeg, ['-hide_banner', '-loglevel', 'error', '-nostdin', '-protocol_whitelist', 'file,pipe', '-format_whitelist', 'wav,mp3,flac,mov,matroska,webm,ogg', '-i', file, '-vn', '-t', String(limits.sourceSeconds + 1), '-ac', '1', '-ar', String(limits.rate), '-f', 's16le', 'pipe:1'], { windowsHide: true, stdio: ['ignore', 'pipe', 'pipe'] })
    const chunks = []
    let size = 0
    const timer = setTimeout(() => child.kill(), 30000)
    child.stdout.on('data', (part) => {
      size += part.length
      if (size > rateBytes * (limits.sourceSeconds + 2)) child.kill()
      else chunks.push(part)
    })
    child.stderr.resume()
    child.once('error', (e) => { clearTimeout(timer); reject(e) })
    child.once('close', (code) => {
      clearTimeout(timer)
      if (code !== 0 || !size) reject(Object.assign(new Error('Could not read that audio. Try a wav, mp3, flac or m4a sample.'), { status: 400 }))
      else resolve(Buffer.concat(chunks))
    })
  })
}

function wav(pcm) {
  const h = Buffer.alloc(44)
  h.write('RIFF', 0); h.writeUInt32LE(36 + pcm.length, 4); h.write('WAVE', 8)
  h.write('fmt ', 12); h.writeUInt32LE(16, 16); h.writeUInt16LE(1, 20); h.writeUInt16LE(1, 22)
  h.writeUInt32LE(limits.rate, 24); h.writeUInt32LE(rateBytes, 28); h.writeUInt16LE(2, 32); h.writeUInt16LE(16, 34)
  h.write('data', 36); h.writeUInt32LE(pcm.length, 40)
  return Buffer.concat([h, pcm])
}

export function voiceRoutes({ home, saveMedia, library = libraryStore(home) }) {
  const send = (res, status, data) => {
    res.statusCode = status
    res.setHeader('Content-Type', 'application/json')
    res.end(JSON.stringify(data))
    return true
  }
  return async (req, res, url) => {
    const match = /^\/api\/library\/voices(?:\/([\w-]+))?$/.exec(url.pathname)
    if (!match) return false
    try {
      const id = match[1]
      if (req.method === 'GET' && !id) return send(res, 200, library.read().voices || [])
      if (req.method === 'POST' && !id) {
        const data = await body(req)
        const name = String(data.name || '').trim().slice(0, 120)
        if (!name) fail('Give the voice a name.')
        if (data.consent !== true) fail("Confirm you have the speaker's permission.")
        if (!/\.(wav|mp3|flac|m4a|webm|ogg)$/i.test(data.fileName || '')) fail('Choose a wav, mp3, flac or m4a sample.')
        const match = /^data:audio\/[\w.+-]+;base64,([A-Za-z0-9+/=\s]+)$/.exec(data.dataUrl || '')
        if (!match) fail('Choose an audio sample first.')
        const source = Buffer.from(match[1], 'base64')
        if (source.length > limits.bytes) fail('Sample must be 11 MB or smaller.', 413)
        const mediaDir = path.join(home(), 'media')
        fs.mkdirSync(mediaDir, { recursive: true })
        const temporary = path.join(mediaDir, `.voice-upload-${crypto.randomUUID()}`)
        let pcm
        try {
          fs.writeFileSync(temporary, source, { flag: 'wx' })
          pcm = await decodeVoice(temporary)
        } finally {
          if (fs.existsSync(temporary)) fs.unlinkSync(temporary)
        }
        const sourceDuration = pcm.length / rateBytes
        if (sourceDuration < limits.minSeconds || sourceDuration > limits.sourceSeconds) fail('Use a recording between 6 and 60 seconds.')
        const start = Number(data.start ?? 0)
        const duration = Number(data.duration ?? Math.min(sourceDuration, limits.sampleSeconds))
        if (!Number.isFinite(start) || start < 0 || !Number.isFinite(duration) || duration < limits.minSeconds || duration > limits.sampleSeconds || start + duration > sourceDuration + 0.02) fail('Select 6 to 10 seconds within the recording.')
        const trimmed = pcm.subarray(Math.round(start * limits.rate) * 2, Math.round((start + duration) * limits.rate) * 2)
        if (trimmed.length < limits.minSeconds * rateBytes || trimmed.length > limits.sampleSeconds * rateBytes) fail('Select 6 to 10 seconds within the recording.')
        const sample = saveMedia(wav(trimmed), 'wav').url
        const item = { id: crypto.randomUUID(), name, notes: String(data.notes || '').slice(0, 2000), sample, duration: trimmed.length / rateBytes, consent: true, consentAt: Date.now(), created: Date.now() }
        await library.update((lib) => { lib.voices = [item, ...(lib.voices || [])] })
        return send(res, 200, item)
      }
      const patch = req.method === 'PATCH' ? await body(req) : null
      const result = await library.update((lib) => {
        const list = lib.voices || []
        const item = list.find((v) => v.id === id)
        if (!item) return { status: 404, data: { error: 'Voice not found.' } }
        if (req.method === 'PATCH') {
          const name = String(patch.name ?? item.name).trim().slice(0, 120)
          if (!name) fail('Give the voice a name.')
          const next = { ...item, name, notes: String(patch.notes ?? item.notes).slice(0, 2000) }
          lib.voices = list.map((v) => v.id === id ? next : v)
          return { status: 200, data: next }
        }
        if (req.method === 'DELETE') {
          // The confirmation explains that existing flows keep the sample file.
          lib.voices = list.filter((v) => v.id !== id)
          return { status: 200, data: { ok: true } }
        }
        return { status: 405, data: { error: 'Method not supported.' } }
      })
      return send(res, result.status, result.data)
    } catch (e) { return send(res, e.status || 500, { error: e.status ? e.message : 'Could not save the voice. Try again.' }) }
  }
}
