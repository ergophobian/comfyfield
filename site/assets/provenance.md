# Launch assets

All five WebP images were copied unchanged from `docs/screenshots/readme/` in the ComfyField launch README branch, originally from draft PR #133. That PR records real app captures at 1440px, started with an empty data folder and no keys. No mock fixtures or paid-generation results are presented here.

- `create.webp`: image composer, prompt editing before generation; hero.
- `batch.webp`: batch prompt editing before generation.
- `flows.webp`: Image then animate starter flow, before execution.
- `library.webp`: empty Assets page.
- `skills.webp`: agent setup interface; source MCP configuration in the project README supersedes the package install example in the capture.

Colors, surfaces, type scale, radii and shadows come from `src/styles.css` at main commit a6a64b1d9812eb204da14b2c780b954900203f94. Layout tokens are local to this site.

## Remaining work

- TODO: replace the visible demo video slot with the owner's recorded demo link.
- Capture updated interface and real outputs when separately authorized; existing captures predate some controls.
- Owner decides whether to publish. This repository has no remote and has not been deployed.

## Validation

Local paths and fragment links resolve. All five copies match the source SHA-256 hashes. The page has no scripts, forms, embeds, remote assets or CSS imports. It declares a responsive viewport and switches to a single column at 720px.

A rendered desktop and 390px check remains pending. T3 preview rejected the file URL with `unsupported-protocol: file:`. Chrome computer use rejected it because its allowed protocols are only `http:` and `https:` and explicitly prohibited workarounds. No local server was started. No install, app build, generation, deployment or publication was run.
