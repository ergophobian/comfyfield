import { models } from './catalog.js'
import { estimate } from '../../shared/mapping.js'

export const cinemaModel = models.find((model) => model.id === 'comfy-ltx25')
export const cinemaExample = 'A courier in a silver raincoat finds a glowing portal in a rain-soaked alley. The ring materialises from sparks, folds the street upward, and opens onto a sunlit ocean. Three cinematic shots, one continuous magical event.'
export const cinemaExamplePlan = {
  title: 'The folded alley',
  shots: [
    { prompt: 'A courier in a silver raincoat stops in a rain-soaked alley. Violet sparks trace a ring in the wet air, reflecting in the pavement.', camera: 'Slow dolly toward the ring', duration: 5, continuity: 'Silver raincoat, black satchel, violet rim light, courier faces screen right.' },
    { prompt: 'A glowing violet portal unfolds in a rain-soaked alley beside a courier in a silver raincoat. The street bends upward like a sheet, bricks lifting into an arch.', camera: 'Low orbit around the forming portal', duration: 5, continuity: 'Silver raincoat, black satchel, violet rim light, courier faces screen right.' },
    { prompt: 'A courier in a silver raincoat steps through a violet portal in the folded alley. A sunlit ocean appears inside the ring; sea spray spills onto wet pavement.', camera: 'Track right behind the courier', duration: 5, continuity: 'Silver raincoat, black satchel, violet rim light, courier exits screen right.' },
  ],
}

export const cinemaInstructions = `Plan a cinematic scene for LTX-2.5. Return only a JSON object with this shape:
{"title":"Short sentence case title","shots":[{"prompt":"Concrete visible action and cinematic lighting","camera":"One camera move","duration":5,"continuity":"Repeat subject, wardrobe, location, light and screen direction across shots"}]}.
Use 3 to 6 shots, preferably 3. Duration must be 5, 8 or 10 seconds. Keep each field under 600 characters, and the entire response concise. Each prompt must stand alone: repeat the subject and setting instead of saying same as before. Build a clear beginning, visible transformation and payoff. For a visual effect, describe its physical progression and interaction with the environment. No markdown, commentary, rendering commands or model choices. The creator will edit and approve this plan before generating.`

const text = (value, label, max = 600) => {
  if (typeof value !== 'string' || !value.trim() || value.length > max) throw new Error(`${label} needs 1–${max} characters.`)
  return value.trim()
}

// Ignore commentary and fences, but respect braces and escaped quotes inside JSON strings.
function planJson(value) {
  const start = value.indexOf('{')
  let depth = 0
  let quoted = false
  let escaped = false
  for (let index = start; start >= 0 && index < value.length; index++) {
    const char = value[index]
    if (quoted) {
      if (escaped) escaped = false
      else if (char === '\\') escaped = true
      else if (char === '"') quoted = false
    } else if (char === '"') quoted = true
    else if (char === '{') depth++
    else if (char === '}' && --depth === 0) return value.slice(start, index + 1)
  }
  throw new Error('No complete scene object')
}

export function validateCinemaPlan(value) {
  let plan = value
  if (typeof value === 'string') {
    if (value.length > 16000) throw new Error('The shot plan is too long. Try a shorter idea.')
    try { plan = JSON.parse(planJson(value)) }
    catch { throw new Error('The director returned an invalid shot plan. Try planning again.') }
  }
  if (!plan || !Array.isArray(plan.shots) || plan.shots.length < 2 || plan.shots.length > 6) throw new Error('A scene needs 2 to 6 shots. Try planning again.')
  return {
    title: text(plan.title, 'Scene title', 100),
    shots: plan.shots.map((shot, index) => {
      const seconds = shot && (typeof shot.duration === 'number' || typeof shot.duration === 'string') ? Number(shot.duration) : NaN
      if (!Number.isFinite(seconds) || seconds <= 0) throw new Error(`Shot ${index + 1} needs a positive duration in seconds.`)
      const duration = cinemaModel.durations.reduce((best, next) => Math.abs(next - seconds) < Math.abs(best - seconds) ? next : best)
      const image = shot.image
      if (image && (typeof image.url !== 'string' || !image.url.startsWith('/media/'))) throw new Error(`Shot ${index + 1} needs an uploaded start frame.`)
      return {
        prompt: text(shot.prompt, `Shot ${index + 1} prompt`),
        camera: text(shot.camera, `Shot ${index + 1} camera move`),
        continuity: text(shot.continuity, `Shot ${index + 1} continuity notes`),
        duration,
        ...(image && { image: { url: image.url, name: image.name || 'Start frame' } }),
      }
    }),
  }
}

export const cinemaPrompt = (shot) => `${shot.prompt}\nCamera: ${shot.camera}\nContinuity: ${shot.continuity}`

// The audit baseline is $0.08 for a 5-second Cloud clip, not a provider quote.
// Use the shared cost helper so the estimate follows every shot's edited duration.
export function cinemaCost(shots) {
  return shots.reduce((sum, shot) => sum + estimate(cinemaModel, { price: { amount: 0.08 / 5, unit: 'second', estimate: true } }, shot).usd, 0)
}

export function cinemaFlow(value, { id = crypto.randomUUID(), aspect = '16:9', idea = '' } = {}) {
  const plan = validateCinemaPlan(value)
  const nodes = []
  const edges = []
  const node = (id, type, x, y, data) => nodes.push({ id, type, position: { x, y }, data })
  const link = (source, target) => edges.push({ id: `${source}-${target}`, source, target })
  plan.shots.forEach((shot, index) => {
    const id = `shot-${index + 1}`
    const y = index * 280
    if (shot.image) {
      node(`${id}-frame`, 'image', 0, y, { url: shot.image.url, name: shot.image.name })
      link(`${id}-frame`, id)
    }
    node(id, 'model', 340, y, { model: cinemaModel, kind: 'video', prompt: cinemaPrompt(shot), duration: shot.duration, aspect, takes: 1, count: 1, cinemaShot: shot })
    node(`${id}-approve`, 'approve', 700, y, {})
    link(id, `${id}-approve`)
    link(`${id}-approve`, 'scene-stitch')
  })
  node('scene-stitch', 'stitch', 1060, 0, { clips: [], aspect, manual: true })
  node('scene-output', 'output', 1420, 0, {})
  node('scene-brief', 'note', 0, -280, { text: idea })
  link('scene-stitch', 'scene-output')
  return { id, name: plan.title, nodes, edges, updated: Date.now() }
}
