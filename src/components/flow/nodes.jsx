import { createContext, useContext, useRef } from 'react'
import { Handle, Position } from '@xyflow/react'
import { Logo, brandOf } from '../../lib/brands.jsx'
import { nodeLabels } from '../../lib/flowStore.js'
import { promptsOf } from '../../lib/flowEngine.js'
import { widgetReady } from '../../../shared/widgetInputs.js'
import { stitchInputs } from '../../lib/stitch.js'

export const FlowCtx = createContext(null)
const useFlow = () => useContext(FlowCtx)

const gateText = { empty: 'Empty', reviewing: 'Reviewing', sent: 'Sent', stopped: 'Stopped' }

const Check = () => <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3.2" strokeLinecap="round" strokeLinejoin="round"><path d="m5 12 5 5 9-10" /></svg>

function Shell({ type, selected, title, tag, input, output, wide, children }) {
  return (
    <div className={`fnode f-${type}${selected ? ' sel' : ''}${wide ? ' wide' : ''}`}>
      {input && <Handle type="target" position={Position.Left} />}
      <header><i className="fdot" /><span>{title || nodeLabels[type]}</span>{tag && <em>{tag}</em>}</header>
      <div className="fbody">{children}</div>
      {output && <Handle type="source" position={Position.Right} />}
    </div>
  )
}

export function Media({ it }) {
  if (it.kind === 'text') return <p className="fwriter-copy">{it.text}</p>
  if (it.kind === 'video') return <video src={it.url} muted loop playsInline autoPlay preload="metadata" />
  if (it.kind === 'audio') return <span className="fm-audio" title={it.prompt}><svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><path d="M5 10v4M9 7v10M13 4v16M17 8v8M21 11v2" /></svg></span>
  return <img src={it.url} alt={it.prompt || ''} />
}

const ratio = (a) => (a || '1:1').replace(':', ' / ')

export function PromptNode({ data, selected }) {
  const n = promptsOf({ data })
  return (
    <Shell type="prompt" selected={selected} output tag={data.mode === 'rows' ? `${n.length} ${n.length === 1 ? 'prompt' : 'prompts'}` : null}>
      {n.length ? <p className="fclamp">{n[0]}</p> : <p className="fhint">Select to write a prompt</p>}
      {n.length > 1 && <p className="fhint">and {n.length - 1} more</p>}
    </Shell>
  )
}

export function ImageNode({ id, data, selected }) {
  const { upload, uploads } = useFlow()
  const file = useRef(null)
  const st = uploads?.[id] || {}
  const pick = () => !st.busy && file.current.click()
  const drop = {
    onDragOver: (e) => e.preventDefault(),
    onDrop: (e) => { e.preventDefault(); const f = e.dataTransfer.files[0]; if (f && !st.busy) upload(id, f) },
  }
  return (
    <Shell type="image" selected={selected} output>
      <input ref={file} type="file" accept="image/*" hidden onChange={(e) => { e.target.files[0] && upload(id, e.target.files[0]); e.target.value = '' }} />
      {data.url ? (
        <button type="button" className={`fthumb nodrag${st.busy ? ' busy' : ''}`} onClick={pick} {...drop} title="Replace image" aria-busy={!!st.busy}><img src={data.url} alt={data.name || ''} /></button>
      ) : (
        <button type="button" className={`fdrop nodrag${st.busy ? ' busy' : ''}`} onClick={pick} {...drop} aria-busy={!!st.busy}>{st.busy ? 'Uploading…' : 'Upload an image'}</button>
      )}
      {st.busy && data.url && <span className="fstat">Uploading…</span>}
      {st.error && <span className="fstat bad" role="alert">Upload failed. {st.error}</span>}
    </Shell>
  )
}

export function ModelNode({ id, data, selected }) {
  const { flow, engine, state, act } = useFlow()
  const st = state[id] || {}
  const items = st.items || []
  const done = items.filter((i) => i.status === 'done')
  const failed = items.filter((i) => i.status === 'failed').length
  const plan = engine.plan(flow, id)
  const busy = (st.running || 0) > 0
  const gated = flow.edges.some((e) => e.source === id && flow.nodes.find((n) => n.id === e.target)?.type === 'approve')
  const total = items.length
  const line = busy ? `${done.length} of ${total} done`
    : plan.blocked ? 'Waiting for its inputs'
    : done.length ? `${done.length} ${done.length === 1 ? 'result' : 'results'}${failed ? ` · ${failed} failed` : ''}`
    : failed ? `${failed} failed` : `${plan.units.length} to make`
  const m = data.model
  return (
    <Shell type="model" selected={selected} input output tag={data.kind}>
      <div className="fmodel">{m && <Logo brand={brandOf(m)} size={14} />}<strong>{m?.name || 'Pick a model'}</strong></div>
      <p className="fhint">{[data.aspect, data.kind === 'video' && `${data.duration}s`, `${data.takes || 1} ${(data.takes || 1) === 1 ? 'take' : 'takes'}`].filter(Boolean).join(' · ')}</p>
      {done.length > 0 && <div className="fstrip">{done.slice(0, 4).map((it) => <span key={it.id} style={{ '--ar': ratio(it.aspect) }}><Media it={it} /></span>)}{done.length > 4 && <b>+{done.length - 4}</b>}</div>}
      {busy && <i className="fbar" style={{ '--p': `${(done.length / Math.max(1, total)) * 100}%` }} />}
      <div className="frow">
        <span className={`fstat${failed ? ' bad' : ''}`}>{line}</span>
        {!gated && done.length > 0 && !busy && <button type="button" className="btn-soft xs nodrag" onClick={() => act.rerun(id)}>Rerun</button>}
      </div>
    </Shell>
  )
}

export function WriterReview({ id }) {
  const { flow, engine, state, act } = useFlow()
  const st = state[id] || {}
  const item = st.items?.find((i) => i.status === 'done')
  const error = st.items?.find((i) => i.status === 'failed')?.error
  const busy = (st.running || 0) > 0
  return (
    <>
      {item ? <textarea className="fp-text nodrag nowheel" rows={6} aria-label="Written prompt" value={item.text} disabled={busy} onChange={(e) => act.editWriter(id, e.target.value)} />
        : <p className="fhint">{error || (busy ? 'Writing your prompt' : engine.plan(flow, id).blocked ? 'Waiting for its inputs' : 'Run to write a prompt')}</p>}
      <p className="fhint">Review and edit the prompt, then send it to the next step.</p>
      <div className="frow">
        <span className={`fstat${error ? ' bad' : ''}`}>{error ? 'Writing failed' : st.sent ? 'Prompt sent' : 'Model waits for Send'}</span>
        <div className="fbtns">
          {(item || error) && <button type="button" className="btn-soft xs nodrag" disabled={busy} onClick={() => act.rerun(id)}>Rerun</button>}
          <button type="button" className="btn-blue xs nodrag" disabled={busy || st.sent || !item?.text.trim()} onClick={() => act.sendWriter(id)}>Send</button>
        </div>
      </div>
    </>
  )
}

export function WriterNode({ id, selected }) {
  const { state } = useFlow()
  const st = state[id] || {}
  const item = st.items?.find((i) => i.status === 'done')
  return (
    <Shell type="writer" selected={selected} input output wide tag={st.running ? 'Writing' : st.sent ? 'Sent' : item ? 'Reviewing' : 'Text'}>
      <WriterReview id={id} />
    </Shell>
  )
}

export function ApproveNode({ id, selected }) {
  const { flow, engine, state, act } = useFlow()
  const g = engine.gate(id)
  const items = engine.reviewItems(flow, id)
  const busy = flow.edges.some((e) => e.target === id && (state[e.source]?.running || 0) > 0)
  const can = g.status === 'reviewing' || g.status === 'stopped'
  return (
    <Shell type="approve" selected={selected} input output wide tag={gateText[g.status]}>
      {items.length === 0 ? <p className="fhint">{busy ? 'Waiting for the takes' : 'Nothing to review yet'}</p> : (
        <div className="fgrid">
          {items.map((it) => (
            <div key={it.id} className={`fcell${g.picked.includes(it.id) ? ' on' : ''}`} style={{ '--ar': ratio(it.aspect) }}>
              <Media it={it} />
              <button type="button" className="fpick nodrag" aria-pressed={g.picked.includes(it.id)} aria-label="Approve take" onClick={() => act.pick(id, it.id)}><Check /></button>
            </div>
          ))}
        </div>
      )}
      <div className="frow">
        <span className="fstat">{g.status === 'sent' ? `${g.sent.length} sent` : g.picked.length ? `${g.picked.length} approved` : items.length ? 'Approve, then send' : ''}</span>
        <div className="fbtns">
          {g.status === 'reviewing' && <button type="button" className="btn-soft xs nodrag" onClick={() => act.stop(id)}>Stop</button>}
          {g.status !== 'empty' && !busy && <button type="button" className="btn-soft xs nodrag" onClick={() => act.rerunGate(id)}>Rerun</button>}
          <button type="button" className="btn-blue xs nodrag" disabled={!can} onClick={() => act.send(id)}>Send</button>
        </div>
      </div>
    </Shell>
  )
}

export function OutputNode({ id, selected }) {
  const { flow, engine } = useFlow()
  const items = engine.reviewItems(flow, id)
  return (
    <Shell type="output" selected={selected} input wide tag={items.length ? `${items.length}` : null}>
      {items.length === 0 ? <p className="fhint">Results land here</p> : (
        <div className="fgrid">{items.map((it) => (
          <a key={it.id} className="fcell" href={it.url} target="_blank" rel="noreferrer" style={{ '--ar': ratio(it.aspect) }}><Media it={it} /></a>
        ))}</div>
      )}
    </Shell>
  )
}

export function NoteNode({ id, data, selected }) {
  const { patch } = useFlow()
  return (
    <div className={`fnode f-note${selected ? ' sel' : ''}`}>
      <textarea className="nodrag nowheel" value={data.text} placeholder="Write a note" rows={3} onChange={(e) => patch(id, { text: e.target.value })} />
    </div>
  )
}

export function WidgetNode({ type, data, selected }) {
  const value = data.value
  const ready = widgetReady(type, value)
  const image = type === 'video' ? value?.posterUrl : type === 'face' ? value?.faceUrl || value?.url : value?.url
  return <Shell type={type} selected={selected} output tag={ready ? 'Ready' : 'Set input'}>
    {image && <img className="fp-img" src={image} alt="Input preview" />}
    <p className="fhint">{value?.name || 'Select this node to set its input'}</p>
    {type === 'video' && value?.trim && <p className="fhint">{value.trim.start.toFixed(2)} to {value.trim.end.toFixed(2)} seconds</p>}
  </Shell>
}

export function StitchNode({ id, data, selected }) {
  const { flow, engine, state, act } = useFlow()
  const input = stitchInputs(flow, id, engine.itemsOf, (id) => state[id]?.running > 0)
  const st = state[id] || {}
  const result = st.items?.find((item) => item.status === 'done')
  const failed = st.items?.find((item) => item.status === 'failed')
  return (
    <Shell type="stitch" selected={selected} input output tag={data.aspect}>
      <p>{input.clips.length} {input.clips.length === 1 ? 'clip' : 'clips'} · Captions and music</p>
      {result && <video className="stitch-preview nodrag" src={result.url} controls playsInline preload="metadata" />}
      <p className={`fstat${failed ? ' bad' : ''}`}>{st.running ? 'Rendering preview' : failed ? failed.error : input.blocked ? 'Add clips or wait for inputs' : 'Select to edit and export'}</p>
      <button type="button" className="btn-soft xs nodrag" disabled={st.running > 0 || input.blocked} onClick={() => act.rerun(id)}>{result ? 'Render again' : 'Preview'}</button>
    </Shell>
  )
}

export const nodeTypes = { mask: WidgetNode, face: WidgetNode, video: WidgetNode, crop: WidgetNode, writer: WriterNode, prompt: PromptNode, image: ImageNode, model: ModelNode, stitch: StitchNode, approve: ApproveNode, output: OutputNode, note: NoteNode }
