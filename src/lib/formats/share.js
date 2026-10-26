// A format as a file or gist: plain data in, plain data out. Shared by the app (Download), the server
// (import, gist share) and the checks. Import runs the same validator as the built-in catalog, so a
// format naming a workflow, endpoint or model this version lacks is refused, not saved.
import { validateFormat } from './validate.js'
import { covers } from './parts.js'

export const FORMAT_SUFFIX = '.comfyfield-format.json'
export const FORMAT_LIMIT = 256 * 1024
export const YOURS = 'yours'
const KINDS = ['image', 'video', 'audio', '3d']
// Fields that belong to this install, not to the format: where it was listed, where it came from, and
// media that would load from somewhere else.
const LOCAL_FIELDS = ['hub', 'origin', 'preview', 'featured', 'badge', 'group']
// Covers are the catalog's own gradients; anything else (a url(), a remote image) becomes a plain one.
const GRADIENT = /^linear-gradient\(\s*\d{1,3}deg(\s*,\s*#[0-9a-f]{3,8}){2,4}\s*\)$/i

const fail = (message) => Object.assign(new Error(message), { status: 400 })

export function cleanFormat(format) {
  const data = JSON.parse(JSON.stringify(format))
  for (const field of LOCAL_FIELDS) delete data[field]
  if (!GRADIENT.test(String(data.cover || ''))) data.cover = covers.slate
  return data
}

export const formatFile = (format) => ({ comfyfield: 'format', version: 1, format: cleanFormat(format) })
export const formatText = (format) => JSON.stringify(formatFile(format), null, 2)
export const formatFileName = (format) => `${String(format.id || 'format').replace(/[^\w-]+/g, '-').toLowerCase()}${FORMAT_SUFFIX}`

// Reads a shared format file. Returns the clean format, or throws a sentence that says what is wrong.
export function parseSharedFormat(text) {
  if (typeof text !== 'string' || !text.trim()) throw fail('The file is empty.')
  if (text.length > FORMAT_LIMIT) throw fail('The format is larger than 256 KB. Check that this is a format file.')
  let raw
  try { raw = JSON.parse(text) } catch { throw fail('This file is not JSON. Pick a .comfyfield-format.json file.') }
  if (raw?.comfyfield === 'flow') throw fail('This is a flow file. Import it in Flows.')
  if (raw?.comfyfield !== 'format' || !raw.format || typeof raw.format !== 'object' || Array.isArray(raw.format)) throw fail('This file is not a ComfyField format.')
  const format = cleanFormat(raw.format)
  if (typeof format.id !== 'string' || !/^[a-z0-9][\w-]{0,63}$/i.test(format.id)) throw fail('The format needs an id of letters, digits, "-" or "_".')
  if (typeof format.name !== 'string' || !format.name.trim() || format.name.length > 80) throw fail('The format needs a name of up to 80 characters.')
  if (!KINDS.includes(format.kind)) throw fail(`The format makes an unknown kind of media. Use one of: ${KINDS.join(', ')}.`)
  const reasons = validateFormat(format)
  if (reasons.length) throw fail(`This format cannot run in this version: ${reasons.slice(0, 3).join('; ')}${reasons.length > 3 ? ` (and ${reasons.length - 3} more)` : ''}.`)
  return format
}

// A shared format keeps its id unless that id is taken by a built-in format; then it gets a suffix.
export function freeId(id, taken) {
  if (!taken.has(id)) return id
  for (let n = 1; ; n++) {
    const next = `${id}-${n === 1 ? 'yours' : `yours-${n}`}`
    if (!taken.has(next)) return next
  }
}
