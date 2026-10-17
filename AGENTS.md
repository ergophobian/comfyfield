# Working on ComfyField

Read this before picking up an issue. It applies to people and to coding agents (Claude Code, Codex, Cursor).

## What we are building

An open-source, local-first creative studio: images, video and audio from any model with your own keys. It has lots of features without clutter. The thesis decides most design questions: one composer, everything else is a format or a flow, and detail stays one click away.

Competition: Open Source Higgsfield, submissions close 10/30 9am PT. Entries must use the Comfy Developer Platform (Comfy Router, Comfy API v2 or the Comfy SDK).

Current phase: match Higgsfield screen by screen first, then improve on it. Its structure, layouts and flows are documented with screenshots in `research_notes/Higgsfield feature audit/`. Copy the structure, not the brand: our theme, our copy, our media. Order of work is UI, then UX, then the engine, so most pages show "Not wired yet" for now.

## Run it

```bash
npm install
npm run dev            # app + local API on one port
node scripts/flow-checks.mjs   # Flows engine invariants
node scripts/theme-check.mjs   # theme tokens only, no raw colors or sizes
npx vite build         # must pass before any PR
```

Keys go in Connections (saved to `.comfyfield/keys.json`, gitignored) or `.env` (see `.env.example`).

## Map

- `server/core.js`: provider logic (fal, Google, ElevenLabs, ComfyUI), shared by the app, the CLI and the MCP server
- `server/plugin.js`: HTTP routes inside the Vite dev server
- `server/mcp.js`, `bin/comfyfield.js`: MCP server and CLI
- `shared/mapping.js`: maps composer settings onto each model's inputs, and cost estimates
- `src/lib/tools.js`: every tool page (name, nav menu, route, badge) and the open-weight models per kind. The top nav and Explore read from it
- `src/App.jsx`: route table, and the shared format sheet via `useApp().openFormat` (`src/lib/appContext.js`)
- `src/pages/`: one page per tool (generators, studios, apps), plus Flows (Canvas), Library (Assets), Models and Connections
- `src/lib/flowEngine.js`: Flows execution rules (see below)
- `src/lib/formats/`: formats as data (apps, presets, effects, looks, jobs). `index.js` holds categories, app hubs and helpers. `src/lib/recipes.js` keeps the teammate's fal recipes
- `public/workflows/`: ComfyUI workflows in API format with `{{placeholders}}`

## How we work

1. Pick an issue labelled `agent-ready` in your area. Assign yourself.
2. One branch per issue: `issue-<number>-<short-name>`. One PR per issue, linked with `Closes #<number>`.
3. A PR is ready when:
   - `npx vite build` and `node scripts/verify.mjs` pass on your machine before you push
   - every acceptance criterion in the issue is met
   - the PR shows a screenshot or short GIF of the change working. No placeholders: if something is not real yet, say so in the PR
4. Do not push to `main`. One person merges.
5. Save CI minutes. Commit as often as you like, but push when the work is ready for review, not after every commit. Open the PR as a draft while you work: drafts skip CI. Mark it ready for review to run the Linux checks. Add the `full-ci` label only when a change could break on Windows or macOS (paths, shell, ffmpeg, Chrome); main always runs all three.
6. Paid generations: only when the issue says `needs-keys` and gives a budget. Use the cheapest model that proves the path (Flux schnell, Veo 3.1 Lite, LTX). Report the estimated spend in the PR. Never read keys from your shell environment for tests unless the issue says so.
7. Never commit keys, `.comfyfield/` or `.env`.

## Design rules

- Sentence case everywhere. Never ALL CAPS, no `text-transform: uppercase`.
- Light glass UI: every color, size, radius, blur and duration is a token in `:root` in `src/styles.css`. Use the token, never a raw value; `theme-check` enforces it. Indigo pill buttons are `.btn-blue`.
- Motion uses the existing `rise` / `pop` keyframes and `--spring` easing, and must respect `prefers-reduced-motion`.
- No emoji in the UI. Mirror Higgsfield's structure: a new feature becomes a page listed in `src/lib/tools.js`, a format, a flow node or a Library type.
- One breakpoint, 720px. Every page works at 390px wide.
- Copy names things the way users see them, active voice, short.

## Code style

- React 18 + JSX, plain CSS, no TypeScript. 2-space indent, no semicolons.
- Comments only where the why is not obvious.
- Keep provider logic in `server/core.js` so the app, CLI and MCP stay in sync.

## Format file spec

Formats are plain data exported from `src/lib/formats/*.js` or `src/lib/recipes.js`.
`defineFormat` in `src/lib/formats/spec.js` migrates the existing single-step entries
without removing their copy, controls, prompt templates or provider settings.

- `id`: stable unique slug. `name`: sentence case display name. `job`: what the user gets.
- `shape`: `preset`, `tool`, `chain` or `pipeline`.
- `inputs`: typed slots with unique `id`, `type`, `label`, optional `optional`, `default`
  and `when: [choiceId, optionId]`. Types: `text`, `longtext`, `choice`, `count`,
  `image`, `video`, `audio`, `draw`, `mask`, `face`, `crop`, `character`, `product`, `brand`, `voice`.
  Media values are `{ url, name, ratio }`. Choices have `options: [{ id, label,
  text?, params? }]`; counts have numeric `options`. `field` binds a media slot to
  a named fal input. A UI widget alone does not make an unsupported slot runnable.
- `writer` (optional): prompt-writer instructions. The runner requires an injected
  `writePrompt({ instructions, inputs, format }) -> Promise<string>` when present.
  It compiles to a native Writer node. The UI injects the `/api/prompt` client;
  output stays editable and rendering waits for Send. Explicit steps use
  `{ id, type: 'writer', instructions, target? }`. Instructions pass through unchanged.
- `steps`: ordered steps with unique `id`, a catalog `model` id, or `provider: 'fal'`
  plus `endpoint`, or `provider: 'comfy'` plus bundled `workflow`. Model steps have
  `kind`, `prompt` (a `{slotId}` template), raw `params`, optional `settings`
  (`aspect`, `duration`), `takes` and `bindings: { modelField: slotId }`.
  Bindings also accept dotted properties (`image.maskUrl`, `video.trim.start`,
  `crop.box`) and arrays of paths for ordered reference images. Full widget values
  remain in `opts.inputs`; trim and crop remain metadata unless the target accepts them.
  A step may select `targets` by the choice slot named in `targetInput`; every
  alternative is schema-checked, including the Seedance fal and Router targets.
  Choices interpolate their `text` or `label` and merge their raw `params`.
  A step's `from: [stepId]` overrides the default previous-step dependency;
  `from: []` starts an independent branch. `{ id, type: 'approve', from: [...] }`
  inserts an engine approval gate. Image outputs can feed the next fal model.
  Comfy image uploads work on Local and Cloud, including `ltx_i2v` and `h3_i2v`.
  Other media chaining remains limited to the supported node/provider contracts.
- `outputs`: `[{ step: stepId, kind: 'image' | 'video' | 'audio' | '3d' }]` selects
  the result steps. Every executed generation also persists through the Library
  adapter, including intermediate images. `cover`: existing gradient or media URL.

Example (existing display fields such as `kind`, `category`, `blurb`, `settings`
and `runsOn` remain supported):

```js
{
  id: 'photo-cutout', name: 'Photo cutout', job: 'Remove a photo background',
  shape: 'tool', kind: 'image', cover: covers.sky,
  inputs: [{ id: 'image', type: 'image', label: 'Photo' }],
  steps: [{ id: 'cutout', provider: 'fal', endpoint: 'fal-ai/bria/background/remove', kind: 'image', params: {} }],
  outputs: [{ step: 'cutout', kind: 'image' }],
}
```

`compileFormat(format, values)` produces a small flow. `runFormat(format, values,
{ run, writePrompt?, onChange?, concurrency? })` uses the existing engine and returns
`{ flow, engine, results(), send(id), sendWriter(id) }`. Review edits use
`engine.editWriter(flow, id, text)`. The injected `run(model, options, metadata)`
must resolve to files and save them to the Library. The UI uses `gens.generateFormat`
with the same queue and storage as Create. Engine Run, Rerun and Send rules apply.

Run `node scripts/format-check.mjs` and `node scripts/format-runner-checks.mjs` before
submitting format changes; both run in CI without network access. Public fal input
schemas are snapshots of the metadata returned by `/api/fal/schema`, with public
Router input snapshots from `docs.comfy.org/router-schemas/`; refresh with
`node scripts/format-schemas.mjs` (public metadata GETs only, no keys or generations).
Bundled Comfy placeholders must match the snapshot. Missing workflows remain in
`allFormats` and are reported as hidden with reasons. Existing target/schema
regressions fail the check. `formats` contains validated gallery entries;
`formatById` also retains planned controls for studio scaffolds. Create's camera
preset picker intentionally reads prompt text from `allFormats` without executing
those planned workflows.

`node scripts/format-ui-check.mjs` serves the production build (run `npx vite build`
first) and uses local headless Chrome (`CHROME_PATH` overrides
discovery) and a separate mock API, without loading provider routes or keys. It
checks the app page, shared sheet, Library persistence, Create generation and
presets, and the 390px layout. It runs on all three CI operating systems and writes labeled mock screenshots
under `research_notes/format-runner/`. `node scripts/verify.mjs` discovers and runs
every `scripts/*-check*.mjs` check, including browser fixtures. All run in the
Windows/macOS/Linux CI matrix with Chrome installed through setup-chrome.

## Flows rules (from PatchWork's WORKFLOW-SPEC)

- Approve nodes are gates: nothing passes until the user clicks Send.
- Send never triggers upstream; it runs only downstream nodes without output.
- Model nodes with output never re-run except through their own Rerun.
- Run fills gaps only; Regenerate all wipes and re-runs.
- Any change to `flowEngine.js` needs a matching check in `scripts/flow-checks.mjs`.
