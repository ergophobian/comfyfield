import { useEffect } from 'react'
import { Link, useParams } from 'react-router-dom'
import { ConnectAgent, CopyButton, SkillCard, SkillCover, SkillTags } from '../components/skills/Skill.jsx'
import { IconChevron } from '../components/Icons.jsx'
import { pathFor } from '../components/apps/data.js'
import { formatById, isWired } from '../lib/formats/index.js'
import { relatedSkills, skillById } from '../lib/skills.js'
import { toolById } from '../lib/tools.js'

// One skill: what it makes and the prompt to copy on the right, how to start under the cover, related skills below.
export default function SkillPage() {
  const { id } = useParams()
  const skill = skillById(id)
  // Related cards open another skill, which should start at its top.
  useEffect(() => { window.scrollTo(0, 0) }, [id])

  return (
    <main className="app-page skill-page">
      <nav className="crumbs rise" aria-label="Breadcrumb">
        <Link to="/skills">Skills</Link>
        <span aria-hidden="true">/</span>
        <span aria-current="page">{skill ? skill.name : 'Not found'}</span>
      </nav>
      {skill ? <SkillView key={skill.id} skill={skill} /> : (
        <div className="empty glass rise">
          <strong>Nothing lives at this address.</strong>
          <p>The skill may have been renamed or removed.</p>
          <Link className="btn-blue sm" to="/skills">Browse skills</Link>
        </div>
      )}
    </main>
  )
}

// Wired formats link to their own page; the rest are named and marked, since they have no page yet.
function SkillView({ skill }) {
  const uses = skill.formats.map(formatById).filter(Boolean)
  const picks = (skill.bundle || []).map(skillById).filter(Boolean)
  const studio = skill.studio && toolById(skill.studio)
  const related = relatedSkills(skill)

  return (
    <>
      <div className="skill-layout">
        <div className="skill-media rise">
          <SkillCover skill={skill} big />
        </div>

        <section className="skill-info rise">
          <SkillTags skill={skill} limit={3} />
          <h1>{skill.name}</h1>
          <p>{skill.about}</p>
          <div className="skill-try glass">
            <p className="skill-prompt">{skill.prompt}</p>
            <CopyButton text={skill.prompt} label="Copy prompt" className="btn-blue sm" />
          </div>
          <p className="sheet-output"><strong>You get</strong> {skill.output}</p>
          {uses.length > 0 && (
            <div className="skill-uses">
              <h2>Formats it runs</h2>
              <div className="skill-chips">
                {uses.map((f) => (isWired(f)
                  ? <Link key={f.id} className="skill-chip" to={pathFor(f)}>{f.name}</Link>
                  : <span key={f.id} className="skill-chip">{f.name}<em className="todo">Not wired yet</em></span>))}
              </div>
            </div>
          )}
          {picks.length > 0 && (
            <div className="skill-uses">
              <h2>Skills it picks from</h2>
              <div className="skill-chips">
                {picks.map((s) => <Link key={s.id} className="skill-chip" to={`/skills/${s.id}`}>{s.name}</Link>)}
              </div>
            </div>
          )}
          {studio && <p className="sheet-note">Rather do it by hand? <Link to={studio.route}>Open {studio.name.toLowerCase()}</Link></p>}
        </section>

        <section className="skill-start rise" aria-labelledby="start-title">
          <h2 id="start-title">Start in 3 steps</h2>
          <ol className="skill-steps glass">
            <li>
              <span className="skill-step-n" aria-hidden="true">1</span>
              <div>
                <h3>Connect ComfyField</h3>
                <p>Add the MCP server to your agent once. It runs on your own keys.</p>
                <ConnectAgent />
              </div>
            </li>
            <li>
              <span className="skill-step-n" aria-hidden="true">2</span>
              <div>
                <h3>Prepare your brief</h3>
                <p>Gather what the agent needs before you start:</p>
                <ul>{skill.bring.map((b) => <li key={b}>{b}</li>)}</ul>
              </div>
            </li>
            <li>
              <span className="skill-step-n" aria-hidden="true">3</span>
              <div>
                <h3>Run your first prompt</h3>
                <p>Copy the example, change it to fit your brief, attach your files and send it. The <code>/{skill.command}</code> command is not wired yet, so paste the prompt for now.</p>
              </div>
              <CopyButton text={skill.prompt} label="Copy prompt" />
            </li>
          </ol>
        </section>
      </div>

      {related.length > 0 && (
        <section className="app-more">
          <div className="apps-sec-head">
            <div>
              <h2>More skills like this</h2>
              <p>From the same groups</p>
            </div>
            <Link className="link-btn" to="/skills?group=all">See all<IconChevron /></Link>
          </div>
          <div className="recipe-grid app-grid">
            {related.map((s, i) => <SkillCard key={s.id} skill={s} i={i} />)}
          </div>
        </section>
      )}
    </>
  )
}
