import { useEffect, useRef, useState } from 'react'
import { run, writePrompt } from './providers.js'
import { runFormat } from './formats/runner.js'
import { waitJob, cancelJob, Cancelled } from './jobs.js'

const KEY = 'comfyfield.library'
const MAX_PARALLEL = 3

// A pending item that already has server jobs survives a reload: the page waits on those jobs again.
// One with no job yet never reached a provider, so it is dropped.
function load() {
  try { return (JSON.parse(localStorage.getItem(KEY)) || []).filter((i) => !i.pending || i.jobs?.length) } catch { return [] }
}

// Generations, newest first. Jobs queue up and run three at a time; finished items persist for the Library.
export function useGenerations() {
  const [items, setItems] = useState(load)
  const [error, setError] = useState(null)
  const [retryLast, setRetryLast] = useState(null)
  const active = useRef(0)
  const waiting = useRef([])
  const cancelled = useRef(new Set())
  const live = useRef(items)
  live.current = items
  const busy = items.some((i) => i.pending)

  const add = (files) => setItems((xs) => [...files.filter((file) => !xs.some((item) => item.id === file.id)), ...xs])
  const patch = (id, fn) => setItems((xs) => xs.map((x) => (x.id === id ? fn(x) : x)))
  useEffect(() => {
    fetch('/api/stitch/exports').then((res) => res.ok ? res.json() : []).then(add).catch(() => {})
  }, [])

  useEffect(() => {
    try { localStorage.setItem(KEY, JSON.stringify(items.filter((i) => !i.pending || i.jobs?.length).slice(0, 300))) } catch {}
  }, [items])

  const pump = () => {
    while (active.current < MAX_PARALLEL && waiting.current.length) {
      const job = waiting.current.shift()
      active.current++
      job().finally(() => { active.current--; pump() })
    }
  }

  const finish = (id, base, files) => setItems((xs) => xs.flatMap((x) => (x.id === id
    ? files.map((f, i) => ({ id: `${id}-${i}`, ...base, ...f, created: Date.now() }))
    : [x])))

  // A failed run keeps what it ran with, so Retry works after a reload too.
  const fail = (id, base, message) => {
    const retry = base.run ? () => { setItems((xs) => xs.filter((x) => x.id !== id)); generate(base.run.model, base.run.opts, base.run.meta) } : undefined
    setError(message)
    setRetryLast(() => retry)
    setItems((xs) => xs.map((x) => (x.id === id ? { ...base, id, failed: message, retry } : x)))
  }

  // After a reload: wait on the saved jobs again, and give failed runs their Retry back.
  useEffect(() => {
    for (const it of live.current) {
      if (it.failed && it.run && !it.retry) fail(it.id, (({ id, failed, ...rest }) => rest)(it), it.failed)
      if (!it.pending || !it.jobs?.length) continue
      const { id, pending, jobs, started, pod, ...base } = it
      Promise.all(jobs.map(waitJob)).then(
        (files) => finish(id, base, files.flat()),
        (e) => (e instanceof Cancelled ? setItems((xs) => xs.filter((x) => x.id !== id)) : fail(id, base, e.message)),
      )
    }
    setError(null)
  }, [])

  // meta can carry batch, row and prompt so the board can group results. `after` gets the files of a
  // run that worked, so a follow-up such as Upscale also follows a retried take.
  function execute(model, opts, meta = {}, after) {
    const id = crypto.randomUUID()
    const base = { aspect: opts.shape || opts.aspect, caption: opts.caption, model: model.name, kind: model.kind, provider: model.provider, ...meta, run: { model, opts, meta } }
    setError(null)
    setRetryLast(null)
    setItems((xs) => [{ id, pending: true, ...base }, ...xs])
    return new Promise((resolve, reject) => {
      waiting.current.push(async () => {
        if (cancelled.current.has(id)) return reject(new Cancelled())
        patch(id, (x) => ({ ...x, started: true }))
        try {
          const files = await run(model, opts, {
            onPod: () => patch(id, (x) => ({ ...x, pod: true })),
            onJob: (job) => {
              patch(id, (x) => ({ ...x, jobs: [...(x.jobs || []), job] }))
              if (cancelled.current.has(id)) cancelJob(job)
            },
          })
          if (cancelled.current.has(id)) throw new Cancelled()
          finish(id, base, files)
          resolve(files)
          after?.(files)
        } catch (e) {
          if (e instanceof Cancelled || cancelled.current.has(id)) return reject(new Cancelled())
          fail(id, base, e.message)
          reject(e)
        }
      })
      pump()
    })
  }

  const generate = (model, opts, meta, after) => { execute(model, opts, meta, after).catch(() => {}) }
  const generateFormat = (format, values) => runFormat(format, values, { run: execute, writePrompt: ({ instructions, note, images, target }) => writePrompt({ instructions, note, images, target }) })

  // Stops waiting on a run and asks the server to drop its jobs. A provider may still finish a run it already started.
  const cancel = (id) => {
    cancelled.current.add(id)
    for (const job of live.current.find((x) => x.id === id)?.jobs || []) cancelJob(job)
    setItems((xs) => xs.filter((x) => x.id !== id))
  }

  const toggleApprove = (id) => setItems((xs) => xs.map((x) => (x.id === id ? { ...x, approved: !x.approved } : x)))
  const dismiss = (id) => {
    const item = items.find((item) => item.id === id)
    if (item?.model === 'Stitch') fetch('/api/stitch/export', { method: 'DELETE', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ url: item.url }) }).catch(() => {})
    setItems((xs) => xs.filter((x) => x.id !== id))
  }

  return { items, error, retry: retryLast, busy, generate, generateFormat, add, cancel, toggleApprove, dismiss, clear: () => setItems([]) }
}
