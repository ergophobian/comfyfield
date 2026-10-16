import { existsSync } from 'node:fs'

export function chromeExecutable() {
  const executable = process.env.CHROME_PATH || [
    'C:/Program Files/Google/Chrome/Application/chrome.exe',
    '/Applications/Google Chrome.app/Contents/MacOS/Google Chrome',
    '/usr/bin/google-chrome',
    '/usr/bin/chromium',
  ].find(existsSync)
  if (!executable) throw new Error('Set CHROME_PATH to a local Chrome executable')
  return executable
}
