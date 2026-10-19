import { comfyRouterInput } from '../../shared/mapping.js'

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
    call.files = await submit({ model: batch.model, input: batch.input, idempotencyKey: call.idempotencyKey })
    onFiles?.(call.files, index)
  }
  return batch.calls.flatMap((call) => call.files)
}
