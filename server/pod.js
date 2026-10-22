// One RunPod Pod for ComfyField: start it on the GPU ladder, watch it, pause, resume and terminate it,
// lease it to runs, and track what it costs. Ported from PatchWork's runpod-client.js and runpod-fleet.js.
// Only a user's click starts or resumes a Pod; every automatic stop terminates.
import fs from 'node:fs'
import path from 'node:path'
import { randomBytes } from 'node:crypto'
import { POD_IMAGE, PROXY_PORT, STATUS_PORT, podEnv, podStartCmd, proxyUrl, statusUrl } from './podBoot.js'
import { RUNTIMES, volumeFor } from '../shared/modelFiles.js'

const REST = 'https://rest.runpod.io/v1'
const GQL = 'https://api.runpod.io/graphql'

// Runbook order. Ids and VRAM from RunPod's gpuTypes catalogue on 2026-10-16. PRO 4000 and PRO 4500
// are Secure only today, so their Community rungs are left out: they never place.
export const GPU_LADDER = [
  { gpuTypeId: 'NVIDIA RTX PRO 4000 Blackwell', name: 'RTX PRO 4000', cloudType: 'SECURE', vramGb: 24, arch: 'blackwell' },
  { gpuTypeId: 'NVIDIA RTX PRO 4500 Blackwell', name: 'RTX PRO 4500', cloudType: 'SECURE', vramGb: 32, arch: 'blackwell' },
  { gpuTypeId: 'NVIDIA RTX PRO 6000 Blackwell Server Edition', name: 'RTX PRO 6000', cloudType: 'COMMUNITY', vramGb: 96, arch: 'blackwell' },
  { gpuTypeId: 'NVIDIA RTX PRO 6000 Blackwell Workstation Edition', name: 'RTX PRO 6000 Workstation', cloudType: 'COMMUNITY', vramGb: 96, arch: 'blackwell' },
  { gpuTypeId: 'NVIDIA RTX PRO 6000 Blackwell Server Edition', name: 'RTX PRO 6000', cloudType: 'SECURE', vramGb: 96, arch: 'blackwell' },
  { gpuTypeId: 'NVIDIA RTX PRO 6000 Blackwell Workstation Edition', name: 'RTX PRO 6000 Workstation', cloudType: 'SECURE', vramGb: 96, arch: 'blackwell' },
]

// GPUs only a Session tier starts, after the ladder: the faster cards Balanced and Performance need. Ids
// and memory from RunPod's listing on 2026-10-19 (PatchWork's price snapshot). PatchWork ran both on the
// same Pod image (CUDA 13), so they count as tested. Hopper has no NVFP4, so H3's NVFP4 text encoder
// keeps H3 runs on Blackwell. Next to test: RTX 5090, RTX PRO 5000, L40S and B200.
export const GPU_EXTRA = [
  { gpuTypeId: 'NVIDIA H100 80GB HBM3', name: 'H100 SXM', cloudType: 'COMMUNITY', vramGb: 80, arch: 'hopper' },
  { gpuTypeId: 'NVIDIA H100 80GB HBM3', name: 'H100 SXM', cloudType: 'SECURE', vramGb: 80, arch: 'hopper' },
  { gpuTypeId: 'NVIDIA H200', name: 'H200', cloudType: 'COMMUNITY', vramGb: 141, arch: 'hopper' },
  { gpuTypeId: 'NVIDIA H200', name: 'H200', cloudType: 'SECURE', vramGb: 141, arch: 'hopper' },
]
export const GPU_CATALOG = [...GPU_LADDER, ...GPU_EXTRA]

export const IDLE_MIN = 10
// Idle shutdown the user can pick on the Pods page, in minutes, and the disk sizes it offers in GB.
export const IDLE_CHOICES = [5, 10, 15, 30, 60]
export const POD_VOLUMES = [120, 200, 300]
export const idleMinutes = (value) => (IDLE_CHOICES.includes(Number(value)) ? Number(value) : IDLE_MIN)
export const DEFAULT_CAP = 20
export const NO_POD = 'No Pod is ready. Start one in ComfyField from the Pod chip in the top bar.'
const MIN = 60_000
const LIFETIME = 120 * MIN
const DRAIN = 30 * MIN
const DARK = 20 * MIN
const BOOT = 25 * MIN
// A Pod found gone was alive at most this long after the last sample: its watchdog
// terminates it 10 minutes after the last heartbeat.
const GONE_GRACE = 13 * MIN
export const STOPPED_DISK_USD_GB_MONTH = 0.2
const HOURS_PER_MONTH = 730
const PREFIX = 'comfyfield-'
export const MIN_VOLUME_GB = 120

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
// `owner` marks the process that writes the spend ledger; the app's server becomes it when its monitor starts.
export function podManager({ fetch: net = (...a) => globalThis.fetch(...a), now = Date.now, keys, dir, ladder = GPU_LADDER, extra = GPU_EXTRA, sandbox = false, wait = sleep, owner = false } = {}) {
  // Every GPU a start may use: the ladder, then the cards only a Session tier picks.
  const all = [...ladder, ...extra]
  const file = (name) => path.join(dir(), name)
  // `since` is when this process began watching, so a restart never counts the Pod as silent for its whole life.
  const m = { record: undefined, readAt: 0, remote: null, status: null, seenAt: null, since: now(), action: null, placing: false, ending: null, event: null,
    leases: new Set(), timer: null, loop: null, ticking: false, quote: null, listedAt: 0, owner }

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

  // pod.json is shared by the app, the CLI and MCP, so it is read again after a second.
  function record() {
    if (m.record === undefined || Date.now() - m.readAt > 1000) {
      m.record = readJson(file('pod.json'), null)
      m.readAt = Date.now()
    }
    return m.record
  }
  function save(rec) {
    m.record = rec
    m.readAt = Date.now()
    writeJson(file('pod.json'), rec)
  }

  // Adds spend between two times, split at local midnight so each day gets its own share.
  function addSpend(led, from, to, rate) {
    for (let t = from; t < to;) {
      const d = new Date(t)
      const end = Math.min(to, new Date(d.getFullYear(), d.getMonth(), d.getDate() + 1).getTime())
      led.days[day(t)] = (led.days[day(t)] || 0) + ((end - t) / 3_600_000) * rate
      t = end
    }
  }

  // Spend since the last sample at the Pod's current rate. A gap while nothing watched still counts,
  // but a Pod found gone is charged only for the minutes its watchdog could have kept it alive.
  // `last` closes the ledger for a Pod that has ended. Only the owner writes it.
  function charge(t = now(), { gone = false, last = false } = {}) {
    if (!m.owner) return
    const rec = record()
    const led = readJson(file('pod-ledger.json'), { days: {} })
    if (rec && led.pod === rec.id && led.at) {
      const rate = rec.pausedAt ? (rec.volumeGb * STOPPED_DISK_USD_GB_MONTH) / HOURS_PER_MONTH : rec.costPerHr || 0
      addSpend(led, led.at, Math.max(led.at, gone ? Math.min(t, led.at + GONE_GRACE) : t), rate)
    }
    led.pod = rec && !last ? rec.id : null
    led.at = rec && !last ? t : null
    writeJson(file('pod-ledger.json'), led)
  }
  const spentToday = () => readJson(file('pod-ledger.json'), { days: {} }).days[day(now())] || 0

  function clear(event, { gone = false } = {}) {
    const ended = record()?.id
    charge(now(), { gone, last: true })
    for (const l of m.leases) l.end(event || 'The Pod is gone.')
    m.status = null
    m.seenAt = null
    m.remote = null
    m.ending = null
    if (event) m.event = { text: event, at: now() }
    // Another process may have saved a newer Pod meanwhile; remove only the record that ended.
    const onDisk = readJson(file('pod.json'), null)
    if (!onDisk || onDisk.id === ended) save(null)
    else { m.record = onDisk; m.readAt = Date.now() }
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
    const rung = all.find((x) => x.gpuTypeId === pod.machine?.gpuTypeId) || {}
    save({
      id: pod.id, name: pod.name, token: envToken(pod), gpuTypeId: rung.gpuTypeId || null, gpu: rung.name || 'GPU', vramGb: rung.vramGb || null, cloudType: rung.cloudType || null, arch: rung.arch || null,
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
    // An action or another process may have changed the record during the call. Saving over it
    // would undo a resume, so leave it for the next tick to read fresh.
    const cur = record()
    if (m.action || !cur || cur.id !== rec.id || cur.startedAt !== rec.startedAt || Boolean(cur.pausedAt) !== Boolean(rec.pausedAt)) return cur
    if (r.status === 404 || r.data?.desiredStatus === 'TERMINATED') {
      clear(m.event?.text && now() - m.event.at < MIN ? m.event.text : 'The Pod is gone. It may have terminated itself.', { gone: true })
      return record()
    }
    if (!r.ok) return cur // RunPod blipped; keep what we know
    m.remote = r.data
    const paused = r.data.desiredStatus === 'EXITED'
    if (paused !== Boolean(cur.pausedAt) || (r.data.costPerHr && r.data.costPerHr !== cur.costPerHr)) {
      charge()
      save({ ...cur, pausedAt: paused ? cur.pausedAt || now() : null, costPerHr: r.data.costPerHr || cur.costPerHr })
    }
    if (paused) { m.status = null; return record() }
    const s = await call(`${statusUrl(cur.id)}/status`, { token: cur.token, timeoutMs: 8000 })
    // The Pod may have ended, or another started, while the status was on its way.
    if (record()?.id !== cur.id) return record()
    if (s.ok && s.data && typeof s.data === 'object') {
      m.status = s.data
      m.seenAt = now()
    }
    return record()
  }

  // `leases` tells the Pod's watchdog a run is on its way, so it does not end the Pod at its lifetime
  // limit in the gap before the run's downloads or queue start.
  const heartbeat = (rec = record()) => rec && !rec.pausedAt && call(`${statusUrl(rec.id)}/heartbeat`, { method: 'POST', token: rec.token, timeoutMs: 8000, body: { leases: m.leases.size } })

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
    return Object.entries(m.status?.downloads || {}).map(([k, v]) => ({ file: k.slice(k.lastIndexOf('/') + 1), dir: k.slice(0, k.lastIndexOf('/')), ...v }))
  }
  const runtimeName = (id) => RUNTIMES[id]?.name || id
  function runtimes() {
    return Object.entries(m.status?.runtimes || {}).map(([id, v]) => ({ runtime: id, name: runtimeName(id), minutes: RUNTIMES[id]?.minutes || null, ...v }))
  }
  // A node pack that is installed but not yet loaded by ComfyUI is still installing.
  const installing = () => runtimes().some((e) => e.state === 'installing' || e.state === 'loading')

  function status() {
    const rec = record()
    const t = now()
    return {
      phase: phase(), stage: stage(), sandbox,
      pod: rec && {
        id: rec.id, gpu: rec.gpu, vramGb: rec.vramGb ?? null, cloudType: rec.cloudType, costPerHr: rec.costPerHr, volumeGb: rec.volumeGb,
        tier: rec.tier || null, fellBack: Boolean(rec.fellBack),
        startedAt: rec.startedAt, uptimeSec: Math.round((t - rec.startedAt) / 1000),
        pausedDiskPerDay: (rec.volumeGb * STOPPED_DISK_USD_GB_MONTH * 12) / 365, idleMin: rec.idleMin || IDLE_MIN,
      },
      spend: { today: spentToday(), cap: cap() },
      runs: m.leases.size, queue: m.status?.queue ?? null, downloads: downloads(), runtimes: runtimes(),
      safety: { selfTerminateReady: m.status?.selfTerminateReady === true, proofDeadline: m.status?.proofDeadline ?? null },
      // What is on the Pod's disk, for the Pods page. Known only while the Pod runs.
      models: m.status?.models || [], disk: m.status ? { freeGb: m.status.diskFreeGb ?? null, totalGb: m.status.diskTotalGb ?? null } : null,
      evicted: m.status?.evicted || [], preparing: Boolean(rec?.prepare),
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
    const busy = m.leases.size > 0 || (s?.queue ?? 0) > 0 || downloads().some((d) => d.state === 'queued' || d.state === 'downloading') || installing()
    if (s?.fatal) return `The Pod failed to start: ${s.fatal}`
    if (t - (m.seenAt || Math.max(rec.startedAt, m.since)) >= DARK) return 'Terminated: the Pod did not answer for 20 minutes.'
    // Only a Pod that never became ready: a ComfyUI restart later is not a failed boot.
    if (s && !s.ready && !s.everReady && age >= BOOT) return 'Terminated: the Pod was not ready after 25 minutes.'
    if (age >= LIFETIME + DRAIN || (age >= LIFETIME && !busy)) return 'Terminated at the 2-hour limit.'
    // Each Pod keeps the idle time it started with, which is also what its own watchdog uses.
    const idle = rec.idleMin || IDLE_MIN
    if (s?.ready && !busy && (s.idleSec || 0) >= idle * 60) return `Terminated after ${idle} idle minutes.`
    return null
  }

  async function tick() {
    await adopt().catch(() => null)
    const rec = await refresh().catch(() => record())
    if (!rec) return status()
    charge()
    await heartbeat(rec)
    await flushPrepare().catch(() => null)
    const reason = guard()
    if (reason) await end('terminate', reason)
    else if (m.ending && m.leases.size === 0 && !(m.status?.queue > 0)) await end(m.ending.then, m.ending.then === 'pause' ? 'Paused after the queue finished.' : 'Terminated after the queue finished.')
    return status()
  }

  // ---- actions -----------------------------------------------------------------------------------

  // Prices and stock for the GPUs that fit: the ladder, or with `catalog` every GPU a Session tier may
  // start. `arch` keeps only GPUs of that architecture, for a run with a file that needs it.
  async function quote({ minVramGb = 0, catalog = false, arch = null } = {}) {
    const rungs = (catalog ? all : ladder).filter((r) => r.vramGb >= minVramGb && (!arch || r.arch === arch))
    const base = { rungs: rungs.map((r) => ({ ...r, usdPerHr: null, inStock: null })), spend: { today: spentToday(), cap: cap() }, bootMinutes: [5, 8], connected: Boolean(key()) }
    if (!key() || !rungs.length) return base
    const tag = `${minVramGb}|${catalog}|${arch}`
    if (m.quote && now() - m.quote.at < 5 * MIN && m.quote.min === tag) return { ...m.quote.data, spend: base.spend }
    const q = rungs.map((r, i) => `r${i}: gpuTypes(input: {id: ${JSON.stringify(r.gpuTypeId)}}) { lowestPrice(input: {gpuCount: 1, secureCloud: ${r.cloudType === 'SECURE'}}) { uninterruptablePrice availableGpuCounts stockStatus } }`)
    const data = await gql(`query { ${q.join(' ')} }`).catch(() => null)
    if (!data) return base
    const out = { ...base, rungs: rungs.map((r, i) => {
      const lp = data[`r${i}`]?.[0]?.lowestPrice || {}
      const counts = Array.isArray(lp.availableGpuCounts) ? lp.availableGpuCounts.filter((n) => n > 0) : null
      return { ...r, usdPerHr: lp.uninterruptablePrice ?? null, inStock: counts ? counts.length > 0 : null }
    }) }
    m.quote = { at: now(), min: tag, data: out }
    return out
  }

  // `runtimes` start installing as soon as the Pod boots, for a run that waits on them. A `gpu` picked
  // by hand ({ gpuTypeId, cloudType } from the ladder) is the only one tried. A Session tier's `order`
  // lists the GPUs to try in its order instead of the ladder's. `prepare` ({ files, runtimes }) gets the
  // Pod ready for services before their first run, as soon as it answers.
  async function start({ minVramGb = 0, volumeGb = 60, runtimes: want = [], gpu = null, order = null, tier = null, prepare: ready = null, proof = null } = {}) {
    if (!key()) throw fail('Add your RunPod key in Connections first.', 400)
    if (proof && (!/^[a-f0-9-]{36}$/.test(proof.id) || !Number.isSafeInteger(proof.terminateAt) || proof.terminateAt <= now() || proof.terminateAt > now() + LIFETIME)) throw fail('Invalid proof safety settings.', 400)
    await adopt({ force: true }).catch(() => null)
    if (record() || m.placing) throw fail('A Pod already exists. ComfyField runs one Pod at a time.', 409)
    const spent = spentToday()
    if (spent >= cap()) throw fail(`Daily cap reached: ${money(spent)} of ${money(cap())} today. Raise it on the Pods page.`, 402)
    let rungs = ladder.filter((r) => r.vramGb >= minVramGb)
    if (order && !gpu) {
      const fits = all.filter((r) => r.vramGb >= minVramGb)
      const listed = order.map((o) => fits.find((r) => r.gpuTypeId === o.gpuTypeId && r.cloudType === o.cloudType)).filter(Boolean)
      rungs = [...new Set(listed)]
    }
    if (gpu) {
      const picked = ladder.find((r) => r.gpuTypeId === gpu.gpuTypeId && r.cloudType === gpu.cloudType)
      if (!picked) throw fail('ComfyField does not start that GPU. Pick one from the Pods page.', 400)
      if (picked.vramGb < minVramGb) throw fail(`${picked.name} has ${picked.vramGb} GB; this needs ${minVramGb} GB.`, 400)
      rungs = [picked]
    }
    if (!rungs.length) throw fail(`No GPU ComfyField starts has ${minVramGb} GB of memory.`, 400)
    for (const id of want) {
      const runtime = RUNTIMES[id]
      if (!runtime) throw fail('Unknown runtime.', 400)
      rungs = rungs.filter((r) => r.vramGb >= runtime.vramGb)
      if (!rungs.length) throw fail(`${runtime.name} needs a ${runtime.vramGb} GB GPU.`, 400)
    }
    const idleMin = proof ? 10 : idleMinutes(keys().idle)
    m.placing = true
    m.event = null
    const token = randomBytes(24).toString('hex')
    const name = proof ? `${PREFIX}live-${proof.id}` : `${PREFIX}${now().toString(36)}`
    // The newest video models are 40-44 GB each, so the volume holds at least two of them, and it
    // always has room for the runtimes the Pod installs.
    const volume = Math.max(MIN_VOLUME_GB, Math.ceil(Math.max(volumeGb, want.length ? volumeFor(want.map((id) => RUNTIMES[id])) : 0) / 10) * 10)
    try {
      let refused = 0
      for (const rung of rungs) {
        const r = await rest('/pods', { method: 'POST', timeoutMs: 60_000, body: {
          name, imageName: POD_IMAGE, gpuTypeIds: [rung.gpuTypeId], gpuCount: 1, cloudType: rung.cloudType,
          containerDiskInGb: 50, volumeInGb: volume, volumeMountPath: '/workspace',
          ports: [`${PROXY_PORT}/http`, `${STATUS_PORT}/http`], env: podEnv({ token, idleMin, runtimes: want, terminateAt: proof?.terminateAt }), dockerStartCmd: podStartCmd(),
        } })
        if (r.ok && r.data?.id) {
          const t = now()
          // `fellBack`: the tier's first GPU had no machine free, so the Pod runs on a later one.
          save({ id: r.data.id, name, token, gpuTypeId: rung.gpuTypeId, gpu: rung.name, vramGb: rung.vramGb, cloudType: rung.cloudType, arch: rung.arch || null, costPerHr: r.data.costPerHr || 0, volumeGb: volume, idleMin, createdAt: t, startedAt: t, pausedAt: null,
            tier: tier || null, fellBack: Boolean(order && refused > 0),
            ...(ready && (ready.files?.length || ready.runtimes?.length) ? { prepare: { files: ready.files || [], runtimes: ready.runtimes || [] } } : {}) })
          // The last Pod's status (ready, models, disk) says nothing about this one, and a lease that
          // trusted it would send a run to a Pod still booting.
          m.status = null
          m.remote = null
          m.seenAt = null
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
      if (gpu) throw fail(`RunPod has no free ${rungs[0].name} on ${rungs[0].cloudType === 'SECURE' ? 'Secure' : 'Community'} cloud right now. Pick another GPU or try again in a few minutes.`, 503, { code: 'no_capacity' })
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
    if (spent >= cap()) throw fail(`Daily cap reached: ${money(spent)} of ${money(cap())} today. Raise it on the Pods page.`, 402)
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

  // Files other runs on the Pod still need, which making room must not remove.
  const kept = (except) => [...new Set([...m.leases].filter((x) => x !== except).flatMap((x) => x.files).map((f) => `${f.dir}/${f.name}`))]
  const wire = (files) => files.map(({ repo, path: p, dir, name, sha256, gb, bytes }) => ({ repo, path: p, dir, name, ...(sha256 ? { sha256 } : {}),
    ...(Number.isInteger(bytes) ? { bytes } : gb ? { bytes: Math.round(gb * 1e9) } : {}) }))

  // RunPod's proxy can answer 404 or 502 for a few seconds after the Pod's status server opens its port.
  const unreachable = (r) => [0, 404, 502, 503].includes(r.status)
  async function askPod(url, init) {
    let r
    for (let i = 0; i < 10; i++) {
      r = await call(url, init)
      if (r.ok || !unreachable(r)) return r
      await wait(3000)
    }
    return r
  }

  // Asks the Pod for files and runtimes it lacks. A failed install starts again on this request.
  async function ask(rec, files, need, except) {
    const have = new Set((m.status?.models || []).map((f) => `${f.dir}/${f.name}`))
    const missing = files.filter((f) => !have.has(`${f.dir}/${f.name}`))
    const pending = need.filter((e) => m.status?.runtimes?.[e]?.state !== 'ready')
    if (missing.length) {
      const r = await askPod(`${statusUrl(rec.id)}/download`, { method: 'POST', token: rec.token, body: { files: wire(missing), keep: kept(except) } })
      if (!r.ok) throw fail(`The Pod refused the model download: ${errorText(r.data) || `HTTP ${r.status}`}`, 502)
      if (r.data?.downloads && m.status) m.status = { ...m.status, downloads: { ...m.status.downloads, ...r.data.downloads } }
    }
    for (const e of pending) {
      const r = await askPod(`${statusUrl(rec.id)}/runtime/${e}`, { method: 'POST', token: rec.token })
      if (!r.ok) throw fail(`The Pod could not start installing ${runtimeName(e)}: ${errorText(r.data) || `HTTP ${r.status}`}`, 502)
      if (r.data?.runtime && m.status) m.status = { ...m.status, runtimes: { ...m.status.runtimes, [e]: r.data.runtime } }
    }
    return { missing, pending }
  }

  function downloadError(f, d) {
    if (d.error !== 'disk full') return `Could not download ${f.name} to the Pod: ${d.error || 'unknown error'}`
    const more = d.shortGb ? ` It needs about ${Math.ceil(d.shortGb)} GB more.` : ''
    return `The Pod's disk is too small for this run.${more} Remove models on the Pods page, or start a Pod with a bigger disk.`
  }

  // Services the Pods page gets ready ahead of their first run. A Pod that has not answered yet keeps
  // the list on its record until it does, so a start can carry it.
  async function flushPrepare() {
    const rec = record()
    if (!rec?.prepare || rec.pausedAt || !m.status) return
    await ask(rec, rec.prepare.files || [], rec.prepare.runtimes || [], null)
    const cur = record()
    if (cur?.id === rec.id) save({ ...cur, prepare: null })
  }
  async function prepare({ files = [], runtimes: need = [] } = {}) {
    const rec = record()
    if (!rec || rec.pausedAt) throw fail('Start or resume a Pod first.', 409)
    for (const id of need) {
      if (!RUNTIMES[id]) throw fail('Unknown runtime.', 400)
      if ((rec.vramGb ?? Infinity) < RUNTIMES[id].vramGb) throw fail(`${RUNTIMES[id].name} needs a ${RUNTIMES[id].vramGb} GB GPU; this Pod has ${rec.vramGb} GB.`, 400)
    }
    const old = rec.prepare || { files: [], runtimes: [] }
    const byKey = new Map([...old.files, ...files].map((f) => [`${f.dir}/${f.name}`, f]))
    save({ ...rec, prepare: { files: [...byKey.values()], runtimes: [...new Set([...old.runtimes, ...need])] } })
    await flushPrepare()
    kick()
    return status()
  }

  // Removes one model file from the Pod's disk. A file a run is using stays.
  async function remove({ dir, name } = {}) {
    const rec = record()
    if (!rec || rec.pausedAt || !m.status) throw fail('The Pod is not running.', 409)
    if (kept(null).includes(`${dir}/${name}`)) throw fail(`A run is using ${name}.`, 409)
    // A pack's own files sit in subfolders: each part of the folder travels encoded on its own.
    const at = `${dir.split('/').map(encodeURIComponent).join('/')}/${encodeURIComponent(name)}`
    const r = await call(`${statusUrl(rec.id)}/models/${at}`, { method: 'DELETE', token: rec.token })
    if (!r.ok && r.status !== 404) throw fail(`The Pod could not remove ${name}: ${errorText(r.data) || `HTTP ${r.status}`}`, r.status === 409 ? 409 : 502)
    await refresh().catch(() => null)
    return status()
  }

  // A run holds a lease while it uses the Pod: it waits for a starting Pod, gets its missing model
  // files and runtimes, and keeps the Pod beaten. It never starts or resumes one. It asks for its files
  // as soon as the Pod's status server answers, so they download while ComfyUI is still coming up.
  async function lease({ files = [], runtimes: need = [], signal, onStage = () => {}, pollMs = 3000 } = {}) {
    const ctl = new AbortController()
    const l = { files, signal: ctl.signal, reason: null, end: (why) => { l.reason = why; ctl.abort(new Error(why)) } }
    const stop = () => l.end('Cancelled.')
    signal?.addEventListener('abort', stop)
    const check = () => { if (l.reason) throw fail(l.reason, 409) }
    const alive = (rec) => {
      if (!rec && !m.placing) throw fail(m.event && now() - m.event.at < 10 * MIN ? `${m.event.text} ${NO_POD}` : NO_POD, 409, { code: 'no_pod' })
      if (rec?.pausedAt) throw fail(NO_POD, 409, { code: 'paused' })
      if (m.ending) throw fail('The Pod is ending after its queue. Keep it from the Pod chip in the top bar.', 409, { code: 'ending' })
    }
    m.leases.add(l)
    heartbeat()
    const beat = setInterval(() => heartbeat(), 20_000)
    beat.unref?.()
    const release = () => { clearInterval(beat); m.leases.delete(l); signal?.removeEventListener('abort', stop) }
    try {
      for (;;) {
        check()
        await adopt().catch(() => null)
        const rec = m.placing ? null : await refresh().catch(() => record())
        alive(rec)
        if (rec && m.status) break
        onStage('waiting')
        await wait(pollMs)
      }
      const { missing, pending } = await ask(record(), files, need, l)
      for (;;) {
        check()
        const d = m.status?.downloads || {}
        const failed = missing.find((f) => d[`${f.dir}/${f.name}`]?.state === 'failed')
        if (failed) throw fail(downloadError(failed, d[`${failed.dir}/${failed.name}`]), 502)
        const en = m.status?.runtimes || {}
        const broke = pending.find((e) => en[e]?.state === 'failed')
        if (broke) throw fail(`${runtimeName(broke)} could not install on the Pod: ${en[broke].error || 'unknown error'}`, 502)
        const placed = missing.every((f) => d[`${f.dir}/${f.name}`]?.state === 'done') && pending.every((e) => en[e]?.state === 'ready')
        if (m.status?.ready && placed) break
        onStage(!m.status?.ready && placed ? 'waiting' : pending.some((e) => en[e]?.state !== 'ready') ? 'installing' : missing.length ? 'downloading' : 'waiting')
        await wait(pollMs)
        await refresh().catch(() => null)
        check()
        alive(record())
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
    m.owner = true
    const loop = async () => {
      m.ticking = true
      await tick().catch(() => null)
      m.ticking = false
      if (!m.timer) return
      const p = phase()
      const quick = p === 'starting' || p === 'ending' || downloads().some((d) => d.state !== 'done' && d.state !== 'failed') || installing()
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

  // The phase right now, read fresh, and the GPU memory, for routing a run in any process.
  async function phaseNow() {
    await adopt().catch(() => null)
    await refresh().catch(() => null)
    return phase()
  }
  const vramGb = () => record()?.vramGb ?? null
  // Older records have no architecture; every ladder GPU before the Session tiers was Blackwell.
  const arch = () => (record() ? record().arch || 'blackwell' : null)
  // What the Pod has room for: its free disk and its runtimes, for picking a run's graph.
  const room = () => ({ diskFreeGb: m.status?.diskFreeGb ?? null, runtimes: Object.fromEntries(runtimes().map((e) => [e.runtime, e.state])) })
  // Model files on the Pod, for the Pods page and for a run that picks its graph.
  const models = () => m.status?.models || []

  async function test() {
    if (!key()) return false
    return gql('query { myself { id } }').then((d) => Boolean(d?.myself?.id)).catch(() => false)
  }

  // Account-wide recovery must also find stopped Pods and Pods missing from pod.json.
  async function sweep({ dryRun = false, prefix = PREFIX } = {}) {
    if (!key()) throw fail('Add your RunPod key in Connections first.', 400)
    if (!prefix.startsWith(PREFIX)) throw fail('Sweep only targets ComfyField Pods.', 400)
    const r = await rest('/pods')
    if (!r.ok) throw restError(r, 'list Pods')
    const rows = Array.isArray(r.data) ? r.data : r.data?.data
    if (!Array.isArray(rows)) throw fail('RunPod returned an unreadable Pod list.', 502)
    const found = rows.filter((p) => p.name?.startsWith(prefix) && p.desiredStatus !== 'TERMINATED')
    const results = []
    for (const p of found) {
      let terminated = false
      if (!dryRun) {
        const end = await rest(`/pods/${encodeURIComponent(p.id)}`, { method: 'DELETE' })
        terminated = end.ok || end.status === 404
        if (terminated && record()?.id === p.id) clear('Terminated by the live-run sweep.')
      }
      results.push({ id: p.id, name: p.name, status: p.desiredStatus, terminated })
    }
    return results
  }

  return { status, quote, start, pause, resume, terminate, keep, lease, prepare, remove, tick, refresh, phaseNow, vramGb, arch, room, models, startMonitor, stopMonitor, test, guard, spentToday, sweep }
}
