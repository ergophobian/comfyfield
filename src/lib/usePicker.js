import { useEffect, useState } from 'react'
import { models as catalog } from './catalog.js'
import { mergeRouterModels } from '../../shared/routerModels.js'
import { useRouterCatalog } from './routerCatalog.js'

const KEY = 'comfyfield.picker'
const first = (kind) => catalog.find((m) => m.kind === kind && m.provider !== 'comfyRouter' && !m.workflow?.endsWith('_i2v')).id
const initial = { kind: 'image', chosen: { image: first('image'), video: first('video'), audio: first('audio') }, extra: [], favorites: [] }

function load() {
  try { return { ...initial, ...JSON.parse(localStorage.getItem(KEY)) } } catch { return initial }
}

// Which mode and model the composer is on, plus fal models added from the Models page.
export function usePicker(connections = {}) {
  const [state, setState] = useState(load)
  useEffect(() => { try { localStorage.setItem(KEY, JSON.stringify(state)) } catch {} }, [state])

  // With a Comfy key, the live Router catalog adds the prices it returns to the Router rows.
  const live = useRouterCatalog(connections.comfyRouter?.connected)
  const router = mergeRouterModels(catalog.filter((m) => m.provider === 'comfyRouter'), live?.models)
  const pinned = catalog.map((m) => (m.provider === 'comfyRouter' ? router.models.find((r) => r.id === m.id) : m))
  const all = [...pinned, ...state.extra.filter((x) => !pinned.some((p) => p.id === x.id))].filter((m) => m.provider !== 'comfyRouter' || connections.comfyRouter?.connected)
  const model = all.find((m) => m.id === state.chosen[state.kind]) || all.find((m) => m.kind === state.kind)

  return {
    kind: state.kind,
    all,
    router,
    routerCatalog: live,
    model,
    options: all.filter((m) => m.kind === state.kind),
    setKind: (kind) => setState((s) => ({ ...s, kind })),
    favorites: state.favorites,
    toggleFavorite: (id) => setState((s) => ({
      ...s, favorites: s.favorites.includes(id) ? s.favorites.filter((f) => f !== id) : [...s.favorites, id],
    })),
    choose: (id) => setState((s) => ({ ...s, chosen: { ...s.chosen, [s.kind]: id } })),
    // Switches the composer to a model already in the list, in its own mode.
    pick: (m) => setState((s) => ({ ...s, kind: m.kind, chosen: { ...s.chosen, [m.kind]: m.id } })),
    // Adds a fal catalog model and switches the composer to it.
    use: (m) => setState((s) => ({
      ...s,
      kind: m.kind,
      chosen: { ...s.chosen, [m.kind]: m.id },
      extra: [m, ...s.extra.filter((x) => x.id !== m.id)].slice(0, 20),
    })),
  }
}
