import { useNavigate } from 'react-router-dom'
import { effects, gradient } from '../lib/catalog.js'

export function EffectGrid({ list = effects }) {
  const go = useNavigate()
  return (
    <div className="fx-grid">
      {list.map((fx, i) => (
        <div key={fx.id} className="fx-card" onClick={() => go('/video', { state: fx })}>
          <div className="tile" style={{ background: gradient(fx.hue, i), animationDelay: `-${i * 1.3}s` }}>
            <span className="btn btn-accent recreate">Recreate</span>
          </div>
          <div className="fx-meta">{fx.name}{fx.tag && <span className="chip-tag">{fx.tag}</span>}</div>
        </div>
      ))}
    </div>
  )
}

export default function Effects() {
  return (
    <main className="page">
      <div className="section-head" style={{ marginTop: 20 }}>
        <div>
          <h1 className="h1">Effects</h1>
          <p className="muted">Pick an effect, describe your subject, and get a clip worth sharing.</p>
        </div>
      </div>
      <EffectGrid />
    </main>
  )
}
