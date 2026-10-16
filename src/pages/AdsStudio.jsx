import { useState } from 'react'
import Segmented from '../components/Segmented.jsx'
import { Field } from '../components/formats/Fields.jsx'
import { IconLink } from '../components/Icons.jsx'
import { Hero, Box, Pills, Cards, Stepper, Tiles, NotWired, ErrorNote, useParam, coverAt, stagger } from '../components/studiob/Kit.jsx'
import { Pictures, Colors } from '../components/studiob/Inputs.jsx'
import { useLibrary } from '../lib/useLibrary.js'
import { formatById } from '../lib/formats/index.js'

const tools = [
  { id: 'create', name: 'Create ads', blurb: 'On-brand ads for every product, many at a time.' },
  { id: 'multiplier', name: 'Ad multiplier', blurb: 'Remake a winning ad with your own product, cast and places.' },
]

const angles = [
  { id: 'offer', label: 'Price or offer', note: 'Lead with the deal' },
  { id: 'ingredient', label: 'What is inside', note: 'Materials or ingredients' },
  { id: 'how', label: 'How to use', note: 'Show it in three steps' },
  { id: 'lifestyle', label: 'Lifestyle', note: 'The product in real life' },
  { id: 'proof', label: 'Social proof', note: 'Reviews and ratings' },
  { id: 'compare', label: 'Side by side', note: 'You against the rest' },
  { id: 'fix', label: 'Problem and fix', note: 'The pain, then the product' },
]

const optionsOf = (formatId, inputId) => formatById(formatId)?.inputs.find((i) => i.id === inputId)?.options || []
const stillSizes = [
  ...optionsOf('link-to-ads', 'size').map((o) => ({ id: o.id, label: `${o.label}, ${o.params.aspect}` })),
  { id: 'portrait', label: 'Portrait, 4:5' },
]
// Video ads from a link start from the Product to ad styles, plus a few more of our own.
const videoTemplates = [
  ...optionsOf('product-ad', 'style').map((o) => ({ id: o.id, label: o.label })),
  ...['Hands-on demo', 'Creator review', 'Splash freeze', 'Before and after', 'Price drop', 'Feature callouts'].map((label) => ({ id: label.toLowerCase().replace(/\W+/g, '-'), label })),
].map((t, i) => ({ ...t, cover: coverAt(i + 2) }))

const tones = ['Friendly', 'Bold', 'Premium', 'Playful', 'Calm', 'Expert'].map((t) => ({ id: t.toLowerCase(), label: t }))
const blankBrand = { name: '', logo: [], colors: [], fonts: '', tone: 'friendly', audience: '', about: '', points: '' }
const blankProduct = { name: '', price: '', description: '', images: [] }

function CreateAds() {
  const lib = useLibrary()
  const [link, setLink] = useState('')
  const [brand, setBrand] = useState(blankBrand)
  const [product, setProduct] = useState(blankProduct)
  const [savedBrand, setSavedBrand] = useState(null)
  const [savedProduct, setSavedProduct] = useState(null)
  const [output, setOutput] = useState('still')
  const [picked, setPicked] = useState(['offer', 'lifestyle', 'proof'])
  const [sizes, setSizes] = useState(['square'])
  const [count, setCount] = useState(8)
  const [template, setTemplate] = useState(videoTemplates[0].id)
  const [vSize, setVSize] = useState('9:16')
  const [length, setLength] = useState(15)
  const [vCount, setVCount] = useState(2)
  const b = (patch) => setBrand((x) => ({ ...x, ...patch }))
  const p = (patch) => setProduct((x) => ({ ...x, ...patch }))

  // A saved kit or product fills the fields below, which stay editable for this batch.
  const fromBrand = (ref) => {
    setSavedBrand(ref)
    const item = ref && lib.brands.find((x) => x.id === ref.id)
    if (item) b({ name: item.name || '', logo: item.logo ? [item.logo] : [], colors: item.colors || [], about: item.voice || '' })
  }
  const fromProduct = (ref) => {
    setSavedProduct(ref)
    const item = ref && lib.products.find((x) => x.id === ref.id)
    if (item) p({ name: item.name || '', price: item.price || '', description: item.description || '', images: (item.images || []).slice(0, 8) })
  }

  const still = output === 'still'
  const total = still ? count * sizes.length : vCount
  const summary = still
    ? `${count} ${count === 1 ? 'ad' : 'ads'} in ${sizes.length} ${sizes.length === 1 ? 'size' : 'sizes'}, ${total} images across ${picked.length} ${picked.length === 1 ? 'angle' : 'angles'}`
    : `${vCount} ${vCount === 1 ? 'video' : 'videos'}, ${length} s, ${vSize}`

  return (
    <div className="sb-two">
      <div className="sb-col">
        <Box label="1. Your product page">
          <div className="import">
            <IconLink />
            <input value={link} onChange={(e) => setLink(e.target.value)} placeholder="https://yourshop.com/products/linen-tote" aria-label="Product page link" />
            <button type="button" className="btn-blue sm" disabled>Read page</button>
          </div>
          <p className="sheet-note">Reading a page is not wired yet. Fill in what it would find by hand, or start from a saved brand kit and product.</p>
          <div className="sb-grid2">
            <Field input={{ id: 'saved-brand', type: 'brand', label: 'Saved brand kit', optional: true }} value={savedBrand} onChange={fromBrand} />
            <Field input={{ id: 'saved-product', type: 'product', label: 'Saved product', optional: true }} value={savedProduct} onChange={fromProduct} />
          </div>
        </Box>

        <Box label="2. Check what we found" aside={<button type="button" className="link-btn" onClick={() => { setBrand(blankBrand); setProduct(blankProduct); setSavedBrand(null); setSavedProduct(null) }}>Clear</button>}>
          <h3 className="sb-sub">Brand kit</h3>
          <div className="sb-grid2">
            <Field input={{ id: 'brand-name', type: 'text', label: 'Brand name', placeholder: 'Northfield Goods' }} value={brand.name} onChange={(v) => b({ name: v })} />
            <Field input={{ id: 'fonts', type: 'text', label: 'Fonts', placeholder: 'Headlines in a serif, body in a clean sans' }} value={brand.fonts} onChange={(v) => b({ fonts: v })} />
            <Pictures label="Logo" max={1} value={brand.logo} onChange={(v) => b({ logo: v })} />
            <Colors value={brand.colors} onChange={(v) => b({ colors: v })} />
          </div>
          <div className="field">
            <label>Tone of voice</label>
            <Pills options={tones} value={brand.tone} onChange={(v) => b({ tone: v })} label="Tone of voice" />
          </div>
          <div className="sb-grid2">
            <Field input={{ id: 'audience', type: 'text', label: 'Audience', placeholder: 'Busy commuters who care about craft' }} value={brand.audience} onChange={(v) => b({ audience: v })} />
            <Field input={{ id: 'about', type: 'text', label: 'What the brand is about', placeholder: 'Bags made to last ten years' }} value={brand.about} onChange={(v) => b({ about: v })} />
          </div>
          <Field input={{ id: 'points', type: 'longtext', label: 'Selling points, one per line', rows: 3, placeholder: 'Water resistant waxed canvas\nLifetime repairs\nFree returns' }} value={brand.points} onChange={(v) => b({ points: v })} />

          <h3 className="sb-sub">Product</h3>
          <div className="sb-grid2">
            <Field input={{ id: 'product-name', type: 'text', label: 'Product name', placeholder: 'Linen tote' }} value={product.name} onChange={(v) => p({ name: v })} />
            <Field input={{ id: 'price', type: 'text', label: 'Price', placeholder: '$48' }} value={product.price} onChange={(v) => p({ price: v })} />
          </div>
          <Field input={{ id: 'description', type: 'longtext', label: 'Description', rows: 3, placeholder: 'A roomy everyday tote in washed linen with a leather base' }} value={product.description} onChange={(v) => p({ description: v })} />
          <Pictures label="Product photos" max={8} value={product.images} onChange={(v) => p({ images: v })} />
        </Box>
      </div>

      <aside className="sb-side glass" aria-label="Ads to make">
        <Box label="3. Pick your ads">
          <Segmented value={output} onChange={setOutput} options={[{ value: 'still', label: 'Still ads' }, { value: 'video', label: 'Video ads' }]} />
          {still ? (
            <>
              <div className="field"><label>Angles</label><Cards multi options={angles} value={picked} onChange={setPicked} label="Angles" /></div>
              <div className="field"><label>Sizes</label><Pills multi options={stillSizes} value={sizes} onChange={setSizes} label="Sizes" /></div>
              <div className="field"><label>Ads per product</label><Stepper value={count} onChange={setCount} min={1} max={20} label="Ads per product" noun="ads" /></div>
            </>
          ) : (
            <>
              <div className="field"><label>Template</label><Tiles items={videoTemplates} value={template} onChange={setTemplate} label="Video templates" /></div>
              <div className="field"><label>Size</label><Pills options={['9:16', '1:1', '16:9'].map((a) => ({ id: a, label: a }))} value={vSize} onChange={setVSize} label="Size" /></div>
              <div className="field"><label>Length</label><Pills options={[8, 15].map((s) => ({ id: s, label: `${s} seconds` }))} value={length} onChange={setLength} label="Length" /></div>
              <div className="field"><label>Videos</label><Stepper value={vCount} onChange={setVCount} min={1} max={4} label="Videos" noun="videos" /></div>
            </>
          )}
        </Box>
        <NotWired label={still ? `Make ${total} ${total === 1 ? 'ad' : 'ads'}` : `Make ${vCount} ${vCount === 1 ? 'video' : 'videos'}`}
          summary={summary} runsOn={still ? 'Qwen3 and FLUX 3 Image Klein' : 'Wan 2.2'} />
      </aside>
    </div>
  )
}

const changeable = ['Product', 'Cast', 'Outfit', 'Location', 'Hook', 'Script', 'Call to action'].map((c) => ({ id: c.toLowerCase(), label: c }))

function Multiplier() {
  const [reference, setReference] = useState(null)
  const [product, setProduct] = useState(null)
  const [character, setCharacter] = useState(null)
  const [location, setLocation] = useState(null)
  const [changes, setChanges] = useState(['product', 'cast'])
  const [prompt, setPrompt] = useState('')
  const [quality, setQuality] = useState('720')
  const [versions, setVersions] = useState(2)
  const [error, setError] = useState(null)
  const tags = [product && ['@product', product.name], character && ['@character', character.name], location && ['@location', 'Location photo']].filter(Boolean)
  const mention = (tag) => setPrompt((t) => `${t}${t && !t.endsWith(' ') ? ' ' : ''}${tag} `)

  return (
    <div className="sb-two">
      <div className="sb-col">
        <Box label="Reference ad" aside={<span className="muted">4 to 30 seconds</span>}>
          <div className="sb-stage">
            <Field input={{ id: 'reference', type: 'video', label: 'The ad to remake' }} value={reference} onChange={setReference} setError={setError} />
          </div>
          <ErrorNote error={error} />
        </Box>
        <Box label="What to change">
          <Pills multi options={changeable} value={changes} onChange={setChanges} label="What to change" />
          <Field input={{ id: 'prompt', type: 'longtext', label: 'Direction', rows: 4, placeholder: 'Swap the drink for @product and open on a new hook about the morning commute' }} value={prompt} onChange={setPrompt} />
          {tags.length > 0 && (
            <div className="sb-tags" aria-label="Mention a file">
              {tags.map(([tag, name]) => <button key={tag} type="button" className="btn-soft xs" onClick={() => mention(tag)} title={name}>{tag}</button>)}
            </div>
          )}
        </Box>
      </div>
      <aside className="sb-side glass" aria-label="Ad multiplier settings">
        <Field input={{ id: 'product', type: 'product', label: 'Your product' }} value={product} onChange={setProduct} />
        <Field input={{ id: 'character', type: 'character', label: 'Your character', optional: true }} value={character} onChange={setCharacter} />
        <Field input={{ id: 'location', type: 'image', label: 'Location', optional: true }} value={location} onChange={setLocation} setError={setError} />
        <div className="field"><label>Quality</label><Pills options={['480', '720', '1080'].map((q) => ({ id: q, label: `${q}p` }))} value={quality} onChange={setQuality} label="Quality" /></div>
        <div className="field"><label>Versions</label><Stepper value={versions} onChange={setVersions} min={1} max={6} label="Versions" noun="versions" /></div>
        <NotWired label={`Make ${versions} ${versions === 1 ? 'version' : 'versions'}`} summary={`${versions} at ${quality}p, changing ${changes.length ? changes.join(', ') : 'nothing yet'}`}
          runsOn={formatById('recreate-ad')?.runsOn} />
      </aside>
    </div>
  )
}

export default function AdsStudio() {
  const [tool, setTool] = useParam('tool', tools.map((t) => t.id))
  return (
    <main className="sb-page">
      <Hero badge="Ads studio" title="Ads that sell, made from your own shop"
        sub="Turn a product page into a brand kit and a batch of ads, or remake an ad that already works." />
      <div className="sb-tools" role="tablist" aria-label="Tools">
        {tools.map((t, i) => (
          <button key={t.id} type="button" role="tab" aria-selected={tool === t.id} className={`sb-tool rise${tool === t.id ? ' on' : ''}`}
            style={{ ...stagger(i + 1), background: coverAt(i ? 1 : 5) }} onClick={() => setTool(t.id)}>
            <strong>{t.name}</strong>
            <small>{t.blurb}</small>
          </button>
        ))}
      </div>
      {tool === 'create' ? <CreateAds /> : <Multiplier />}
    </main>
  )
}
