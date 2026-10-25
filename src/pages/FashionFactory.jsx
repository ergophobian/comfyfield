import { heroArt, presetArt } from '../lib/formats/art.js'
import { ArtImage } from '../components/Art.jsx'
import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { Chip, Option } from '../components/Composer.jsx'
import PhotoGrid from '../components/studio/PhotoGrid.jsx'
import { GoButton, NotWired } from '../components/studio/Shell.jsx'
import { TypeArt } from '../components/studio/Art.jsx'
import { IconAspect, IconClose, IconPlus, IconSpark } from '../components/Icons.jsx'
import { IconHanger, IconMask, IconMinus, IconGrid } from '../components/studio/icons.jsx'
import { fashionTemplates, lookbookShots, lookbookPoses, photoRatios, qualities } from '../components/studio/presets.js'
import { useApp } from '../lib/appContext.js'
import { useLibrary, toRef } from '../lib/useLibrary.js'
import { formatById } from '../lib/formats/index.js'

const runsOn = formatById('try-on')?.runsOn || 'open weights'
const also = ['try-on', 'product-shot', 'place-product'].map(formatById).filter(Boolean)

// Opens over the bar, as the studio does: an intro first, then the template grid.
function TemplateSheet({ value, onPick, onClose, intro }) {
  const [grid, setGrid] = useState(!intro)
  const [pick, setPick] = useState(value)
  useEffect(() => {
    const key = (e) => e.key === 'Escape' && onClose()
    window.addEventListener('keydown', key)
    return () => window.removeEventListener('keydown', key)
  }, [onClose])
  return (
    <div className="scrim" onPointerDown={(e) => e.target === e.currentTarget && onClose()}>
      <div className="ff-sheet glass pop" role="dialog" aria-label="Fashion factory templates">
        <button type="button" className="icon-btn ff-x" aria-label="Close" onClick={onClose}><IconClose /></button>
        {!grid ? (
          <div className="ff-intro">
            <span className="ff-art" aria-hidden="true">
              <ArtImage src={heroArt('fashion')} width={1600} height={900} />
              <i className="model"><TypeArt kind="average" /></i>
              <b><IconPlus /></b>
              <i className="item"><IconHanger /></i>
            </span>
            <h2>Fashion factory</h2>
            <p>Put your outfits and products on one consistent character and get a branded photoshoot, look after look.</p>
            <button type="button" className="btn-blue" onClick={() => setGrid(true)}>Pick a template</button>
          </div>
        ) : (
          <>
            <h2 className="ff-sheet-title">Pick a template</h2>
            <div className="ff-templates" role="group" aria-label="Templates">
              {fashionTemplates.map((t, i) => (
                <button key={t.id} type="button" aria-pressed={pick === t.id} className={`ff-template${pick === t.id ? ' on' : ''}`}
                  style={{ '--i': Math.min(i, 12) }} onClick={() => setPick(t.id)}>
                  <span className="ff-template-cover" style={{ background: t.cover }}><ArtImage src={presetArt('fashion', t.id)} /></span>
                  <strong>{t.name}</strong>
                  <small>{t.note}</small>
                </button>
              ))}
            </div>
            <div className="ff-sheet-foot">
              <button type="button" className="btn-soft" onClick={onClose}>Cancel</button>
              <button type="button" className="btn-blue sm" onClick={() => onPick(pick)}>Use this template</button>
            </div>
          </>
        )}
      </div>
    </div>
  )
}

export default function FashionFactory() {
  const lib = useLibrary()
  const { openFormat } = useApp()
  const [sheet, setSheet] = useState('intro')
  const [template, setTemplate] = useState('studio')
  const [character, setCharacter] = useState(null)
  const [outfits, setOutfits] = useState([])
  const [prompt, setPrompt] = useState('')
  const [shots, setShots] = useState('hero')
  const [pose, setPose] = useState('natural')
  const [ratio, setRatio] = useState('3:4')
  const [quality, setQuality] = useState('2k')
  const [enhance, setEnhance] = useState(true)
  const [batch, setBatch] = useState(4)
  const t = fashionTemplates.find((x) => x.id === template)
  const mix = lookbookShots.find((x) => x.id === shots)
  const looks = Array.from({ length: batch }, (_, k) => k)

  return (
    <main className="ff">
      <div className="ff-feed">
        <div className="ff-top rise">
          <button type="button" className="ff-chosen" onClick={() => setSheet('grid')}>
            <span style={{ background: t.cover }}><ArtImage src={presetArt('fashion', t.id)} /></span>
            <span>
              <small>Template</small>
              <strong>{t.name}</strong>
              <em>{t.note}</em>
            </span>
            <span className="link-btn">Change</span>
          </button>
          <div className="ff-also">
            <span className="muted">Also try</span>
            {also.map((f) => <button key={f.id} type="button" className="btn-soft xs" onClick={() => openFormat(f)}>{f.name}</button>)}
          </div>
        </div>
        <div className="ff-looks" style={{ '--ar': ratio.replace(':', ' / ') }}>
          {looks.map((k) => (
            <div key={k} className="ff-look" style={{ '--i': Math.min(k, 12) }}>
              <h3>Look {k + 1}</h3>
              <div className="ff-frames">
                {mix.frames.map((f) => <span key={f} className="pd-slot"><span>{f}</span></span>)}
              </div>
            </div>
          ))}
        </div>
        <p className="sa-hint ff-hint">Your lookbook lands in these frames once generating is wired: {batch} {batch === 1 ? 'look' : 'looks'}, {mix.frames.length} {mix.frames.length === 1 ? 'frame' : 'frames'} each.</p>
      </div>

      <div className="composer glass ff-bar">
        <div className="composer-inner">
          <PhotoGrid label="Outfits and products" value={outfits} setValue={setOutfits} max={4} small />
          <textarea value={prompt} onChange={(e) => setPrompt(e.target.value)} rows={2} aria-label="Scene"
            placeholder="Describe the scene, or just add photos of the outfit or product" />
          <div className="composer-foot">
            <div className="chips">
              <Chip icon={<IconGrid />} label={t.name}>
                <h6>Template</h6>
                {fashionTemplates.map((x) => <Option key={x.id} on={x.id === template} label={x.name} note={x.note} onClick={() => setTemplate(x.id)} />)}
              </Chip>
              <Chip icon={character?.images?.[0] ? <img className="ff-face" src={character.images[0]} alt="" /> : <IconMask />} label={character?.name || 'Character'} lit={!!character}>
                <h6>Character</h6>
                {lib.characters.map((c) => (
                  <Option key={c.id} on={character?.id === c.id} label={c.name}
                    onClick={() => setCharacter(character?.id === c.id ? null : toRef('character', c))} />
                ))}
                {lib.ready && !lib.characters.length && <Option disabled label="No characters yet" note="Create one in Character" />}
                <Link className="menu-foot link-btn" to="/character">New character</Link>
              </Chip>
              <Chip label={mix.label}>
                <h6>Shots per look</h6>
                {lookbookShots.map((x) => <Option key={x.id} on={x.id === shots} label={x.label} note={x.note} onClick={() => setShots(x.id)} />)}
              </Chip>
              <Chip label={lookbookPoses.find((x) => x.id === pose).label}>
                <h6>Pose</h6>
                {lookbookPoses.map((x) => <Option key={x.id} on={x.id === pose} label={x.label} onClick={() => setPose(x.id)} />)}
              </Chip>
              <Chip icon={<IconAspect />} label={ratio}>
                <h6>Aspect ratio</h6>
                {photoRatios.map((r) => <Option key={r} on={r === ratio} label={r} onClick={() => setRatio(r)} />)}
              </Chip>
              <Chip label={quality}>
                <h6>Quality</h6>
                {qualities.map((q) => <Option key={q} on={q === quality} label={q} onClick={() => setQuality(q)} />)}
              </Chip>
              <div className="chip">
                <button type="button" className={enhance ? 'lit' : ''} aria-pressed={enhance} title="Expand the prompt before it runs" onClick={() => setEnhance(!enhance)}>
                  <IconSpark />Enhance {enhance ? 'on' : 'off'}
                </button>
              </div>
              <div className="cs-batch" role="group" aria-label="Looks per run">
                <button type="button" aria-label="Fewer looks" disabled={batch <= 1} onClick={() => setBatch(batch - 1)}><IconMinus /></button>
                <span>{batch}/4</span>
                <button type="button" aria-label="More looks" disabled={batch >= 4} onClick={() => setBatch(batch + 1)}><IconPlus /></button>
              </div>
            </div>
            <GoButton />
          </div>
        </div>
      </div>
      <p className="ff-note">
        {!character && <span>Pick a character so every look has the same face. </span>}
        <NotWired runsOn={runsOn} />
      </p>

      {sheet && (
        <TemplateSheet intro={sheet === 'intro'} value={template} onClose={() => setSheet(null)}
          onPick={(id) => { setTemplate(id); setSheet(null) }} />
      )}
    </main>
  )
}
