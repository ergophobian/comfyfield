import React, { useState } from 'react'
import { createRoot } from 'react-dom/client'
import { MemoryRouter } from 'react-router-dom'
import { Field } from '../src/components/formats/Fields.jsx'
import '../src/styles.css'
import './widget-fixture.css'

function Fixture() {
  const [values, setValues] = useState({})
  const [error, setError] = useState(null)
  return <MemoryRouter><main className="sb-page">
    <h1>Input widgets</h1>
    <p className="sheet-note">Local inputs for formats and Flows</p>
    <div className="sb-grid2">
      {[['mask', 'Mask painter'], ['face', 'Face picker'], ['video', 'Video input'], ['crop', 'Crop and reframe']].map(([type, label]) => <section className="widget-fixture glass" data-widget={type} key={type}>
        <Field input={{ id: type, type, label }} value={values[type]} onChange={(value) => setValues((v) => ({ ...v, [type]: value }))} setError={setError} />
      </section>)}
    </div>
    {error && <p role="alert">{error}</p>}
    <output className="sa-sr" data-values>{JSON.stringify(values)}</output>
  </main></MemoryRouter>
}

createRoot(document.getElementById('root')).render(<Fixture />)
