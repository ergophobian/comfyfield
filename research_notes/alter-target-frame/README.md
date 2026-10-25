# ALTER's target frame on open models

Working files for #195. Everything a person or agent needs to continue the test is in this folder, so it runs from any clone.

## Background

Scenario's ALTER is a Claude skill that changes one thing in a filmed video and keeps the performance ([post](https://x.com/Scenario_gg/status/2113998556524646534), [page](https://scenario.com/explorations/alter/)). It renders on Seedance 2.5 through the paid Scenario MCP, so ComfyField cannot use it as is. The idea we test is its **target frame**: edit one frame of the shot first, then give that frame to the video edit as the reference, instead of a flat product image.

`scenario-alter/` is the skill as Scenario published it, MIT, Copyright (c) 2026 Scenario Inc. (see `scenario-alter/LICENSE`). It was unzipped from `scenario-alter-skill.zip`, sha256 `bb956f8df8b306141b996aaf7405ec3fc0a3448ecdd3812e98658056812f1932`. Its local scripts need Python 3 with numpy and Pillow, and ffmpeg. They never call the network.

## Round 1: done

A perfume bottle became a drinks can in a 3.4 s clip, on a Pod (RTX PRO 4500), for $0.49. Both arms used `bernini_swap` with the same prompt and seed.

| Arm | Reference | Changed | Structure | Motion | Check |
|---|---|---|---|---|---|
| A | `round1/product-sheet.png` (flat product image) | 2.9% | 0.79 | 1.00 | PASS |
| B | `round1/target-1.png` (`round1/frame.png` edited by `qwen2511_edit`) | 2.9% | 0.78 | 1.00 | PASS |

- `round1/compare.mp4`: source, A and B side by side, with the source sound.
- `round1/zoom.png`: the hand at 0.4 s, 1.5 s and 3.2 s (source, A, B).
- `round1/qa-*/`: the `alter_check.py` reports, sheets and crops.

Both swaps were clean, and neither kept the old object's shape. B looked more photographed (a highlight runs down the metal), but the gain was small on a plain clip. So round 2 uses harder, showcase sources.

## Round 2: sources done, swaps to run

| Scene | Source (LTX-2.5, 5 s, with sound) | Product image | Swap | Window |
|---|---|---|---|---|
| `ugc` | `round2/ugc-source.mp4`: vertical iPhone clip, golden hour rooftop bar, she pushes a cocktail toward the lens | `round2/ugc-product.png` | coupe glass into a yuzu soda can | 0 to 3.4 s |
| `noir` | `round2/noir-source.mp4`: anamorphic rainy neon Tokyo alley, a man in a trench coat walks toward the camera | `round2/noir-product.png` | black umbrella into a clear bubble umbrella | 1.6 to 5.0 s |

`round2/*-strip.png` shows each source over time. All prompts are in `round2/run.mjs`.

### Run the swaps

Paid. The budget for #195 is $1. One Pod for about 25 minutes.

1. Check that no other session or person is using a Pod on the same RunPod account. On 2026-10-25 another session terminated the shared Pod 20 s after this script started it. The script now stops when its Pod disappears.
2. Start the app from the repo root: `npm run dev`. Connections needs a RunPod key.
3. From the repo root, run `node research_notes/alter-target-frame/round2/run.mjs swaps`. It starts a Pod (32 GB, 200 GB disk), extracts each target frame, edits it with `qwen2511_edit`, then runs A and B with `bernini_swap` for both scenes. It writes `<scene>-target.png`, `<scene>-A-product.mp4` and `<scene>-B-target.mp4` into `round2/`. It skips any output that is already there, so you can run it again after a failure.
4. Run `node research_notes/alter-target-frame/round2/run.mjs stop` to terminate the Pod.
5. Score each output:
   `python -I research_notes/alter-target-frame/scenario-alter/scripts/alter_check.py <source.mp4> <output.mp4> --out <qa folder> --mode swap`
   Cut the source to the same window first for `noir` (1.6 s, 81 frames), or the frame counts will not match. Then look at the crops: the numbers find broken edits, and only eyes judge realism.
6. Make a side-by-side with the source sound, as in `round1/compare.mp4`.

Do not commit `round2/state.json` or `round2/run.log`. They are local run records.

## Things to know

- **A Pod video run returns two files**: the result, and an exact copy of the input clip, in random order. The script drops the copy by its frame md5. The app probably saves both to the Library (see #195).
- The first run on a new Pod sometimes fails with `fetch failed` between the server and the Pod, 3.5 to 4 minutes in. The script retries once, and the retry has always worked.
- The app stops an idle Pod after 10 minutes, and its downloads go with it. Keep the steps together.
- Node's `fetch` gives up after 300 s without a reply, and a first run downloads its models first. That is why the script uses `node:http` with no timeout.
