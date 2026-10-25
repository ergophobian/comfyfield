// Graphs that make one fixed-length chunk, and how the server chains chunks into one longer video.
// `clip`: a video edit that reads at most `frames` frames of its clip. Each next chunk starts `anchor`
// frames before the last one ended, takes the last chunk's output as `{{previous}}`, and the model
// redraws those anchor frames from it, so the seams blend over them. SCAIL-2 is trained on 81-frame
// chunks with a 5-frame anchor (a 76-frame step); Wan Animate 2 continues from the last frame only.
// `extend`: a text or image to video graph whose run is longer than `first` seconds opens with one
// chunk, then `extend` continues the last `tail` frames of each chunk by up to `next` seconds.
export const CHAINS = {
  scail2_character_swap: { mode: 'clip', frames: 81, anchor: 5, blend: true },
  wan_animate2: { mode: 'clip', frames: 81, anchor: 1, blend: false },
  h3_open_t2v: { mode: 'extend', extend: 'h3_extend', first: 10, next: 8, tail: 24, fps: 24 },
  h3_open_i2v: { mode: 'extend', extend: 'h3_extend', first: 10, next: 8, tail: 24, fps: 24 },
}

// Each chunk is a full GPU run, so a chain stops at this many.
export const MAX_CHUNKS = 16
export const MAX_SECONDS = 60

const tooLong = (message) => Object.assign(new Error(message), { status: 400 })

// The frames a Wan-family graph renders from `n` input frames: 4k + 1, as the graphs round them.
export const wanFrames = (n) => 4 * Math.floor((n - 1) / 4) + 1

// Chunks for a clip of `total` frames: where each starts in the clip, how many frames it reads, and how
// many of its first frames overlap the chunk before. One chunk means the graph runs as it is.
export function clipChunks(total, { frames, anchor }, fps = 24) {
  if (!(total > 0)) return []
  const step = frames - anchor
  const chunks = []
  for (let from = 0; ; from += step) {
    const count = wanFrames(Math.min(frames, total - from))
    chunks.push({ from, count, overlap: from ? anchor : 0 })
    // A next chunk must add at least 4 new frames past its anchor.
    if (from + frames >= total || total - (from + step) - anchor < 4) break
  }
  if (chunks.length > MAX_CHUNKS) {
    throw tooLong(`This clip needs ${chunks.length} segments and the most is ${MAX_CHUNKS}. Trim it to ${Math.floor((MAX_CHUNKS * step + anchor) / fps)} seconds or less.`)
  }
  return chunks
}

// The new frames H3 adds after its `tail` guide frames for a run of `seconds`, as h3_extend counts them.
export function h3ExtendFrames(seconds, tail = 22) {
  const x = Math.max(5, tail + Math.round(seconds * 24))
  return x + (((5 - (x % 17)) % 17) + 17) % 17 - tail
}

// Seconds for each chunk of an extend chain, so they add up to at least `total`. The join trims the end.
export function extendChunks(total, { first, next }) {
  if (!(total > first)) return [total]
  if (total > MAX_SECONDS) throw tooLong(`A long video can run up to ${MAX_SECONDS} seconds.`)
  const chunks = [first]
  let covered = first
  while (covered < total) {
    // h3_extend makes at least 3 seconds; a shorter last part is trimmed after the join.
    const seconds = Math.max(3, Math.min(next, Math.ceil(total - covered)))
    chunks.push(seconds)
    covered += h3ExtendFrames(seconds) / 24
  }
  return chunks
}
