import { photodumpSets, photoRatios, setSizes } from '../../components/studio/presets.js'
import { covers } from './parts.js'

const angles = ['', 'closer in', 'from a new angle', 'from behind']

export function photodumpScenes(set, count) {
  return Array.from({ length: count }, (_, i) => {
    const pass = Math.floor(i / set.scenes.length)
    const scene = set.scenes[i % set.scenes.length]
    return pass ? `${scene}, ${angles[pass % angles.length] || 'wide establishing view'}` : scene
  })
}

const ratioInput = (ratios, fallback) => ({
  id: 'ratio', type: 'choice', label: 'Aspect ratio', default: fallback,
  options: ratios.map((id) => ({ id, label: id, params: { aspect: id } })),
})
const qualityInput = {
  id: 'quality', type: 'choice', label: 'Quality', default: '2k',
  options: [
    { id: '1.5k', label: '1.5k' },
    { id: '2k', label: '2k' },
  ],
}

const canvases = {
  '1.5k': { '3:4': [1152, 1536], '4:5': [1216, 1520], '2:3': [1024, 1536], '1:1': [1536, 1536], '9:16': [864, 1536] },
  '2k': { '3:4': [1536, 2048], '4:5': [1632, 2040], '2:3': [1360, 2040], '1:1': [2048, 2048], '9:16': [1152, 2048] },
}

// Fixed independent steps keep each scene attached to its own prompt and Library item.
export function photodumpFormat(setId = photodumpSets[0].id, count = 15) {
  const set = photodumpSets.find((item) => item.id === setId)
  if (!set || !setSizes.includes(count)) throw new Error('Choose a valid photo set and size')
  const shots = photodumpScenes(set, count)
  return {
    id: 'photodump', name: 'Photodump', job: 'Shoot a varied photo set from character references',
    shape: 'pipeline', kind: 'image', category: 'characters', runsOn: 'Qwen edit 2511',
    blurb: 'One character, a whole set of scenes. Reference inference, without training.',
    cover: set.cover, settings: { aspect: '3:4' },
    inputs: [
      { id: 'image', type: 'image', label: 'Character reference' },
      { id: 'image2', type: 'image', label: 'Second reference', optional: true },
      { id: 'image3', type: 'image', label: 'Third reference', optional: true },
      ratioInput(photoRatios, '3:4'), qualityInput,
    ],
    steps: shots.map((scene, i) => ({
      id: `shot-${i + 1}`, provider: 'comfy', workflow: 'qwen2511_photodump', kind: 'image', from: [],
      targetInput: 'quality', targets: Object.fromEntries(Object.entries(canvases).map(([id, sizes]) => [id, { sizes }])),
      prompt: `Create one candid photograph of the person or character shown in the reference images. Theme: ${set.name}, ${set.blurb}. Scene: ${scene}. Keep the same identity, facial features, hair and build from the references. A single photograph, no grid, no collage, no text.`,
    })),
    outputs: shots.map((_, i) => ({ step: `shot-${i + 1}`, kind: 'image' })),
  }
}

export const reframeRatios = ['9:16', '16:9', '4:3', '3:4', '21:9', '1:1', '4:5']
export const reframeFormat = {
  id: 'reframe-image', name: 'Reframe image', job: 'Expand a photo into a new aspect ratio',
  shape: 'tool', kind: 'image', category: 'image-edit', runsOn: 'Qwen edit 2511',
  blurb: 'Keep the center and generate matching edges around a photo.', cover: covers.sky,
  sizes: { '3:4': [768, 1024] },
  settings: { aspect: '9:16' },
  inputs: [
    { id: 'image', type: 'image', label: 'Image to reframe' },
    ratioInput(reframeRatios, '9:16'),
    { id: 'direction', type: 'longtext', label: 'New edges', optional: true },
  ],
  steps: [{
    id: 'outpaint', provider: 'comfy', workflow: 'qwen2511_reframe', kind: 'image',
    prompt: 'Outpaint the blank borders around the centered reference image to fill a {ratio} canvas. Continue the existing scene, perspective, lighting, colors and textures into the new edges. {direction} Keep the original central subject and composition unchanged.',
  }],
  outputs: [{ step: 'outpaint', kind: 'image' }],
}

export const photodumpReframe = [photodumpFormat(), reframeFormat]
