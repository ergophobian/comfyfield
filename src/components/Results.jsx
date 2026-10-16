const ratio = (a) => (a || '1:1').replace(':', ' / ')

export default function Results({ items }) {
  return (
    <div className="results">
      {items.map((it) => (
        <div key={it.id} className={`result glass${it.pending ? ' pending' : ''}${it.kind === 'audio' ? ' audio' : ''}`}
          style={{ '--ar': it.kind === 'audio' ? '2 / 1' : ratio(it.aspect) }}>
          {it.pending ? <span>Rendering with {it.model}</span>
            : it.kind === 'video' ? <video src={it.url} autoPlay loop muted playsInline controls />
            : it.kind === 'audio' ? <div className="audio-card"><p>{it.caption}</p><audio src={it.url} controls /></div>
            : <a href={it.url} target="_blank" rel="noreferrer"><img src={it.url} alt={it.caption} /></a>}
          {!it.pending && it.kind !== 'audio' && <div className="result-cap">{it.model} · {it.caption}</div>}
        </div>
      ))}
    </div>
  )
}
