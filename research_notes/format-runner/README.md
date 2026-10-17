# Format runner verification

Captured with `node scripts/format-ui-check.mjs` in local headless Chrome. The script
starts a separate Vite server with mock connections, uploads and generation
responses. It does not load the real provider routes or read keys. Media labeled
“Mock input” and “Mock result” are test fixtures, not paid generations.

- [Desktop app result](mock-relight-desktop.png): upload, lighting choice and completed format result.
- [390px app result](mock-relight-mobile.png): the same app and result without horizontal overflow.
- [Library after reload](mock-library-desktop.png): persisted format output.
- [Shared format sheet](mock-shared-sheet-desktop.png): Library “Use in” prefills Upscale; Run saves a second result.

The script also checks Create still generates, displays format outputs in its
feed, and retains its complete prompt-only camera preset picker. Missing workflow
formats are hidden from runnable galleries and direct app routes.

Provider execution and actual output quality remain unverified. Public fal input
schema metadata was fetched without credentials; all generation responses in the
checks are mocked. Writer implementation, Comfy image upload, other media chains
and missing workflows are outside this lane.
