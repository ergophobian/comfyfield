import { useEffect } from 'react'
import { Link, useLocation, useParams } from 'react-router-dom'
import FormatWorkspace from '../components/formats/Workspace.jsx'
import { formatById, isWired } from '../lib/formats/index.js'

// Any format as its own page: the format in a card in the middle, its settings in a panel on the right.
export default function AppPage() {
  const { id } = useParams()
  const { pathname } = useLocation()
  const motion = pathname.startsWith('/motion')
  const found = formatById(id)
  const format = found && isWired(found) ? found : null
  const home = motion ? { to: '/motion', name: 'Motion presets' } : { to: '/apps', name: 'Apps' }
  // Cards at the foot of the page open another app, which should start at its top.
  useEffect(() => { window.scrollTo(0, 0) }, [id])

  return (
    <main className="app-page">
      <nav className="crumbs rise" aria-label="Breadcrumb">
        <Link to={home.to}>{home.name}</Link>
        <span aria-hidden="true">/</span>
        <span aria-current="page">{format ? format.name : 'Not found'}</span>
      </nav>
      {format ? <FormatWorkspace key={format.id} format={format} motion={motion} /> : (
        <div className="empty glass rise">
          <strong>Nothing lives at this address.</strong>
          <p>The {motion ? 'preset' : 'app'} may have been renamed or removed.</p>
          <Link className="btn-blue sm" to={home.to}>Browse {home.name.toLowerCase()}</Link>
        </div>
      )}
    </main>
  )
}
