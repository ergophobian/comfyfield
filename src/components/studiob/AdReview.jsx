import { Link } from 'react-router-dom'
import Results from '../Results.jsx'

export default function AdReview({ studio, config }) {
  const fresh = studio.current(config)
  const failed = studio.items.filter((item) => item.failed)
  const files = studio.items.filter((item) => !item.failed)
  return (
    <section className="sb-section ad-review" aria-label="Ad review">
      {studio.error && <p className="sheet-error" role="alert">{studio.error}</p>}
      {studio.session && (
        <div className="glass sb-box">
          <h2>Review concepts and script</h2>
          <p className="sheet-note">Edit the concept, headline, call to action and script before rendering. Check every claim against your product.</p>
          <div className="field">
            <label htmlFor={`${studio.id}-script`}>Concepts and script</label>
            <textarea id={`${studio.id}-script`} aria-label="Concepts and script" rows={8} value={studio.script} disabled={studio.busy || studio.rendered} onChange={(e) => studio.setScript(e.target.value)} />
          </div>
          {!fresh && <p className="sheet-note">Inputs changed. Draft concepts again to use the new values.</p>}
          <button type="button" className="btn-blue" disabled={studio.busy || studio.rendered || !fresh || !studio.script.trim()} onClick={() => studio.approve(config)}>
            {studio.busy ? 'Rendering ads…' : studio.rendered ? 'Saved to Library' : 'Approve and render'}
          </button>
        </div>
      )}
      {studio.items.length > 0 && (
        <div className="sb-section" aria-label="Ad batch board">
          <div className="studio-sub"><h2>Your ad batch</h2><Link to="/assets">Open Library</Link></div>
          {failed.map((item) => <p className="sheet-error" role="alert" key={item.id}>{item.failed}</p>)}
          <Results items={files} />
          <div className="chips">
            {files.filter((item) => !item.pending).map((item, i) => <button key={item.id} type="button" className="btn-soft" aria-pressed={!!item.approved} onClick={() => studio.gens.toggleApprove(item.id)}>{item.approved ? 'Approved' : 'Approve result'} {i + 1}</button>)}
          </div>
        </div>
      )}
    </section>
  )
}
