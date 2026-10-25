// A stand-in for the YouTube Data API v3 with the response shapes of channels.list and playlistItems.list.
// No key reaches it and no request leaves the machine. Image URLs point at `imageBase`.
export function youtubeMock({ imageBase = 'https://yt3.example', hidden = false } = {}) {
  const calls = []
  const channel = {
    id: 'UCmockNightDrives000000a',
    snippet: { title: 'Night Drives', customUrl: '@nightdrives', thumbnails: { high: { url: `${imageBase}/avatar.svg` } } },
    statistics: { subscriberCount: '128400', videoCount: '212', hiddenSubscriberCount: hidden },
    contentDetails: { relatedPlaylists: { uploads: 'UUmockNightDrives000000a' } },
    brandingSettings: { image: { bannerExternalUrl: `${imageBase}/banner.svg` } },
  }
  const titles = ['Tokyo after rain, 4K', 'Neon tunnel loop', 'Seoul at 3am', 'Highway lights, no talking', 'Harbor fog drive', 'Rooftop parking, dawn', 'An older upload']
  const uploads = titles.map((title, i) => ({
    snippet: { title, publishedAt: `2026-10-${String(20 - i).padStart(2, '0')}T12:00:00Z`, thumbnails: { medium: { url: `${imageBase}/thumb-${i + 1}.svg` } } },
    contentDetails: { videoId: `vid${i + 1}`, videoPublishedAt: `2026-10-${String(20 - i).padStart(2, '0')}T12:00:00Z` },
  }))
  const respond = (status, body) => ({ ok: status < 400, status, json: async () => body })
  const fetch = async (href) => {
    const url = new URL(href)
    calls.push(url)
    const p = url.searchParams
    if (p.get('key') !== 'mock-youtube-key') return respond(400, { error: { code: 400, message: 'API key not valid. Please pass a valid API key.' } })
    if (url.pathname.endsWith('/channels')) {
      const match = p.get('forHandle')?.toLowerCase() === '@nightdrives' || p.get('id') === channel.id
      return respond(200, { items: match ? [channel] : [] })
    }
    if (url.pathname.endsWith('/playlistItems')) {
      if (p.get('playlistId') !== channel.contentDetails.relatedPlaylists.uploads) return respond(404, { error: { message: 'Playlist not found' } })
      return respond(200, { items: uploads.slice(0, Number(p.get('maxResults')) || 5) })
    }
    return respond(404, {})
  }
  return { fetch, calls, channel }
}
