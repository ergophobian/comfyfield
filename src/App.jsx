import { Routes, Route, NavLink, Link } from 'react-router-dom'
import Create from './pages/Create.jsx'
import Library from './pages/Library.jsx'
import Connections from './pages/Connections.jsx'
import Models from './pages/Models.jsx'
import { useGenerations } from './lib/useGenerations.js'
import { usePicker } from './lib/usePicker.js'

export default function App() {
  // Lifted here so a render keeps going when you switch tabs.
  const gens = useGenerations()
  const picker = usePicker()
  return (
    <>
      <div className="sky" aria-hidden="true"><i /><i /><i /><i /><i /></div>
      <header className="nav">
        <Link to="/" className="brand"><img src="/logo.svg" alt="" />ComfyField</Link>
        <nav className="tabs">
          <NavLink to="/" end>Create</NavLink>
          <NavLink to="/models">Models</NavLink>
          <NavLink to="/library">Library</NavLink>
          <NavLink to="/connections">Connections</NavLink>
        </nav>
        <a className="btn-soft nav-right" href="https://github.com/ergophobian/comfyfield" target="_blank" rel="noreferrer">GitHub ›</a>
      </header>
      <Routes>
        <Route path="/" element={<Create gens={gens} picker={picker} />} />
        <Route path="/models" element={<Models picker={picker} />} />
        <Route path="/library" element={<Library gens={gens} />} />
        <Route path="/connections" element={<Connections />} />
      </Routes>
    </>
  )
}
