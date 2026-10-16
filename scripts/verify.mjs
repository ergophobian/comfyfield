import { readdirSync } from 'node:fs'
import { spawnSync } from 'node:child_process'

const checks = readdirSync('scripts').filter((file) => /-check.*\.mjs$/.test(file)).sort()
let failed = 0
for (const file of checks) {
  console.log(`Running ${file}`)
  const result = spawnSync(process.execPath, [`scripts/${file}`], { stdio: 'inherit', windowsHide: true, timeout: 180000, killSignal: 'SIGKILL' })
  if (result.status !== 0) { failed++; console.error(`Failed ${file}: ${result.error?.message || result.status}`) }
}
console.log(`${checks.length - failed}/${checks.length} check scripts passed`)
process.exitCode = failed ? 1 : 0
