const s = { width: 16, height: 16, viewBox: '0 0 24 24', fill: 'none', stroke: 'currentColor', strokeWidth: 2, strokeLinecap: 'round', strokeLinejoin: 'round' }

export const IconModel = () => <svg {...s}><path d="M4 18V9M9 18V5M14 18v-7M19 18V8" /></svg>
export const IconAspect = () => <svg {...s}><path d="M4 8V5h3M17 5h3v3M20 16v3h-3M7 19H4v-3" /></svg>
export const IconClock = () => <svg {...s}><circle cx="12" cy="12" r="8" /><path d="M12 8v4l3 2" /></svg>
export const IconStack = () => <svg {...s}><rect x="4" y="4" width="12" height="12" rx="2" /><path d="M8 20h10a2 2 0 0 0 2-2V8" /></svg>
export const IconCamera = ({ size = 16 }) => <svg {...s} width={size} height={size}><path d="M3 7h11v10H3zM14 10l6-3v10l-6-3" /></svg>
export const IconSpark = ({ size = 16 }) => <svg {...s} width={size} height={size}><path d="M12 3v4M12 17v4M3 12h4M17 12h4M6 6l2.5 2.5M15.5 15.5 18 18M18 6l-2.5 2.5M8.5 15.5 6 18" /></svg>
export const IconImage = ({ size = 16 }) => <svg {...s} width={size} height={size}><rect x="3" y="4" width="18" height="16" rx="3" /><circle cx="9" cy="10" r="2" /><path d="m21 16-5-5-9 9" /></svg>
export const IconFilm = ({ size = 16 }) => <svg {...s} width={size} height={size}><rect x="3" y="4" width="18" height="16" rx="2" /><path d="M7 4v16M17 4v16M3 9h4M3 15h4M17 9h4M17 15h4" /></svg>
export const IconNodes = ({ size = 16 }) => <svg {...s} width={size} height={size}><circle cx="6" cy="6" r="2.5" /><circle cx="18" cy="12" r="2.5" /><circle cx="6" cy="18" r="2.5" /><path d="M8.5 6.5 15.5 11M8.5 17.5l7-4.5" /></svg>
