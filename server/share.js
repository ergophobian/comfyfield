// Share and import flows: a secret gist made with the user's token, or a gist or file read back in.
import * as core from './core.js'
import { createGist, readGist } from './gist.js'
import { FLOW_SUFFIX, parseSharedFlow, shareFileName, shareText } from '../shared/flowShare.js'

const fail = (message, status = 400) => Object.assign(new Error(message), { status })
export const githubToken = () => core.config('github').key
// The browser sends a bare file name; drop any folders either way, whatever the server's OS.
export const fileOrigin = (name) => ({ kind: 'file', name: (String(name || '').split(/[\\/]/).pop() || 'a file').slice(0, 120) })

export async function shareFlowGist(flows, id, { fetch = globalThis.fetch, token = githubToken() } = {}) {
  if (typeof id !== 'string') throw fail('Pick a flow to share.')
  const flow = flows.get(id)
  if (!flow.nodes.length) throw fail('Add nodes before you share this flow.')
  return createGist({ token, fetch, filename: shareFileName(flow.name), content: shareText(flow), description: `ComfyField flow: ${flow.name}` })
}

// { gist } reads a gist; { text, name } is a file the user picked.
export async function importFlow(flows, input, { fetch = globalThis.fetch, token = githubToken(), now = Date.now() } = {}) {
  if (!input || typeof input !== 'object') throw fail('Send a gist link or a flow file.')
  const source = input.gist != null ? await readGist(input.gist, { suffix: FLOW_SUFFIX, token, fetch })
    : typeof input.text === 'string' ? { text: input.text, origin: fileOrigin(input.name) }
      : null
  if (!source) throw fail('Send a gist link or a flow file.')
  const flow = parseSharedFlow(source.text)
  return flows.insert({ ...flow, origin: { ...source.origin, at: now } })
}
