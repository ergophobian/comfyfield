// The sound of v3: the owner's song as the track, and a sound effect on every hit the picture makes — written
// against the song (the cues are in song time, most of them on its kicks and snares). The effects sit under the
// song: they add the "thing happening" (air, impacts, clicks, paper), never another beat.
;(() => {
const M = K.music
M.setup({ bpm: 466.9, beatsPerBar: 16, offset: 0.16, key: '-', mode: 'the song', reverb: { seconds: 1.4, wet: 0.14, predelay: 0.01, dark: 0.5 }, master: 0.95, human: { time: 0.002, vel: 0.06 } })
M.track = { url: 'assets/song.mp3', gain: 0.8 }
M.limiter = 3; M.ceiling = -3.4 // the song is mastered loud (-12 LUFS alone): bring the whole mix to about -14
M.instGain = { whoosh: 0.9, paper: 1.0, pop: 0.7, scrape: 0.8, wood: 0.7, tick: 0.6, chop: 0.8, thump: 0.6, swell: 0.6 }
M.meta = { signature: "the owner's song (115 bpm, 4/4) carries the film; effects mark what the picture does", avoids: 'effects that fight the song\'s own drums' }
M.section('Intro', 0, 12.48, 'drums + melody'); M.section('Bass enters', 12.48, 16.6, 'the portal'); M.section('The drop', 16.6, 28.94, 'formats, paper, vortex'); M.section('Drums cut', 28.94, 32.94, 'the logo over the melody')

const S = window.SONG
const near = (layer, t, w = 0.06) => (S.data.layers[layer] || []).some((h) => Math.abs(h.t - t) < w)
for (const c of K.film.cues) {
  const t = c.t, L = String(c.label).toLowerCase(), onDrum = near('kick', t) || near('snare', t)
  if (c.kind === 'scene') continue
  if (/\bboom/.test(L)) { M.hit('whoosh', t - 0.42, 0.55, { len: 0.45, skew: 2.2, lo: 200, hi: 5000 }); M.hit('thump', t, onDrum ? 0.35 : 0.65); M.hit('swell', t - 0.5, 0.4, { dur: 0.5 }) }
  else if (/\bslam/.test(L)) { M.hit('whoosh', t - 0.1, 0.3, { len: 0.12, skew: 3, lo: 1500, hi: 6000 }); if (!onDrum) M.hit('chop', t, 0.35) }
  else if (/\bstop\b/.test(L)) { M.hit('wood', t, 0.7, { tone: 2200 }); M.hit('tick', t + 0.03, 0.5, { tone: 5200 }) }
  else if (/\bspin/.test(L)) { for (let k = 0; k < 8; k++) M.hit('tick', t + k * 0.06, 0.25 - k * 0.02, { tone: 4200 - k * 150 }) }
  else if (/\bburst/.test(L)) M.hit('whoosh', t, 0.38, { len: 0.35, lo: 700, hi: 4500 })
  else if (/\bdive/.test(L)) M.hit('whoosh', t - 0.3, 0.6, { len: 0.6, skew: 1.6, lo: 250, hi: 5500 })
  else if (/\bwhoosh/.test(L)) M.hit('whoosh', t - 0.15, 0.4, { len: 0.32, skew: 1.6, lo: 500, hi: 4000 })
  else if (/\bflip/.test(L)) { for (let k = 0; k < 5; k++) M.hit('tick', t + k * 0.035, 0.22, { tone: 3000 + k * 400, pan: -0.6 + k * 0.3 }) }
  else if (/\bpop/.test(L)) M.hit('pop', t, 0.5, { tone: 520 + (Math.round(t * 10) % 5) * 80 })
  else if (/\bland/.test(L)) { M.hit('pop', t, 0.45, { tone: 380 }); if (!onDrum) M.hit('wood', t, 0.35, { tone: 900 }) } // a knock, not a kick: a thump here made ghost kicks between the song's own
  else if (/\btear/.test(L)) { M.hit('paper', t - 0.05, 1.0, { len: 0.7, tone: 3000 }); M.hit('scrape', t, 0.5, { dur: 0.5, rate: 50 }) }
  else if (/\bink/.test(L)) M.hit('scrape', t, 0.45, { dur: 0.4, rate: 28, tone: 1800 })
  else if (/\bcut/.test(L)) M.hit('paper', t, 0.5, { len: 0.2, tone: 4000 })
  else if (/\brise/.test(L)) M.hit('whoosh', t - 0.2, 0.25, { len: 0.3, skew: 0.7, lo: 300, hi: 1800 })
  else M.hit('pop', t, 0.3)
}
})()
