import { useState } from 'react'
import { Link } from 'react-router-dom'
import Segmented from '../components/Segmented.jsx'
import Results from '../components/Results.jsx'
import { Field } from '../components/formats/Fields.jsx'
import { IconLink } from '../components/Icons.jsx'
import { Hero, Box, Pills, Cards, Stepper, Tiles, RunBar, ErrorNote, useParam, coverAt, stagger } from '../components/studiob/Kit.jsx'
import { Pictures, Colors } from '../components/studiob/Inputs.jsx'
import { useLibrary, readProduct, pageSummary } from '../lib/useLibrary.js'
import { useApp } from '../lib/appContext.js'
import { estimate, money, useModelMeta } from '../lib/cost.js'
import { formatById } from '../lib/formats/index.js'
import { stepModel } from '../lib/formats/options.js'
import { adAngles, linkToAds } from '../lib/formats/ads.js'

const tools = [
  { id: 'create', name: 'Create ads', blurb: 'On-brand ads for every product, many at a time.' },
  { id: 'multiplier', name: 'Ad multiplier', blurb: 'Remake a winning ad with your own product, cast and places.' },
]

const angles = adAngles.map(({ id, label, note }) => ({ id, label, note }))
const optionsOf = (formatId, inputId) => formatById(formatId)?.inputs.find((i) => i.id === inputId)?.options || []
const stillSizes = optionsOf('link-to-ads', 'size').map((o) => ({ id: o.id, label: `${o.label}, ${o.params.aspect}` }))
// Video ads run Product to ad in one of its styles, or a UGC ad with a creator who holds the product and talks.
const videoTemplates = [
  ...optionsOf('product-ad', 'style').map((o) => ({ id: o.id, label: o.label, format: 'product-ad' })),
  { id: 'ugc', label: 'Creator review', format: 'ugc-ad' },
].map((t, i) => ({ ...t, cover: coverAt(i + 2) }))
const lengths = optionsOf('ugc-ad', 'length').map((o) => ({ id: o.params.duration, label: o.label }))

const tones = ['Friendly', 'Bold', 'Premium', 'Playful', 'Calm', 'Expert'].map((t) => ({ id: t.toLowerCase(), label: t }))
const blankBrand = { name: '', logo: [], colors: [], fonts: '', tone: 'friendly', audience: '', about: '', points: '' }
const blankProduct = { name: '', price: '', description: '', images: [] }
const adFormats = ['link-to-ads', 'product-ad', 'ugc-ad']

// A format with its canvas and length set by the page, for formats whose sheet fixes them.
const withSettings = (format, settings) => ({ ...format, steps: format.steps.map((s) => ({ ...s, settings: { ...s.settings, ...settings } })) })

function CreateAds() {
  const lib = useLibrary()
  const { gens } = useApp()
  const [link, setLink] = useState('')
  const [reading, setReading] = useState(false)
  const [found, setFound] = useState(null)
  const [error, setError] = useState(null)
  const [brand, setBrand] = useState(blankBrand)
  const [product, setProduct] = useState(blankProduct)
  const [savedBrand, setSavedBrand] = useState(null)
  const [savedProduct, setSavedProduct] = useState(null)
  const [output, setOutput] = useState('still')
  const [picked, setPicked] = useState(['offer', 'lifestyle', 'proof'])
  const [sizes, setSizes] = useState(['square'])
  const [count, setCount] = useState(1)
  const [template, setTemplate] = useState(videoTemplates[0].id)
  const [vSize, setVSize] = useState('9:16')
  const [length, setLength] = useState(10)
  const [vCount, setVCount] = useState(1)
  const [character, setCharacter] = useState(null)
  const [script, setScript] = useState('')
  const [voice, setVoice] = useState(null)
  const [sending, setSending] = useState(false)
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

  const readPage = async (e) => {
    e?.preventDefault()
    setReading(true)
    setError(null)
    try {
      const page = await readProduct(link)
      setFound(page)
      b({ name: page.siteName || page.host || '', logo: page.logo ? [page.logo] : [], colors: page.themeColor ? [page.themeColor] : [] })
      p({ name: page.title || '', price: page.price || '', description: page.description || '', images: page.images || [] })
      setSavedBrand(null)
      setSavedProduct(null)
    } catch (err) { setError(err.message) }
    finally { setReading(false) }
  }

  const still = output === 'still'
  const tpl = videoTemplates.find((t) => t.id === template)
  const ugc = tpl.format === 'ugc-ad'
  const photo = product.images[0]
  const brandRef = savedBrand || (brand.name.trim() ? { type: 'brand', name: brand.name.trim() } : null)
  const productRef = savedProduct ? { ...savedProduct, images: product.images.length ? product.images : savedProduct.images } : { type: 'product', name: product.name.trim() || 'the product', images: product.images, description: product.description, price: product.price }

  // What the page says, plus the kit's selling points and audience, as one short brief for every angle.
  const page = [
    pageSummary({ title: product.name.trim(), price: product.price.trim(), description: product.description.trim() }),
    brand.points.trim() && `Selling points: ${brand.points.trim().split('\n').filter(Boolean).join('; ')}.`,
    brand.audience.trim() && `For ${brand.audience.trim()}.`,
    brand.tone && `Tone: ${brand.tone}.`,
  ].filter(Boolean).join(' ')

  // One run per size for still ads, each making every picked angle; one run per video.
  const runs = still
    ? sizes.map((size) => ({ format: linkToAds(picked), values: { url: link, page, image: { url: photo, name: product.name || 'Product' }, count, size, brand: brandRef } }))
    : Array.from({ length: vCount }, () => ugc
      ? { format: withSettings(formatById('ugc-ad'), { aspect: vSize }), values: { character, product: productRef, script, voice, length: String(length), camera: 'selfie', emotion: 'excited' } }
      : { format: withSettings(formatById('product-ad'), { aspect: vSize, duration: length }), values: { product: productRef, brand: brandRef, style: template } })
  const model = runs[0] && stepModel(runs[0].format, runs[0].format.steps[0], runs[0].values)
  const metaOf = useModelMeta(model ? [model] : [])
  const each = model && estimate(model, metaOf(model), { aspect: still ? '1:1' : vSize, count: 1, duration: still ? undefined : length })

  const total = still ? count * picked.length * sizes.length : vCount
  const summary = still
    ? `${count} ${count === 1 ? 'ad' : 'ads'} per angle in ${sizes.length} ${sizes.length === 1 ? 'size' : 'sizes'}, ${total} images across ${picked.length} ${picked.length === 1 ? 'angle' : 'angles'}`
    : `${vCount} ${vCount === 1 ? 'video' : 'videos'}, ${length} s, ${vSize}`
  const missing = [
    !photo && 'a product photo',
    still && !page && 'what the product is',
    still && !picked.length && 'an angle',
    still && !sizes.length && 'a size',
    !still && ugc && !character && 'a character',
    !still && ugc && !script.trim() && 'a script',
  ].filter(Boolean)
  const cost = each ? `${each.approx ? 'About ' : ''}${money(each.usd * (still ? sizes.length * picked.length : vCount))} in all.` : ''
  const note = missing.length ? `Still needed: ${missing.join(', ')}.` : `${cost} Runs on ${model?.name || 'open weights'}. Each ad saves to your Library.`

  const make = async () => {
    setSending(true)
    setError(null)
    try { await Promise.all(runs.map((r) => gens.generateFormat(r.format, r.values))) } catch (err) { setError(err.message) }
    finally { setSending(false) }
  }
  const mine = gens.items.filter((g) => adFormats.includes(g.formatId) && !g.failed)
  const failed = gens.items.filter((g) => adFormats.includes(g.formatId) && g.failed)

  return (
    <>
      <div className="sb-two">
        <div className="sb-col">
          <Box label="1. Your product page">
            <form className="import" onSubmit={readPage}>
              <IconLink />
              <input value={link} onChange={(e) => setLink(e.target.value)} placeholder="https://yourshop.com/products/linen-tote" aria-label="Product page link" />
              <button className="btn-blue sm" disabled={reading || !link.trim()}>{reading ? 'Reading' : 'Read page'}</button>
            </form>
            <p className="sheet-note">{found
              ? `Read ${found.host}: ${found.images.length} ${found.images.length === 1 ? 'photo' : 'photos'}${found.price ? `, ${found.price}` : ''}. Check it below.`
              : 'We read the name, price, description, photos, colors and logo from the page. No key needed. Or start from a saved brand kit and product.'}</p>
            <ErrorNote error={error} />
            <div className="sb-grid2">
              <Field input={{ id: 'saved-brand', type: 'brand', label: 'Saved brand kit', optional: true }} value={savedBrand} onChange={fromBrand} />
              <Field input={{ id: 'saved-product', type: 'product', label: 'Saved product', optional: true }} value={savedProduct} onChange={fromProduct} />
            </div>
          </Box>

          <Box label="2. Check what we found" aside={<button type="button" className="link-btn" onClick={() => { setBrand(blankBrand); setProduct(blankProduct); setSavedBrand(null); setSavedProduct(null); setFound(null) }}>Clear</button>}>
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
            <Pictures label="Product photos, the first one goes in the ads" max={8} value={product.images} onChange={(v) => p({ images: v })} />
          </Box>
        </div>

        <aside className="sb-side glass" aria-label="Ads to make">
          <Box label="3. Pick your ads">
            <Segmented value={output} onChange={setOutput} options={[{ value: 'still', label: 'Still ads' }, { value: 'video', label: 'Video ads' }]} />
            {still ? (
              <>
                <div className="field"><label>Angles</label><Cards multi options={angles} value={picked} onChange={setPicked} label="Angles" /></div>
                <div className="field"><label>Sizes</label><Pills multi options={stillSizes} value={sizes} onChange={setSizes} label="Sizes" /></div>
                <div className="field"><label>Ads per angle</label><Stepper value={count} onChange={setCount} min={1} max={4} label="Ads per angle" noun="ads" /></div>
              </>
            ) : (
              <>
                <div className="field"><label>Template</label><Tiles items={videoTemplates} value={template} onChange={setTemplate} label="Video templates" /></div>
                {ugc && (
                  <>
                    <Field input={{ id: 'character', type: 'character', label: 'Creator' }} value={character} onChange={setCharacter} />
                    <Field input={{ id: 'script', type: 'longtext', label: 'What they say', rows: 3, placeholder: 'Okay, I did not expect to love this as much as I do. Here is why it lives in my bag now.' }} value={script} onChange={setScript} />
                    <Field input={{ id: 'voice', type: 'audio', label: 'Voice sample', optional: true }} value={voice} onChange={setVoice} setError={setError} />
                  </>
                )}
                <div className="field"><label>Size</label><Pills options={['9:16', '1:1', '16:9'].map((a) => ({ id: a, label: a }))} value={vSize} onChange={setVSize} label="Size" /></div>
                <div className="field"><label>Length</label><Pills options={lengths} value={length} onChange={setLength} label="Length" /></div>
                <div className="field"><label>Videos</label><Stepper value={vCount} onChange={setVCount} min={1} max={4} label="Videos" noun="videos" /></div>
              </>
            )}
          </Box>
          <RunBar label={sending ? 'Sending' : still ? `Make ${total} ${total === 1 ? 'ad' : 'ads'}` : `Make ${vCount} ${vCount === 1 ? 'video' : 'videos'}`}
            summary={summary} note={note} disabled={sending || missing.length > 0} onRun={make} />
        </aside>
      </div>

      {(mine.length > 0 || failed.length > 0) && (
        <section className="app-results">
          <div className="apps-sec-head">
            <div>
              <h2>Your ads</h2>
              <p>Each one is saved to your Library as it finishes.</p>
            </div>
            <Link className="link-btn" to="/library">Open Library</Link>
          </div>
          {failed.map((g) => (
            <p key={g.id} className="app-failed">
              <span>{g.failed}</span>
              {g.retry && <button type="button" className="link-btn" onClick={g.retry}>Retry</button>}
              <button type="button" className="link-btn" onClick={() => gens.dismiss(g.id)}>Dismiss</button>
            </p>
          ))}
          {mine.length > 0 && <Results items={mine} />}
        </section>
      )}
    </>
  )
}

const changeable = ['Product', 'Cast', 'Outfit', 'Location', 'Hook', 'Script', 'Call to action'].map((c) => ({ id: c.toLowerCase(), label: c }))

// Ad multiplier runs Recreate an ad: the product and the character go in as its two pictures, and the
// chips and direction become its extra direction. The graph keeps the reference clip's own size.
function Multiplier() {
  const { gens } = useApp()
  const [reference, setReference] = useState(null)
  const [product, setProduct] = useState(null)
  const [character, setCharacter] = useState(null)
  const [changes, setChanges] = useState(['product', 'cast'])
  const [prompt, setPrompt] = useState('')
  const [versions, setVersions] = useState(2)
  const [error, setError] = useState(null)
  const [sending, setSending] = useState(false)
  const tags = [product && ['@product', product.name], character && ['@character', character.name]].filter(Boolean)
  const mention = (tag) => setPrompt((t) => `${t}${t && !t.endsWith(' ') ? ' ' : ''}${tag} `)

  const format = formatById('recreate-ad')
  const direction = [
    changes.length && `Change the ${changes.map((c) => changeable.find((x) => x.id === c).label.toLowerCase()).join(', ')}.`,
    prompt.replace(/@product/g, 'the product in image 0').replace(/@character/g, 'the person in image 1').trim(),
  ].filter(Boolean).join(' ')
  const missing = [!reference && 'the ad to remake', !product && 'your product'].filter(Boolean)
  const make = async () => {
    setSending(true)
    setError(null)
    const values = { reference, product, character, note: direction }
    try { await Promise.all(Array.from({ length: versions }, () => gens.generateFormat(format, values))) } catch (e) { setError(e.message) }
    finally { setSending(false) }
  }

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
        <div className="field"><label>Versions</label><Stepper value={versions} onChange={setVersions} min={1} max={6} label="Versions" noun="versions" /></div>
        <RunBar label={sending ? 'Sending' : `Make ${versions} ${versions === 1 ? 'version' : 'versions'}`}
          summary={`${versions} ${versions === 1 ? 'version' : 'versions'} at the reference size, changing ${changes.length ? changes.join(', ') : 'nothing yet'}`}
          note={missing.length ? `Still needed: ${missing.join(', ')}.` : `Runs on ${format.runsOn}. Each version saves to your Library.`}
          disabled={sending || missing.length > 0} onRun={make} />
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
