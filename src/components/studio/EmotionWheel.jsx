import { emotions, intensities } from './cinema.js'

// Eight emotions around a ring; the middle clears back to neutral.
export default function EmotionWheel({ name, value, intensity = 'clear', onChange }) {
  const pick = emotions.find((e) => e.id === value)
  const radius = 84
  return (
    <div className="sa-emo-wrap">
      <div className="sa-emo" role="radiogroup" aria-label={`How ${name} feels`}>
        {emotions.map((e, k) => {
          const a = (k / emotions.length) * Math.PI * 2
          const on = value === e.id
          return (
            <button key={e.id} type="button" role="radio" aria-checked={on} className={`sa-emo-item${on ? ' on' : ''}`}
              style={{ '--x': `${Math.round(Math.sin(a) * radius)}px`, '--y': `${Math.round(-Math.cos(a) * radius)}px` }}
              onClick={() => onChange({ emotion: e.id, intensity })}>
              {e.label}
            </button>
          )
        })}
        <button type="button" className={`sa-emo-core${pick ? '' : ' on'}`} aria-pressed={!pick} onClick={() => onChange({ emotion: null, intensity })}>
          <small>{name}</small>
          <strong>{pick ? pick.label : 'Neutral'}</strong>
        </button>
      </div>
      <div className="pills" role="group" aria-label="Intensity">
        {intensities.map((x) => (
          <button key={x.id} type="button" aria-pressed={intensity === x.id} disabled={!pick}
            className={intensity === x.id ? 'on' : ''} onClick={() => onChange({ emotion: value, intensity: x.id })}>
            {x.label}
          </button>
        ))}
      </div>
    </div>
  )
}
