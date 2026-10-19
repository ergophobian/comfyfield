# How the klein graphs were checked

Checked 2026-10-19 against ComfyUI **v0.41.1, commit `45bf90d1c91eecd782643346dcfb73cb0017667f`** (a blobless clone checked out at that commit; `git describe` gives `v0.41.1`). No graph has run on a GPU.

## The checker

`check_klein.py` (in this folder) runs with any Python 3 and no ComfyUI install:

```sh
python -I check_klein.py --nodes scripts/fixtures/comfy-nodes.json <ComfyUI checkout at 45bf90d1> shared/modelFiles.js research_notes/engine/klein/*.json
node scripts/graph-check.mjs research_notes/engine/klein
```

It holds one spec per node class: input names, types, required or optional, combo values or ranges, DynamicCombo children, Autogrow slots and minimums, and output types. I read each spec from the pinned source by hand. Then the script checks the spec itself against the source text: it finds each class id (`node_id="…"` or the `nodes.py` mapping), each input name, each DynamicCombo option and child, and each combo value, so a typo in a spec fails. It also checks that each class is registered: listed, not commented out, in its extension's `get_node_list` or in `NODE_CLASS_MAPPINGS`. With `--nodes`, it also checks that each class is in the real v0.41.1 `object_info` dump. Sampler and scheduler names come from `comfy/samplers.py` (`KSAMPLER_NAMES`, `SCHEDULER_HANDLERS`).

For each graph it checks:

1. Each `class_type` has a spec, the spec matches the source, and the class is registered (26 classes).
2. Each input name is valid for that class, including expanded keys: `sampling_mode.*`, `resolution.megapixels`, `images.imageN`, `values.a…z`, `inputs.inputN`, `mode.num_iterations`.
3. Each link points at an existing node and an existing output index. The output type matches the input type. MatchType outputs (the loop carry, End Loop, Create List) resolve through their inputs, and both sides must agree.
4. Each required input is set, including DynamicCombo children of the chosen option and the Autogrow minimum (`BatchImagesNode.images.image0`, `ComfyMathExpression.values.a`, `CreateList.inputs.input0`).
5. Each combo value is a valid option, and each literal number is inside its min and max.
6. Each loader file is in `MODEL_FILES`, in the folder `LOADERS` gives for that loader input.
7. Each `_meta.optional` loader loads `{{<that key>}}` and links only into inputs that are optional in the schema. The graph is then checked again with the loader and every input that links to it removed (the app's `dropOptional`), and with all optional loaders removed together.
8. Loops: every node reachable from a Start Loop reaches its End Loop before any output node, as `validate_loops` requires. Exactly one End Loop closes each Start Loop.
9. Every node feeds a `SaveImage`.

**Result: 0 problems** for all twelve graphs, including the no-ref2/ref3 variants of `klein_moodboard`. The repo's `node scripts/graph-check.mjs research_notes/engine/klein` (against `scripts/fixtures/comfy-nodes.json`) reports "13/13 graphs fit ComfyUI v0.41.1 and the listed packs"; the thirteenth file is `files.json`.

**The fix after review.** The first draft used `ComfySoftSwitchNode` in `flux_look` and `storyboard`. That class is defined in `comfy_extras/nodes_logic.py` but commented out of `LogicExtension.get_node_list`, so v0.41.1 does not register it. The first checker only looked for the class definition and missed this. Now each of the two graphs is a pair, `flux_look`/`flux_look_ref` and `storyboard`/`storyboard_ref`, and the checker checks registration. On the old `flux_look.json` it reports the class as "not registered" and "not in the object_info fixture".

**The checker catches faults.** I gave it ten broken copies, and it reported each one:

- a renamed input
- a bad output index
- a VAE into a CLIP input
- a bad scheduler name
- an optional loader moved into `BatchImagesNode.images.image0`
- a SaveImage moved inside a loop
- a missing `sampling_mode.top_k`
- a file not in `MODEL_FILES`
- an optional loader into `ImageScaleToTotalPixels.image`

A tenth broken copy adds `ComfySoftSwitchNode` back into `flux_look`, and the checker reports it as an unknown class. The registration check reported the same class on the old `flux_look.json`.

## Behaviour read in the source

The static checker cannot prove these. I read them in the pinned source:

| Behaviour the graphs rely on | Source |
|---|---|
| A link into a widget input such as `system_prompt` (force_input) is not needed: the server accepts a literal and only converts its type | `execution.py validate_inputs` (no force_input check; `str(val)` for STRING) |
| `ReferenceMultiLatent.images.*` are all optional. With no image, it returns the conditioning unchanged and skips `None` images | `comfy_extras/nodes_edit_model.py`; `_io.py Autogrow._expand_schema_for_dynamic` (template `optional=True` → every slot optional; empty dict when none is given) |
| `BatchImagesNode`: `images.image0` is required, `image1+` are optional. It resizes and center-crops to the first image | `nodes_post_processing.py` (`TemplatePrefix min=1`, `batch_images`) |
| `TextGenerate.image` is optional. Images go before the text in the user turn, and a batch splits into one image per frame | `nodes_textgen.py`; `comfy/text_encoders/qwen35.py Qwen35ImageTokenizer` |
| The upsampler file loads as Qwen3.5-9B with `CLIPLoader type flux3`. The Qwen3.5 branch is chosen by the detected model, not by the type | `comfy/sd.py` (`TEModel.QWEN35_9B` branch) |
| Loop API shape: `"mode": "simple", "mode.num_iterations": N`, `initial_iteration_value` link, End Loop `accumulate` | `tests-unit/execution_test/test_nested_loop_execution.py` |
| The server computes the loop body. A body may read nodes outside it (models, shot 1, the character) | `comfy_execution/validation.py validate_loops`; `tests-unit/execution_test/loop_validation_test.py test_accepts_dependencies_entering_loop_body` |
| End Loop with `accumulate` returns a flat list. A non-list node (SaveImage) after it runs once per item. `CreateList` concatenates its list inputs in order | `nodes_loop.py EndLoop.execute`; `comfy_extras/nodes_toolkit.py CreateList` (`is_input_list`) |
| `SaveImage` returns `IMAGE` (one output) in v0.41.1 | `nodes.py SaveImage.RETURN_TYPES` |
| `EmptyFlux2LatentImage` makes `[B, 128, H/16, W/16]`, step 16. `aspectSize` gives 1024², 1280×720, 720×1280 and 896×1120, all multiples of 16 | `comfy_extras/nodes_flux.py`; `src/lib/catalog.js` |

## Per graph

| Graph | Nodes | Classes beyond the edit template | Optional loaders and what they feed | Loop | Result |
|---|---|---|---|---|---|
| `flux_look` | 11 | EmptyFlux2LatentImage (no reference) | none | none | 0 |
| `flux_look_ref` | 14 | ImageScaleToTotalPixels, EmptyFlux2LatentImage | none (`{{image}}` required) | none | 0 |
| `klein_edit` | 13 | ImageScaleToTotalPixels | none | none | 0 |
| `klein_edit_canvas` | 14 | ImageScaleToTotalPixels, EmptyFlux2LatentImage | none | none | 0 |
| `klein_character` | 14 | ImageScaleToTotalPixels, EmptyFlux2LatentImage | none | none | 0 |
| `klein_character_swap` | 17 | ImageScaleToTotalPixels, GetImageSize, ResizeAndPadImage | none | none | 0 |
| `klein_headshot` | 14 | as `klein_edit_canvas` | none | none | 0 |
| `klein_retouch` | 13 | as `klein_edit` (`resolution.megapixels` 2.0, inside 0.01 to 16) | none | none | 0 |
| `klein_moodboard` | 17 | ImageScaleToTotalPixels, EmptyFlux2LatentImage | #11 `image2` → #13 `images.image1`, #32 `images.image1`; #12 `image3` → #13 `images.image2`, #32 `images.image2` (all optional) | none | 0, with neither, either or both |
| `flux_character_set` | 23 | PrimitiveString(Multiline), PrimitiveInt, StartLoop, ComfyMathExpression, StringFormat, EndLoop | none | #40 → #51; body 41 to 50, closed | 0 |
| `storyboard` | 29 | PrimitiveStringMultiline, PrimitiveInt, ComfyMathExpression, StringFormat, StartLoop, EndLoop, CreateList, EmptyFlux2LatentImage | none | #40 → #51; body 41 to 50, closed; #35 (shot 1) enters the body | 0 |
| `storyboard_ref` | 32 | as `storyboard`, plus ImageScaleToTotalPixels | none (`{{image}}` required) | #40 → #51; body 41 to 50, closed; #35 and #10 (character) enter the body | 0 |

Placeholders per graph (each whole-string placeholder sits on an input of the matching type):

- `flux_look`, `storyboard`: `prompt width height count seed`
- `flux_look_ref`, `storyboard_ref`: `prompt image width height count seed`
- `klein_edit`, `klein_retouch`: `prompt image seed`
- `klein_edit_canvas`, `klein_headshot`, `klein_character`: `prompt image width height count seed`
- `klein_character_swap`: `prompt image image2 seed`
- `klein_moodboard`: `prompt image image2 image3 width height count seed`
- `flux_character_set`: `prompt image width height count seed`

`{{prompt}}` also appears inside longer strings (the BFL scaffold). The app's `fill()` replaces it there as text. The `StringFormat` fields use single braces (`{a}`, `{b}`, `{c}`), which `fill()` does not touch, and no literal brace stays in an f-string.
