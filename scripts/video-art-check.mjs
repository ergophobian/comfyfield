import assert from 'node:assert/strict'
import { readFileSync, readdirSync, statSync } from 'node:fs'
import { artEntry, heroArt, toolArt } from '../src/lib/formats/art.js'
import { allFormats } from '../src/lib/formats/index.js'
import { tools } from '../src/lib/tools.js'
import { createCoverPlayback } from '../src/lib/artPlayback.js'

const directory = new URL('../public/art/video/', import.meta.url)
const ids = JSON.parse(readFileSync(new URL('index.json', directory)))
assert(Array.isArray(ids), 'Video index must be an array')
assert.equal(new Set(ids).size, ids.length, 'Video ids must be unique')
const catalog = [...allFormats, ...tools].map(({ id }) => id)
for (const id of ids) {
  assert.match(id, /^[a-z0-9]+(?:-[a-z0-9]+)*$/)
  const entry = artEntry(id)
  assert.equal(entry.video, `/art/video/${id}.mp4`, `Missing video lookup: ${id}`)
  assert.equal(entry.poster, `/art/video/${id}.webp`, `Missing poster lookup: ${id}`)
  assert(catalog.some((key) => artEntry(key).video === entry.video), `No catalog entry resolves ${id}`)
  for (const [extension, limit] of [['mp4', 600000], ['webp', 80000]]) {
    const path = new URL(`${id}.${extension}`, directory)
    const size = statSync(path).size
    assert(size > 0 && size < limit, `${id}.${extension}: ${size} bytes exceeds budget ${limit}`)
    const bytes = readFileSync(path)
    if (extension === 'webp') {
      assert.equal(bytes.toString('ascii', 0, 4), 'RIFF')
      assert.equal(bytes.toString('ascii', 8, 12), 'WEBP')
    } else assert.equal(bytes.toString('ascii', 4, 8), 'ftyp')
  }
}
assert.deepEqual(readdirSync(directory).filter((file) => !file.startsWith('._') && file.endsWith('.mp4')).map((file) => file.slice(0, -4)).sort(), [...ids].sort(), 'Index must include every encoded clip')
assert.equal(artEntry(undefined, toolArt('influencer')).video, artEntry('ai-influencer-video').video)
assert.equal(artEntry(undefined, heroArt('cinema')).video, artEntry('cinema-studio').video)
assert.equal(artEntry(undefined, heroArt('effects')).video, artEntry('turn-to-sand').video)
assert.equal(artEntry('unknown-format').video, undefined)
assert.equal(artEntry('unknown-format').still, undefined)

let hidden = false
const playback = createCoverPlayback(() => hidden)
const videos = Array.from({ length: 6 }, () => ({
  paused: true,
  play() { this.paused = false; return Promise.resolve() },
  pause() { this.paused = true },
}))
const covers = videos.map((video) => playback.add(video, () => assert.fail('Unexpected playback error')))
const playing = () => videos.filter((video) => !video.paused).length
covers[0].visibility(0.49)
assert.equal(playing(), 0, 'Less than half visible must not play')
covers.forEach((cover) => cover.visibility(0.5))
assert.equal(playing(), 4, 'Only four videos may reserve playback slots')
assert(videos[4].paused && videos[5].paused)
covers[0].visibility(0)
assert(videos[0].paused && !videos[4].paused, 'Leaving the viewport hands its slot to a waiting cover')
hidden = true
playback.schedule()
assert.equal(playing(), 0, 'A hidden tab must pause all covers')
hidden = false
playback.schedule()
assert.equal(playing(), 4)
covers.forEach((cover) => cover.remove())
assert.equal(playing(), 0, 'Unmount must release all slots')
await Promise.resolve()
assert.equal(playing(), 0, 'Settling pending play promises must not restart removed covers')
console.log(`video art ok: ${ids.length} catalog clips with mp4 < 600000 bytes and webp < 80000 bytes; tool, hero and format lookups resolve; half-visible threshold, four-slot limit, waiting covers, hidden tab and cleanup pass`)
