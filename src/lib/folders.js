import { useEffect, useState } from 'react'

const KEY = 'comfyfield.folders'
const empty = { folders: [], of: {} }

function load() {
  try {
    const v = JSON.parse(localStorage.getItem(KEY))
    return v && Array.isArray(v.folders) ? { folders: v.folders, of: v.of || {} } : empty
  } catch { return empty }
}

// Library folders, kept apart from the generations store. `of` maps an item id to its folder id.
export function useFolders() {
  const [state, setState] = useState(load)

  useEffect(() => {
    try { localStorage.setItem(KEY, JSON.stringify(state)) } catch {}
  }, [state])

  const create = (name) => {
    const id = `f-${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 6)}`
    setState((s) => ({ ...s, folders: [...s.folders, { id, name }] }))
    return id
  }
  const rename = (id, name) => setState((s) => ({ ...s, folders: s.folders.map((f) => (f.id === id ? { ...f, name } : f)) }))
  // Items in a deleted folder go back to no folder; they stay in the Library.
  const remove = (id) => setState((s) => ({
    folders: s.folders.filter((f) => f.id !== id),
    of: Object.fromEntries(Object.entries(s.of).filter(([, f]) => f !== id)),
  }))
  const move = (ids, folder) => setState((s) => {
    const of = { ...s.of }
    for (const id of ids) { if (folder) of[id] = folder; else delete of[id] }
    return { ...s, of }
  })
  const forget = (ids) => move(ids, null)

  return { folders: state.folders, of: state.of, create, rename, remove, move, forget }
}
