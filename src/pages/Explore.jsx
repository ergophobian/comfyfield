import { Link } from 'react-router-dom'
import { featured, effects, gradient } from '../lib/catalog.js'
import { EffectGrid } from './Effects.jsx'
import { IconCamera, IconFilm, IconImage, IconNodes } from '../components/Icons.jsx'

const tools = [
  { icon: <IconFilm size={18} />, title: 'LTX video', body: 'Open-weights text to video', to: '/video' },
  { icon: <IconImage size={18} />, title: 'FLUX image', body: 'Prompt-faithful stills', to: '/image' },
  { icon: <IconCamera size={18} />, title: 'Camera moves', body: 'Dolly, crane, orbit and more', to: '/cinema' },
  { icon: <IconNodes size={18} />, title: 'Open workflows', body: 'Every tool is a ComfyUI graph', href: 'https://github.com/ergophobian/comfyfield/tree/main/public/workflows' },
]

const footer = {
  Create: [['Image', '/image'], ['Video', '/video'], ['Effects', '/effects'], ['Cinema studio', '/cinema']],
  Models: [['FLUX', '/image'], ['SDXL', '/image'], ['LTX video', '/video']],
  Project: [['GitHub', 'https://github.com/ergophobian/comfyfield'], ['Comfy', 'https://comfy.org'], ['Open source Higgsfield', 'https://comfy.org/open-source-higgsfield']],
}

function Tool({ icon, title, body, to, href }) {
  const inner = (
    <>
      <div className="tool-icon">{icon}</div>
      <div><h4>{title}</h4><p>{body}</p></div>
    </>
  )
  return href
    ? <a className="tool" href={href} target="_blank" rel="noreferrer">{inner}</a>
    : <Link className="tool" to={to}>{inner}</Link>
}

export default function Explore() {
  return (
    <>
      <main className="page">
        <section className="hero-row">
          {featured.map((f, i) => (
            <Link key={f.title} to={f.to} className="hero-card">
              <div className="tile" style={{ background: gradient(f.hue, i), animationDelay: `-${i * 3}s` }} />
              <h3>{f.title}</h3>
              <p>{f.body}</p>
            </Link>
          ))}
        </section>

        <section className="promo">
          <div className="tile promo-main" style={{ background: gradient([18, 40], 2) }}>
            <h2 className="h2">The open-source creative suite</h2>
            <p style={{ margin: 0, position: 'relative', zIndex: 1, maxWidth: 420 }}>
              Studio effects and cinematic camera moves, built on ComfyUI workflows you can run yourself.
            </p>
            <Link className="btn btn-accent" to="/video">Start generating</Link>
          </div>
          <div className="tool-stack">{tools.slice(0, 2).map((t) => <Tool key={t.title} {...t} />)}</div>
          <div className="tool-stack">{tools.slice(2).map((t) => <Tool key={t.title} {...t} />)}</div>
        </section>

        <section className="section">
          <div className="section-head">
            <div>
              <h2 className="h2">Effects</h2>
              <p className="muted" style={{ margin: '6px 0 0' }}>Tap one to recreate it with your own subject.</p>
            </div>
            <Link className="btn btn-ghost" to="/effects">View all</Link>
          </div>
          <EffectGrid list={effects.slice(0, 8)} />
        </section>
      </main>
      <footer className="footer">
        <div className="brand"><img src="/logo.svg" alt="" />ComfyField</div>
        {Object.entries(footer).map(([h, ls]) => (
          <div key={h}>
            <h5>{h}</h5>
            {ls.map(([l, to]) => to.startsWith('http')
              ? <a key={l} href={to} target="_blank" rel="noreferrer">{l}</a>
              : <Link key={l} to={to}>{l}</Link>)}
          </div>
        ))}
      </footer>
    </>
  )
}
