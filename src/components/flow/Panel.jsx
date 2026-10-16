import { useEffect, useRef, useState } from 'react'
import { Chip, Option } from '../Composer.jsx'
import Segmented from '../Segmented.jsx'
import ModelPicker from '../ModelPicker.jsx'
import { IconAspect, IconClock, IconStack } from '../Icons.jsx'
import { aspects } from '../../lib/catalog.js'
import { durationsFor } from '../../lib/providers.js'
import { csvPrompts, promptsOf } from '../../lib/flowEngine.js'
import { nodeLabels } from '../../lib/flowStore.js'
import { WriterReview } from './nodes.jsx'

const blurbs = {
  approve: 'Nothing passes this gate until you approve takes and press Send. Send only starts nodes after it that have no results yet.',
  output: 'Everything that reaches this node shows up here. Click a result to open it.',
  note: 'A free note on the canvas. It never runs.',
}

function PromptPanel({ node, patch }) {
  const { id, data } = node
  const csv = useRef(null)
  const n = promptsOf(node).length
  const onPaste = (e) => {
    const t = e.clipboardData.getData('text')
    if (/^"?prompts?"?\s*(,|\r?\n)/i.test(t)) {
      e.preventDefault()
      patch(id, { text: csvPrompts(t).join('\n') })
    }
  }
  const importCsv = async (f) => patch(id, { mode: 'rows', text: csvPrompts(await f.text()).join('\n') })
  return (
    <>
      <Segmented className="seg-sm" value={data.mode} onChange={(mode) => patch(id, { mode })}
        options={[{ value: 'single', label: 'Single' }, { value: 'rows', label: 'List' }]} />
      <textarea className="fp-text" rows={data.mode === 'rows' ? 9 : 5} value={data.text} onPaste={onPaste}
        placeholder={data.mode === 'rows' ? 'One prompt per line. Each line makes its own run.' : 'Describe what you want'}
        onChange={(e) => patch(id, { text: e.target.value })} />
      {data.mode === 'rows' && (
        <div className="fp-row">
          <span className="muted">{n} {n === 1 ? 'prompt' : 'prompts'}</span>
          <input ref={csv} type="file" accept=".csv,text/csv,text/plain" hidden onChange={(e) => e.target.files[0] && importCsv(e.target.files[0])} />
          <button type="button" className="btn-soft sm" onClick={() => csv.current.click()}>Import CSV</button>
        </div>
      )}
    </>
  )
}

function ModelPanel({ node, patch, picker, connections }) {
  const { id, data } = node
  const [durations, setDurations] = useState([])
  useEffect(() => {
    let live = true
    if (data.model) durationsFor(data.model).then((d) => live && setDurations(d))
    return () => { live = false }
  }, [data.model?.id])
  const options = picker.all.filter((m) => m.kind === data.kind)
  const setKind = (kind) => {
    const model = picker.all.find((m) => m.kind === kind)
    patch(id, { kind, model, aspect: kind === 'video' ? '16:9' : '1:1' })
  }
  const choose = (mid) => patch(id, { model: picker.all.find((m) => m.id === mid) })
  const takes = data.takes || 1
  return (
    <>
      <Segmented className="seg-sm" value={data.kind} onChange={setKind}
        options={['image', 'video', 'audio'].map((k) => ({ value: k, label: k[0].toUpperCase() + k.slice(1) }))} />
      <div className="fp-field"><label>Model</label>
        <ModelPicker model={data.model || options[0]} options={options} favorites={picker.favorites}
          toggleFavorite={picker.toggleFavorite} choose={choose} connections={connections} />
      </div>
      <div className="chips">
        {data.kind !== 'audio' && (
          <Chip icon={<IconAspect />} label={data.aspect}>
            {aspects.map((a) => <Option key={a} on={a === data.aspect} label={a} onClick={() => patch(id, { aspect: a })} />)}
          </Chip>
        )}
        {data.kind === 'video' && durations.length > 0 && (
          <Chip icon={<IconClock />} label={`${data.duration}s`}>
            {durations.map((d) => <Option key={d} on={d === data.duration} label={`${d} seconds`} onClick={() => patch(id, { duration: d })} />)}
          </Chip>
        )}
        <Chip icon={<IconStack />} label={`${takes} ${takes === 1 ? 'take' : 'takes'}`}>
          {[1, 2, 3, 4].map((t) => <Option key={t} on={t === takes} label={`${t} ${t === 1 ? 'take' : 'takes'} per prompt`} onClick={() => patch(id, { takes: t })} />)}
        </Chip>
      </div>
      <div className="fp-field"><label>Own prompt</label>
        <textarea className="fp-text" rows={3} value={data.prompt || ''} placeholder="Used when no prompt node is connected, such as a motion note for an image going to video"
          onChange={(e) => patch(id, { prompt: e.target.value })} />
      </div>
    </>
  )
}

function ImagePanel({ node, patch, upload }) {
  const file = useRef(null)
  return (
    <>
      {node.data.url && <img className="fp-img" src={node.data.url} alt="" />}
      <input ref={file} type="file" accept="image/*" hidden onChange={(e) => e.target.files[0] && upload(node.id, e.target.files[0])} />
      <div className="fp-row">
        <button type="button" className="btn-soft sm" onClick={() => file.current.click()}>{node.data.url ? 'Replace' : 'Upload'}</button>
        {node.data.url && <button type="button" className="btn-soft sm" onClick={() => patch(node.id, { url: null, name: '' })}>Clear</button>}
      </div>
    </>
  )
}

function WriterPanel({ node, patch }) {
  const { id, data } = node
  return (
    <>
      <WriterReview id={id} />
      <p className="muted fp-blurb">Connect images and a prompt node for the user note. Changes to the instructions apply on Rerun.</p>
      <div className="fp-field"><label htmlFor="writer-instructions">Writer instructions</label>
        <textarea id="writer-instructions" className="fp-text" rows={7} value={data.instructions || ''} onChange={(e) => patch(id, { instructions: e.target.value })} />
      </div>
      <div className="fp-field"><label htmlFor="writer-note">User note</label>
        <textarea id="writer-note" className="fp-text" rows={3} value={data.note || ''} onChange={(e) => patch(id, { note: e.target.value })} />
      </div>
      <div className="fp-field"><label htmlFor="writer-target">Target model or medium</label>
        <input id="writer-target" className="fp-text" value={data.target || ''} placeholder="Image, video or a model name" onChange={(e) => patch(id, { target: e.target.value })} />
      </div>
    </>
  )
}

export default function Panel({ node, patch, picker, connections, upload, remove }) {
  return (
    <aside className="fpanel glass pop" key={node.id}>
      <h3>{nodeLabels[node.type]}</h3>
      {node.type === 'prompt' && <PromptPanel node={node} patch={patch} />}
      {node.type === 'image' && <ImagePanel node={node} patch={patch} upload={upload} />}
      {node.type === 'writer' && <WriterPanel node={node} patch={patch} />}
      {node.type === 'model' && <ModelPanel node={node} patch={patch} picker={picker} connections={connections} />}
      {blurbs[node.type] && <p className="muted fp-blurb">{blurbs[node.type]}</p>}
      <button type="button" className="btn-soft sm fp-del" onClick={() => remove(node.id)}>Delete node</button>
    </aside>
  )
}
