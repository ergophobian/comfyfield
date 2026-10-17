// One RunPod Pod for ComfyField: start it on the GPU ladder, watch it, pause, resume and terminate it,
// lease it to runs, and track what it costs. Ported from PatchWork's runpod-client.js and runpod-fleet.js.
// Only a user's click starts or resumes a Pod; every automatic stop terminates.
import fs from 'node:fs'
import path from 'node:path'
import { randomBytes } from 'node:crypto'
import { POD_IMAGE, PROXY_PORT, STATUS_PORT, podEnv, podStartCmd, proxyUrl, statusUrl } from './podBoot.js'

const REST = 'https://rest.runpod.io/v1'
const GQL = 'https://api.runpod.io/graphql'

// Runbook order. Ids and VRAM from RunPod's gpuTypes catalogue on 2026-10-16. PRO 4000 and PRO 4500
// are Secure only today, so their Community rungs are left out: they never place.
export const GPU_LADDER = [
  { gpuTypeId: 'NVIDIA RTX PRO 4000 Blackwell', name: 'RTX PRO 4000', cloudType: 'SECURE', vramGb: 24 },
  { gpuTypeId: 'NVIDIA RTX PRO 4500 Blackwell', name: 'RTX PRO 4500', cloudType: 'SECURE', vramGb: 32 },
  { gpuTypeId: 'NVIDIA RTX PRO 6000 Blackwell Server Edition', name: 'RTX PRO 6000', cloudType: 'COMMUNITY', vramGb: 96 },
  { gpuTypeId: 'NVIDIA RTX PRO 6000 Blackwell Workstation Edition', name: 'RTX PRO 6000 WK', cloudType: 'COMMUNITY', vramGb: 96 },
  { gpuTypeId: 'NVIDIA RTX PRO 6000 Blackwell Server Edition', name: 'RTX PRO 6000', cloudType: 'SECURE', vramGb: 96 },
  { gpuTypeId: 'NVIDIA RTX PRO 6000 Blackwell Workstation Edition', name: 'RTX PRO 6000 WK', cloudType: 'SECURE', vramGb: 96 },
]

export const IDLE_MIN = 10
export const DEFAULT_CAP = 20
export const NO_POD = 'No Pod is ready. Start one in ComfyField from the Pod chip in the top bar.'
const MIN = 60_000
const LIFETIME = 120 * MIN
const DRAIN = 30 * MIN
const DARK = 20 * MIN
const BOOT = 25 * MIN
const STOPPED_DISK_USD_GB_MONTH = 0.2
const HOURS_PER_MONTH = 730
const PREFIX = 'comfyfield-'

// RunPod's ways of saying "no machine free". Lower-cased before matching. From PatchWork.
const CAPACITY = ['no instances', 'could not find any pods', 'supply_constraint', 'does not have the resources', 'try a different machine',
  'no longer any instances', 'insufficient capacity', 'out of capacity', 'no gpu available', 'not enough capacity', 'exceeds capacity', 'not enough free gpus']

const fail = (message, status = 400, extra = {}) => Object.assign(new Error(message), { status, ...extra })
const money = (n) => `$${n.toFixed(2)}`
const day = (t) => { const d = new Date(t); return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}` }
const sleep = (ms) => new Promise((r) => setTimeout(r, ms))

function errorText(data) {
  if (!data) return ''
  if (typeof data === 'string') return data
  return data.error || data.message || (typeof data.detail === 'string' ? data.detail : '') || (data.errors || []).map((e) => e?.message || '').join(' ')
}

export const isCapacity = (status, data) => status !== 401 && status !== 403 && status !== 404 && CAPACITY.some((h) => errorText(data).toLowerCase().includes(h))

function readJson(file, fallback) {
  try { return JSON.parse(fs.readFileSync(file, 'utf8')) } catch { return fallback }
}
function writeJson(file, data) {
  fs.mkdirSync(path.dirname(file), { recursive: true })
  if (data == null) fs.rmSync(file, { force: true })
  else fs.writeFileSync(file, JSON.stringify(data, null, 2), { mode: 0o600 })
}

// The token RunPod echoes back in a Pod's env, so a Pod can be adopted even without pod.json.
function envToken(pod) {
  const env = pod?.env
  if (Array.isArray(env)) return env.map(String).find((e) => e.startsWith('POD_TOKEN='))?.slice(10) || null
  return env?.POD_TOKEN || null
}

// One manager per process. The app, CLI and MCP each make the default one; checks and the sandbox inject fakes.
export function podManager({ fetch: net = (...a) => globalThis.fetch(...a), now = Date.now, keys, dir, ladder = GPU_LADDER, sandbox = false, wait = sleep } = {}) {
  const file = (name) => path.join(dir(), name)
  // `since` is when this process began watching, so a restart never counts the Pod as silent for its whole life.
  const m = { record: undefined, remote: null, status: null, seenAt: null, since: now(), action: null, placing: false, ending: null, event: null, leases: new Set(), timer: null, quote: null, listedAt: 0 }

  const key = () => keys().key || ''
  const cap = () => { const c = parseFloat(keys().cap); return Number.isFinite(c) && c > 0 ? c : DEFAULT_CAP }

  async function call(url, { method = 'GET', body, token, timeoutMs = 20_000 } = {}) {
    // The account key goes to RunPod only; a Pod gets its own token and nothing else.
    const auth = url.startsWith(REST) || url === GQL ? key() : token
    let res
    try {
      res = await net(url, {
        method, signal: AbortSignal.timeout(timeoutMs),
        headers: { ...(auth ? { Authorization: `Bearer ${auth}` } : {}), ...(body ? { 'Content-Type': 'application/json' } : {}) },
        body: body ? JSON.stringify(body) : undefined,
      })
    } catch (e) {
      return { ok: false, status: 0, data: { error: e.message } }
    }
    const text = await res.text().catch(() => '')
    let data = text
    try { data = text ? JSON.parse(text) : null } catch {}
    return { ok: res.ok, status: res.status, data }
  }

  const rest = (p, o) => call(`${REST}${p}`, o)
  async function gql(query) {
    const r = await call(GQL, { method: 'POST', body: { query } })
    if (r.status === 401) throw fail('RunPod rejected the API key. Check it in Connections.', 401)
    if (!r.ok || r.data?.errors?.length) throw fail(`RunPod: ${errorText(r.data) || `HTTP ${r.status}`}`, 502)
    return r.data.data
  }
  const restError = (r, what) => (r.status === 401
    ? fail('RunPod rejected the API key. Check it in Connections.', 401)
    : fail(`RunPod could not ${what}: ${errorText(r.data) || `HTTP ${r.status}`}`, r.status >= 400 ? r.status : 502))

  // ---- record and ledger -------------------------------------------------------------------------

  function record() {
    if (m.record === undefined) m.record = readJson(file('pod.json'), null)
    return m.record
  }
  function save(rec) {
    m.record = rec
    writeJson(file('pod.json'), rec)
  }

  // Spend since the last sample at the Pod's current rate. Gaps while no process watched still count.
  function charge(t = now()) {
    const rec = record()
    const led = readJson(file('pod-ledger.json'), { days: {} })
    if (rec && led.pod === rec.id && led.at) {
      const hours = Math.max(0, t - led.at) / 3_600_000
      const rate = rec.pausedAt ? (rec.volumeGb * STOPPED_DISK_USD_GB_MONTH) / HOURS_PER_MONTH : rec.costPerHr || 0
      const today = day(t)
      led.days[today] = (led.days[today] || 0) + hours * rate
    }
    led.pod = rec?.id || null
    led.at = rec ? t : null
    writeJson(file('pod-ledger.json'), led)
    return led
  }
  const spentToday = () => readJson(file('pod-ledger.json'), { days: {} }).days[day(now())] || 0

  function clear(event) {
    charge()
    for (const l of m.leases) l.end(event || 'The Pod is gone.')
    m.status = null
    m.seenAt = null
    m.remote = null
    m.ending = null
    if (event) m.event = { text: event, at: now() }
    save(null)
    writeJson(file('pod-ledger.json'), { ...readJson(file('pod-ledger.json'), { days: {} }), pod: null, at: null })
  }

  // ---- reading the Pod ---------------------------------------------------------------------------

  // Finds a Pod this app started when pod.json is missing, through the token RunPod echoes in its env.
  async function adopt({ force = false } = {}) {
    if (record() || !key()) return record()
    if (!force && now() - m.listedAt < 10 * MIN) return null
    m.listedAt = now()
    const r = await rest('/pods')
    const rows = Array.isArray(r.data) ? r.data : r.data?.data || []
    const pod = rows.find((p) => p.name?.startsWith(PREFIX) && p.desiredStatus !== 'TERMINATED' && envToken(p))
    if (!pod) return null
    const rung = ladder.find((x) => x.gpuTypeId === pod.machine?.gpuTypeId) || {}
    save({
      id: pod.id, name: pod.name, token: envToken(pod), gpuTypeId: rung.gpuTypeId || null, gpu: rung.name || 'GPU', cloudType: rung.cloudType || null,
      costPerHr: pod.costPerHr || 0, volumeGb: pod.volumeInGb || 60, createdAt: Date.parse(pod.createdAt) || now(), startedAt: Date.parse(pod.createdAt) || now(),
      pausedAt: pod.desiredStatus === 'EXITED' ? now() : null,
    })
    charge()
    return record()
  }

  async function refresh() {
    const rec = record()
    if (!rec) return null
    const r = await rest(`/pods/${rec.id}`)
    if (r.status === 404 || r.data?.desiredStatus === 'TERMINATED') {
      clear(m.event?.text && now() - m.event.at < MIN ? m.event.text : 'The Pod is gone. It may have terminated itself.')
      return null
    }
    if (!r.ok) return rec // RunPod blipped; keep what we know
    m.remote = r.data
    const paused = r.data.desiredStatus === 'EXITED'
    if (paused !== Boolean(rec.pausedAt) || (r.data.costPerHr && r.data.costPerHr !== rec.costPerHr)) {
      charge()
      save({ ...rec, pausedAt: paused ? rec.pausedAt || now() : null, costPerHr: r.data.costPerHr || rec.costPerHr })
    }
    if (paused) { m.status = null; return record() }
    const s = await call(`${statusUrl(rec.id)}/status`, { token: rec.token, timeoutMs: 8000 })
    if (s.ok && s.data && typeof s.data === 'object') {
      m.status = s.data
      m.seenAt = now()
    }
    return record()
  }

  const heartbeat = (rec = record()) => rec && !rec.pausedAt && call(`${statusUrl(rec.id)}/heartbeat`, { method: 'POST', token: rec.token, timeoutMs: 8000 })

  function phase() {
    const rec = record()
    if (m.action) return m.action
    if (!rec) return m.placing ? 'starting' : 'none'
    if (rec.pausedAt) return 'paused'
    if (m.ending) return 'ending'
    return m.status?.ready ? 'ready' : 'starting'
  }

  function stage() {
    if (m.placing) return 'placing'
    const p = phase()
    if (p !== 'starting') return null
    return m.status ? 'booting' : 'waiting'
  }

  function downloads() {
    return Object.entries(m.status?.downloads || {}).map(([k, v]) => ({ file: k.split('/').pop(), dir: k.split('/')[0], ...v }))
  }

  function status() {
    const rec = record()
    const t = now()
    return {
      phase: phase(), stage: stage(), sandbox,
      pod: rec && {
        id: rec.id, gpu: rec.gpu, cloudType: rec.cloudType, costPerHr: rec.costPerHr, volumeGb: rec.volumeGb,
        startedAt: rec.startedAt, uptimeSec: Math.round((t - rec.startedAt) / 1000),
        pausedDiskPerDay: (rec.volumeGb * STOPPED_DISK_USD_GB_MONTH * 12) / 365,
      },
      spend: { today: spentToday(), cap: cap() },
      runs: m.leases.size, queue: m.status?.queue ?? null, downloads: downloads(),
      ending: m.ending?.then || null, event: m.event, connected: Boolean(key()),
    }
  }

  // ---- guards ------------------------------------------------------------------------------------

  // Why the app terminates the Pod now, or null. The Pod's own watchdog backs this up when the app is closed.
  function guard() {
    const rec = record()
    if (!rec || rec.pausedAt || m.action) return null
    const s = m.status
    const t = now()
    const age = t - rec.startedAt
    const busy = m.leases.size > 0 || (s?.queue ?? 0) > 0 || downloads().some((d) => d.state === 'queued' || d.state === 'downloading')
    if (s?.fatal) return `The Pod failed to start: ${s.fatal}`
    if (t - (m.seenAt || Math.max(rec.startedAt, m.since)) >= DARK) return 'Terminated: the Pod did not answer for 20 minutes.'
    if (s && !s.ready && age >= BOOT) return 'Terminated: the Pod was not ready after 25 minutes.'
    if (age >= LIFETIME + DRAIN || (age >= LIFETIME && !busy)) return 'Terminated at the 2-hour limit.'
    if (s?.ready && !busy && (s.idleSec || 0) >= IDLE_MIN * 60) return `Terminated after ${IDLE_MIN} idle minutes.`
    return null
  }

  async function tick() {
    await adopt().catch(() => null)
    const rec = await refresh().catch(() => record())
    if (!rec) return status()
    charge()
    await heartbeat(rec)
    const reason = guard()
    if (reason) await end('terminate', reason)
    else if (m.ending && m.leases.size === 0 && !(m.status?.queue > 0)) await end(m.ending.then, m.ending.then === 'pause' ? 'Paused after the queue finished.' : 'Terminated after the queue finished.')
    return status()
  }

  // ---- actions -----------------------------------------------------------------------------------

  async function quote({ minVramGb = 0 } = {}) {
    const rungs = ladder.filter((r) => r.vramGb >= minVramGb)
    const base = { rungs: rungs.map((r) => ({ ...r, usdPerHr: null, inStock: null })), spend: { today: spentToday(), cap: cap() }, bootMinutes: [5, 8], connected: Boolean(key()) }
    if (!key() || !rungs.length) return base
    if (m.quote && now() - m.quote.at < 5 * MIN && m.quote.min === minVramGb) return { ...m.quote.data, spend: base.spend }
    const q = rungs.map((r, i) => `r${i}: gpuTypes(input: {id: ${JSON.stringify(r.gpuTypeId)}}) { lowestPrice(input: {gpuCount: 1, secureCloud: ${r.cloudType === 'SECURE'}}) { uninterruptablePrice availableGpuCounts stockStatus } }`)
    const data = await gql(`query { ${q.join(' ')} }`).catch(() => null)
    if (!data) return base
    const out = { ...base, rungs: rungs.map((r, i) => {
      const lp = data[`r${i}`]?.[0]?.lowestPrice || {}
      const counts = Array.isArray(lp.availableGpuCounts) ? lp.availableGpuCounts.filter((n) => n > 0) : null
      return { ...r, usdPerHr: lp.uninterruptablePrice ?? null, inStock: counts ? counts.length > 0 : null }
    }) }
    m.quote = { at: now(), min: minVramGb, data: out }
    return out
  }

  async function start({ minVramGb = 0, volumeGb = 60 } = {}) {
    if (!key()) throw fail('Add your RunPod key in Connections first.', 400)
    await adopt({ force: true }).catch(() => null)
    if (record() || m.placing) throw fail('A Pod already exists. ComfyField runs one Pod at a time.', 409)
    const spent = spentToday()
    if (spent >= cap()) throw fail(`Daily cap reached: ${money(spent)} of ${money(cap())} today. Raise it in Connections.`, 402)
    const rungs = ladder.filter((r) => r.vramGb >= minVramGb)
    if (!rungs.length) throw fail(`No GPU ComfyField starts has ${minVramGb} GB of memory.`, 400)
    m.placing = true
    m.event = null
    const token = randomBytes(24).toString('hex')
    const name = `${PREFIX}${now().toString(36)}`
    const volume = Math.max(60, Math.ceil(volumeGb / 10) * 10)
    try {
      let refused = 0
      for (const rung of rungs) {
        const r = await rest('/pods', { method: 'POST', timeoutMs: 60_000, body: {
          name, imageName: POD_IMAGE, gpuTypeIds: [rung.gpuTypeId], gpuCount: 1, cloudType: rung.cloudType,
          containerDiskInGb: 50, volumeInGb: volume, volumeMountPath: '/workspace',
          ports: [`${PROXY_PORT}/http`, `${STATUS_PORT}/http`], env: podEnv({ token, idleMin: IDLE_MIN }), dockerStartCmd: podStartCmd(),
        } })
        if (r.ok && r.data?.id) {
          const t = now()
          save({ id: r.data.id, name, token, gpuTypeId: rung.gpuTypeId, gpu: rung.name, cloudType: rung.cloudType, costPerHr: r.data.costPerHr || 0, volumeGb: volume, createdAt: t, startedAt: t, pausedAt: null })
          charge(t)
          m.placing = false
          kick()
          return status()
        }
        if (isCapacity(r.status, r.data)) { refused++; continue }
        // A 5xx can still have created a billing Pod, so look for it before giving up.
        if (r.status >= 500 || r.status === 0) {
          const found = await adopt({ force: true }).catch(() => null)
          if (found) { m.placing = false; kick(); return status() }
        }
        throw restError(r, `start a ${rung.name}`)
      }
      throw fail(`RunPod has no free GPU right now. ComfyField tried ${refused} GPU${refused === 1 ? '' : 's'}. Try again in a few minutes.`, 503, { code: 'no_capacity' })
    } finally {
      m.placing = false
    }
  }

  // Pause or terminate. With runs in progress and no `now`, the Pod ends after its queue instead.
  async function end(how, reason) {
    const rec = record()
    if (!rec) return status()
    m.action = how === 'pause' ? 'pausing' : 'terminating'
    try {
      for (const l of m.leases) l.end(reason)
      if (how === 'pause') {
        const r = await rest(`/pods/${rec.id}/stop`, { method: 'POST' })
        if (!r.ok) throw restError(r, 'pause the Pod')
        charge()
        save({ ...record(), pausedAt: now() })
        m.status = null
        m.ending = null
        m.event = { text: reason, at: now() }
      } else {
        const r = await rest(`/pods/${rec.id}`, { method: 'DELETE' })
        if (!r.ok && r.status !== 404) throw restError(r, 'terminate the Pod')
        clear(reason)
      }
    } finally {
      m.action = null
    }
    return status()
  }

  const busy = () => m.leases.size > 0 || (m.status?.queue ?? 0) > 0
  async function pause({ now: at = false } = {}) {
    const rec = record()
    if (!rec) throw fail('There is no Pod to pause.', 409)
    if (rec.pausedAt) return status()
    if (busy() && !at) { m.ending = { then: 'pause' }; kick(); return status() }
    return end('pause', 'You paused the Pod.')
  }
  async function terminate({ now: at = false } = {}) {
    if (!record()) return status()
    if (busy() && !at && !record().pausedAt) { m.ending = { then: 'terminate' }; kick(); return status() }
    return end('terminate', 'You terminated the Pod.')
  }
  function keep() { m.ending = null; return status() }

  async function resume() {
    const rec = record()
    if (!rec?.pausedAt) throw fail('There is no paused Pod to resume.', 409)
    const spent = spentToday()
    if (spent >= cap()) throw fail(`Daily cap reached: ${money(spent)} of ${money(cap())} today. Raise it in Connections.`, 402)
    m.action = 'resuming'
    try {
      const r = await rest(`/pods/${rec.id}/start`, { method: 'POST', timeoutMs: 60_000 })
      if (!r.ok) {
        if (isCapacity(r.status, r.data)) throw fail('RunPod has no free GPU on this Pod\'s machine right now. Terminate it and start a new Pod.', 503, { code: 'resume_no_gpu' })
        throw restError(r, 'resume the Pod')
      }
      charge()
      save({ ...record(), pausedAt: null, startedAt: now() })
      m.status = null
      m.seenAt = null
      m.since = now()
      m.event = null
    } finally {
      m.action = null
    }
    kick()
    return status()
  }

  // ---- leases ------------------------------------------------------------------------------------

  // A run holds a lease while it uses the Pod: it waits for a starting Pod, gets its missing model
  // files, and keeps the Pod beaten. It never starts or resumes one.
  async function lease({ files = [], signal, onStage = () => {}, pollMs = 3000 } = {}) {
    const ctl = new AbortController()
    const l = { signal: ctl.signal, reason: null, end: (why) => { l.reason = why; ctl.abort(new Error(why)) } }
    const stop = () => l.end('Cancelled.')
    signal?.addEventListener('abort', stop)
    const check = () => { if (l.reason) throw fail(l.reason, 409) }
    m.leases.add(l)
    const beat = setInterval(() => heartbeat(), 20_000)
    beat.unref?.()
    const release = () => { clearInterval(beat); m.leases.delete(l); signal?.removeEventListener('abort', stop) }
    try {
      for (;;) {
        check()
        await adopt().catch(() => null)
        const rec = m.placing ? null : await refresh().catch(() => record())
        if (!rec && !m.placing) throw fail(m.event && now() - m.event.at < 10 * MIN ? `${m.event.text} ${NO_POD}` : NO_POD, 409, { code: 'no_pod' })
        if (rec?.pausedAt) throw fail(NO_POD, 409, { code: 'paused' })
        if (m.ending) throw fail('The Pod is ending after its queue. Keep it from the Pod chip in the top bar.', 409, { code: 'ending' })
        if (rec && m.status?.ready) break
        onStage('waiting')
        await wait(pollMs)
      }
      const have = new Set((m.status.models || []).map((f) => `${f.dir}/${f.name}`))
      const missing = files.filter((f) => !have.has(`${f.dir}/${f.name}`))
      if (missing.length) {
        onStage('downloading')
        const rec = record()
        const r = await call(`${statusUrl(rec.id)}/download`, { method: 'POST', token: rec.token, body: { files: missing.map(({ repo, path: p, dir, name }) => ({ repo, path: p, dir, name })) } })
        if (!r.ok) throw fail(`The Pod refused the model download: ${errorText(r.data) || `HTTP ${r.status}`}`, 502)
        for (;;) {
          check()
          await wait(pollMs)
          await refresh().catch(() => null)
          check()
          if (!record()) throw fail(m.event?.text || NO_POD, 409)
          const d = m.status?.downloads || {}
          const failed = missing.find((f) => d[`${f.dir}/${f.name}`]?.state === 'failed')
          if (failed) {
            const err = d[`${failed.dir}/${failed.name}`].error || 'unknown error'
            throw fail(err === 'disk full' ? 'The Pod\'s disk is full. Terminate it and start a new one.' : `Could not download ${failed.name} to the Pod: ${err}`, 502)
          }
          if (missing.every((f) => d[`${f.dir}/${f.name}`]?.state === 'done')) break
        }
      }
      check()
      const rec = record()
      onStage('running')
      return { baseUrl: proxyUrl(rec.id), token: rec.token, sandbox, signal: l.signal, reason: () => l.reason, release }
    } catch (e) {
      release()
      throw e
    }
  }

  // ---- monitor -----------------------------------------------------------------------------------

  // Only the app's server runs the monitor. It ticks fast while a Pod starts or downloads.
  function startMonitor() {
    if (m.timer) return
    const loop = async () => {
      m.ticking = true
      await tick().catch(() => null)
      m.ticking = false
      if (!m.timer) return
      const p = phase()
      const quick = p === 'starting' || p === 'ending' || downloads().some((d) => d.state !== 'done' && d.state !== 'failed')
      m.timer = setTimeout(loop, quick ? 5000 : 20_000)
      m.timer.unref?.()
    }
    m.loop = loop
    m.timer = setTimeout(loop, 0)
    m.timer.unref?.()
  }
  function stopMonitor() { clearTimeout(m.timer); m.timer = null; m.loop = null }
  // A start, resume or end should not wait out a 20 s sleep before the chip moves.
  function kick() {
    if (!m.loop || m.ticking) return
    clearTimeout(m.timer)
    m.timer = setTimeout(m.loop, 1000)
    m.timer.unref?.()
  }

  async function test() {
    if (!key()) return false
    return gql('query { myself { id } }').then((d) => Boolean(d?.myself?.id)).catch(() => false)
  }

  return { status, quote, start, pause, resume, terminate, keep, lease, tick, refresh, startMonitor, stopMonitor, test, guard, spentToday }
}
