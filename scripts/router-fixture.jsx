import React from 'react'
import { createRoot } from 'react-dom/client'
import { useGenerations } from '../src/lib/useGenerations.js'
import { models } from '../src/lib/catalog.js'

function Fixture() {
  const gens = useGenerations()
  const model = models.find((m) => m.id === 'comfy-router-flux')
  return <main>
    <button id="batch" onClick={() => gens.generate(model, { prompt: 'A quiet field at sunrise', aspect: '1:1', count: 3 })}>Generate three</button>
    <button id="retry" disabled={!gens.retry} onClick={gens.retry}>Retry</button>
    <output id="items">{JSON.stringify(gens.items)}</output>
    <output id="error">{gens.error}</output>
  </main>
}
createRoot(document.getElementById('root')).render(<Fixture />)
