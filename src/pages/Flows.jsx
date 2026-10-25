import { useCallback, useEffect, useMemo, useRef, useState, useSyncExternalStore } from 'react'
import { ReactFlow, ReactFlowProvider, Background, Controls, MiniMap, applyNodeChanges, applyEdgeChanges, addEdge, useReactFlow } from '@xyflow/react'
import '@xyflow/react/dist/style.css'
import { nodeTypes, FlowCtx } from '../components/flow/nodes.jsx'
import Panel from '../components/flow/Panel.jsx'
import { IconClose } from '../components/Icons.jsx'
import { connectionProblem } from '../../shared/flowRules.js'
import { useFlowStorage, engineFor, starters, makeNode, blankFlow, exportJson, parseFlow, nodeLabels } from '../lib/flowStore.js'
import { reloadFlows } from '../lib/remoteFlows.js'
import AssistantPanel from '../components/AssistantPanel.jsx'
import { AgentPresence, useAgentPresence } from '../components/flow/AgentPresence.jsx'
import { getConnections } from '../lib/providers.js'
import { uploadFlowImage, legacyImages, migrateDataUrl, patchNode } from '../lib/flowImage.js'
import { api } from '../lib/remoteFlows.js'
import { placeDraft, acceptDraft } from '../lib/flowDraft.js'

const addable = [
  ['prompt', 'Text or a list of prompts'],
  ['image', 'Upload a reference image'],
  ['writer', 'Write a prompt, then review and send'],
  ['mask', 'Paint an area to change'],
  ['face', 'Choose a face or Library character'],
  ['video', 'Upload, trim and pick a poster'],
  ['crop', 'Choose an aspect and crop area'],
  ['model', 'Any image, video or audio model'],
  ['stitch', 'Join clips, captions and music locally'],
  ['approve', 'A gate you open with Send'],
  ['output', 'A gallery of results'],
  ['note', 'A note for yourself'],
]
const miniColor = { prompt: 'var(--muted)', image: 'var(--muted)', writer: 'var(--blue)', stitch: 'var(--blue-hi)', model: 'var(--blue-hi)', approve: 'var(--warn)', output: 'var(--success)', note: 'var(--faint)' }

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

// One field: describe a flow, get a draft of ghost nodes to accept or discard.
function Describe({ busy, onDraft }) {
  const [open, setOpen] = useState(false)
  const [text, setText] = useState('')
  const ref = useRef(null)
  useEffect(() => {
    if (!open) return
    const away = (e) => !ref.current?.contains(e.target) && setOpen(false)
    document.addEventListener('pointerdown', away)
    return () => document.removeEventListener('pointerdown', away)
  }, [open])
  const go = (e) => { e.preventDefault(); if (!text.trim() || busy) return; setOpen(false); onDraft(text.trim()) }
  return (
    <div className="fpop" ref={ref}>
      <button type="button" className="btn-soft" aria-expanded={open} disabled={busy} onClick={() => setOpen((o) => !o)}>{busy ? 'Drafting' : 'Describe'}</button>
      {open && (
        <form className="menu glass pop fdescribe" onSubmit={go}>
          <label htmlFor="fdescribe-text">Describe a flow</label>
          <textarea id="fdescribe-text" className="fp-text" rows={4} autoFocus value={text} placeholder="Three product shots, pick the best, then animate it"
            onChange={(e) => setText(e.target.value)} onKeyDown={(e) => { if (e.key === 'Enter' && (e.metaKey || e.ctrlKey)) go(e) }} />
          <p className="fhint">Uses your Google or Comfy key. The draft shows as ghost nodes until you accept it.</p>
          <button type="submit" className="btn-blue sm" disabled={!text.trim()}>Draft flow</button>
        </form>
      )}
    </div>
  )
}

function Canvas({ picker }) {
  const { store, setStore, ready, error } = useFlowStorage()
  const [assistant, setAssistant] = useState(false)
  const presence = useAgentPresence()
  const [connections, setConnections] = useState({})
  const [note, setNote] = useState(null)
  const [wipe, setWipe] = useState(false)
  const [draft, setDraft] = useState(null)
  const [drafting, setDrafting] = useState(false)
  const importer = useRef(null)
  const rf = useReactFlow()
  const flow = store.flows.find((f) => f.id === store.current) || store.flows[0]
  const engine = engineFor(flow.id)
  const state = useSyncExternalStore(engine.subscribe, () => engine.state)

  useEffect(() => { getConnections().then(setConnections) }, [])
  useEffect(() => { if (note) { const t = setTimeout(() => setNote(null), 3600); return () => clearTimeout(t) } }, [note])
  useEffect(() => { if (wipe) { const t = setTimeout(() => setWipe(false), 3000); return () => clearTimeout(t) } }, [wipe])

  const update = useCallback((fn) => setStore((s) => ({
    ...s, flows: s.flows.map((f) => (f.id === s.current ? { ...fn(f), updated: Date.now() } : f)),
  })), [])
  const patch = useCallback((id, data) => update((f) => ({ ...f, nodes: f.nodes.map((n) => (n.id === id ? { ...n, data: { ...n.data, ...data } } : n)) })), [update])
  const [uploads, setUploads] = useState({})
  const upload = useCallback(async (id, file) => {
    const flowId = flow.id
    setUploads((u) => ({ ...u, [id]: { busy: true } }))
    try {
      const data = await uploadFlowImage(file)
      setStore((s) => patchNode(s, flowId, id, data))
      setUploads((u) => { const { [id]: _, ...rest } = u; return rest })
    } catch (e) {
      setUploads((u) => ({ ...u, [id]: { error: e.message } }))
    }
  }, [flow.id])

  // Older flows kept image nodes as data URLs. Move them to /media once; on failure the data URL stays and still works.
  const migrated = useRef(new Set())
  useEffect(() => {
    if (!ready) return
    for (const n of legacyImages(flow)) {
      if (migrated.current.has(n.id)) continue
      migrated.current.add(n.id)
      const from = n.data.url
      migrateDataUrl(from).then((url) => setStore((s) => patchNode(s, flow.id, n.id, { url }, from)), () => {})
    }
  }, [ready, flow])

  const say = (r) => setNote(r?.reason || null)
  const act = {
    pick: (id, item) => engine.togglePick(flow, id, item).catch((e) => setNote(e.message)),
    stop: (id) => engine.stop(flow, id).catch((e) => setNote(e.message)),
    send: async (id) => { try { say(await engine.send(flow, id)) } catch (e) { setNote(e.message) } },
    editWriter: (id, text) => engine.editWriter(flow, id, text).catch((e) => setNote(e.message)),
    sendWriter: async (id) => { try { say(await engine.sendWriter(flow, id)) } catch (e) { setNote(e.message) } },
    rerun: async (id) => { try { say(await engine.rerun(flow, id)) } catch (e) { setNote(e.message) } },
    rerunGate: async (id) => { try { say(await engine.rerunGate(flow, id)) } catch (e) { setNote(e.message) } },
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

  const ghostIds = useMemo(() => new Set(draft?.nodes.map((n) => n.id) || []), [draft])
  const shown = useMemo(() => (draft ? [...flow.nodes, ...draft.nodes] : flow.nodes), [flow.nodes, draft])
  const shownEdges = useMemo(() => (draft ? [...edges, ...draft.edges] : edges), [edges, draft])
  const onNodesChange = useCallback((c) => {
    const ghost = c.filter((x) => ghostIds.has(x.id))
    if (ghost.length) setDraft((d) => d && { ...d, nodes: applyNodeChanges(ghost, d.nodes) })
    const real = c.filter((x) => !ghostIds.has(x.id))
    if (real.length) update((f) => ({ ...f, nodes: applyNodeChanges(real, f.nodes) }))
  }, [update, ghostIds])
  const onEdgesChange = useCallback((c) => update((f) => ({ ...f, edges: applyEdgeChanges(c.filter((x) => !x.id?.startsWith('ghost:')), f.edges) })), [update])
  const onConnect = useCallback((c) => update((f) => ({ ...f, edges: addEdge({ ...c, id: `${c.source}-${c.target}` }, f.edges) })), [update])
  const valid = useCallback((c) => !connectionProblem(flow, c.source, c.target), [flow])

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

  useEffect(() => { setDraft(null) }, [flow.id])
  const describe = async (description) => {
    setDrafting(true)
    try {
      const { draft: d } = await api('/api/flow-draft', 'POST', { description })
      const placed = placeDraft(flow, d)
      setDraft(placed)
      setTimeout(() => rf.fitView({ nodes: placed.nodes.map(({ id }) => ({ id })), padding: 0.2, duration: 500 }), 120)
    } catch (e) { setNote(e.message) } finally { setDrafting(false) }
  }
  const accept = () => {
    const d = draft
    setDraft(null)
    update((f) => acceptDraft(f, d))
  }

  // Node cards look themselves up in ctx.flow, so ghost nodes need to be in it too. Actions still use the saved flow.
  const view = useMemo(() => (draft ? { ...flow, nodes: shown, edges: [...flow.edges, ...draft.edges] } : flow), [flow, shown, draft])
  // After Discard, React Flow paints the old ghost cards once more before it drops them; plan them as empty.
  const cardEngine = useMemo(() => Object.assign(Object.create(engine), { plan: (f, id) => (f.nodes.some((n) => n.id === id) ? engine.plan(f, id) : { blocked: true, units: [] }) }), [engine])
  const ctx = { flow: view, engine: cardEngine, state, act, patch, upload, uploads }

  return (
    <FlowCtx.Provider value={ctx}>
      <div className="flows">
        {!ready && <div className="agent-flow-status glass" role="status">{error || 'Loading shared flows…'}{error && <><button type="button" className="btn-soft" onClick={download}>Export unsaved flow</button><button type="button" className="btn-soft" onClick={() => reloadFlows().catch((e) => setNote(e.message))}>Reload flows</button></>}</div>}
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
          <Describe busy={drafting} onDraft={describe} />
          <button type="button" className="btn-soft" aria-expanded={assistant} onClick={() => setAssistant((value) => !value)}>Assistant</button>
          {note && <span className="fnote pop">{note}</span>}
          <Pop label="Add">
            {addable.map(([t, d]) => <button key={t} type="button" onClick={() => add(t)}>{nodeLabels[t]}<small>{d}</small></button>)}
          </Pop>
          <button type="button" className="btn-soft" onClick={download} disabled={!flow.nodes.length}>Export</button>
          {hasOutput && <button type="button" className="btn-soft" onClick={regenerate} disabled={busy}>{wipe ? 'Wipe and re-run?' : 'Regenerate all'}</button>}
          <button type="button" className="btn-blue sm" onClick={run} disabled={!ready || busy || !flow.nodes.some((n) => ['model', 'writer', 'stitch'].includes(n.type))}>{busy ? 'Running' : 'Run'}</button>
        </div>

        <ReactFlow key={flow.id} nodes={shown} edges={shownEdges} nodesDraggable={ready} nodesConnectable={ready} nodeTypes={nodeTypes}
          onNodesChange={onNodesChange} onEdgesChange={onEdgesChange} onConnect={onConnect} isValidConnection={valid}
          defaultEdgeOptions={{ type: 'default' }} fitView fitViewOptions={{ padding: 0.3, maxZoom: 1 }}
          minZoom={0.25} maxZoom={1.6} deleteKeyCode={['Backspace', 'Delete']} proOptions={{ hideAttribution: true }}>
          <Background gap={22} size={1.6} color="rgb(15 18 34 / .16)" />
          <MiniMap pannable zoomable nodeColor={(n) => miniColor[n.type] || miniColor.image} maskColor="rgb(255 255 255 / .55)" />
          <Controls showInteractive={false} />
          <AgentPresence flow={flow} presence={presence} />
        </ReactFlow>

        {draft && (
          <div className="fdraft glass pop" role="region" aria-label="Flow draft">
            <div>
              <strong>Draft: {draft.name}</strong>
              <span className="muted">{draft.nodes.length} {draft.nodes.length === 1 ? 'node' : 'nodes'}, {draft.edges.length} {draft.edges.length === 1 ? 'connection' : 'connections'}</span>
              {draft.dropped.length > 0 && (
                <details>
                  <summary>{draft.dropped.length} {draft.dropped.length === 1 ? 'thing' : 'things'} left out</summary>
                  <ul>{draft.dropped.map((d, i) => <li key={i}>{d}</li>)}</ul>
                </details>
              )}
            </div>
            <div className="fbtns">
              <button type="button" className="btn-soft" onClick={() => setDraft(null)}>Discard</button>
              <button type="button" className="btn-blue sm" onClick={accept} disabled={!ready}>Accept</button>
            </div>
          </div>
        )}

        {flow.nodes.length === 0 && !draft && (
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

        {assistant && <aside className="agent-canvas-panel glass"><button type="button" className="btn-soft" onClick={() => setAssistant(false)}>Close assistant</button><AssistantPanel /></aside>}
        {node && !assistant && !draft && ready && <Panel node={node} patch={patch} picker={picker} connections={connections} upload={upload} uploading={uploads[node.id]} remove={remove} />}
      </div>
    </FlowCtx.Provider>
  )
}

export default function Flows({ picker }) {
  return <ReactFlowProvider><Canvas picker={picker} /></ReactFlowProvider>
}
