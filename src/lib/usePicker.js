import { useEffect, useState } from 'react'
import { models as pinned } from './catalog.js'

const KEY = 'comfyfield.picker'
const first = (kind) => pinned.find((m) => m.kind === kind).id
const initial = { kind: 'image', chosen: { image: first('image'), video: first('video'), audio: first('audio') }, extra: [], favorites: [] }

function load() {
  try { return { ...initial, ...JSON.parse(localStorage.getItem(KEY)) } } catch { return initial }
}

// Which mode and model the composer is on, plus fal models added from the Models page.
export function usePicker() {
  const [state, setState] = useState(load)
  useEffect(() => { try { localStorage.setItem(KEY, JSON.stringify(state)) } catch {} }, [state])

  const all = [...pinned, ...state.extra.filter((x) => !pinned.some((p) => p.id === x.id))]
  const model = all.find((m) => m.id === state.chosen[state.kind]) || all.find((m) => m.kind === state.kind)

  return {
    kind: state.kind,
    model,
    options: all.filter((m) => m.kind === state.kind),
    setKind: (kind) => setState((s) => ({ ...s, kind })),
    favorites: state.favorites,
    toggleFavorite: (id) => setState((s) => ({
      ...s, favorites: s.favorites.includes(id) ? s.favorites.filter((f) => f !== id) : [...s.favorites, id],
    })),
    choose: (id) => setState((s) => ({ ...s, chosen: { ...s.chosen, [s.kind]: id } })),
    // Adds a fal catalog model and switches the composer to it.
    use: (m) => setState((s) => ({
      ...s,
      kind: m.kind,
      chosen: { ...s.chosen, [m.kind]: m.id },
      extra: [m, ...s.extra.filter((x) => x.id !== m.id)].slice(0, 20),
    })),
  }
}
