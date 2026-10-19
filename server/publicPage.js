import { lookup } from 'node:dns/promises'
import { request as httpRequest } from 'node:http'
import { request as httpsRequest } from 'node:https'
import { isIP } from 'node:net'

const bad = (message, status = 400) => Object.assign(new Error(message), { status })

export function publicAddress(address) {
  const ip = address.toLowerCase().replace(/^\[|\]$/g, '')
  if (isIP(ip) === 4) {
    const [a, b, c] = ip.split('.').map(Number)
    return !(a === 0 || a === 10 || a === 127 || a >= 224 || (a === 100 && b >= 64 && b <= 127)
      || (a === 169 && b === 254) || (a === 172 && b >= 16 && b <= 31) || (a === 192 && (b === 168 || b === 0 || (b === 88 && c === 99)))
      || (a === 198 && (b === 18 || b === 19 || (b === 51 && c === 100))) || (a === 203 && b === 0 && c === 113))
  }
  // Only global unicast. This also excludes IPv4-mapped, link-local and ULA addresses.
  if (isIP(ip) !== 6 || !/^[23]/.test(ip)) return false
  const [first, second = '0'] = ip.split(':')
  return !(parseInt(first, 16) === 0x2001 && (parseInt(second || '0', 16) < 0x200 || parseInt(second, 16) === 0xdb8)) && parseInt(first, 16) !== 0x2002
}

export async function publicTarget(value, resolve = lookup) {
  let url
  try { url = new URL(value) } catch { throw bad('Enter a complete public website address.') }
  if (!['http:', 'https:'].includes(url.protocol) || url.username || url.password || (url.port && !['80', '443'].includes(url.port))) throw bad('Use a public http or https website without credentials or custom ports.')
  const host = url.hostname.replace(/^\[|\]$/g, '')
  if (host === 'localhost' || /\.(localhost|local|internal|home|test|invalid)$/.test(host)) throw bad('Private websites are not allowed.')
  let addresses
  try { addresses = isIP(host) ? [{ address: host, family: isIP(host) }] : await resolve(host, { all: true, verbatim: true }) } catch { throw bad('Could not resolve that website.', 502) }
  if (!addresses.length || addresses.some((item) => !publicAddress(item.address))) throw bad('Private or reserved network addresses are not allowed.')
  return { url, address: addresses[0] }
}

export function requestPublic({ url, address }, { signal, limit = 2_000_000, accept = 'text/html' } = {}) {
  return new Promise((resolve, reject) => {
    const req = (url.protocol === 'https:' ? httpsRequest : httpRequest)(url, {
      method: 'GET', signal, headers: { Accept: accept, 'Accept-Encoding': 'identity', 'User-Agent': 'ComfyField page reader' },
      // Pin the checked DNS result to this connection, including across DNS rebinding.
      lookup: (_host, opts, callback) => opts.all ? callback(null, [address]) : callback(null, address.address, address.family),
    }, (res) => {
      const status = res.statusCode
      const headers = res.headers
      res.on('error', reject)
      if ([301, 302, 303, 307, 308].includes(status)) {
        res.destroy()
        resolve({ status, headers, body: Buffer.alloc(0) })
        return
      }
      if (Number(headers['content-length']) > limit) { res.destroy(bad('That page or image is too large.', 413)); return }
      let size = 0
      const chunks = []
      res.on('data', (chunk) => {
        size += chunk.length
        if (size > limit) res.destroy(bad('That page or image is too large.', 413))
        else chunks.push(chunk)
      })
      res.on('end', () => resolve({ status, headers, body: Buffer.concat(chunks) }))
    })
    req.on('error', reject)
    req.end()
  })
}

export async function publicGet(value, { limit = 2_000_000, accept = 'text/html,application/xhtml+xml', timeout = 10000, resolve, request = requestPublic } = {}) {
  const signal = AbortSignal.timeout(timeout)
  let target = value
  try {
    for (let redirects = 0; redirects <= 4; redirects++) {
      const checked = await Promise.race([
        publicTarget(target, resolve),
        new Promise((_, reject) => signal.addEventListener('abort', () => reject(bad('Reading the website timed out.', 504)), { once: true })),
      ])
      signal.throwIfAborted()
      const response = await request(checked, { signal, limit, accept })
      if ([301, 302, 303, 307, 308].includes(response.status)) {
        if (!response.headers.location || redirects === 4) throw bad('That website redirects too many times.', 502)
        target = new URL(response.headers.location, checked.url).href
        continue
      }
      if (response.status < 200 || response.status >= 300) throw bad(`That website answered ${response.status}. Try a public product page.`, 502)
      if (response.body.length > limit) throw bad('That page or image is too large.', 413)
      return { ...response, url: checked.url.href }
    }
  } catch (error) {
    if (signal.aborted) throw bad('Reading the website timed out.', 504)
    if (error.status) throw error
    throw bad('Could not read that public website.', 502)
  }
}

const decode = (value = '') => String(value).replace(/&(?:amp|quot|apos|lt|gt|nbsp);|&#(x[0-9a-f]+|\d+);/gi, (match, code) => {
  if (code) { const n = code[0].toLowerCase() === 'x' ? parseInt(code.slice(1), 16) : Number(code); return n > 0 && n <= 0x10ffff ? String.fromCodePoint(n) : '' }
  return ({ '&amp;': '&', '&quot;': '"', '&apos;': "'", '&lt;': '<', '&gt;': '>', '&nbsp;': ' ' })[match.toLowerCase()] || ''
})
const clean = (value) => decode(String(value || '').replace(/<[^>]*>/g, ' ')).replace(/\s+/g, ' ').trim().slice(0, 6000)
const attrs = (tag) => Object.fromEntries([...tag.matchAll(/([\w:-]+)\s*=\s*(?:"([^"]*)"|'([^']*)'|([^\s>]+))/g)].map((m) => [m[1].toLowerCase(), decode(m[2] ?? m[3] ?? m[4])]))

export function extractBusinessPage(html, base) {
  const meta = {}
  for (const [tag] of html.matchAll(/<meta\b[^>]*>/gi)) {
    const a = attrs(tag)
    meta[(a.property || a.name || '').toLowerCase()] ??= a.content || ''
  }
  let product
  const walk = (item, depth = 0) => {
    if (!item || depth > 12 || product) return
    if (Array.isArray(item)) return item.forEach((v) => walk(v, depth + 1))
    if (typeof item !== 'object') return
    if ([].concat(item['@type'] || []).includes('Product')) product = item
    else Object.values(item).forEach((v) => walk(v, depth + 1))
  }
  for (const match of html.matchAll(/<script\b[^>]*type\s*=\s*["']application\/ld\+json["'][^>]*>([\s\S]*?)<\/script>/gi)) {
    try { walk(JSON.parse(match[1])) } catch {}
  }
  const urlOf = (value) => {
    try { const url = new URL(value, base); return ['http:', 'https:'].includes(url.protocol) && !url.username && !url.password ? url.href : null } catch { return null }
  }
  const name = clean(product?.name || meta['og:title'] || /<title[^>]*>([\s\S]*?)<\/title>/i.exec(html)?.[1])
  const description = clean(product?.description || meta['og:description'] || meta.description)
  if (!name || /access denied|just a moment|attention required|captcha|verify you are human|^sign in$|^log in$|^not found$|^404\b/i.test(name)) throw bad('That page blocks reading or has no product title. Enter the product details by hand.', 422)
  const images = [...new Set([
    ...[].concat(product?.image || []).map((i) => typeof i === 'string' ? i : i?.url || i?.contentUrl),
    meta['og:image'], meta['twitter:image'],
    ...[...html.matchAll(/<img\b[^>]*>/gi)].map(([tag]) => { const a = attrs(tag); return a.src || a['data-src'] }),
  ].filter(Boolean).map(urlOf).filter(Boolean))].slice(0, 8)
  const links = [...html.matchAll(/<link\b[^>]*>/gi)].map(([tag]) => attrs(tag))
  const logo = links.find((a) => /(?:^|\s)(?:icon|apple-touch-icon)(?:\s|$)/i.test(a.rel || ''))?.href
  const colors = [...new Set([meta['theme-color'], ...[...html.matchAll(/(?:color|background(?:-color)?)\s*:\s*(#[0-9a-f]{3,8})\b/gi)].map((m) => m[1])].filter((v) => /^#(?:[0-9a-f]{3}|[0-9a-f]{6})$/i.test(v || '')))].slice(0, 6)
  const offer = [].concat(product?.offers || [])[0]
  const amount = offer?.price ?? offer?.lowPrice ?? meta['product:price:amount']
  const price = amount != null ? clean(`${offer?.priceCurrency || meta['product:price:currency'] || ''} ${amount}`) : ''
  const brandName = clean(typeof product?.brand === 'string' ? product.brand : product?.brand?.name) || clean(meta['og:site_name']) || new URL(base).hostname
  return { url: base, brand: { name: brandName, colors, logo: logo ? urlOf(logo) : null, about: description }, product: { name, description, price, images } }
}
