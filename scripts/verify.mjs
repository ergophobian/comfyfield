import { readdirSync } from 'node:fs'
import { spawn } from 'node:child_process'
import { killProcessTree } from './browser.mjs'

const checks = readdirSync('scripts').filter((file) => /-check.*\.mjs$/.test(file)).sort()
const browserChecks = ['agent-ui-checks.mjs', 'format-ui-check.mjs', 'widget-browser-checks.mjs']
const ordered = [...checks.filter((file) => !browserChecks.includes(file)), ...browserChecks]
let failed = 0
// Await full process exit before starting the next check, especially Chrome checks.
for (const file of ordered) {
  console.log(`Running ${file}`)
  const browser = browserChecks.includes(file)
  const result = await new Promise((resolve) => {
    const child = spawn(process.execPath, [`scripts/${file}`], {
      stdio: ['inherit', 'inherit', 'inherit', 'ipc'], windowsHide: true, detached: process.platform !== 'win32',
    })
    let error
    let forceKill
    const timeout = setTimeout(() => {
      error = new Error('Check timed out')
      // IPC allows Windows checks to close Chrome before Node is terminated.
      if (browser && child.connected) child.send({ type: 'shutdown' }, () => {})
      else child.kill('SIGTERM')
      forceKill = setTimeout(() => { void killProcessTree(child) }, 15000)
    }, browser ? 300000 : 180000)
    child.once('error', (value) => { error = value })
    child.once('close', (status) => {
      clearTimeout(timeout)
      clearTimeout(forceKill)
      resolve({ status, error })
    })
  })
  if (result.status !== 0 || result.error) { failed++; console.error(`Failed ${file}: ${result.error?.message || result.status}`) }
}
console.log(`${checks.length - failed}/${checks.length} check scripts passed`)
process.exitCode = failed ? 1 : 0
