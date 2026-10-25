// Finds a local Chrome for headless work. CHROME_PATH overrides the usual install folders.
import { existsSync } from 'node:fs'
import path from 'node:path'

export const chromeMissing = 'Chrome was not found. Install Google Chrome, or set CHROME_PATH to the Chrome program.'

export function chromeExecutable(env = process.env) {
  if (env.CHROME_PATH) return env.CHROME_PATH
  const local = env.LOCALAPPDATA ? [path.join(env.LOCALAPPDATA, 'Google/Chrome/Application/chrome.exe')] : []
  const executable = [
    'C:/Program Files/Google/Chrome/Application/chrome.exe',
    'C:/Program Files (x86)/Google/Chrome/Application/chrome.exe',
    ...local,
    '/Applications/Google Chrome.app/Contents/MacOS/Google Chrome',
    '/usr/bin/google-chrome',
    '/usr/bin/chromium',
  ].find(existsSync)
  if (!executable) throw new Error(chromeMissing)
  return executable
}
