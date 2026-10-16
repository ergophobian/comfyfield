import { Routes, Route, NavLink, Link } from 'react-router-dom'
import Explore from './pages/Explore.jsx'
import Create from './pages/Create.jsx'
import Effects from './pages/Effects.jsx'
import Cinema from './pages/Cinema.jsx'

const links = [
  { to: '/', label: 'Explore', end: true },
  { to: '/image', label: 'Image' },
  { to: '/video', label: 'Video' },
  { to: '/effects', label: 'Effects', badge: 'New' },
  { to: '/cinema', label: 'Cinema studio' },
]

export default function App() {
  return (
    <>
      <header className="nav">
        <Link to="/" className="brand"><img src="/logo.svg" alt="" />ComfyField</Link>
        <nav className="nav-links">
          {links.map((l) => (
            <NavLink key={l.to} to={l.to} end={l.end}>
              {l.label}{l.badge && <span className="badge">{l.badge}</span>}
            </NavLink>
          ))}
        </nav>
        <div className="nav-cta">
          <a className="btn btn-ghost" href="https://github.com/ergophobian/comfyfield" target="_blank" rel="noreferrer">GitHub</a>
          <Link className="btn btn-accent" to="/image">Start creating</Link>
        </div>
      </header>
      <Routes>
        <Route path="/" element={<Explore />} />
        <Route path="/image" element={<Create key="image" mode="image" />} />
        <Route path="/video" element={<Create key="video" mode="video" />} />
        <Route path="/effects" element={<Effects />} />
        <Route path="/cinema" element={<Cinema />} />
      </Routes>
    </>
  )
}
