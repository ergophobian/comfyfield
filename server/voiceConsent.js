import fs from 'node:fs'
import path from 'node:path'
import { voiceLimits } from '../shared/voices.js'
import { libraryStore } from './library.js'
import { decodeVoice } from './voices.js'

const fail = (message) => { throw Object.assign(new Error(message), { status: 400 }) }

// Inspect the bundled graph, rather than a caller-supplied format name, before any provider work.
export async function validateWorkflowVoices(workflow, template, vars, home) {
  const slots = JSON.stringify(template).includes('{{voice}}') ? ['voice'] : []
  if (workflow === 'chatterbox_clone') slots.push('audio')
  for (const slot of slots) {
    const sample = vars[slot]
    if (!sample) continue
    const record = libraryStore(home).read().voices?.find((v) => v.consent === true && (v.id === sample || v.sample === sample))
    if (record) {
      if (!(record.duration >= voiceLimits.minSeconds)) fail('Voice samples need at least 6 seconds. Save a longer sample in Library.')
      vars[slot] = record.sample
      continue
    }
    if (vars.voiceConsent !== true) fail("Confirm you have the speaker's permission to imitate this voice, or choose a consented voice from Library.")
    // Explicit consent does not make arbitrary remote files or paths safe to decode.
    if (typeof sample !== 'string' || !/^\/media\/[\w.-]+$/.test(sample)) fail('Upload a local voice sample or choose one from Library.')
    const directory = fs.realpathSync(path.join(home(), 'media'))
    let file
    try { file = fs.realpathSync(path.join(directory, path.basename(sample))) }
    catch { fail('Voice sample not found. Upload it again or choose one from Library.') }
    if (path.dirname(file) !== directory) fail('Choose a voice sample from the app media directory.')
    const seconds = (await decodeVoice(file)).length / (voiceLimits.rate * 2)
    if (seconds < voiceLimits.minSeconds || seconds > voiceLimits.sourceSeconds) fail('Use a voice sample between 6 and 60 seconds.')
  }
}
