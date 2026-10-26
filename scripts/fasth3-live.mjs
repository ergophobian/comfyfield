// FastH3 cases stay available for planning; paid execution needs live-run ledger admission.
const args = process.argv.slice(2)
const flag = (name) => (args.find((a) => a.startsWith(`--${name}=`)) || '').slice(name.length + 3)
const pics = flag('pics').split(',').filter(Boolean)
const clip = flag('clip')
const voice = flag('voice')

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
