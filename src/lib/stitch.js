export function stitchInputs(flow, id, itemsOf, isRunning = () => false) {
  const node = flow.nodes.find((n) => n.id === id)
  // While Flows switches flows, a Stitch node from the previous flow can render once against the new one.
  if (!node) return { clips: [], options: { clips: [], aspect: '16:9' }, signature: '', blocked: true }
  const incoming = []
  let blocked = false
  for (const edge of flow.edges.filter((e) => e.target === id)) {
    const items = itemsOf(flow, edge.source)
    const videos = (items || []).filter((item) => item.kind === 'video')
    if (!videos.length || isRunning(edge.source)) blocked = true
    incoming.push(...videos.map((item) => ({ ...item, upstream: true })))
  }
  const configured = node.data.clips || []
  const clips = configured.flatMap((clip) => {
    const source = incoming.find((item) => item.id === clip.id)
    return source ? [{ ...source, ...clip, url: source.url }] : clip.upstream ? [] : [clip]
  })
  const ids = new Set(configured.map((clip) => clip.id))
  clips.push(...incoming.filter((item) => !ids.has(item.id)))
  const options = { clips: clips.map(({ url, start, end, caption }) => ({ url, start, end, caption })), aspect: node.data.aspect || '16:9', music: node.data.music }
  return { clips, options, signature: JSON.stringify(options), blocked: blocked || !clips.length }
}

export async function stitchRequest(route, payload) {
  const res = await fetch(`/api/stitch${route}`, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(payload) })
  const data = await res.json()
  if (!res.ok) throw new Error(data.error || 'Stitch failed.')
  return data
}

export async function uploadStitchFile(file) {
  const res = await fetch('/api/stitch/upload', { method: 'POST', headers: { 'Content-Type': file.type }, body: file })
  const data = await res.json()
  if (!res.ok) throw new Error(data.error || 'Upload failed.')
  return { id: crypto.randomUUID(), name: file.name, url: data.url }
}
