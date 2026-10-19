import fs from 'node:fs'
import path from 'node:path'
import crypto from 'node:crypto'

const queues = new Map()

export function libraryStore(home) {
  const file = () => path.join(home(), 'library.json')
  const read = () => {
    try { return JSON.parse(fs.readFileSync(file(), 'utf8')) }
    catch (e) { if (e.code === 'ENOENT') return {}; throw e }
  }
  const update = (change) => {
    const target = file()
    const previous = queues.get(target) || Promise.resolve()
    const next = previous.catch(() => {}).then(async () => {
      // Body parsing, uploads and decoding happen before entering this transaction.
      const lib = read()
      const result = await change(lib)
      fs.mkdirSync(path.dirname(target), { recursive: true })
      const temporary = `${target}.${crypto.randomUUID()}.tmp`
      try {
        fs.writeFileSync(temporary, JSON.stringify(lib, null, 2), { flag: 'wx' })
        fs.renameSync(temporary, target)
      } finally {
        if (fs.existsSync(temporary)) fs.unlinkSync(temporary)
      }
      return result
    })
    queues.set(target, next)
    const release = () => { if (queues.get(target) === next) queues.delete(target) }
    next.then(release, release)
    return next
  }
  return { read, update }
}

const shape = {
  characters: { name: 's', notes: 's', images: ['a', 6] },
  products: { name: 's', description: 's', price: 's', url: 's', images: ['a', 8] },
  brands: { name: 's', logo: 's', voice: 's', url: 's', colors: ['a', 8] },
}

function clean(type, data) {
  const out = {}
  for (const [k, kind] of Object.entries(shape[type])) {
    if (!(k in data)) continue
    out[k] = Array.isArray(kind)
      ? (Array.isArray(data[k]) ? data[k].filter((v) => typeof v === 'string').slice(0, kind[1]) : [])
      : String(data[k] ?? '').slice(0, 2000)
  }
  return out
}

export function libraryRoutes({ library, body, send }) {
  return async (req, res, url) => {
    const m = /^\/api\/library\/(characters|products|brands)(?:\/([\w-]+))?$/.exec(url.pathname)
    if (!m) return false
    const [, type, id] = m
    if (req.method === 'GET' && !id) return send(res, 200, library.read()[type] || []), true
    if (req.method === 'POST' && !id) {
      const item = { id: crypto.randomUUID(), ...clean(type, await body(req)), created: Date.now() }
      if (!item.name?.trim()) return send(res, 400, { error: 'Give it a name first.' }), true
      await library.update((lib) => { lib[type] = [item, ...(lib[type] || [])] })
      return send(res, 200, item), true
    }
    const patch = req.method === 'PATCH' ? clean(type, await body(req)) : null
    const result = await library.update((lib) => {
      const list = lib[type] || []
      const at = list.findIndex((x) => x.id === id)
      if (at < 0) return { status: 404, data: { error: 'Not found' } }
      if (req.method === 'PATCH') {
        const item = { ...list[at], ...patch }
        lib[type] = list.map((x, i) => i === at ? item : x)
        return { status: 200, data: item }
      }
      if (req.method === 'DELETE') {
        lib[type] = list.filter((x) => x.id !== id)
        return { status: 200, data: { ok: true } }
      }
      return { status: 405, data: { error: 'Method not supported.' } }
    })
    send(res, result.status, result.data)
    return true
  }
}
