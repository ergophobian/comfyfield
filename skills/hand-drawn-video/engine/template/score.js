// The music, written against the film's clock. Every cue in K.film.cues is a place the music can answer.
const M = K.music
M.setup({ bpm: 80 * 3, beatsPerBar: 6, key: 'D', mode: 'dorian', reverb: { seconds: 2.6, wet: 0.22 } }) // 6/8: eighth = 0.25 s, bar = 1.5 s
const S = M.scale('D4', 'dorian')
for (let b = 0; b < 4; b++) {
  M.note('bass', M.time(b), S(-7 + [0, 3, 4, 2][b]), 1.4, 0.7)
  ;[0, 2, 3, 5].forEach((k, i) => M.note('woodbar', M.time(b, k), S([0, 2, 4, 3][i] + b), 0.5, 0.55, { pan: -0.2 + i * 0.13 }))
  M.hit('pat', M.time(b, 3), 0.5)
}
M.hit('pop', 0.4, 0.8)
