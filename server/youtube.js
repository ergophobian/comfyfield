// A workspace's YouTube channel through the YouTube Data API v3: the channel, then its six latest
// uploads. Images are saved to local media so the header still shows offline; the data is cached
// in workspaces.json until the user refreshes it.
const API = 'https://www.googleapis.com/youtube/v3'
const fail = (message, status = 400) => Object.assign(new Error(message), { status })

// A channel URL, an @handle, a bare handle or a UC… channel id.
export function parseChannel(input) {
  const raw = String(input || '').trim()
  if (!raw) throw fail('Paste a YouTube channel link or @handle.')
  let text = raw
  if (/^(https?:\/\/)?(www\.|m\.)?youtube\.com\//i.test(raw)) {
    const url = new URL(/^https?:/i.test(raw) ? raw : `https://${raw}`)
    const [first, second] = url.pathname.split('/').filter(Boolean)
    if (first?.startsWith('@')) text = first
    else if (first === 'channel' && second) text = second
    else if (first === 'user' && second) return { username: decodeURIComponent(second) }
    else throw fail('Use the channel link with an @handle or /channel/ in it.')
  }
  if (/^UC[\w-]{22}$/.test(text)) return { id: text }
  const handle = decodeURIComponent(text).replace(/^@/, '')
  if (!/^[\w.-]{3,30}$/.test(handle)) throw fail('That does not look like a YouTube handle.')
  return { handle: `@${handle}` }
}

const best = (thumbs = {}) => (thumbs.high || thumbs.medium || thumbs.default || {}).url || ''

export async function fetchChannel(input, { key, fetch = globalThis.fetch, cacheImage = async (url) => url } = {}) {
  if (!key) throw fail('Add a YouTube Data API key in Connections first.')
  const who = parseChannel(input)
  const get = async (path, params) => {
    let r
    try { r = await fetch(`${API}/${path}?${new URLSearchParams({ ...params, key })}`, { signal: AbortSignal.timeout(10000) }) } catch {
      throw fail('Could not reach YouTube. Check your connection.', 502)
    }
    const data = await r.json().catch(() => ({}))
    if (!r.ok) {
      const reason = data.error?.errors?.[0]?.reason
      if (r.status === 400 && /key/i.test(data.error?.message || '')) throw fail('YouTube refused the key. Check it in Connections.')
      if (r.status === 403 && /quota/i.test(reason || '')) throw fail('The YouTube key is out of quota for today.', 429)
      throw fail(`YouTube answered ${r.status}${data.error?.message ? `: ${data.error.message}` : ''}.`, 502)
    }
    return data
  }
  const lookup = who.id ? { id: who.id } : who.username ? { forUsername: who.username } : { forHandle: who.handle }
  const channel = (await get('channels', { part: 'snippet,statistics,contentDetails,brandingSettings', ...lookup })).items?.[0]
  if (!channel) throw fail(`No YouTube channel matches ${who.handle || who.id || who.username}.`, 404)
  const playlist = channel.contentDetails?.relatedPlaylists?.uploads
  const items = playlist ? (await get('playlistItems', { part: 'snippet,contentDetails', playlistId: playlist, maxResults: '6' })).items || [] : []
  const stats = channel.statistics || {}
  const uploads = []
  for (const item of items.slice(0, 6)) {
    const id = item.contentDetails?.videoId || item.snippet?.resourceId?.videoId
    if (!id) continue
    uploads.push({
      id, title: item.snippet?.title || '', published: item.contentDetails?.videoPublishedAt || item.snippet?.publishedAt || '',
      thumb: await cacheImage(best(item.snippet?.thumbnails)), url: `https://www.youtube.com/watch?v=${id}`,
    })
  }
  const banner = channel.brandingSettings?.image?.bannerExternalUrl
  return {
    input: String(input).trim(), id: channel.id, handle: channel.snippet?.customUrl || who.handle || '',
    title: channel.snippet?.title || '', avatar: await cacheImage(best(channel.snippet?.thumbnails)),
    banner: banner ? await cacheImage(`${banner}=w1280`) : '',
    subscribers: stats.hiddenSubscriberCount ? null : Number(stats.subscriberCount ?? NaN) || 0,
    videos: Number(stats.videoCount || 0), uploads, fetched: Date.now(),
  }
}
