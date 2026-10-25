# API keys only, no subscription logins

Status: proposed (2026-10-25), needs owner sign-off. Issue #39.

People ask to use the subscriptions they already pay for (ChatGPT, Kling, Google Flow) instead of API keys. ComfyField connects with API keys only, entered in Connections or `.env`. We do not build sign-in with a consumer subscription, and we park the question until after the competition.

Why:

- Terms of service. Consumer plans are for use in the vendor's own apps. Driving them from another app usually means reusing a browser session or a private endpoint, which the terms tend to forbid. That puts the person's account at risk of a ban, and puts the project at risk of a takedown.
- Fragility. Private endpoints and web sessions change without notice. An API has versions, published schemas and error codes, which `shared/mapping.js` and the format checks rely on.
- Keys. ComfyField stores keys locally and never on our server. A subscription login would mean holding session cookies or passwords, a bigger secret to guard.
- Cost. API calls show a price before the run (`src/lib/cost.js`). Subscription credits have no such estimate.

Revisit after the competition, one vendor at a time, only where the vendor offers an official OAuth or partner API that allows third-party apps. That would be a new ADR.

## Considered options

- Browser-session reuse (copy cookies or tokens from a signed-in tab). Rejected: against most terms, breaks often, and asks the person to hand us a full account session.
- Automating the vendor's web app in a headless browser. Rejected for the same reasons, and slow.
- Official OAuth where it exists. Not rejected; deferred until after the competition, because no listed vendor offers it for generation today as far as we know, and it needs a per-vendor review.
