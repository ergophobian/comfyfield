const seconds = (n) => Number(n.toFixed(2))

export function upscaleOutput(media, factor, cap) {
  const [width, height] = (media?.ratio || '').split(':').map(Number)
  if (!(width > 1 && height > 1)) return null
  const scale = Math.max(1, Math.min(Number(factor), cap / Math.max(width, height)))
  return { width: Math.round(width * scale), height: Math.round(height * scale), scale }
}

export function studioLimitNote(format, values = {}) {
  if (['image-upscale', 'video-upscale'].includes(format.id)) {
    const cap = format.kind === 'video' ? 3840 : 4096
    const media = values[format.kind === 'video' ? 'video' : 'image']
    const output = upscaleOutput(media, values.factor || 2, cap)
    return `${output ? `Expected output: about ${output.width} × ${output.height} (${seconds(output.scale)}x). ` : ''}Enlargement stops at a ${cap}px long edge. Sources already above it keep their size.`
  }
  if (format.id === 'lipsync') {
    const trim = values.video?.trim
    const start = trim?.start || 0
    const duration = Math.min(30, trim ? trim.end - start : 5)
    return `Effective range: ${seconds(start)}–${seconds(start + duration)} seconds of video, or its end if shorter. New audio starts at 0 and is trimmed to that duration. Maximum 30 seconds.`
  }
  const capped = ['edit-video', 'video-character-swap', 'reshoot', 'color-grade'].includes(format.id) || format.category === 'mixed'
  if (!capped) return null
  const stride = format.category === 'mixed' ? { '8': 3, '12': 2, '24': 1 }[values.fps || '12'] : format.id === 'color-grade' ? 2 : 1
  const start = values.video?.trim?.start || 0
  const exampleEnd = seconds(start + 81 * stride / 30)
  return `Effective range: from ${seconds(start)} seconds, up to 81 ${stride > 1 ? 'sampled' : 'source'} frames, rounded down to groups of four plus one. ${stride > 1 ? `Every ${stride === 2 ? 'second' : 'third'} source frame is used. ` : ''}At 30 fps this ends by ${exampleEnd} seconds, or the selected end if earlier. Time coverage varies with the source frame rate. The rest of the selected clip is not generated.`
}
