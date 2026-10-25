import { useMemo } from 'react'
import { Link } from 'react-router-dom'
import { AppGrid, AppStrip } from '../components/apps/AppCard.jsx'
import { isNew, isTrending } from '../components/apps/data.js'
import { filterFormats } from '../lib/formats/index.js'
import { pinnedFirst } from '../../shared/workspaces.js'
import { usePinned } from '../lib/workspaces.js'

export default function Effects() {
  const pins = usePinned()
  const list = useMemo(() => pinnedFirst(filterFormats({ category: 'effects', openOnly: false }), pins), [pins])
  const fresh = list.filter(isNew)
  const hot = list.filter(isTrending)

  return (
    <main className="page apps-page">
      <div className="page-head fx-head rise">
        <h1>Effects</h1>
        <p>Turn one photo into a short effect clip. Pick an effect to start.</p>
      </div>

      {list.length > 0 ? (
        <>
          <nav className="app-names rise" aria-label="Every effect">
            {list.map((f) => <Link key={f.id} to={`/apps/${f.id}`}>{f.name}{isNew(f) && <em>New</em>}</Link>)}
          </nav>
          {fresh.length > 0 && <Strip title="New" blurb="Just added." list={fresh} />}
          {hot.length > 0 && <Strip title="Trending" blurb="The ones to try first." list={hot} />}
          <section className="apps-sec rise">
            <div className="apps-sec-head">
              <div>
                <h2>All effects</h2>
                <p>{list.length} effects</p>
              </div>
            </div>
            <AppGrid list={list} />
          </section>
        </>
      ) : (
        <div className="empty glass rise">No effects yet.</div>
      )}
    </main>
  )
}

function Strip({ title, blurb, list }) {
  return (
    <section className="apps-sec rise">
      <div className="apps-sec-head">
        <div>
          <h2>{title}</h2>
          <p>{blurb}</p>
        </div>
      </div>
      <AppStrip list={list} />
    </section>
  )
}
