export const voiceLimits = { bytes: 11 * 1024 * 1024, sourceSeconds: 60, minSeconds: 6, sampleSeconds: 10, rate: 24000 }
export const voiceAccept = '.wav,.mp3,.flac,.m4a,audio/wav,audio/mpeg,audio/flac,audio/mp4'

// sample feeds recipeOptions().slots.voice; url also allows reuse as an audio input.
export const voiceValue = (item) => item ? ({
  type: 'voice', id: item.id, name: item.name, sample: item.sample, url: item.sample,
  duration: item.duration, notes: item.notes || '',
}) : null
