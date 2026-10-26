// Ads from a link and the UGC ad, with no network and no generation: the product page reader on a
// fixture page, its local address guard, and the formats the Ads studio runs.
import assert from 'node:assert/strict'
import fs from 'node:fs'
import os from 'node:os'
import path from 'node:path'
import { publicGet } from '../server/publicPage.js'

process.env.COMFYFIELD_HOME = fs.mkdtempSync(path.join(os.tmpdir(), 'cf-ads-'))
const core = await import('../server/core.js')
const { formatById, formats } = await import('../src/lib/formats/index.js')
const { adAngles, defaultAngles, linkToAds } = await import('../src/lib/formats/ads.js')
const { compileFormat, runFormat: runWithPlanning } = await import('../src/lib/formats/runner.js')
const { offlineRequirements } = await import('./fixtures/format-planning.mjs')
// main's runner preflights each run; the fixture answers it without the network.
const runFormat = (format, values, options) => runWithPlanning(format, values, { requirements: offlineRequirements, ...options })
const { validateFormat } = await import('../src/lib/formats/validate.js')
const { pageSummary } = await import('../src/lib/useLibrary.js')

const page = `<!doctype html><html><head>
<title>Linen tote | Northfield Goods</title>
<meta property="og:site_name" content="Northfield Goods">
<meta property="og:title" content="Linen tote">
<meta property="og:image" content="/cdn/tote-front.jpg">
<meta property="og:image" content="https://shop.example.com/cdn/tote-side.jpg">
<meta name="theme-color" content="#2f5d50">
<link rel="apple-touch-icon" href="/icon.png">
<script type="application/ld+json">{"@context":"https://schema.org","@graph":[{"@type":"Product","name":"Linen tote","description":"<p>A roomy everyday tote in washed linen &amp; a leather base.</p>","image":["https://shop.example.com/cdn/tote-back.jpg"],"offers":{"@type":"Offer","price":"48.00","priceCurrency":"USD"}}]}</script>
</head><body></body></html>`

const parsed = core.parsePage(page, 'https://shop.example.com/products/linen-tote')
assert.equal(parsed.title, 'Linen tote')
assert.equal(parsed.description, 'A roomy everyday tote in washed linen & a leather base.', 'HTML in a JSON-LD description is stripped')
assert.equal(parsed.price, '$48.00')
assert.deepEqual(parsed.images, ['https://shop.example.com/cdn/tote-front.jpg', 'https://shop.example.com/cdn/tote-side.jpg', 'https://shop.example.com/cdn/tote-back.jpg'], 'Every og:image and the JSON-LD photos, made absolute')
assert.equal(parsed.siteName, 'Northfield Goods')
assert.equal(parsed.themeColor, '#2f5d50')
assert.equal(parsed.logo, 'https://shop.example.com/icon.png')

for (const host of ['localhost', '127.0.0.1', '10.0.0.4', '192.168.1.20', '172.16.0.1', '169.254.169.254', '[::1]', 'printer.local']) assert(core.localAddress(host), host)
for (const host of ['shop.example.com', 'fcbarcelona.com', '172.32.0.1']) assert(!core.localAddress(host), host)

// The full read with a fake network: the page, then each photo saved under media. A photo on a local
// address is never fetched.
const fetched = []
const resolve = async () => [{ address: '93.184.216.34', family: 4 }]
const get = (url, options) => publicGet(url, { ...options, resolve, request: async ({ url }) => {
  const href = url.href
  fetched.push(href)
  if (href.endsWith('/products/linen-tote')) return { status: 200, headers: { 'content-type': 'text/html' }, body: Buffer.from(page.replace('/cdn/tote-front.jpg', 'http://192.168.1.5/secret.jpg')) }
  return { status: 200, headers: { 'content-type': 'image/jpeg' }, body: Buffer.from([0xff, 0xd8, 0xff]) }
} })
const read = await core.readProduct({ url: 'https://shop.example.com/products/linen-tote' }, { get })
assert.equal(read.host, 'shop.example.com')
assert.equal(read.images.length, 2)
assert(read.images.every((u) => u.startsWith('/media/')), 'Photos are saved locally so a run can upload them')
assert(read.logo.startsWith('/media/'))
assert(!fetched.some((u) => u.includes('192.168.1.5')), 'A local photo address is skipped')
await assert.rejects(core.readProduct({ url: 'http://localhost:5173/' }, { get }), /public|Private/)
await assert.rejects(core.readProduct({ url: 'file:///etc/passwd' }, { get }), /http or https/)
await assert.rejects(core.readProduct({ url: 'not a link' }, { get }), /website address/)
for (const destination of ['http://127.0.0.1/secret', 'http://[::ffff:127.0.0.1]/secret']) {
  let visits = 0
  const redirectGet = (url, options) => publicGet(url, { ...options, resolve, request: async () => {
    visits++
    return { status: 302, headers: { location: destination } }
  } })
  await assert.rejects(core.readProduct({ url: 'https://shop.example.com' }, { get: redirectGet }), /Private/)
  assert.equal(visits, 1, 'A redirect to localhost or mapped IPv6 is blocked before connecting')
  visits = 0
  await assert.rejects(core.readProduct({ url: destination }, { get: redirectGet }), /Private/)
  assert.equal(visits, 0, 'A mapped IPv6 or local page is blocked before connecting')
  const imageVisits = []
  const imageGet = (url, options) => publicGet(url, { ...options, resolve, request: async ({ url }) => {
    imageVisits.push(url.href)
    return url.pathname === '/product'
      ? { status: 200, headers: { 'content-type': 'text/html' }, body: Buffer.from('<title>Tote</title><meta property="og:image" content="/photo"><link rel="icon" href="/logo">') }
      : { status: 302, headers: { location: destination } }
  } })
  const blockedImages = await core.readProduct({ url: 'https://shop.example.com/product' }, { get: imageGet })
  assert.deepEqual(blockedImages.images, [])
  assert.equal(blockedImages.logo, '')
  assert.deepEqual(imageVisits.sort(), ['https://shop.example.com/logo', 'https://shop.example.com/photo', 'https://shop.example.com/product'])
}
globalThis.fetch = () => { throw new Error('Network is forbidden in ads checks') }

assert.equal(pageSummary(read), 'Linen tote, $48.00. A roomy everyday tote in washed linen & a leather base.')
assert(pageSummary({ title: 'T', description: 'word '.repeat(200) }).length <= 404)

// Ads from a link: one Klein step per angle, each a batch of the ads-per-angle count, on the picked canvas.
const gallery = formatById('link-to-ads')
assert(formats.includes(gallery), 'link-to-ads is runnable')
assert.deepEqual(gallery.steps.map((s) => s.id), defaultAngles)
for (const angle of adAngles) assert.deepEqual(validateFormat(linkToAds([angle.id])), [], angle.id)
const values = { url: 'https://shop.example.com/products/linen-tote', page: pageSummary(read), image: { url: read.images[0], name: 'Linen tote' }, count: 3, size: 'portrait' }
const studio = linkToAds(['how', 'compare'])
const flow = compileFormat(studio, values)
const models = flow.nodes.filter((n) => n.type === 'model')
assert.deepEqual(models.map((n) => n.id), ['how', 'compare'])
for (const node of models) {
  assert.equal(node.data.model.workflow, 'klein_edit_canvas')
  assert.equal(node.data.aspect, '4:5')
  assert.equal(node.data.model.formatStep.options.fields.count, 3)
  assert(node.data.prompt.includes('Linen tote, $48.00.'))
}
assert.notEqual(models[0].data.prompt, models[1].data.prompt, 'Each angle has its own prompt')
assert.throws(() => compileFormat(studio, { ...values, image: null }), /Product photo/)
const calls = []
const session = await runFormat(studio, values, { run: async (model, opts, meta) => { calls.push({ model, opts, meta }); return [{ url: `/media/${meta.stepId}.png`, kind: 'image' }] } })
assert.equal(calls.length, 2)
assert(calls.every((c) => c.opts.slots.pictures[0] === read.images[0]), 'The product photo is the reference picture')
assert.deepEqual(session.results().map((r) => r.url), ['/media/how.png', '/media/compare.png'])

// UGC ad: the bundled graph takes the character and the product as pictures 1 and 2, and a voice sample.
const ugc = formatById('ugc-ad')
assert(formats.includes(ugc), 'ugc-ad is runnable')
const graph = JSON.parse(fs.readFileSync('public/workflows/ugc_ad.json', 'utf8'))
const ref = Object.values(graph).find((n) => n.class_type === 'MiniMaxH3ReferenceToVideo').inputs
assert.deepEqual(graph[ref['ref_images.ref_image_0'][0]].inputs, { image: '{{image}}' })
assert.deepEqual(graph[ref['ref_images.ref_image_1'][0]].inputs, { image: '{{image2}}' })
assert.equal(graph[ref['ref_audios.ref_audio_0'][0]]._meta.optional, 'audio')
assert(!Object.keys(ref).some((k) => k.startsWith('ref_videos')), 'No reference clip in a UGC ad')
console.log('Ads checks ok: product page reader, local address guard, link-to-ads angles and the ugc_ad graph. No network calls.')
