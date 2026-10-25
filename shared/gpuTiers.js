// Session tiers: which GPU a Pod starts on for a job. A job's run time on a GPU is its time on the
// reference GPU divided by that GPU's speed, and its cost is that time at the GPU's price per hour.
//   Budget       the lowest estimated cost per job
//   Balanced     faster than Budget, for at most BALANCED_CAP times Budget's cost per job
//   Performance  the fastest GPU
// Each tier is an ordered list: the Pod starts on the first GPU RunPod has free, and every fitting GPU
// is on every list, so a tier only fails when RunPod has no fitting GPU free at all.
export const TIERS = [
  { id: 'budget', name: 'Budget', blurb: 'Lowest cost per job' },
  { id: 'balanced', name: 'Balanced', blurb: 'Faster, for a little more per job' },
  { id: 'performance', name: 'Performance', blurb: 'The fastest GPU' },
]
export const TIER_IDS = TIERS.map((t) => t.id)
export const DEFAULT_TIER = 'balanced'
export const BALANCED_CAP = 1.5

// Speed against the reference GPU, the RTX PRO 6000 Blackwell that Comfy Cloud also runs (1 = as fast).
// Measured: the RTX PRO 4500 took 105.8 s for an LTX-2.5 clip the PRO 6000 made in a median 63.0 s
// (PatchWork run log, 2026-10-19). The rest are estimates from each card's dense FP8/BF16 throughput
// and memory bandwidth, to be replaced by the run times Pods log.
export const GPU_SPEED = {
  'NVIDIA RTX PRO 4000 Blackwell': 0.45,
  'NVIDIA RTX PRO 4500 Blackwell': 0.6,
  'NVIDIA RTX PRO 6000 Blackwell Server Edition': 1,
  'NVIDIA RTX PRO 6000 Blackwell Workstation Edition': 1,
  'NVIDIA H100 80GB HBM3': 1.2,
  'NVIDIA H200': 1.35,
}
// Comfy Cloud bills GPU seconds on the reference GPU. About $4.54 per GPU hour: Comfy's published
// RTX PRO 6000 rate, which matches the Cloud workflow rate.
export const CLOUD_USD_PER_GPU_SEC = 4.54 / 3600

export const speedOf = (rung) => rung.speed ?? GPU_SPEED[rung.gpuTypeId] ?? 1

// A job's run time on the reference GPU: the longest `refSec` of its model files (shared/modelFiles.js),
// since the main diffusion model sets the time, or a default when no file gives one.
export const DEFAULT_REF_SECONDS = 60
export const jobSecondsOf = (files) => Math.max(0, ...files.map((f) => f.refSec || 0)) || DEFAULT_REF_SECONDS

const key = (r) => `${r.gpuTypeId}|${r.cloudType}`

// rungs: the GPUs that fit the job, with usdPerHr (null when unknown) and inStock (null when unknown).
// refSeconds: the job's run time on the reference GPU. Returns one entry per tier.
export function tierPicks(rungs, { refSeconds = 60, cap = BALANCED_CAP } = {}) {
  const est = rungs.map((r) => {
    const seconds = refSeconds / speedOf(r)
    return { ...r, seconds, usdPerJob: r.usdPerHr == null ? null : (r.usdPerHr * seconds) / 3600 }
  })
  const cost = (r) => r.usdPerJob ?? Infinity
  const cheapest = (a, b) => cost(a) - cost(b) || a.seconds - b.seconds
  const fastest = (a, b) => a.seconds - b.seconds || cost(a) - cost(b)
  // GPUs RunPod has free move to the front, keeping the tier's order. Unknown stock counts as free.
  const free = (r) => r.inStock !== false
  const freeFirst = (list) => [...list.filter(free), ...list.filter((r) => !free(r))]

  // Budget is judged on every GPU, free or not, so its pick does not jump when stock changes.
  const budget = [...est].sort(cheapest)
  const base = budget.find(free) || budget[0]
  // Balanced: the GPUs faster than Budget's within the cap, fastest first. When none is free, it
  // falls back to Budget's list rather than to a GPU above the cap.
  const within = base ? est.filter((r) => r.seconds < base.seconds && (base.usdPerJob == null || r.usdPerJob == null || r.usdPerJob <= cap * base.usdPerJob)) : []
  const balanced = [...within.sort(fastest), ...budget.filter((r) => !within.includes(r))]
  const performance = [...est].sort(fastest)

  const pick = (id, list) => {
    const order = freeFirst(list)
    return {
      ...TIERS.find((t) => t.id === id),
      gpu: order[0] || null,
      // The GPUs a start tries, in this order.
      order: order.map(({ gpuTypeId, cloudType }) => ({ gpuTypeId, cloudType })),
      sameAs: null,
    }
  }
  const out = [pick('budget', budget), pick('balanced', balanced), pick('performance', performance)]
  // Say when two tiers land on the same GPU, so the sheet does not offer the same choice twice.
  for (let i = 1; i < out.length; i++) {
    const twin = out.slice(0, i).find((t) => t.gpu && out[i].gpu && key(t.gpu) === key(out[i].gpu))
    if (twin) out[i].sameAs = twin.id
  }
  return out
}
