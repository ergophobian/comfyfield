import { useEffect, useRef, useState } from 'react'
import { Link } from 'react-router-dom'
import { IconClip, IconClose, IconPlus } from '../components/Icons.jsx'
import { Toggle, NotWired, IconSend, stagger } from '../components/studiob/Kit.jsx'
import { money } from '../lib/cost.js'

const suggestions = [
  'Make three 15 second ads for my linen tote',
  'Turn my podcast clip into a 9:16 short with captions',
  'A 1 minute explainer on how solar panels work',
  'Start a faceless history channel with four episodes',
  'Six lifestyle photos of my ceramic mug',
  'A 30 second upbeat jingle for a bakery',
  'Remake a winning ad with my product',
  'A moody poster for a jazz night',
]

const numbers = { one: 1, two: 2, three: 3, four: 4, five: 5, six: 6, eight: 8, ten: 10, twelve: 12 }

// Reads the few things a plan depends on: shape, length and how many.
function read(text) {
  const t = text.toLowerCase()
  const aspect = /9:16|vertical|reel|short|tiktok|story/.test(t) ? '9:16' : /1:1|square/.test(t) ? '1:1' : '16:9'
  const min = t.match(/(\d+)\s*-?\s*(?:min|minute)/)
  const sec = t.match(/(\d+)\s*-?\s*(?:s\b|sec|second)/)
  // "three 15 second ads" is three ads: a number followed by a time unit is a length, not a count.
  const many = [...t.matchAll(/\b(\d+|one|two|three|four|five|six|eight|ten|twelve)\s+((?:[a-z0-9-]+\s+){0,3}?)(ads|photos|images|videos|episodes|shots|clips|posters|versions)\b/g)]
    .find((m) => !/^(s|sec|second|seconds|min|minute|minutes)\b/.test(m[2]))
  return { t, aspect, seconds: min ? Number(min[1]) * 60 : sec ? Number(sec[1]) : null, count: many ? numbers[many[1]] || Number(many[1]) : null }
}

const step = (title, model, settings, usd) => ({ title, model, settings, usd })

// A sample plan per kind of request. Real plans come from the planner model once it is wired.
function planFor(text) {
  const { t, aspect, seconds, count } = read(text)
  if (/\b(remake|recreate|winning ad)\b/.test(t)) {
    const n = count || 3
    return { title: `${n} versions of an ad`, steps: [
      step('Break the reference into shots', 'Qwen3-VL', 'Cuts, timing and what is on screen', 0.01),
      step('Swap in your product and cast', 'Wan VACE', `${n} versions, 720p`, n * 0.35),
      step('Write new hooks and calls to action', 'Kimi K3', `${n} options`, 0.01),
      step('Voice the new lines', 'Chatterbox Multilingual', `${n} reads`, n * 0.01),
    ] }
  }
  if (/\b(ad|ads|commercial|ugc|product video)\b/.test(t)) {
    const n = count || 3
    const s = seconds || 15
    return { title: `${n} product ${n === 1 ? 'ad' : 'ads'}`, steps: [
      step('Write the scripts and shot lists', 'Kimi K3', `${n} hooks, ${s} s each`, 0.02),
      step('Shoot the product stills', 'FLUX 3 Image Klein', `${n * 3} images, ${aspect}`, n * 3 * 0.004),
      step('Animate each shot', 'Wan 2.2', `${n * 3} clips, 5 s, ${aspect}`, n * 3 * 0.12),
      step('Record the voiceover', 'Chatterbox Multilingual', `${n} reads, warm and upbeat`, n * 0.01),
      step('Cut, caption and export', 'ComfyField', `${n} MP4s with captions`, 0),
    ] }
  }
  if (/\b(podcast|reel|short|shorts|tiktok|clip)\b/.test(t)) {
    return { title: 'A short from your footage', steps: [
      step('Find the best moments', 'Qwen3-VL', 'Up to 3 cuts of 20 to 40 s', 0.02),
      step('Reframe to vertical', 'SAM 3.1 and Wan VACE', `${aspect}, follow the speaker`, 0.3),
      step('Transcribe and caption', 'Qwen3-ASR', 'Word by word captions', 0.01),
      step('Sharpen the picture', 'SeedVR2 3B', '2x, precise', 0.08),
    ] }
  }
  if (/\b(faceless|channel|series|episodes)\b/.test(t)) {
    const n = count || 4
    return { title: `A faceless channel, ${n} episodes`, steps: [
      step('Plan the channel and the episodes', 'Kimi K3', `${n} topics and scripts, 3 min each`, 0.04),
      step('Draw the scenes', 'FLUX 3 Image Klein', `${n * 18} stills in one style`, n * 18 * 0.004),
      step('Animate the scenes', 'LTX-2.5', `${n * 18} clips, ${aspect}`, n * 18 * 0.06),
      step('Narrate', 'Fish Audio Drama 3', `${n} episodes, one narrator`, n * 0.03),
      step('Add music and captions', 'Stable Audio 3', 'One bed per episode', n * 0.02),
    ] }
  }
  if (/\b(explain|explainer|how|why|lesson|teach)\b/.test(t)) {
    const s = seconds || 60
    const scenes = Math.max(3, Math.round(s / 10))
    return { title: `A ${s < 60 ? `${s} second` : `${Math.round(s / 60)} minute`} explainer`, steps: [
      step('Write the script', 'Kimi K3', `${scenes} scenes, about ${Math.round(s * 2.5)} words`, 0.01),
      step('Illustrate each scene', 'FLUX 3 Image Klein', `${scenes} images, ${aspect}`, scenes * 0.004),
      step('Animate the scenes', 'LTX-2.5', `${scenes} clips`, scenes * 0.06),
      step('Narrate', 'Chatterbox Multilingual', 'Clear and friendly', 0.02),
      step('Assemble with music', 'Stable Audio 3', 'Soft background bed', 0.02),
    ] }
  }
  if (/\b(song|music|jingle|track|beat)\b/.test(t)) {
    const s = seconds || 30
    return { title: `A ${s} second track`, steps: [
      step('Write the lyrics', 'Kimi K3', 'Hook and one verse', 0.01),
      step('Make the song', 'MiniMax Music 3', `${s} s with vocals`, 0.05),
      step('Make the cover art', 'FLUX 3 Image Klein', '1 image, 1:1', 0.004),
    ] }
  }
  if (/\b(photo|photos|image|images|poster|picture|shot)\b/.test(t)) {
    const n = count || 4
    return { title: `${n} ${n === 1 ? 'image' : 'images'}`, steps: [
      step('Write the prompts', 'Kimi K3', `${n} variations of the idea`, 0.01),
      step('Make the images', 'FLUX 3 Image Klein', `${n} images, ${aspect === '16:9' ? '4:5' : aspect}`, n * 0.004),
      step('Upscale the keepers', 'SeedVR2 7B', '2x, precise', n * 0.02),
    ] }
  }
  return { title: 'A short video', steps: [
    step('Sketch the idea', 'Kimi K3', 'Shot list and prompts', 0.01),
    step('Make the key frames', 'FLUX 3 Image Klein', `3 images, ${aspect}`, 0.012),
    step('Animate them', 'Wan 2.2', `3 clips, 5 s, ${aspect}`, 0.36),
    step('Add sound', 'Stable Audio 3', 'Ambience and effects', 0.02),
  ] }
}

const cost = (usd) => (usd ? money(usd) : 'No cost')
const listOf = (xs) => (xs.length > 1 ? `${xs.slice(0, -1).join(', ')} and ${xs[xs.length - 1]}` : xs[0])
let nextChat = 1
const newChat = () => ({ id: `c${nextChat++}`, title: '', messages: [] })

function Plan({ plan, ask }) {
  const total = plan.steps.reduce((n, s) => n + s.usd, 0)
  const models = [...new Set(plan.steps.map((s) => s.model).filter((m) => m !== 'ComfyField'))]
  return (
    <div className="sb-plan">
      <div className="sb-plan-head">
        <strong>Plan: {plan.title}</strong>
        <span className="soon-tag">Sample plan</span>
      </div>
      <ol>
        {plan.steps.map((s, i) => (
          <li key={i} className="rise" style={stagger(i)}>
            <b>{i + 1}</b>
            <div>
              <strong>{s.title}</strong>
              <span><em>{s.model}</em>{s.settings}</span>
            </div>
            <span className="sb-cost">{s.usd ? `≈${cost(s.usd)}` : cost(0)}</span>
          </li>
        ))}
      </ol>
      <div className="sb-plan-total">
        <span>Estimated total</span>
        <strong>≈{money(total)}</strong>
      </div>
      <p className="sheet-note">Sample estimate. {ask ? 'Nothing runs until you approve it.' : 'With asking off, this would start right away once the assistant is wired.'}</p>
      <NotWired inline label="Approve" runsOn={listOf(models)} />
    </div>
  )
}

export default function Assistant() {
  const [chats, setChats] = useState(() => [newChat()])
  const [current, setCurrent] = useState(() => chats[0].id)
  const [text, setText] = useState('')
  const [files, setFiles] = useState([])
  const [ask, setAsk] = useState(true)
  const fileRef = useRef(null)
  const endRef = useRef(null)
  const inputRef = useRef(null)

  const chat = chats.find((c) => c.id === current) || chats[0]
  const started = chat.messages.length > 0
  const history = chats.filter((c) => c.messages.length)

  useEffect(() => {
    if (!started) return
    const calm = window.matchMedia?.('(prefers-reduced-motion: reduce)').matches
    endRef.current?.scrollIntoView({ behavior: calm ? 'auto' : 'smooth', block: 'end' })
  }, [chat.messages.length])

  const send = (e) => {
    e?.preventDefault()
    const said = text.trim()
    if (!said) return
    const reply = { role: 'bot', plan: planFor(said), ask }
    setChats((list) => list.map((c) => (c.id === chat.id
      ? { ...c, title: c.title || said, messages: [...c.messages, { role: 'user', text: said, files }, reply] }
      : c)))
    setText('')
    setFiles([])
  }
  const startNew = () => {
    if (!started) { inputRef.current?.focus(); return }
    const c = newChat()
    setChats((list) => [c, ...list])
    setCurrent(c.id)
    setText('')
    setFiles([])
  }
  const drop = (id) => {
    const rest = chats.filter((c) => c.id !== id)
    const list = rest.length ? rest : [newChat()]
    setChats(list)
    if (id === chat.id) setCurrent(list[0].id)
  }

  const composer = (
    <form className="composer glass sb-compose" onSubmit={send}>
      <div className="composer-inner">
        <textarea ref={inputRef} rows={started ? 2 : 3} value={text} onChange={(e) => setText(e.target.value)} aria-label="Message"
          placeholder={started ? 'Reply to change the plan' : 'Describe what you want to make, such as turn my podcast into a 9:16 reel'}
          onKeyDown={(e) => { if (e.key === 'Enter' && !e.shiftKey) send(e) }} />
        {files.length > 0 && (
          <div className="refs">
            {files.map((f) => (
              <span className="ref" key={f}>{f}
                <button type="button" onClick={() => setFiles((x) => x.filter((n) => n !== f))} aria-label={`Remove ${f}`}><IconClose /></button>
              </span>
            ))}
          </div>
        )}
        <div className="composer-foot">
          <div className="chips">
            <div className="chip"><button type="button" onClick={() => fileRef.current.click()} aria-label="Attach files"><IconClip />Attach</button></div>
            <input ref={fileRef} type="file" multiple hidden onChange={(e) => { setFiles((x) => [...new Set([...x, ...[...e.target.files].map((f) => f.name)])]); e.target.value = '' }} />
          </div>
          <div className="sb-send">
            <Toggle on={ask} onChange={setAsk}>Ask before generating</Toggle>
            <button className="btn-blue sb-send-btn" disabled={!text.trim()} aria-label="Send"><IconSend /></button>
          </div>
        </div>
      </div>
    </form>
  )

  return (
    <main className="sb-chat">
      <aside className="sb-chats glass" aria-label="Chats">
        <button type="button" className="btn-soft sb-new" onClick={startNew}><IconPlus />New chat</button>
        <nav className="sb-links" aria-label="Shortcuts">
          <Link to="/apps">Formats</Link>
          <Link to="/flows">Flows</Link>
          <Link to="/connections">Connections</Link>
        </nav>
        <h6>Chats</h6>
        {history.length ? (
          <ul className="sb-history">
            {history.map((c) => (
              <li key={c.id} className={c.id === chat.id ? 'on' : ''}>
                <button type="button" aria-current={c.id === chat.id ? 'true' : undefined} onClick={() => setCurrent(c.id)}>{c.title}</button>
                <button type="button" className="plist-x" onClick={() => drop(c.id)} aria-label={`Delete ${c.title}`}><IconClose /></button>
              </li>
            ))}
          </ul>
        ) : <p className="sheet-note">No chats yet. Your chats stay here until you reload the page.</p>}
      </aside>

      <section className="sb-talk" aria-label="Conversation">
        {!started ? (
          <div className="sb-start">
            <div className="sb-hero rise">
              <span className="sb-badge">Assistant</span>
              <h1>What should we make today?</h1>
              <p>Describe it in plain words. You get a step by step plan with the models, the settings and the cost, and nothing runs until you approve it.</p>
            </div>
            {composer}
            <div className="pills sb-suggest" role="group" aria-label="Suggestions">
              {suggestions.map((s, i) => (
                <button key={s} type="button" className="rise" style={stagger(i + 3)}
                  onClick={() => { setText(s); inputRef.current?.focus() }}>{s}</button>
              ))}
            </div>
          </div>
        ) : (
          <>
            <ol className="sb-thread">
              {chat.messages.map((m, i) => (
                <li key={i} className={`sb-msg ${m.role} rise`}>
                  {m.role === 'user' ? (
                    <>
                      <p>{m.text}</p>
                      {m.files?.length > 0 && <small>{m.files.join(', ')}</small>}
                    </>
                  ) : (
                    <>
                      <p>Here is how I would make {m.plan.title.toLowerCase()}. Change anything by replying.</p>
                      <Plan plan={m.plan} ask={m.ask} />
                    </>
                  )}
                </li>
              ))}
              <li ref={endRef} aria-hidden="true" />
            </ol>
            <div className="sb-reply">{composer}</div>
          </>
        )}
      </section>
    </main>
  )
}
