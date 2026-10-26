// FastH3 cases stay available for planning; paid execution needs live-run ledger admission.
const args = process.argv.slice(2)
const flag = (name) => (args.find((a) => a.startsWith(`--${name}=`)) || '').slice(name.length + 3)
const only = flag('only').split(',').filter(Boolean)
const pics = flag('pics').split(',').filter(Boolean)
const clip = flag('clip')
const voice = flag('voice')

// The template's own prompt for its plane picture, so the first case is a known-good run.
const planePrompt = 'A 5-second, multi-cut cinematic aviation film. [Shot 1] A wide shot matches <Picture 1>: the yellow propeller plane climbs straight up above the towering cumulus cloud, smoke trail curling, and the camera tilts up with it. [Shot 2] At 00:02.000, the shot cuts to a close-up of the propeller and yellow nose as it slows at the top; the plane stalls, flips over and the camera follows it diving toward the bright cloud. Sound: straining engine, wind, a sudden silence at the stall and a roaring dive, with tense rising strings.'
const userPrompt = (n) => `${Array.from({ length: n }, (_, i) => `<Picture ${i + 1}>`).join(', ')} are the references. Keep every person, product and place exactly as shown in them. A handheld cinematic shot that brings them together in one scene, with natural light and real sound.`

const cases = [
  { id: 'fast-1pic-5s', workflow: 'fasth3_omni_r2v', pictures: 1, seconds: 5 },
  { id: 'base-1pic-5s', workflow: 'h3_omni_r2v', pictures: 1, seconds: 5, note: 'Base H3, 20 steps, same graph, picture, prompt and seed.' },
  { id: 'fast-1pic-15s', workflow: 'fasth3_omni_r2v', pictures: 1, seconds: 15 },
  { id: 'fast-9pic-10s', workflow: 'fasth3_omni_r2v', pictures: 9, seconds: 10, needsPics: 2 },
  { id: 'fast-clip-voice-10s', workflow: 'fasth3_omni_r2v', pictures: 1, seconds: 10, clip: true, voice: true },
]

function runnable(c) {
  if (c.needsPics && pics.length < c.needsPics) return `needs --pics with ${c.needsPics} or more pictures`
  if (c.clip && !clip) return 'needs --clip'
  if (c.voice && !voice) return 'needs --voice'
  return null
}

if (args.includes('--plan')) {
  for (const c of cases) console.log([c.id, c.workflow, `${c.pictures} pic`, `${c.seconds}s`, c.clip ? 'clip' : '', c.voice ? 'voice' : '', runnable(c) || 'ready'].join('\t'))
  process.exit(0)
}
if (!args.includes('--run')) { console.log('Pass --plan or --run'); process.exit(1) }
throw new Error('FastH3 live runs are not available yet. Use scripts/live-run.mjs with an approved budget and its spend ledger.')
