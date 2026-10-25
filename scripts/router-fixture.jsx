import React, { useRef, useState } from 'react'
import { createRoot } from 'react-dom/client'
import { useGenerations } from '../src/lib/useGenerations.js'
import { BrowserRouter } from 'react-router-dom'
import { FormatSheet } from '../src/components/Formats.jsx'
import { models } from '../src/lib/catalog.js'
import Results from '../src/components/Results.jsx'

const format = {
  id: 'hook-runner', name: 'Hook runner', job: 'photo', cover: '/mock-result.png', shape: 'preset', kind: 'image',
  inputs: [{ id: 'subject', type: 'text', label: 'Subject' }],
  steps: [{ id: 'generate', model: 'comfy-router-photon', kind: 'image', prompt: '{subject}' }],
  outputs: [{ step: 'generate', kind: 'image' }],
}

function Fixture() {
  const gens = useGenerations()
  const [sheet, setSheet] = useState(false)
  const session = useRef(null)
  const concurrent = useRef([])
  const model = models.find((m) => m.id === 'comfy-router-flux')
  return <main style={{ overflowWrap: 'anywhere' }}>
    <button id="create-failure" onClick={() => gens.generate(model, { prompt: 'Create failure', aspect: '1:1' })}>Fail Create</button>
    <button id="ambiguous-failure" onClick={() => gens.generate(model, { prompt: 'Ambiguous failure', aspect: '1:1' })}>Fail ambiguously</button>
    <button id="saturate" onClick={() => {
      for (let i = 0; i < 3; i++) gens.generate(model, { prompt: 'Hold queue', aspect: '1:1' })
    }}>Fill queue</button>
    <button id="cancel-format" onClick={() => {
      gens.generateFormat({ ...format, steps: [{ ...format.steps[0], takes: 2 }] }, { subject: 'Cancel format' }, {
        concurrency: 1, onSession: (current) => { session.current = current },
      }).catch(() => {})
    }}>Generate cancellable takes</button>
    <button id="writer-sheet" onClick={() => setSheet(true)}>Open writer sheet</button>
    {sheet && <FormatSheet format={{ ...format, writer: 'Write a fixture prompt' }} gens={gens} connections={{ comfy: { connected: true } }} initial={{ subject: 'Sheet writer' }} onClose={() => setSheet(false)} />}
    <button id="batch" onClick={() => gens.generate(model, { prompt: 'A quiet field at sunrise', aspect: '1:1', count: 3 })}>Generate three</button>
    <button id="cancel" disabled={!gens.items.some((i) => i.pending && i.jobs?.length)} onClick={() => gens.cancel(gens.items.find((i) => i.pending).id)}>Cancel run</button>
    <button id="retry" disabled={!gens.retry} onClick={gens.retry}>Retry</button>
    <button id="concurrent" onClick={() => {
      for (const subject of ['First concurrent shot', 'Second concurrent shot']) {
        gens.generateFormat(format, { subject }, { onSession: (current) => { concurrent.current.push(current) } }).catch(() => {})
      }
    }}>Generate separate shots</button>
    <button id="format-failure" onClick={() => {
      gens.generateFormat({ ...format, steps: [{ ...format.steps[0], takes: 3 }] }, { subject: 'Library failure' }, {
        concurrency: 1, onSession: (current) => { session.current = current },
      }).catch(() => {})
    }}>Generate failing takes</button>
    <button id="writer-failure" onClick={() => {
      gens.generateFormat({ ...format, writer: 'Write a fixture prompt' }, { subject: 'Writer retry' }, {
        onSession: (current) => { session.current = current },
      }).catch(() => {})
    }}>Write a prompt</button>
    <button id="writer-send" onClick={() => session.current?.sendWriter('writer').catch(() => {})}>Send writer</button>
    <button id="retry-first-failed" disabled={!gens.items.some((i) => i.failed && i.retry)} onClick={() => gens.items.find((i) => i.failed && i.retry)?.retry()}>Retry failed item</button>
    <button id="format-retry" onClick={() => session.current?.retryFailed().catch(() => {})}>Retry failed takes</button>
    <output id="sessions">{JSON.stringify(concurrent.current.map((current) => ({ id: current.id, busy: current.busy, files: current.results().length })))}</output>
    <output id="session">{JSON.stringify(session.current && { id: session.current.id, busy: session.current.busy, failed: session.current.failures.length })}</output>
    <output id="busy">{String(gens.busy)}</output>
    <output id="items">{JSON.stringify(gens.items)}</output>
    <output id="error">{gens.error}</output>
    <Results items={gens.items.filter((item) => item.restoreNote || item.retryMayCharge)} />
  </main>
}
createRoot(document.getElementById('root')).render(<BrowserRouter><Fixture /></BrowserRouter>)
