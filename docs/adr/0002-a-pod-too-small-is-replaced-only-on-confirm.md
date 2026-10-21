# A Pod too small for a run is replaced only when the person confirms

Status: accepted (2026-10-21). Issue #122.

When a Session run needs more GPU memory or another GPU architecture than the running Pod has, the server fails it with `pod_too_small` and a `fit` (the sizes and GPU families, nothing else). The app then opens the start sheet as "Replace your Pod": it shows the Session tiers sized for the workflow, as a new start does. On confirm it terminates the Pod, starts one sized for the workflow (`podAction('start', { workflow, tier })`) and runs the take again. Cancel leaves the Pod alone and fails the take.

The sheet asks with Pod auto-start on or off. Auto-start's consent covers starting, resuming or keeping a Pod, which add to what runs. Replacing ends a billed Pod, its runs in progress and its disk, so it needs its own yes. On Instant nothing changes: Instant never uses a Pod (0001), so it never sees `pod_too_small`, and the app does not ask there.

## Considered options

- With auto-start on, replace the Pod without asking. Rejected: it ends other runs and deletes downloaded models on a Generate click.
- Keep the plain error and point to the Pod chip. Rejected: with a Pod running and billed, that is a dead end.
