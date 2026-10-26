// Formats the user imported, saved in formats.json next to flows.json. They list in "Yours" on /apps.
import fs from 'node:fs'
import path from 'node:path'
import * as core from './core.js'
import { createGist, readGist } from './gist.js'
import { githubToken, fileOrigin } from './share.js'
import { FORMAT_SUFFIX, formatFileName, formatText, freeId, parseSharedFormat } from '../src/lib/formats/share.js'

const fail = (message, status = 400) => Object.assign(new Error(message), { status })
// The catalog validates every built-in format when it loads, so read it only when an import needs its ids.
const builtInIds = async () => new Set((await import('../src/lib/formats/index.js')).allFormats.map((f) => f.id))

export function createUserFormats({ directory = core.home, builtIns = builtInIds } = {}) {
  const file = () => path.join(directory(), 'formats.json')
  const read = () => {
    try { return JSON.parse(fs.readFileSync(file(), 'utf8')).formats || [] } catch (e) {
      if (e.code === 'ENOENT') return []
      throw e
    }
  }
  const write = (formats) => {
    fs.mkdirSync(directory(), { recursive: true })
    fs.writeFileSync(`${file()}.tmp`, JSON.stringify({ formats }, null, 2))
    fs.renameSync(`${file()}.tmp`, file())
    return formats
  }
  return {
    list: read,
    // { gist } reads a gist; { text, name } is a file the user picked. The same id imported again replaces
    // the earlier copy; an id a built-in format already uses gets a suffix.
    import: async (input, { fetch = globalThis.fetch, token = githubToken(), now = Date.now() } = {}) => {
      if (!input || typeof input !== 'object') throw fail('Send a gist link or a format file.')
      const source = input.gist != null ? await readGist(input.gist, { suffix: FORMAT_SUFFIX, token, fetch })
        : typeof input.text === 'string' ? { text: input.text, origin: fileOrigin(input.name) }
          : null
      if (!source) throw fail('Send a gist link or a format file.')
      const parsed = parseSharedFormat(source.text)
      const format = { ...parsed, id: freeId(parsed.id, await builtIns()), origin: { ...source.origin, at: now } }
      write([format, ...read().filter((f) => f.id !== format.id)])
      return format
    },
    remove: (id) => {
      const formats = read()
      if (!formats.some((f) => f.id === id)) throw fail(`No imported format "${id}".`, 404)
      return write(formats.filter((f) => f.id !== id))
    },
    // Built-in and imported formats alike; the server checks the definition again before it posts it.
    share: async (format, { fetch = globalThis.fetch, token = githubToken() } = {}) => {
      if (!format || typeof format !== 'object') throw fail('Send the format to share.')
      const clean = parseSharedFormat(formatText(format))
      return createGist({ token, fetch, filename: formatFileName(clean), content: formatText(clean), description: `ComfyField format: ${clean.name}` })
    },
  }
}

export const userFormats = createUserFormats()
