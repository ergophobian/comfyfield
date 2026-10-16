import { Routes, Route, Link, useLocation } from 'react-router-dom'
import NavTabs from './components/NavTabs.jsx'
import Create from './pages/Create.jsx'
import Library from './pages/Library.jsx'
import Connections from './pages/Connections.jsx'
import Flows from './pages/Flows.jsx'
import Models from './pages/Models.jsx'
import { useGenerations } from './lib/useGenerations.js'
import { usePicker } from './lib/usePicker.js'

export default function App() {
  // Lifted here so a render keeps going when you switch tabs.
  const gens = useGenerations()
  const picker = usePicker()
  const { pathname } = useLocation()
  return (
    <>
      <div className="sky" aria-hidden="true"><i /><i /><i /><i /><i /></div>
      <header className="nav">
        <Link to="/" className="brand"><img src="/logo.svg" alt="" />ComfyField</Link>
        <NavTabs />
        <a className="btn-soft nav-right" href="https://github.com/ergophobian/comfyfield" target="_blank" rel="noreferrer">GitHub ›</a>
      </header>
      <div className="route" key={pathname}>
      <Routes>
        <Route path="/" element={<Create gens={gens} picker={picker} />} />
        <Route path="/flows" element={<Flows picker={picker} />} />
        <Route path="/models" element={<Models picker={picker} />} />
        <Route path="/library" element={<Library gens={gens} />} />
        <Route path="/connections" element={<Connections />} />
      </Routes>
      </div>
    </>
  )
}
