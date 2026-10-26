import path from 'node:path'
import { fileURLToPath } from 'node:url'
import { cinemaExamplePlan, cinemaCost, cinemaPrompt, cinemaModel } from '../src/lib/cinema.js'
import { models } from '../src/lib/catalog.js'
import { comfyVars, comfyRouterInput, cloudEstimate, estimate } from '../shared/mapping.js'
import { plans } from './live-run.mjs'

export const editPrompt = 'Change only the red ceramic cup to cobalt blue. Preserve the cup shape, handle, wooden table, framing, soft daylight and shadows. Add nothing else.'
export function demoPlan() {
  const jobs = [...cinemaExamplePlan.shots, { ...cinemaExamplePlan.shots[1], camera: 'Slow push toward the forming portal' }].map((shot, index) => ({
    job: index < 3 ? `Shot ${index + 1}` : 'Regenerate shot 2', model: cinemaModel.id, workflow: 'ltx25_t2v',
    vars: comfyVars('video', { ...shot, prompt: cinemaPrompt(shot), aspect: '16:9', count: 1 }, cinemaModel.sizes),
    cinemaEstimate: cinemaCost([shot]), computeEstimate: cloudEstimate(cinemaModel, shot).usd,
  }))
  const model = models.find((model) => model.id === 'comfy-router-flux')
  const second = { job: 'Cup color edit', model: model.id, endpoint: model.model, input: comfyRouterInput(model.model, { prompt: editPrompt, image: '/media/recording-source-cup.png', aspect: '1:1' }), estimate: estimate(model, { price: model.price }, { count: 1 }).usd }
  return { dryRun: true, keysChecked: false, minimalHarness: plans.cloud, cinemaJobs: jobs, second,
    totalCinemaEstimate: jobs.reduce((n, job) => n + job.cinemaEstimate, 0) + second.estimate,
    totalComputeEstimate: jobs.reduce((n, job) => n + job.computeEstimate, 0) + second.estimate,
  }
}
if (process.argv[1] && path.resolve(process.argv[1]) === fileURLToPath(import.meta.url)) console.log(JSON.stringify(demoPlan(), null, 2))
