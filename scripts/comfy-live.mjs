// Run only after a Comfy key and a live-generation budget have been authorized.
import fs from 'node:fs'
import { config, generate, listComfyRouterModels, saveFiles } from '../server/core.js'

const [mode = 'models', image] = process.argv.slice(2)
if (mode === 'models') {
  const page = await listComfyRouterModels()
  console.log(JSON.stringify(page, null, 2))
} else {
  if (!process.argv.includes('--allow-paid')) throw new Error('Live generations spend Comfy credits. Pass --allow-paid only with an approved budget.')
  const models = { router: 'comfy-router-flux', cloud: 'comfy-h3-i2v', ltx: 'comfy-ltx-i2v' }
  if (!models[mode]) throw new Error('Choose models, router, cloud or ltx.')
  if (mode !== 'router' && (!image || !fs.existsSync(image))) throw new Error('Pass a path to a start image.')
  if (mode === 'cloud' && config('comfy').mode !== 'cloud') throw new Error('This runs on Comfy Cloud: remove COMFY_MODE=local from .env.')
  const files = await generate({ model: models[mode], prompt: 'A slow camera push in, natural light', aspect: '16:9', duration: 5, image: mode === 'router' ? undefined : image })
  console.log(await saveFiles(files, 'outputs/comfy-live'))
}
