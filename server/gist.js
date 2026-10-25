// GitHub gists for shared flows and formats. The token stays on this machine: the browser asks the
// local server, and only this file sends it, only to api.github.com.
import { SHARE_LIMIT } from '../shared/flowShare.js'

const API = 'https://api.github.com'
const fail = (message, status = 400) => Object.assign(new Error(message), { status })
const headers = (token) => ({
  Accept: 'application/vnd.github+json',
  'X-GitHub-Api-Version': '2022-11-28',
  'User-Agent': 'ComfyField',
  ...(token ? { Authorization: `Bearer ${token}` } : {}),
})

// Accepts a gist page, a raw file link, an API link or the bare id.
export function gistId(input) {
  const text = String(input || '').trim()
  if (/^[0-9a-f]{20,40}$/i.test(text)) return text
  let url
  try { url = new URL(text) } catch { throw fail('Paste a gist link, such as https://gist.github.com/you/1a2b3c….') }
  const parts = url.pathname.split('/').filter(Boolean)
  const id = url.hostname === 'gist.github.com' ? parts.find((p) => /^[0-9a-f]{20,40}$/i.test(p))
    : url.hostname === 'gist.githubusercontent.com' ? parts[1]
      : url.hostname === 'api.github.com' && parts[0] === 'gists' ? parts[1] : null
  if (url.protocol !== 'https:' || !id || !/^[0-9a-f]{20,40}$/i.test(id)) throw fail('That is not a GitHub gist link. Paste a link from gist.github.com.')
  return id
}

async function readLimited(res, limit) {
  if (Number(res.headers.get('content-length')) > limit) throw fail('The gist is too large to import.', 413)
  const reader = res.body?.getReader()
  if (!reader) return res.text()
  const chunks = []
  let size = 0
  for (;;) {
    const { done, value } = await reader.read()
    if (done) break
    size += value.length
    if (size > limit) { reader.cancel().catch(() => {}); throw fail('The gist is too large to import.', 413) }
    chunks.push(value)
  }
  return Buffer.concat(chunks).toString('utf8')
}

function githubError(res, data, action) {
  if (res.status === 401) return fail('GitHub refused the token. Add a token with the gist scope in Connections.', 401)
  if (res.status === 403 || res.status === 429) return fail(`GitHub said no to ${action}${data?.message ? `: ${data.message}` : ''}. Check the token's gist scope, or wait if you hit the rate limit.`, 403)
  if (res.status === 404) return fail(action === 'reading the gist' ? 'No gist at that link. Check that it is public or secret, not deleted.' : 'GitHub could not find the gist API. Check that the token has the gist scope.', 404)
  return fail(`GitHub failed ${action} (${res.status}). Try again.`, 502)
}

// Makes a secret gist: anyone with the link can open it, nobody finds it by search.
export async function createGist({ token, filename, content, description, fetch = globalThis.fetch }) {
  if (!token) throw fail('Add a GitHub token in Connections to share as a gist. Download the file instead to share without one.')
  if (content.length > SHARE_LIMIT) throw fail('This is larger than 1 MB, too large to share.')
  let res
  try {
    res = await fetch(`${API}/gists`, { method: 'POST', headers: { ...headers(token), 'Content-Type': 'application/json' }, body: JSON.stringify({ description, public: false, files: { [filename]: { content } } }) })
  } catch { throw fail('Could not reach GitHub. Check your connection.', 502) }
  const data = await res.json().catch(() => null)
  if (!res.ok) throw githubError(res, data, 'making the gist')
  if (typeof data?.html_url !== 'string' || !data.html_url.startsWith('https://gist.github.com/')) throw fail('GitHub answered without a gist link. Try again.', 502)
  return { url: data.html_url, id: data.id }
}

// Reads one file from a gist: the one whose name ends with suffix, else the only JSON file.
export async function readGist(link, { suffix, token, fetch = globalThis.fetch } = {}) {
  const id = gistId(link)
  let res
  try { res = await fetch(`${API}/gists/${id}`, { headers: headers(token) }) } catch { throw fail('Could not reach GitHub. Check your connection.', 502) }
  if (!res.ok) throw githubError(res, await res.json().catch(() => null), 'reading the gist')
  let data
  try { data = JSON.parse(await readLimited(res, SHARE_LIMIT * 4)) } catch (e) { throw e.status ? e : fail('GitHub sent a gist this app cannot read.', 502) }
  const files = Object.values(data?.files || {}).filter((f) => f && typeof f.filename === 'string')
  const json = files.filter((f) => f.filename.endsWith('.json'))
  const file = files.find((f) => f.filename.endsWith(suffix)) || (json.length === 1 ? json[0] : null)
  if (!file) throw fail(`This gist has no ${suffix} file.`)
  // GitHub cuts file content off at 1 MB in this answer; a shared flow or format is far smaller.
  if (file.truncated || typeof file.content !== 'string' || file.content.length > SHARE_LIMIT) throw fail('The file in this gist is larger than 1 MB, too large to import.', 413)
  const url = typeof data.html_url === 'string' && data.html_url.startsWith('https://gist.github.com/') ? data.html_url : `https://gist.github.com/${id}`
  const owner = typeof data.owner?.login === 'string' ? data.owner.login.slice(0, 40) : ''
  return { text: file.content, origin: { kind: 'gist', url, id, owner, name: file.filename.slice(0, 120) } }
}
