import os from 'node:os'
import path from 'node:path'

export function dataDirectory({ env = process.env, platform = process.platform, userHome = os.homedir() } = {}) {
  if (env.COMFYFIELD_HOME) return path.resolve(env.COMFYFIELD_HOME, '.comfyfield')
  return platform === 'win32'
    ? path.join(env.APPDATA || path.join(userHome, 'AppData', 'Roaming'), 'comfyfield')
    : path.join(userHome, '.comfyfield')
}
