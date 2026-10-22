import { useEffect } from 'react'
import { useLocation, useNavigate } from 'react-router-dom'

// Settings a page hands to a generator as it opens it, through the router's state:
// Recreate fills the whole composer, Use as reference adds an image, Turn to video sets the start frame.
export function useHandoff(apply) {
  const { state, pathname, search } = useLocation()
  const navigate = useNavigate()
  useEffect(() => {
    if (!state?.handoff) return
    apply(state.handoff)
    // Dropped once applied, so a reload or Back does not apply it again.
    navigate(pathname + search, { replace: true, state: null })
  }, [state?.handoff])
}

// Picks the model a run used: a catalog model by id, or a fal model added from the Models page.
export function chooseModel(picker, model) {
  if (!model) return
  if (picker.all.some((m) => m.id === model.id)) { picker.setKind(model.kind); picker.choose(model.id) }
  else if (model.id) picker.use(model)
}

const asImage = (url, name, ratio) => ({ url, name, kind: 'image', ...(ratio && { ratio }) })

// Where an action on a finished item goes, and what it hands over. null when it does not apply to the item.
export function handoffFor(action, it, picker) {
  const run = it.run
  const model = run?.model || picker?.all.find((m) => m.kind === it.kind && m.name === it.model)
  const opts = run?.opts || {}
  const fromRefs = new Set((opts.refs || []).flatMap((r) => r.images?.slice(0, 1) || []))
  const images = (opts.images || []).filter((u) => !fromRefs.has(u))
  if (action === 'recreate' && it.kind === 'image') {
    return { to: '/image', handoff: { model, prompt: opts.prompt ?? it.caption ?? '', aspect: opts.aspect || it.aspect, count: opts.count, references: images.map((u) => asImage(u, 'Reference')), refs: opts.refs || [], replace: true } }
  }
  if (action === 'recreate' && it.kind === 'video') {
    return { to: '/video', handoff: { model, prompt: opts.caption ?? it.caption ?? '', aspect: opts.aspect || it.aspect, duration: opts.duration, start: images[0] ? asImage(images[0], 'Start frame') : null, refs: opts.refs || [] } }
  }
  if (action === 'reference' && it.kind === 'image') return { to: '/image', handoff: { references: [asImage(it.url, it.caption || 'Reference', it.aspect)] } }
  if (action === 'video' && it.kind === 'image') return { to: '/video', handoff: { start: asImage(it.url, it.caption || 'Start frame', it.aspect) } }
  return null
}
