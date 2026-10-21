import { uploadMedia } from '../components/widgets/media.js'

// Image nodes keep a /media/... URL from /api/upload. Older flows stored data URLs, which still load and run as is.
export const isDataUrl = (url) => typeof url === 'string' && url.startsWith('data:')

export const legacyImages = (flow) => flow.nodes.filter((n) => n.type === 'image' && isDataUrl(n.data?.url))

export async function uploadFlowImage(file) {
  if (!file?.type?.startsWith('image/')) throw new Error('Choose an image file.')
  try {
    const { url, name } = await uploadMedia(file)
    return { url, name }
  } catch (e) {
    throw e instanceof TypeError ? new Error('Could not reach the local server. Try again.') : e
  }
}

// Moves a stored data URL into /media so the saved flow stays small. The caller keeps the data URL if this fails.
export async function migrateDataUrl(dataUrl) {
  const res = await fetch('/api/upload', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ dataUrl }) })
  const data = await res.json().catch(() => ({}))
  if (!res.ok || !data.url) throw new Error(data.error || `Upload failed (${res.status})`)
  return data.url
}

// Patches one node in a named flow, so an upload that ends after the user opens another flow still lands in the right one.
// With `from`, the patch applies only while the node still holds that URL.
export const patchNode = (store, flowId, nodeId, data, from) => ({
  ...store,
  flows: store.flows.map((f) => (f.id !== flowId ? f : {
    ...f, updated: Date.now(), nodes: f.nodes.map((n) => (n.id === nodeId && (from === undefined || n.data?.url === from) ? { ...n, data: { ...n.data, ...data } } : n)),
  })),
})
