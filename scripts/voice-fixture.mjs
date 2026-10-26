// Synthetic tones exercise media persistence; they are not shipped as starter voices.
export function voiceTone(seconds) {
  const samples = Math.round(24000 * seconds)
  const out = Buffer.alloc(44 + samples * 2)
  out.write('RIFF'); out.writeUInt32LE(out.length - 8, 4); out.write('WAVE', 8)
  out.write('fmt ', 12); out.writeUInt32LE(16, 16); out.writeUInt16LE(1, 20); out.writeUInt16LE(1, 22)
  out.writeUInt32LE(24000, 24); out.writeUInt32LE(48000, 28); out.writeUInt16LE(2, 32); out.writeUInt16LE(16, 34)
  out.write('data', 36); out.writeUInt32LE(samples * 2, 40)
  for (let i = 0; i < samples; i++) out.writeInt16LE(Math.round(1200 * Math.sin(i * Math.PI * 440 / 24000)), 44 + i * 2)
  return out
}
