# Pod facts still open: GPU ids, ComfyUI pin, proxy install, scoped key, proxy limit

Researched 2026-10-17 for issue #63 (parent #59). It closes the open questions at the end of `research_notes/engine/patchwork-pod-backend.md` (branch `research/patchwork-pod-backend`).

No RunPod key was used, no account was made and no money was spent. The image was not pulled or run.

## Sources and method

- **RunPod GPU catalogue, live.** The public GraphQL query `gpuTypes` at `https://api.runpod.io/graphql`, sent with no key. RunPod's own docs generator sends this same query with no `Authorization` header (`runpod/docs` repo, `helpers/gpu_types.py`). Snapshot taken 2026-10-16 22:45 UTC.
- **RunPod docs**, read as raw Markdown from `docs.runpod.io/<page>.md`: `references/gpu-types`, `pods/configuration/expose-ports`, `pods/templates/environment-variables`, `get-started/credentials`, `runpodctl/overview`, `pods/manage-pods`, and the two OpenAPI files `api-reference/openapi.json` (REST v1, version 0.1.0) and `api-reference-v2/openapi.json` (REST v2, version 2.0.0).
- **runpodctl** source and history: `runpod/runpodctl` on GitHub (`internal/configenv/configenv.go`, `README.md`, releases, issue #293, PRs #366 and #368).
- **ComfyUI**: `Comfy-Org/ComfyUI` (`comfyanonymous/ComfyUI` redirects there). `server.py` and `requirements.txt` at the pin `72865f4f27eaf5396f8f36370e0a2be3a9a090ee` and at `master` (head `fc04da91b`, 2026-10-16). Tags, and the commit history of `server.py`.
- **comfy-api-proxy**: the PyPI JSON API, and the 0.1.6 wheel itself (`comfy_api_proxy-0.1.6-py3-none-any.whl`, sha256 `1ea405f1a4dc5886d06d630bc1de57fd8754062776ace797e66969636ca941c6`), unpacked and read. Repo `Comfy-Org/comfy-api-proxy` for commits after the tag.
- **The pod image**: `ghcr.io/bchenner/patchwork-comfy`, manifest and config read through the anonymous GHCR registry API. No layer was downloaded.
- **Cloudflare docs** (the RunPod HTTP proxy runs behind Cloudflare): `fundamentals/reference/connection-limits`, `support/.../error-524`, `cache/how-to/cache-rules/settings`, `cache/concepts/default-cache-behavior`. One keyless `HEAD` to a made-up pod URL confirmed `Server: cloudflare` and a `CF-RAY` header on `*.proxy.runpod.net`.
- **PatchWork** shallow clone at `9a90879` (Release 0.10.4). Its image tag `9a90879c…` has the same digest as `:latest`, so the code and the image match.
- **Ubuntu**: the Launchpad API for the `python3.12` source package in noble.
- A local timing run of `pip install comfy-api-proxy==0.1.6` (Windows, Python 3.12.10). It is a rough guide only.

Tags: **[Verified]** = read in a primary source today. **[Measured]** = run here today. **[Inference]** = my reading, not a quote. **[Unverified]** = needs a key, an account or a paid run.

## Answers at a glance

| # | Question | Answer |
|---|---|---|
| 1 | GPU ids and VRAM | PRO 4000 = `NVIDIA RTX PRO 4000 Blackwell`, 24 GB. PRO 4500 = `NVIDIA RTX PRO 4500 Blackwell`, 32 GB. PRO 6000 = `NVIDIA RTX PRO 6000 Blackwell Server Edition`, 96 GB. PRO 6000 WK = `NVIDIA RTX PRO 6000 Blackwell Workstation Edition`, 96 GB. **PRO 4000 and PRO 4500 are Secure only today**, so two runbook rungs cannot place |
| 2 | Pin serves the proxy? | **Yes.** ComfyUI v0.33.1 (`72865f4`) has every route the proxy calls, including `POST /api/jobs/{job_id}/cancel`. The route arrived in v0.26.0. No boot fix is needed |
| 3 | Pip install at boot? | **Yes.** Python 3.12.3, and pip lives in the ComfyUI venv at `/root/h3/venv-cu130`. All four proxy dependencies are already in that venv, so only one 59 KB wheel installs: about 5 s measured |
| 4 | Scoped key? | **Partly.** "Restricted" account keys exist, but they scope by API, not by pod. **Every pod already gets its own pod-scoped `RUNPOD_API_KEY`** from RunPod. Use it, and do not send the account key |
| 5 | 50 MB download vs 100 s? | **No, for a normal stream.** The limit is a read timeout between reads, not a cap on the whole transfer, and the proxy streams. Range requests are the fallback |

---

## 1. GPU ids and VRAM for the ladder

### The ids [Verified: public `gpuTypes`, 2026-10-16 22:45 UTC]

| Rung name | `gpuTypeId` (exact) | VRAM | Secure offered | Community offered | Secure price, stock | Community price, stock |
|---|---|---|---|---|---|---|
| PRO 4000 | `NVIDIA RTX PRO 4000 Blackwell` | 24 GB | yes (max 4) | **no** (max 0) | $0.57/hr, Low | none |
| PRO 4500 | `NVIDIA RTX PRO 4500 Blackwell` | 32 GB | yes (max 8) | **no** (max 0) | $0.72/hr, Medium | none |
| PRO 6000 | `NVIDIA RTX PRO 6000 Blackwell Server Edition` | 96 GB | yes (max 9) | yes (max 9) | $2.49/hr, Medium | list $1.69/hr, no stock at that moment |
| PRO 6000 WK | `NVIDIA RTX PRO 6000 Blackwell Workstation Edition` | 96 GB | yes (max 8) | yes (max 4) | $2.59/hr, Low | $1.69/hr, Low |

Fields used: `id`, `memoryInGb`, `secureCloud`, `communityCloud`, `maxGpuCountSecureCloud`, `maxGpuCountCommunityCloud`, and `lowestPrice(input:{gpuCount:1, secureCloud:true|false}) { uninterruptablePrice stockStatus }`. Prices and stock change by the minute. Only the ids, the VRAM and the cloud flags are stable facts.

Near neighbours in the same catalogue, for reference:

| `gpuTypeId` | VRAM | Clouds | Price (snapshot) |
|---|---|---|---|
| `NVIDIA RTX PRO 4500 Blackwell Server Edition` | 32 GB | Secure only | $0.72/hr, Low |
| `NVIDIA RTX PRO 5000 Blackwell` | 48 GB | flags say both, but Secure max count is 0 | Community $0.82/hr, Low |
| `NVIDIA RTX PRO 6000 Blackwell Max-Q Workstation Edition` | 96 GB | Community only | $1.64/hr, Low |
| `NVIDIA RTX PRO 6000 Blackwell Server Edition MIG 1g.24gb` / `MIG 2g.48gb` | 24 / 48 GB | Secure only | not read |

### What does not agree with the live catalogue

- **The docs table** `references/gpu-types` lists PRO 4500, PRO 6000, PRO 6000 WK, Max-Q and the MIG slices, but **not PRO 4000, PRO 4500 SE or PRO 5000** [Verified]. It is generated by `helpers/gpu_types.py` and was last edited 2026-08-18, so it is stale.
- **The REST v1 OpenAPI** (`rest.runpod.io/v1`, version 0.1.0) gives `PodCreateInput.gpuTypeIds` a 49-value enum. That enum has the three PRO 6000 ids but **no PRO 4000 and no PRO 4500** [Verified]. Yet PatchWork's panel creates through REST v1 with ids taken from `gpuTypes` (`js/runpod-catalog.js:475`, `js/runpod-client.js:706`), and the runbook records two PRO 4000 pods that booted on 2026-09-27. So the server accepts ids outside the published enum **[Inference]**.
- **REST v2** (`POST https://api.runpod.io/v2/pods`) takes `gpu.id` as a free string (`BaseGpuConfig.id`) and `cloud: SECURE | COMMUNITY`, default `SECURE` [Verified: v2 OpenAPI].
- **The runbook ladder** (`gpu-pod-runbook.md:14-31`, updated 2026-09-12) starts with "Pro4000 Community" and has "Pro4500 Community" third. Both are not offered today: `communityCloud: false` and a Community max count of 0. A create on those rungs can only fail. The order among the rungs that can place is unchanged.
- **PatchWork's price constants** ($2.09 Secure and $1.69 Community for PRO 6000, `js/runpod-client.js:1682-1695`) are stale. Secure is $2.49 now.
- **LTX floor:** PRO 4000 has 24 GB, under the 32 GB floor in `gpu-pod-runbook.md:29`. The LTX ladder therefore starts at PRO 4500.

### How the build should use this [Inference]

- Hard-code the ids and VRAM; they are stable.
- At start, read `gpuTypes` once (no key needed) and skip a rung whose `maxGpuCount{Secure,Community}Cloud` is 0 or whose `lowestPrice.stockStatus` is null. That saves a failed create per dead rung and picks up new Community supply on its own.

---

## 2. Does the pinned ComfyUI serve everything comfy-api-proxy needs?

### The pin [Verified]

- Dockerfile `ARG COMFY_COMMIT=72865f4f27eaf5396f8f36370e0a2be3a9a090ee` (`docker/Dockerfile:41`). The image config history shows the same value in every build step, so the published `:latest` uses it.
- `72865f4f2` is the commit tagged **v0.33.1**, message "ComfyUI v0.33.1", committed 2026-08-13T20:09:36Z.
- Current upstream: v0.41.2 (2026-10-16), `master` head `fc04da91b` (2026-10-16).

### Every ComfyUI call in comfy-api-proxy 0.1.6, checked against the pin [Verified]

I read every upstream call in the wheel: `self.session.get/post(self.comfyui + …)`, `_get_json(…)` and the websocket URL. There are exactly seven.

| Proxy call (0.1.6) | Used for | At pin `72865f4` `server.py` | At `master` |
|---|---|---|---|
| `POST /prompt` (`app.py:761`) | submit | line 1072 | yes |
| `GET /history/{id}` (`app.py:326`) | status, outputs | line 1059 | yes |
| `GET /queue` (`app.py:355`) | queued or running | line 1064 | yes |
| `POST /api/jobs/{job_id}/cancel` (`app.py:893`) | cancel | **line 971** | line 1060 |
| `POST /upload/image` (`app.py:1162`) | input upload | line 464 | yes |
| `GET /view` with `Range` (`app.py:1271`) | output bytes | line 516, returns `web.FileResponse` (line 659), which serves `Range` | yes |
| WS `/ws?clientId=…` + first message `{"type":"feature_flags"}` (`realtime.py:95`, `:137`) | SSE events | line 269, handshake at lines 302-310 | yes |

The pin's cancel handler matches the proxy's needs. It is idempotent: an unknown or finished id is a no-op that returns `200 {"cancelled": false}`, and it interrupts only if the job is still the running one (`server.py:944-987` and `comfy_execution/jobs.py:505-520` at the pin).

### When the cancel route arrived [Verified]

- Commit `4e716f7c5` "Add jobs-namespace cancel endpoints (POST /api/jobs/{job_id}/cancel, POST /api/jobs/cancel) (#14493)", 2026-06-19.
- First tag with it: **v0.26.0** (2026-06-23). v0.25.1 does not have it. v0.26.0 through v0.29.0 and v0.33.1 do.
- So the minimum ComfyUI for comfy-api-proxy cancel is **v0.26.0**. The proxy README says only "recent enough".

### Why the version check matters [Verified in source]

The proxy ignores the status of the upstream cancel call: `async with self.session.post(... "/api/jobs/{job_id}/cancel") as r: await r.read()` (`app.py:893-894`). On a ComfyUI older than v0.26.0 the call would 404 in silence. The job would keep running and report `canceling`.

### Decision

- **No boot fix is needed** for the PatchWork image as it stands.
- Optional guard against a future downgrade, one line after ComfyUI is up. An unknown id gives 200 on a build with the route (handler code above); a build without the route has no handler, so it cannot give 200. Not run here:

  ```bash
  [ "$(curl -s -o /dev/null -w '%{http_code}' -X POST http://127.0.0.1:8188/api/jobs/00000000-0000-0000-0000-000000000000/cancel)" = 200 ] || die "comfyui-too-old-for-proxy"
  ```

- If ComfyField builds its own image, pin ComfyUI at v0.26.0 or later. v0.33.1 is proven with the H3 and LTX nodes. Moving to v0.41.x is a separate test, because PatchWork found that node behaviour changes between pins (`js/runpod-bootscript.js:909-925`).

---

## 3. Can comfy-api-proxy be pip-installed at boot in that image?

### Facts about the image [Verified unless tagged]

- Base `nvidia/cuda:13.0.1-base-ubuntu24.04`. The config labels say `org.opencontainers.image.version=24.04`, and `CUDA_VERSION=13.0.1`.
- `:latest` = `sha256:361ba1d24a1593de07d6af5c249b32e50f6a075bea19ef446b488a0b7482f7e6`, config created 2026-09-18T12:09:06Z, 14 layers, 4,002,029,356 bytes compressed. The venv layer alone is 3,420,169,141 bytes.
- **Python:** apt `python3 python3-venv python3-dev python-is-python3` (`docker/Dockerfile:71-76`). Ubuntu 24.04 ships Python **3.12.3** (Launchpad: `python3.12` `3.12.3-1ubuntu0.17` in noble-updates). That meets the proxy's `Requires-Python: >=3.10`.
- **pip:** `python3-pip` is **not** installed, so the system Python has no pip. pip lives in the venv: `/root/h3/venv-cu130/bin/python -m pip`. It was upgraded with `pip install -U pip wheel` during the build (`docker/Dockerfile:120-121`). The exact pip version needs a layer pull **[Unverified]**.
- **Environment:** `PIP_NO_CACHE_DIR=1`, `PIP_DISABLE_PIP_VERSION_CHECK=1`, `VENV=/root/h3/venv-cu130`, `BASE=/root/h3`. The ComfyUI root is `/root/h3/ComfyUI`.

### The proxy's needs vs what the venv already has [Verified]

| comfy-api-proxy 0.1.6 needs | ComfyUI `requirements.txt` at the pin, already in the venv |
|---|---|
| `aiohttp>=3.9` | `aiohttp>=3.11.8` |
| `blake3>=0.4` | `blake3` |
| `pydantic>=2.6` | `pydantic~=2.0` (pip took the newest 2.x at build time, 2026-09-03, so 2.6 or later **[Inference]**) |
| `pyyaml>=6.0` | `pyyaml` |

So in the ComfyUI venv, the install adds one file: the 59,020-byte proxy wheel. Its console script lands at `/root/h3/venv-cu130/bin/comfy-api-proxy` (entry point `comfy_api_proxy.cli:main`).

### How long it takes [Measured on Windows; Linux is an estimate]

| Case | What downloads | Time measured here |
|---|---|---|
| Into a venv that already has the four dependencies (the ComfyUI venv case) | 1 wheel, 59 KB | **5.4 s** |
| Into a fresh venv (`python3 -m venv` first) | 17 wheels, 7,142,423 bytes, all prebuilt `cp312` manylinux wheels, no compiler | 30.7 s to make the venv + 62.3 s to install |

The Windows numbers are slow because of the file scanner on this machine. On the pod's Linux disk, expect a few seconds for the first case and about 10-20 s for the second **[Inference]**. Either way it is small next to the weight download.

### Recommendation

Install into the ComfyUI venv with `--no-deps`, so pip cannot touch a ComfyUI package. Check the imports, then start the proxy. Keep `set +x` around the line that holds the token, because PatchWork serves `boot.log` publicly (`js/runpod-bootscript.js:327-335`, `:692-702`):

```bash
/root/h3/venv-cu130/bin/python -m pip install --no-deps comfy-api-proxy==0.1.6 \
  && /root/h3/venv-cu130/bin/python -c "import comfy_api_proxy, aiohttp, blake3, pydantic, yaml" \
  || die "proxy-install"
```

Two notes:
- The CLI has no environment variable for the token. `--token` must go on the command line, and `comfy-api-proxy start` copies it into the child's argv (`cli.py:184-185`). It is visible to `ps` inside the pod only. Run it in the foreground in a restart loop (as PatchWork does for ComfyUI), not with `start`.
- Better still: bake the same `pip install` line into ComfyField's own image, so boot does not depend on PyPI.

---

## 4. Does RunPod offer a scoped API key, so a pod does not carry the account key?

### What RunPod offers [Verified]

1. **Restricted account keys.** The credentials page offers permissions **All**, **Restricted** or **Read Only**. Restricted can be set per Runpod API: None, Restricted (per Serverless endpoint), Read/Write, or Read Only. Keys made before 2024-11-11 are legacy keys (`get-started/credentials`). The REST v2 security scheme says: "Keys are scoped to the permissions granted when created; requests may return `403` when a valid key lacks access". **There is no per-pod or per-resource scope in the docs.** A restricted key that can terminate a pod can terminate any pod on the account.
2. **A pod-scoped key in every pod.** The pod environment variable table says `RUNPOD_API_KEY | Pod-scoped API key.` (`pods/templates/environment-variables`). The runpodctl overview says "Every Pod you deploy comes preinstalled with `runpodctl` and a Pod-scoped API key." `runpodctl` reads `RUNPOD_API_KEY` from the environment before its config file (`internal/configenv/configenv.go`).

### What the pod-scoped key can do

The docs do not list its rights. The evidence:

- runpodctl issue #293 (2026-06-25): inside a pod, `runpodctl remove pod $RUNPOD_POD_ID` **works**, while the newer `runpodctl pod remove $RUNPOD_POD_ID` returns **403**. At that time the legacy command used GraphQL and the new one used REST v1 [Verified: issue text; PR #368 says the legacy `remove pod` was "GraphQL mutations" before v3; PR #366 says `pod delete` was "rest v1" before v3].
- PatchWork's logs: from inside a pod, REST `POST /pods/{id}/stop` and `DELETE /pods/{id}` both return 403, and runpodctl "is the fallback that has actually worked" (`docker/Dockerfile:80-86`, `js/runpod-bootscript.js:1637-1648`).
- Together: inside a pod, GraphQL terminate works and REST lifecycle calls get 403 **[Inference]**.

### Two open points [Unverified]

- **Which key wins.** PatchWork puts the account key into the pod `env` as `RUNPOD_API_KEY` (`js/runpod-client.js:736-739`), which is the same name RunPod injects. The docs do not say which value the container sees. The REST 403s above fit "RunPod's injected value wins", but they also fit "RunPod blocks REST calls from pods".
- **runpodctl v3 moved off GraphQL.** v3.0.0 (2026-10-15) runs even the legacy `remove pod` on REST v2 (`runpod/runpodctl` PR #368: "start pod, stop pod, remove pod … Before: GraphQL mutations. After: v2 actions and DELETE"). If REST v2 still answers 403 to a pod-scoped key, then **`runpodctl remove pod` stops working inside pods** on any image that installs runpodctl 3.x. Issue #293 was closed when v3.0.1 shipped, with no linked fix. PatchWork installs `releases/latest`, unpinned (`docker/Dockerfile:87-89`). Its current image built that layer on 2026-09-03, when latest was v2.12.0, so the live image is not affected yet **[Inference from the layer date]**.

### Answer

Yes, in the way that matters: **do not send the account key to the pod.** RunPod already gives each pod a key scoped to that pod. Self-terminate with that key through GraphQL, which is the path that works from inside a pod today:

```bash
curl -s -X POST https://api.runpod.io/graphql \
  -H "Authorization: Bearer $RUNPOD_API_KEY" -H "Content-Type: application/json" \
  -d "{\"query\":\"mutation { podTerminate(input: {podId: \\\"$RUNPOD_POD_ID\\\"}) }\"}"
```

Keep `runpodctl` as a second path, pinned to **v2.15.0** (the last release whose legacy `remove pod` used GraphQL), until a pod test proves v3 works. Keep the host-side reaper as the backstop. The host holds the account key and can always `DELETE` a pod.

---

## 5. Does a large download hit the RunPod proxy's 100 s limit?

### The limit, from both owners [Verified]

- RunPod: "Cloudflare enforces a maximum connection time of 100 seconds. If your service doesn't respond within this time, the connection closes with a `524` error." Path: User → Cloudflare → Runpod load balancer → pod (`pods/configuration/expose-ports`).
- Cloudflare defines the 524 limit as the **Proxy Read Timeout**, "a timeout value between two successive read operations to your origin server" (`cache/how-to/cache-rules/settings`). Error 524 means "the origin did not provide an HTTP response before the … Proxy Read Timeout". Cloudflare's current default is **125 s**. Enterprise zones can change it, so RunPod's 100 s may be their own setting (`fundamentals/reference/connection-limits`, updated 2026-07-23).
- Cloudflare's other origin-side limits: Proxy Write Timeout 30 s (also a 524), Proxy Idle Timeout 900 s.

So the timer measures **waiting for bytes**, not the length of the whole transfer.

### What the download path does [Verified in source]

- `GET /api/v2/assets/{id}/content` → `_stream_view` (`app.py:1260-1298`). It sends the response headers at once (`out.prepare`), then streams ComfyUI's `/view` body in 64 KiB chunks. It passes on `Content-Length`, `Content-Range` and `Accept-Ranges`, and it forwards the client's `Range` header.
- The proxy's own client session has no total timeout: `ClientTimeout(total=None, sock_connect=10)` (`app.py:226`). So the proxy does not cut a long stream.
- ComfyUI's `/view` returns `web.FileResponse`, which streams the file and serves `Range` and 206 (pin `server.py:659`).

### Answer

A 50 MB video sends its first byte in well under a second, and bytes keep flowing. At 1 MB/s it takes about 50 s in total, and no single gap comes near 100 s. **It does not hit the limit** **[Inference from the two definitions and the code]**. A 524 needs one of these:

- an origin that sends nothing for 100 s (not this path), or
- a hard total-duration cap inside RunPod's own load balancer. That is not documented. The words "maximum connection time" leave it open **[Unverified]**.

### Workaround, in order

1. **Default: stream to disk.** Read `getDownloadUrl()` with the bearer token and pipe the body to `.comfyfield/media`. Do not buffer the whole file.
2. **If a long transfer is ever cut: resume with `Range`.** Both the proxy and ComfyUI honour it (above). Fetch in 8-16 MB ranges, or resume from the byte count already on disk. This also covers a pod on a slow link.
3. **Not recommended: a TCP port** (`8189/tcp` with `supportPublicIp`). It skips Cloudflare, but it has no TLS, so the proxy token would cross the internet in clear (`pods/configuration/expose-ports`, "TCP connections do not" use HTTPS).
4. **Heavy option: push from the pod** to object storage, as PatchWork's R2 uploader does. That needs more infrastructure; keep it for later.

### Uploads go the other way

- The proxy rejects uploads over `--max-upload-mb`, default 100 (`app.py:70`, `cli.py:91-95`).
- Cloudflare caps a request body by plan: 100 MB on Free and Pro, 200 MB on Business, up to 5 GB on Enterprise (`cache/concepts/default-cache-behavior`). RunPod's plan for `proxy.runpod.net` is not public **[Unverified]**.
- Keep input references under 100 MB until a pod test proves more. Raise `--max-upload-mb` only together with that test.

---

## Cheap checks that would close the [Unverified] items (needs `needs-keys`)

One Secure PRO 4000 pod for 10 minutes costs about $0.10 at $0.57/hr. Never print a key; compare hashes.

1. **Key precedence.** Start the pod **without** `RUNPOD_API_KEY` in `env`, run `printenv RUNPOD_API_KEY | sha256sum`, and compare it with the account key's hash on the host. Then repeat with the account key in `env`. This shows whether RunPod's pod-scoped key wins.
2. **Self-terminate.** Inside a pod, call GraphQL `podTerminate` on `$RUNPOD_POD_ID` with the injected key, on a second disposable pod. Also try `runpodctl` v3.0.1 `remove pod`, to settle the v3 risk.
3. **Long download.** Serve a 50 MB file through the proxy and fetch it with `curl --limit-rate 200k` (about 250 s). Also add one test route that waits 110 s before its first byte, to confirm the 524. Success = the slow download completes and the slow route gets a 524.
4. **Upload cap.** POST a 150 MB body through `proxy.runpod.net` with `--max-upload-mb 512`, and check for a Cloudflare 413.

---

## What this means for the build

### GPU ladder (ready to paste)

The runbook order (`gpu-pod-runbook.md:14-31`), with the ids and VRAM from RunPod's live catalogue. The two Community rungs that RunPod does not offer today are commented out.

```js
// Runbook order (gpu-pod-runbook.md, 2026-09-12). Ids and VRAM from RunPod's
// public gpuTypes catalogue on 2026-10-16. PRO 4000 and PRO 4500 are Secure
// only (communityCloud: false), so their Community rungs cannot place.
// LTX 2.5 needs vramGb >= 32, so it starts at PRO 4500.
export const GPU_LADDER = [
  // { gpuTypeId: 'NVIDIA RTX PRO 4000 Blackwell', cloudType: 'COMMUNITY', vramGb: 24 },
  { gpuTypeId: 'NVIDIA RTX PRO 4000 Blackwell', cloudType: 'SECURE', vramGb: 24 },
  // { gpuTypeId: 'NVIDIA RTX PRO 4500 Blackwell', cloudType: 'COMMUNITY', vramGb: 32 },
  { gpuTypeId: 'NVIDIA RTX PRO 4500 Blackwell', cloudType: 'SECURE', vramGb: 32 },
  { gpuTypeId: 'NVIDIA RTX PRO 6000 Blackwell Server Edition', cloudType: 'COMMUNITY', vramGb: 96 },
  { gpuTypeId: 'NVIDIA RTX PRO 6000 Blackwell Workstation Edition', cloudType: 'COMMUNITY', vramGb: 96 },
  { gpuTypeId: 'NVIDIA RTX PRO 6000 Blackwell Server Edition', cloudType: 'SECURE', vramGb: 96 },
  { gpuTypeId: 'NVIDIA RTX PRO 6000 Blackwell Workstation Edition', cloudType: 'SECURE', vramGb: 96 },
]
```

Use it as `GPU_LADDER.filter(r => r.vramGb >= minVramGb)`. Move to the next rung only on a capacity refusal. `cloudType` is the REST v1 field name; REST v2 calls it `cloud`, with the same values.

### ComfyUI pin and boot fix

- **Keep v0.33.1 (`72865f4`). No boot fix is needed.** It serves all seven upstream calls of comfy-api-proxy 0.1.6, including `POST /api/jobs/{job_id}/cancel`.
- Any future pin must be **v0.26.0 or later**.
- Optional one-line boot probe: `POST /api/jobs/00000000-0000-0000-0000-000000000000/cancel` must answer 200, else `die`.

### Proxy install line

```bash
/root/h3/venv-cu130/bin/python -m pip install --no-deps comfy-api-proxy==0.1.6
```

- Python 3.12.3. Only the 59 KB wheel installs, in about 5 s.
- Start command: `/root/h3/venv-cu130/bin/comfy-api-proxy --comfyui http://127.0.0.1:8188 --host 0.0.0.0 --port 8189 --token "$PROXY_TOKEN" --comfyui-base-dir /root/h3/ComfyUI --state-dir /root/h3/proxy-state`
- In ComfyField's own image, move the same line into the Dockerfile.

### Key scope

- **Do not put the account key in the pod `env`.** RunPod gives every pod its own pod-scoped `RUNPOD_API_KEY`.
- Self-terminate with GraphQL `podTerminate` and that key.
- Pin `runpodctl` to v2.15.0 as the second path, because v3 moved `remove pod` to REST.
- The host keeps the account key, in `.comfyfield/keys.json`, and remains the backstop reaper.
- Restricted account keys only scope by API, so they do not replace this.

### Large downloads

- **Stream outputs to disk through `/api/v2/assets/{id}/content`, and resume with `Range` if a transfer breaks.**
- The 100 s limit is a gap between reads, not a cap on the whole transfer, so a 50 MB video is fine.
- Keep uploads under 100 MB until the pod test above proves more.
