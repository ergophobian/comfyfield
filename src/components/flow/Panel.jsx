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
import { widgetTypes } from '../../../shared/widgetInputs.js'
import { Field } from '../formats/Fields.jsx'
import StitchPanel from './StitchPanel.jsx'
import { blenderScript, blenderVideoScript } from '../../../shared/flowRules.js'

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

function ImagePanel({ node, patch, upload, uploading = {} }) {
  const file = useRef(null)
  return (
    <>
      {node.data.url && <img className="fp-img" src={node.data.url} alt="" />}
      <input ref={file} type="file" accept="image/*" hidden onChange={(e) => { e.target.files[0] && upload(node.id, e.target.files[0]); e.target.value = '' }} />
      <div className="fp-row">
        <button type="button" className="btn-soft sm" disabled={uploading.busy} onClick={() => file.current.click()}>{uploading.busy ? 'Uploading…' : node.data.url ? 'Replace' : 'Upload'}</button>
        {node.data.url && <button type="button" className="btn-soft sm" disabled={uploading.busy} onClick={() => patch(node.id, { url: null, name: '' })}>Clear</button>}
      </div>
      {uploading.error && <p className="fstat bad" role="alert">Upload failed. {uploading.error}</p>}
    </>
  )
}

function BlenderPanel({ node, patch }) {
  const { id, data } = node
  // An untouched starter script follows the output, so Video starts with a script that writes an MP4.
  const setOutput = (output) => {
    const starter = [blenderScript, blenderVideoScript].includes(data.script)
    patch(id, { output, ...(starter && { script: output === 'video' ? blenderVideoScript : blenderScript }) })
  }
  return (
    <>
      <Segmented className="seg-sm" value={data.output === 'video' ? 'video' : 'image'} onChange={setOutput}
        options={[{ value: 'image', label: 'Image' }, { value: 'video', label: 'Video' }]} />
      <div className="fp-field"><label htmlFor="blender-script">Python script</label>
        <textarea id="blender-script" className="fp-text fp-code" rows={12} spellCheck={false} value={data.script || ''} onChange={(e) => patch(id, { script: e.target.value })} />
      </div>
      <p className="muted fp-blurb">Runs <code>blender -b -P script.py -- --output file</code> where Connections says. Save the render to the path after <code>--output</code>: a PNG for an image, an MP4 for a video. The result goes to the Library and to the next node.</p>
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

export default function Panel({ node, patch, picker, connections, upload, uploading, remove }) {
  const [error, setError] = useState(null)
  useEffect(() => setError(null), [node.id])
  return (
    <aside className="fpanel glass pop" key={node.id}>
      <h3>{nodeLabels[node.type]}</h3>
      {node.type === 'prompt' && <PromptPanel node={node} patch={patch} />}
      {widgetTypes.includes(node.type) && <Field input={{ id: node.id, type: node.type, label: nodeLabels[node.type] }} value={node.data.value} onChange={(value) => patch(node.id, { value })} setError={setError} />}
      {error && <p className="sheet-error" role="alert">{error}</p>}
      {node.type === 'image' && <ImagePanel node={node} patch={patch} upload={upload} uploading={uploading} />}
      {node.type === 'writer' && <WriterPanel node={node} patch={patch} />}
      {node.type === 'model' && <ModelPanel node={node} patch={patch} picker={picker} connections={connections} />}
      {node.type === 'stitch' && <StitchPanel node={node} patch={patch} />}
      {node.type === 'blender' && <BlenderPanel node={node} patch={patch} />}
      {blurbs[node.type] && <p className="muted fp-blurb">{blurbs[node.type]}</p>}
      <button type="button" className="btn-soft sm fp-del" onClick={() => remove(node.id)}>Delete node</button>
    </aside>
  )
}
