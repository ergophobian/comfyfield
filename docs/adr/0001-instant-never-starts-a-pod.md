# Instant never starts a Pod

Status: accepted (2026-10-20). Issue #121.

Instant means pay per run on Comfy Cloud, with nothing left running. A run Comfy Cloud cannot take on Instant fails with `needs_pod` and the server's message. The person switches the generation type to Session in the top bar; ComfyField does not do it for them, with Pod auto-start on or off.

Pod auto-start applies to Session only: there, a Generate click that needs a Pod starts, resumes or keeps one sized for the workflow.

The generation type is the one the top bar shows (`runTypeOf`): with nothing picked and no Pod alive, that is Instant.

## Considered options

- Auto-start on Instant too, with a notice that a Pod started and the type changed. Rejected: it turns a pay-per-run choice into a billed Pod without asking.
- On Instant, ask once through the start sheet even with auto-start on. Rejected: the person already chose Instant; the top bar is where they change it.
