# The hosted demo runs on visitor keys kept in the tab

Status: proposed (2026-10-25), needs an owner decision. Issue #13.

The competition entry may link a try-it demo. ComfyField today is local-first: the server saves keys in `.comfyfield/keys.json` and only answers loopback requests (`server/local-access.js`). A public copy of that server would let anyone spend whatever keys it holds, so the demo cannot simply be `npm start` on a public host.

Proposal: host the production build as static files, plus a small stateless relay for the provider routes. A visitor pastes their own key in Connections; the demo keeps it in `sessionStorage` for that tab only and sends it with each request in a header. The relay forwards the call to the provider and drops the key when the request ends: no disk, no database, no logs of headers or bodies. Closing the tab forgets the key. With no key, the demo is a browse-only tour with mock results labelled as mock, so judges still see every page.

Suggested host: Cloudflare Pages for the build and a Worker for the relay (free tier, per-IP rate limiting, no server to patch). Vercel or Netlify with an edge function work the same way.

## Limits

Abuse and spend limits for the relay. The numbers are starting values for the owner to change:

- Visitor keys only. The demo holds no key of ours, so a visitor can only spend their own credit.
- Routes: generation, upload and status routes for fal, Comfy Router, Comfy Cloud, Google and ElevenLabs. No Pod or RunPod routes, no MCP, no CLI, no agent harness, no Flows saved on the server.
- Rate: 30 requests per minute and 300 per day per IP, and at most 2 runs in flight per tab.
- Size: uploads up to 25 MB, request bodies up to 1 MB besides uploads.
- Cost: the demo shows the estimate before each run, as the app does, and asks again above $1 per run.
- Logs: status code, route and duration only. Never headers, bodies, prompts or media URLs.
- Kill switch: one environment flag turns the relay off and leaves the browse-only tour up.

## Considered options

- A capped demo key of ours behind the relay (for example $20 a day, cheapest models only: Flux schnell, Veo 3.1 Lite, LTX). Easier for judges, who need no key. Rejected for now: the key sits on our server, the cap is the only line against abuse, and a drained budget turns the demo off mid-judging. Revisit if the owner wants a no-key path; it then needs a hard provider-side spend limit, not only ours.
- Call providers straight from the browser with no relay. Rejected: fal's own guidance is to proxy browser calls rather than expose a key to page scripts, cross-origin support on Comfy Cloud is not confirmed, and every provider route in `server/core.js` would need a browser copy.
- Store visitor keys server-side per session. Rejected: the issue rules it out, and it gives us a key store to secure.
- No demo, video only. Kept as the fallback if the owner declines both options.
