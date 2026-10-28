import { formatById, isWired } from './formats/index.js'
import { toRef } from './useLibrary.js'

// Formats a saved character can open, with the values that put the character in. The first three make
// content, the rest bring the character into a video that already exists ("any trend").
const uses = [
  ['influencer-post', (ref) => ({ character: ref })],
  ['ai-influencer-video', (ref) => ({ character: ref })],
  ['character-scene', (ref) => ({ character: ref })],
  ['motion-transfer', (ref) => ({ image: picture(ref, 0) }), 'Copy the moves from a video'],
  ['video-character-swap', (ref) => ({ source: 'character', character: ref }), 'Put them into a video'],
  ['earn-influencer-trend', (ref) => ({ source: 'character', character: ref }), 'Take over a trend clip'],
  ['earn-influencer-product', (ref) => ({ character: picture(ref, 0) }), 'A selfie post with your product'],
  // Mix references takes plain pictures, so the character's reference set fills the first three.
  ['omni-reference', (ref) => Object.fromEntries(ref.images.slice(0, 3).map((url, i) => [`ref${i + 1}`, picture(ref, i)])), 'Pictures, a clip and a voice'],
  ['multi-shot', (ref) => ({ character: ref })],
  ['ugc-ad', (ref) => ({ character: ref })],
  ['face-swap', (ref) => ({ character: ref })],
  ['character-swap', (ref) => ({ character: ref })],
  ['face-swap-video', (ref) => ({ source: 'character', character: ref })],
]

const picture = (ref, i) => ({ url: ref.images[i], name: ref.name })

export const trendIds = ['earn-influencer-trend', 'motion-transfer', 'video-character-swap', 'omni-reference']

// Menu items for a UseMenu. `only` keeps the listed formats, in the listed order.
export function characterUses(item, openFormat, only) {
  const ref = toRef('character', item)
  const list = only ? only.map((id) => uses.find((u) => u[0] === id)).filter(Boolean) : uses
  return list
    .map(([id, values, note]) => [formatById(id), values, note])
    // Formats that read plain pictures need the character to have one.
    .filter(([f]) => f && isWired(f) && (ref.images.length || !['motion-transfer', 'omni-reference', 'earn-influencer-product'].includes(f.id)))
    .map(([f, values, note]) => ({ label: f.name, note: note || (f.kind === 'video' ? 'Video' : 'Image'), onClick: () => openFormat(f.id, values(ref)) }))
}
