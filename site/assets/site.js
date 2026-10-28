// Plays footage only while it is on screen, and never on its own for reduced motion.
const still = matchMedia('(prefers-reduced-motion: reduce)')
const seen = new IntersectionObserver((entries) => entries.forEach(({ target, isIntersecting }) => {
  if (isIntersecting && !still.matches && !target.dataset.paused) target.play().catch(() => {})
  else target.pause()
}), { threshold: 0.25 })
document.querySelectorAll('video[data-autoplay]').forEach((video) => seen.observe(video))

// Each Play button controls its own video and remembers a manual pause.
document.querySelectorAll('.toggle[data-video]').forEach((toggle) => {
  const video = document.getElementById(toggle.dataset.video)
  const name = toggle.getAttribute('aria-label').replace(/^Play /, '')
  const label = () => {
    toggle.textContent = video.paused ? 'Play' : 'Pause'
    toggle.setAttribute('aria-label', `${video.paused ? 'Play' : 'Pause'} ${name}`)
  }
  video.addEventListener('play', label)
  video.addEventListener('pause', label)
  toggle.addEventListener('click', () => {
    if (video.paused) { delete video.dataset.paused; video.play() } else { video.dataset.paused = 'true'; video.pause() }
  })
})

// The Cinema shot timeline follows the scene as it plays.
const film = document.getElementById('film')
const shots = document.querySelectorAll('.reel li')
const tick = () => {
  const part = film.duration / shots.length || 1
  shots.forEach((li, i) => li.style.setProperty('--fill', Math.min(1, Math.max(0, (film.currentTime - i * part) / part))))
  if (!film.paused) requestAnimationFrame(tick)
}
film.addEventListener('play', tick)

document.querySelectorAll('[data-copy]').forEach((button) => button.addEventListener('click', async () => {
  await navigator.clipboard.writeText(document.getElementById(button.dataset.copy).innerText)
  button.textContent = 'Copied'
  setTimeout(() => { button.textContent = 'Copy' }, 1600)
}))
