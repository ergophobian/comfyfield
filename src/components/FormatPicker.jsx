import { useEffect, useMemo, useRef, useState } from 'react'
import { IconChevron, IconClose } from './Icons.jsx'
import { formats, jobs, popularFirst } from '../lib/formats/index.js'

const SHOWN = 8
const calm = () => window.matchMedia?.('(prefers-reduced-motion: reduce)').matches

// The choice a format offers as its variants: its first choice input with more than one option.
export const variantInput = (format) => format?.inputs.find((i) => i.type === 'choice' && i.options?.length > 1 && !i.when) || null
export const variantLabel = (format, values) => {
  const input = variantInput(format)
  return input && input.options.find((o) => o.id === values?.[input.id])?.label
}

// Formats a composer can run for one medium, grouped by job, featured first.
export function useFormatsFor(kind) {
  return useMemo(() => {
    const list = formats.filter((f) => f.kind === kind)
    const byJob = jobs.map((j) => ({ ...j, list: popularFirst(list.filter((f) => f.job === j.id)) })).filter((j) => j.list.length)
    return { list, byJob }
  }, [kind])
}

// Job, then format, then variant, in one panel above the composer. Focus stays in the search box:
// typing searches every format, arrows move, Enter or Right goes in, Left or Escape goes back.
export default function FormatPicker({ kind, current, values, onPick, onClear, up = true }) {
  const { list, byJob } = useFormatsFor(kind)
  const [open, setOpen] = useState(false)
  const [path, setPath] = useState([])
  const [query, setQuery] = useState('')
  const [active, setActive] = useState(0)
  const [all, setAll] = useState(false)
  const [dir, setDir] = useState('in')
  const ref = useRef(null)
  const search = useRef(null)
  const listRef = useRef(null)

  const [jobId, formatId] = path
  const job = byJob.find((j) => j.id === jobId)
  const format = formatId && list.find((f) => f.id === formatId)
  const q = query.trim().toLowerCase()

  // The rows of the current level. Each row: { key, label, note, count, on, go }.
  let level = 'job'
  let rows
  if (format) {
    level = 'variant'
    const input = variantInput(format)
    const picked = current?.id === format.id ? values?.[input.id] : null
    rows = input.options.map((o) => ({ key: o.id, label: o.label, note: o.note, on: o.id === (picked ?? input.default ?? input.options[0].id), go: () => finish(format, { [input.id]: o.id }) }))
  } else if (q) {
    level = 'search'
    rows = list.filter((f) => `${f.name} ${f.blurb || ''} ${f.runsOn || ''}`.toLowerCase().includes(q)).slice(0, 40)
      .map((f) => formatRow(f, byJob.find((j) => j.id === f.job)?.name))
  } else if (job) {
    level = 'format'
    const shown = all ? job.list : job.list.slice(0, SHOWN)
    rows = shown.map((f) => formatRow(f))
    if (!all && job.list.length > SHOWN) rows.push({ key: 'see-all', label: `See all ${job.list.length}`, more: true, go: () => { setAll(true); setActive(SHOWN) } })
  } else {
    rows = byJob.map((j) => ({ key: j.id, label: j.name, note: j.blurb, count: j.list.length, deeper: true, on: current?.job === j.id, go: () => into([j.id]) }))
  }

  function formatRow(f, note) {
    const deeper = Boolean(variantInput(f))
    return { key: f.id, label: f.name, note: note || f.blurb, on: current?.id === f.id, deeper, go: () => (deeper ? into([f.job, f.id]) : finish(f, {})) }
  }
  function into(next) { setDir('in'); setPath(next); setActive(0); setAll(false); setQuery('') }
  function back() {
    if (q) { setQuery(''); setActive(0); return }
    if (!path.length) { close(); return }
    setDir('back')
    const up1 = path.slice(0, -1)
    setPath(up1)
    // Land on the row we came from, opening See all when it sits below the first rows.
    const from = path.at(-1)
    const rowsUp = up1.length ? byJob.find((j) => j.id === up1[0])?.list : byJob
    const at = Math.max(0, rowsUp?.findIndex((r) => r.id === from) ?? 0)
    setAll(up1.length > 0 && at >= SHOWN)
    setActive(at)
  }
  function finish(f, picked) { onPick(f, picked); close() }
  function close() { setOpen(false); setPath([]); setQuery(''); setActive(0); setAll(false) }
  function show() {
    // Open on the current format's level, so a second pick starts where the first ended.
    setDir('in')
    setPath(current ? [current.job] : [])
    setActive(0)
    setOpen(true)
  }

  useEffect(() => {
    if (!open) return
    search.current?.focus()
    const away = (e) => !ref.current?.contains(e.target) && close()
    document.addEventListener('pointerdown', away)
    return () => document.removeEventListener('pointerdown', away)
  }, [open])
  useEffect(() => {
    const row = listRef.current?.querySelector(`[data-i="${active}"]`)
    row?.scrollIntoView({ block: 'nearest', behavior: calm() ? 'auto' : 'smooth' })
  }, [active, open])

  const keys = (e) => {
    const n = rows.length
    if (e.key === 'ArrowDown') { e.preventDefault(); setActive((a) => (a + 1) % Math.max(1, n)) }
    else if (e.key === 'ArrowUp') { e.preventDefault(); setActive((a) => (a - 1 + n) % Math.max(1, n)) }
    else if (e.key === 'Home') { e.preventDefault(); setActive(0) }
    else if (e.key === 'End') { e.preventDefault(); setActive(n - 1) }
    else if (e.key === 'Enter' || (e.key === 'ArrowRight' && rows[active]?.deeper && !query)) { e.preventDefault(); rows[active]?.go() }
    else if (e.key === 'Escape') { e.preventDefault(); e.stopPropagation(); back() }
    else if ((e.key === 'ArrowLeft' || e.key === 'Backspace') && !query && path.length) { e.preventDefault(); back() }
  }

  const crumbs = [{ label: 'Jobs', to: [] }, job && { label: job.name, to: [job.id] }, format && { label: format.name, to: path }].filter(Boolean)
  const label = current ? [current.name, variantLabel(current, values)].filter(Boolean).join(' · ') : 'Format'
  const title = { job: 'Pick a job', format: job?.name, variant: format && variantInput(format).label, search: `${rows.length} ${rows.length === 1 ? 'format' : 'formats'}` }[level]
  const listId = `fpk-${kind}`

  return (
    <div className={`chip fpk${up ? ' up' : ''}`} ref={ref}>
      <button type="button" className={current ? 'lit' : ''} aria-haspopup="dialog" aria-expanded={open} onClick={() => (open ? close() : show())}>
        <span className="fpk-label">{label}</span><IconChevron dir={open ? 'left' : 'right'} />
      </button>
      {current && <button type="button" className="fpk-clear" aria-label={`Remove ${current.name}`} onClick={onClear}><IconClose /></button>}
      {open && (
        <div className="fpk-pop glass pop" role="dialog" aria-label="Choose a format">
          <label className="picker-search">
            <input ref={search} value={query} onChange={(e) => { setQuery(e.target.value); setActive(0) }} onKeyDown={keys}
              placeholder={`Search ${list.length} ${kind} formats`} aria-label="Search formats" role="combobox"
              aria-expanded="true" aria-controls={listId} aria-activedescendant={rows[active] ? `${listId}-${active}` : undefined} />
          </label>
          {!q && (
            <nav className="fpk-crumbs" aria-label="Picker levels">
              {crumbs.map((c, i) => (i < crumbs.length - 1
                ? <button key={c.label} type="button" onClick={() => { setDir('back'); setPath(c.to); setActive(0); setAll(false); search.current?.focus() }}>{c.label}</button>
                : <span key={c.label} aria-current="step">{c.label}</span>))}
            </nav>
          )}
          <div className={`fpk-level ${dir}`} key={`${level}-${path.join('/')}-${q ? 'q' : ''}`}>
            <p className="picker-head">{title}</p>
            <div className="fpk-list" role="listbox" id={listId} aria-label={title} ref={listRef}>
              {rows.map((r, i) => (
                <div key={r.key} id={`${listId}-${i}`} data-i={i} role="option" aria-selected={i === active}
                  className={`fpk-row${i === active ? ' active' : ''}${r.on ? ' on' : ''}${r.more ? ' more' : ''}`} style={{ '--i': Math.min(i, 12) }}
                  onPointerMove={() => setActive(i)} onClick={() => { r.go(); search.current?.focus() }}>
                  <span className="fpk-text">
                    <span className="picker-name">{r.label}{r.count != null && <em className="lib-count">{r.count}</em>}</span>
                    {r.note && <span className="picker-sub">{r.note}</span>}
                  </span>
                  {r.deeper && <IconChevron />}
                </div>
              ))}
              {!rows.length && <p className="picker-empty">No formats match. Try another word.</p>}
            </div>
          </div>
          <p className="fpk-keys" aria-hidden="true">Arrows to move · Enter to pick · Esc to go back</p>
        </div>
      )}
    </div>
  )
}
