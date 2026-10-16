import { useEffect, useState } from 'react'
import { useSearchParams } from 'react-router-dom'
import { useApp } from '../../lib/appContext.js'
import { modelsFor } from '../../lib/tools.js'
import { durationsFor } from '../../lib/providers.js'
import { brandOf, brands } from '../../lib/brands.jsx'

const slug = (s) => s.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '')

// Open-weight models carry no provider yet. They render like catalog models but never run.
export const asOpen = (m) => {
  const b = brandOf({ id: m.id, model: m.vendor })
  return { ...m, open: true, note: m.blurb, brand: brands[b] ? b : 'comfy' }
}

// The model a generator page runs: the shared picker's choice for this kind, or an open-weight model held in ?model=.
export function useGenModel(kind) {
  const { picker } = useApp()
  const [params, setParams] = useSearchParams()
  const open = modelsFor(kind).map(asOpen)
  const wanted = params.get('model')
  const openPick = open.find((m) => m.id === wanted)

  useEffect(() => { if (picker.kind !== kind) picker.setKind(kind) }, [kind, picker.kind])

  // A catalog id in the URL is applied once and dropped, so the next pick in the menu is not overridden.
  useEffect(() => {
    if (!wanted || openPick) return
    const hit = picker.all.find((m) => m.kind === kind && (m.id === wanted || slug(m.name) === wanted))
    if (hit) { picker.setKind(kind); picker.choose(hit.id) }
    const next = new URLSearchParams(params)
    next.delete('model')
    setParams(next, { replace: true })
  }, [wanted])

  const base = (picker.kind === kind && picker.model) || picker.all.find((m) => m.kind === kind)
  const model = openPick || base

  const choose = (id) => {
    const next = new URLSearchParams(params)
    if (open.some((m) => m.id === id)) next.set('model', id)
    else {
      next.delete('model')
      picker.setKind(kind)
      picker.choose(id)
    }
    setParams(next, { replace: true })
  }

  return {
    model,
    open,
    options: picker.all.filter((m) => m.kind === kind),
    choose,
    favorites: picker.favorites,
    toggleFavorite: picker.toggleFavorite,
  }
}

// Durations in seconds the model takes. Open models show a plausible pair until their workflow is wired.
export function useDurations(model) {
  const [list, setList] = useState([])
  useEffect(() => {
    let live = true
    if (model.open) { setList([5, 10]); return }
    durationsFor(model).then((ds) => live && setList(ds)).catch(() => live && setList([]))
    return () => { live = false }
  }, [model.id])
  return list
}
