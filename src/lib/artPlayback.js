export function createCoverPlayback(isHidden = () => document.hidden) {
  const covers = new Set()
  const schedule = () => {
    const selected = [...covers].filter((cover) => cover.visible && !isHidden()).slice(0, 4)
    for (const cover of covers) {
      if (!selected.includes(cover)) {
        cover.active = false
        cover.video.pause()
      }
    }
    for (const cover of selected) {
      if (cover.active) continue
      // Pending play promises reserve slots too.
      cover.active = true
      cover.video.play()?.then(() => {
        if (!cover.active) cover.video.pause()
      }).catch((error) => {
        if (error.name === 'AbortError') {
          cover.active = false
          schedule()
        } else if (cover.active) {
          cover.visible = false
          cover.active = false
          cover.fail()
          schedule()
        }
      })
    }
  }
  return {
    schedule,
    add(video, fail) {
      const cover = { video, fail, visible: false, active: false }
      covers.add(cover)
      return {
        visibility(ratio) {
          cover.visible = ratio >= 0.5
          schedule()
        },
        remove() {
          cover.active = false
          video.pause()
          covers.delete(cover)
          schedule()
        },
      }
    },
  }
}
