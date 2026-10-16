import { useEffect, useRef, useState } from 'react'
import { useLibrary } from '../../lib/useLibrary.js'
import { paletteFrom } from '../../lib/palette.js'
import { IconPlus, IconClose, IconLink, IconTrash } from '../Icons.jsx'

const kinds = {
  characters: {
    one: 'character', add: 'Add a character', max: 6,
    empty: 'Save a face once, then reuse it in any prompt.',
    blank: { name: '', notes: '', images: [] },
  },
  products: {
    one: 'product', add: 'Add a product', max: 8,
    empty: 'Save a product with its photos, or import it from a link.',
    blank: { name: '', description: '', price: '', url: '', images: [] },
  },
  brands: {
    one: 'brand kit', add: 'Add a brand kit', max: 1,
    empty: 'Keep a logo, colors and voice together for every ad.',
    blank: { name: '', logo: '', colors: [], voice: '', url: '' },
  },
}

function Pictures({ value, onChange, max, upload, label }) {
  const input = useRef(null)
  const [busy, setBusy] = useState(false)
  const [err, setErr] = useState('')
  const add = async (files) => {
    setBusy(true); setErr('')
    try {
      const urls = []
      for (const f of [...files].slice(0, max - value.length)) urls.push(await upload(f))
      onChange([...value, ...urls])
    } catch (e) { setErr(e.message) }
    setBusy(false)
  }
  return (
    <div className="field">
      <label>{label}</label>
      <div className="pics">
        {value.map((u) => (
          <div className="pic" key={u}>
            <img src={u} alt="" />
            <button type="button" aria-label="Remove image" onClick={() => onChange(value.filter((x) => x !== u))}><IconClose /></button>
          </div>
        ))}
        {value.length < max && (
          <button type="button" className="pic add" disabled={busy} onClick={() => input.current.click()}>
            {busy ? <span className="muted">Saving</span> : <><IconPlus /><span>Upload</span></>}
          </button>
        )}
      </div>
      <input ref={input} type="file" accept="image/*" multiple={max > 1} hidden onChange={(e) => { add(e.target.files); e.target.value = '' }} />
      {err && <p className="plist-note">{err}</p>}
    </div>
  )
}

function Text({ label, value, onChange, area, placeholder }) {
  return (
    <div className="field">
      <label>{label}</label>
      {area ? <textarea rows={3} value={value} placeholder={placeholder} onChange={(e) => onChange(e.target.value)} />
        : <input value={value} placeholder={placeholder} onChange={(e) => onChange(e.target.value)} />}
    </div>
  )
}

function Colors({ value, onChange }) {
  return (
    <div className="field">
      <label>Colors</label>
      <div className="swatches">
        {value.map((c, i) => (
          <span className="swatch" key={i}>
            <input type="color" value={c.length === 7 ? c : '#2f3fe8'} aria-label={`Color ${i + 1}`} onChange={(e) => onChange(value.map((x, j) => (j === i ? e.target.value : x)))} />
            <button type="button" aria-label="Remove color" onClick={() => onChange(value.filter((_, j) => j !== i))}><IconClose /></button>
          </span>
        ))}
        {value.length < 8 && <button type="button" className="swatch add" aria-label="Add color" onClick={() => onChange([...value, '#2f3fe8'])}><IconPlus /></button>}
      </div>
    </div>
  )
}

function Editor({ type, item, onClose }) {
  const lib = useLibrary()
  const k = kinds[type]
  const [f, setF] = useState(item || k.blank)
  const [link, setLink] = useState('')
  const [busy, setBusy] = useState(false)
  const [err, setErr] = useState('')
  const set = (patch) => setF((x) => ({ ...x, ...patch }))
  useEffect(() => {
    const key = (e) => e.key === 'Escape' && onClose()
    window.addEventListener('keydown', key)
    return () => window.removeEventListener('keydown', key)
  }, [])

  const pull = async () => {
    if (!link.trim()) return
    setBusy(true); setErr('')
    try {
      const raw = /^https?:\/\//i.test(link.trim()) ? link.trim() : `https://${link.trim()}`
      const p = await lib.importUrl(raw)
      if (type === 'products') {
        set({ name: p.title || f.name, description: p.description || f.description, price: p.price || f.price, url: p.url, images: [...new Set([...f.images, ...p.images])].slice(0, k.max) })
      } else {
        const logo = p.logo || p.images[0] || f.logo
        let colors = p.themeColor ? [p.themeColor] : []
        if (logo) colors = [...new Set([...colors, ...(await paletteFrom(logo).catch(() => []))])].slice(0, 5)
        set({ name: p.siteName || p.host || f.name, logo, colors: colors.length ? colors : f.colors, voice: f.voice || p.description, url: p.url })
      }
    } catch (e) { setErr(e.message) }
    setBusy(false)
  }

  const save = async (e) => {
    e.preventDefault()
    if (!f.name.trim()) return setErr('Give it a name first.')
    setBusy(true); setErr('')
    try {
      const { id, created, ...data } = f
      await (item ? lib.update(type, item.id, data) : lib.create(type, data))
      onClose()
    } catch (e2) { setErr(e2.message); setBusy(false) }
  }

  return (
    <div className="viewer" onClick={onClose} role="dialog" aria-label={k.add}>
      <form className="form-sheet glass pop" onClick={(e) => e.stopPropagation()} onSubmit={save}>
        <h3>{item ? `Edit ${k.one}` : k.add}</h3>
        {type !== 'characters' && (
          <div className="import">
            <IconLink />
            <input value={link} placeholder="Paste a link to fill this in" onChange={(e) => setLink(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && (e.preventDefault(), pull())} />
            <button type="button" className="btn-soft sm" disabled={busy || !link.trim()} onClick={pull}>{busy ? 'Reading' : 'Import'}</button>
          </div>
        )}
        <Text label="Name" value={f.name} onChange={(v) => set({ name: v })} placeholder={type === 'characters' ? 'Mara, the barista' : type === 'products' ? 'Cold brew kit' : 'Northwind'} />
        {type === 'characters' && <>
          <Pictures label="Reference images, up to 6" max={6} value={f.images} onChange={(v) => set({ images: v })} upload={lib.upload} />
          <Text label="Notes" area value={f.notes} onChange={(v) => set({ notes: v })} placeholder="Age, outfit, anything the images do not show" />
        </>}
        {type === 'products' && <>
          <div className="row2">
            <Text label="Price" value={f.price} onChange={(v) => set({ price: v })} placeholder="$29" />
            <Text label="Link" value={f.url} onChange={(v) => set({ url: v })} placeholder="https://" />
          </div>
          <Text label="Description" area value={f.description} onChange={(v) => set({ description: v })} />
          <Pictures label="Images, up to 8" max={8} value={f.images} onChange={(v) => set({ images: v })} upload={lib.upload} />
        </>}
        {type === 'brands' && <>
          <Pictures label="Logo" max={1} value={f.logo ? [f.logo] : []} onChange={(v) => set({ logo: v[0] || '' })} upload={lib.upload} />
          <Colors value={f.colors} onChange={(v) => set({ colors: v })} />
          <Text label="Voice notes" area value={f.voice} onChange={(v) => set({ voice: v })} placeholder="Warm, plain words, never salesy" />
        </>}
        {err && <p className="plist-note">{err}</p>}
        <div className="form-sheet-foot">
          {item && <button type="button" className="btn-soft danger" onClick={async () => { await lib.remove(type, item.id); onClose() }}><IconTrash />Delete</button>}
          <span className="grow" />
          <button type="button" className="btn-soft" onClick={onClose}>Cancel</button>
          <button className="btn-blue sm" disabled={busy}>Save</button>
        </div>
      </form>
    </div>
  )
}

function Card({ type, item, n, onOpen }) {
  const cover = type === 'brands' ? item.logo : item.images?.[0]
  return (
    <button className="asset glass" style={{ '--i': Math.min(n, 12) }} onClick={onOpen}>
      <div className={`asset-cover${type === 'brands' ? ' logo' : ''}`}>
        {cover ? <img src={cover} alt="" /> : <span>{item.name?.[0]}</span>}
        {type === 'characters' && item.images?.length > 1 && <i>{item.images.length}</i>}
      </div>
      <strong>{item.name}</strong>
      {type === 'products' && <span className="muted">{item.price || 'No price'}</span>}
      {type === 'characters' && <span className="muted">{item.images?.length || 0} {item.images?.length === 1 ? 'image' : 'images'}</span>}
      {type === 'brands' && (
        <span className="dots">{(item.colors || []).slice(0, 5).map((c, i) => <b key={i} style={{ background: c }} />)}{!item.colors?.length && <em className="muted">No colors</em>}</span>
      )}
    </button>
  )
}

export default function Assets({ type }) {
  const lib = useLibrary()
  const [editing, setEditing] = useState(null)
  const list = lib[type]
  const k = kinds[type]
  if (!lib.ready) return null
  return (
    <>
      {list.length === 0 ? (
        <div className="empty glass">
          <p>{k.empty}</p>
          <button className="btn-blue" onClick={() => setEditing('new')}>{k.add}</button>
        </div>
      ) : (
        <>
          <div className="lib-filters"><button className="btn-blue sm" onClick={() => setEditing('new')}><IconPlus />{k.add}</button></div>
          <div className="asset-grid">
            {list.map((it, n) => <Card key={it.id} type={type} item={it} n={n} onOpen={() => setEditing(it)} />)}
          </div>
        </>
      )}
      {editing && <Editor type={type} item={editing === 'new' ? null : editing} onClose={() => setEditing(null)} />}
    </>
  )
}
