import { ArtImage } from '../components/Art.jsx'
import { hubArt, categoryArt } from '../lib/formats/art.js'
import { useEffect, useMemo, useRef, useState } from 'react'
import { useSearchParams } from 'react-router-dom'
import Segmented from '../components/Segmented.jsx'
import { AppGrid } from '../components/apps/AppCard.jsx'
import { appGroups, matches } from '../components/apps/data.js'
import { IconChevron, IconClose, IconSearch } from '../components/Icons.jsx'
import { importFormat, useUserFormats } from '../lib/userFormats.js'

// One row of cards per hub under All, the whole hub under its own tab.
const PREVIEW = 5

export default function Apps() {
  const { list: yours } = useUserFormats()
  const groups = useMemo(appGroups, [yours])
  const [params, setParams] = useSearchParams()
  const [query, setQuery] = useState('')
  const bar = useRef(null)
  const hub = groups.some((g) => g.id === params.get('hub')) ? params.get('hub') : 'all'
  const q = query.trim().toLowerCase()
  const total = new Set(groups.flatMap((g) => g.list.map((f) => f.id))).size

  // A See all link sits low on the page, so bring the tabs back into view and show the picked one.
  useEffect(() => {
    bar.current?.querySelector('[aria-selected=true]')?.scrollIntoView({ block: 'nearest', inline: 'nearest' })
  }, [hub])

  const pick = (id) => setParams(id === 'all' ? {} : { hub: id })

  // Import a format: a file the user picks or a gist link. It lands in Yours.
  const [importing, setImporting] = useState(null)
  const file = useRef(null)
  const bring = async (input) => {
    setImporting((v) => ({ ...v, busy: true, error: '' }))
    try {
      const f = await importFormat(input)
      setImporting({ done: `${f.name} is in Yours.`, link: '' })
      pick('yours')
    } catch (e) { setImporting((v) => ({ ...v, busy: false, error: e.message })) }
  }
  const tabs = [
    { value: 'all', label: <>All<em>{total}</em></> },
    ...groups.map((g) => ({ value: g.id, label: <>{g.name}<em>{g.list.length}</em></> })),
  ]
  // A hub with groups shows one section per group under its own tab.
  const sections = (g) => hub === g.id && g.groups
    ? g.groups.map((p) => ({ ...g, ...p, key: `${g.id}:${p.name}`, part: true, found: g.found.filter((f) => f.group === p.name) })).filter((p) => p.found.length)
    : [{ ...g, key: g.id }]
  const shown = (hub === 'all' ? groups : groups.filter((g) => g.id === hub))
    .map((g) => ({ ...g, found: g.list.filter((f) => matches(f, q)) }))
    .filter((g) => g.found.length)

  return (
    <main className="page apps-page">
      <div className="page-head rise">
        <h1>Apps</h1>
        <p>One-click tools for photos and clips. Upload, pick a preset and generate.</p>
      </div>
      <div className="apps-bar rise" ref={bar}>
        <label className="apps-search">
          <IconSearch />
          <input type="search" value={query} onChange={(e) => setQuery(e.target.value)} placeholder="Search apps" aria-label="Search apps" />
          {query && <button type="button" className="apps-clear" onClick={() => setQuery('')} aria-label="Clear search"><IconClose /></button>}
        </label>
        <div className="apps-tabs"><Segmented options={tabs} value={hub} onChange={pick} /></div>
        <button type="button" className="btn-soft apps-import-btn" aria-expanded={Boolean(importing)} onClick={() => setImporting((v) => (v ? null : { link: '' }))}>Import a format</button>
      </div>
      {importing && (
        <form className="apps-import glass pop" onSubmit={(e) => { e.preventDefault(); bring({ gist: importing.link }) }}>
          <label htmlFor="format-gist">Import a format from a gist or a .comfyfield-format.json file. It shows in Yours.</label>
          <div className="apps-import-row">
            <input id="format-gist" className="fp-text" value={importing.link || ''} placeholder="https://gist.github.com/…" onChange={(e) => setImporting({ link: e.target.value })} />
            <button type="submit" className="btn-blue sm" disabled={importing.busy || !importing.link?.trim()}>{importing.busy ? 'Importing' : 'Import'}</button>
            <button type="button" className="btn-soft sm" disabled={importing.busy} onClick={() => file.current.click()}>Pick a file</button>
            <button type="button" className="btn-soft sm" onClick={() => setImporting(null)}>Close</button>
          </div>
          <input ref={file} type="file" accept=".json,application/json" hidden onChange={async (e) => { const f = e.target.files[0]; e.target.value = ''; if (f) bring({ text: await f.text(), name: f.name }) }} />
          {importing.error && <p className="sheet-error" role="alert">{importing.error}</p>}
          {importing.done && <p className="sheet-note" role="status">{importing.done}</p>}
        </form>
      )}

      {shown.flatMap(sections).map((g, gi) => {
        const cut = hub === 'all' && !q && g.found.length > PREVIEW
        return (
          <section key={g.key} className="apps-sec rise" style={{ '--d': `calc(${Math.min(gi + 2, 12)} * var(--stagger))` }}>
            <div className="apps-sec-head">
              {g.id !== 'yours' && !g.part && <span className="hub-art"><ArtImage id={g.id} src={hubArt(g.id) || categoryArt(g.id)} alt={`${g.name} examples`} /></span>}
              <div>
                <h2>{g.name}</h2>
                <p>{g.blurb}</p>
              </div>
              {cut && <button type="button" className="link-btn" onClick={() => pick(g.id)}>See all {g.found.length}<IconChevron /></button>}
            </div>
            <AppGrid list={cut ? g.found.slice(0, PREVIEW) : g.found} />
          </section>
        )
      })}

      {!shown.length && (
        <div className="empty glass rise">
          {q ? <>No apps match “{query.trim()}”.</> : 'No apps here yet.'}
          <div>
            {q ? <button type="button" className="btn-soft" onClick={() => setQuery('')}>Clear search</button>
              : <button type="button" className="btn-soft" onClick={() => pick('all')}>Show all apps</button>}
          </div>
        </div>
      )}
    </main>
  )
}
