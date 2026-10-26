# Launch assets

## Footage

Real LTX-2.5 renders on Comfy Cloud of the Cinema example scene "The folded alley" (prompts in `docs/demo.md`), made on 2026-10-26. Re-encoded with ffmpeg to H.264, CRF 27, no audio, for the web.

- `shot1.mp4`, `shot2.mp4`, `shot3.mp4` (960 wide) and their posters: shots 1, 2 and 3. Sources: `shot1.mp4` and `shot2.mp4` from the proof run, and `.comfyfield/media/1793046546265-urc2t1.mp4` for shot 3.
- `scene.mp4` (1280 × 704) and `scene.jpg`: the same three shots joined in order with ffmpeg.

The "shot 2 regenerate" render from that run (`1793046644127-ipg3s6.mp4`) is not used: it shows a different scene.

## Screenshots

- `ui-cinema.webp`: fresh capture of `/cinema` with the built-in example idea, no generation.
- `ui-composer.webp`, `ui-library.webp`: crops of the launch README captures from draft PR #133 (no keys, empty data folder).
- `ui-flows.webp`: crop of `docs/screenshots/issue-21-flow-built-by-mcp.png`, a flow built through the MCP server.

## Demo video

Fill `#demo-video` in `index.html`; the comment above it shows how.
