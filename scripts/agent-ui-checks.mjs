// Starts isolated fixtures and one fresh headless Chrome for this check.
import assert from 'node:assert/strict'
import fs from 'node:fs'
import path from 'node:path'
import { startFixture } from './agent-ui-fixture.mjs'
import { startBrowser, uiTimeout } from './browser.mjs'
import { setTimeout as wait } from 'node:timers/promises'

const fixtures = []
const output = path.resolve('research_notes', 'agent-harness')
fs.mkdirSync(output, { recursive: true })
let browser
const errors = []
const send = (...args) => browser.send(...args)
const evaluate = async (expression) => {
  const result = await send('Runtime.evaluate', { expression, returnByValue: true, awaitPromise: true })
  if (result.exceptionDetails) throw new Error(result.exceptionDetails.text)
  return result.result.value
}
const until = async (expression) => {
  for (const deadline = Date.now() + uiTimeout; Date.now() < deadline;) {
    if (await evaluate(expression)) return
    await wait(100)
  }
  throw new Error(`UI did not become ready: ${expression}`)
}
const click = (text) => evaluate(`(() => { const b = [...document.querySelectorAll('button')].find((b) => b.textContent.trim() === ${JSON.stringify(text)}); if (!b || b.disabled) throw new Error('Button unavailable: ' + ${JSON.stringify(text)}); b.click() })()`)
const screenshot = async (name) => {
  await wait(350)
  const { data } = await send('Page.captureScreenshot', { format: 'png', captureBeyondViewport: false })
  fs.writeFileSync(path.join(output, name), Buffer.from(data, 'base64'))
}
try {
  fixtures.push(await startFixture())
  fixtures.push(await startFixture(true))
  const [origin, setupOrigin] = fixtures.map((server) => `http://127.0.0.1:${server.httpServer.address().port}`)
  browser = await startBrowser('agent-ui', { onEvent(data) {
    if (data.method === 'Runtime.exceptionThrown') errors.push(data.params.exceptionDetails)
  } })
  await send('Page.enable')
  await send('Runtime.enable')
  await send('Emulation.setDeviceMetricsOverride', { width: 1440, height: 1080, deviceScaleFactor: 1, mobile: false })
  await send('Page.navigate', { url: `${origin}/assistant` })
  await until(`document.querySelector('[aria-label="Agent"]')?.value === 'fake'`)
  await click('Start session')
  await until(`document.body.textContent.includes('Agent 1 · Ready')`)
  await evaluate(`(() => { const input = document.querySelector('textarea[aria-label="Message"]'); Object.getOwnPropertyDescriptor(HTMLTextAreaElement.prototype, 'value').set.call(input, 'A paper boat drifting down a rainy street at dusk'); input.dispatchEvent(new Event('input', { bubbles: true })) })()`)
  await click('Send')
  await until(`document.body.textContent.includes('Approve plan')`)
  assert.ok(await evaluate(`document.body.textContent.includes('0.0040')`))
  assert.ok(await evaluate(`document.body.textContent.includes('Fake adapter test')`))
  await screenshot('assistant-plan-desktop.png')
  await send('Emulation.setDeviceMetricsOverride', { width: 390, height: 844, deviceScaleFactor: 1, mobile: true })
  await evaluate(`document.querySelector('.agent-plan').scrollIntoView({ block: 'start' })`)
  await screenshot('assistant-plan-mobile.png')
  assert.ok(await evaluate('document.documentElement.scrollWidth <= 390'), 'Assistant must fit 390px')
  await send('Emulation.setDeviceMetricsOverride', { width: 1440, height: 1080, deviceScaleFactor: 1, mobile: false })
  // A second agent, as a terminal MCP server would register, works on the model node.
  const roster = fixtures[0].harness.presence
  const terminal = roster.join()
  assert.deepEqual([terminal.name, terminal.color], ['Agent 2', 'agent-2'])
  await send('Page.navigate', { url: `${origin}/flows` })
  await until(`document.querySelector('.agent-node-badge')?.textContent.includes('Agent 1 is working on this')`)
  roster.touch(terminal.id, { flowId: 'fixture', nodeId: 'output' })
  await until(`!!document.querySelector('[aria-label="Agent 2 cursor"]')`)
  roster.touch(terminal.id, { flowId: 'fixture', nodeId: 'model' })
  // The cursor glides from the output node to the model node.
  await until(`(() => { const el = document.querySelector('[aria-label="Agent 2 cursor"]').parentElement; return el.style.transform === 'translate(350px, 0px)' && getComputedStyle(el).transitionProperty.includes('transform') })()`)
  await until(`[...document.querySelectorAll('.agent-node-badge')].some((b) => b.textContent === 'Agent 2 is working on this')`)
  assert.equal(await evaluate(`(() => { const probe = document.createElement('i'); probe.style.color = 'var(--agent-2)'; document.body.append(probe); const want = getComputedStyle(probe).color; probe.remove(); return getComputedStyle(document.querySelector('[aria-label="Agent 2 cursor"]')).backgroundColor === want })()`), true, 'each agent has its own color')
  await screenshot('canvas-two-agents-desktop.png')
  roster.rest(terminal.id)
  await until(`document.querySelector('[aria-label="Agent 2 cursor"]')?.parentElement.classList.contains('idle')`)
  await until(`!document.querySelector('[aria-label="Agent 2 cursor"]')`)
  await click('Assistant')
  await until(`document.querySelector('.agent-canvas-panel')?.textContent.includes('Approve plan')`)
  await screenshot('canvas-presence-desktop.png')
  await send('Emulation.setDeviceMetricsOverride', { width: 390, height: 844, deviceScaleFactor: 1, mobile: true })
  await screenshot('canvas-presence-mobile.png')
  assert.ok(await evaluate('document.documentElement.scrollWidth <= 390'), 'Canvas must fit 390px')
  await click('Approve plan')
  await until(`document.body.textContent.includes('Fake adapter completed. Approval worked')`)
  await until(`!document.querySelector('.agent-node-badge')`)
  await click('Stop session')
  await until(`document.body.textContent.includes('Agent 1 · Stopped')`)
  await click('Close assistant')
  await send('Emulation.setDeviceMetricsOverride', { width: 1440, height: 1080, deviceScaleFactor: 1, mobile: false })
  // Live sync: select a node and rename the flow here while another writer changes a prompt.
  await evaluate(`document.querySelector('.react-flow__node[data-id="output"]').dispatchEvent(new MouseEvent('click', { bubbles: true }))`)
  await until(`document.querySelector('.fpanel h3')?.textContent === 'Output'`)
  await evaluate(`(async () => {
    const input = document.querySelector('[aria-label="Flow name"]')
    Object.getOwnPropertyDescriptor(HTMLInputElement.prototype, 'value').set.call(input, 'My unsaved edit')
    input.dispatchEvent(new Event('input', { bubbles: true }))
    // Another writer: retry its own stale saves, like any client.
    for (let i = 0; i < 20; i++) {
      const store = await (await fetch('/api/flows')).json()
      store.flows[0].nodes.find((n) => n.id === 'prompt').data.text = 'An external edit'
      if ((await fetch('/api/flows', { method: 'PUT', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(store) })).ok) return
    }
    throw new Error('The external save failed')
  })()`)
  await until(`document.querySelector('.react-flow__node[data-id="prompt"]')?.textContent.includes('An external edit')`)
  assert.equal(await evaluate(`document.querySelector('[aria-label="Flow name"]').value`), 'My unsaved edit', 'the local edit stays')
  assert.equal(await evaluate(`document.querySelector('.fpanel h3')?.textContent`), 'Output', 'the selection stays')
  await until(`fetch('/api/flows').then((r) => r.json()).then((s) => s.flows[0].name === 'My unsaved edit' && s.flows[0].nodes[0].data.text === 'An external edit')`)
  assert.ok(!(await evaluate(`document.body.textContent.includes('Export unsaved flow')`)), 'no conflict error')
  await screenshot('canvas-live-sync-desktop.png')
  // Assign the whole flow to Agent 2 from the roster, and the prompt node to Agent 1 from its panel.
  const openAgents = () => evaluate(`[...document.querySelectorAll('.ftool .fpop > button')].find((b) => b.textContent.startsWith('Agents')).click()`)
  await openAgents()
  await until(`[...document.querySelectorAll('.agent-row')].some((b) => b.textContent.includes('Agent 2') && b.textContent.includes('Terminal'))`)
  await evaluate(`[...document.querySelectorAll('.agent-row')].find((b) => b.querySelector('span').textContent === 'Agent 2').click()`)
  await evaluate(`document.querySelector('.react-flow__node[data-id="prompt"]').dispatchEvent(new MouseEvent('click', { bubbles: true }))`)
  await until(`!!document.querySelector('select[aria-label="Assign this node to an agent"]')`)
  await evaluate(`(() => { const select = document.querySelector('select[aria-label="Assign this node to an agent"]'); Object.getOwnPropertyDescriptor(HTMLSelectElement.prototype, 'value').set.call(select, 'Agent 1'); select.dispatchEvent(new Event('change', { bubbles: true })) })()`)
  await until(`fetch('/api/flows').then((r) => r.json()).then((s) => s.flows[0].assignee === 'Agent 2' && s.flows[0].nodes.find((n) => n.id === 'prompt').assignee === 'Agent 1')`)
  await until(`document.querySelectorAll('.agent-assigned').length === 3 && document.querySelector('.agent-assigned').textContent === 'Agent 1'`)
  await openAgents()
  await until(`document.querySelector('.agent-row.on')?.textContent.includes('has this flow')`)
  await screenshot('canvas-assign-desktop.png')
  await send('Emulation.setDeviceMetricsOverride', { width: 390, height: 844, deviceScaleFactor: 1, mobile: true })
  await screenshot('canvas-assign-mobile.png')
  assert.ok(await evaluate('document.documentElement.scrollWidth <= 390'), 'The roster must fit 390px')
  await send('Emulation.setDeviceMetricsOverride', { width: 1440, height: 1080, deviceScaleFactor: 1, mobile: false })
  await send('Page.navigate', { url: `${setupOrigin}/assistant` })
  await until(`document.body.textContent.includes('Set up a local agent') && document.body.textContent.includes('codex login')`)
  assert.equal(await evaluate(`[...document.querySelectorAll('button')].find((b) => b.textContent.trim() === 'Start session')?.disabled`), true)
  assert.ok(await evaluate(`document.body.textContent.includes('codex login')`))
  await screenshot('assistant-setup-mobile.png')
  await send('Emulation.setDeviceMetricsOverride', { width: 1440, height: 1080, deviceScaleFactor: 1, mobile: false })
  await screenshot('assistant-setup-desktop.png')
  assert.equal(errors.length, 0, JSON.stringify(errors))
  console.log('ok    desktop/mobile chat, approval, canvas presence, stop, live sync with local selection, agent roster and assignment, and missing-agent setup; screenshots saved')
} finally {
  await browser?.close()
  await Promise.all(fixtures.map((server) => server.close()))
}
