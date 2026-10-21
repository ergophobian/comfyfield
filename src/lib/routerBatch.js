import { comfyRouterInput } from '../../shared/mapping.js'

// Ambiguous failures reconcile an accepted request; terminal failures need a fresh request.
export function keepRequestKey(error) {
  if (typeof error.retryable === 'boolean') return error.retryable
  if (['insufficient_credits', 'job_failed', 'prompt_failed', 'prompt_filtered'].includes(error.code)) return false
  return !error.status || error.status === 408 || error.status === 429 || error.status >= 500
}

// Keep the original body and one key per image for the lifetime of a logical batch.
export function createRouterBatch(model, opts) {
  const count = model.kind === 'image' ? opts.count || 1 : 1
  if (!Number.isInteger(count) || count < 1) throw new Error('Image count must be a positive integer.')
  return {
    model: model.model,
    input: structuredClone(comfyRouterInput(model.model, opts)),
    calls: Array.from({ length: count }, () => ({ idempotencyKey: crypto.randomUUID(), files: null })),
  }
}

export async function runRouterBatch(batch, submit, onFiles) {
  for (const [index, call] of batch.calls.entries()) {
    if (call.files) continue
    try {
      call.files = await submit({ model: batch.model, input: batch.input, idempotencyKey: call.idempotencyKey })
    } catch (error) {
      if (!keepRequestKey(error)) call.idempotencyKey = crypto.randomUUID()
      throw error
    }
    onFiles?.(call.files, index)
  }
  return batch.calls.flatMap((call) => call.files)
}
