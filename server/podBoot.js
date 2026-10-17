// What a Pod runs when it starts: a bash boot script that brings up the status server,
// ComfyUI (local to the Pod only) and comfy-api-proxy. Ported from PatchWork's runpod-bootscript.js.
import fs from 'node:fs'
import path from 'node:path'
import { gzipSync } from 'node:zlib'
import { fileURLToPath } from 'node:url'

const HERE = path.dirname(fileURLToPath(import.meta.url))

export const POD_IMAGE = 'ghcr.io/bchenner/patchwork-comfy:latest'
export const PROXY_PORT = 8189
export const STATUS_PORT = 8190
export const PROXY_VERSION = '0.1.6'
// RunPod refuses a longer dockerStartCmd; PatchWork found the limit by trial.
export const START_CMD_MAX = 65536

export const proxyUrl = (id) => `https://${id}-${PROXY_PORT}.proxy.runpod.net`
export const statusUrl = (id) => `https://${id}-${STATUS_PORT}.proxy.runpod.net`

// Timers the Pod's own watchdog enforces. The app's guards fire first; these catch a closed app.
// Models download after ready, so the boot deadline covers only ComfyUI and the proxy coming up.
export function podEnv({ token, idleMin = 10, bootDeadlineSec = 900 }) {
  if (!token) throw new Error('A Pod needs its own token.')
  return {
    POD_TOKEN: token,
    IDLE_AFTER: String(idleMin * 60 + 180),
    HEARTBEAT_DEADLINE: '600',
    MAX_LIFE: '7200',
    DRAIN_GRACE: '1800',
    BOOT_DEADLINE: String(bootDeadlineSec),
    FATAL_GRACE: '180',
  }
}

const DIRS = 'checkpoints diffusion_models text_encoders vae loras upscale_models latent_upscale_models'

// The token and the pod-scoped RUNPOD_API_KEY arrive in the Pod env. Nothing here prints them,
// and there is no `set -x`, because the status server serves the boot log.
export function podBootScript() {
  const statusd = fs.readFileSync(path.join(HERE, 'pod-statusd.py'), 'utf8')
  const paths = DIRS.split(' ').map((d) => `  ${d}: ${d}`).join('\n')
  return `#!/bin/bash
CF=/root/cf
H3=/root/h3
V=$H3/venv-cu130/bin/python
M=/workspace/models
mkdir -p "$CF" /workspace/proxy-state
for d in ${DIRS}; do mkdir -p "$M/$d"; done
exec >> "$CF/boot.log" 2>&1
echo "STAGE boot $(date +%s)"

# Self-terminate. GraphQL first: RunPod refuses pod REST calls made from inside a Pod.
cat > "$CF/kill-pod.sh" <<'KILL'
#!/bin/bash
echo "terminating: $1"
[ -n "$RUNPOD_POD_ID" ] && [ -n "$RUNPOD_API_KEY" ] || { echo "no pod id or key, this Pod is still billing"; exit 2; }
out=$(curl -s -m 20 -X POST https://api.runpod.io/graphql -H "Authorization: Bearer $RUNPOD_API_KEY" \\
  -H "Content-Type: application/json" -d "{\\"query\\":\\"mutation { podTerminate(input: {podId: \\\\\\"$RUNPOD_POD_ID\\\\\\"}) }\\"}")
echo "$out" | grep -q '"errors"' || [ -z "$out" ] || exit 0
if command -v runpodctl >/dev/null 2>&1; then
  runpodctl remove pod "$RUNPOD_POD_ID" 2>&1 | grep -qi "error\\|fail" || exit 0
fi
code=$(curl -s -o /dev/null -w "%{http_code}" -m 20 -X DELETE -H "Authorization: Bearer $RUNPOD_API_KEY" "https://rest.runpod.io/v1/pods/$RUNPOD_POD_ID")
case "$code" in 2*) exit 0 ;; esac
echo "could not self-terminate, this Pod is still billing"
exit 1
KILL

# A fatal error is written for the status server, which reports it and terminates after a grace.
die() { echo "FATAL $1"; echo "$1" > "$CF/.fatal"; sleep infinity; }

cat > "$CF/statusd.py" <<'STATUSD'
${statusd.trimEnd()}
STATUSD

cat > "$CF/extra_model_paths.yaml" <<'PATHS'
comfyfield:
  base_path: /workspace/models
${paths}
  clip: text_encoders
PATHS

[ -x "$V" ] || { bash "$CF/kill-pod.sh" "the image has no Python at $V"; sleep infinity; }
[ -n "$POD_TOKEN" ] || { bash "$CF/kill-pod.sh" "the Pod has no token"; sleep infinity; }
nohup "$V" "$CF/statusd.py" >> "$CF/statusd.log" 2>&1 &
up=0
for i in $(seq 1 40); do
  curl -sf -m 2 -o /dev/null -H "Authorization: Bearer $POD_TOKEN" http://127.0.0.1:${STATUS_PORT}/status && { up=1; break; }
  sleep 0.5
done
[ "$up" = 1 ] || { bash "$CF/kill-pod.sh" "the status server did not start"; sleep infinity; }

echo "STAGE proxy-install $(date +%s)"
"$V" -m pip install --quiet --no-deps comfy-api-proxy==${PROXY_VERSION} || die "could not install comfy-api-proxy"

echo "STAGE comfy $(date +%s)"
(
  cd "$H3/ComfyUI" || die "the image has no ComfyUI at $H3/ComfyUI"
  while true; do
    "$V" main.py --listen 127.0.0.1 --port 8188 --disable-auto-launch --extra-model-paths-config "$CF/extra_model_paths.yaml" >> "$CF/comfy.log" 2>&1
    echo "ComfyUI exited ($?), restarting in 10 s"
    sleep 10
  done
) &
(
  while true; do
    "$H3/venv-cu130/bin/comfy-api-proxy" --comfyui http://127.0.0.1:8188 --host 0.0.0.0 --port ${PROXY_PORT} --token "$POD_TOKEN" \\
      --comfyui-base-dir "$H3/ComfyUI" --state-dir /workspace/proxy-state >> "$CF/proxy.log" 2>&1
    echo "comfy-api-proxy exited ($?), restarting in 5 s"
    sleep 5
  done
) &
wait
`
}

// RunPod's dockerStartCmd. The script travels gzipped and base64-encoded to stay under the limit.
export function podStartCmd(script = podBootScript()) {
  const b64 = gzipSync(Buffer.from(script)).toString('base64')
  const cmd = `echo ${b64} | base64 -d | gunzip > /root/boot.sh && bash /root/boot.sh`
  const size = Buffer.byteLength(cmd)
  if (size > START_CMD_MAX) throw new Error(`The Pod start command is ${size} bytes, over RunPod's ${START_CMD_MAX}-byte limit.`)
  return ['bash', '-lc', cmd]
}
