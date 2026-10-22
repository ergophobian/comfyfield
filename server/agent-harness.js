import crypto from 'node:crypto'
import { fileURLToPath } from 'node:url'
import * as core from './core.js'
import { createFlows, clone, problem, flowSignature } from './flows.js'
import { createEngine } from '../src/lib/flowEngine.js'
import { createServer } from './mcp.js'
import { adapterSetup, claudeAdapter, codexAdapter } from './agent-adapters.js'

const bridge = fileURLToPath(new URL('./agent-mcp.js', import.meta.url))
const unwrap = (result) => {
  const text = result.content?.filter((c) => c.type === 'text').map((c) => c.text).join('\n') || ''
  if (result.isError) throw new Error(text)
  try { return JSON.parse(text) } catch { return text }
}

export function createHarness({ adapters = { claude: claudeAdapter, codex: codexAdapter }, setup = adapterSetup, directory = core.home, generate = core.generate, writePrompt = core.writePrompt, stitch = core.stitch, estimate = core.estimateCost, handlers: overrides = {} } = {}) {
  const sessions = new Map()
  const listeners = new Set()
  let sequence = 0
  const publish = (event) => {
    const value = { ...event, id: ++sequence, time: Date.now() }
    listeners.forEach((fn) => fn(value))
    return value
  }
  const flows = createFlows({ directory, generate, writePrompt, stitch, changed: publish })
  const handlers = new Map()
  createServer({ handlers, flowService: flows })
  for (const [name, fn] of Object.entries(overrides)) handlers.set(name, fn)
  const get = (id) => {
    const session = sessions.get(id)
    if (!session) throw problem('Session not found', 404)
    return session
  }
  const emit = (session, event) => {
    if (session.stopped && event.type !== 'status') return
    const value = publish({ ...event, sessionId: session.id, agent: session.name })
    session.events.push(value)
    if (session.events.length > 500) session.events.shift()
    return value
  }
  const status = (session, value) => { session.status = value; emit(session, { type: 'status', status: value }) }
  const cancelPlans = (session, message) => {
    for (const plan of session.plans.values()) plan.reject(problem(message, 409))
    session.plans.clear()
  }
  const view = (s) => ({ id: s.id, name: s.name, adapter: s.adapter, status: s.status, events: s.events, plans: [...s.plans.values()].map(({ resolve, reject, ...p }) => p) })
  const approval = async (session, plan) => {
    if (session.stopped) throw problem('Session stopped', 409)
    const id = crypto.randomUUID()
    const wait = new Promise((resolve, reject) => session.plans.set(id, { ...plan, id, resolve, reject }))
    status(session, 'approval')
    emit(session, { type: 'plan', plan: { ...plan, id } })
    try { await wait } finally {
      session.plans.delete(id)
      if (!session.stopped && session.busy && !session.plans.size) status(session, 'working')
    }
    if (session.stopped) throw problem('Session stopped', 409)
  }
  const call = async (id, name, input) => {
    const session = get(id)
    if (session.stopped) throw problem('Session stopped', 409)
    if (!session.busy) throw problem('Send a message before calling tools', 409)
    if (!handlers.has(name)) throw problem('Unknown tool', 404)
    const args = clone(input)
    emit(session, { type: 'tool', name, state: 'running' })
    let snapshot
    let state
    const allowance = new Map()
    const jobKey = ({ model, prompt, aspect, duration, count }) => JSON.stringify({ model, prompt, aspect, duration, count })
    try {
      if (name === 'run_flow') {
        snapshot = flows.get(args.flow_id)
        state = clone(flows.engine(args.flow_id).state)
        const jobs = []
        const writes = []
        const stitches = []
        const dry = createEngine({
          run: async (model, opts) => {
            jobs.push({ ...opts, model: model.id })
            return Array.from({ length: opts.count || 1 }, (_, i) => ({ kind: model.kind, url: `/media/estimate-${i}.png` }))
          },
          writePrompt: async (input) => { writes.push(input); return 'Prompt awaiting review' },
          stitch: async (input) => { stitches.push(input); return { kind: 'video', url: '/media/estimate-stitch.mp4' } },
        })
        dry.load(state)
        await dry.runNew(snapshot)
        for (const job of jobs) allowance.set(jobKey(job), (allowance.get(jobKey(job)) || 0) + 1)
        for (const input of writes) allowance.set(`writer:${JSON.stringify(input)}`, 1)
        const steps = await Promise.all(jobs.map(async (job) => ({ model: job.model, prompt: job.prompt, aspect: job.aspect, duration: job.duration, count: job.count, usd: (await estimate(job).catch(() => null))?.usd ?? null })))
        steps.push(...writes.map((input) => ({ model: 'Google Gemini writer', prompt: input.instructions, usd: null })))
        steps.push(...stitches.map(() => ({ model: 'Local Stitch', prompt: 'Join clips locally', usd: 0 })))
        await approval(session, { title: `Run ${snapshot.name}`, tool: name, args, flow: snapshot, steps, usd: steps.every((s) => s.usd != null) ? steps.reduce((n, s) => n + s.usd, 0) : null })
        if (flowSignature(snapshot) !== flowSignature(flows.get(args.flow_id)) || JSON.stringify(state) !== JSON.stringify(flows.engine(args.flow_id).state)) throw problem('The flow changed. Request a fresh plan before running.', 409)
      } else if (['generate', 'write_prompts'].includes(name)) {
        const cost = name === 'generate' ? await estimate(args).catch(() => null) : null
        await approval(session, { title: name === 'generate' ? 'Generate media' : 'Write prompts', tool: name, args, steps: [{ ...args, model: args.model || 'Google Gemini', prompt: args.prompt || args.idea, usd: cost?.usd ?? null }], usd: cost?.usd ?? null })
      }
      if (session.stopped || !session.busy) throw problem('Session stopped or turn ended', 409)
      if (args.flow_id) {
        const flow = flows.get(args.flow_id)
        const node = flow.nodes.find((n) => n.id === args.node_id) || flow.nodes.find((n) => n.id === args.source) || flow.nodes[0]
        emit(session, { type: 'presence', flowId: flow.id, nodeId: node?.id, position: args.position || node?.position || { x: 0, y: 0 } })
      }
      let result
      if (name === 'run_flow') {
        result = await flows.perform(args.flow_id, 'runNew', null, null, { flow: snapshot, generate: (job) => {
          if (session.stopped) throw new Error('Session stopped')
          const key = jobKey(job)
          if (!allowance.get(key)) throw new Error('This generation was not in the approved plan. Request a fresh plan.')
          allowance.set(key, allowance.get(key) - 1)
          return generate(job)
        }, writePrompt: (input) => {
          if (session.stopped) throw new Error('Session stopped')
          const key = `writer:${JSON.stringify(input)}`
          if (!allowance.get(key)) throw new Error('This writer was not in the approved plan. Request a fresh plan.')
          allowance.set(key, 0)
          return writePrompt(input)
        }, stitch: (input) => {
          if (session.stopped) throw new Error('Session stopped')
          return stitch({ ...input, preview: true })
        } })
        result = flows.report(args.flow_id, result)
      } else result = unwrap(await handlers.get(name)(args))
      if (name === 'add_node') emit(session, { type: 'presence', flowId: args.flow_id, nodeId: result.id, position: result.position })
      emit(session, { type: 'tool', name, state: 'done' })
      return result
    } catch (e) {
      emit(session, { type: 'tool', name, state: 'failed', text: e.message })
      throw e
    }
  }
  return {
    flows, call, setup,
    list: () => [...sessions.values()].map(view),
    get: (id) => view(get(id)),
    subscribe: (fn) => { listeners.add(fn); return () => listeners.delete(fn) },
    async start(adapter, origin) {
      if (!adapters[adapter] || !setup().some((s) => s.id === adapter && s.available)) throw problem('Install and sign in to this agent first.', 409)
      if ([...sessions.values()].some((s) => !s.stopped)) throw problem('Stop the current session before starting another.', 409)
      const session = { id: crypto.randomUUID(), name: 'Agent 1', adapter, token: crypto.randomUUID(), status: 'starting', events: [], plans: new Map(), stopped: false, busy: false }
      sessions.set(session.id, session)
      try {
        session.driver = await adapters[adapter]({ emit: (event) => emit(session, event), mcp: { command: process.execPath, args: [bridge, `${origin}/api/agents/${session.id}/tool`, session.token] } })
        if (session.stopped) { await session.driver.stop(); throw problem('Session stopped', 409) }
        status(session, 'idle')
        return view(session)
      } catch (e) { session.stopped = true; status(session, 'error'); throw e }
    },
    async send(id, text) {
      const session = get(id)
      if (session.stopped || session.busy) throw problem('Wait for the current turn, or start a new session.', 409)
      if (typeof text !== 'string' || !text.trim() || text.length > 20000) throw problem('Write a message of up to 20,000 characters.')
      session.busy = true
      emit(session, { type: 'message', role: 'user', text: text.trim() })
      status(session, 'working')
      Promise.resolve().then(() => session.driver.send(text.trim())).then(() => {
        session.busy = false
        cancelPlans(session, 'The agent turn ended. Request a fresh plan.')
        if (!session.stopped) status(session, 'idle')
      }, (error) => {
        session.busy = false
        cancelPlans(session, 'The agent turn ended. Request a fresh plan.')
        emit(session, { type: 'error', text: error.message })
        if (!session.stopped) status(session, 'error')
      }).finally(() => { session.busy = false })
      return { ok: true }
    },
    decide(id, planId, approved) {
      const session = get(id)
      const plan = session.plans.get(planId)
      if (!plan) throw problem('This plan is no longer waiting for approval.', 409)
      session.plans.delete(planId)
      emit(session, { type: 'decision', planId, approved })
      approved ? plan.resolve() : plan.reject(problem('The user rejected this plan.', 409))
      return { ok: true }
    },
    authorize(id, token) { return token === `Bearer ${get(id).token}` },
    async stop(id) {
      const session = get(id)
      if (session.stopped) return { ok: true }
      session.stopped = true
      cancelPlans(session, 'Session stopped')
      status(session, 'stopped')
      await session.driver?.stop()
      return { ok: true }
    },
    async close() { await Promise.all([...sessions.keys()].map((id) => this.stop(id))) },
  }
}
