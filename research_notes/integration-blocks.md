# Blocks 1–6 integration

Integration branch: `integrate/blocks`. All merges use `--no-ff`, in this order:

1. `lane/runner` (#57)
2. `lane/writer` (#53)
3. `lane/widgets` (#56)
4. `lane/stitch` (#55)
5. `lane/comfy` (#54)
6. `lane/harness` (#58)
7. `agent/gap-audit` (#45)
8. `agent/prompts` (#52)

## Conflict resolutions

Runner, Writer and both research merges had no conflicts. The remaining conflicts
were resolved as follows; no lane's test set was discarded.

| Merge | Conflicted files | Resolution |
| --- | --- | --- |
| Widgets | `scripts/flow-checks.mjs` | Retain all Writer and widget invariants. |
| Widgets | `src/components/flow/Panel.jsx`, `nodes.jsx` | Include Writer review plus all four widget editors and node renderers. |
| Widgets | `src/lib/flowEngine.js` | Preserve Writer's held text and structured widget values through approval gates. |
| Widgets | `src/lib/flowStore.js`, `src/pages/Flows.jsx` | Union defaults, labels, Add menu and connection rules. |
| Widgets | `src/lib/recipes.js` | Keep format migration and widget option serialization imports. |
| Stitch | `.github/workflows/ci.yml`, `scripts/flow-checks.mjs` | Keep every check; executable nodes include Model, Writer and Stitch. |
| Stitch | `server/core.js`, `server/plugin.js` | Keep all audio/video MIME types, Stitch endpoints, widget upload limits and shared byte-range serving. Repair the stale Stitch body-reader call by sharing the uploader, including audio. |
| Stitch | `src/components/flow/Panel.jsx`, `nodes.jsx` | Add Stitch alongside Writer and widget editors/renderers. |
| Stitch | `src/lib/flowEngine.js`, `flowStore.js` | Combine execution adapters, output preservation, Writer review gates and Stitch planning. |
| Stitch | `src/lib/useGenerations.js` | Retain both format execution and exact-preview Library export ingestion. |
| Stitch | `src/pages/Flows.jsx`, `src/styles.css` | Union runnable node types, minimap entries and editor tokens. |
| Comfy | `server/core.js` | Combine Router input mapping with the Stitch import. |
| Comfy | `shared/mapping.js` | Keep image/duration defaults plus explicit runner parameter and field overrides. |
| Harness | `.github/workflows/ci.yml` | Keep agent and Writer checks; replace partial lists with discovery of all 14 check scripts on all three operating systems. |
| Harness | `server/core.js`, `src/lib/providers.js` | Keep Router mapping, shared fal image endpoint routing and Stitch. Forward structured options and multiple references through server generation. |
| Harness | `server/mcp.js` | Register Stitch through the harness's shared validated tool registry. Both tool families appear in the actual CLI stdio server. |
| Harness | `server/plugin.js` | Keep agent routes plus uploader and range-serving imports. |
| Harness | `src/lib/flowStore.js` | Use server-owned actions/state; add Writer edit/Send actions to its proxy and inject Writer/Stitch adapters on the server. |
| Harness | `src/pages/Flows.jsx` | Preserve ready-state/error handling and all runnable node types; Writer actions use the server. |
| Harness | `src/styles.css` | Keep all widget, Stitch and agent tokens/styles. |

`package.json` and the lockfile merged without textual conflicts. `npm install`
normalized the lockfile with both `ffmpeg-static` and `@comfyorg/sdk` retained.
Two conflict blocks initially remained after an encoding error in the resolution
script; both were corrected in the integration change before validation/push.

## Interfaces

- Formats compile Writer steps into native Flow engine nodes. The browser injects
  `writePrompt` through `/api/prompt` and `core.writePrompt`. Explicit and shorthand
  writers hold output for editing and Send in both format pages and shared sheets.
- Binding paths map structured widget values to provider inputs. Inpaint uses
  Flux Fill's `image_url` and `mask_url`; face swap uses Nano Banana's ordered
  photo/selected-face `image_urls`. Crop boxes and video trim selections remain
  structured metadata and map to declared fields on models that accept them.
  They do not silently encode a cropped or trimmed source.
- The validator recognizes all five bundled Comfy workflows and checks actual
  placeholders. Local/Cloud execution handles image upload. The 195 existing
  LTX/H3 formats become visible. LTX display copy correctly names Video 2B.
- The 45 effect specs are imported from the research JSON without rewriting
  `writer_instructions`. Each is a chain with Writer review, LTX by default and
  selectable Seedance fal/Router alternatives. Covers remain gradients.
- The Router integration in #54 exposes image/video models and normalizes media,
  with no text-model contract. Writer's clear 501 fallback remains. A live catalog
  needs a key; no claim is made that Router has no other models.
- Server flow validation, browser migration, MCP schemas and persisted actions
  accept Writer, Stitch and all widget node types. Agent flow plans include unknown
  Writer cost and require approval before writing. Writer review still holds the
  downstream render. Stitch is local and preview-first.

Current inventory: **252 runnable of 479 total; 227 hidden**. This is 10 original
recipes + 195 LTX/H3 formats + 2 widget tools + 45 effect chains. All original
catalog entries remain present. Hidden entries print their missing workflows.

Schema metadata was fetched using credential-free public GETs only:
[Flux Fill](https://fal.ai/models/fal-ai/flux-pro/v1/fill/api), the public fal
OpenAPI endpoint, and the
[Router Seedance schema](https://docs.comfy.org/router-schemas/byteplus/dreamina-seedance-2-5-260628.json).
The [Router catalog contract](https://docs.comfy.org/development/comfy-router/discover-models)
requires a key. No generation API was called. Spend: **$0**.

## Verification

Passed locally on Windows with Node 24:

- `npx vite build` (existing large-bundle advisory)
- `node scripts/verify.mjs`: all 14 scripts below passed
- `node bin/comfyfield.js --help`
- `git diff --check`

| Script | Result |
| --- | --- |
| `flow-checks.mjs` | 22 engine invariants |
| `theme-check.mjs` | Theme checks pass |
| `format-check.mjs` | 479 entries; 252 runnable, 227 hidden with reasons |
| `format-runner-checks.mjs` | 31 existing recipe payload cases, approval/batching, concurrency, validation, Writer handoff and errors |
| `format-ui-check.mjs` | Shared sheet, Library reload, Create generation/feed/presets, effect Writer edit/Send, 390px and hidden routes |
| `writer-check.mjs` | 6 mocked request/route/error/fallback checks |
| `widget-checks.mjs` | Geometry, values, limits including exactly 200 MiB video, JSON/raw uploads and byte ranges |
| `widget-browser-checks.mjs` | Real local synthetic uploads, mask pixels, face selection, trim/poster, crop, keyboard/touch, four server-backed input nodes and 390px |
| `stitch-checks.mjs` | System/bundled ffmpeg, decoded pixels/audio, captions, clips/music, CLI, MCP, HTTP, preview/export/Library |
| `comfy-checks.mjs` | 10 mocked Router/Local/Cloud SDK checks |
| `comfy-format-check.mjs` | LTX/H3 graph placeholders, links and contracts |
| `agent-checks.mjs` | 13 mocked adapter, SSE/MCP, approval, persistence, stale-plan and origin checks |
| `agent-ui-checks.mjs` | Desktop/390px chat, approval, presence, stop, conflict recovery and missing-agent setup |
| `integration-checks.mjs` | 45 effects × 3 render choices; widget mappings; persisted Writer edits; downstream Stitch; real CLI MCP tool discovery; agent Writer approval |

All checks run in CI on Windows, macOS and Linux. Browser checks start isolated
fixtures, use separate Chrome profiles/caches and never use live providers. The
format and agent UI checks serve the production build to avoid optimizer reloads;
run the build before these checks. Browser transport uses the test-only ws
dependency, with bounded protocol waits and mock-keychain Chrome flags.
Synthetic artifacts are labeled mock media. New integration screenshots:

- [Effect prompt review at desktop width](format-runner/mock-writer-review-desktop.png)
- [Effect prompt review at 390px](format-runner/mock-writer-review-mobile.png)
- [Inpaint widget at desktop width](../docs/screenshots/widgets/inpaint-desktop.png)
- [Stitch editor](../docs/stitch/desktop.png)

## Unverified

Live Google prompt quality, actual model outputs, Router/Cloud availability and
billing, Cloud node/checkpoint versions, live Claude/Codex subscription sessions,
and physical touch/assistive-technology behavior remain unverified. MP4/MOV codec
support varies by browser; WebM fixtures were exercised. Long Stitch projects and
non-Latin captions remain untested. Agent session history is in memory; Flow
definitions/results persist. The LTX graph is Video 2B, not LTX 2.5. No example
media was invented or generated. The 227 missing-workflow formats remain hidden.

Blocks #46–#51 meet their acceptance criteria with mocked/local verification;
their specified live-key follow-ups remain separate. No merge to main is made.
