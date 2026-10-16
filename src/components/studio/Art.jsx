// Simple line illustrations for studio cards: camera bodies, character types and light setups.
const line = { fill: 'none', stroke: 'currentColor', strokeWidth: 1.6, strokeLinecap: 'round', strokeLinejoin: 'round' }

const cameras = {
  modern: (
    <>
      <rect x="10" y="20" width="34" height="22" rx="3" />
      <rect x="44" y="24" width="12" height="14" rx="2" />
      <circle cx="60" cy="31" r="7" />
      <path d="M16 20v-5h14v5M15 48h24M27 42v6" />
    </>
  ),
  dv: (
    <>
      <rect x="12" y="22" width="34" height="18" rx="6" />
      <path d="M46 26h8l6-4v18l-6-4h-8" />
      <path d="M18 22c0-6 4-9 10-9h12M20 40v6h16" />
      <rect x="18" y="27" width="10" height="7" rx="1.5" />
    </>
  ),
  film: (
    <>
      <circle cx="22" cy="16" r="8" />
      <circle cx="40" cy="16" r="8" />
      <rect x="12" y="24" width="36" height="20" rx="3" />
      <path d="M48 30h8l6-4v16l-6-4h-8M22 44v6M38 44v6" />
    </>
  ),
  super8: (
    <>
      <rect x="16" y="18" width="28" height="18" rx="4" />
      <path d="M44 22h10l6-3v16l-6-3H44M26 36l-4 14h8l2-14M20 18v-4h10" />
    </>
  ),
  phone: (
    <>
      <rect x="24" y="8" width="24" height="44" rx="5" />
      <circle cx="31" cy="16" r="3" />
      <path d="M33 46h6" />
    </>
  ),
}

export function CameraArt({ kind = 'modern' }) {
  return <svg className="sa-art" viewBox="0 0 72 60" aria-hidden="true" {...line}>{cameras[kind] || cameras.modern}</svg>
}

// Character type tiles for the influencer builder: three human grades and six animals.
const heads = {
  average: <><circle cx="30" cy="22" r="11" /><path d="M14 54c2-11 8-17 16-17s14 6 16 17" /><path d="M26 22h.01M34 22h.01M27 27c2 1.5 4 1.5 6 0" /></>,
  bold: <><path d="M17 22c0-9 6-14 13-14s13 5 13 14c0 7-5 13-13 13s-13-6-13-13Z" /><path d="M10 54c3-12 10-17 20-17s17 5 20 17" /><path d="M24 21l4 1M36 21l-4 1M26 28h8" /></>,
  extreme: <><path d="M18 30c-4-14 4-24 12-24s16 10 12 24c-2 6-6 8-12 8s-10-2-12-8Z" /><path d="M8 54c4-10 12-15 22-15s18 5 22 15" /><circle cx="25" cy="22" r="3" /><circle cx="35" cy="22" r="3" /><path d="M25 31c3 2 7 2 10 0" /></>,
  insect: <><circle cx="30" cy="26" r="10" /><path d="M24 17c-3-6-7-8-10-8M36 17c3-6 7-8 10-8" /><circle cx="25" cy="25" r="3" /><circle cx="35" cy="25" r="3" /><path d="M20 40l-8 12M30 36v18M40 40l8 12" /></>,
  frog: <><path d="M12 34c0-10 8-16 18-16s18 6 18 16-8 14-18 14-18-4-18-14Z" /><circle cx="20" cy="18" r="5" /><circle cx="40" cy="18" r="5" /><path d="M20 38c6 4 14 4 20 0" /></>,
  cat: <><path d="M16 30c0-9 6-15 14-15s14 6 14 15-6 15-14 15-14-6-14-15Z" /><path d="M18 22 16 8l10 8M42 22l2-14-10 8" /><path d="M25 29h.01M35 29h.01M28 35l2 2 2-2M18 34l-8-1M42 34l8-1" /></>,
  dog: <><path d="M18 22c0-7 5-12 12-12s12 5 12 12v12c0 7-5 12-12 12s-12-5-12-12V22Z" /><path d="M18 20c-6 0-8 8-6 16l6-4M42 20c6 0 8 8 6 16l-6-4" /><path d="M25 26h.01M35 26h.01M27 35c2 2 4 2 6 0M30 31v4" /></>,
  rodent: <><circle cx="17" cy="16" r="7" /><circle cx="43" cy="16" r="7" /><path d="M16 32c0-9 6-14 14-14s14 5 14 14-6 16-14 16-14-7-14-16Z" /><path d="M25 30h.01M35 30h.01M28 40h4M30 40v4" /></>,
  bird: <><circle cx="30" cy="26" r="13" /><path d="M30 28l8 4-8 4" /><path d="M24 22h.01M36 22h.01M30 13c-2-4 0-7 4-7" /><path d="M20 52l4-13M40 52l-4-13" /></>,
}

export function TypeArt({ kind = 'average' }) {
  return <svg className="sa-art" viewBox="0 0 60 60" aria-hidden="true" {...line}>{heads[kind] || heads.average}</svg>
}

// A light diagram: a subject in the middle and a light at (x, y). Custom light passes its own color.
export function LightArt({ light, color, glow = 50, strength = 70 }) {
  const style = {
    '--lx': `${light.x}%`, '--ly': `${light.y}%`,
    '--glow': `${30 + glow * 0.5}%`, '--power': strength / 100,
    ...(color ? { '--lc': color } : {}),
  }
  return (
    <span className={`sa-light${light.back ? ' back' : ''}${light.second ? ' two' : ''}${color ? ' tinted' : ''}`} style={style} aria-hidden="true">
      <i />
    </span>
  )
}

export function Swatches({ colors, size }) {
  if (!colors?.length) return <span className={`sa-swatches auto${size ? ` ${size}` : ''}`} aria-hidden="true" />
  return (
    <span className={`sa-swatches${size ? ` ${size}` : ''}`} aria-hidden="true">
      {colors.map((c, i) => <b key={i} style={{ background: c }} />)}
    </span>
  )
}
