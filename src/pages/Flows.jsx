import { useCallback, useEffect, useMemo, useRef, useState, useSyncExternalStore } from 'react'
import { ReactFlow, ReactFlowProvider, Background, Controls, MiniMap, applyNodeChanges, applyEdgeChanges, addEdge, useReactFlow } from '@xyflow/react'
import '@xyflow/react/dist/style.css'
import { nodeTypes, FlowCtx } from '../components/flow/nodes.jsx'
import Panel from '../components/flow/Panel.jsx'
import { widgetTypes } from '../../shared/widgetInputs.js'
import { IconClose } from '../components/Icons.jsx'
import { downstreamOf } from '../lib/flowEngine.js'
import { loadFlows, saveFlows, engineFor, starters, makeNode, blankFlow, exportJson, parseFlow, nodeLabels } from '../lib/flowStore.js'
import { getConnections } from '../lib/providers.js'

const addable = [
  ['prompt', 'Text or a list of prompts'],
  ['image', 'Upload a reference image'],
  ['writer', 'Write a prompt, then review and send'],
  ['mask', 'Paint an area to change'],
  ['face', 'Choose a face or Library character'],
  ['video', 'Upload, trim and pick a poster'],
  ['crop', 'Choose an aspect and crop area'],
  ['model', 'Any image, video or audio model'],
  ['approve', 'A gate you open with Send'],
  ['output', 'A gallery of results'],
  ['note', 'A note for yourself'],
]
const miniColor = { prompt: '#8a8fa6', image: '#8a8fa6', writer: 'var(--blue)', model: '#4a5bff', approve: '#f5b301', output: '#138a4b', note: '#c3c6d4' }

function Pop({ label, children, align = 'left' }) {
  const [open, setOpen] = useState(false)
  const ref = useRef(null)
  useEffect(() => {
    if (!open) return
    const away = (e) => !ref.current?.contains(e.target) && setOpen(false)
    document.addEventListener('pointerdown', away)
    return () => document.removeEventListener('pointerdown', away)
  }, [open])
  return (
    <div className="fpop" ref={ref}>
      <button type="button" className="btn-soft" aria-expanded={open} onClick={() => setOpen((o) => !o)}>{label}</button>
      {open && <div className={`menu glass pop ${align}`} onClick={(e) => e.target.closest('button') && setOpen(false)}>{children}</div>}
    </div>
  )
}

function Canvas({ picker }) {
  const [store, setStore] = useState(loadFlows)
  const [connections, setConnections] = useState({})
  const [note, setNote] = useState(null)
  const [wipe, setWipe] = useState(false)
  const importer = useRef(null)
  const rf = useReactFlow()
  const flow = store.flows.find((f) => f.id === store.current) || store.flows[0]
  const engine = engineFor(flow.id)
  const state = useSyncExternalStore(engine.subscribe, () => engine.state)

  useEffect(() => { getConnections().then(setConnections) }, [])
  useEffect(() => { saveFlows(store) }, [store])
  useEffect(() => { if (note) { const t = setTimeout(() => setNote(null), 3600); return () => clearTimeout(t) } }, [note])
  useEffect(() => { if (wipe) { const t = setTimeout(() => setWipe(false), 3000); return () => clearTimeout(t) } }, [wipe])

  const update = useCallback((fn) => setStore((s) => ({
    ...s, flows: s.flows.map((f) => (f.id === s.current ? { ...fn(f), updated: Date.now() } : f)),
  })), [])
  const patch = useCallback((id, data) => update((f) => ({ ...f, nodes: f.nodes.map((n) => (n.id === id ? { ...n, data: { ...n.data, ...data } } : n)) })), [update])
  const upload = useCallback((id, file) => {
    const r = new FileReader()
    r.onload = () => patch(id, { url: r.result, name: file.name })
    r.readAsDataURL(file)
  }, [patch])

  const say = (r) => setNote(r?.reason || null)
  const act = {
    pick: (id, item) => engine.togglePick(flow, id, item),
    stop: (id) => engine.stop(flow, id),
    send: async (id) => say(await engine.send(flow, id)),
    editWriter: (id, text) => engine.editWriter(flow, id, text),
    sendWriter: async (id) => say(await engine.sendWriter(flow, id)),
    rerun: async (id) => say(await engine.rerun(flow, id)),
    rerunGate: async (id) => say(await engine.rerunGate(flow, id)),
  }

  const run = async () => {
    try {
      const r = await engine.runNew(flow)
      if (!r.ran) setNote(engine.hasOutput(flow) ? 'Everything is already made. Use Regenerate all to start over.' : 'Nothing is ready to run. Check prompts, models and gates.')
    } catch (e) { setNote(e.message) }
  }
  const regenerate = async () => {
    if (!wipe) return setWipe(true)
    setWipe(false)
    try { await engine.regenerateAll(flow) } catch (e) { setNote(e.message) }
  }

  const selected = flow.nodes.filter((n) => n.selected)
  const node = selected.length === 1 ? selected[0] : null
  const busy = Object.values(state).some((s) => s.running > 0)
  const hasOutput = engine.hasOutput(flow)

  const edges = useMemo(() => flow.edges.map((e) => ({ ...e, animated: (state[e.source]?.running || 0) > 0 })), [flow.edges, state])

  const onNodesChange = useCallback((c) => update((f) => ({ ...f, nodes: applyNodeChanges(c, f.nodes) })), [update])
  const onEdgesChange = useCallback((c) => update((f) => ({ ...f, edges: applyEdgeChanges(c, f.edges) })), [update])
  const onConnect = useCallback((c) => update((f) => ({ ...f, edges: addEdge({ ...c, id: `${c.source}-${c.target}` }, f.edges) })), [update])
  const valid = useCallback((c) => {
    const s = flow.nodes.find((n) => n.id === c.source)
    const t = flow.nodes.find((n) => n.id === c.target)
    if (!s || !t || s.id === t.id) return false
    if (['output', 'note'].includes(s.type) || ['prompt', 'image', 'note', ...widgetTypes].includes(t.type)) return false
    if (s.type === 'prompt' && !['model', 'writer'].includes(t.type)) return false
    return !downstreamOf(flow, t.id).has(s.id) && !flow.edges.some((e) => e.source === s.id && e.target === t.id)
  }, [flow])

  const add = (type) => {
    const c = rf.screenToFlowPosition({ x: window.innerWidth / 2 - 120, y: window.innerHeight / 2 - 80 })
    const jitter = (flow.nodes.length % 5) * 24
    update((f) => ({ ...f, nodes: [...f.nodes.map((n) => ({ ...n, selected: false })), { ...makeNode(type, { x: c.x + jitter, y: c.y + jitter }), selected: true }] }))
  }
  const remove = (id) => update((f) => ({ ...f, nodes: f.nodes.filter((n) => n.id !== id), edges: f.edges.filter((e) => e.source !== id && e.target !== id) }))

  const startFrom = (s) => { update((f) => ({ ...s.make(), id: f.id })); setTimeout(() => rf.fitView({ padding: 0.25, duration: 500 }), 60) }
  const newFlow = () => setStore((s) => { const f = blankFlow(); return { current: f.id, flows: [f, ...s.flows] } })
  const open = (id) => setStore((s) => ({ ...s, current: id }))
  const drop = (id) => setStore((s) => {
    const flows = s.flows.filter((f) => f.id !== id)
    if (!flows.length) { const f = blankFlow(); return { current: f.id, flows: [f] } }
    return { current: s.current === id ? flows[0].id : s.current, flows }
  })
  const download = () => {
    const a = document.createElement('a')
    a.href = URL.createObjectURL(new Blob([exportJson(flow)], { type: 'application/json' }))
    a.download = `${flow.name.replace(/[^\w-]+/g, '-').toLowerCase() || 'flow'}.json`
    a.click()
    setTimeout(() => URL.revokeObjectURL(a.href), 1000)
  }
  const importFile = async (file) => {
    try {
      const f = parseFlow(await file.text())
      setStore((s) => ({ current: f.id, flows: [f, ...s.flows.filter((x) => x.nodes.length)] }))
    } catch (e) { setNote(e.message) }
  }

  const ctx = { flow, engine, state, act, patch, upload }

  return (
    <FlowCtx.Provider value={ctx}>
      <div className="flows">
        <div className="ftool glass">
          <Pop label={<>Flows<span className="fcount">{store.flows.filter((f) => f.nodes.length).length || ''}</span></>}>
            {store.flows.map((f) => (
              <div key={f.id} className="fl-row">
                <button type="button" className={f.id === flow.id ? 'on' : ''} onClick={() => open(f.id)}>{f.name}<small>{f.nodes.length} nodes</small></button>
                <button type="button" className="fl-x" aria-label={`Delete ${f.name}`} onClick={() => drop(f.id)}><IconClose /></button>
              </div>
            ))}
            <button type="button" onClick={newFlow}>New flow</button>
            <button type="button" onClick={() => importer.current.click()}>Import a flow file</button>
          </Pop>
          <input ref={importer} type="file" accept=".json,application/json" hidden onChange={(e) => { e.target.files[0] && importFile(e.target.files[0]); e.target.value = '' }} />
          <input className="fname" value={flow.name} aria-label="Flow name" onChange={(e) => update((f) => ({ ...f, name: e.target.value }))} />
          <span className="fgrow" />
          {note && <span className="fnote pop">{note}</span>}
          <Pop label="Add">
            {addable.map(([t, d]) => <button key={t} type="button" onClick={() => add(t)}>{nodeLabels[t]}<small>{d}</small></button>)}
          </Pop>
          <button type="button" className="btn-soft" onClick={download} disabled={!flow.nodes.length}>Export</button>
          {hasOutput && <button type="button" className="btn-soft" onClick={regenerate} disabled={busy}>{wipe ? 'Wipe and re-run?' : 'Regenerate all'}</button>}
          <button type="button" className="btn-blue sm" onClick={run} disabled={busy || !flow.nodes.some((n) => ['model', 'writer'].includes(n.type))}>{busy ? 'Running' : 'Run'}</button>
        </div>

        <ReactFlow key={flow.id} nodes={flow.nodes} edges={edges} nodeTypes={nodeTypes}
          onNodesChange={onNodesChange} onEdgesChange={onEdgesChange} onConnect={onConnect} isValidConnection={valid}
          defaultEdgeOptions={{ type: 'default' }} fitView fitViewOptions={{ padding: 0.3, maxZoom: 1 }}
          minZoom={0.25} maxZoom={1.6} deleteKeyCode={['Backspace', 'Delete']} proOptions={{ hideAttribution: true }}>
          <Background gap={22} size={1.6} color="rgb(15 18 34 / .16)" />
          <MiniMap pannable zoomable nodeColor={(n) => miniColor[n.type] || miniColor.image} maskColor="rgb(255 255 255 / .55)" />
          <Controls showInteractive={false} />
        </ReactFlow>

        {flow.nodes.length === 0 && (
          <div className="fempty">
            <h2 className="rise">Start from a flow</h2>
            <p className="rise" style={{ '--d': '60ms' }}>Pick one to edit, or add nodes yourself from the toolbar.</p>
            <div className="fcards">
              {starters.map((s, i) => (
                <button key={s.id} type="button" className="fcard glass rise" style={{ '--d': `${120 + i * 70}ms` }} onClick={() => startFrom(s)}>
                  <span className="fsteps">{s.steps.map((x, k) => <span key={k}><b>{x}</b>{k < s.steps.length - 1 && <i />}</span>)}</span>
                  <strong>{s.name}</strong>
                  <span className="muted">{s.blurb}</span>
                </button>
              ))}
            </div>
          </div>
        )}

        {node && <Panel node={node} patch={patch} picker={picker} connections={connections} upload={upload} remove={remove} />}
      </div>
    </FlowCtx.Provider>
  )
}

export default function Flows({ picker }) {
  return <ReactFlowProvider><Canvas picker={picker} /></ReactFlowProvider>
}
