# Working on ComfyField

Read this before picking up an issue. It applies to people and to coding agents (Claude Code, Codex, Cursor).

## What we are building

An open-source, local-first creative studio: images, video and audio from any model with your own keys. It has lots of features without clutter. The thesis decides most design questions: one composer, everything else is a format or a flow, and detail stays one click away.

Competition: Open Source Higgsfield, submissions close 10/30 9am PT. Entries must use the Comfy Developer Platform (Comfy Router, Comfy API v2 or the Comfy SDK).

## Run it

```bash
npm install
npm run dev            # app + local API on one port
node scripts/flow-checks.mjs   # Flows engine invariants
npx vite build         # must pass before any PR
```

Keys go in Connections (saved to `.comfyfield/keys.json`, gitignored) or `.env` (see `.env.example`).

## Map

- `server/core.js`: provider logic (fal, Google, ElevenLabs, ComfyUI), shared by the app, the CLI and the MCP server
- `server/plugin.js`: HTTP routes inside the Vite dev server
- `server/mcp.js`, `bin/comfyfield.js`: MCP server and CLI
- `shared/mapping.js`: maps composer settings onto each model's inputs, and cost estimates
- `src/pages/`: Create, Flows, Models, Library, Connections
- `src/lib/flowEngine.js`: Flows execution rules (see below)
- `src/lib/recipes.js`: formats (being renamed from recipes)
- `public/workflows/`: ComfyUI workflows in API format with `{{placeholders}}`

## How we work

1. Pick an issue labelled `agent-ready` in your area. Assign yourself.
2. One branch per issue: `issue-<number>-<short-name>`. One PR per issue, linked with `Closes #<number>`.
3. A PR is ready when:
   - `npx vite build` and `node scripts/flow-checks.mjs` pass (CI runs both)
   - every acceptance criterion in the issue is met
   - the PR shows a screenshot or short GIF of the change working. No placeholders: if something is not real yet, say so in the PR
4. Do not push to `main`. One person merges.
5. Paid generations: only when the issue says `needs-keys` and gives a budget. Use the cheapest model that proves the path (Flux schnell, Veo 3.1 Lite, LTX). Report the estimated spend in the PR. Never read keys from your shell environment for tests unless the issue says so.
6. Never commit keys, `.comfyfield/` or `.env`.

## Design rules

- Sentence case everywhere. Never ALL CAPS, no `text-transform: uppercase`.
- Light glass UI: tokens in `src/styles.css` (`--blue`, `--glass`, `--spring`). Indigo pill buttons are `.btn-blue`.
- Motion uses the existing `rise` / `pop` keyframes and `--spring` easing, and must respect `prefers-reduced-motion`.
- No emoji in the UI. No new tabs: new features become formats, flow nodes or Library types.
- Copy names things the way users see them, active voice, short.

## Code style

- React 18 + JSX, plain CSS, no TypeScript. 2-space indent, no semicolons.
- Comments only where the why is not obvious.
- Keep provider logic in `server/core.js` so the app, CLI and MCP stay in sync.

## Flows rules (from PatchWork's WORKFLOW-SPEC)

- Approve nodes are gates: nothing passes until the user clicks Send.
- Send never triggers upstream; it runs only downstream nodes without output.
- Model nodes with output never re-run except through their own Rerun.
- Run fills gaps only; Regenerate all wipes and re-runs.
- Any change to `flowEngine.js` needs a matching check in `scripts/flow-checks.mjs`.
