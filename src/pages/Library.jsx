import { Link } from 'react-router-dom'
import Results from '../components/Results.jsx'

export default function Library({ gens }) {
  const done = gens.items.filter((i) => !i.pending)
  return (
    <main className="page">
      <div className="page-head">
        <h1>Library</h1>
        <p>Everything you have made, saved in this browser.</p>
      </div>
      {done.length ? <Results items={done} /> : (
        <div className="empty glass">
          <p>Nothing here yet.</p>
          <Link className="btn-blue" to="/">Start creating</Link>
        </div>
      )}
    </main>
  )
}
