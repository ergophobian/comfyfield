// Every tool and page in ComfyField. The structure mirrors Higgsfield's: Image, Video and Audio menus list
// their tools first and their models second, and each tool has its own page. The nav, Explore and pages read from here.
//   id, name, menu ('image' | 'video' | 'audio' | 'studio' | 'top', or a list), route, blurb (one line), badge ('New' | 'Top')
//   format: a format id from src/lib/formats when the tool is a single format opened in the app layout

export const menus = [
  { id: 'image', name: 'Image' },
  { id: 'video', name: 'Video' },
  { id: 'audio', name: 'Audio' },
]

export const tools = [
  // Image
  { id: 'create-image', name: 'Create image', menu: 'image', route: '/image', blurb: 'Generate images from a prompt' },
  { id: 'cinematic-cameras', name: 'Cinematic cameras', menu: 'image', route: '/cinema?mode=image', blurb: 'Image generation with camera controls', badge: 'Top' },
  { id: 'canvas', name: 'Canvas', menu: ['image', 'video'], route: '/flows', blurb: 'Chain prompts, references and models on a board' },
  { id: 'moodboard', name: 'Moodboard', menu: 'image', route: '/moodboard', blurb: 'Turn your references into a reusable style' },
  { id: 'character', name: 'Character', menu: 'image', route: '/character', blurb: 'Create a character that stays the same' },
  { id: 'influencer', name: 'AI influencer', menu: ['image', 'top'], route: '/influencer', blurb: 'Create and manage your AI influencer', badge: 'New' },
  { id: 'photodump', name: 'Photodump', menu: 'image', route: '/photodump', blurb: 'A set of photos in your aesthetic' },
  { id: 'relight', name: 'Relight', menu: 'image', route: '/apps/relight', format: 'relight', blurb: 'Adjust light position, color and brightness' },
  { id: 'inpaint', name: 'Inpaint', menu: 'image', route: '/edit', blurb: 'Select an area, describe the change' },
  { id: 'image-upscale', name: 'Image upscale', menu: 'image', route: '/upscale', blurb: 'Enhance image quality' },
  { id: 'face-swap', name: 'Face swap', menu: 'image', route: '/apps/face-swap', format: 'face-swap', blurb: 'Swap in your own face or a saved character' },
  { id: 'character-swap', name: 'Character swap', menu: 'image', route: '/apps/character-swap', format: 'character-swap', blurb: 'Put a saved character into any photo' },
  { id: 'fashion-factory', name: 'Fashion factory', menu: 'image', route: '/fashion', blurb: 'Outfits and lookbooks from one character' },

  // Video
  { id: 'create-video', name: 'Create video', menu: 'video', route: '/video', blurb: 'Generate videos from a prompt or a frame' },
  { id: 'cinema-studio', name: 'Cinema studio', menu: ['video', 'top'], route: '/cinema', blurb: 'Direct a shot like a film set', badge: 'Top' },
  { id: 'faceless', name: 'Faceless studio', menu: 'video', route: '/faceless', blurb: 'Start a faceless channel from a topic' },
  { id: '3d-studio', name: '3D studio', menu: 'video', route: '/3d', blurb: 'Build 3D scenes and turn them into videos', badge: 'New' },
  { id: 'shorts', name: 'Shorts studio', menu: 'video', route: '/shorts', blurb: 'Turn your footage into ready-made shorts' },
  { id: 'explainer', name: 'Explainer', menu: 'video', route: '/explainer', blurb: 'Turn any topic into an explainer video' },
  { id: 'mixed-media', name: 'Mixed media', menu: 'video', route: '/mixed-media', blurb: 'Restyle a clip with a mixed media look' },
  { id: 'edit-video', name: 'Edit video', menu: 'video', route: '/video/edit', blurb: 'Edit scenes, shots and elements' },
  { id: 'video-upscale', name: 'Video upscale', menu: 'video', route: '/upscale?kind=video', blurb: 'Enhance video quality' },
  { id: 'reframe', name: 'Reframe', menu: 'image', route: '/reframe', blurb: 'Extend an image to a new ratio. Video is not wired yet' },
  { id: 'click-to-ad', name: 'Click to ad', menu: 'video', route: '/ads', blurb: 'Turn a product link into video ads' },
  { id: 'color-palette', name: 'Change color palette', menu: 'video', route: '/apps/color-grade', format: 'color-grade', blurb: 'Adjust palette, tones and mood' },
  { id: 'motion-control', name: 'Motion control', menu: 'video', route: '/video?tab=motion', blurb: 'Transfer motion from a video to an image' },
  { id: 'lipsync', name: 'Lipsync studio', menu: 'video', route: '/lipsync', blurb: 'Make any face speak your audio' },

  // Audio
  { id: 'text-to-speech', name: 'Text to speech', menu: 'audio', route: '/audio?mode=speech', blurb: 'Generate speech from text' },
  { id: 'voice-change', name: 'Voice change', menu: 'audio', route: '/audio?mode=change', blurb: 'Swap the voice in any recording' },
  { id: 'translate', name: 'Translate', menu: 'audio', route: '/audio?mode=translate', blurb: 'Translate and lipsync a video into a new language' },

  // Studios and other pages
  { id: 'explore', name: 'Explore', menu: 'top', route: '/', blurb: 'Everything you can make' },
  { id: 'apps', name: 'Apps', menu: 'top', route: '/apps', blurb: 'One-click tools for photos and videos' },
  { id: 'effects', name: 'Effects', menu: 'studio', route: '/effects', blurb: 'Viral effects from one photo' },
  { id: 'motion', name: 'Motion presets', menu: 'studio', route: '/motion', blurb: 'Camera moves and effects for any photo' },
  { id: 'marketing', name: 'Marketing studio', menu: 'studio', route: '/marketing', blurb: 'Product videos and ads from one brief' },
  { id: 'ads', name: 'Ads studio', menu: ['studio', 'top'], route: '/ads', blurb: 'Branded ads from a link', badge: 'New' },
  { id: 'assistant', name: 'Assistant', menu: 'studio', route: '/assistant', blurb: 'Describe it, get a plan with costs, approve it' },
  { id: 'skills', name: 'Skills', menu: 'top', route: '/skills', blurb: 'Ready-made jobs your agent runs on ComfyField' },
  { id: 'assets', name: 'Assets', menu: 'top', route: '/assets', blurb: 'Your generations and saved elements' },
]

// Open-weight models offered in each menu's model column, picked on quality per the feature audit.
// `workflow` is the planned ComfyUI workflow id. `catalog` names the catalog model once it is wired;
// until then the model shows as not wired yet.
export const openModels = [
  { id: 'flux-3-klein', name: 'FLUX 3 Image Klein', kind: 'image', vendor: 'Black Forest Labs', blurb: 'Next-generation images and edits, up to 10 references', workflow: 'flux3_klein_t2i', catalog: 'comfy-flux3-klein', badge: 'New' },
  { id: 'qwen-image-2-1', name: 'Qwen-Image 2.1', kind: 'image', vendor: 'Alibaba Qwen', blurb: 'Top open model for images and edits', workflow: 'qwen_image21_t2i', catalog: 'comfy-qwen-image21', badge: 'Top' },
  { id: 'qwen-image-edit-2511', name: 'Qwen-Image Edit 2511', kind: 'image', vendor: 'Alibaba Qwen', blurb: 'Instruction edits and multiple references', workflow: 'qwen2511_edit', catalog: 'comfy-qwen-image-edit-2511' },
  { id: 'z-image-turbo', name: 'Z-Image Turbo', kind: 'image', vendor: 'Alibaba Tongyi', blurb: 'Instant lifelike portraits', workflow: 'z_image', catalog: 'comfy-z-image-turbo' },
  { id: 'hidream-o1', name: 'HiDream-O1', kind: 'image', vendor: 'HiDream', blurb: 'Detailed images with readable text', workflow: 'hidream', catalog: 'comfy-hidream-o1' },
  { id: 'minimax-h3', name: 'MiniMax H3', kind: 'video', vendor: 'MiniMax', blurb: 'Top open video model with native audio', workflow: 'h3_open_t2v', catalog: 'comfy-h3', badge: 'Top' },
  { id: 'ltx-2-5', name: 'LTX-2.5', kind: 'video', vendor: 'Lightricks', blurb: 'Fast video with multi-shot, keyframes and audio', workflow: 'ltx25_t2v', catalog: 'comfy-ltx25' },
  { id: 'wan-2-2', name: 'Wan 2.2', kind: 'video', vendor: 'Alibaba Wan', blurb: 'Image to video, first and last frame', workflow: 'wan22_t2v', catalog: 'comfy-wan22' },
  { id: 'wan-animate-2', name: 'Wan Animate 2', kind: 'video', vendor: 'Alibaba Wan', blurb: 'Transfer motion from a video to a character', workflow: 'wan_animate2' },
  { id: 'bernini-r', name: 'Bernini-R', kind: 'video', vendor: 'ByteDance', blurb: 'Restyle, relight and swap objects in real video', workflow: 'bernini_swap' },
  { id: 'infinitetalk', name: 'InfiniteTalk', kind: 'video', vendor: 'MeiGen', blurb: 'Talking heads and lipsync of any length', workflow: 'infinitetalk' },
  { id: 'chatterbox-multilingual', name: 'Chatterbox Multilingual', kind: 'audio', vendor: 'Resemble AI', blurb: 'Speech in 23 languages with emotion control', workflow: 'chatterbox_tts' },
  { id: 'fish-drama-3', name: 'Fish Audio Drama 3', kind: 'audio', vendor: 'Fish Audio', blurb: 'Top open voice model, 83 languages', workflow: 'drama3_tts', catalog: 'comfy-drama3-tts', badge: 'Top' },
  { id: 'qwen3-tts', name: 'Qwen3-TTS', kind: 'audio', vendor: 'Alibaba Qwen', blurb: 'Voice design and cloning from 3 seconds', workflow: 'qwen3_tts' },
  { id: 'minimax-music-3', name: 'MiniMax Music 3', kind: 'audio', vendor: 'MiniMax', blurb: 'Songs with vocals and lyrics', workflow: 'minimax_music3' },
  { id: 'stable-audio-3', name: 'Stable Audio 3', kind: 'audio', vendor: 'Stability AI', blurb: 'Sound effects and instrumentals', workflow: 'stable_audio3' },
]

const inMenu = (t, menu) => (Array.isArray(t.menu) ? t.menu.includes(menu) : t.menu === menu)
export const toolsIn = (menu) => tools.filter((t) => inMenu(t, menu))
export const modelsFor = (kind) => openModels.filter((m) => m.kind === kind)
export const toolById = (id) => tools.find((t) => t.id === id)
