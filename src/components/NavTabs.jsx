import { useLayoutEffect, useRef, useState } from 'react'
import { NavLink, useLocation } from 'react-router-dom'

const tabs = [['/', 'Create'], ['/models', 'Models'], ['/library', 'Library'], ['/connections', 'Connections']]

// Top tabs with an underline that slides between routes.
export default function NavTabs() {
  const { pathname } = useLocation()
  const ref = useRef(null)
  const [bar, setBar] = useState(null)

  useLayoutEffect(() => {
    const measure = () => {
      const el = ref.current?.querySelector('a.active')
      setBar(el ? { x: el.offsetLeft, w: el.offsetWidth } : null)
    }
    measure()
    document.fonts?.ready.then(measure)
    window.addEventListener('resize', measure)
    return () => window.removeEventListener('resize', measure)
  }, [pathname])

  return (
    <nav className="tabs" ref={ref}>
      {tabs.map(([to, label]) => <NavLink key={to} to={to} end={to === '/'}>{label}</NavLink>)}
      {bar && <span className="tabs-bar" style={{ transform: `translateX(${bar.x}px)`, width: bar.w }} />}
    </nav>
  )
}
