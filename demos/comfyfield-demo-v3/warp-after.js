// loaded after kit/player.js: the film's info (for render.mjs) in song time
;(() => { const base = window.filmInfo; window.filmInfo = () => ({ ...base(), ...window.__warpInfo() }) })()
