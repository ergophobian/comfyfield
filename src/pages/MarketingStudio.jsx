import { useMemo, useState } from 'react'
import Segmented from '../components/Segmented.jsx'
import { Chip, Option } from '../components/Composer.jsx'
import { Field } from '../components/formats/Fields.jsx'
import { IconAspect, IconClock, IconSpark, IconClose } from '../components/Icons.jsx'
import AdProductPhotos from '../components/studiob/AdProductPhotos.jsx'
import { adAspects } from '../lib/adStudio.js'
import AdAudio from '../components/studiob/AdAudio.jsx'
import AdReview from '../components/studiob/AdReview.jsx'
import { useAdStudio } from '../lib/useAdStudio.js'
import { Colors } from '../components/studiob/Inputs.jsx'
import { useLibrary } from '../lib/useLibrary.js'
import { Hero, Slot, Stepper, Tiles, Empty, coverAt, stagger } from '../components/studiob/Kit.jsx'

const runsOn = 'Qwen-Image Edit 2511 for images and MiniMax H3 for video'

// Styles per template category. Image categories make stills, the rest make video.
const groups = [
  { id: 'product', name: 'Product shot', kind: 'image', styles: ['Close up', 'Hands only', 'Full body', 'Editorial', 'Creator style', 'White studio', 'Color pop', 'Natural light', 'In use'] },
  { id: 'motion', name: 'Motion', kind: 'video', styles: ['Flat product motion', 'Fast motion', 'Kinetic type', 'Dark minimal', 'Color burst', 'Mixed media', 'App promo'] },
  { id: 'ugc', name: 'Creator video', kind: 'video', styles: ['Shopping haul', 'At home', 'Delivery day', 'Honest review', 'Try on', 'Unboxing', 'How to', 'Before and after'] },
  { id: 'social', name: 'Social', kind: 'video', styles: ['Three reasons', 'Green screen story', 'Day in the life'] },
  { id: 'ads', name: 'Ads', kind: 'image', styles: ['Social proof', 'Side by side', 'Problem and fix'] },
  { id: 'posters', name: 'Posters', kind: 'image', styles: ['Big type', 'Seasonal drop', 'Event'] },
  { id: 'market', name: 'Marketplace', kind: 'image', styles: ['Dark', 'Surreal 3D', 'Bright color', 'Pastel', 'Clean studio'] },
]
const groupOf = (id) => groups.find((g) => g.id === id)

const templates = [
  ['Marble morning', 'product', 'Natural light', '4:5'],
  ['Water ripple', 'product', 'Close up', '1:1'],
  ['Shadow play', 'product', 'Editorial', '3:4'],
  ['Hand held', 'product', 'Hands only', '4:5'],
  ['Slow spin', 'motion', 'Flat product motion', '9:16'],
  ['Splash freeze', 'motion', 'Fast motion', '9:16'],
  ['Kinetic headline', 'motion', 'Kinetic type', '16:9'],
  ['Exploded parts', 'motion', 'Dark minimal', '1:1'],
  ['Morning routine', 'ugc', 'At home', '9:16'],
  ['First try reaction', 'ugc', 'Honest review', '9:16'],
  ['Desk review', 'ugc', 'How to', '9:16'],
  ['Three reasons why', 'social', 'Three reasons', '9:16'],
  ['Story behind it', 'social', 'Green screen story', '9:16'],
  ['Five star wall', 'ads', 'Social proof', '1:1'],
  ['Us versus them', 'ads', 'Side by side', '4:5'],
  ['Before the fix', 'ads', 'Problem and fix', '1:1'],
  ['Big type launch', 'posters', 'Big type', '2:3'],
  ['Seasonal drop', 'posters', 'Seasonal drop', '2:3'],
  ['Clean listing', 'market', 'Clean studio', '1:1'],
  ['Feature callouts', 'market', 'Bright color', '1:1'],
].map(([name, group, style, aspect], i) => ({ id: `t${i}`, label: name, group, style, aspect, note: groupOf(group).name, cover: coverAt(i + 1) }))

const aspects = adAspects
const lengths = [5, 8, 10, 15]
const platforms = ['TikTok', 'Reels', 'Shorts', 'Feed', 'Website']
const shots = ['Hero shot', 'Lifestyle', 'Detail', 'With a model']

// Scene arcs for the storyboard, split evenly across the chosen length.
const arcs = {
  ugc: [['Hook to camera', 'A creator looks into the lens and opens with the problem {product} solves.'], ['Show it', '{product} comes into frame, held close so the label reads.'], ['Use it', 'The creator uses {product} the way {audience} would.'], ['Reaction', 'An honest reaction to the result.'], ['Call to action', 'Where to get {product}, said to camera.']],
  motion: [['Reveal', '{product} slides into a clean frame with a soft light sweep.'], ['Detail pass', 'Macro moves across the texture and the label of {product}.'], ['Hero turn', '{product} turns to its best angle as the background shifts to the brand colors.'], ['Logo and offer', 'The logo settles with the offer line for {audience}.']],
  social: [['Hook line', 'Big on-screen text asks the question {audience} cares about.'], ['First reason', 'The first reason to choose {product}, shown in use.'], ['Second reason', 'A close up that proves the second point.'], ['Third reason', 'A quick before and after.'], ['Call to action', 'The product, the price and where to buy.']],
}

function storyboard(group, seconds) {
  const arc = arcs[group] || arcs.motion
  const each = seconds / arc.length
  return arc.map(([title, text], i) => {
    const from = Math.round(i * each * 2) / 2
    const to = i === arc.length - 1 ? seconds : Math.round((i + 1) * each * 2) / 2
    return { title, text, time: `${from} to ${to} s` }
  })
}

export default function MarketingStudio() {
  const studio = useAdStudio('marketing-studio')
  const lib = useLibrary()
  const [foundProduct, setFoundProduct] = useState(null)
  const [foundBrand, setFoundBrand] = useState(null)
  const [kind, setKind] = useState('video')
  const [brief, setBrief] = useState('')
  const [group, setGroup] = useState('ugc')
  const [style, setStyle] = useState('At home')
  const [aspect, setAspect] = useState('9:16')
  const [length, setLength] = useState(15)
  const [platform, setPlatform] = useState('TikTok')
  const [audience, setAudience] = useState('')
  const [count, setCount] = useState(1)
  const [avatar, setAvatar] = useState(null)
  const [product, setProduct] = useState(null)
  const [link, setLink] = useState('')
  const [brand, setBrand] = useState(null)
  const [template, setTemplate] = useState(null)
  const [filter, setFilter] = useState('all')
  const [media, setMedia] = useState('all')
  const [edits, setEdits] = useState({})
  const [voiceover, setVoiceover] = useState(null)

  const g = groupOf(group)
  const selectedProduct = product ? { ...lib.products.find((p) => p.id === product.id), ...product } : foundProduct
  const selectedBrand = brand ? { ...lib.brands.find((b) => b.id === brand.id), ...brand } : foundBrand
  const productName = selectedProduct?.name || (link.trim() ? 'the product from your link' : 'your product')
  const fill = (s) => {
    const t = s.replaceAll('{product}', productName).replaceAll('{audience}', audience.trim() || 'your audience')
    return t[0].toUpperCase() + t.slice(1)
  }
  const scenes = useMemo(() => storyboard(group, length), [group, length])
  const boardKey = `${group}-${length}`

  const pickStyle = (gid, s) => {
    setGroup(gid)
    setStyle(s)
    setKind(groupOf(gid).kind)
    setTemplate(null)
  }
  const switchKind = (k) => {
    setKind(k)
    if (g.kind === k) return
    const first = groups.find((x) => x.kind === k)
    pickStyle(first.id, first.styles[0])
  }
  const applyTemplate = (id) => {
    const t = templates.find((x) => x.id === id)
    setTemplate(t)
    setGroup(t.group)
    setStyle(t.style)
    setKind(groupOf(t.group).kind)
    setAspect(t.aspect)
    const calm = window.matchMedia?.('(prefers-reduced-motion: reduce)').matches
    window.scrollTo({ top: 0, behavior: calm ? 'auto' : 'smooth' })
  }
  const shown = templates.filter((t) => (filter === 'all' || t.group === filter)
    && (media === 'all' || groupOf(t.group).kind === media))
  const setScene = (i, text) => setEdits((e) => ({ ...e, [`${boardKey}-${i}`]: text }))
  const config = { product: selectedProduct, brand: selectedBrand, character: avatar, kind, count, aspects: [aspect], duration: length, voiceover: kind === 'video' ? voiceover : null, brief, group, style, platform, audience, template: template?.label, link, scenes: kind === 'video' ? scenes.map((scene, i) => ({ ...scene, text: edits[`${boardKey}-${i}`] ?? fill(scene.text) })) : Array.from({ length: count }, (_, i) => edits[`shot-${i}`] ?? fill(`${shots[i]} of {product}, ${style.toLowerCase()}, for {audience}.`)) }
  const noun = kind === 'video' ? (count === 1 ? 'video' : 'videos') : (count === 1 ? 'image' : 'images')

  return (
    <main className="sb-page">
      <Hero badge="Marketing studio" title="Turn one product into posts, ads and videos"
        sub="Start from a template or a brief, connect your product and brand, and get content that is ready to post." />

      <div className="sb-fan" aria-label="Jump to a template category">
        {['social', 'ugc', 'product', 'motion', 'ads'].map((id, i) => (
          <button key={id} type="button" className={`sb-fan-card rise${filter === id ? ' on' : ''}`} style={{ ...stagger(i), background: coverAt(i + 3) }}
            aria-pressed={filter === id} onClick={() => { setFilter(id); document.getElementById('mk-templates')?.scrollIntoView({ block: 'start' }) }}>
            <span>{groupOf(id).name}</span>
          </button>
        ))}
      </div>

      <section className="sb-box glass" aria-label="Import a product">
        <div className="import">
          <input aria-label="Product page link" value={link} onChange={(e) => setLink(e.target.value)} placeholder="https://yourshop.com/products/linen-tote" />
          <button type="button" className="btn-blue sm" disabled={studio.busy || !link.trim()} onClick={() => studio.readPage(link, (data) => { setFoundProduct(data.product); setFoundBrand(data.brand); setProduct(null); setBrand(null) })}>{studio.busy ? 'Reading…' : 'Read page'}</button>
        </div>
        {foundProduct && !product && <div className="sb-grid2">
          <Field input={{ id: 'found-name', type: 'text', label: 'Product name' }} value={foundProduct.name} onChange={(name) => setFoundProduct((p) => ({ ...p, name }))} />
          <Field input={{ id: 'found-brand', type: 'text', label: 'Brand name' }} value={foundBrand?.name || ''} onChange={(name) => setFoundBrand((b) => ({ ...b, name }))} />
          <Field input={{ id: 'found-description', type: 'longtext', label: 'Product description' }} value={foundProduct.description} onChange={(description) => setFoundProduct((p) => ({ ...p, description }))} />
          <Field input={{ id: 'found-price', type: 'text', label: 'Price' }} value={foundProduct.price} onChange={(price) => setFoundProduct((p) => ({ ...p, price }))} />
          <Colors value={foundBrand?.colors || []} onChange={(colors) => setFoundBrand((b) => ({ ...b, colors }))} />
        </div>}
      </section>
      {selectedProduct && <AdProductPhotos value={selectedProduct.images || []} onChange={(images) => { setProduct(null); setFoundProduct({ ...selectedProduct, images }) }} />}
      <form className="composer glass sb-compose" onSubmit={(e) => e.preventDefault()}>
        <div className="composer-inner">
          <div className="composer-top">
            <Segmented value={kind} onChange={switchKind}
              options={[{ value: 'image', label: 'Image' }, { value: 'video', label: 'Video' }]} />
            {template && (
              <span className="ref">
                Template: {template.label}
                <button type="button" onClick={() => setTemplate(null)} aria-label="Clear template"><IconClose /></button>
              </span>
            )}
          </div>
          <div className="sb-compose-row">
            <textarea rows={3} value={brief} onChange={(e) => setBrief(e.target.value)} aria-label="Brief"
              placeholder={kind === 'video' ? 'Describe the ad: what happens, the hook and the offer' : 'Describe the shot or the post you want'} />
            <div className="sb-slots">
              <Slot label="Avatar" value={avatar?.name} image={avatar?.images?.[0]}>
                {(close) => <Field input={{ id: 'avatar', type: 'character', label: 'Avatar or saved character' }} value={avatar} onChange={(v) => { setAvatar(v); close() }} />}
              </Slot>
              <Slot label="Product" value={selectedProduct?.name} image={selectedProduct?.images?.[0]}>
                {() => (
                  <>
                    <Field input={{ id: 'product', type: 'product', label: 'Saved product' }} value={product} onChange={setProduct} />
                    <Field input={{ id: 'photo', type: 'image', label: 'Or upload a product photo' }} value={foundProduct?.images?.[0] ? { url: foundProduct.images[0] } : null} onChange={(photo) => { setProduct(null); setFoundProduct((p) => ({ name: p?.name || 'Your product', ...p, images: photo ? [photo.url] : [] })) }} />
                  </>
                )}
              </Slot>
              <Slot label="Brand" value={selectedBrand?.name} image={selectedBrand?.logo?.[0] || selectedBrand?.images?.[0]}>
                {(close) => <Field input={{ id: 'brand', type: 'brand', label: 'Brand kit' }} value={brand} onChange={(v) => { setBrand(v); close() }} />}
              </Slot>
            </div>
          </div>
          <div className="composer-foot">
            <div className="chips">
              <Chip icon={<IconSpark />} label={style} lit>
                {groups.filter((x) => x.kind === kind).map((x) => (
                  <div key={x.id}>
                    <h6>{x.name}</h6>
                    {x.styles.map((s) => <Option key={s} label={s} on={group === x.id && style === s} onClick={() => pickStyle(x.id, s)} />)}
                  </div>
                ))}
              </Chip>
              <Chip icon={<IconAspect />} label={aspect === 'auto' ? 'Auto' : aspect}>
                {aspects.map((a) => <Option key={a} label={a === 'auto' ? 'Auto' : a} on={aspect === a} onClick={() => setAspect(a)} />)}
              </Chip>
              {kind === 'video' && (
                <Chip icon={<IconClock />} label={`${length} s`}>
                  {lengths.map((s) => <Option key={s} label={`${s} seconds`} on={length === s} onClick={() => setLength(s)} />)}
                </Chip>
              )}
              <Chip label={platform}>
                <h6>Made for</h6>
                {platforms.map((p) => <Option key={p} label={p} on={platform === p} onClick={() => setPlatform(p)} />)}
              </Chip>
              <Chip label={audience.trim() ? `For ${audience.trim()}` : 'Audience'} lit={!!audience.trim()}>
                <div className="sb-chip-field">
                  <Field input={{ id: 'audience', type: 'text', label: 'Who is it for', placeholder: 'New parents on a budget' }} value={audience} onChange={setAudience} />
                </div>
              </Chip>
              <Stepper value={count} onChange={setCount} min={1} max={4} label="How many" noun={noun} />
            </div>
            <button type="button" className="btn-blue" disabled={studio.busy || !selectedProduct?.images?.length} onClick={() => studio.draft(config)}>{studio.busy ? 'Working…' : 'Draft concepts'}</button>
          </div>
        </div>
      </form>
      <p className="sb-wire muted">
        {count} {noun}{kind === 'video' ? `, ${length} s` : ''}, {aspect === 'auto' ? 'auto ratio' : aspect}, {g.name} template in the {style.toLowerCase()} style, for {platform}.
        {' '}Runs on {runsOn} on {studio.runType}. Review the concept before rendering. Drafting calls your prompt writer and may bill before render approval. Rendering starts after approval; a price estimate is unavailable. Creator styles use the presenter as a visual reference; dedicated voice cloning and lip sync belong to their formats.
      </p>

      <section className="sb-section">
        <div className="studio-sub">
          <h2>{kind === 'video' ? 'Storyboard' : 'Shot list'}</h2>
          <span className="muted">{kind === 'video' ? `${scenes.length} scenes from the ${style.toLowerCase()} style. Edit any scene before you generate.` : `${count} ${noun} in the ${style.toLowerCase()} style.`}</span>
          {Object.keys(edits).length > 0 && <button type="button" className="link-btn" onClick={() => setEdits({})}>Reset</button>}
        </div>
        <ol className="sb-board">
          {kind === 'video'
            ? scenes.map((s, i) => (
              <li key={`${boardKey}-${i}`} className="sb-scene glass rise" style={stagger(i)}>
                <span className="sb-scene-cover" style={{ background: coverAt(i + 4) }}><b>{i + 1}</b><em>{s.time}</em></span>
                <strong>{s.title}</strong>
                <textarea rows={3} aria-label={`Scene ${i + 1}`} value={edits[`${boardKey}-${i}`] ?? fill(s.text)} onChange={(e) => setScene(i, e.target.value)} />
              </li>
            ))
            : Array.from({ length: count }, (_, i) => (
              <li key={`shot-${i}`} className="sb-scene glass rise" style={stagger(i)}>
                <span className="sb-scene-cover" style={{ background: coverAt(i + 4) }}><b>{i + 1}</b><em>{aspect === 'auto' ? 'Auto' : aspect}</em></span>
                <strong>{shots[i]}</strong>
                <textarea rows={3} aria-label={`Image ${i + 1}`} value={edits[`shot-${i}`] ?? fill(`${shots[i]} of {product}, ${style.toLowerCase()}, for {audience}.`)}
                  onChange={(e) => setEdits((x) => ({ ...x, [`shot-${i}`]: e.target.value }))} />
              </li>
            ))}
        </ol>
      </section>

      {kind === 'video' && <div className="sb-box glass">
        <AdAudio value={voiceover} onChange={setVoiceover} />
        <p className="sheet-note">Stitch plays this narration once and pads the remaining ad with silence. Keep the recording within the chosen duration.</p>
      </div>}
      <AdReview studio={studio} config={config} />

      <section className="sb-section" id="mk-templates">
        <div className="studio-sub">
          <h2>Explore templates</h2>
          <span className="muted">Pick one to load its style and ratio, then connect your product.</span>
        </div>
        <div className="sb-filters">
          <Segmented value={filter} onChange={setFilter}
            options={[{ value: 'all', label: 'All' }, ...groups.map((x) => ({ value: x.id, label: x.name }))]} />
          <Segmented className="seg-sm" value={media} onChange={setMedia}
            options={[{ value: 'all', label: 'All' }, { value: 'image', label: 'Images' }, { value: 'video', label: 'Videos' }]} />
        </div>
        {shown.length
          ? <Tiles items={shown} value={template?.id} onChange={applyTemplate} label="Templates" />
          : <Empty title="No templates here yet">Try another category or switch the media filter.</Empty>}
      </section>
    </main>
  )
}
