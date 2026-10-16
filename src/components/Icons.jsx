const s = { width: 16, height: 16, viewBox: '0 0 24 24', fill: 'none', stroke: 'currentColor', strokeWidth: 2, strokeLinecap: 'round', strokeLinejoin: 'round' }

export const IconModel = () => <svg {...s}><path d="M4 18V9M9 18V5M14 18v-7M19 18V8" /></svg>
export const IconAspect = () => <svg {...s}><path d="M4 8V5h3M17 5h3v3M20 16v3h-3M7 19H4v-3" /></svg>
export const IconClock = () => <svg {...s}><circle cx="12" cy="12" r="8" /><path d="M12 8v4l3 2" /></svg>
export const IconStack = () => <svg {...s}><rect x="4" y="4" width="12" height="12" rx="2" /><path d="M8 20h10a2 2 0 0 0 2-2V8" /></svg>
export const IconSpark = () => <svg {...s}><path d="M12 3v4M12 17v4M3 12h4M17 12h4M6 6l2.5 2.5M15.5 15.5 18 18M18 6l-2.5 2.5M8.5 15.5 6 18" /></svg>
export const IconSearch = () => <svg {...s} strokeWidth={2.4}><circle cx="11" cy="11" r="6.5" /><path d="m20 20-4.2-4.2" /></svg>
export const IconClip = () => <svg {...s}><path d="m20 11-8.2 8.2a5 5 0 0 1-7-7L13 4a3.3 3.3 0 0 1 4.7 4.7l-8.3 8.3a1.7 1.7 0 0 1-2.4-2.4l7.6-7.6" /></svg>
export const IconClose = () => <svg {...s} strokeWidth={2.4}><path d="M6 6l12 12M18 6 6 18" /></svg>
export const IconUpload = () => <svg {...s}><path d="M12 16V5M7 9l5-5 5 5M5 19h14" /></svg>
export const IconArrow = () => <svg {...s} strokeWidth={2.4}><path d="M5 12h14M13 6l6 6-6 6" /></svg>
export const IconCheck = () => <svg {...s} strokeWidth={2.6}><path d="m5 12 5 5 9-10" /></svg>
export const IconDownload = () => <svg {...s}><path d="M12 4v11M7 11l5 5 5-5M5 20h14" /></svg>
export const IconCopy = () => <svg {...s}><rect x="9" y="9" width="11" height="11" rx="2" /><path d="M5 15V6a2 2 0 0 1 2-2h8" /></svg>
export const IconTrash = () => <svg {...s}><path d="M5 7h14M10 7V4h4v3M7 7l1 13h8l1-13" /></svg>
export const IconPlus = () => <svg {...s} strokeWidth={2.4}><path d="M12 5v14M5 12h14" /></svg>
export const IconChevron = ({ dir = 'right' }) => <svg {...s} strokeWidth={2.4} style={{ transform: dir === 'left' ? 'scaleX(-1)' : undefined }}><path d="m9 5 7 7-7 7" /></svg>
export const IconLink = () => <svg {...s}><path d="M10 14a4 4 0 0 0 5.6 0l3-3a4 4 0 0 0-5.6-5.6l-1 1M14 10a4 4 0 0 0-5.6 0l-3 3a4 4 0 0 0 5.6 5.6l1-1" /></svg>
export const IconLibrary = () => <svg {...s}><path d="M5 4v16M10 4v16M15 5l4 14" /></svg>
export const IconImage = () => <svg {...s}><rect x="4" y="5" width="16" height="14" rx="2" /><circle cx="9" cy="10" r="1.6" /><path d="m20 16-4.5-4.5L7 19" /></svg>
export const IconVideo = () => <svg {...s}><rect x="3" y="6" width="13" height="12" rx="2" /><path d="m16 10 5-3v10l-5-3" /></svg>
export const IconAudio = () => <svg {...s}><path d="M5 10v4M9 7v10M13 4v16M17 8v8M21 11v2" /></svg>
export const IconCube = () => <svg {...s}><path d="m12 3 8 4.5v9L12 21l-8-4.5v-9L12 3Z" /><path d="m4 7.5 8 4.5 8-4.5M12 12v9" /></svg>
export const IconSettings =() => <svg {...s}><path d="M4 7h9M17 7h3M4 17h3M11 17h9" /><circle cx="15" cy="7" r="2" /><circle cx="9" cy="17" r="2" /></svg>
