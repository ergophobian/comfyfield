// Plays footage only while it is on screen, and never on its own for reduced motion.
const still = matchMedia('(prefers-reduced-motion: reduce)')
const seen = new IntersectionObserver((entries) => entries.forEach(({ target, isIntersecting }) => {
  if (isIntersecting && !still.matches && !target.dataset.paused) target.play().catch(() => {})
  else target.pause()
}), { threshold: 0.25 })
document.querySelectorAll('video[data-autoplay]').forEach((video) => seen.observe(video))

// The hero's shot timeline follows the scene as it plays.
const film = document.getElementById('film')
const shots = document.querySelectorAll('.reel li')
const tick = () => {
  const part = film.duration / shots.length || 1
  shots.forEach((li, i) => li.style.setProperty('--fill', Math.min(1, Math.max(0, (film.currentTime - i * part) / part))))
  if (!film.paused) requestAnimationFrame(tick)
}
const toggle = document.querySelector('.toggle')
const label = () => {
  toggle.textContent = film.paused ? 'Play' : 'Pause'
  toggle.setAttribute('aria-label', film.paused ? 'Play the scene' : 'Pause the scene')
}
film.addEventListener('play', () => { tick(); label() })
film.addEventListener('pause', label)
toggle.addEventListener('click', () => {
  if (film.paused) { delete film.dataset.paused; film.play() } else { film.dataset.paused = 'true'; film.pause() }
})

document.querySelectorAll('[data-copy]').forEach((button) => button.addEventListener('click', async () => {
  await navigator.clipboard.writeText(document.getElementById(button.dataset.copy).innerText)
  button.textContent = 'Copied'
  setTimeout(() => { button.textContent = 'Copy' }, 1600)
}))
