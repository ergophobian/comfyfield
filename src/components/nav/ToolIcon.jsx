import { Logo } from '../../lib/brands.jsx'

const s = { width: 18, height: 18, viewBox: '0 0 24 24', fill: 'none', stroke: 'currentColor', strokeWidth: 1.8, strokeLinecap: 'round', strokeLinejoin: 'round', 'aria-hidden': true }

const paths = {
  image: <><rect x="4" y="5" width="16" height="14" rx="2" /><circle cx="9" cy="10" r="1.6" /><path d="m20 16-4.5-4.5L7 19" /></>,
  camera: <><rect x="3" y="7" width="18" height="12" rx="2" /><circle cx="12" cy="13" r="3.5" /><path d="M8 7l1.5-3h5L16 7" /></>,
  canvas: <><rect x="3" y="4" width="6" height="6" rx="1.5" /><rect x="15" y="14" width="6" height="6" rx="1.5" /><path d="M9 7h4a2 2 0 0 1 2 2v5" /></>,
  board: <><rect x="4" y="4" width="7" height="9" rx="1.5" /><rect x="13" y="4" width="7" height="5" rx="1.5" /><rect x="13" y="11" width="7" height="9" rx="1.5" /><rect x="4" y="15" width="7" height="5" rx="1.5" /></>,
  person: <><circle cx="12" cy="8" r="4" /><path d="M4 20a8 8 0 0 1 16 0" /></>,
  star: <><circle cx="10" cy="8" r="4" /><path d="M3 20a7 7 0 0 1 11-5.7M18 13v6M15 16h6" /></>,
  photos: <><rect x="8" y="8" width="12" height="12" rx="2" /><path d="M4 16V6a2 2 0 0 1 2-2h10" /><path d="m20 17-3-3-5 6" /></>,
  light: <><circle cx="12" cy="12" r="4" /><path d="M12 2v2M12 20v2M2 12h2M20 12h2M5 5l1.5 1.5M17.5 17.5 19 19M5 19l1.5-1.5M17.5 6.5 19 5" /></>,
  wand: <><path d="M4 20 14 10M15 3v3M18 5h3M13 7l4 4M19 11v2M20 12h-2" /></>,
  expand: <><path d="M14 4h6v6M10 20H4v-6M20 4l-7 7M4 20l7-7" /></>,
  face: <><circle cx="12" cy="12" r="4.5" /><path d="M3 8V5a2 2 0 0 1 2-2h3M16 3h3a2 2 0 0 1 2 2v3M21 16v3a2 2 0 0 1-2 2h-3M8 21H5a2 2 0 0 1-2-2v-3" /></>,
  swap: <><rect x="3" y="3" width="18" height="18" rx="3" /><circle cx="12" cy="10" r="3" /><path d="M7 18a5 5 0 0 1 10 0" /></>,
  hanger: <><path d="M10 6a2 2 0 1 1 2 2v2L3 17h18l-9-7" /></>,
  video: <><rect x="3" y="6" width="13" height="12" rx="2" /><path d="m16 10 5-3v10l-5-3" /></>,
  film: <><rect x="3" y="4" width="18" height="16" rx="2" /><path d="M7 4v16M17 4v16M3 9h4M3 15h4M17 9h4M17 15h4" /></>,
  play: <><rect x="3" y="5" width="18" height="14" rx="3" /><path d="m10 9 5 3-5 3Z" /></>,
  cube: <><path d="m12 3 8 4.5v9L12 21l-8-4.5v-9L12 3Z" /><path d="m4 7.5 8 4.5 8-4.5M12 12v9" /></>,
  phone: <><rect x="7" y="3" width="10" height="18" rx="2" /><path d="m11 10 3 2-3 2Z" /></>,
  slides: <><rect x="3" y="4" width="18" height="12" rx="2" /><path d="M12 16v4M8 20h8M7 12l3-3 2 2 4-4" /></>,
  layers: <><path d="m12 3 9 5-9 5-9-5 9-5Z" /><path d="m3 13 9 5 9-5" /></>,
  cut: <><circle cx="6" cy="6" r="3" /><circle cx="6" cy="18" r="3" /><path d="M8.5 8 20 18M8.5 16 20 6" /></>,
  aspect: <><path d="M4 8V5h3M17 5h3v3M20 16v3h-3M7 19H4v-3" /><rect x="8" y="8" width="8" height="8" rx="1" /></>,
  cursor: <><path d="M5 3l14 7-6 2-2 6Z" /></>,
  palette: <><path d="M12 3a9 9 0 1 0 0 18 2 2 0 0 0 1.5-3.3 2 2 0 0 1 1.5-3.4h2.3A4.7 4.7 0 0 0 22 9.7C22 5.9 17.5 3 12 3Z" /><circle cx="7.5" cy="11" r="1" /><circle cx="10.5" cy="7" r="1" /><circle cx="15.5" cy="7.5" r="1" /></>,
  path: <><circle cx="6" cy="18" r="2" /><circle cx="18" cy="6" r="2" /><path d="M8 18c6 0 2-12 8-12" /></>,
  lips: <><path d="M3 12c2-3 5.5-5 9-5s7 2 9 5c-2 3-5.5 5-9 5s-7-2-9-5Z" /><path d="M3 12h18" /></>,
  mic: <><rect x="9" y="3" width="6" height="11" rx="3" /><path d="M5 11a7 7 0 0 0 14 0M12 18v3" /></>,
  wave: <><path d="M3 12h1M7 8v8M11 5v14M15 8v8M19 11v2" /><path d="M21 7l-2-2-2 2" /></>,
  translate: <><path d="M4 5h8M8 3v2M6 5c0 4 3 7 6 8M10 5c0 4-3 7-6 8M13 21l4-9 4 9M14.5 18h5" /></>,
  compass: <><circle cx="12" cy="12" r="9" /><path d="m15.5 8.5-2 5-5 2 2-5Z" /></>,
  apps: <><rect x="4" y="4" width="7" height="7" rx="2" /><rect x="13" y="4" width="7" height="7" rx="2" /><rect x="4" y="13" width="7" height="7" rx="2" /><rect x="13" y="13" width="7" height="7" rx="2" /></>,
  spark: <><path d="M12 3v4M12 17v4M3 12h4M17 12h4M6 6l2.5 2.5M15.5 15.5 18 18M18 6l-2.5 2.5M8.5 15.5 6 18" /></>,
  move: <><rect x="3" y="7" width="12" height="10" rx="2" /><path d="m15 11 6-3v8l-6-3M3 3h7M7 1v4" /></>,
  megaphone: <><path d="M4 10v4h3l8 4V6l-8 4Z" /><path d="M18 9a4 4 0 0 1 0 6M7 14l1 5h2" /></>,
  ad: <><rect x="3" y="5" width="18" height="14" rx="2" /><path d="M7 15l2.5-6L12 15M7.8 13h3.4M15 9v6h1a3 3 0 0 0 0-6Z" /></>,
  chat: <><path d="M4 5h16v11H9l-5 4Z" /><path d="M12 8v5M9.5 10.5h5" /></>,
  folder: <><path d="M3 7a2 2 0 0 1 2-2h4l2 2h8a2 2 0 0 1 2 2v8a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2Z" /></>,
  audio: <><path d="M5 10v4M9 7v10M13 4v16M17 8v8M21 11v2" /></>,
  music: <><path d="M9 18V5l11-2v13" /><circle cx="6" cy="18" r="3" /><circle cx="17" cy="16" r="3" /></>,
  menu: <><path d="M4 7h16M4 12h16M4 17h16" /></>,
  pause: <><path d="M9 6v12M15 6v12" /></>,
  playmark: <><path d="M8 5.5v13l10.5-6.5Z" /></>,
  code: <><path d="m8 8-4 4 4 4M16 8l4 4-4 4M14 5l-4 14" /></>,
  slash: <><rect x="3" y="3" width="18" height="18" rx="5" /><path d="m14.5 7-5 10" /></>,
  bars: <><path d="M4 18V9M9 18V5M14 18v-7M19 18V8" /></>,
  link: <><path d="M10 14a4 4 0 0 0 5.6 0l3-3a4 4 0 0 0-5.6-5.6l-1 1M14 10a4 4 0 0 0-5.6 0l-3 3a4 4 0 0 0 5.6 5.6l1-1" /></>,
  gpu: <><rect x="7" y="7" width="10" height="10" rx="2" /><path d="M10 3v4M14 3v4M10 17v4M14 17v4M3 10h4M3 14h4M17 10h4M17 14h4" /></>,
}

const byTool = {
  'create-image': 'image', 'cinematic-cameras': 'camera', canvas: 'canvas', moodboard: 'board', character: 'person',
  influencer: 'star', photodump: 'photos', relight: 'light', inpaint: 'wand', 'image-upscale': 'expand',
  'face-swap': 'face', 'character-swap': 'swap', 'fashion-factory': 'hanger',
  'create-video': 'video', 'cinema-studio': 'film', faceless: 'play', '3d-studio': 'cube', shorts: 'phone',
  explainer: 'slides', 'mixed-media': 'layers', 'edit-video': 'cut', 'video-upscale': 'expand', reframe: 'aspect',
  'click-to-ad': 'cursor', 'color-palette': 'palette', 'motion-control': 'path', lipsync: 'lips',
  'text-to-speech': 'mic', 'voice-change': 'wave', translate: 'translate',
  explore: 'compass', apps: 'apps', effects: 'spark', motion: 'move', marketing: 'megaphone', ads: 'ad',
  assistant: 'chat', assets: 'folder', skills: 'slash',
}

export const Glyph = ({ name }) => <svg {...s}>{paths[name] || paths.spark}</svg>
export const ToolIcon = ({ id }) => <Glyph name={byTool[id]} />
export const KindIcon = ({ kind }) => <Glyph name={{ image: 'image', video: 'video', audio: 'audio', '3d': 'cube' }[kind] || 'apps'} />

// openModels only carry a vendor name, so match it to a logo we ship.
const vendorBrand = [[/black forest/i, 'bfl'], [/alibaba/i, 'alibaba'], [/minimax/i, 'minimax']]
export function ModelIcon({ model }) {
  const brand = vendorBrand.find(([re]) => re.test(model.vendor || ''))?.[1]
  if (brand) return <Logo brand={brand} size={20} />
  return model.kind === 'audio' && /music|audio 3/i.test(model.name) ? <Glyph name="music" /> : <KindIcon kind={model.kind} />
}
