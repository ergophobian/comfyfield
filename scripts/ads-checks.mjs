import assert from 'node:assert/strict'
import { createServer } from 'node:http'
import { publicAddress, publicTarget, publicGet, requestPublic, extractBusinessPage } from '../server/publicPage.js'
import { importBusinessPage } from '../server/core.js'
import { adFormat, adValues, conceptText, approveAd } from '../src/lib/adStudio.js'
import { runFormat } from '../src/lib/formats/runner.js'
import { comfyVars } from '../shared/mapping.js'
import { notOnCloud, podNeedsOf } from '../shared/modelFiles.js'
import { readFileSync } from 'node:fs'

const resolve = async () => [{ address: '93.184.216.34', family: 4 }]
for (const ip of ['127.0.0.1', '10.0.0.1', '0.0.0.0', '169.254.169.254', '172.16.1.2', '192.168.1.1', '100.100.100.100', '198.18.0.1', '192.0.2.1', '198.51.100.1', '203.0.113.1', '224.0.0.1', '::1', '::', '::ffff:7f00:1', '::ffff:127.0.0.1', 'fc00::1', 'fe80::1', '2001:db8::1', '2001:0000::1', '2002:7f00:1::']) assert.equal(publicAddress(ip), false, ip)
for (const ip of ['1.1.1.1', '8.8.8.8', '2606:4700:4700::1111', '2001:4860:4860::8888']) assert.equal(publicAddress(ip), true, ip)
for (const url of ['http://localhost', 'http://127.1', 'http://2130706433', 'http://[::1]', 'http://0x7f000001', 'http://user:pass@example.com', 'file:///etc/hosts', 'http://example.com:9000', 'http://printer.local']) await assert.rejects(publicTarget(url, resolve))
await assert.rejects(publicTarget('https://example.com', async () => [{ address: '8.8.8.8', family: 4 }, { address: '127.0.0.1', family: 4 }]), /Private/)
let visits = 0
await assert.rejects(publicGet('https://example.com', { resolve, request: async () => { visits++; return { status: 302, headers: { location: 'http://169.254.169.254/latest/meta-data' } } } }), /Private/)
assert.equal(visits, 1, 'Redirect destination is blocked before connecting')
await assert.rejects(publicGet('https://example.com', { resolve, request: async () => ({ status: 302, headers: { location: '/again' } }) }), /too many/)
await assert.rejects(publicGet('https://example.com', { resolve, request: async () => ({ status: 403, headers: {} }) }), /403/)
await assert.rejects(publicGet('https://example.com', { resolve, limit: 2, request: async () => ({ status: 200, headers: {}, body: Buffer.from('large') }) }), /too large/)
await assert.rejects(publicGet('https://example.com', { timeout: 10, resolve: () => new Promise((done) => setTimeout(() => done([{ address: '8.8.8.8', family: 4 }]), 30)) }), /timed out/)

// Exercise actual socket pinning, streaming limits and timeout on a local fixture only.
const fixture = createServer((req, res) => {
  if (req.url === '/slow') return setTimeout(() => res.end('late'), 50)
  if (req.url === '/length') res.setHeader('Content-Length', '1000')
  if (req.url === '/chunked') { res.write('1234'); res.end('5678'); return }
  res.end('small')
})
await new Promise((done) => fixture.listen(0, '127.0.0.1', done))
try {
  const target = (pathname) => ({ url: new URL(`http://public.example:${fixture.address().port}${pathname}`), address: { address: '127.0.0.1', family: 4 } })
  assert.equal((await requestPublic(target('/ok'), { limit: 100, signal: AbortSignal.timeout(1000) })).body.toString(), 'small')
  await assert.rejects(requestPublic(target('/length'), { limit: 5 }), /too large/)
  await assert.rejects(requestPublic(target('/chunked'), { limit: 5 }), /too large/)
  await assert.rejects(requestPublic(target('/slow'), { limit: 5, signal: AbortSignal.timeout(10) }))
} finally { await new Promise((done) => fixture.close(done)) }

const html = `<html><head><meta content="#345678" name="theme-color"><meta property='og:site_name' content='Northfield'><link rel=icon href=/logo.png><script type="application/ld+json">{"@graph":[{"@type":"Product","name":"Linen &amp; tote","description":"Lifetime repairs","image":["/tote.png","http://127.0.0.1/blocked.png"],"brand":{"name":"Northfield"},"offers":{"price":48,"priceCurrency":"USD"}}]}</script></head><body style="background-color: #abc">Tote</body></html>`
const extracted = extractBusinessPage(html, 'https://example.com/tote')
assert.equal(extracted.product.name, 'Linen & tote')
assert.equal(extracted.product.price, 'USD 48')
assert.deepEqual(extracted.brand.colors, ['#345678', '#abc'])
assert.equal(extracted.product.images[0], 'https://example.com/tote.png')
assert.throws(() => extractBusinessPage('<title>Access denied</title>', 'https://example.com'), /blocks/)
assert.throws(() => extractBusinessPage('<body>Blank</body>', 'https://example.com'), /no product title/)
assert.equal(extractBusinessPage('<title>A shop</title><meta name=description content="Useful goods">', 'https://example.com').product.description, 'Useful goods')
const imageVisits = []
const png = Buffer.from([137, 80, 78, 71, 13, 10, 26, 10])
const imported = await importBusinessPage({ url: 'https://example.com/tote' }, {
  get: async (url) => {
    if (url.endsWith('/tote')) return { headers: { 'content-type': 'text/html' }, body: Buffer.from(html), url }
    imageVisits.push(url)
    await publicTarget(url, resolve)
    return { headers: { 'content-type': 'image/png' }, body: png }
  },
  save: (_bytes, ext) => ({ url: `/media/import.${ext}` }),
})
assert.deepEqual(imported.product.images, ['/media/import.png'])
assert.equal(imported.warnings.length, 1)
assert.equal(imageVisits.length, 3)
await assert.rejects(importBusinessPage({ url: 'https://example.com' }, { get: async () => ({ headers: { 'content-type': 'application/json' }, body: Buffer.from('{}') }) }), /HTML/)

for (const config of [
  { kind: 'image', count: 2, aspects: ['1:1', '4:5', '9:16'] },
  { kind: 'video', count: 2, aspects: ['9:16'], duration: 8 },
  { kind: 'video', recreate: true, count: 2, aspects: ['16:9'], duration: 8, reference: { url: '/media/reference.mp4', duration: 8, trim: { start: 1, end: 7 } } },
]) {
  const product = { type: 'product', name: 'Linen tote', images: ['/media/tote.png'], price: 'USD 48', description: 'Lifetime repairs' }
  const brand = { type: 'brand', name: 'Northfield', colors: ['#345678'], logo: ['/media/logo.png'], tone: 'friendly', audience: 'Commuters', points: 'Repairs included' }
  const character = { type: 'character', name: 'Sam', images: ['/media/sam.png'] }
  const controls = { ...config, product, brand, character, style: 'Unboxing', platform: 'Reels', scenes: [{ text: 'Close on the linen stitching' }], angles: ['offer', 'lifestyle'] }
  const values = adValues(controls)
  const format = adFormat({ id: 'ads-studio', ...controls })
  const calls = []
  let writes = 0
  const session = await runFormat(format, values, {
    writePrompt: async (request) => { writes++; assert(request.images.every((url) => !url.endsWith('.mp4')), 'Video references must not be sent as writer images'); assert(request.note.includes('Close on the linen stitching')); assert(request.note.includes('#345678')); return 'Draft: carry less, live more. Shop the tote.' },
    run: async (model, opts, meta) => { calls.push({ model, opts, meta }); return [{ url: `/media/${meta.stepId}.${config.kind === 'image' ? 'png' : 'mp4'}`, kind: config.kind }] },
  })
  session.format = format
  assert.equal(conceptText(session), 'Draft: carry less, live more. Shop the tote.')
  assert.equal(calls.length, 0, 'No render before script approval')
  await session.send('approval')
  assert.equal(calls.length, 0, 'Unsent writer cannot bypass approval')
  await approveAd(session, 'Edited headline: carry beautifully. Call to action: Shop now.')
  assert.equal(writes, 1)
  assert.equal(calls.length, config.count * config.aspects.length)
  for (const call of calls) {
    const vars = comfyVars(config.kind, call.opts, call.model.sizes)
    assert(vars.prompt.includes('Edited headline: carry beautifully.'))
    assert(vars.prompt.includes('Shop now.'))
    assert(vars.prompt.includes('Lifetime repairs'))
    assert(vars.prompt.includes('Close on the linen stitching'))
    assert(vars.prompt.includes('#345678'))
    assert.equal(vars.image, '/media/tote.png')
    assert.equal(vars.image2, '/media/sam.png')
    if (!config.recreate) assert.equal(vars.image3, '/media/logo.png')
    if (config.recreate) { assert.equal(vars.video, '/media/reference.mp4'); assert.equal(vars.start, 1); assert.equal(vars.duration, 6) }
    else if (config.kind === 'video') assert.equal(vars.duration, 8)
    assert.equal(call.meta.formatId, 'ads-studio')
    const graph = JSON.parse(readFileSync(`public/workflows/${call.model.workflow}.json`))
    assert.deepEqual(notOnCloud(podNeedsOf(graph)), [], 'Selected workflows use cloud-available files and nodes')
  }
  const before = calls.length
  await session.send('approval')
  assert.equal(calls.length, before, 'Send never reruns outputs')
  assert.equal(session.results().length, before)
}
assert.throws(() => adValues({ product: { name: 'No photo' } }), /photo/)
console.log('Ads checks ok: guarded and pinned public GETs, redirects, byte/time limits, extraction, local media, writer approval, edited scripts, variant canvases, product/presenter slots and Library metadata. No provider calls.')
