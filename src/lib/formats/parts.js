// Shared building blocks for format definitions.
//
// A format is data: inputs the sheet renders, a prompt template and the workflow it will run.
//   id, name, kind (image | video | audio), category (see index.js), blurb
//   engine    'comfy' for open weights. The teammate's fal recipes are tagged 'fal' in index.js
//   runsOn    model label shown on cards and the sheet, checked against Comfy Cloud and Runpod in the backend pass
//   workflow  planned public/workflows/<id>.json. A format is wired once its workflow is in readyWorkflows
//   inputs    see below. prompt fills {inputId} with the value (a choice uses its option text or label)
//   settings  aspect ('auto' keeps the source shape), duration
//   featured  suggested under the composer. layout 'wide' gives the sheet two columns
//   group     optional sub-heading inside a category, e.g. 'Basic camera control' or 'Catch the pulse'
//   hub       optional Higgsfield app hub (see hubs in index.js); the format then lists on /apps and opens at /apps/:id
//   preview   optional video URL that plays on hover in the gallery
//   output    optional short note when the result is not a plain file of `kind`, e.g. 'A .glb model you can spin'
// kind is image, video, audio or 3d. 3d has no composer, so its formats are the only way in.
//
// Input types:
//   image | audio                    value { url, name, ratio, local? }
//   video                            uploaded { url, name, ratio, duration, trim: { start, end }, posterUrl?, posterTime? }
//   mask                             uploaded image plus maskUrl (white changes, black stays), strokes aliases maskUrl
//   face                             image plus faceUrl and box, or characterId and Library images
//   crop                             image plus normalized box { x, y, width, height } and aspect
//   text | longtext                  value string, optional placeholder
//   choice                           options [{ id, label, text?, note?, params? }], default
//   count                            options [numbers], default, unit ('shots')
//   character | product | brand | voice   a Library pick, value is a toRef() object
//   draw                             an image you draw on. mode 'mask' paints the area to change,
//                                    mode 'motion' draws arrows for where things should move.
//                                    mask mode aliases the mask widget; motion strokes remain a PNG data URL
// See docs/input-widgets.md for the format-runner and Flow input contract.
// Any input can set optional, when: ['choiceId', 'optionId'] to show only for that option,
// and half: true to take one column in the wide layout.

export const gradient = (a, b, c) => `linear-gradient(135deg, ${a}, ${b}${c ? `, ${c}` : ''})`

export const covers = {
  indigo: gradient('#dfe6ff', '#a9b8ff', '#6f7ff0'),
  dusk: gradient('#c9d4ff', '#8ea0ff', '#4b58d6'),
  sky: gradient('#e4f0ff', '#a8ccff', '#6a98f5'),
  mint: gradient('#e0f7ef', '#a6e3cc', '#5fbf9f'),
  peach: gradient('#ffe9dc', '#f7c1a3', '#ea9573'),
  sun: gradient('#fff3d6', '#ffd796', '#ffb766'),
  rose: gradient('#ffe4ec', '#f7b2c8', '#e57fa3'),
  lilac: gradient('#efe7ff', '#cbb9ff', '#9d86f2'),
  slate: gradient('#eef1f8', '#cdd4e6', '#98a3c2'),
  night: gradient('#c7cdf0', '#6c76c9', '#2e3576'),
}

export const photo = { id: 'image', type: 'image', label: 'Photo' }
export const clip = { id: 'video', type: 'video', label: 'Video' }
export const sound = { id: 'audio', type: 'audio', label: 'Audio' }
export const note = { id: 'note', type: 'text', label: 'Extra direction', optional: true, placeholder: 'Anything else to add' }

export const open = (f) => ({ engine: 'comfy', settings: {}, prompt: '', ...f })
