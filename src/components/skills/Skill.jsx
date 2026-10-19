import { useEffect, useRef, useState } from 'react'
import { Link } from 'react-router-dom'
import Segmented from '../Segmented.jsx'
import { IconCheck, IconCopy } from '../Icons.jsx'
import { Glyph, KindIcon } from '../nav/ToolIcon.jsx'
import { agents, groupById } from '../../lib/skills.js'

// Copies text and says so for a moment. A blocked clipboard says how to copy by hand instead.
export function CopyButton({ text, label = 'Copy', className = 'btn-soft sm' }) {
  const [state, setState] = useState(null)
  const timer = useRef(null)
  useEffect(() => () => clearTimeout(timer.current), [])
  const copy = async () => {
    try {
      await navigator.clipboard.writeText(text)
      setState('done')
    } catch {
      setState('failed')
    }
    clearTimeout(timer.current)
    timer.current = setTimeout(() => setState(null), 1800)
  }
  return (
    <button type="button" className={`copy-btn ${className}`} onClick={copy}>
      {state === 'done' ? <IconCheck /> : <IconCopy />}
      <span aria-live="polite">{state === 'done' ? 'Copied' : state === 'failed' ? 'Select and copy by hand' : label}</span>
    </button>
  )
}

export function SkillCover({ skill, big = false }) {
  return (
    <span className={`skill-cover${big ? ' big' : ''}`} style={{ background: skill.cover }}>
      <i className="skill-glyph"><KindIcon kind={skill.kind} /></i>
      {big && (
        <ol className="skill-flow" aria-label="What the agent does">
          {skill.steps.map((step, i) => <li key={step} style={{ '--d': `calc(${Math.min(i + 2, 12)} * var(--stagger))` }}>{step}</li>)}
        </ol>
      )}
      {skill.badge && <i className="app-badge">{skill.badge}</i>}
    </span>
  )
}

export function SkillTags({ skill, limit = 2 }) {
  const groups = skill.groups.filter((g) => g !== 'popular').slice(0, limit)
  return (
    <span className="skill-tags">
      <em className="skill-cmd">/{skill.command}</em>
      {groups.map((g) => {
        const group = groupById(g)
        return <em key={g}><Glyph name={group.glyph} />{group.name}</em>
      })}
      {skill.bundle && <em>{skill.bundle.length} skills</em>}
    </span>
  )
}

// One skill in the library list: the cover and name open its page, Copy prompt works from the list.
export function SkillRow({ skill, i = 0 }) {
  return (
    <article className="skill-row glass rise" style={{ '--d': `calc(${Math.min(i, 12)} * var(--stagger))` }}>
      <SkillCover skill={skill} />
      <div className="skill-row-body">
        <h3><Link to={`/skills/${skill.id}`}>{skill.name}</Link></h3>
        <p>{skill.blurb}</p>
        <SkillTags skill={skill} />
      </div>
      <div className="skill-row-go">
        <CopyButton text={skill.prompt} label="Copy prompt" />
      </div>
    </article>
  )
}

export function SkillCard({ skill, i = 0 }) {
  return (
    <Link to={`/skills/${skill.id}`} className="recipe-card skill-card rise" style={{ '--d': `calc(${Math.min(i, 12)} * var(--stagger))` }}>
      <SkillCover skill={skill} />
      <strong>{skill.name}</strong>
      <small>{skill.blurb}</small>
      <SkillTags skill={skill} limit={1} />
    </Link>
  )
}

// The setup for each agent, one tab each, with the exact text to paste.
export function ConnectAgent() {
  const [id, setId] = useState(agents[0].id)
  const agent = agents.find((a) => a.id === id)
  return (
    <div className="skill-connect">
      <div className="apps-tabs">
        <Segmented options={agents.map((a) => ({ value: a.id, label: a.name }))} value={id} onChange={setId} />
      </div>
      <p className="skill-where">{agent.where}</p>
      <div className="skill-code">
        <pre><code>{agent.code}</code></pre>
        <CopyButton key={agent.id} text={agent.code} className="btn-soft xs" />
      </div>
    </div>
  )
}
