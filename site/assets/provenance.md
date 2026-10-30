# Launch assets

## Hero film

- `film.mp4` (1280 × 720, 4 min 24 s, H.264 + AAC, faststart) and `film.jpg` (the frame at 4:11): a web copy of "Press play", a short film the ComfyField team made with MiniMax H3, LTX and Blender (source: `1029-full-film-music-004.mp4`, 1920 × 1080). The ComfyField logo covers the generator's corner mark; the "Press play" title and the end card were added with ffmpeg. Used with Kyle Kumar's permission. CRF 27, capped at 1.3 Mb/s.
- `film-loop.mp4` (1280 × 720, 15 s, no audio) and `film-loop.jpg` (the frame at 0:16.5): the opening, 0:03.1 to 0:17.9, for the hero.

## Footage

Real LTX-2.5 renders on Comfy Cloud of the Cinema example scene "The folded alley" (prompts in `docs/demo.md`), made on 2026-10-26. Re-encoded with ffmpeg to H.264, CRF 27, no audio, for the web.

- `shot1.mp4`, `shot2.mp4`, `shot3.mp4` (960 wide) and their posters: shots 1, 2 and 3. Sources: `shot1.mp4` and `shot2.mp4` from the proof run, and `.comfyfield/media/1793046546265-urc2t1.mp4` for shot 3.
- `scene.mp4` (1280 × 704) and `scene.jpg`: the same three shots joined in order with ffmpeg.

The "shot 2 regenerate" render from that run (`1793046644127-ipg3s6.mp4`) is not used: it shows a different scene.

## Screenshots

- `ui-format.webp`: the settings panel of `/apps/earn-chaotic-product-story`, captured from the running app at 2x and cropped. No keys, nothing generated; the price is the app's own estimate.
- `ui-cinema.webp`: fresh capture of `/cinema` with the built-in example idea, no generation.
- `ui-composer.webp`, `ui-library.webp`: crops of the launch README captures from draft PR #133 (no keys, empty data folder).
- `ui-flows.webp`: crop of `docs/screenshots/issue-21-flow-built-by-mcp.png`, a flow built through the MCP server.

## Demo video

Fill `#demo-video` in `index.html`; the comment above it shows how.
