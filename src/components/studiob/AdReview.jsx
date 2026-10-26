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
          <p className="sheet-note">Edit the concept, headline, call to action and script before rendering. Include every approved product fact here: imported descriptions and the original brief are not sent to rendering. Check every claim and confirm your rights to the assets below.</p>
          <div className="field">
            <label htmlFor={`${studio.id}-script`}>Concepts and script</label>
            <textarea id={`${studio.id}-script`} aria-label="Concepts and script" rows={8} value={studio.script} disabled={studio.busy || studio.rendered} onChange={(e) => studio.setScript(e.target.value)} />
          </div>
          <label className="ad-rights">
            <input type="checkbox" checked={studio.rights} disabled={studio.busy} onChange={(e) => studio.setRights(e.target.checked)} />
            {config.recreate ? 'I own this ad or have permission' : "I own or have permission to use this brand's name, images and logo"}
          </label>
          {config.recreate && <p className="sheet-note">Also confirm permission to use your product and presenter photos. The render uses up to 81 source frames and scales the long edge to at most 848 px; length depends on the source frame rate.</p>}
          {!fresh && <p className="sheet-note">Inputs changed. Draft concepts again to use the new values.</p>}
          <button type="button" className="btn-blue" disabled={studio.busy || studio.rendered || !fresh || !studio.rights || !studio.script.trim()} onClick={() => studio.approve(config)}>
            {studio.busy ? 'Rendering ads…' : studio.rendered ? failed.some((item) => item.formatRunId === studio.session.formatRunId) ? 'Batch finished with errors' : 'Saved to Assets' : 'Approve and render'}
          </button>
        </div>
      )}
      {studio.items.length > 0 && (
        <div className="sb-section" aria-label="Ad batch board">
          <div className="studio-sub"><h2>Your ad batch</h2><Link to="/assets">Open Assets</Link></div>
          {failed.map((item) => <div key={item.id}>
            <p className="sheet-error" role="alert">{item.failed}</p>
            {item.formatRunId === studio.session?.formatRunId && <button type="button" className="btn-soft" disabled={studio.busy || !fresh || !studio.rights} onClick={() => studio.retry(item, config)}>Retry render {item.stepId}</button>}
          </div>)}
          <Results items={files} />
          <div className="chips">
            {files.filter((item) => !item.pending).map((item, i) => <button key={item.id} type="button" className="btn-soft" aria-pressed={!!item.approved} onClick={() => studio.gens.toggleApprove(item.id)}>{item.approved ? 'Approved' : 'Approve result'} {i + 1}</button>)}
          </div>
        </div>
      )}
    </section>
  )
}
