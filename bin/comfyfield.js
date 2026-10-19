#!/usr/bin/env node
// Keep this bootstrap compatible with older Node versions so upgrade guidance can run.
const version = process.versions.node
if (Number(version.split('.')[0]) < 22) {
  console.error(`ComfyField needs Node.js 22 or newer; you have ${version}. Install Node.js 22 or the current long-term support release from https://nodejs.org/en/download, reopen your terminal, then run npm start again.`)
  process.exit(1)
}
import('./cli.js').catch((error) => { console.error(error.message); process.exitCode = 1 })
