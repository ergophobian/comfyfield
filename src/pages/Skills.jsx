import { useState } from 'react'
import { useSearchParams } from 'react-router-dom'
import { ConnectAgent, CopyButton, SkillRow } from '../components/skills/Skill.jsx'
import { IconClose, IconSearch } from '../components/Icons.jsx'
import { Glyph } from '../components/nav/ToolIcon.jsx'
import { bundles, checkPrompt, matchesSkill, skillGroups, skills, skillsIn } from '../lib/skills.js'

// Higgsfield's agent page: connect your agent at the top, the skill library below with groups on the left.
const extras = [
  { id: 'bundles', name: 'Bundles', glyph: 'apps', list: bundles },
  { id: 'all', name: 'All skills', glyph: 'menu', list: skills },
]
const filters = [...skillGroups.map((g) => ({ ...g, list: skillsIn(g.id) })), ...extras]

export default function Skills() {
  const [params, setParams] = useSearchParams()
  const [query, setQuery] = useState('')
  const picked = filters.find((f) => f.id === params.get('group')) || filters[0]
  const q = query.trim().toLowerCase()
  const shown = q ? skills.filter((s) => matchesSkill(s, q)) : picked.list

  const pick = (id) => {
    setQuery('')
    setParams(id === filters[0].id ? {} : { group: id }, { replace: true })
  }
  const filterButton = (f) => (
    <button key={f.id} type="button" className={`skills-filter${!q && f.id === picked.id ? ' on' : ''}`}
      aria-pressed={!q && f.id === picked.id} onClick={() => pick(f.id)}>
      <Glyph name={f.glyph} />{f.name}<em>{f.list.length}</em>
    </button>
  )

  return (
    <main className="page skills-page">
      <div className="page-head rise">
        <h1>Skills</h1>
        <p>Ready-made jobs your agent runs on ComfyField, from brief to finished file. Connect once, then ask in plain words.</p>
      </div>

      <section className="skills-connect glass rise" aria-labelledby="connect-title">
        <div className="skills-connect-copy">
          <h2 id="connect-title">Connect your agent</h2>
          <p>ComfyField runs as an MCP server on your own keys, so you pay your providers directly. Add it once and every skill below works from your agent.</p>
          <div className="skills-check">
            <span>Check it works: ask “{checkPrompt}”</span>
            <CopyButton text={checkPrompt} className="btn-soft xs" />
          </div>
        </div>
        <ConnectAgent />
      </section>

      <section className="skills-lib" aria-labelledby="lib-title">
        <aside className="skills-side rise">
          <h2 id="lib-title">Discover what you can make</h2>
          <label className="apps-search">
            <IconSearch />
            <input type="search" value={query} onChange={(e) => setQuery(e.target.value)} placeholder="Search skills" aria-label="Search skills" />
            {query && <button type="button" className="apps-clear" onClick={() => setQuery('')} aria-label="Clear search"><IconClose /></button>}
          </label>
          <nav className="skills-filters" aria-label="Skill groups">
            {filters.slice(0, skillGroups.length).map(filterButton)}
            <span className="skills-filter-div" aria-hidden="true" />
            {filters.slice(skillGroups.length).map(filterButton)}
          </nav>
        </aside>

        <div className="skills-list">
          <div className="skills-list-head">
            <h3>{q ? `Matches for “${query.trim()}”` : picked.name}</h3>
            <span>{shown.length} {shown.length === 1 ? 'skill' : 'skills'}</span>
          </div>
          <p className="skills-note">
            <em className="todo">Not wired yet</em>
            Slash commands come next. Until then, paste a prompt and your agent works through it with the ComfyField tools.
          </p>
          {shown.map((s, i) => <SkillRow key={s.id} skill={s} i={i} />)}
          {!shown.length && (
            <div className="empty glass rise">
              No skills match “{query.trim()}”.
              <div><button type="button" className="btn-soft" onClick={() => setQuery('')}>Clear search</button></div>
            </div>
          )}
        </div>
      </section>
    </main>
  )
}
