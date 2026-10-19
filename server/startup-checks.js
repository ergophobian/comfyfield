import fs from 'node:fs/promises'
import path from 'node:path'
import { findFfmpeg } from './ffmpeg.js'

export function nodeProblem(version) {
  if (Number(version.split('.')[0]) >= 22) return null
  return `ComfyField needs Node.js 22 or newer; you have ${version}. Install Node.js 22 or the current long-term support release from https://nodejs.org/en/download, reopen your terminal, then run npm start again.`
}

export function diskCheck(bytes) {
  const gb = Number(bytes) / 1024 ** 3
  if (gb < 0.2) return { level: 'error', message: `Only ${gb.toFixed(1)} GB free. Free at least 1 GB on the data drive, then start again.` }
  if (gb < 5) return { level: 'warning', message: `Only ${gb.toFixed(1)} GB free. Free disk space or move your data with COMFYFIELD_HOME before downloading media.` }
  return { level: 'ok', message: `${gb.toFixed(1)} GB free on the data drive.` }
}

// This read-only endpoint reports account status, not paid-plan entitlement.
// https://docs.comfy.org/api-reference/cloud/user/get-current-user-information
export async function checkComfy(key, { request = fetch } = {}) {
  if (!key) return { level: 'info', message: 'No Comfy key saved. Add one in Connections; Comfy Cloud workflows need a paid plan.' }
  try {
    const res = await request('https://cloud.comfy.org/api/user', {
      method: 'GET', headers: { 'X-API-Key': key }, signal: AbortSignal.timeout(5000), redirect: 'error',
    })
    if (res.status === 401) return { level: 'warning', message: 'Comfy rejected this key. Replace it in Connections with a key from platform.comfy.org.' }
    if ([402, 403].includes(res.status)) return { level: 'warning', message: 'Comfy Cloud access is unavailable. Check your key and paid plan in Comfy, then test again in Connections.' }
    if (!res.ok) return { level: 'warning', message: `Comfy account check returned ${res.status}. Try Test in Connections later.` }
    const data = await res.json()
    if (data.status !== 'active') return { level: 'warning', message: 'Comfy accepted the key, but the account is not active. Check account access and plan in Comfy.' }
    return { level: 'ok', message: 'Comfy key accepted; account active. Paid-plan entitlement is not reported by this check. Confirm your plan in Comfy before running Cloud workflows.' }
  } catch {
    return { level: 'warning', message: 'Could not reach Comfy to check the key. Check your internet connection, then use Test in Connections.' }
  }
}

export async function storageChecks(directory, { disk = fs.statfs } = {}) {
  const checks = []
  try {
    await fs.mkdir(directory, { recursive: true })
    await fs.access(directory, fs.constants.W_OK)
  } catch {
    throw new Error('Cannot write the data folder. Choose a writable folder with COMFYFIELD_HOME, then start again.')
  }
  try {
    const stat = await disk(directory, { bigint: true })
    checks.push(diskCheck(stat.bavail * stat.bsize))
  } catch { checks.push({ level: 'warning', message: 'Could not check free disk space. Check the data drive before downloading media.' }) }
  return checks
}

export async function startupChecks(directory, { disk, ffmpeg = findFfmpeg, read = fs.readFile, request, storage = true } = {}) {
  const checks = storage ? await storageChecks(directory, { disk }) : []
  try { await ffmpeg(); checks.push({ level: 'ok', message: 'ffmpeg is ready for Stitch.' }) }
  catch (error) { checks.push({ level: 'warning', message: error.message }) }
  let keys = {}
  try { keys = JSON.parse(await read(path.join(directory, 'keys.json'), 'utf8')) }
  catch (error) {
    if (error.code !== 'ENOENT') checks.push({ level: 'warning', message: 'Could not read saved connections. Open Connections to add your keys again.' })
  }
  const providers = ['comfy', 'fal', 'google', 'elevenlabs', 'runpod']
  const hasKeys = providers.some((id) => typeof keys?.[id]?.key === 'string' && keys[id].key.trim())
  if (!hasKeys) checks.push({ level: 'info', message: 'No keys yet. Open Connections to add a provider key when you are ready to generate.', connections: true })
  checks.push(await checkComfy(keys?.comfy?.key, { request }))
  return checks
}
