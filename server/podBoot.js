// What a Pod runs when it starts: a bash boot script that brings up the status server,
// ComfyUI (local to the Pod only) and comfy-api-proxy. Ported from PatchWork's runpod-bootscript.js.
import fs from 'node:fs'
import path from 'node:path'
import { gzipSync } from 'node:zlib'
import { fileURLToPath } from 'node:url'
import { NODE_PACKS, MODEL_DIRS } from '../shared/modelFiles.js'

const HERE = path.dirname(fileURLToPath(import.meta.url))

export const POD_IMAGE = 'ghcr.io/bchenner/patchwork-comfy:latest'
export const PROXY_PORT = 8189
export const STATUS_PORT = 8190
export const PROXY_VERSION = '0.1.6'
// The image ships ComfyUI v0.33.1; FLUX 3 Klein needs v0.41.0 and Qwen-Image 2.1 v0.37.0, and later
// versions fix MiniMax H3 offloading. The Pod moves to the version Comfy Cloud runs, pinned by commit.
export const COMFY_VERSION = 'v0.41.1'
export const COMFY_COMMIT = '45bf90d1c91eecd782643346dcfb73cb0017667f'
// FreeVideo changes many times a day, so the Pod pins a release by commit. Re-read its comfy_nodes.py
// and tiers.py before moving the pin: the graphs in public/workflows/h3_freevideo_*.json follow them.
export const FREEVIDEO_VERSION = 'v0.4.14'
export const FREEVIDEO_COMMIT = 'fcd24fb730e7094565d13b663e92c264ed4d470c'
// On the volume, so a paused Pod keeps FreeVideo's env, its GPU build and its weights.
export const FREEVIDEO_HOME = '/workspace/freevideo'
// Node pack clones and pip's cache, also on the volume: a resumed Pod links the clones again and
// reinstalls their requirements from the cache, because a resume wipes the container disk.
export const PACKS_HOME = '/workspace/cf-nodes'
export const PIP_CACHE = '/workspace/.cache/pip'
// RunPod refuses a longer dockerStartCmd; PatchWork found the limit by trial.
export const START_CMD_MAX = 65536

export const proxyUrl = (id) => `https://${id}-${PROXY_PORT}.proxy.runpod.net`
export const statusUrl = (id) => `https://${id}-${STATUS_PORT}.proxy.runpod.net`

// Timers the Pod's own watchdog enforces. The app's guards fire first; these catch a closed app.
// Models download after ready, so the boot deadline covers only ComfyUI and the proxy coming up.
// `runtimes` start installing at boot, for a Pod started for a graph that needs them.
export function podEnv({ token, idleMin = 10, bootDeadlineSec = 900, runtimes = [] }) {
  if (!token) throw new Error('A Pod needs its own token.')
  if (!runtimes.every((e) => /^[a-z0-9]+$/.test(e))) throw new Error('Unknown runtime.')
  return {
    ...(runtimes.length ? { CF_RUNTIMES: runtimes.join(' ') } : {}),
    POD_TOKEN: token,
    IDLE_AFTER: String(idleMin * 60 + 180),
    HEARTBEAT_DEADLINE: '600',
    MAX_LIFE: '7200',
    DRAIN_GRACE: '1800',
    BOOT_DEADLINE: String(bootDeadlineSec),
    FATAL_GRACE: '180',
  }
}

if (!MODEL_DIRS.every((d) => /^[a-z0-9_]+$/.test(d))) throw new Error('A models folder name is unsafe.')
const DIRS = MODEL_DIRS.join(' ')

// One case per pack for the installer, and the list the status server reads: id, folder, a class to look for.
const SAFE = /^[\w.-]+$/
function packCases(packs) {
  for (const [id, p] of Object.entries(packs)) {
    if (!/^[a-z0-9]+$/.test(id) || !/^[\w.-]+\/[\w.-]+$/.test(p.repo) || !/^[0-9a-f]{40}$/.test(p.commit) || !SAFE.test(p.folder) || !p.classes.every((c) => SAFE.test(c))) {
      throw new Error(`Node pack ${id} has an unsafe repo, commit, folder or class name.`)
    }
  }
  return {
    cases: Object.entries(packs).map(([id, p]) => `  ${id}) repo=https://github.com/${p.repo}.git; commit=${p.commit}; folder=${p.folder} ;;`).join('\n'),
    list: Object.entries(packs).map(([id, p]) => `${id}\t${p.folder}\t${p.classes.join(',')}`).join('\n'),
  }
}

// The token and the pod-scoped RUNPOD_API_KEY arrive in the Pod env. Nothing here prints them,
// and there is no `set -x`, because the status server serves the boot log.
export function podBootScript({ packs = NODE_PACKS } = {}) {
  // A Windows checkout may hold CRLF; the Pod's bash wants LF.
  const statusd = fs.readFileSync(path.join(HERE, 'pod-statusd.py'), 'utf8').replace(/\r\n/g, '\n')
  const paths = DIRS.split(' ').map((d) => `  ${d}: ${d}`).join('\n')
  const { cases, list } = packCases(packs)
  return `#!/bin/bash
CF=/root/cf
H3=/root/h3
V=$H3/venv-cu130/bin/python
M=/workspace/models
mkdir -p "$CF" /workspace/proxy-state ${PACKS_HOME} ${PIP_CACHE}
for d in ${DIRS}; do mkdir -p "$M/$d"; done
export PIP_CACHE_DIR=${PIP_CACHE}
exec >> "$CF/boot.log" 2>&1
echo "STAGE boot $(date +%s)"

# Self-terminate. GraphQL first: RunPod refuses pod REST calls made from inside a Pod.
# Exit 0 only when RunPod clearly accepted; a gateway page or a 429 is not a success.
cat > "$CF/kill-pod.sh" <<'KILL'
#!/bin/bash
echo "terminating: $1"
[ -n "$RUNPOD_POD_ID" ] && [ -n "$RUNPOD_API_KEY" ] || { echo "no pod id or key, this Pod is still billing"; exit 2; }
resp=$(curl -s -m 20 -w '\\n%{http_code}' -X POST https://api.runpod.io/graphql -H "Authorization: Bearer $RUNPOD_API_KEY" \\
  -H "Content-Type: application/json" -d "{\\"query\\":\\"mutation { podTerminate(input: {podId: \\\\\\"$RUNPOD_POD_ID\\\\\\"}) }\\"}")
code=$(printf '%s' "$resp" | tail -n 1)
body=$(printf '%s' "$resp" | sed '$d')
if [ "$code" = 200 ] && printf '%s' "$body" | grep -q '"data"' && ! printf '%s' "$body" | grep -q '"errors"'; then exit 0; fi
echo "graphql answered HTTP $code"
if command -v runpodctl >/dev/null 2>&1; then
  out=$(runpodctl remove pod "$RUNPOD_POD_ID" 2>&1) && ! printf '%s' "$out" | grep -qi "error\\|fail" && exit 0
  echo "runpodctl: $out"
fi
code=$(curl -s -o /dev/null -w "%{http_code}" -m 20 -X DELETE -H "Authorization: Bearer $RUNPOD_API_KEY" "https://rest.runpod.io/v1/pods/$RUNPOD_POD_ID")
case "$code" in 2*) exit 0 ;; esac
echo "could not self-terminate (HTTP $code), this Pod is still billing"
exit 1
KILL

# A fatal error is written for the status server, which reports it and terminates after a grace.
die() { echo "FATAL $1"; echo "$1" > "$CF/.fatal"; sleep infinity; }

cat > "$CF/statusd.py" <<'STATUSD'
${statusd.trimEnd()}
STATUSD

# The node packs ComfyField knows: id, folder and the classes ComfyUI lists once the pack loads.
cat > "$CF/packs.tsv" <<'PACKS'
${list}
PACKS

# The status server runs this when a Pod needs a node pack. The clone stays on the volume and is linked
# into ComfyUI's custom_nodes, replacing any older copy the image ships. Its requirements install into
# ComfyUI's Python without moving the image's torch, numpy or CUDA wheels. The status server then
# restarts ComfyUI, with an empty queue, to load it.
cat > "$CF/runtime-pack.sh" <<'PACK'
#!/bin/bash
C=/root/h3/ComfyUI
V=/root/h3/venv-cu130/bin/python
P=${PACKS_HOME}
case "$1" in
${cases}
  *) echo "unknown node pack $1"; exit 3 ;;
esac
d="$P/$folder"
if [ "$(git -C "$d" rev-parse HEAD 2>/dev/null)" != "$commit" ]; then
  rm -rf "$d"
  { git clone --quiet --filter=blob:none --no-checkout "$repo" "$d" && git -C "$d" fetch --quiet --depth 1 origin "$commit" && git -C "$d" checkout --quiet --force "$commit"; } \\
    || { echo "could not fetch $folder at $commit"; rm -rf "$d"; exit 1; }
fi
[ -L "$C/custom_nodes/$folder" ] || rm -rf "$C/custom_nodes/$folder"
ln -sfn "$d" "$C/custom_nodes/$folder" || { echo "could not link $folder into ComfyUI"; exit 1; }
"$V" -m pip freeze 2>/dev/null | grep -iE '^(torch|torchvision|torchaudio|numpy|xformers|triton|sageattention|nvidia-[a-z0-9-]+)==' > /root/cf/constraints.txt
if [ -f "$d/requirements.txt" ]; then
  PIP_CACHE_DIR=${PIP_CACHE} "$V" -m pip install --quiet -r "$d/requirements.txt" -c /root/cf/constraints.txt || { echo "could not install the requirements of $folder"; exit 1; }
fi
grep -qxF "$folder" /root/cf/nodes.list 2>/dev/null || echo "$folder" >> /root/cf/nodes.list
PACK

cat > "$CF/extra_model_paths.yaml" <<'PATHS'
comfyfield:
  base_path: /workspace/models
${paths}
  clip: text_encoders
PATHS

[ -x "$V" ] || { bash "$CF/kill-pod.sh" "the image has no Python at $V"; sleep infinity; }
[ -n "$POD_TOKEN" ] || { bash "$CF/kill-pod.sh" "the Pod has no token"; sleep infinity; }
CF_DIRS="${DIRS}" nohup "$V" "$CF/statusd.py" >> "$CF/statusd.log" 2>&1 &
up=0
for i in $(seq 1 40); do
  curl -sf -m 2 -o /dev/null -H "Authorization: Bearer $POD_TOKEN" http://127.0.0.1:${STATUS_PORT}/status && { up=1; break; }
  sleep 0.5
done
[ "$up" = 1 ] || { bash "$CF/kill-pod.sh" "the status server did not start"; sleep infinity; }

echo "STAGE proxy-install $(date +%s)"
"$V" -m pip install --quiet --no-deps comfy-api-proxy==${PROXY_VERSION} || die "could not install comfy-api-proxy"
# comfy-api-proxy ${PROXY_VERSION} drops what ComfyUI lists under "3d", so a .glb from SaveGLB never reaches
# the app. Pass it on as a file until the proxy does it upstream. Not fatal: only 3D runs need it.
PA="$("$V" -c 'import comfy_api_proxy, os; print(os.path.join(os.path.dirname(comfy_api_proxy.__file__), "app.py"))' 2>/dev/null)"
if [ -f "$PA" ] && ! grep -q '"3d": "file"' "$PA"; then
  sed -i 's/^\\(    "files": "file",\\)$/\\1\\n    "3d": "file",/' "$PA"
  grep -q '"3d": "file"' "$PA" || echo "could not teach comfy-api-proxy about 3D outputs"
fi

echo "STAGE comfy-update $(date +%s)"
C=$H3/ComfyUI
[ -d "$C/.git" ] || die "the image has no ComfyUI at $C"
if [ "$(git -C "$C" rev-parse HEAD 2>/dev/null)" != "${COMFY_COMMIT}" ]; then
  git -C "$C" fetch --quiet --depth 1 origin ${COMFY_COMMIT} && git -C "$C" checkout --quiet ${COMFY_COMMIT} || die "could not move ComfyUI to ${COMFY_VERSION}"
  "$V" -m pip install --quiet -r "$C/requirements.txt" || die "could not install the requirements of ComfyUI ${COMFY_VERSION}"
fi

echo "STAGE freevideo-clone $(date +%s)"
# FreeVideo's node must be in place before ComfyUI starts. Every other graph runs without it, so a
# failed clone is not fatal: an H3 run then says what failed.
FV=$C/custom_nodes/FreeVideo
if [ "$(git -C "$FV" rev-parse HEAD 2>/dev/null)" != "${FREEVIDEO_COMMIT}" ]; then
  rm -rf "$FV"
  { git clone --quiet --filter=blob:none --no-checkout https://github.com/FlashML-org/FreeVideo.git "$FV" \\
    && git -C "$FV" fetch --quiet --depth 1 origin ${FREEVIDEO_COMMIT} && git -C "$FV" checkout --quiet --force ${FREEVIDEO_COMMIT}; } \\
    || { echo "could not fetch FreeVideo ${FREEVIDEO_VERSION}"; rm -rf "$FV"; }
fi
# Runtime installs wait for this: ComfyUI's own pip installs and FreeVideo's node come first, so two pips
# never write ComfyUI's Python at once, even when a run asks for a runtime while the Pod boots.
touch "$CF/.base-ready"

# The status server runs this when a run needs FreeVideo. FreeVideo's installer builds its own Python
# env, compiles SageAttention for this GPU and fetches about 49 GiB of public weights. It accepts the
# MiniMax H3 Community License (the weights) and the NVIDIA CUDA EULA (the CUDA redistributables).
# Third-party code gets neither the Pod's RunPod key nor its token.
cat > "$CF/runtime-freevideo.sh" <<'FVSETUP'
#!/bin/bash
FV=/root/h3/ComfyUI/custom_nodes/FreeVideo
[ -f "$FV/setup.sh" ] || { echo "FreeVideo's node is not on the Pod. Terminate it and start a new Pod."; exit 3; }
mkdir -p ${FREEVIDEO_HOME}
cd "$FV" && exec env -u VIRTUAL_ENV -u PYTHONHOME -u HF_TOKEN -u RUNPOD_API_KEY -u POD_TOKEN bash ./setup.sh --root ${FREEVIDEO_HOME} --yes --accept-model-license \\
  --no-launch --plain --network official --prepared-format fp8 --environment unified --install-system-deps </dev/null
FVSETUP

# Install the runtimes this Pod was started for. A runtime this volume already has runs its installer
# again, which is short, so it is ready again after a resume.
want="$CF_RUNTIMES"
[ -f ${FREEVIDEO_HOME}/machine.json ] && want="$want freevideo"
while IFS=$'\\t' read -r id folder classes; do [ -d "${PACKS_HOME}/$folder" ] && want="$want $id"; done < "$CF/packs.tsv"
for e in $(printf '%s\\n' $want | sort -u); do
  curl -sf -m 5 -o /dev/null -X POST -H "Authorization: Bearer $POD_TOKEN" http://127.0.0.1:${STATUS_PORT}/runtime/$e || echo "could not start the $e install"
done

# ComfyUI loads custom nodes only when it starts, so it waits for the packs (10 minutes at most).
echo "STAGE packs $(date +%s)"
for i in $(seq 1 120); do
  curl -sf -m 4 -H "Authorization: Bearer $POD_TOKEN" http://127.0.0.1:${STATUS_PORT}/status \\
    | "$V" -c 'import json,sys; r=json.load(sys.stdin).get("runtimes",{}); sys.exit(0 if any(v.get("pack") and v.get("state")=="installing" for v in r.values()) else 1)' || break
  sleep 5
done

echo "STAGE comfy $(date +%s)"
(
  cd "$C" || die "the image has no ComfyUI at $C"
  # Only FreeVideo's node and the packs ComfyField installed load: the other custom nodes in the image
  # were built for an older ComfyUI. Each start reads the pack list again, so the status server loads
  # a new pack by stopping ComfyUI. FreeVideo reads its install from FREEVIDEO_HOME, so it needs no restart.
  # Its idle kernel compile would hold the GPU, which the watchdog reads as work.
  # ComfyUI runs custom node code and needs neither the Pod's RunPod key nor its token.
  unset RUNPOD_API_KEY POD_TOKEN
  export FREEVIDEO_HOME=${FREEVIDEO_HOME} FREEVIDEO_BACKGROUND_COMPILE=off CUDA_VISIBLE_DEVICES="\${CUDA_VISIBLE_DEVICES:-0}"
  while true; do
    "$V" main.py --listen 127.0.0.1 --port 8188 --disable-auto-launch --disable-all-custom-nodes --whitelist-custom-nodes FreeVideo $(cat "$CF/nodes.list" 2>/dev/null) \\
      --extra-model-paths-config "$CF/extra_model_paths.yaml" >> "$CF/comfy.log" 2>&1 &
    echo $! > "$CF/comfy.pid"
    wait $!
    echo "ComfyUI exited ($?), restarting in 3 s"
    sleep 3
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
