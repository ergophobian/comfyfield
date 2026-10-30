// ---------- 0:15 the map: four states send their food toward one street corner. The film's one dark scene.
// The outline is real: Natural Earth 1:50m admin-0 countries (public domain), Mexico's mainland with Baja plus
// its five largest islands, and the neighbours clipped to the view; Douglas-Peucker to 1.4 px at this scale.
// Points are lon/lat (2 decimals); mapP() projects them. The download lives in data/geo/ and is not needed here.
const MAP_MEX = [[-117.13,32.53],[-114.72,32.72],[-114.84,32.51],[-111.04,31.32],[-108.21,31.33],[-108.21,31.78],[-106.45,31.77],[-106.15,31.45],[-104.92,30.58],[-104.68,30.13],[-104.62,29.85],[-104.40,29.57],[-103.99,29.32],[-103.26,29.00],[-103.09,29.04],[-102.89,29.22],[-102.73,29.64],[-102.61,29.75],[-102.27,29.87],[-101.99,29.80],[-101.44,29.78],[-100.75,29.18],[-100.33,28.50],[-100.30,28.33],[-99.75,27.73],[-99.51,27.55],[-99.46,27.06],[-99.23,26.76],[-99.11,26.45],[-98.28,26.11],[-97.80,26.04],[-97.38,25.87],[-97.15,25.96],[-97.16,25.75],[-97.51,25.01],[-97.67,24.39],[-97.75,22.94],[-97.84,22.51],[-97.76,22.11],[-97.58,21.81],[-97.31,21.56],[-97.41,21.27],[-97.38,21.57],[-97.75,22.03],[-97.64,21.60],[-97.51,21.48],[-97.19,20.72],[-96.46,19.87],[-96.29,19.34],[-95.78,18.81],[-95.92,18.82],[-95.63,18.69],[-95.70,18.77],[-95.18,18.70],[-95.01,18.57],[-94.80,18.51],[-94.55,18.17],[-94.46,18.17],[-94.19,18.20],[-93.55,18.43],[-92.88,18.47],[-92.71,18.61],[-92.44,18.68],[-91.97,18.72],[-91.88,18.64],[-91.91,18.53],[-91.53,18.46],[-91.28,18.62],[-91.37,18.81],[-91.34,18.90],[-91.45,18.83],[-91.44,18.89],[-90.96,19.15],[-90.74,19.35],[-90.69,19.73],[-90.49,19.95],[-90.48,20.56],[-90.35,21.01],[-89.82,21.27],[-88.88,21.41],[-88.47,21.57],[-88.01,21.60],[-87.25,21.45],[-87.19,21.55],[-87.39,21.55],[-87.13,21.62],[-86.82,21.42],[-86.77,21.15],[-86.93,20.79],[-87.42,20.23],[-87.44,19.86],[-87.69,19.64],[-87.65,19.55],[-87.42,19.58],[-87.48,19.44],[-87.66,19.35],[-87.66,19.26],[-87.55,19.32],[-87.50,19.29],[-87.85,18.27],[-88.06,18.52],[-88.01,18.73],[-88.07,18.83],[-88.20,18.72],[-88.30,18.47],[-88.52,18.45],[-88.81,17.97],[-88.90,17.91],[-89.05,18.00],[-89.13,17.97],[-89.16,17.81],[-90.99,17.82],[-90.99,17.25],[-91.41,17.26],[-90.71,16.71],[-90.63,16.51],[-90.42,16.39],[-90.45,16.07],[-91.74,16.07],[-92.20,15.28],[-92.07,15.07],[-92.16,14.96],[-92.16,14.69],[-92.24,14.55],[-93.17,15.45],[-93.92,16.05],[-94.37,16.28],[-94.43,16.23],[-94.00,16.02],[-94.66,16.20],[-94.62,16.35],[-94.79,16.29],[-94.79,16.36],[-94.90,16.42],[-95.02,16.28],[-94.80,16.21],[-95.13,16.18],[-95.46,15.97],[-96.21,15.69],[-96.51,15.65],[-97.18,15.91],[-97.75,15.97],[-98.14,16.21],[-98.52,16.30],[-98.76,16.53],[-99.69,16.72],[-100.02,16.92],[-100.85,17.20],[-101.60,17.65],[-101.92,17.96],[-102.22,17.96],[-102.70,18.06],[-103.44,18.33],[-103.91,18.83],[-104.94,19.31],[-105.48,19.98],[-105.67,20.39],[-105.54,20.50],[-105.26,20.58],[-105.33,20.75],[-105.51,20.81],[-105.24,21.12],[-105.21,21.49],[-105.43,21.62],[-105.65,21.99],[-105.65,22.33],[-105.79,22.63],[-106.40,23.20],[-106.94,23.88],[-107.76,24.47],[-107.53,24.36],[-107.51,24.49],[-107.95,24.61],[-108.02,24.78],[-108.28,25.08],[-108.14,25.02],[-108.05,25.07],[-108.70,25.38],[-108.79,25.54],[-109.03,25.48],[-109.07,25.55],[-108.97,25.59],[-108.89,25.73],[-109.20,25.59],[-109.38,25.73],[-109.43,26.03],[-109.20,26.31],[-109.12,26.25],[-109.28,26.53],[-109.48,26.71],[-109.75,26.70],[-109.94,27.08],[-110.28,27.16],[-110.48,27.32],[-110.62,27.65],[-110.53,27.86],[-110.92,27.89],[-111.12,27.97],[-111.47,28.38],[-111.68,28.47],[-112.16,29.02],[-112.22,29.27],[-112.38,29.35],[-112.41,29.54],[-112.74,29.99],[-112.82,30.30],[-113.06,30.65],[-113.12,31.05],[-113.04,31.09],[-113.05,31.18],[-113.62,31.35],[-113.63,31.47],[-113.76,31.56],[-113.95,31.63],[-114.00,31.53],[-114.15,31.51],[-114.93,31.90],[-114.79,31.65],[-114.88,31.16],[-114.76,30.96],[-114.63,30.51],[-114.63,30.16],[-114.37,29.83],[-113.76,29.37],[-113.55,29.10],[-113.50,28.93],[-113.38,28.95],[-113.32,28.81],[-113.21,28.80],[-113.09,28.51],[-112.87,28.42],[-112.73,27.83],[-112.33,27.52],[-112.19,27.19],[-112.00,27.08],[-112.01,26.97],[-111.88,26.84],[-111.86,26.68],[-111.70,26.58],[-111.82,26.76],[-111.80,26.88],[-111.57,26.71],[-111.33,26.13],[-111.29,25.79],[-111.15,25.57],[-111.03,25.53],[-110.89,25.14],[-110.69,24.87],[-110.73,24.59],[-110.66,24.34],[-110.37,24.10],[-110.30,24.19],[-110.33,24.31],[-110.26,24.34],[-109.81,23.94],[-109.68,23.66],[-109.51,23.60],[-109.42,23.48],[-109.50,23.16],[-109.82,22.92],[-110.01,22.89],[-110.18,23.34],[-110.36,23.60],[-110.63,23.74],[-111.04,24.11],[-111.68,24.56],[-111.80,24.54],[-111.85,24.67],[-112.07,24.84],[-112.13,25.04],[-112.07,25.57],[-112.17,25.91],[-112.38,26.21],[-112.66,26.32],[-113.02,26.58],[-113.12,26.72],[-113.16,26.95],[-113.27,26.79],[-113.60,26.72],[-113.84,26.97],[-114.00,26.99],[-114.11,27.11],[-114.45,27.22],[-114.54,27.43],[-114.99,27.74],[-115.04,27.84],[-114.57,27.78],[-114.30,27.87],[-114.30,27.78],[-114.07,27.68],[-114.18,27.83],[-114.16,27.92],[-114.27,27.93],[-114.09,28.22],[-114.05,28.43],[-114.15,28.61],[-114.94,29.35],[-115.17,29.43],[-115.67,29.76],[-115.81,29.96],[-115.82,30.30],[-116.00,30.41],[-116.06,30.80],[-116.30,30.97],[-116.33,31.20],[-116.66,31.56],[-116.72,31.73],[-116.62,31.76],[-116.62,31.85],[-116.85,32.00]]
const MAP_ISLES = [[[-112.20,29.01],[-112.28,28.77],[-112.51,28.85],[-112.42,29.20],[-112.29,29.24]],[[-113.16,29.05],[-113.50,29.31],[-113.58,29.41],[-113.59,29.57],[-113.42,29.49],[-113.37,29.34],[-113.20,29.30]],[[-86.94,20.30],[-86.99,20.27],[-87.02,20.38],[-86.98,20.49],[-86.93,20.55],[-86.76,20.58]],[[-112.06,24.55],[-112.18,24.73],[-112.30,24.79],[-112.16,25.29],[-112.20,24.84]],[[-115.17,28.07],[-115.18,28.04],[-115.35,28.10],[-115.26,28.22],[-115.23,28.37],[-115.15,28.17]]]
const MAP_NEIGH = [[[-84.00,37.00],[-84.00,30.08],[-84.31,30.06],[-84.38,29.91],[-85.32,29.68],[-85.41,29.77],[-85.41,29.84],[-85.31,29.76],[-85.35,29.88],[-85.68,30.12],[-85.60,30.29],[-85.79,30.17],[-86.45,30.40],[-86.12,30.41],[-86.26,30.49],[-87.20,30.34],[-86.99,30.43],[-87.00,30.57],[-87.17,30.54],[-87.28,30.34],[-87.48,30.29],[-87.45,30.39],[-87.62,30.26],[-88.01,30.23],[-87.79,30.29],[-88.01,30.69],[-88.14,30.37],[-88.91,30.42],[-89.32,30.35],[-89.59,30.17],[-90.23,30.38],[-90.41,30.14],[-90.28,30.07],[-89.99,30.06],[-89.74,30.17],[-89.67,30.12],[-89.82,30.01],[-89.63,29.90],[-89.40,30.05],[-89.35,29.82],[-89.72,29.62],[-89.51,29.42],[-89.02,29.20],[-89.16,29.02],[-89.24,29.08],[-89.38,28.98],[-89.44,29.19],[-90.16,29.54],[-90.05,29.34],[-90.21,29.10],[-90.38,29.30],[-90.59,29.27],[-90.75,29.13],[-91.29,29.29],[-91.15,29.32],[-91.25,29.56],[-91.51,29.56],[-91.89,29.84],[-92.14,29.70],[-92.08,29.59],[-92.26,29.56],[-93.18,29.78],[-93.83,29.73],[-93.88,29.81],[-93.77,29.95],[-93.84,29.98],[-93.95,29.81],[-93.89,29.69],[-94.76,29.38],[-94.53,29.55],[-94.78,29.55],[-94.74,29.75],[-95.02,29.70],[-94.89,29.37],[-95.27,28.96],[-96.23,28.49],[-96.01,28.63],[-96.45,28.59],[-96.64,28.71],[-96.42,28.46],[-96.68,28.34],[-96.77,28.42],[-96.84,28.19],[-97.16,28.14],[-97.14,28.06],[-97.03,28.09],[-97.07,27.99],[-97.43,27.84],[-97.29,27.67],[-97.44,27.33],[-97.77,27.46],[-97.69,27.29],[-97.49,27.24],[-97.55,26.97],[-97.44,26.49],[-97.14,26.03],[-97.36,25.87],[-99.11,26.45],[-99.46,27.06],[-99.51,27.55],[-100.30,28.33],[-100.75,29.18],[-101.38,29.74],[-102.34,29.86],[-102.73,29.64],[-102.89,29.22],[-103.26,29.00],[-104.40,29.57],[-104.62,29.85],[-104.92,30.58],[-106.15,31.45],[-106.45,31.77],[-108.21,31.78],[-108.21,31.33],[-111.04,31.32],[-114.84,32.51],[-114.72,32.72],[-117.13,32.53],[-117.47,33.30],[-118.08,33.72],[-118.41,33.74],[-118.51,34.02],[-119.14,34.11],[-119.50,34.37],[-119.50,37.00]],[[-92.24,14.55],[-92.07,15.07],[-92.20,15.28],[-91.74,16.07],[-90.45,16.07],[-90.42,16.39],[-91.41,17.26],[-90.99,17.25],[-90.99,17.82],[-89.16,17.81],[-89.24,15.89],[-88.89,15.89],[-88.60,15.76],[-88.59,15.95],[-88.23,15.73],[-89.17,15.04],[-89.17,14.61],[-89.36,14.42],[-89.57,14.39],[-89.55,14.24],[-90.05,13.90],[-90.10,13.74],[-90.61,13.93],[-91.38,13.99]],[[-89.16,17.81],[-89.13,17.97],[-88.81,17.97],[-88.46,18.48],[-88.30,18.47],[-88.35,18.36],[-88.13,18.35],[-88.09,18.23],[-88.27,17.61],[-88.20,17.52],[-88.31,16.63],[-88.88,16.02],[-88.89,15.89],[-89.24,15.89]],[[-84.00,14.78],[-84.54,14.63],[-84.86,14.81],[-85.16,14.53],[-85.21,14.31],[-85.73,13.86],[-86.04,14.05],[-86.33,13.77],[-86.73,13.76],[-86.71,13.31],[-86.87,13.27],[-87.06,12.99],[-87.34,12.98],[-87.49,13.35],[-87.81,13.40],[-87.72,13.81],[-87.80,13.89],[-88.15,13.99],[-88.48,13.85],[-88.51,13.98],[-89.12,14.37],[-89.36,14.42],[-89.17,14.61],[-89.22,14.87],[-89.14,15.07],[-88.23,15.73],[-87.70,15.91],[-87.49,15.79],[-86.36,15.78],[-85.94,15.95],[-85.99,16.02],[-85.48,15.90],[-84.97,15.99],[-84.56,15.80],[-84.43,15.83],[-84.52,15.87],[-84.26,15.82],[-84.00,15.62],[-84.00,15.52],[-84.11,15.49],[-84.10,15.40],[-84.00,15.41]],[[-89.36,14.42],[-89.12,14.37],[-88.51,13.98],[-88.48,13.85],[-88.15,13.99],[-87.73,13.84],[-87.82,13.29],[-87.93,13.18],[-88.18,13.16],[-88.69,13.28],[-88.51,13.18],[-89.28,13.48],[-89.80,13.56],[-90.10,13.74],[-90.05,13.90],[-89.55,14.24],[-89.57,14.39]],[[-84.00,10.75],[-84.63,11.05],[-84.91,10.95],[-85.58,11.19],[-85.74,11.06],[-86.47,11.74],[-86.76,12.16],[-87.67,12.90],[-87.59,13.04],[-87.39,12.92],[-86.96,13.05],[-86.92,13.22],[-86.71,13.31],[-86.73,13.76],[-86.33,13.77],[-86.04,14.05],[-85.73,13.86],[-85.21,14.31],[-85.16,14.53],[-84.86,14.81],[-84.54,14.63],[-84.00,14.78]]]

// the projection: equirectangular, x squeezed by cos(23.5°), 34 px a degree; the frame is the map's neat line
const MAPV = { cx: 540, cy: 620, lon0: -101.92, lat0: 23.625, s: 34, kx: Math.cos(23.5 * Math.PI / 180) * 34 }
const mapP = (lon, lat) => [MAPV.cx + (lon - MAPV.lon0) * MAPV.kx, MAPV.cy - (lat - MAPV.lat0) * MAPV.s]
const mapPts = (ring) => ring.map(([lo, la]) => mapP(lo, la))
const MAP_FRAME = { x: 30, y: 248, w: 1020, h: 804 }
const MAP_INK = '#f1e9d6', MAP_SEA = '#18223b', MAP_LAND = '#2f4268', MAP_NLAND = '#27375a', MAP_SOFT = '#a9b6d1'
const MAP_CITY = mapP(-99.13, 19.43)
const MAP_T0 = bar(T.map[0])
// the four origins. go: local s the truck leaves; arrive: eighths after the scene starts (on the grid)
const MAP_ROUTES = [
  { food: 'CORN', state: 'Sinaloa', at: [-107.4, 24.8], via: [[-105.7, 23.5], [-103.4, 22.6], [-101.0, 21.8], [-99.5, 20.85]], pop: 0.25, go: 0.45, arrive: 8, badge: [64, -38], side: 'right', icon: 'corn' },
  { food: 'PORK', state: 'Jalisco', at: [-103.3, 20.7], via: [[-101.8, 20.35], [-100.6, 19.6]], pop: 0.35, go: 0.6, arrive: 7, badge: [-66, -2], side: 'left', icon: 'pig' },
  { food: 'LIMES', state: 'Michoacán', at: [-102.4, 19.1], via: [[-101.3, 18.7], [-100.3, 18.6], [-99.5, 18.95]], pop: 0.45, go: 0.6, arrive: 5, badge: [-44, 58], side: 'left', icon: 'lime' },
  { food: 'PINEAPPLE', state: 'Veracruz', at: [-95.9, 18.1], via: [[-97.0, 18.7], [-98.2, 19.0]], pop: 0.55, go: 0.7, arrive: 6, badge: [64, -42], side: 'right', icon: 'pineapple' },
]
MAP_ROUTES.forEach((r) => K.cue(MAP_T0 + r.arrive * EIGHTH, `map: ${r.food.toLowerCase()} truck reaches Mexico City`, r.arrive === 8 ? 'hit' : 'soft'))
K.cue(MAP_T0 + 2 * EIGHTH, 'map: the trucks set off', 'soft')

// a route as an even-spaced path from its origin to just short of the city star, with its length so far
function mapRoute(r) {
  return K.memo('map-route-' + r.food, () => {
    const pts = K.resample(K.curve([r.at, ...r.via, [-99.13, 19.43]].map(([a, b]) => mapP(a, b)), 80), 2.5, false)
    const cum = [0]
    for (let i = 1; i < pts.length; i++) cum.push(cum[i - 1] + Math.hypot(pts[i][0] - pts[i - 1][0], pts[i][1] - pts[i - 1][1]))
    const end = cum[cum.length - 1] - 44
    return { pts, cum, end }
  })
}
function mapAlong(R, d) {
  let i = 1
  while (i < R.cum.length - 1 && R.cum[i] < d) i++
  const a = R.pts[i - 1], b = R.pts[i], f = K.clamp((d - R.cum[i - 1]) / ((R.cum[i] - R.cum[i - 1]) || 1))
  return { x: K.lerp(a[0], b[0], f), y: K.lerp(a[1], b[1], f), a: Math.atan2(b[1] - a[1], b[0] - a[0]), i }
}
// mountains as little hand-drawn peaks along the real ranges (clipped to the land)
const MAP_RANGES = [
  [[-108.7, 30.6], [-107.7, 28.6], [-106.6, 26.6], [-105.5, 24.6], [-104.5, 22.6]], // Sierra Madre Occidental
  [[-101.4, 25.8], [-100.1, 24.5], [-99.5, 23.0], [-98.9, 21.5]], // Sierra Madre Oriental
  [[-101.6, 17.95], [-99.6, 17.45], [-97.6, 16.95], [-96.2, 16.6]], // Sierra Madre del Sur
  [[-115.7, 31.4], [-115.0, 30.0], [-113.6, 28.3], [-112.3, 26.6], [-110.6, 24.0]], // Baja's spine
  [[-93.4, 16.75], [-92.3, 16.3]], // Chiapas highlands
]
const mapPeaks = () => K.memo('map-peaks', () => {
  const out = [], r = K.rng('map-peaks')
  for (const range of MAP_RANGES) {
    const P = K.resample(K.curve(range.map(([a, b]) => mapP(a, b)), 40), 21, false)
    P.forEach(([x, y], i) => out.push({ x: x + (r() - 0.5) * 8 + (i % 2 ? 5 : -5), y: y + (r() - 0.5) * 6, s: 0.75 + r() * 0.5, k: out.length }))
  }
  return out
})
const MAP_WAVES = [[-94.4, 23.4], [-91.8, 26.6], [-89.6, 24.1], [-95.6, 27.3], [-113.0, 20.6], [-108.6, 18.2], [-104.2, 16.4], [-114.6, 25.2], [-116.6, 28.2], [-98.0, 13.6], [-94.2, 12.9], [-111.8, 17.0]]

// Mexico's coast cut into four pen strokes that start at two seeds and meet halfway (wobbled once, so they join)
function mapArcs() {
  return K.memo('map-arcs', () => {
    const P = K.wob(K.memo('map-mex', () => mapPts(MAP_MEX)), { seed: 4, amp: 1.0, step: 5 }), n = P.length
    const near = ([x, y]) => P.reduce((b, p, i) => (Math.hypot(p[0] - x, p[1] - y) < Math.hypot(P[b][0] - x, P[b][1] - y) ? i : b), 0)
    const a = near(mapP(-97.8, 22.2)), b = near(mapP(-105.3, 20.6))
    const walk = (i, j, step) => { const out = []; for (let k = i; ; k = (k + step + n) % n) { out.push(P[k]); if (k === j) break } return out }
    const arcs = []
    for (const [i, j] of [[a, b], [b, a]]) {
      const run = walk(i, j, 1), m = Math.floor(run.length / 2)
      arcs.push(run.slice(0, m + 1), run.slice(m).reverse())
    }
    return arcs
  })
}
function mapLandPath() {
  return K.memo('map-landpath', () => {
    const p = new Path2D()
    for (const ring of [MAP_MEX, ...MAP_ISLES, ...MAP_NEIGH]) { const q = mapPts(ring); p.moveTo(q[0][0], q[0][1]); for (const [x, y] of q) p.lineTo(x, y); p.closePath() }
    return p
  })
}

// ---------- the pieces
function mapBadgeIcon(ctx, icon, x, y) {
  if (icon === 'lime') {
    K.shape(ctx, K.circle(x, y, 13, 32), { fill: '#6fa83a', line: C.ink, lw: 1.4, seed: 31, shade: { amount: 0.3 } })
    K.shape(ctx, K.circle(x, y, 10, 32), { fill: C.limePulp, line: null, wob: 0.4, seed: 32, light: { amount: 0.3 } })
    for (let i = 0; i < 8; i++) { const a = (i / 8) * K.TAU + 0.2; K.line(ctx, [[x, y], [x + Math.cos(a) * 9, y + Math.sin(a) * 9]], { color: '#8fb049', lw: 1, wob: 0.2, taper: 2, seed: 33 + i }) }
  } else if (icon === 'pineapple') {
    for (const [dx, h, a] of [[-6, 13, -0.5], [0, 16, 0], [6, 13, 0.5]]) K.shape(ctx, K.leaf(x, y - 6, x + dx + Math.sin(a) * 4, y - 6 - h, 5), { fill: C.leaf, line: C.ink, lw: 1.1, seed: 41 + dx, wob: 0.4 })
    const body = K.ellipse(x, y + 4, 8.5, 11, 0, 32)
    K.shape(ctx, body, { fill: C.pineapple, line: C.ink, lw: 1.4, seed: 44, shade: { amount: 0.35 }, hatch: { angle: 0.8, gap: 4.5, alpha: 0.45, lw: 0.7 } })
    K.hatch(ctx, body, { angle: -0.8, gap: 4.5, alpha: 0.45, lw: 0.7 }, 45)
  } else if (icon === 'pig') {
    for (const sx of [-1, 1]) K.shape(ctx, [[x + sx * 4, y - 9], [x + sx * 12, y - 15], [x + sx * 11, y - 4]], { fill: C.pigDark, line: C.ink, lw: 1.1, seed: 51 + sx, wob: 0.3 })
    K.shape(ctx, K.circle(x, y + 1, 11.5, 32), { fill: C.pig, line: C.ink, lw: 1.4, seed: 53, shade: { amount: 0.3 }, light: { amount: 0.25 } })
    K.shape(ctx, K.ellipse(x, y + 4.5, 5.5, 4, 0, 20), { fill: C.pigDark, line: C.ink, lw: 1, seed: 54, wob: 0.3 })
    ctx.fillStyle = C.ink
    for (const [dx, dy, rr] of [[-2, 4.5, 1.1], [2, 4.5, 1.1], [-4.5, -2.5, 1.4], [4.5, -2.5, 1.4]]) { ctx.beginPath(); ctx.arc(x + dx, y + dy, rr, 0, K.TAU); ctx.fill() }
  } else if (icon === 'corn') {
    K.shape(ctx, K.leaf(x - 2, y + 13, x - 10, y - 8, 8, 0.35), { fill: C.leaf, line: C.ink, lw: 1.1, seed: 61, wob: 0.4 })
    const cob = K.ellipse(x + 1, y - 1, 5.5, 13, 0.32, 32)
    K.shape(ctx, cob, { fill: C.corn, line: C.ink, lw: 1.3, seed: 62, shade: { amount: 0.35, angle: 0.3 } })
    ctx.fillStyle = K.rgba(C.cornDry, 0.9)
    for (let j = -4; j <= 4; j++) for (const i of [-1, 0, 1]) { const u = i * 2.6, v = j * 2.6; ctx.beginPath(); ctx.arc(x + 1 + u * Math.cos(0.32) - v * Math.sin(0.32), y - 1 + u * Math.sin(0.32) + v * Math.cos(0.32), 0.9, 0, K.TAU); ctx.fill() }
    K.shape(ctx, K.leaf(x + 1, y + 14, x + 11, y - 5, 8, 0.35), { fill: C.leafDark, line: C.ink, lw: 1.1, seed: 63, wob: 0.4 })
  }
}
function mapBadge(ctx, r, sc, lt) {
  const [ox, oy] = mapP(r.at[0], r.at[1]), bx = ox + r.badge[0], by = oy + r.badge[1]
  // the leader from the true spot to the badge
  const lead = K.at(lt, r.pop - 0.05, 0.25, 'out')
  const ang = Math.atan2(by - oy, bx - ox)
  K.line(ctx, [[ox + Math.cos(ang) * 6, oy + Math.sin(ang) * 6], [K.lerp(ox, bx - Math.cos(ang) * 28, lead), K.lerp(oy, by - Math.sin(ang) * 28, lead)]], { color: K.rgba(MAP_INK, 0.7), lw: 1.3, wob: 0.3, taper: 3, seed: K.hash(r.food) % 50 })
  if (sc <= 0.01) return
  ctx.save(); ctx.translate(bx, by); ctx.scale(sc, sc); ctx.translate(-bx, -by)
  K.groundShadow(ctx, bx + 3, by + 5, 28, 26, 0.45, '#0b1020')
  K.shape(ctx, K.circle(bx, by, 26, 40), { fill: '#f3eee4', line: C.ink, lw: 1.8, seed: 70 + r.pop * 10, shade: { amount: 0.25, angle: 0.9 }, texture: 0.4 })
  K.shape(ctx, K.circle(bx, by, 26, 40), { fill: null, line: K.rgba(MAP_INK, 0.8), lw: 1.1, seed: 72, wob: 0.6, offset: [0, 0] })
  ctx.translate(bx, by); ctx.scale(1.2, 1.2); ctx.translate(-bx, -by)
  mapBadgeIcon(ctx, r.icon, bx, by + 1)
  ctx.restore()
  const a = K.at(lt, r.pop + 0.08, 0.3, 'out'), left = r.side === 'left', tx = bx + (left ? -38 : 38)
  mapText(ctx, r.food, tx + (left ? 1 : -1) * 6 * (1 - a), by - 9, { size: 18, align: left ? 'right' : 'left', color: '#f6cf55', alpha: a, spacing: 2, halo: 6 })
  mapText(ctx, r.state, tx + (left ? 1 : -1) * 6 * (1 - a), by + 21, { size: 29, align: left ? 'right' : 'left', color: '#fff6e2', alpha: a, halo: 7, haloColor: '#111a2e' })
}
// a little box truck, side view, facing +x in its own frame
function mapTruck(ctx, x, y, ang, dir, dist, t, lights = 1) {
  const rot = dir > 0 ? ang : Math.atan2(-Math.sin(ang), -Math.cos(ang))
  ctx.save(); ctx.translate(x, y); ctx.rotate(K.clamp(rot, -0.55, 0.55)); ctx.scale(dir * 1.75, 1.75)
  const hl = ctx.createRadialGradient(24, -6, 1, 30, -5, 22); hl.addColorStop(0, `rgba(255,236,170,${0.55 * lights})`); hl.addColorStop(1, 'rgba(255,236,170,0)')
  ctx.fillStyle = hl; ctx.beginPath(); ctx.moveTo(15, -8); ctx.lineTo(48, -18); ctx.lineTo(48, 8); ctx.closePath(); ctx.fill()
  ctx.translate(0, -5 + Math.abs(Math.sin(dist * 0.35)) * -0.8)
  K.groundShadow(ctx, 0, 6, 20, 4, 0.5, '#0b1020')
  K.shape(ctx, K.rect(-17, -17, 22, 15, 1.5), { fill: '#f3eee4', line: C.ink, lw: 1.4, seed: 81, wob: 0.4, shade: { amount: 0.3, angle: 1.3 } })
  K.line(ctx, [[-14, -12], [2, -12]], { color: K.rgba(C.red, 0.85), lw: 1.6, wob: 0.2, taper: 2, seed: 82 })
  K.shape(ctx, [[5, -2], [5, -13], [11, -13], [15, -7], [16, -2]], { fill: C.red, line: C.ink, lw: 1.4, seed: 83, wob: 0.3, shade: { amount: 0.3 } })
  K.shape(ctx, [[7, -11.5], [10.5, -11.5], [13.3, -7.5], [7, -7.5]], { fill: '#bcd3e0', line: null, wob: 0.2, seed: 84 })
  for (const wx of [-11, 10]) {
    K.shape(ctx, K.circle(wx, -1, 3.6, 16), { fill: '#3a3230', line: C.ink, lw: 1.1, seed: 85 + wx, wob: 0.2 })
    const a = dist / 3.6
    K.line(ctx, [[wx - Math.cos(a) * 2.4, -1 - Math.sin(a) * 2.4], [wx + Math.cos(a) * 2.4, -1 + Math.sin(a) * 2.4]], { color: '#c9c2b4', lw: 0.9, wob: 0, taper: 0, seed: 86 })
  }
  ctx.restore()
}
function mapText(ctx, str, x, y, o = {}) {
  ctx.save()
  ctx.font = K.font(o.size || 16); ctx.textAlign = o.align || 'left'; ctx.textBaseline = 'alphabetic'
  if (ctx.letterSpacing !== undefined) ctx.letterSpacing = (o.spacing || 0) + 'px'
  ctx.globalAlpha *= o.alpha ?? 1
  ctx.lineJoin = 'round'; ctx.lineWidth = o.halo ?? 5; ctx.strokeStyle = K.rgba(o.haloColor || MAP_SEA, 0.85); ctx.strokeText(str, x, y)
  ctx.fillStyle = o.color || MAP_INK; ctx.fillText(str, x, y)
  ctx.restore()
}
function mapStar(x, y, r, rot = -Math.PI / 2) {
  const pts = []
  for (let i = 0; i < 10; i++) { const a = rot + (i / 10) * K.TAU, rr = i % 2 ? r * 0.45 : r; pts.push([x + Math.cos(a) * rr, y + Math.sin(a) * rr]) }
  return pts
}

// ---------- the scene
sceneAt('map', {
  in: { type: 'slide', dur: 0.6, dir: 'down' },
  draw(ctx, s) {
    const lt = s.lt, F = MAP_FRAME, [cx, cy] = MAP_CITY
    K.paper(ctx, W, H, C.night)
    const arrive = MAP_ROUTES.map((r) => r.arrive * EIGHTH)
    const landed = arrive.filter((a) => lt >= a).length
    // the map sheet inside its neat line
    ctx.save()
    K.pathOf(ctx, K.rect(F.x, F.y, F.w, F.h)); ctx.clip()
    ctx.fillStyle = MAP_SEA; ctx.fillRect(F.x, F.y, F.w, F.h)
    K.shape(ctx, K.rect(F.x - 10, F.y - 10, F.w + 20, F.h + 20), { fill: MAP_SEA, line: null, wob: 0, texture: 0.55, shade: { amount: 0.25, angle: 1.0 }, light: { amount: 0.06 } })
    // a slow push toward the city, eased, so the map keeps breathing after the trucks land
    const z = 1 + 0.085 * K.at(lt, 0.8, 2.9, 'inOut')
    ctx.translate(cx, cy); ctx.scale(z, z); ctx.translate(-cx, -cy)
    // graticule over the sea, every 5 degrees
    ctx.save(); ctx.strokeStyle = K.rgba(C.nightLine, 0.16); ctx.lineWidth = 1
    for (let la = 10; la <= 35; la += 5) { const [, y] = mapP(0, la); ctx.beginPath(); ctx.moveTo(0, y); ctx.lineTo(W, y); ctx.stroke() }
    for (let lo = -120; lo <= -85; lo += 5) { const [x] = mapP(lo, 0); ctx.beginPath(); ctx.moveTo(x, 150); ctx.lineTo(x, H + 60); ctx.stroke() }
    ctx.restore()
    // water-lining: the coast echoed in rings out to sea, like an engraved chart
    const land = mapLandPath()
    ctx.save(); ctx.lineJoin = 'round'
    const shimmer = 0.85 + 0.15 * Math.sin(s.t * 2.2)
    for (const [d, a] of [[33, 0.07], [24, 0.1], [16, 0.15], [9, 0.22], [4, 0.3]]) {
      ctx.lineWidth = d * 2 + 1.3; ctx.strokeStyle = K.rgba(C.nightLine, a * shimmer); ctx.stroke(land)
      ctx.lineWidth = d * 2 - 1.3; ctx.strokeStyle = MAP_SEA; ctx.stroke(land)
    }
    ctx.restore()
    for (const [lo, la] of MAP_WAVES) {
      const [x, y] = mapP(lo, la), dx = Math.sin(s.t * 1.3 + lo) * 3
      K.line(ctx, [[x - 10 + dx, y], [x - 5 + dx, y - 3], [x + dx, y], [x + 5 + dx, y + 3], [x + 10 + dx, y]], { color: K.rgba(C.nightLine, 0.55), lw: 1.3, wob: 0.3, taper: 4, seed: K.hash(lo + ',' + la) % 99 })
    }
    // the neighbours: quiet land without a story
    ctx.save(); ctx.fillStyle = MAP_NLAND; ctx.strokeStyle = MAP_NLAND; ctx.lineWidth = 3; ctx.lineJoin = 'round'
    for (const ring of MAP_NEIGH) { K.pathOf(ctx, mapPts(ring)); ctx.fill(); ctx.stroke() }
    ctx.restore()
    MAP_NEIGH.forEach((ring, i) => K.shape(ctx, mapPts(ring), { fill: null, line: K.rgba(C.nightLine, 0.55), lw: 1.1, seed: 90 + i, wob: 0.6 }))
    // Mexico: the outline draws on in light ink, the land floods in behind it
    const mex = K.memo('map-mex', () => mapPts(MAP_MEX))
    const drawOn = K.at(lt, 0.0, 0.75, 'inOutSine'), fillIn = K.at(lt, 0.12, 0.55, 'out')
    K.shape(ctx, mex, { fill: MAP_LAND, line: null, seed: 4, wob: 1.0, fillIn, shade: { amount: 0.4, angle: 1.1, color: '#0e1528' }, light: { amount: 0.1, angle: -2.2 }, texture: 0.35 })
    ctx.save(); K.pathOf(ctx, mex); ctx.clip(); ctx.lineJoin = 'round'
    for (const [w, a] of [[26, 0.05], [14, 0.06], [6, 0.08]]) { ctx.lineWidth = w; ctx.strokeStyle = K.rgba('#9fb3da', a * fillIn); K.pathOf(ctx, mex); ctx.stroke() }
    ctx.restore()
    for (const isle of MAP_ISLES) K.shape(ctx, mapPts(isle), { fill: MAP_LAND, line: K.rgba(MAP_INK, 0.8), lw: 1, wob: 0.4, seed: 5, fillIn, draw: drawOn })
    // relief: little peaks along the sierras
    ctx.save(); K.pathOf(ctx, mex); ctx.clip()
    for (const p of mapPeaks()) {
      const a = K.at(lt, 0.35 + p.k * 0.004, 0.3, 'out') * 0.8
      if (a <= 0) continue
      const w = 7 * p.s, h = 7 * p.s
      K.line(ctx, [[p.x - w, p.y + h * 0.5], [p.x, p.y - h * 0.5], [p.x + w, p.y + h * 0.5]], { color: K.rgba(MAP_SOFT, 0.6 * a), lw: 1.2, wob: 0.3, taper: 3, seed: p.k })
      K.line(ctx, [[p.x + 1.5, p.y - h * 0.1], [p.x + w * 0.55, p.y + h * 0.45]], { color: K.rgba(MAP_SOFT, 0.35 * a), lw: 0.9, wob: 0.2, taper: 2, seed: p.k + 7 })
    }
    ctx.restore()
    // the pen starts on both coasts at once (Tampico, Puerto Vallarta) and runs both ways round
    for (const arc of mapArcs()) K.ink(ctx, arc, { color: MAP_INK, lw: 2.3, seed: 15, taper: 5, draw: drawOn })
    // the Tropic of Cancer, a true dashed line across the country
    const [, ty] = mapP(0, 23.44)
    K.guide(ctx, [[0, ty], [W, ty]], { color: MAP_INK, alpha: 0.3 * fillIn, dash: [7, 7], lw: 1.1 })
    mapText(ctx, 'TROPIC OF CANCER', 1018, ty - 8, { size: 13, align: 'right', color: MAP_SOFT, alpha: 0.75 * fillIn, spacing: 2 })
    // seas and neighbours named, small and quiet
    const la = K.at(lt, 0.4, 0.5, 'out')
    mapText(ctx, 'UNITED STATES', 610, 300, { size: 16, align: 'center', color: MAP_SOFT, alpha: 0.5 * la, spacing: 5 })
    mapText(ctx, 'GULF OF MEXICO', 845, 540, { size: 17, align: 'center', color: MAP_SOFT, alpha: 0.7 * la, spacing: 5 })
    mapText(ctx, 'PACIFIC OCEAN', 300, 925, { size: 17, align: 'center', color: MAP_SOFT, alpha: 0.7 * la, spacing: 5 })
    mapText(ctx, 'GUATEMALA', 925, 912, { size: 12, align: 'center', color: MAP_SOFT, alpha: 0.55 * la, spacing: 2 })
    // the city: its glow grows with every truck that arrives
    const glow = landed / 4 + 0.25 * K.pulse(lt, arrive, 0.6)
    if (glow > 0) {
      const g = ctx.createRadialGradient(cx, cy, 0, cx, cy, 70 + 40 * glow)
      g.addColorStop(0, K.rgba('#ffd36b', 0.42 * glow)); g.addColorStop(1, K.rgba('#ffd36b', 0))
      ctx.fillStyle = g; ctx.beginPath(); ctx.arc(cx, cy, 110 + 40 * glow, 0, K.TAU); ctx.fill()
    }
    // routes: dashes drawn on behind each truck
    const moving = []
    for (const r of MAP_ROUTES) {
      const R = mapRoute(r), u = K.at(lt, r.go, r.arrive * EIGHTH - r.go, 'inOut'), d = u * R.end
      if (lt >= r.go - 0.05) {
        for (let s0 = 0; s0 < d; s0 += 15) {
          const s1 = Math.min(d, s0 + 8), seg = []
          for (let i = 0; i < R.pts.length; i++) if (R.cum[i] >= s0 && R.cum[i] <= s1) seg.push(R.pts[i])
          if (seg.length >= 2) K.ink(ctx, seg, { color: K.rgba(MAP_INK, 0.92), lw: 2.4, taper: 3, seed: s0 })
        }
      }
      const [ox, oy] = mapP(r.at[0], r.at[1]), dep = K.pulse(lt, [r.go], 0.5)
      K.shape(ctx, K.circle(ox, oy, 5 + dep * 5, 20), { fill: MAP_INK, line: C.ink, lw: 1.2, seed: 99, wob: 0.3, alpha: K.at(lt, r.pop - 0.1, 0.2, 'out') })
      moving.push({ r, R, u, d })
    }
    // the destination star, then the trucks on top
    const sp = K.spring(lt - 0.2, 2.2, 0.45), beat = K.pulse(lt, arrive, 0.45)
    for (let k = 0; k < landed; k++) {
      const age = lt - arrive[k], rr = 16 + age * 60
      if (age < 0.7) K.shape(ctx, K.circle(cx, cy, rr, 40), { fill: null, line: K.rgba('#ffd36b', 0.8 * (1 - age / 0.7)), lw: 2, wob: 0.6, seed: 120 + k })
    }
    if (sp > 0.01) K.shape(ctx, mapStar(cx, cy, 14 * sp * (1 + 0.3 * beat)), { fill: C.red, line: '#f8e9c8', lw: 1.8, seed: 7, wob: 0.4, light: { amount: 0.3 } })
    for (const { r, R, u, d } of moving) {
      if (lt < r.go - 0.15) continue
      const p = mapAlong(R, d), dir = Math.cos(p.a) >= 0 ? 1 : -1
      const fadeIn = K.at(lt, r.go - 0.15, 0.2, 'out')
      // exhaust while it rolls
      if (u < 1) for (let k = 0; k < 3; k++) {
        const ph = (lt * 3 + k / 3) % 1, b = mapAlong(R, Math.max(0, d - 30 - ph * 18))
        K.shape(ctx, K.circle(b.x, b.y - 14 - ph * 14, 3 + ph * 6, 12), { fill: K.rgba(MAP_INK, 0.35 * (1 - ph) * fadeIn), line: null, wob: 0.3, seed: k })
      }
      ctx.save(); ctx.globalAlpha *= fadeIn
      mapTruck(ctx, p.x, p.y, p.a, dir, d, s.t, 1 - K.at(lt, r.arrive * EIGHTH, 0.3, 'out'))
      ctx.restore()
    }
    for (const r of MAP_ROUTES) mapBadge(ctx, r, K.spring(lt - r.pop, 2.4, 0.5), lt)
    const ca = K.at(lt, 0.5, 0.35, 'out')
    mapText(ctx, 'MEXICO CITY', cx + 68 + 4 * (1 - ca), cy - 52, { size: 22, align: 'left', color: '#fff4dc', alpha: ca, spacing: 3, halo: 6, haloColor: '#141c31' })
    ctx.restore()
    // the neat line, degree ticks, north arrow and scale bar sit on the sheet, not in the zoom
    K.shape(ctx, K.rect(F.x, F.y, F.w, F.h), { fill: null, line: MAP_INK, lw: 1.8, wob: 0.7, seed: 140 })
    K.shape(ctx, K.rect(F.x + 7, F.y + 7, F.w - 14, F.h - 14), { fill: null, line: K.rgba(MAP_INK, 0.5), lw: 1, wob: 0.5, seed: 141 })
    const zs = (x, y) => [cx + (x - cx) * z, cy + (y - cy) * z]
    for (let la2 = 15; la2 <= 30; la2 += 5) {
      const y = zs(0, mapP(0, la2)[1])[1]
      if (y > F.y + 20 && y < F.y + F.h - 20) { K.line(ctx, [[F.x, y], [F.x + 7, y]], { color: MAP_INK, lw: 1.2, wob: 0, taper: 0 }); K.text(ctx, la2 + '°N', F.x + 12, y + 4, { size: 12, color: MAP_SOFT, alpha: 0.8 }) }
    }
    for (let lo = -115; lo <= -90; lo += 5) {
      const x = zs(mapP(lo, 0)[0], 0)[0]
      if (x > F.x + 30 && x < F.x + F.w - 30) { K.line(ctx, [[x, F.y + F.h], [x, F.y + F.h - 7]], { color: MAP_INK, lw: 1.2, wob: 0, taper: 0 }); K.text(ctx, -lo + '°W', x, F.y + F.h - 12, { size: 12, align: 'center', color: MAP_SOFT, alpha: 0.8 }) }
    }
    const na = K.at(lt, 0.45, 0.4, 'out'), nx = 96, ny = 905
    ctx.save(); ctx.globalAlpha *= na
    K.shape(ctx, K.circle(nx, ny, 22, 40), { fill: null, line: K.rgba(MAP_INK, 0.55), lw: 1, wob: 0.4, seed: 150 })
    K.shape(ctx, [[nx, ny - 30], [nx + 7, ny], [nx, ny - 4]], { fill: MAP_INK, line: MAP_INK, lw: 1.1, seed: 151, wob: 0.2 })
    K.shape(ctx, [[nx, ny - 30], [nx - 7, ny], [nx, ny - 4]], { fill: MAP_SEA, line: MAP_INK, lw: 1.1, seed: 152, wob: 0.2 })
    K.shape(ctx, [[nx, ny + 26], [nx + 6, ny], [nx - 6, ny]], { fill: null, line: K.rgba(MAP_INK, 0.6), lw: 1, seed: 153, wob: 0.2 })
    K.text(ctx, 'N', nx, ny - 36, { size: 18, align: 'center', color: MAP_INK })
    // scale bar: 500 km at 23.5° N
    const kmPx = MAPV.s / 110.6, bx = 70, by = 1006, L = 500 * kmPx
    K.shape(ctx, K.rect(bx, by, L / 2, 7), { fill: MAP_INK, line: MAP_INK, lw: 1, wob: 0.3, seed: 154 })
    K.shape(ctx, K.rect(bx + L / 2, by, L / 2, 7), { fill: null, line: MAP_INK, lw: 1, wob: 0.3, seed: 155 })
    K.text(ctx, '0', bx, by - 8, { size: 13, align: 'center', color: MAP_SOFT })
    K.text(ctx, '250', bx + L / 2, by - 8, { size: 13, align: 'center', color: MAP_SOFT })
    K.text(ctx, '500 km', bx + L, by - 8, { size: 13, align: 'center', color: MAP_SOFT })
    ctx.restore()
    cap(ctx, s, '2 DAYS', [['Trucks roll toward Mexico City.', 0.4], ['Four states. One street corner.', 1.3]], { color: '#f3eee4' })
  },
})
