# Comfy SDK, API v2, proxy, Cloud and Router for the ComfyField generation engine

Researched 2026-10-16 against primary sources. No money spent, no accounts created, no keys used.

How it was checked:
- The published npm tarball `@comfyorg/sdk@0.5.0` was downloaded and its `README.md`, `src/` and `dist/*.d.ts` were read. Method names below come from that source, not from blog posts.
- docs.comfy.org pages were read as raw Markdown (`<page>.md`), plus the three OpenAPI files the docs publish: `/openapi-v2.yaml`, `/router-openapi.yaml`, `/openapi-cloud.yaml`.
- The `Comfy-Org/comfy-api-proxy` README and source (`cli.py`, `app.py`) on `main`, plus PyPI and GitHub metadata.
- Comfy Cloud's own model listing endpoint (answers without a key) and comfy.org pages (`/pricing.md`, `/cloud/supported-nodes.md`, `/open-source-higgsfield.md`, `/platform.md`).
- Hugging Face API for which open weights exist.

Tags used below:
- **[Verified]**: read in a primary source today.
- **[Inference]**: my reading or arithmetic. It is not a quote.
- **[Unverified]**: could not be checked without a key, an account or a paid run.

---

## 0. What changed since `open_source_landscape.md` section 4

These items in the older note are now stale or incomplete:

| Older note | Today (primary source) |
|---|---|
| Router "213 partner models" | The Router models page lists 214 model rows. The docs publish 249 per-model schema files. Counts move often. [Verified: docs `development/comfy-router/models.md`, `llms.txt`] |
| "BYOK is Enterprise-only" | The Router quickstart now says you can save your own Higgsfield key, and those runs bill to Higgsfield. The pricing FAQ says Partner Node BYOK covers Runway and Google Gemini today. [Verified: `development/comfy-router/quickstart.md`, comfy.org/pricing.md] |
| No way to see a Router price before a run | `POST /v2/models/{provider}/{model}/estimate` exists. It is still rolling out and can answer `403 not_enabled`. SDK 0.5.0 has no wrapper for it. [Verified: router reference, SDK source] |
| (not covered) | `new Comfy()` takes **no base URL option**. The target comes only from the `COMFY_BASE_URL` environment variable, read at construction. [Verified: SDK `src/sdk/client.ts`] |
| (not covered) | The SDK needs Node 22+. This machine runs Node `v20.9.0`, while `package.json` already says `"engines": {"node": ">=22"}`. [Verified: `node --version`, SDK `package.json`] |
| (not covered) | Idempotency differs by surface. API v2 jobs **reject** a reused key (`422 idempotency_key_reuse`). Router **replays** the first result for a reused key. [Verified: openapi-v2 types, router docs] |

---

## 1. `@comfyorg/sdk` (TypeScript SDK, used from plain JS)

### 1.1 Package facts [Verified: npm registry, tarball]

- Latest: **0.5.0**, published **2026-10-10T15:48:57Z**. First release 0.1.0 on 2026-07-21. Versions since: 0.1.1–0.1.9, 0.2.0 (09-10), 0.3.0 (09-15), 0.4.0 (09-18), 0.5.0 (10-10).
- The Python `comfy-sdk` 0.5.0 shipped the same day (2026-10-10T15:47:24). The docs say both "share a version number" and suggest `@comfyorg/sdk@^0.5` or `>=0.5.0`.
- License MIT. Repo `github.com/Comfy-Org/comfy-typescript-sdk` (13 stars, last push 2026-10-14). It was renamed from `ComfyTypeScriptSDK`.
- `"type": "module"`, ESM only, `"engines": {"node": ">=22"}`. Exports: `.`, `./low` (generated types and the raw transport `ComfyLow`), `./errors` (Router error classes).
- Runtime deps: `zod ^4.4.3`, `hash-wasm ^4.11.0`, `eventsource-parser ^4.1.0`. ComfyField already has `zod 4.6.7`, so the versions are compatible.
- Install: `npm i @comfyorg/sdk`.
- Plain JS ESM works as is: `import { Comfy, comfy } from '@comfyorg/sdk'`. CommonJS on Node 22.12+ can use `require()`. On Node 22.0–22.11 it needs `await import()`.
- Browsers are out of scope for v1. The proxy README says "`@comfyorg/sdk` stays Node-only for v1". So the SDK belongs in `server/core.js`, not in `src/`.

### 1.2 Two surfaces in one package [Verified: README]

| Surface | Object | Host | Use |
|---|---|---|---|
| Workflows (Comfy API v2) | `new Comfy({ apiKey })` → `client.workflows`, `client.assets`, `client.jobs`, `client.submit`, `client.run`, `client.listJobs` | `COMFY_BASE_URL` (default `https://cloud.comfy.org`) | Run an API-format ComfyUI graph on Cloud, a deployment, or self-hosted through the proxy |
| Router | `comfy.config({ credentials, baseUrl })` → `comfy.models.run / submit / subscribe / handle / list / schema` | `https://api.comfy.org` (override: `comfy.config({ baseUrl })` or `COMFY_ROUTER_BASE_URL`) | One partner model, its native JSON in and out |

In TypeScript, the `Comfy` class has **no** `.models`. The `comfy` namespace holds `comfy.models`. In Python, `Comfy()` has both. [Verified: docs `sdks.md`, README]

### 1.3 Client construction and credentials [Verified: README, `src/sdk/client.ts`]

```js
import { Comfy } from '@comfyorg/sdk'
const client = new Comfy({ apiKey: 'comfyui-...', clientInfo: 'comfyfield', timeoutMs: 30_000 })
```

- `ComfyOptions` is `{ apiKey?, timeoutMs?, fetch?, clientInfo? }`. `timeoutMs` is the per-HTTP-request default (30 s in the transport). It is not a job deadline.
- **No base URL argument.** `new Comfy(url, opts)` now throws a `TypeError`. The target is `process.env.COMFY_BASE_URL`, read **each time a client is constructed**. Blank or unset means Comfy Cloud.
- Key order: (1) the `apiKey` option when non-blank, (2) `COMFY_API_KEY` from the environment, (3) on Comfy Cloud, `MissingCredentials` is thrown at construction. On any other base URL, no key means no `Authorization` header.
- Caution: "a `COMFY_API_KEY` in the environment is sent to whatever `COMFY_BASE_URL` names". ComfyField's `providers.comfy` also reads `COMFY_API_KEY`. A keyless local client could therefore send the Cloud key to a local proxy or a pod. Always pass `apiKey` explicitly, and never rely on the environment fallback.
- The `Authorization: Bearer <key>` header goes only to the client's own origin. It is not sent on a redirect to a signed storage URL.
- To drive several backends from one process, construct one client per backend. Set `COMFY_BASE_URL` synchronously around each `new Comfy()` (see the example in 1.9). The other option is `new ComfyLow(baseUrl, apiKey, opts)` from `@comfyorg/sdk/low`, which takes a base URL but has no asset dedup or `run()` helpers. [Inference: this workaround follows from the source. It is not a documented pattern.]

### 1.4 Running an API-format workflow [Verified: README, `dist/sdk/*.d.ts`]

Build the workflow:
- `await client.workflows.fromFile(path)`. This is the only async constructor.
- `client.workflows.fromJson(graph)`. It uses the object as is, without a copy.
- `client.workflows.fromString(text)`.
- All three return a `Workflow` with `.json` (mutable) and `setInput(nodeId, field, value)`. None of them validates the graph. A UI-format export throws `WorkflowFormatUi` locally at submit.

Submit and wait:
- `client.submit(wf, { idempotencyKey?, apiKey?, metadata?, signal? }) → Promise<Job>`. It returns as soon as the server accepts the job. It retries `429` with `Retry-After` within a bounded budget.
- `client.run(wf, { timeoutMs?, apiKey?, signal? }) → Promise<Job>`. It submits, polls to a terminal state, and throws on failure.
- The `apiKey` on submit/run is the **Partner Node** key. It is sent once as `extra_data.api_key_comfy_org`. It is not the server credential.

`Job` methods:
- `refresh(signal?)`
- `wait(timeoutMs?, signal?)` polls with adaptive backoff.
- `result(signal?)` waits, then throws `JobFailed` unless the status is `succeeded`.
- `cancel(signal?)`
- `events(signal?)`, an async iterator.
- `getWorkflow()`, which returns `{ workflow, format: 'api' | 'save' }`.
- `getLogs()`. It returns `null` on Comfy Cloud. Only serverless deployments capture logs.
- `getOutputs(nodeId)`

`Job` accessors:
- `id`, `status`, `outputs`, `error`
- `createdAt`, `startedAt`, `completedAt`, `expiresAt`
- `progress`, `queuePosition`, `metrics`, `urls`, `metadata`

Status values: `queued`, `running`, `canceling`, `succeeded`, `canceled`, `failed`, `expired`. The terminal ones are `succeeded`, `canceled`, `failed`, `expired`.

Rehydrate a job by id: `await client.jobs.get(jobId)`.

List jobs: `client.listJobs({ metadata?, limit?, signal? })` is an async generator of `{ id, status, createTime, updateTime, deploymentId, metadata }`.
- Labels (`metadata`) work **only on Comfy API deployments**.
- Comfy Cloud raises `metadata_not_supported` on submit and `501 not_implemented` on list.
- The SDK README says the proxy rejects labels with `invalid_request`. But the proxy README "Scope" lists "caller `metadata`" as implemented. **[Unverified: the two READMEs conflict.]**

Progress events, from `job.events()`. Each has a `kind`:
- `progress`: `value` (0–1), `message`, `nodesDone`, `nodesTotal`, `currentNode`, `currentNodeClass`, `step`, `steps`
- `preview`: `nodeId`, `contentType`, `data` (`Uint8Array`)
- `outputReady`: `output`
- `statusChange`: `status`, `queuePosition`
- `log`: `level`, `message`

The stream auto-reconnects from "now", with no replay. If SSE is throttled, dropped, or not served, it falls back to polling `GET /jobs/{id}`. Polling is the source of truth.

Caveat: "Comfy Cloud has been reported to send `null`" in `job.progress` for a running job. Take live progress from `events()`.

### 1.5 Outputs and downloads [Verified: README, `outputs.d.ts`]

`Output` fields:
- `nodeId`, `name`, `id` (the asset UUID), `sizeBytes`, `contentType`, `jobId`
- `type`: one of `'image' | 'video' | 'audio' | 'text' | 'file' | 'latent'`

Download methods:
- `await out.toFile(path, { range?, signal?, timeoutMs? })` streams to disk and returns the path.
- `await out.toBytes({ range? })` returns a `Uint8Array`.
- `await out.getDownloadUrl()` returns `{ url, expiresAt }`. On Cloud and serverless this is a self-authorizing signed URL. On the proxy it is the authenticated content URL, and `expiresAt` is `null`.

To get outputs: `job.outputs` covers all nodes, and `job.getOutputs('9')` covers one node.

### 1.6 Uploading an input image [Verified: README, `assets.d.ts`]

```js
const asset = client.assets.fromFile('photo.png')   // lazy: nothing is sent yet
wf.setInput('10', 'image', asset)                    // '10' must be a LoadImage node (a filename widget)
wf.setInput('11', 'image', ['10', 0])                // link the decoded IMAGE onward
```

- Other constructors: `fromBytes(data, { filename, contentType })`, `fromStream(stream, opts)`, `fromUrl(url)`, `get(assetId)`, `delete(assetId)`.
- On submit, the SDK hashes each embedded handle locally (blake3 via WebAssembly). It probes `HEAD /assets/by-hash/{hash}` and uploads only when the server lacks the bytes. Then it swaps the handle for `{ "__type": "core/ASSET", "info": { "id", "hash", "file_path" } }`.
- Bind a handle **only to a loader's filename widget**: `LoadImage.image`, `LoadVideo.file`, `LoadAudio.audio`, `Load3D.model_file`. Bound straight to an `IMAGE` socket, it passes submit but fails at execution.
- `asset.getDownloadUrl()` uploads first if needed. It returns a short-lived signed URL, which is how a local file reaches a Router model that wants a URL. The README says this works for Router inputs only when the asset lives on Comfy Cloud, because a self-hosted URL needs auth.

### 1.7 Error classes [Verified: `src/sdk/exceptions.ts`, README]

Workflow surface. All extend `ComfyError`, which carries `code`, `httpStatus`, `details`, `requestId`, `retryAfter`, `idempotencyKey`. The classes:
- `Unauthorized`, `Forbidden`, `NotFound`
- `InvalidWorkflow` and its subclass `WorkflowFormatUi`
- `MissingAsset`, `HashMismatch`, `BlobNotFound`
- `IdempotencyKeyReuse`, `InsufficientCredits`, `MissingCredentials`
- `QueueFull`, with `retryAfter: number | null`
- `JobFailed`, with `.error = { code, message, node_id, class_type, traceback } | null`

Router surface: import `routerErrors` from `@comfyorg/sdk` or the classes from `@comfyorg/sdk/errors`. There are 15 classes under `RouterError`:
- Request-level: `InvalidInput` (with `detail[]` of `{ loc, type, msg, ctx }`), `ContentPolicyViolation`, `ProviderError`, `ProviderTimeout`, `InsufficientCredits`, `ModelNotFound`.
- Transport-level: `Unauthorized`, `Forbidden`, `ConcurrencyLimitExceeded`, `ClientDisconnected`, `InternalError`, `DeadlineExceeded`, `NotEnabled`, `ServiceUnavailable`, `RateLimited`.
- Note: `comfy.models.run()` reports failures as `ComfyError` with `err.code` set to the Router `error_type`. `submit/subscribe/handle.get()` throw the `routerErrors.*` classes.

### 1.8 Idempotency keys [Verified: openapi-v2 generated types, docs `sdks.md`, router docs]

API v2 jobs and assets, through the `Idempotency-Key` header:
- The contract text: "Single-use: the first request to present a key is processed; any later request with the same key is rejected `422` `idempotency_key_reuse` (reject-on-duplicate, no response replay). Keys expire after 24h."
- The SDK mints a fresh key on every `submit()`/`run()` call. A plain retry loop therefore creates a second job and a second charge.
- To recover, store `job.id` as soon as submit returns, then call `client.jobs.get(id)`. Do not resubmit.
- The docs say a definitive failure (validation, credits, queue full) frees the key. An ambiguous failure (timeout, dropped connection) does not.

Router:
- A reused key **replays** the original result (header `Idempotent-Replayed`) and is not charged again. Keys are 1–255 characters.
- `comfy.models.run` reuses one key across its internal retries.
- Router answers `409 concurrency_limit_exceeded` when the same key is still in flight, and `504 deadline_exceeded` at its 10-minute bound. The SDK "collects" both under the same key without a second charge.

### 1.9 Minimal JS example (plain ESM, ComfyField style)

**[Unverified: this was not executed.]** Running it needs Node 22 and a target. A free target works: local ComfyUI plus `comfy-api-proxy`. It reuses ComfyField's own `fill()` and `public/workflows/image_flux.json`. All model files in that graph exist on Comfy Cloud (see 4.4).

```js
// proof.mjs  (Node 22+, npm i @comfyorg/sdk@^0.5)
// TARGET_URL unset → Comfy Cloud; http://127.0.0.1:8189 → local proxy;
// https://<POD_ID>-8189.proxy.runpod.net → RunPod pod running comfy-api-proxy
import fs from 'node:fs'
import path from 'node:path'
import { Comfy, JobFailed, QueueFull, InsufficientCredits } from '@comfyorg/sdk'
import { fill } from './shared/mapping.js'

// The SDK reads COMFY_BASE_URL only at construction, so scope it to one `new Comfy()`.
function comfyClient(baseUrl, apiKey) {
  const saved = process.env.COMFY_BASE_URL
  if (baseUrl) process.env.COMFY_BASE_URL = baseUrl
  else delete process.env.COMFY_BASE_URL
  try {
    return new Comfy({ apiKey: apiKey || undefined, clientInfo: 'comfyfield' })
  } finally {
    if (saved === undefined) delete process.env.COMFY_BASE_URL
    else process.env.COMFY_BASE_URL = saved
  }
}

const graph = fill(JSON.parse(fs.readFileSync('public/workflows/image_flux.json', 'utf8')), {
  prompt: 'a red fox in fresh snow, golden hour', width: 1024, height: 1024, count: 1, seed: 42,
})
graph['1'].inputs.ckpt_name = 'flux1-schnell-fp8.safetensors' // cheapest proof model, present on Cloud
graph['6'].inputs.steps = 4

const client = comfyClient(process.env.TARGET_URL, process.env.TARGET_KEY)
const wf = client.workflows.fromJson(graph)
// Image input, if the graph has a LoadImage node "10":
// wf.setInput('10', 'image', client.assets.fromFile('photo.png'))

try {
  const job = await client.submit(wf)
  console.log('job', job.id) // persist now; after a lost reply use client.jobs.get(id), never resubmit
  for await (const ev of job.events()) {
    if (ev.kind === 'progress') console.log(`${Math.round(ev.value * 100)}%`)
    else if (ev.kind === 'statusChange') console.log(ev.status)
  }
  await job.result() // polls to terminal; throws JobFailed unless succeeded
  fs.mkdirSync('out', { recursive: true })
  for (const out of job.getOutputs('8')) { // "8" is SaveImage in image_flux.json
    const file = await out.toFile(path.join('out', path.basename(out.name)))
    console.log(out.type, out.contentType, out.sizeBytes, file)
  }
} catch (err) {
  if (err instanceof JobFailed) console.error('failed at node', err.error?.node_id, err.error?.message)
  else if (err instanceof QueueFull) console.error('queue full; retry after', err.retryAfter)
  else if (err instanceof InsufficientCredits) console.error('add credits')
  else throw err
}
```

To fit `server/core.js`: replace the `toFile` loop with `saveMedia(Buffer.from(await out.toBytes()), ext)`. Map `out.type` to ComfyField's `kind`. That replaces `collectComfy()` and its `/view` URLs. [Inference]

---

## 2. Comfy API v2 raw HTTP contract

Use this if we skip the SDK.

### 2.1 Base URLs and auth [Verified: docs `api-reference/v2/overview.md`, `openapi-v2.yaml` servers and securitySchemes]

| Surface | Base URL | Auth |
|---|---|---|
| Comfy Cloud | `https://cloud.comfy.org` | `Authorization: Bearer comfyui-…` |
| Comfy API deployment | `https://{deployment}.run.comfy.app` (staging `{deployment}.stg.run.comfy.app`) | `Authorization: Bearer comfyui-…` |
| Self-hosted via comfy-api-proxy | `http://127.0.0.1:8189` | None by default. Optional static bearer token (`--token`) |

- All routes are under `/api/v2`. The spec version is `2.0.0`. Changes inside v2 are additive, and breaking changes go to v3.
- Unauthenticated probe today: `GET https://cloud.comfy.org/api/v2/jobs` answers `401 {"error":{"code":"unauthorized","message":"Missing or invalid API key. Send 'Authorization: Bearer <your comfyui- key>'."}}`. [Verified by probe]
- ComfyField today sends `X-API-Key` to ComfyUI (`comfyHeaders()` in `server/core.js`). That header is the v1 Cloud API style. v2 wants `Authorization: Bearer`.

### 2.2 Endpoints [Verified: SDK `src/low/transport.ts`, proxy README, openapi-v2]

| Method and path | Purpose |
|---|---|
| `POST /api/v2/assets` | Multipart upload. Fields: `file`, `content_type`, `file_path`; optional `expected_hash` (`blake3:<hex>`), `tags[]`, `expires_in` (60 s–7 d). Header `Idempotency-Key`. |
| `POST /api/v2/assets/from-hash` | Dedup fast path. Mints an asset over bytes the server already has. |
| `HEAD /api/v2/assets/by-hash/{hash}` | Existence probe. |
| `GET /api/v2/assets/{id}` | Metadata plus a fresh short-lived `url` and `url_expires_at`. |
| `GET /api/v2/assets/{id}/content` | Bytes. Range-capable. On Cloud it answers `302` to a signed storage URL. |
| `DELETE /api/v2/assets/{id}` | Delete. Older proxies answer `405`. |
| `POST /api/v2/jobs` | Body `{ "workflow": {API graph}, "extra_data"?: { "api_key_comfy_org" } , "metadata"?: {…} }`. Header `Idempotency-Key`. Answers `201` with a Job. |
| `GET /api/v2/jobs` | Newest first, cursor pages, `metadata[key]=value` filters. |
| `GET /api/v2/jobs/{id}` | The polling workhorse. |
| `GET /api/v2/jobs/{id}/workflow` | `{ workflow, format: 'api' \| 'save' }` |
| `GET /api/v2/jobs/{id}/logs` | Deployments only. Cloud answers `204` or `null`. |
| `GET /api/v2/jobs/{id}/events` | SSE. |
| `POST /api/v2/jobs/{id}/cancel` | Idempotent cancel request. |
| Proxy only: `POST /api/v2/assets/from-path`, `GET /api/v2/health` | Zero-copy register of a file under `--comfyui-base-dir`, and a liveness probe. |

Asset reference inside a workflow: `{"__type": "core/ASSET", "info": {"id": "<uuid>", "hash"?: "blake3:…", "file_path"?: "photo.png"}}`. `info.id` is required and authoritative. A bad reference fails submit with `422 missing_asset`. [Verified: openapi-v2 `AssetReference`]

Job object fields: `id`, `status`, `created_at`, `started_at`, `completed_at`, `expires_at`, `queue_position`, `progress`, `outputs[]`, `error`, `metrics`, `urls { self, events, cancel, logs? }`.
- Each output has `{ node_id, name, type, content_type, size_bytes, id, hash, url, url_expires_at, job_id }`.
- "Follow links, don't build URLs." Resolve host-relative `urls.*` against the request origin, not against a base URL with a path prefix.

Error envelope: `{ "error": { "code", "message", "details"? } }`. Core codes:
- `invalid_workflow` (422), `workflow_format_ui` (422), `missing_asset` (422)
- `hash_mismatch` (409), `blob_not_found` (404), `idempotency_key_reuse` (422)
- `queue_full` (429 + `Retry-After`), `insufficient_credits` (402)
- `not_found` (404), `unauthorized` (401), `forbidden` (403)
- Deployments add `deployment_not_ready` (429 + `Retry-After`) and `deployment_stopped` (422).

### 2.3 Output URL lifetimes [Verified: docs v2 overview]

Three different clocks apply:
1. `Output.url` is `{base}/api/v2/assets/{id}/content`. It is **authenticated** and answers `401` in a user's browser. It stays valid while the asset exists.
2. The signed storage URL comes from the Asset `url`, the `302 Location`, or `getDownloadUrl()`. It is self-authorizing and lasts "**approximately 6 hours**" on Cloud and deployments. Read `url_expires_at` and never hard-code the 6 hours. Self-hosted has no signed URLs.
3. `url_expires_at` on a job output on Cloud repeats the job's `expires_at`, which is `created_at` + 30 days. The docs call this "a placeholder", not a retention promise.

The docs advise: re-host the bytes, or re-mint the URL on demand, or proxy it. ComfyField already re-hosts into `.comfyfield/media`, so keep doing that.

### 2.4 SSE events [Verified: `openapi-v2.yaml` `x-sse-events`]

`GET /api/v2/jobs/{id}/events` sends `event:`/`data:` frames. On connect it sends a snapshot (`status`, the latest `progress`, the latest `preview`).

| Event | Meaning |
|---|---|
| `status` | Every lifecycle transition, including queue position. |
| `progress` | A full snapshot, about 2 per second. |
| `preview` | A JPEG in base64. Only the latest is kept. |
| `output` | A best-effort early copy of an `Output`. The full set is on the terminal `status` and on `GET /jobs/{id}`. |
| `log` | Reserved. "NOT YET EMITTED". |
| `error` | The stream ended for a non-terminal reason: `credential_expired`, `job_not_found`, `forbidden`. |

- There are no event ids and no `Last-Event-ID` resume.
- `429 too_many_streams` caps concurrent streams.
- `501 not_implemented` means that surface has no SSE. Polling still works.

---

## 3. comfy-api-proxy

### 3.1 What it is [Verified: repo README, docs `api-proxy.md`]

- "A local service that puts the **Comfy API v2** in front of a self-hosted ComfyUI instance. The same client SDK code that talks to Comfy Cloud can drive a ComfyUI on your own machine instead."
- It is Python 3.10+ with aiohttp. It maps v2 to ComfyUI's native routes:
  - `POST /api/v2/jobs` → `POST /prompt`
  - `GET /api/v2/jobs/{id}` → `/history` plus `/queue`
  - cancel → `POST /api/jobs/{id}/cancel`
  - SSE → ComfyUI `/ws`
  - assets → `/upload/image` and `/view`
- Package `comfy-api-proxy` on PyPI, latest **0.1.6** (2026-08-19). The repo `main` has later commits, for example asset expiry on 2026-08-27, that are not yet on PyPI. MIT license, 13 stars.
- "One proxy ↔ one ComfyUI. Multi-backend routing is out of scope."
- The cancel route needs a ComfyUI recent enough to serve `POST /api/jobs/{job_id}/cancel`. Current ComfyUI `server.py` has it. **[Unverified: the minimum ComfyUI version.]**

### 3.2 Install and run [Verified: README, `cli.py`]

```bash
pip install comfy-api-proxy
comfy-api-proxy                                   # proxies 127.0.0.1:8188, serves 127.0.0.1:8189
comfy-api-proxy --comfyui http://127.0.0.1:8188 --port 8189 --comfyui-base-dir /path/to/ComfyUI
comfy-api-proxy start | stop | status             # background mode
```

| Flag | Default | Note |
|---|---|---|
| `--comfyui` | `http://127.0.0.1:8188` | |
| `--host` | `127.0.0.1` | A non-loopback bind **is refused** unless `--token` (or `--allow-insecure-bind`) is set. |
| `--port` | `8189` | |
| `--token` | unset | Requires `Authorization: Bearer <token>` on `/api/v2/*`. `/api/v2/health` stays open. |
| `--comfyui-base-dir` | unset | Allows model uploads into `checkpoints/`, `loras/`, `vae/` and similar. These are safetensors-only, path-checked, and written atomically. |
| `--max-upload-mb` | `100` | |
| `--state-dir` | unset | SQLite for job records, idempotency keys and the asset index, so they survive restarts. |
| `--enable-cors-header <origin>` | unset | A browser origin allowlist. `*` is refused. |

Other behavior:
- There is a default-on origin guard against DNS rebinding and CSRF.
- SSE is throttled to about 2 events per second.
- At most **8** concurrent event streams are allowed. Past that, the proxy answers `429 too_many_streams`.

### 3.3 Does the SDK target it? [Verified]

Yes. Set `COMFY_BASE_URL="http://127.0.0.1:8189"` and construct `new Comfy()` without a key, or with the proxy token as `apiKey`. The docs say: "Everything in the SDK guide works the same way against the proxy as against Comfy Cloud." Known differences:
- No signed URLs.
- No `getLogs()`.
- Labels are disputed (see 1.4).

### 3.4 Can it run in a RunPod pod, so one client drives Cloud, the pod and local the same way?

Yes. The docs even name this case: "If you expose it beyond loopback, for example in front of a ComfyUI on a rented GPU, configure a bearer token or put an authenticating reverse proxy in front of it." [Verified: docs `api-proxy.md`]

Pod setup. **[Inference: assembled from the proxy CLI and RunPod docs. Not run.]**

```bash
pip install comfy-api-proxy
comfy-api-proxy start --comfyui http://127.0.0.1:8188 --host 0.0.0.0 --port 8189 \
  --token "$PROXY_TOKEN" --comfyui-base-dir /workspace/ComfyUI --state-dir /workspace/proxy-state
```

- Expose **8189 only** as an HTTP port. Keep ComfyUI's 8188 private. Raw ComfyUI has no auth.
- The client base URL is `https://<POD_ID>-8189.proxy.runpod.net`, and `apiKey` is `$PROXY_TOKEN`. [Verified: RunPod URL format "https://[POD_ID]-[INTERNAL_PORT].proxy.runpod.net"]

Caveats:
- RunPod's HTTP proxy: "Cloudflare enforces a maximum connection time of 100 seconds" (`524` after that). [Verified: docs.runpod.io expose-ports] SSE streams will drop every ≤100 s. The SDK reconnects and falls back to polling, so `job.wait()` and `job.result()` still work. Long single requests over 100 s can fail. **[Unverified for large output downloads.]** A TCP port avoids the limit but needs its own TLS. [Inference]
- `--state-dir` should sit on the pod's persistent volume, or job and idempotency records are lost on restart. [Inference]
- The token is one static secret. Store it in ComfyField Connections like a key. [Inference]

Result: one engine adapter (`Comfy` class) serves three targets. Only `{ baseUrl, apiKey }` differs:

| Target | Base URL | Key |
|---|---|---|
| Comfy Cloud | (unset) | Comfy key |
| Pod | `https://<POD_ID>-8189.proxy.runpod.net` | proxy token |
| Local | `http://127.0.0.1:8189` | none |

[Inference, backed by the docs' "Only the base URL changes between these targets."]

---

## 4. Comfy Cloud

### 4.1 Plans, API access, concurrency, prices [Verified: comfy.org/pricing.md, docs `sdks.md`, `cloud-usage.md`]

- "API access requires a paid Comfy Cloud subscription. The free tier does not include it." The free tier is "5 free runs on real GPUs" in the web app.
- API jobs use the same credits as the web UI. There is no separate API pool.

| Plan | Monthly price (yearly price) | Credits | API concurrency | Max runtime | Model / LoRA import |
|---|---|---|---|---|---|
| Standard | $20 ($16 billed yearly, $192/yr) | 50,400 / year | 1 | 30 min | No |
| Creator | $35 ($28) | 88,800 / year | 3 | 30 min | Yes (Civitai, Hugging Face) |
| Pro | $100 ($80) | 253,200 / year | 5 | 1 hr | Yes |
| Team | $700 ($630) | 1,772,400 / year | 25 | 1 hr | Yes |

- Queue up to 100 workflows. The FAQ also says Team has "five tiers from $200 to $2,500/month", which conflicts with the $700 headline. [Verified that both statements are on the page]
- GPU: "Blackwell RTX 6000 Pro – 96GB VRAM". Billing is for active GPU time only.
- Credit conversion: $1 = 211 credits. [Verified: router reference `RouterCostEstimate.credits`]
- Cloud workflow GPU rate: "0.266~ credits / second", per the Comfy blog, edited 2026-01-23 after a 30% drop. [Verified: blog.comfy.org/p/comfy-cloud-new-features-and-pricing] That equals the Comfy API RTX PRO 6000 rate on the pricing page: **$4.54/hr = 957.94 credits/hr**, about $0.00126 per GPU-second. The pricing page does not state the Cloud workflow rate directly. [Inference: two sources agree]
- Comfy API (deployment) GPUs, billed per second:
  - RTX PRO 6000: $4.54/hr
  - H100 SXM: $6.23/hr
  - H200 SXM: $7.71/hr
  - B200: $11.23/hr
  - Network storage: $0.20/GB/month
  - Standard includes 5 builds, 2 deployments, and 2 workers per deployment.

### 4.2 Custom nodes [Verified]

- Users cannot install custom nodes: "Comfy Cloud does not currently support direct installation of custom nodes by users." There is a request form. [support.comfy.org article 6791455062]
- The public list at `https://comfy.org/cloud/supported-nodes/` (`.md` works) shows **83 packs** today. Examples: VideoHelperSuite, Impact Pack, KJNodes, LTXVideo, WanVideoWrapper, controlnet_aux, IPAdapter_plus, Florence2, RMBG, SAM3, ComfyUI-Qwen-TTS, Fill-ChatterBox, RES4LYF, FlashVSR_Ultra_Fast, LivePortraitKJ, essentials, LayerStyle.

### 4.3 Models: a list exists, readable without a key [Verified by probe today]

- `GET https://cloud.comfy.org/api/experiment/models` returns 136 folders. `GET https://cloud.comfy.org/api/experiment/models/{folder}` returns the file names. Both answered `200` with no key on 2026-10-16. These routes are in the deprecated v1 Cloud OpenAPI. Treat them as unstable.
- Counts today: `diffusion_models` 377, `checkpoints` 75, `loras` 652, `text_encoders` 73, `vae` 44. The pricing page says "900+ pre-installed models".
- Bring your own: "Import models" from Civitai or Hugging Face, including private ones with your keys, needs **Creator or higher**. Formats are `.safetensors`/`.sft`. [Verified: docs `cloud/import-models.md`]

### 4.4 Target models on Cloud today [Verified: Cloud model listing, HF API, Router docs]

| Model | On Comfy Cloud (open weights)? | Evidence |
|---|---|---|
| **FLUX 3 (Klein)** | **No, not yet.** Cloud has FLUX.2 Klein (`flux-2-klein-4b`, `-4b-fp8`, `flux-2-klein-9b`, base variants, plus 30+ Klein LoRAs). | The BFL weights appeared on HF on 2026-10-13/14: `black-forest-labs/flux-3-image-klein`, `-base`, `-comfy`, `-pup`. The closed API versions are on Router: `bfl/flux-3-image`, `bfl/flux-3-video`. |
| **LTX-2.5** | **Yes.** Files: `ltx-2.5-22b-dev-transformer-bf16`, `ltx-2.5-22b-distilled-transformer-bf16` / `-comfy-int8-convrot` / `-nvfp4`. Text encoder `gemma4-12b-with-proj-ltx-2.5-bf16`. VAEs `ltx-2.5-video-vae-bf16`, `ltx-2.5-audio-vae-bf16`. Upscalers `ltx-2.5-latent-spatial/temporal-upscaler-x2`. Node pack LTXVideo is supported. | Cloud listing |
| **MiniMax H3 (open weights)** | **Yes.** Files: `minimax_h3_fl2va_pruned_int8_convrot`, `minimax_h3_ref2va_pruned_int8_convrot`, text encoder `qwen3vl_32b_minimax_h3_int8_convrot` / `_nvfp4_awq`, `minimax_h3_video_vae_fp16`, `minimax_h3_audio_vae_fp32`, LoRA `minimax_h3_ref2v_turbo_4step_v0.1_comfyui_bf16`. | Cloud listing. HF `MiniMaxAI/MiniMax-H3` (2026-07-28). |
| **Qwen-Image 2.1** | **No.** Cloud has Qwen-Image 2512, Edit 2509/2511, Layered, and Qwen-Image (original). | HF has `Qwen/Qwen-Image-2.1` (2026-09-14) and `-Turbo` (2026-10-09). |
| **Chatterbox** | **Yes.** Model folders `chatterbox/chatterbox`, `chatterbox_multilingual`, `chatterbox_turbo`, `chatterbox_vc`. Node pack "Fill-ChatterBox" with `FL Chatterbox TTS`, `FL Chatterbox Turbo TTS`, `FL Chatterbox Multilingual TTS`, `FL Chatterbox Dialog TTS`, `FL Chatterbox VC`. Qwen3-TTS is also present. | Cloud listing, supported-nodes page |

ComfyField's three bundled workflows reference files that all exist on Cloud today: `flux1-dev-fp8`, `sd_xl_base_1.0`, `ltx-video-2b-v0.9.5` and `t5xxl_fp16`. Cloud also has `flux1-schnell-fp8`. [Verified]

License fact: MiniMax H3 runs on Comfy Cloud with commercial use included. Commercial use **locally** needs a MiniMax license, which Comfy resells "From $5,000 / month". [Verified: comfy.org/pricing.md] This touches the local-first story. License review is deferred by project decision, so this is only recorded here.

---

## 5. Comfy Router via the SDK

### 5.1 Surface [Verified: SDK `models.d.ts`, README, router docs]

```js
import { comfy } from '@comfyorg/sdk'
comfy.config({ credentials: key })   // process-global; or COMFY_API_KEY in env

// wait for the finished result (one HTTP call held open)
const r = await comfy.models.run('minimax/minimax-h3',
  { content: [{ type: 'text', text: 'A red maple leaf on white' }], duration: 5, ratio: '16:9', resolution: '768P' },
  { timeoutMs: 1_200_000, signal, idempotencyKey, modelProvider, strictMode, fallbackProvider, maxBytes, retry })
// r.kind === 'json'   → r.data is the provider's own payload (here r.data.task.content.url)
// r.kind === 'binary' → r.data is a Uint8Array, r.contentType e.g. 'audio/mpeg' (ElevenLabs)
// also: r.requestId, r.servingProvider, r.droppedParams, r.replayed, r.creditsUsed

// queue it and collect later
const h = await comfy.models.submit('minimax/minimax-h3', input, { idempotencyKey })
h.requestId
await h.status()                         // { status: 'IN_QUEUE'|'IN_PROGRESS'|'COMPLETED', queuePosition, errorType, retryAfterMs, raw }
for await (const u of h.events()) {}     // poll loop, not SSE
const { data } = await h.get()           // throws routerErrors.* on failed/cancelled
await h.cancel()                         // PUT .../cancel, a request not a guarantee
comfy.models.handle('minimax/minimax-h3', requestId)   // rebuild in another process

// submit + poll + get, with progress callbacks
await comfy.models.subscribe(id, input, { onQueueUpdate: (u) => {}, timeoutMs })

// discovery
for await (const m of comfy.models.list()) {}           // { id, provider, model, ... }
await comfy.models.schema(id, { etag })                 // per-model OpenAPI doc, ETag revalidation
```

- Model id format: `{provider}/{model}`, lowercase. The provider segment is at most 64 characters and the model segment at most 128.
- Routes:
  - `POST https://api.comfy.org/v2/models/{provider}/{model}` (sync)
  - `POST …/requests` (queue) and `GET …/requests/{request_id}`
  - `GET …/status`, `PUT …/cancel`
  - `GET /v2/models` and `GET /v2/models/{provider}/{model}`
  - `GET …/openapi.json`
  - `POST …/estimate`
- Auth: `X-API-Key: comfyui-…` or `Authorization: Bearer comfyui-…`. If both are sent, `X-API-Key` wins.
- Inputs are each model's **native** JSON, forwarded unchanged. Outputs are the provider's native payload. There is no common envelope.
- Per-model schemas: `GET /v2/models/{p}/{m}/openapi.json` needs a key. A public snapshot sits at `https://docs.comfy.org/router-schemas/{provider}/{model}.json`.
- Image inputs: a public URL, or `data:image/<fmt>;base64,...` where the model allows it (Seedance does), or base64 fields (for example `bfl/flux-2-pro` `input_image`).
- A local file can also get a URL from `client.assets.fromFile(p).getDownloadUrl()`. **[Unverified: whether a Router-only account, with credits and no Cloud plan, may use the v2 assets surface.]**
- The TS `run()` returns `{ kind, data, requestId, … }`. Python returns the payload directly. This is a deliberate difference.

### 5.2 Catalog ids for the models asked about [Verified: docs `comfy-router/models.md`, `providers.md`]

| Model | Router id(s) |
|---|---|
| MiniMax H3 | `minimax/minimax-h3` (Text, Image → Video + Audio). Also `fal/h3-max`, `fal/h3-max-turbo`. |
| Seedance 2.5 | `byteplus/dreamina-seedance-2-5-260628`. Alternate providers fal, Higgsfield, Runware, WaveSpeed via `model_provider`. Provider-prefixed copies exist too (`fal/fal-seedance-2.5`, `higgsfield/higgsfield-seedance-2.5`, …). |
| Kling 3 | `kling/kling-v3`, `kling/kling-3.0-turbo`, `kling/kling-v3-omni`. Also `higgsfield/higgsfield-kling-3-pro`, `-std`, `-turbo`, `-4k`. |
| Nano Banana Pro / 2 | `vertexai/gemini-3-pro-image`, `vertexai/gemini-3.1-flash-image`. Also `vertexai/gemini-3.1-flash-lite-image` (NB2 Lite) and `vertexai/gemini-nano-banana-2.1`. |
| GPT Image 2 | `openai/gpt-image-2`. Also `openai/gpt-image-2.5-flare`, `openai/gpt-image-2.5-sunburst`. |
| FLUX 2 Pro or newer | `bfl/flux-2-pro`, `bfl/flux-2-max`, `bfl/flux-3-image`, `bfl/flux-3-video`. |
| Veo 3.1 | `veo/veo-3.1-generate-001`, `veo/veo-3.1-fast-generate-001`, `veo/veo-3.1-lite-generate-001`. |
| Also useful | `ltx/ltx-2-5-fast`, `ltx/ltx-2-5-pro`; `wan/wan3.0-video`; `qwen/qwen-image-3.0`; audio: `elevenlabs/eleven_v3`, `eleven_v4`, `eleven_v4_turbo`, `eleven_multilingual_v2`, `eleven_sfx_v2`, `byteplus/seed-audio-1.0`. |

The catalog groups today are Video 69, Image 88, Audio 36, 3D 11, Text 46. Some models appear in more than one group.

### 5.3 Pricing visibility [Verified: router `limitations.md`, `reference.md`, `billing.md`, `pricing.md`]

Before a run:
- `POST /v2/models/{p}/{m}/estimate` takes the same body as the run.
- It returns `RouterCostEstimate` with `source: 'exact' | 'estimated' | 'unknown'`.
  - `exact` carries `amount`, `amount_cents`, `credits`.
  - `estimated` carries `min_amount` and `max_amount`.
  - `unknown` carries a `reason`: `not_quotable`, `unpriced_model`, `byok`, or `pricing_unavailable`.
  - Every estimate also carries `pricing_as_of`.
- A queued submit's `201` also carries `estimate`.
- "While the estimate is rolling out, the route answers `403` with `error_type: not_enabled`."
- **SDK 0.5.0 has no `estimate()` method.** Call it with raw `fetch`.

After a run:
- The `X-Comfy-Credits-Used` header is exposed as `result.creditsUsed`, a string or `null`. It is "available only for some models and successful responses". A missing header does not mean free.

The catalog carries no prices. The docs pricing page has rate cards. USD, default Comfy provider:
- `minimax/minimax-h3`: $0.1287/s at 768p, $0.1859/s at 2K.
- `ltx/ltx-2-5-fast`: $0.1287/s at 720p, $0.1859/s at 1080p, $0.2717/s at 1440p, $0.429/s at 4K.
- `veo/veo-3.1-lite-generate-001`: $0.03/s at 720p and $0.05/s at 1080p without audio. $0.05/s and $0.08/s with audio.
- `veo-3.1-fast`: $0.08 / $0.10 / $0.25 per second without audio.
- `qwen/qwen-image-3.0`: $0.0429 per image.
- `bfl/flux-2-pro`, `bfl/flux-3-image`, `openai/gpt-image-2`: "$0.00126066 / GPU-second".
- Seedance 2.5: about $15.30 per 1M tokens.
- Kling: 29.54 credits per Kling credit.

### 5.4 Limits and retention [Verified: router `limitations.md`, `queue.md`, `reference.md`, Comfy blog via the older note]

- There is no progress, streaming or preview while a Router call runs. Show an indeterminate state.
- Sync deadline: 10 minutes (`504 deadline_exceeded`). The SDK default `timeoutMs` is 20 minutes so that it can collect.
- Request body cap: 100 MiB, which is about 75 MB of media before base64. Providers often have lower caps; Google allows 20 MB inline.
- Queued results are "kept for 24 hours after it completes", then the API answers `410`.
- Comfy-hosted result URLs last at most 24 h for `bfl/*`, ByteDance video and `xai/*`, and **12 h for `minimax/*`**. Veo `gcsUri` lasts 24 h. Other models return provider URLs with the provider's expiry. Download at once.
- Partner Node and Router inputs and outputs are deleted after 24 h. [Verified: docs `support/data-retention.md` for Partner Nodes]
- Rate limits: `429 concurrency_limit_exceeded` and `429 rate_limited`. Per-tier numbers are not published. **[Unverified]**
- Status: the API v2 overview still says "Router is not generally available yet". Callers not yet enabled get `403 not_enabled` (`NotEnabled`). The queue needs a workspace-scoped key.
- Router needs **credits only, no subscription**. An unfunded workspace gets `402 insufficient_credits` before body validation.

---

## 6. Contest rules: which Developer Platform parts count

[Verified: comfy.org/open-source-higgsfield.md, blog post 2026-10-15]

- Requirement, verbatim: "Your work must be built using the Comfy Developer Platform (Comfy API, Comfy Router, and/or Comfy SDK)." Nothing more specific is published. The blog post defers to the competition page.
- So the **Comfy SDK alone qualifies by the letter of the rule**. That includes the SDK against self-hosted ComfyUI through comfy-api-proxy, and against Comfy Cloud. Comfy Cloud and comfy-api-proxy are not named. Running workflows on Cloud happens through the SDK or API v2, so that counts as "Comfy SDK". **[Inference. Not confirmed by the organizers.]**
- Open Weights Only (RTX 5090): "No partner nodes or APIs, open-weights models only." Router and Partner Nodes are excluded there. Whether "APIs" also excludes Comfy Cloud through the SDK is ambiguous. **[Unverified: ask the organizers.]** Other entries "may use partner models".
- Bonuses, each needing the named model as "the core model in the workflow":
  - LTX VFX: $2,000 cash.
  - FLUX: $1,000 / $500 / $250 in FLUX API credits. "FLUX 3 must be the core model."
  - MiniMax H3: $1,000 in API credits.
  - An entry can win a main prize plus a bonus.
- Other requirements:
  - The repo needs an open-source license and local run instructions.
  - A demo video of at most 2 minutes. "we're judging the work, not your video editing".
  - A try-it link is optional but "strongly encouraged".
  - A social post with #OpenSourceHiggsfield.
  - Entries must be lawful and SFW, with no unlicensed IP or likenesses.
  - One submission per person.
  - Deadline **October 30 · 9am PT**. Winners on 11/6.

---

## 7. Gaps and unverified items

- No SDK call was executed. Running one needs Node 22, and this machine has 20.9.0. A paid target was out of scope. The proxy's no-GPU demo (`demo/fake_comfyui.py`) could prove the path for free.
- Whether a Router-only account (credits, no plan) can use `client.assets` for upload URLs.
- Router concurrency and rate numbers per tier. Whether this account's Router access is enabled (`NotEnabled`).
- The minimum ComfyUI version that comfy-api-proxy 0.1.6 needs.
- Label (`metadata`) support on the proxy: the two READMEs conflict.
- RunPod's 100 s limit on large downloads through the HTTP proxy.
- When FLUX 3 Klein and Qwen-Image 2.1 will land on Comfy Cloud. Both are on HF but not on Cloud today.
- Whether "Open Weights Only" allows open models run on Comfy Cloud through the SDK.

---

## Decisions this unblocks

### A. SDK or raw HTTP: **use `@comfyorg/sdk@^0.5` for workflows and Router. Use raw `fetch` only where the SDK has a gap.**

- Why the SDK:
  - It already does the hard parts: asset hash/dedup/upload and `core/ASSET` substitution, idempotent submit with a queue-full backoff, poll-authoritative waits, SSE with a polling fallback, typed errors, range-aware downloads, and Router collect-after-timeout.
  - It is ESM, has 3 small deps (zod already present), and is MIT. It is also the clearest proof of "built with the Comfy SDK" for the contest.
- Raw `fetch` only for:
  - Router `POST …/estimate` (no SDK method in 0.5.0).
  - Anything the SDK hides that we later need.
- Keep everything in `server/core.js`. The SDK is Node-only.
- Wrap construction in one `comfyClient({ baseUrl, apiKey })` factory that scopes `COMFY_BASE_URL`, and always pass `apiKey` explicitly.
- Prerequisite: **upgrade the dev machine to Node 22**. The repo already declares `>=22`, but local Node is 20.9.0.
- Keep the current native `/prompt` + `/history` `runComfy()` as a fallback adapter for a bare local ComfyUI without the proxy. That keeps first run free of a Python sidecar. Make "local via proxy" the default path in docs and the demo.

### B. Should the RunPod pod run comfy-api-proxy? **Yes.**

- Run `comfy-api-proxy start --comfyui http://127.0.0.1:8188 --host 0.0.0.0 --port 8189 --token $PROXY_TOKEN --comfyui-base-dir /workspace/ComfyUI --state-dir /workspace/proxy-state`.
- Expose only 8189 as an HTTP port. Point the engine at `https://<POD_ID>-8189.proxy.runpod.net` with the token as `apiKey`.
- This makes Cloud, pod and local one code path with only `{ baseUrl, apiKey }` changing. It also gives auth in front of a GPU that raw ComfyUI leaves open. `--comfyui-base-dir` also lets us push LoRAs into the pod through `POST /api/v2/assets`.
- Design for RunPod's 100 s Cloudflare limit. Treat SSE as best-effort and polling as truth; the SDK already does this.

### C. Cheapest proof workflow for Comfy Cloud

1. **Prove the code path for $0 first.** Run the 1.9 example against local ComfyUI + `comfy-api-proxy`, or the proxy's fake ComfyUI for CI. The code is identical. Only `TARGET_URL` changes.
2. **Then one Cloud run.** Fixed cost is the **Standard plan, $20 for one month**, because API access needs a paid plan and the free tier is excluded. Workflow: the existing `public/workflows/image_flux.json` with `ckpt_name` swapped to `flux1-schnell-fp8.safetensors`, `steps: 4`, 1024×1024, batch 1. Every file in it is on Cloud today.
   - Expected marginal cost: well under 10 credits, about $0.05. This assumes under 30 s of GPU at 0.266 credits/s. **[Inference]**
   - Report it from the run's `job.metrics` (`execution_ms`) in the PR.
3. If the issue wants a sponsor-model proof instead, the next cheapest options are:
   - FLUX.2 Klein 4B on Cloud. It needs a new graph, and FLUX 3 Klein is not on Cloud yet.
   - LTX-2.5 distilled at low resolution and short length. It qualifies for the LTX bonus, but costs more GPU time.
4. A Router proof needs no subscription, only credits. The cheapest listed calls:
   - `openai/gpt-image-2` on the WaveSpeed leg: $0.01 per low/1K image (`modelProvider: 'wavespeed'`).
   - `qwen/qwen-image-3.0` at $0.0429.
   - Veo 3.1 Lite at $0.03/s.
   - Call `/estimate` first. If it answers `403 not_enabled`, rely on the published rate card.

---

## Sources

Docs pages are also available raw at `<url>.md`.

**npm and code**
- npm registry: https://registry.npmjs.org/@comfyorg/sdk (tarball 0.5.0 read in full)
- TypeScript SDK repo: https://github.com/Comfy-Org/comfy-typescript-sdk
- Python SDK repo: https://github.com/Comfy-Org/comfy-python-sdk
- PyPI: https://pypi.org/project/comfy-sdk/
- Proxy repo: https://github.com/Comfy-Org/comfy-api-proxy (README, `src/comfy_api_proxy/cli.py`, `app.py`)
- Proxy on PyPI: https://pypi.org/project/comfy-api-proxy/
- ComfyUI `server.py` (the `/api/jobs/{job_id}/cancel` route): https://github.com/comfyanonymous/ComfyUI

**Comfy API v2 and SDK docs**
- SDKs: https://docs.comfy.org/development/api-development/sdks
- API v2 overview: https://docs.comfy.org/api-reference/v2/overview
- v2 OpenAPI: https://docs.comfy.org/openapi-v2.yaml
- v1 Cloud OpenAPI: https://docs.comfy.org/openapi-cloud.yaml
- Live event stream (SSE): https://docs.comfy.org/api-reference/v2/jobs/live-event-stream-sse
- API proxy: https://docs.comfy.org/development/comfyui-server/api-proxy
- Self-hosting: https://docs.comfy.org/development/deploy/self-hosting
- Running workflows: https://docs.comfy.org/development/run-workflows/overview

**Comfy Cloud docs**
- Cloud quickstart: https://docs.comfy.org/development/deploy/cloud
- Cloud usage and limits: https://docs.comfy.org/development/deploy/cloud-usage
- Comfy API deployments: https://docs.comfy.org/development/serverless/overview
- Comfy Cloud: https://docs.comfy.org/get_started/cloud
- Import models: https://docs.comfy.org/cloud/import-models
- Data retention: https://docs.comfy.org/support/data-retention

**Comfy Router docs**
- Quickstart: https://docs.comfy.org/development/comfy-router/quickstart
- Limitations: https://docs.comfy.org/development/comfy-router/limitations
- Reference: https://docs.comfy.org/development/comfy-router/reference
- Billing: https://docs.comfy.org/development/comfy-router/billing
- Pricing: https://docs.comfy.org/development/comfy-router/pricing
- Models: https://docs.comfy.org/development/comfy-router/models
- Providers: https://docs.comfy.org/development/comfy-router/providers
- Queue: https://docs.comfy.org/development/comfy-router/queue
- MiniMax H3 model page: https://docs.comfy.org/development/comfy-router/models/minimax/minimax-h3/code
- Router OpenAPI: https://docs.comfy.org/router-openapi.yaml

**Comfy Cloud live data (probed 2026-10-16)**
- Model folders: https://cloud.comfy.org/api/experiment/models
- Folder contents: https://cloud.comfy.org/api/experiment/models/{folder}

**comfy.org pages**
- Pricing: https://comfy.org/pricing.md
- Supported nodes: https://comfy.org/cloud/supported-nodes.md
- Developer Platform: https://comfy.org/platform.md
- Contest page: https://comfy.org/open-source-higgsfield.md

**Support articles and blog posts**
- Custom nodes on Cloud: https://support.comfy.org/articles/6791455062-custom-nodes-on-cloud
- Contest post: https://blog.comfy.org/p/higgsfield-promised-to-open-source
- Cloud GPU rate post: https://blog.comfy.org/p/comfy-cloud-new-features-and-pricing
- Unified credit system post: https://blog.comfy.org/p/comfy-cloud-update-unified-credit-system

**Other**
- RunPod expose ports: https://docs.runpod.io/pods/configuration/expose-ports
- Hugging Face API: https://huggingface.co/api/models?author=black-forest-labs (also `Qwen`, `Lightricks`, `MiniMaxAI`, `ResembleAI`)
