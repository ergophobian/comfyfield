# Input widgets

Issue #48 adds `mask`, `face`, `video` and `crop` to the existing format `Field` renderer and the Flows Add menu. Each is an input node, with its editor in the selected node panel. Existing `draw` slots with mask mode use the mask painter; motion arrows keep their previous behavior.

```jsx
<Field input={{ id: 'selection', type: 'crop', label: 'Frame the subject' }}
  value={value} onChange={setValue} setError={setError} />
```

## Values

All file URLs come from the local `/api/upload` endpoint. No blob URLs or file bytes are stored in a Flow.

| Type | Value | Ready when |
| --- | --- | --- |
| `mask` | `{ url, name, ratio, maskUrl, strokes }` | The user saves the PNG mask. `strokes` aliases `maskUrl` for existing consumers. Editing invalidates both until saved again. |
| `face` | Photo: `{ url, name, ratio, aspect, box, faceUrl }`. Character: `{ url, faceUrl, name, characterId, images }`. | A selected face crop is uploaded, or a Library character with an image is chosen. |
| `video` | `{ url, name, type, ratio, duration, trim: { start, end }, posterUrl?, posterTime? }` | The browser reads a finite duration and a nonempty trim interval. |
| `crop` | `{ url, name, ratio, aspect, box }` | The source image loads and initializes its selection. |

Boxes use fractions of the original image, with the origin at its upper left: `{ x, y, width, height }`, each between 0 and 1. Aspect presets account for the source dimensions. Free, 1:1, 4:5, 9:16, 16:9 and 21:9 are available. Crop values describe an image selection; they do not render an edited file.

Masks retain source resolution. The uploaded PNG is opaque grayscale: white changes and black stays. Face selection is manual: move and resize the box around one face, then choose Use this face to upload its cropped PNG. Library characters use their first reference image directly.

Video times are seconds. The uploaded source is preserved. Trim start/end and the chosen poster timestamp travel as metadata; the poster itself is a PNG upload. mp4, webm and mov upload and serving are supported up to 200 MiB (the UI says MB); images retain a 40 MiB cap. Preview/decoding depends on browser codec support. Media responses support byte ranges for seeking.

## Integration with the other lanes

`shared/widgetInputs.js` exports `widgetTypes`, `widgetReady` and `widgetOptions`.

`recipeOptions(format, values)` keeps every ready widget in `opts.inputs[input.id]`. It also fills the existing image URLs, explicit provider fields, video media URLs and mask `media[<id>Strokes]` for compatibility. Conditional and optional slots follow the existing rules. Required slots remain incomplete while a mask or face selection is unsaved.

Flow nodes store the same value at `node.data.value`. Their outputs carry `inputType` and `value`, including through approval gates. Plans expose the full values in `opts.inputs[node.id]`, with convenience options from `widgetOptions`: `image`/`mask`, `image`/`face`, `video`/`trim`/`poster`/`posterTime`, or `image`/`crop`/`cropAspect`. Widget references supplement source image rows rather than creating extra generations. Use `opts.inputs` when combining several selections; convenience fields describe the last connected widget of each kind. Existing source image rows supply `opts.image` when present.

Provider-specific mask, crop, trim, and identity mappings belong to the format runner (#46) and provider lanes. These widgets do not add paid generation paths or perform video encoding. The existing inpaint and face-swap formats expose the new inputs; their planned workflows still display Not wired yet.

## Validation

- `node scripts/widget-checks.mjs`: raw/JSON upload compatibility, MIME rejection, empty input, image/video size caps (including exactly 200 MiB), geometry, required format values, serialization and HTTP byte ranges.
- `node scripts/flow-checks.mjs`: existing invariants plus widget readiness, gate propagation, no automatic rerun and references supplementing image rows.
- `node scripts/widget-browser-checks.mjs`: headless Chrome, synthetic PNG/WebM fixtures, actual local upload/media routes and mocked provider/Library endpoints. Checks exported mask pixels, erase/invert/clear, face crop and character selection, aspect math, keyboard focus, touch dragging, trim/poster upload, all four Flow nodes, and the inpaint app at 390px. Captures screenshots under `outputs/widget-browser/`.
- `node scripts/theme-check.mjs` and `npx vite build`.

The browser check uses Node's built-in WebSocket and an installed Chrome. On Windows it defaults to `C:/Program Files/Google/Chrome/Application/chrome.exe`; set `WIDGET_CHROME` for another installation. It uses free local ports and a separate headless profile under ignored outputs. No provider keys are loaded or used. Test media and screenshots are synthetic, with no generated provider output. Physical mobile devices, assistive technology and mov codec playback have not been tested.


### Optional scene writing

A native Writer step can set `optional: true` and `when: [choiceId, optionId]`.
The format compiler bypasses it when that option is not selected. Before a fresh
run, missing Writer credentials also bypass optional Writers, retaining the
format's literal prompt and input note. Required Writers still fail preflight.
Optional Writers receive the base generation prompt with the text inputs so
scene descriptions retain the character and background instructions. Their
output uses the normal editable Writer review and Send gate.

Motion transfer and Video character swap render a one-second draft through the
existing `duration` placeholder (`motion_frames: 17` as well for Wan Animate 2).
Approval unlocks the final render from the original uploaded video and trim;
the draft is a preview, not replacement source footage. Resolution is unchanged.
