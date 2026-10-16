import { toolById } from '../lib/tools.js'

// Placeholder for a tool page that is still being built.
export default function ToolStub({ id, name }) {
  const tool = toolById(id)
  return (
    <main className="page">
      <div className="page-head rise">
        <h1>{name || tool?.name || 'Coming soon'}</h1>
        <p>{tool?.blurb || 'This page is being built.'}</p>
      </div>
    </main>
  )
}
