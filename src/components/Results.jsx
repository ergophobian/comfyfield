const ratio = (a) => a.replace(':', ' / ')

export default function Results({ items, error }) {
  return (
    <>
      {error && <div className="error">{error}</div>}
      <div className="results">
        {items.map((it) => (
          <div key={it.id} className={`result${it.pending ? ' pending' : ''}`} style={{ '--ar': ratio(it.aspect) }}>
            {it.pending ? <span>Rendering in ComfyUI</span>
              : it.kind === 'video' ? <video src={it.url} autoPlay loop muted playsInline />
              : <a href={it.url} target="_blank" rel="noreferrer"><img src={it.url} alt={it.caption} /></a>}
            {!it.pending && <div className="result-cap">{it.caption}</div>}
          </div>
        ))}
      </div>
    </>
  )
}
