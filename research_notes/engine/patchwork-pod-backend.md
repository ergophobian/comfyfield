# PatchWork's self-hosted comfy backend (RunPod GPU pods): what to port into ComfyField

Researched 2026-10-17. Read-only review. No network calls were made, and nothing was built or run.

## Sources and citation format

- PatchWork checkout: shallow clone at commit `9a90879` ("Release 0.10.4", 2026-10-16), at `scratchpad/patchwork-src`. Citations look like `js/runpod-client.js:296-300` and are relative to that root.
- Operator runbook: `D:\Code\UGC Content Pipeline\manager\reference\ops\gpu-pod-runbook.md`, cited as `runbook:NN`.
- comfy-api-proxy: a local copy of its `README.md` and `cli.py` that a sibling agent saved at `scratchpad/dl/proxy/`, cited as `proxy/README.md:NN`. The copy does not state its version. The sibling note `scratchpad/research/comfy-sdk-engine.md` gives PyPI 0.1.6.
- ComfyField: cited as `comfyfield:server/core.js:NN`.

Tags: **[Inference]** means I reasoned it from the code and did not see it stated. **[Unverified]** means I could not check it offline.

## Where the code lives (map)

| File | Lines | Role | Portable? |
|---|---|---|---|
| `js/runpod-client.js` | 1698 | RunPod REST v1 and GraphQL client: create, list, terminate, stop, resume, stock, cost constants, start command | Yes, the core |
| `js/runpod-bootscript.js` | 1913 | Builds the bash boot script (the pod's `dockerStartCmd`): statusd, watchdog, kill switch, weight downloads, ComfyUI launch, R2 uploader | Yes, minus the model-specific and R2 parts |
| `js/runpod-fleet.js` | 1319 | Pool, readiness, scheduler, heartbeat, idle auto-stop, drain, daily cap gate | Yes, a subset |
| `js/comfy-client.js` | 819 | ComfyUI HTTP transport: `/prompt`, `/history` poll, upload, cancel | Yes |
| `js/runpod-history.js` | 445 | Observed-spend ledger (localStorage) behind `spentToday()` | Idea yes, storage no |
| `js/runpod-prefs.js` | 200 | Device-local prefs: auto-stop, daily cap, GPU type, region | Idea yes |
| `js/runpod-catalog.js` | 846 | GPU catalogue, prices and stock from GraphQL, placement order, "alternative" card | Partly |
| `js/runpod-panel.js` + `css/gpu-panel.css` | 5954 + 1075 | The GPU panel UI (the CSS belongs to this panel, `css/gpu-panel.css:1-14`) | No (UI, own theme) |
| `js/runpod-jobs.js`, `runpod-logs.js`, `runpod-bench.js`, `runpod-testclip.js`, `comfy-runlog.js` | 288 / 616 / 1428 / 271 / 1011 | Job attribution, merged logs, benchmarks, test clip, run log | Later, optional |
| `js/lora-link.js`, `scripts/verify-loras.mjs` | 550 / 174 | Checks a pasted HF or Civitai LoRA link by reading the safetensors header | Later, optional |
| `js/nodes/combined-node.js` (comfy parts) | ~1000 of 7000+ | Canvas node: graph builders, weight check, take loop, R2 copy | No (canvas engine) |
| `js/gen-jobs.js` | 577 | Per-take registry tied to `CombinedNode` runTake (`js/gen-jobs.js:11-17`) | No |
| `docker/Dockerfile`, `docker/README.md`, `.github/workflows/pod-image.yml` | 179 / 55 / 120 | The pod image and its GHCR build | Yes, as a template |
| `server/r2-worker.js` | — | Cloudflare worker: CORS proxy (`proxy-json`) and R2 presign | No |
| `functions/_middleware.js` | 56 | Cloudflare Pages subdomain routing only (`functions/_middleware.js:1-2`). No pod logic | Not relevant |
| `desktop/main.js` | 1895 | No pod logic. Only `desktop/diagnostics.js:48` redacts pod proxy URLs | Not relevant |

Two referenced files are absent from this checkout: `js/runpod-serverless.js` (named at `js/runpod-bootscript.js:201` and `js/runpod-client.js:388`) and the `GpuProviders` "vast" provider (named at `js/runpod-prefs.js:27-43`). CHANGELOG v0.9.27 says the serverless path was removed (`CHANGELOG.md:1189`).

---

## 1. Pod lifecycle

### APIs and calls

PatchWork uses **REST v1** (`https://rest.runpod.io/v1`, `js/runpod-client.js:29`) for lifecycle, and **GraphQL** (`https://api.runpod.io/graphql`) only for things REST does not expose: stock, prices and the datacenter or real GPU of a pod (`js/runpod-client.js:78-109`, `:228-271`).

| Action | Call | Where |
|---|---|---|
| List pods | `GET /pods`, filtered to names starting `patchwork-h3` | `js/runpod-client.js:214-220`, prefix `:32`, `isOurs` `:51-53` |
| Get one pod | `GET /pods/{id}` | `js/runpod-client.js:222-226` |
| Create | `POST /pods` (body below), one try per datacenter | `js/runpod-client.js:683-928` |
| Terminate | `DELETE /pods/{id}`, 404 counts as success | `js/runpod-client.js:273-278` |
| Stop (pause) | `POST /pods/{id}/stop` | `js/runpod-client.js:296-300` (method still exists, see below) |
| Start (resume) | `POST /pods/{id}/start`, 401/404 fatal, rest retryable | `js/runpod-client.js:319-329` |
| Datacenter and real GPU | GraphQL `pod(input:{podId}) { machine { dataCenterId gpuDisplayName gpuTypeId ... } }` | `js/runpod-client.js:246-271` |
| Stock and price | GraphQL `gpuTypes { lowestPrice(input:{gpuCount:1, secureCloud, dataCenterId}) { uninterruptablePrice stockStatus availableGpuCounts } }`, aliased per datacenter, with a global fallback | `js/runpod-client.js:574-671` |
| GPU catalogue | GraphQL `gpuTypes { id displayName memoryInGb secureCloud }` | `js/runpod-catalog.js:475` |
| Network volumes | `GET/POST /networkvolumes`, `DELETE /networkvolumes/{id}`, `PATCH .../update` | `js/runpod-client.js:331-379` |
| Self-terminate from inside the pod | REST `DELETE`, then `runpodctl remove pod`, then GraphQL `podTerminate` | `js/runpod-bootscript.js:365-389`, `:1655-1695` |

**Pause was removed from the product on 2026-09-23 (v0.9.27).** `fleet.pause()` now calls terminate (`js/runpod-fleet.js:911-914`), `fleet.resume()` throws "GPU pausing and resuming has been removed — start a new pod instead" (`:916-919`), and the changelog says so (`CHANGELOG.md:1185-1188`). The client still has `stop()` and `resume()` (`js/runpod-client.js:296-329`), and the boot script still clears stale markers for a resumed disk (`js/runpod-bootscript.js:401-420`). So the runbook's "PAUSE, DO NOT TERMINATE" (`runbook:106-108`) is out of date against the code.

The pod cannot pause itself: `POST /stop` and even `DELETE` return 403 from inside a pod, so the on-pod reaper always terminates (`js/runpod-bootscript.js:24-33`, `:1637-1654`).

### Create body

From `js/runpod-client.js:703-804`:

- `name`: `patchwork-h3-<base36 time>` (`:704`)
- `imageName`: `RunPodClient.image()` = `settings.runpod.image` or `ghcr.io/bchenner/patchwork-comfy:latest` (`:705`, `:1536`, `:1552-1558`). Fallback image `runpod/pytorch:1.1.0-cu1281-torch280-ubuntu2204` is still named (`:1543`).
- `gpuTypeIds: [gpu]`, `gpuCount: 1` (`:706-707`). Default GPU is `NVIDIA RTX PRO 6000 Blackwell Server Edition` (`:1497`).
- `containerDiskInGb`: computed by `diskFor()` from the models picked: weights + 45 GB overhead, rounded up to 10, floor 120 (`:719-722`, `:1125-1158`, `:1610`, `:1615`).
- `volumeInGb: 0` (`:723`).
- `allowedCudaVersions`: only if a caller passes it, because it makes RunPod answer "There are no instances currently available" (`:724-731`).
- `cloudType`: `SECURE` or `COMMUNITY` from `settings.runpod.cloudType`; anything else becomes SECURE (`:732`, `:967-975`). The app default is `COMMUNITY` (`js/main.js:348`).
- `supportPublicIp: true` (`:733`).
- `ports: ['8188/http', '8189/http']` — ComfyUI and statusd (`:734`).
- `env` (`:735-752`): `RUNPOD_API_KEY` (the user's account key, so the pod can kill itself), `IDLE_AFTER` (default 300), `MAX_LIFE` (default 7200), `HEARTBEAT_DEADLINE` (default 600), `BOOT_DEADLINE` (computed, `:1571-1590`). RunPod supplies `RUNPOD_POD_ID` and `PUBLIC_KEY` (`js/runpod-bootscript.js:368`, `:849`).
- `dockerStartCmd: ['bash', '-lc', <cmd>]`, where cmd is `echo <base64 gzip of boot script> | base64 -d | gunzip > /root/boot.sh && bash /root/boot.sh` (`js/runpod-client.js:753`, `:1454-1470`). RunPod caps this field at 64 KiB (65,536 bytes), found by trial (`:1517-1520`). PatchWork checks the size and throws its own error first (`:1460-1467`).
- `dataCenterIds: [dc]` per attempt, or omitted for the "anywhere" attempt (`:851-853`).
- `networkVolumeId` + `volumeMountPath: '/workspace'` only on Secure and only if a cache volume is set (`:697-702`, `:822-825`).

**Templates:** pods use no RunPod template; image and start command go inline. Template calls exist only for the removed serverless path (`js/runpod-client.js:381-412`).

**Network volume:** an optional venv cache named `patchwork-h3-venv`, 20 GB, Secure only, which pins the pod to the volume's datacenter (`js/runpod-client.js:331-379`, `:492-557`, `:811-825`, `:1596-1603`). Weights are not on it, because HuggingFace delivers faster than the volume (`:708-711`). With the baked image the volume is mostly obsolete (`docker/Dockerfile:5-21`). The default volume id is empty (`js/main.js:355-360`).

### Where the RunPod key lives and who holds it

- In the **browser or desktop renderer**, as `settings.runpod.apiKey` (`js/main.js:328-329`), saved in localStorage `ducted_settings` (`js/main.js:8397-8400`). PatchWork calls it device-local and never synced, because RunPod has no scoped key (`js/runpod-client.js:21-23`, `js/main.js:325-327`). It is stripped from settings sync (`js/user-sync.js:207`).
- **Opt-in sync:** "Sync GPU keys to my account" pushes `apiKey`, `hfToken` and `civitaiToken` as an encrypted secret to the accounts worker (`js/user-sync.js:370-392`).
- **Every RunPod call transits PatchWork's Cloudflare R2 worker**, because `rest.runpod.io` sends no CORS header (`js/runpod-client.js:16-23`, `:65-76` with `proxyMode: 'always'`). The worker's `proxy-json` route forwards method, headers and body with a 60 s timeout (`server/r2-worker.js:215-255`).
- **The key is copied into every pod's env** for self-termination, and RunPod echoes `env` in `GET /pods/{id}` (`js/runpod-client.js:736-739`).
- The desktop app (`desktop/main.js`) holds no pod logic; the renderer runs the same JS.
- I found no hard-coded RunPod, HF or Civitai secret in the pod code. The R2 upload worker URL `https://patchwork-r2-upload.patchworkstudio.workers.dev` is hard-coded as a fallback (`js/runpod-bootscript.js:63`); it is an endpoint, not a secret.

### GPU-type priority and fallback

- **Nothing in the code walks the runbook's pod-type ladder** (PRO4000 Community → ... → PRO6000WK Secure, `runbook:14-31`).
- `create()` falls back across **datacenters only**, for one GPU type and one cloud tier: the pinned list, then one unpinned "anywhere" attempt (`js/runpod-client.js:826-892`, `attempts()` `:951-957`). The catalog orders datacenters by stock, then GPU count, then price, and appends `null` (`js/runpod-catalog.js:765-810`). The default pinned pair is `EU-RO-1`, `EUR-IS-1` (`js/runpod-client.js:1594`).
- On an all-capacity refusal, the client names **one** alternative card that the catalog confirms in stock, but never starts it (`js/runpod-client.js:902-911`, `js/runpod-catalog.js:415-418`).
- **The GPU panel does not walk the list either.** Its Start calls `scaleTo(live + 1, ..., { preflight: true })` for the one selected card (`js/runpod-panel.js:5894-5902`). After a refusal it shows "Try again" and "Use <alt> instead", which only selects the card and opens Setup (`js/runpod-panel.js:1385-1405`). The runbook's "walk the priority order by hand" (`runbook:43-45`) is accurate.
- The cloud tier is a single setting, so "Community, then Secure" for the same card needs a manual settings change (`js/runpod-client.js:967-975`).
- **Runbook drift:** the runbook says `patchwork_gpu` takes only `action` and `count` (`runbook:33-35`). The current tool schema has a `gpu` argument (`tools/patchwork-live-mcp.mjs:260-262`), and the handler also forwards `gpuTypeId`, `models` and `hfToken` (`:1204-1207`). The host stores it as `prefs.gpuTypeId` (`js/collab/collab-manager.js:2107-2110`). It still cannot set the cloud tier and still tries one card.
- The LTX 32 GB VRAM floor (`runbook:29`) is not in code. The catalog's 80 GB floor is a rank and a label, not a filter (`js/runpod-catalog.js:37-39`, `:46-61`, `:580`).
- GPU id strings in code: `NVIDIA RTX PRO 6000 Blackwell Server Edition` (`js/runpod-client.js:1497`); `NVIDIA RTX PRO 4500 Blackwell` and `NVIDIA RTX PRO 4000 Blackwell` as examples in the tool schema (`tools/patchwork-live-mcp.mjs:262`); `NVIDIA RTX PRO 6000 Blackwell Workstation Edition` only in a mock (`tools/gpu-sandbox/mock-runpod.js:35`). **[Unverified]** that these are RunPod's exact ids; read them from `gpuTypes` before use.

---

## 2. The pod image

### What the Dockerfile installs

- Base `nvidia/cuda:13.0.1-base-ubuntu24.04`, chosen to avoid an 11.68 GB base whose PyTorch was deleted on boot (`docker/Dockerfile:5-22`, `:24-30`).
- apt: `python3 python3-venv python3-dev python-is-python3 git curl wget ca-certificates ffmpeg openssh-server` (`docker/Dockerfile:71-76`), later `build-essential` with `CC=gcc` for triton's JIT (`:132-148`).
- `runpodctl` from `releases/latest` (unpinned), needed by the kill switch (`docker/Dockerfile:78-89`).
- ComfyUI pinned at commit `72865f4f27eaf5396f8f36370e0a2be3a9a090ee` (`docker/Dockerfile:41`, `:97-99`), which the boot script calls v0.33.1 of 2026-08-13 (`js/runpod-bootscript.js:909-925`).
- Custom nodes pinned by SHA: `ComfyUI-sol-attn`, `ComfyUI-MiniMax-H3-Turbo`, `comfyui-minimax-h3-blockcache-T8`, `ComfyUI-LTX2.5-MSR` (`docker/Dockerfile:42-47`, `:101-110`).
- venv at `/root/h3/venv-cu130` (the path matters, `:18-21`) with `torch==2.9.1+cu130`, `torchvision==0.24.1+cu130`, `torchaudio==2.9.1+cu130`, ComfyUI `requirements.txt`, `huggingface_hub[hf_transfer]`, sol-attn requirements (`:48-50`, `:119-130`). SageAttention is installed at boot only when asked (`:115-118`).
- Empty model dirs incl. `latent_upscale_models` (`docker/Dockerfile:150-158`).
- `/root/h3/.image-manifest` with the pins; the boot script skips apt, clones and venv build only on an exact match (`docker/Dockerfile:160-175`, `js/runpod-bootscript.js:853-888`).
- No `CMD`; RunPod runs the start command (`docker/Dockerfile:178`).

### How weights and LoRAs arrive

- **All weights are downloaded at pod boot, not at image build**, from HuggingFace with `hf_hub_download` and `HF_HUB_ENABLE_HF_TRANSFER=1` (`docker/Dockerfile:13-16`; `js/runpod-bootscript.js:1213-1226`). The runbook's "BUILD time" (`runbook:88`) means the pod's boot ("while the pod was building"), not the docker build.
- H3: files from `Comfy-Org/MiniMax-H3`, list from the plan with a fallback list (`js/runpod-bootscript.js:117-140`, `:1216-1221`). **Failure is fatal** (`|| die "model download"`).
- LTX 2.5: from gated `Lightricks/LTX-2.5`, needs an HF token (`js/runpod-bootscript.js:1228-1357`). It has a disk preflight (exit 6, `:1262-1266`), an auth preflight with 3 tries (exit 7, `:1277-1307`), and per-file exit codes 3/4/5. **Any non-zero exit is fatal** with a named reason (`:1344-1356`).
- Turbo LoRA: 3 tries, **non-fatal**, "!! TURBO LORA MISSING ..." (`js/runpod-bootscript.js:1450-1480`).
- Style LoRAs: from HF or Civitai, 3 tries each, **non-fatal**, "!! LORA MISSING ..." (`js/runpod-bootscript.js:1505-1561`). A Civitai file is checked by parsing its safetensors header (`:1532-1536`). The list is baked into the boot script at create, so a running pod never gains a LoRA (`js/runpod-client.js:765-769`).
- The LTX "Ingredients" adapter and a key-overlap check are non-fatal (`js/runpod-bootscript.js:1373-1447`).
- Before start, the browser refuses LTX without an HF token (`js/runpod-client.js:1089-1097`).

**How a failed download shows up:**
1. Fatal: `die()` prints `FATAL <reason>`, touches `.fatal`, waits 180 s so `/status` and `/log` stay readable, then runs the kill switch (`js/runpod-bootscript.js:353`, `:392-399`). statusd reports it as `fatal` (`:598-618`, `:718`). **No client code reads `fatal`** (grep of `js/` finds no reader), although the statusd comment says the fleet reaps on it (`:716-717`).
2. Non-fatal: the file is absent from statusd's `models` listing (`js/runpod-bootscript.js:640-659`, `:737`). At run time `_comfyMissingWeights` compares the needed files to that listing and throws "this GPU is missing ..." (`js/nodes/combined-node.js:5038-5257`, `:5314-5323`).

### Start script stages

All in `js/runpod-bootscript.js`: export tokens before `set -x` (`:327-335`); write `kill-pod.sh` (`:355-390`); clear stale `.ready/.heartbeat/.idle` (`:401-420`); log disk state (`:422-434`); start statusd on 8189 and verify it in 10 s, else fatal (`:436-810`); arm the boot deadline (`:812-842`); sshd (`:844-850`, `:897-899`); image-manifest check (`:853-888`); ComfyUI and node pins (`:907-1030`); venv from image, volume or build (`:1053-1142`); CUDA smoke test, fatal on failure (`:1165-1181`); weights and LoRAs (`:1182-1561`); watchdog (`:1602-1809`); R2 uploader (`:1811-1871`); ready marker (`:1873-1877`); ComfyUI in a restart loop with `--listen 0.0.0.0 --port 8188 --enable-cors-header '*'` (`:1879-1908`).

### What "ready" means and how it is computed

- The boot script touches `/root/h3/.ready` once `curl http://127.0.0.1:8188/system_stats` succeeds (`js/runpod-bootscript.js:1873-1877`).
- statusd `ready` = `.ready` exists **and** `/system_stats` answers 2xx now (`js/runpod-bootscript.js:564-578`, `:715`).
- The fleet polls `https://{podId}-8189.proxy.runpod.net/status` every 20 s (`js/runpod-fleet.js:42`, `:401-442`, `js/runpod-client.js:61-63`). It keeps the last good status for 90 s across missed polls (`js/runpod-fleet.js:46`, `:441`).
- `fleet.ready()` = live on RunPod (not `EXITED`/`TERMINATED`) **and** `status.ready` (`js/runpod-fleet.js:108-118`).
- **Ready does not check weights.** That check happens only when a take runs (`js/nodes/combined-node.js:5314-5323`). This matches `runbook:75-95`.
- The agent status adds `ready: readyCount > 0 || manualUrl` (`js/collab/collab-manager.js:2167`), so a manual ComfyUI URL also reads as ready.

### Image build and publish

- `.github/workflows/pod-image.yml` runs on `workflow_dispatch` or a push to `master` that touches `docker/**`, `js/runpod-bootscript.js` or the workflow (`.github/workflows/pod-image.yml:12-29`).
- It frees runner disk, logs in to GHCR with `GITHUB_TOKEN`, builds `./docker`, and pushes `ghcr.io/<owner>/patchwork-comfy:latest` and `:<sha>` with a registry layer cache (`:47-77`). It warns over 7 GB compressed (`:109-111`).
- The package must be made public once, because RunPod pulls anonymously (`docker/README.md:19-25`; `js/runpod-client.js:1533-1535`).
- Pins in the Dockerfile and the boot script must move together; `tests/smoke/56-pod-image-boot.test.mjs` checks this (`docker/README.md:28-40`).

---

## 3. Reaching ComfyUI on the pod

- **URL form:** ComfyUI `https://{podId}-8188.proxy.runpod.net`, statusd `https://{podId}-8189.proxy.runpod.net` (`js/runpod-client.js:55-63`). Derived from the pod id, never typed (`:4-8`).
- **Auth: none.** ComfyUI is "public and unauthenticated" (`js/comfy-client.js:18-19`), launched with `--listen 0.0.0.0 --enable-cors-header '*'` (`js/runpod-bootscript.js:1904-1905`). statusd answers with `Access-Control-Allow-Origin: *` and no auth (`:662-685`). Anyone with the pod id can submit prompts, read outputs, read `/log`, or keep the pod alive with `/heartbeat` **[Inference]**.
- **Submit:** `POST /prompt` with `{prompt, client_id, extra_data}` (`js/comfy-client.js:552-575`). There is **no websocket**; the client polls (`:28-30`).
- **Poll:** `GET /history/{id}` every 3 s (`js/comfy-client.js:523`, `:662-801`). While the job is not in history, `GET /queue` tells queued from running (`:733-759`). Every 30 s a liveness probe checks the job is still in the queue; two misses end the take with "the pod dropped this job" (`:538`, `:679-695`).
- **Inputs:** `POST /upload/image` multipart, by direct fetch (not the proxy, which cannot carry multipart). Inputs must be data URLs. The server's returned name is used, because ComfyUI renames on collision (`js/comfy-client.js:324-376`). The node caps a reference at 64 MB (`js/nodes/combined-node.js:4941`, `:5004-5010`).
- **Outputs:**
  1. `findOutputFile` scans every node and key and prefers video (`js/comfy-client.js:277-297`); `viewUrl` builds `/view?filename&subfolder&type` (`:315-322`).
  2. The browser copies it to R2 with `pwFetchAsDataUrl` (`js/nodes/combined-node.js:5940-5952`, defined `js/nodes/nodes.js:2074`).
  3. Backup: on-pod `uploader.py` reads `/history`, finds `extra_data.pw_key`, presigns through the R2 worker and PUTs the mp4 to R2 (`js/runpod-bootscript.js:39-50`, `:1811-1871`). The browser finds it later with `_podSavedOutput` (`js/nodes/combined-node.js:6026-6050`).
- **Cancel:** `POST /queue {delete:[id]}`, plus `POST /interrupt` only if the queue confirms this prompt is the one running (`js/comfy-client.js:439-457`).
- **Retries and timeouts:**
  - Submit retries up to 4 times on 502/503/504 with 3 s × attempt backoff. A network throw is not retried, because the POST may have landed (`js/comfy-client.js:545-571`).
  - Poll rides out 502-504, 520-526 and 530 and thrown fetches for up to `UNREACHABLE_MS` = 5 min (`js/comfy-client.js:649`, `:697-728`, `:811-816`). 429 keeps polling (`:726`).
  - There is **no client time budget** on a generation; `timeoutMs` is inert (`js/comfy-client.js:494-501`, `:622-626`).
  - A take that loses its pod is re-queued on another ready pod, at most 3 times (`js/nodes/combined-node.js:5379-5423`, `:5430-5444`). A queued take can migrate to an idle pod (`js/comfy-client.js:762-780`, `js/runpod-fleet.js:285-289`).
  - Proxy timeouts: 30 s per request through the worker by default (`js/http-client.js:89`, `:154-164`); the worker's own upstream timeout is 60 s (`server/r2-worker.js:222`).
  - 502/503/504 get a friendly message: "HTTP 502 — the server or GPU pod isn't answering yet ..." (`js/http-client.js:142-152`).
- **The 100-second RunPod proxy limit:** PatchWork's code never mentions it (grep for "100 s", "100-second" and "Waiting for service" found nothing relevant). The design avoids long requests: `/prompt` returns at once, polls are short, and 524 is a transient code (`js/comfy-client.js:410-416`, `:649`). The remaining exposure is a large `/view` download, which runs through the proxy **[Unverified]**. The 100 s figure itself comes from RunPod's docs, as quoted in `scratchpad/research/comfy-sdk-engine.md:373`.
- **The runbook's 502 "Waiting for service to respond" case** (`runbook:29`) was ComfyUI dying under LTX on 24 GB cards. The client treats it as transient, then as a lost pod, and re-queues up to 3 times, which matches "jobs cycled 5 attempts then failed" only loosely **[Inference]**.

---

## 4. Spend control

- **Daily cap:** `prefs.dailyCap`, default $20, stored in localStorage `patchwork.runpod.prefs` (`js/runpod-prefs.js:22`, `:69-72`). `canStart()` refuses a new start when `spentToday() >= cap`; running pods are not touched (`js/runpod-fleet.js:1236-1256`). Both the panel and the agent path call it (`js/runpod-fleet.js:754-759`; `js/collab/collab-manager.js:2133-2134`).
- **spentToday** comes from the observed ledger: one row per pod per minute per state, `usd = rate × seconds between samples`, gaps over 120 s not charged, since local midnight (`js/runpod-history.js:12-59`, `:156-211`, `:271`, `:299`). It sees only what an open tab saw; it is not an invoice (`:30-41`). `boot`, `gen` and `idle` bill; a never-answering "dark" pod is recorded as idle (`js/runpod-history.js:187`, `js/runpod-fleet.js:573`).
- **Cost per hour,** in order of trust: RunPod's `costPerHr` from `GET /pods`, then the catalog price for that GPU (GraphQL `uninterruptablePrice`), then a constant (`js/runpod-fleet.js:1061-1087`). Constants: $2.09 Secure, $1.69 Community for PRO 6000 (`js/runpod-client.js:1682-1695`). Disk is billed apart at $0.10/GB-month running and $0.20 stopped (`:1646-1666`).
- **Idle detection:**
  - On the pod: the watchdog samples every 15 s; idle means GPU util 0 **and** ComfyUI queue 0. An unanswered probe counts as busy (`js/runpod-bootscript.js:1633`, `:1709-1795`). It writes the count to `.idle`, which statusd serves as `idleSec` (`:550-561`, `:1793`).
  - In the app: `stateOf()` calls a pod `gen` if queue > 0, a local claim exists, or util ≥ 20 %, else `idle` (`js/runpod-fleet.js:500-529`). `idleSeconds()` prefers the pod's own count (`:540-546`).
- **Automatic stops (all terminate, none pause):**

| Guard | Default | Where |
|---|---|---|
| App auto-stop after idle | on, 10 min (notify at 5 min) | `js/runpod-prefs.js:63-67`; `js/runpod-fleet.js:589-619` |
| Pod watchdog idle | `IDLE_AFTER` = max(300, autoStopMin×60 + 180) = 780 s, so the app fires first | `js/runpod-fleet.js:783`; `js/runpod-bootscript.js:1795` |
| No heartbeat | 600 s; the app beats every 20 s with a no-cors GET | `js/runpod-client.js:742`; `js/runpod-fleet.js:671-691`; `js/runpod-bootscript.js:1754-1760` |
| Never beaten after ready | 600 s | `js/runpod-bootscript.js:1761-1772` |
| Lifetime cap | 7200 s, +1800 s drain grace if the queue is busy | `js/runpod-client.js:741`; `js/runpod-bootscript.js:1632`, `:1735-1741` |
| Boot deadline | 720 s + 900 per model pack (+1800 FreeVideo) | `js/runpod-client.js:1571-1590`; `js/runpod-bootscript.js:826-842` |
| Fatal boot error | reap after 180 s grace | `js/runpod-bootscript.js:353`, `:392-399` |
| "End after queue" (drain) | the first Terminate click; ends when idle on two looks 15 s apart | `js/runpod-fleet.js:950-1059` |

- **Gap:** a container that never starts (image pull failure) has no on-pod guard, and the app now only labels it "dark" and does not act. PatchWork removed the 12-min auto-kill after it killed three slow pulls (`js/runpod-fleet.js:61-71`, `:500-521`).
- **Pause vs terminate:** the runbook's "pause between passes" (`runbook:106-111`) is no longer possible in PatchWork (see section 1). The trade-off still holds: a stop keeps the disk and weights (`js/runpod-client.js:280-295`), but a resume can come back without a GPU (`:290-292`), and stopped disk bills at double rate (`:1646-1651`).

---

## 5. Error messages users see

| Message (abridged) | Produced at |
|---|---|
| "RunPod API key required — add it in Settings → RunPod" | `js/runpod-client.js:66`, `:92`, `:479`; `js/runpod-fleet.js:712` |
| "RunPod rejected the API key — check it in Settings → RunPod" | `js/runpod-client.js:114` |
| "RunPod has no free {GPU} in {datacenters} right now. Pick another card ({alt} is available now), or try again in a few minutes." | `js/runpod-client.js:183-211`, thrown at `:906-921`; preflight version `js/runpod-fleet.js:882-893` |
| "There are no instances currently available" (RunPod's raw text) | RunPod. Matched by `CAPACITY_HINTS` (`js/runpod-client.js:1503-1516`), then replaced by the sentence above; the raw text survives in `err.detail` (`:918-920`). The runbook's quote `create pod: There are no instances currently available` (`runbook:37-39`) matches the raw form, so it likely predates this wrapper or came from a mixed failure where the non-capacity error won (`:888-891`, `:923-927`) **[Inference]** |
| "... (a pod may still have been created — reconciling)" | `js/runpod-client.js:884-886` |
| "The pod start command is N bytes, over RunPod's 65536-byte limit. This is a PatchWork bug ..." | `js/runpod-client.js:1460-1467` |
| "LTX 2.5 needs a Hugging Face token ..." | `js/runpod-client.js:1089-1097` |
| "Daily cap reached — $X of $Y observed today ..." | `js/runpod-fleet.js:1251-1255` |
| "Already starting a pod — wait for it to finish" | `js/runpod-fleet.js:716` |
| "the pod has been booting for N minutes without becoming ready ..." / "no pod is booting any more" | `js/runpod-fleet.js:164-173` |
| "Auto-terminated {GPU} after N min idle — $X of idle time billed" | `js/runpod-fleet.js:609-610` |
| "GPU pausing and resuming has been removed — start a new pod instead" | `js/runpod-fleet.js:918`; `js/collab/collab-manager.js:2151`; `tools/patchwork-live-mcp.mjs:1196` |
| "No GPU connected — add your RunPod API key ..." / "No pod running — open the RunPod panel ..." / "N pods are still provisioning ..." | `js/comfy-client.js:90-114` |
| "could not reach the GPU pod to start this take ..." | `js/comfy-client.js:564-565` |
| "lost connection to the GPU pod for N min, so this take was stopped ..." | `js/comfy-client.js:169-173` |
| "the pod dropped this job — it is in neither ComfyUI's queue nor its history ..." | `js/comfy-client.js:689-691` |
| "ComfyUI: {class_type} (node N): {message}" | `js/comfy-client.js:138-158`; run-time errors `:179-193` |
| "{model}: this GPU is missing its checkpoint ({file}) — its download failed while the pod was building. Terminate it and start another ..." | `js/nodes/combined-node.js:5151-5153`, wrapped at `:5322`; other branches name build or mode mismatches, text encoder, LoRAs, LTX files (`:5038-5257`) |
| "could not copy the result off the pod — this link dies when the pod is terminated ..." | `js/nodes/combined-node.js:5946-5949` |
| "HOST_OFFLINE: PatchWork is not open in a browser ..." | `server/collab-worker.js:867` |
| Pod-side `FATAL` reasons: no-python, statusd-dead, boot-deadline, cuda13, model download, ltx-gated, ltx-disk, ltx-auth, ltx model download (exit N) | `js/runpod-bootscript.js:788`, `:807`, `:836`, `:1170-1172`, `:1221`, `:1252`, `:1345-1355` |
| "!! COULD NOT SELF-TERMINATE — THIS POD IS STILL BILLING" | `js/runpod-bootscript.js:387`, `:1692` |

**The runbook's "missing its checkpoint" case** (`runbook:75-95`): in the current code, H3 and LTX checkpoint downloads are fatal, so a pod that reaches ready cannot carry a failed checkpoint download (`js/runpod-bootscript.js:1221`, `:1352-1356`). The generic message at `js/nodes/combined-node.js:5151-5153` fires whenever the file is absent and no other LTX transformer is present (`:5139-5150`). So the more likely cause of that event is a pod booted **without LTX selected** in `settings.runpod.models` (`js/runpod-client.js:1038-1058`), and the advice "terminate and start another" would then repeat the failure **[Inference; the event was 2026-08-26 and the code may have differed then]**.

---

## 6. Boundaries

### Do not port (tied to the canvas engine or to PatchWork's Cloudflare/R2 infrastructure)

- **Canvas/flow engine:** `js/nodes/combined-node.js` (graph builders `_comfyGraph`/`_freeVideoGraph`, take loop, recovery, `_recoverPodTakes`), the H3/LTX plans in `js/nodes/nodes.js`, `js/gen-jobs.js` (registry fed by CombinedNode runTake, `:11-17`), `js/run-queue.js`, `WORKFLOW-SPEC.md` (no pod content; grep finds none), `CONTEXT.md` (glossary of runs and hosts).
- **Agent bridge:** `js/collab/collab-manager.js:2101-2190` and `tools/patchwork-live-mcp.mjs:231-262`, `:1192-1217` (needs PatchWork open in a browser, `server/collab-worker.js:867`).
- **Cloudflare/R2:** the `proxy-json` CORS proxy (`server/r2-worker.js:215-255`) and every `proxyMode: 'always'` call; the on-pod R2 uploader and its `pw_key` (`js/runpod-bootscript.js:39-63`, `:1811-1871`); `_podSavedOutput` and `pwFetchAsDataUrl` (`js/nodes/combined-node.js:5940-6050`); GPU key sync through the accounts worker (`js/user-sync.js:370-480`); `pwGpuAllowed` tier gating (`js/comfy-client.js:96-98`); `functions/_middleware.js` (unrelated).
- **PatchWork-model specifics:** H3, LTX and FreeVideo download blocks, sol-attn, Turbo, block cache, iclora, seed mode (`js/runpod-bootscript.js:95-323`, `:938-1030`, `:1143-1600`).
- **UI:** `js/runpod-panel.js`, `css/gpu-panel.css`, benchmark and run-log tooling.

### Self-contained and liftable

- RunPod REST and GraphQL calls, error classification, capacity message, datacenter attempts, start-command packing (`js/runpod-client.js:26-329`, `:559-994`, `:1427-1698`).
- The boot-script skeleton: `kill-pod.sh`, `die()`, stale-marker clearing, statusd, boot deadline, sshd, CUDA smoke test, watchdog, ready marker, supervised ComfyUI (`js/runpod-bootscript.js:324-900`, `:1165-1181`, `:1600-1810`, `:1872-1908`).
- Fleet readiness, probing, heartbeat, scheduling, idle policy, drain, cap gate, rate (`js/runpod-fleet.js:28-720`, `:896-1100`, `:1236-1256`).
- ComfyUI transport robustness (`js/comfy-client.js:308-802`).
- Ledger arithmetic (`js/runpod-history.js:156-211`, `:271-310`).
- Dockerfile and GHCR workflow as templates.

### Size estimate

Counted as non-blank, non-comment lines (a comment-skipping awk over the line ranges above):

| Piece | PatchWork code lines | Expected in ComfyField |
|---|---|---|
| RunPod client lifecycle | ~434 (of 787) | ~200 |
| Boot script skeleton (statusd, kill switch, deadline, watchdog, launch) | ~490 (354 + 135) | ~350 (mostly bash/python text, lifted nearly as is) |
| Weight download stage | ~258 (model specific) | ~60 (generic file list) |
| Fleet subset | ~511 (of 724) | ~250 |
| ComfyUI transport | ~384 | ~150, or ~0 if the SDK plus comfy-api-proxy is used |
| Ledger + prefs | ~267 + ~85 | ~80 |
| Dockerfile + workflow | 70 + 77 | ~100 |
| **Total** | **~2,500 (≈ 7,000 raw lines with comments)** | **~1,000-1,200** |

---

## 7. License and ownership

- No `LICENSE`, `COPYING` or `NOTICE` file at the repo root (directory listing).
- `README.md:161-163`: "## License — All rights reserved. This source code is proprietary and confidential."
- `package.json:6` and `server/package.json:4`: `"private": true`.
- `desktop/builder.yml:10`: `copyright: PatchWork`.
- The pod image is published under the GitHub owner `bchenner` (`js/runpod-client.js:1536`; `docker/README.md:23`).
- I make no judgement on reuse rights here; the user's memory says license review is deferred.

---

## Runbook drift summary

| Runbook says | Code now says |
|---|---|
| Pause, do not terminate (`runbook:106-108`) | Pause removed 2026-09-23; pause is an alias for terminate (`CHANGELOG.md:1185-1188`, `js/runpod-fleet.js:911-919`) |
| The tool takes only `action` and `count` (`runbook:33-35`) | The tool also takes `gpu` (`tools/patchwork-live-mcp.mjs:260-262`, `:1204-1207`) |
| Raw "create pod: There are no instances currently available" (`runbook:37-39`) | Wrapped in "RunPod has no free ..." with the raw text in `detail` (`js/runpod-client.js:894-921`) |
| Ready pod missing its checkpoint because the download failed (`runbook:75-95`) | Checkpoint download failures are fatal; the message more likely means the model was not selected **[Inference]** |
| ~$1.69/hr (`runbook:102-103`) | Community constant $1.69, Secure $2.09; real rate from `costPerHr` (`js/runpod-client.js:1684-1685`, `js/runpod-fleet.js:1075-1087`) |
| Cold boot 4-8 min | The tool text says "43 GB of weights" (`tools/patchwork-live-mcp.mjs:237`); the default H3 plan is 63.5 GB (`js/runpod-client.js:1618`) |

---

## Port plan

### Shape

Put the pod code in one Node module, for example `server/pod.js`, and re-export it from `server/core.js`. That keeps "provider logic in core" for the app, CLI and MCP (`comfyfield:AGENTS.md`, "Keep provider logic in `server/core.js`"). The RunPod key goes in Connections as a new provider entry next to `comfy` (`comfyfield:server/core.js:12`), saved to `.comfyfield/keys.json`. Because the caller is Node, **no CORS proxy is needed**: drop `proxyMode: 'always'` and the R2 worker. Replace browser-only APIs: `window.*` and localStorage become plain module state plus JSON files under `.comfyfield/`; `CompressionStream` becomes `zlib.gzipSync`; the no-cors heartbeat becomes a plain `fetch`.

### Functions

| # | Function | Comes from | What changes |
|---|---|---|---|
| 1 | `runpod(path, {method, body})`, `runpodGql(query)`, `isCapacityRefusal(res)`, `formatRunpodError(res)` | `js/runpod-client.js:65-121`, `:155-166`, `:1503-1516` | Direct `fetch` from Node with `Authorization: Bearer`. Keep the GraphQL "200 with errors" check (`:102-107`) |
| 2 | `podLadder(model)` | **New.** Data from `runbook:14-31` | An ordered list of `{gpuTypeId, cloudType}`. Filter by a per-model VRAM floor (LTX ≥ 32 GB, `runbook:29`). Read real ids from `gpuTypes` once and cache them |
| 3 | `startPod({model, onProgress})` — **start with fallback list** | `create()` `js/runpod-client.js:683-928`; `attempts()` `:951-957`; `_scaleTo` `js/runpod-fleet.js:731-825`; `_preflight` `:859-894`; `canStart` `:1236-1256`; `startCmd` `js/runpod-client.js:1454-1470` | Add an **outer loop over ladder rungs**; inside it keep the datacenter loop. Move to the next rung **only** on a capacity refusal; stop on any fixable error (key, size). Check the daily cap before the first create. Name pods `comfyfield-<id>`. Image from ComfyField's own GHCR package. Generate a per-pod `PROXY_TOKEN` and store it in `.comfyfield/pods.json`. Send `env` with the timers and token |
| 4 | `podBootScript(cfg)` | `js/runpod-bootscript.js:324-900`, `:1165-1181`, `:1600-1810`, `:1872-1908` | Keep: token export before `set -x`, `kill-pod.sh`, `die()`, stale-marker clearing, statusd, boot deadline, CUDA smoke test, watchdog (minus `.upload-pending`), ready marker, supervised ComfyUI. Replace the H3/LTX blocks with one generic, **fatal** download over a `[{repo, file, dir}]` list taken from the workflow's model needs. Optional LoRAs stay non-fatal with a size check (`:1556-1558`). Add the comfy-api-proxy launch (below). Keep the 64 KiB guard |
| 5 | `listPods()`, `podStatus(id)` — **status/ready** | `js/runpod-fleet.js:108-124`, `:313-442`, `:495-529`; `js/runpod-client.js:214-226` | Poll statusd. Define `ready` as statusd `ready` **and** every needed file present in `status.models`, so the runbook's "ready but missing" trap is checked before work, not during (idea from `js/nodes/combined-node.js:5038-5257`). Surface `fatal` and `stage`, which PatchWork serves but does not read |
| 6 | `waitForReady(id, {timeoutMs})` | `js/runpod-fleet.js:143-181` | Poll loop with a 35-min cap (`:76`); reject at once when `fatal` is set |
| 7 | `pausePod(id)` / `resumePod(id)` / `terminatePod(id)` — **pause** | `js/runpod-client.js:273-329`; `js/runpod-fleet.js:896-904` | Decide the default. PatchWork chose terminate only (`CHANGELOG.md:1185-1188`). The runbook prefers pause between passes (`runbook:106-111`). Suggest: user action "Pause" = `POST /stop` (keeps weights; stopped disk bills $0.20/GB-month); all automatic stops = terminate, because the pod can only terminate itself (`js/runpod-bootscript.js:24-33`) |
| 8 | `heartbeat()` | `js/runpod-fleet.js:671-691` | Run on a 20 s timer inside the Vite plugin process while the app is open, and inside any CLI or MCP call that waits on a pod. Without beats the pod reaps itself 600 s after ready (`js/runpod-bootscript.js:1761-1772`) |
| 9 | `runOnPod(workflow, vars, {podId})` — **run a workflow on the pod** | `js/comfy-client.js:521-802` (submit retry, poll, transient codes, liveness), `:348-368` (upload) | Preferred: use `@comfyorg/sdk` against `https://{podId}-8189.proxy.runpod.net` with the pod token, which is the same path as Comfy Cloud and local proxy. Fallback: harden `runComfy` (`comfyfield:server/core.js:321-345`, which today has no transient handling and no input upload) with PatchWork's retry rules. Always copy outputs into `.comfyfield/media` before any stop (`comfyfield:server/core.js:414-432`) |
| 10 | `spendToday()` and a ledger | `js/runpod-history.js:156-211`, `:271-310`; `js/runpod-fleet.js:1075-1098` | Store in `.comfyfield/pod-ledger.json`. Rate from `costPerHr`. Because a server process outlives a tab, also charge from `createdAt` for pods found alive on start-up, which closes PatchWork's "only what this tab saw" gap (`js/runpod-history.js:30-37`) **[Inference]** |
| 11 | `enforceIdle()` — **auto-pause/stop on idle** | `js/runpod-fleet.js:589-619` (idle), `:1029-1059` (drain) | Read statusd `idleSec`; never act while a local job is in flight (`:584-592`). Send `IDLE_AFTER = autoStopMin×60 + 180` so the app acts first (`:783`). Add the guard PatchWork lacks: terminate a pod that stays "dark" past a long limit (for example 20 min), because nothing else reaps a container that never starts (`js/runpod-fleet.js:61-71`) |
| 12 | Image and CI | `docker/Dockerfile`, `.github/workflows/pod-image.yml` | Drop the H3 nodes and sol-attn. Pin `runpodctl` (now `latest`, `docker/Dockerfile:87-89`). Add `pip install comfy-api-proxy==<pinned>`. Publish `ghcr.io/<owner>/comfyfield-pod` and make it public once (`docker/README.md:19-25`). Keep the manifest handshake only if the boot script keeps a build fallback |

Tests without spend: copy the "one seam" mock idea from `tools/gpu-sandbox/mock-runpod.js:1-23` (stub the RunPod transport), and use the proxy's fake ComfyUI demo (`proxy/README.md:64-70`). This fits ComfyField's rule that paid runs need a `needs-keys` issue and budget.

### Is running comfy-api-proxy in the pod simple?

**Yes, mostly simple: about one Dockerfile line and about ten boot-script lines.** There is one real decision (ports) and one open check (the ComfyUI pin).

Simple:
- Python 3.10+ is required (`proxy/README.md:35`); the image's Ubuntu 24.04 `python3` meets it (`docker/Dockerfile:22`, `:73`) **[Inference: 24.04 ships 3.12]**. It runs on aiohttp (`proxy/cli.py:33`).
- Start it like ComfyUI, in a restart loop (`js/runpod-bootscript.js:1903-1908`):
  `comfy-api-proxy --comfyui http://127.0.0.1:8188 --host 0.0.0.0 --port 8189 --token "$PROXY_TOKEN" --comfyui-base-dir /root/cf/ComfyUI --state-dir /root/cf/proxy-state --max-upload-mb 512`
- A non-loopback bind without `--token` is refused (`proxy/cli.py:122-125`), which is the safety we want. The token can ride in pod `env`; RunPod echoes env only to holders of the account key (`js/runpod-client.js:736-739`).
- Polling is the source of truth and SSE is optional (`proxy/README.md:107-112`), so the 100 s Cloudflare cut on SSE does not break a job **[Inference]**.

Needs care:
- **Port clash:** PatchWork's statusd already owns 8189 (`js/runpod-bootscript.js:436-438`, `:776`; `js/runpod-client.js:61-63`, `:734`). Move statusd to 8190 (or the proxy to 8190), and set `ports: ['8189/http', '8190/http']`.
- **Close raw ComfyUI:** drop `8188/http` from `ports` so the unauthenticated ComfyUI is no longer public (`js/comfy-client.js:18-19`). statusd and the watchdog reach ComfyUI on `127.0.0.1:8188`, so they keep working (`js/runpod-bootscript.js:536`, `:575`, `:1719`).
- **statusd has no auth** (`js/runpod-bootscript.js:662-685`): add the same bearer check to `/status`, `/log` and `/heartbeat`, or at least to `/heartbeat` and `/log`.
- **ComfyUI version:** the proxy's cancel calls `POST /api/jobs/{id}/cancel` (`proxy/README.md:99`). Current ComfyUI `server.py` has it (`scratchpad/dl/comfy_server.py:1060`), but whether PatchWork's pin v0.33.1 (`72865f4`) has it is **[Unverified]**. Pick a ComfyUI pin that has it.
- **`extra_data` is closed** to `api_key_comfy_org` only (`proxy/README.md:114-131`). PatchWork's `pw_key` trick cannot pass through the proxy; ComfyField does not need it.
- Uploads default to 100 MB (`proxy/README.md:220`); raise it for video references.
- `/api/v2/health` does not call ComfyUI (`proxy/README.md:105`), so keep statusd for readiness, weights and idle.

### Security notes for the port

- The account-wide RunPod key goes into every pod's env (`js/runpod-client.js:736-739`). PatchWork says RunPod has no scoped key (`:21-23`) **[Unverified today]**.
- HF and Civitai tokens are written into the boot script (`js/runpod-bootscript.js:332-333`), and the boot script travels in `dockerStartCmd`. The pod record and `/root/boot.sh` therefore likely hold them **[Inference]**. Prefer pod `env` for these too, or a short-lived token.
- statusd serves `boot.log` publicly (`js/runpod-bootscript.js:692-702`); PatchWork exports tokens before `set -x` to keep them out of it (`:327-335`). Keep that rule.

## Open questions

1. Exact RunPod `gpuTypeId` strings for PRO 4000, PRO 4500 and PRO 6000 WK, and their VRAM.
2. Does ComfyUI v0.33.1 serve `POST /api/jobs/{id}/cancel`? If not, which pin does?
3. Can RunPod now issue a scoped API key for pod self-termination?
4. Should automatic idle stops in ComfyField terminate (PatchWork) or pause (runbook)? This is a product decision.
5. Does a large `/view` or `/api/v2/assets/{id}/content` download over the RunPod HTTP proxy hit the 100 s limit?
