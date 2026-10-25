// Characters, voice and avatars.
import { open, photo, clip, sound, covers } from './parts.js'
import { h3Sizes } from '../catalog.js'

// Chatterbox Multilingual takes its own language labels (mtl_tts.py SUPPORTED_LANGUAGES). It has no
// accent control: the accent comes from the voice sample.
const speechLanguages = [
  ['en', 'English', 'English (en)'], ['es', 'Spanish', 'Spanish (es)'], ['fr', 'French', 'French (fr)'], ['de', 'German', 'German (de)'],
  ['ja', 'Japanese', 'Japanese (ja)'], ['pt', 'Portuguese', 'Portuguese (pt)'], ['hi', 'Hindi', 'Hindi (hi)'], ['ko', 'Korean', 'Korean (ko)'],
  ['zh', 'Mandarin', 'Chinese (zh)'],
].map(([id, label, language]) => ({ id, label, params: { language } }))

const characters = [
  open({
    id: 'character-sheet', name: 'Character sheet', kind: 'image', category: 'characters',
    blurb: 'Turn one photo into a sheet of angles and expressions.',
    runsOn: 'Qwen-Image 2.1', workflow: 'qwen_character_sheet',
    inputs: [
      photo,
      { id: 'style', type: 'choice', label: 'Style', default: 'same', options: [
        { id: 'same', label: 'Same as photo', text: 'in the same style as the photo' },
        { id: 'illustration', label: 'Illustration', text: 'as a clean character design illustration' },
        { id: '3d', label: '3D', text: 'as a 3D character render with soft studio lighting' },
      ] },
    ],
    prompt: 'A character reference sheet of the subject in this photo {style}: front, three quarter, side and back views in a neutral standing pose, plus a row of close ups showing happy, sad, angry and surprised expressions. Same face, hair, build and outfit in every view, plain light gray background, even lighting.',
    settings: { aspect: '16:9' },
    cover: covers.slate,
  }),
  open({
    id: 'character-scene', name: 'Character in any scene', kind: 'image', category: 'characters', featured: true,
    blurb: 'Put your character anywhere and keep their face.',
    runsOn: 'FLUX 3 Image Klein', workflow: 'klein_character',
    inputs: [
      // Up to three of the character's pictures, so a reference set keeps the face without a LoRA.
      { id: 'character', type: 'character', label: 'Character', pictures: 3 },
      { id: 'scene', type: 'longtext', label: 'Scene', placeholder: 'Reading a paper map on a rainy train platform at night' },
      { id: 'shot', type: 'choice', label: 'Shot', default: 'portrait', options: [
        { id: 'portrait', label: 'Portrait', text: 'A portrait' },
        { id: 'full', label: 'Full body', text: 'A full body shot' },
        { id: 'wide', label: 'Wide', text: 'A wide shot' },
      ] },
    ],
    prompt: '{shot} of the person in the reference images, who are all the same person. Scene: {scene}. Keep their face, hair, build and signature outfit exactly as in the references, with lighting that fits the scene and photographic detail.',
    settings: { aspect: '1:1' },
    cover: covers.peach,
  }),
  open({
    id: 'face-swap', name: 'Face swap', kind: 'image', category: 'characters', hub: 'face',
    blurb: 'Swap the face in a photo for your own face or a saved character.',
    engine: 'fal', model: 'fal-ai/nano-banana-2/edit', runsOn: 'Nano Banana 2 via fal',
    steps: [{ id: 'generate', provider: 'fal', endpoint: 'fal-ai/nano-banana-2/edit', bindings: { image_urls: ['photo.url', 'character.faceUrl'] } }],
    inputs: [
      { id: 'photo', type: 'image', label: 'Photo to change' },
      { id: 'character', type: 'face', label: 'Your own face or a saved character' },
    ],
    prompt: 'Replace the face of the main person in this photo with the face of {character}. Keep the hair, pose, head angle, expression, outfit, lighting and background of the photo exactly the same, and blend skin tone and light so it looks natural.',
    settings: { aspect: 'auto' },
    cover: covers.sky,
  }),
  open({
    id: 'character-swap', name: 'Character swap', kind: 'image', category: 'characters', hub: 'face',
    blurb: 'Replace the main person with your own face or a saved character, same pose and scene.',
    runsOn: 'FLUX 3 Image Klein', workflow: 'klein_character_swap',
    inputs: [
      { id: 'photo', type: 'image', label: 'Photo to change' },
      { id: 'character', type: 'character', label: 'Character' },
      { id: 'outfit', type: 'choice', label: 'Outfit', default: 'character', options: [
        { id: 'character', label: 'Character\'s outfit', text: 'wearing their own signature outfit' },
        { id: 'photo', label: 'Keep the photo outfit', text: 'wearing the outfit from the photo' },
      ] },
    ],
    prompt: 'Replace the main person in the first image with the person in the second image, {outfit}, with their face, hair and build exactly as in the second image. Keep the pose, framing, lighting, scene and everything else in the photo the same.',
    settings: { aspect: 'auto' },
    cover: covers.lilac,
  }),
  open({
    id: 'headshot', name: 'Professional headshot', kind: 'image', category: 'characters', hub: 'face',
    blurb: 'Turn a casual photo of you into a polished headshot.',
    runsOn: 'FLUX 3 Image Klein', workflow: 'klein_headshot',
    inputs: [
      { id: 'image', type: 'image', label: 'Photo of you' },
      { id: 'background', type: 'choice', label: 'Background', default: 'studio', options: [
        { id: 'office', label: 'Office', text: 'a softly blurred modern office with warm window light' },
        { id: 'studio', label: 'Studio grey', text: 'a smooth studio grey backdrop with a subtle vignette' },
        { id: 'outdoors', label: 'Outdoors', text: 'softly blurred greenery outdoors in open shade' },
        { id: 'brand', label: 'Brand color', text: 'a smooth seamless backdrop in' },
      ] },
      { id: 'color', type: 'text', label: 'Your brand color', when: ['background', 'brand'], placeholder: 'Deep forest green' },
      { id: 'attire', type: 'choice', label: 'Attire', default: 'keep', options: [
        { id: 'keep', label: 'Keep my outfit', text: 'wearing the same outfit as in the photo, neat and pressed' },
        { id: 'suit', label: 'Suit', text: 'in a well fitted dark business suit' },
        { id: 'blazer', label: 'Blazer', text: 'in a tailored blazer over a plain top' },
        { id: 'smart', label: 'Smart casual', text: 'in a crisp collared shirt' },
        { id: 'knit', label: 'Knitwear', text: 'in a fine knit sweater' },
      ] },
    ],
    // The background goes last so the brand color can finish its sentence.
    prompt: 'A professional head and shoulders headshot of the person in this photo, {attire}, with a relaxed, confident expression, soft flattering key light and sharp focus on the eyes. Keep their face, features, skin tone, hair and age exactly the same. Background: {background} {color}',
    settings: { aspect: '4:5' },
    cover: covers.mint,
  }),
  open({
    id: 'influencer-post', name: 'AI influencer post', kind: 'image', category: 'characters',
    blurb: 'A ready-to-post set of photos of your character.',
    runsOn: 'FLUX 3 Image Klein', workflow: 'flux_character_set',
    inputs: [
      { id: 'character', type: 'character', label: 'Character', pictures: 3 },
      { id: 'niche', type: 'text', label: 'Niche', placeholder: 'Plant-based home cooking' },
      { id: 'posts', type: 'count', label: 'Posts', options: [3, 5, 7], default: 5, unit: 'posts' },
      { id: 'format', type: 'choice', label: 'Format', default: 'feed', options: [
        { id: 'feed', label: 'Feed post', note: 'Square', text: 'square feed posts', params: { aspect: '1:1' } },
        { id: 'story', label: 'Story', note: 'Tall, 9:16', text: 'vertical story frames', params: { aspect: '9:16' } },
        { id: 'cover', label: 'Cover', note: 'Wide, 16:9', text: 'wide cover images', params: { aspect: '16:9' } },
      ] },
    ],
    bindings: { count: 'posts' },
    prompt: 'A set of {posts} social media photos of the person in the reference images, who are all the same person, for a {niche} account, as {format}. Each post shows a different moment, setting and outfit that fits the niche, with the same face and identity in every image, natural candid light and an authentic phone photo feel.',
    settings: { aspect: '1:1' },
    cover: covers.rose,
  }),
  open({
    id: 'ai-influencer-video', name: 'AI influencer video', kind: 'video', category: 'characters', layout: 'wide',
    blurb: 'Your character talks to camera in a ready-to-post video.',
    // Chatterbox speaks the script in the saved voice, then FastH3 Omni films the character saying it,
    // with the speech as <Audio 1>, in one graph. It does not go through InfiniteTalk.
    runsOn: 'Chatterbox and FastH3 Omni', workflow: 'influencer_video', sizes: h3Sizes,
    inputs: [
      { id: 'character', type: 'character', label: 'Character', pictures: 3, half: true },
      { id: 'voice', type: 'voice', label: 'Voice', optional: true, half: true },
      { id: 'setting', type: 'choice', label: 'Setting', default: 'home', options: [
        { id: 'home', label: 'Cozy home', text: 'on the sofa in a cozy, softly lit living room' },
        { id: 'cafe', label: 'Cafe', text: 'at a sunny cafe table with a cup of coffee' },
        { id: 'kitchen', label: 'Kitchen', text: 'at a bright kitchen counter with fresh ingredients' },
        { id: 'gym', label: 'Gym', text: 'in a bright gym, just after a workout' },
        { id: 'street', label: 'City walk', text: 'while walking down a lively city street, filming a handheld selfie' },
        { id: 'car', label: 'Car', text: 'from the driver seat of a parked car, with the phone on the dashboard' },
        { id: 'travel', label: 'Travel', text: 'at a scenic overlook with mountains in the distance' },
      ] },
      { id: 'script', type: 'longtext', label: 'Script', placeholder: 'Three things I wish I knew before my first solo trip. Number one will save you money.' },
      { id: 'emotion', type: 'choice', label: 'Emotion', half: true, default: 'warm', options: [
        { id: 'warm', label: 'Warm', text: 'warm and friendly, with a soft smile', params: { exaggeration: 0.6, cfg_weight: 0.5 } },
        { id: 'excited', label: 'Excited', text: 'excited and energetic, with lively eyebrows and big smiles', params: { exaggeration: 0.9, cfg_weight: 0.3 } },
        { id: 'calm', label: 'Calm', text: 'calm and even', params: { exaggeration: 0.4, cfg_weight: 0.5 } },
      ] },
      { id: 'language', type: 'choice', label: 'Language', half: true, default: 'en', options: speechLanguages },
      // The speech is cut to this length, so a longer script stops part way.
      { id: 'length', type: 'choice', label: 'Length', half: true, default: '10', options: [
        { id: '5', label: '5 seconds', note: 'About 12 words', params: { duration: 5, seconds: 5 } },
        { id: '10', label: '10 seconds', note: 'About 25 words', params: { duration: 10, seconds: 10 } },
        { id: '15', label: '15 seconds', note: 'About 40 words', params: { duration: 15, seconds: 15 } },
      ] },
    ],
    bindings: { script: 'script' },
    prompt: 'A vertical, ready-to-post video of the person in <Picture 1> (every picture shows the same person) talking to the phone camera {setting}, with an authentic creator feel, natural gestures and accurate lip sync, keeping the same face and outfit throughout. They come across {emotion}, and say the line from <Audio 1> in that voice: {script}',
    settings: { aspect: '9:16', duration: 10 },
    cover: covers.sun,
  }),
  open({
    id: 'influencer-persona', name: 'Influencer from a description', kind: 'image', category: 'characters',
    blurb: 'A close-up portrait and a full-body shot of a new character.',
    runsOn: 'FLUX 3 Image Klein',
    inputs: [
      { id: 'persona', type: 'longtext', label: 'Who they are', placeholder: 'A young adult woman with an athletic build, a high black ponytail and athleisure clothes' },
      { id: 'start', type: 'choice', label: 'Start from', default: 'text', options: [
        { id: 'text', label: 'The description' },
        { id: 'photo', label: 'Your photo', note: 'Keeps your face' },
      ] },
      { id: 'photo', type: 'image', label: 'Your photo', when: ['start', 'photo'] },
    ],
    // The full-body shot starts from the portrait, so both show the same face.
    steps: [
      { id: 'portrait', provider: 'comfy', kind: 'image', targetInput: 'start', settings: { aspect: '4:5' }, targets: {
        text: { workflow: 'flux3_klein_t2i', prompt: 'A close-up portrait photo of {persona}. They look at the camera with a relaxed, natural expression. Soft daylight, a plain light background, sharp focus on the eyes, natural skin and an authentic phone photo feel.' },
        photo: { workflow: 'klein_character', prompt: 'A close-up portrait photo of the person in the first image, with their face, features, skin tone and age exactly the same, styled as: {persona}. They look at the camera with a relaxed, natural expression. Soft daylight, a plain light background, sharp focus on the eyes.' },
      } },
      { id: 'body', provider: 'comfy', kind: 'image', workflow: 'klein_character', from: ['portrait'], settings: { aspect: '9:16' },
        prompt: 'A full body photo of the person in the first image, standing relaxed, head to toe in frame. Keep their face, hair, skin tone and build exactly the same: {persona}. Plain light background, soft daylight, natural skin.' },
    ],
    outputs: [{ step: 'portrait', kind: 'image' }, { step: 'body', kind: 'image' }],
    cover: covers.peach,
  }),
  open({
    id: 'character-reference-set', name: 'Character reference set', kind: 'image', category: 'characters',
    blurb: 'Turn a few photos into four clean views of one face, with no training.',
    output: 'A front, three-quarter, profile and full-body view that every character format can use',
    runsOn: 'FLUX 3 Image Klein', workflow: 'klein_reference_set',
    inputs: [
      { id: 'image', type: 'image', label: 'Photo 1' },
      { id: 'image2', type: 'image', label: 'Photo 2', optional: true, half: true },
      { id: 'image3', type: 'image', label: 'Photo 3', optional: true, half: true },
      { id: 'image4', type: 'image', label: 'Photo 4', optional: true, half: true },
      { id: 'keep', type: 'text', label: 'Always keep', optional: true, half: true, placeholder: 'A small scar over the left brow' },
    ],
    prompt: '{keep}',
    settings: { aspect: '4:5' },
    cover: covers.slate,
  }),
]

const voice = [
  open({
    id: 'talking-head', name: 'Talking head', kind: 'video', category: 'voice', featured: true, layout: 'wide',
    blurb: 'Make a face in a photo speak your script.',
    runsOn: 'InfiniteTalk',
    inputs: [
      { id: 'image', type: 'image', label: 'Face', half: true },
      { id: 'template', type: 'choice', label: 'Setup', half: true, default: 'keep', options: [
        { id: 'keep', label: 'Keep my photo', text: 'in the setting from the photo' },
        { id: 'podcast', label: 'Podcast desk', text: 'seated at a podcast desk with a studio microphone on a boom arm, warm practical lights and acoustic panels behind' },
        { id: 'selfie-walk', label: 'Selfie walk', text: 'filming a selfie at arm\'s length while walking down a leafy street, with a natural handheld bounce' },
        { id: 'news', label: 'News desk', text: 'seated at a modern news desk with a softly blurred studio and screens behind, in bright broadcast lighting' },
        { id: 'kitchen', label: 'Kitchen', text: 'standing at a bright home kitchen counter with fresh ingredients in front of them' },
        { id: 'car', label: 'Car', text: 'sitting in the driver seat of a parked car, filmed from a phone on the dashboard in soft daylight' },
        { id: 'interview', label: 'Studio interview', text: 'seated for a studio interview with a soft key light and a dark, moody backdrop' },
        { id: 'review', label: 'Product review', text: 'at a tidy desk with a ring light glow, holding a product up toward the camera as they talk about it' },
        { id: 'classroom', label: 'Classroom', text: 'standing in front of a whiteboard in a bright classroom, like a teacher at the start of a lesson' },
      ] },
      { id: 'source', type: 'choice', label: 'Speech', default: 'script', options: [
        { id: 'script', label: 'Type a script' },
        { id: 'audio', label: 'Use recorded audio' },
      ] },
      { id: 'script', type: 'longtext', label: 'Script', when: ['source', 'script'], placeholder: 'Hi, welcome back to the channel. Today we are making fresh pasta from scratch.' },
      { id: 'voice', type: 'voice', label: 'Voice', optional: true, half: true, when: ['source', 'script'] },
      // Chatterbox steers delivery with exaggeration and cfg weight, the text steers the face.
      { id: 'emotion', type: 'choice', label: 'Emotion', half: true, when: ['source', 'script'], default: 'neutral', options: [
        { id: 'neutral', label: 'Neutral', text: 'Their delivery is calm and even.', params: { exaggeration: 0.5, cfg_weight: 0.5 } },
        { id: 'warm', label: 'Warm', text: 'They come across warm and friendly, with a soft smile.', params: { exaggeration: 0.6, cfg_weight: 0.5 } },
        { id: 'excited', label: 'Excited', text: 'They are excited and energetic, with lively eyebrows and big smiles.', params: { exaggeration: 0.9, cfg_weight: 0.3 } },
        { id: 'serious', label: 'Serious', text: 'They are serious and focused, with a steady gaze.', params: { exaggeration: 0.4, cfg_weight: 0.6 } },
        { id: 'sad', label: 'Sad', text: 'They sound sad and subdued, with a soft, downcast look.', params: { exaggeration: 0.4, cfg_weight: 0.5 } },
      ] },
      { id: 'language', type: 'choice', label: 'Language', half: true, when: ['source', 'script'], default: 'en', options: speechLanguages },
      { id: 'audio', type: 'audio', label: 'Recorded audio', when: ['source', 'audio'] },
    ],
    // The prompt describes the scene; the script goes to Chatterbox, which speaks it before InfiniteTalk
    // animates the face, in one graph. Either way a run covers the first 30 seconds of speech.
    prompt: 'The person in the photo speaks to camera {template}, with accurate lip sync, subtle head movement, natural blinks and expressions that match the words. {emotion}',
    settings: { aspect: 'auto' },
    steps: [{ id: 'generate', provider: 'comfy', kind: 'video', targetInput: 'source', settings: { aspect: 'auto' }, targets: {
      script: { workflow: 'infinitetalk_tts', runsOn: 'Chatterbox and InfiniteTalk', bindings: { script: 'script' } },
      audio: { workflow: 'infinitetalk' },
    } }],
    cover: covers.indigo,
  }),
  open({
    id: 'lipsync', name: 'Lipsync', kind: 'video', category: 'voice',
    blurb: 'Match the lips in a video to new audio.',
    runsOn: 'InfiniteTalk', workflow: 'infinitetalk_v2v',
    inputs: [clip, sound],
    // UMT5 reads a description, not an instruction. A run covers the first 30 seconds of the clip.
    prompt: 'A person talks to the camera, with natural mouth and jaw motion that follows the speech, the same face, head motion and scene as the video.',
    settings: { aspect: 'auto' },
    cover: covers.lilac,
  }),
  open({
    id: 'dub', name: 'Dub into another language', kind: 'video', category: 'voice',
    blurb: 'Translate the speech, keep the voice and match the lips.',
    runsOn: 'Qwen3-ASR, Gemma 4, Chatterbox and InfiniteTalk', workflow: 'dub',
    // One graph: Qwen3-ASR writes down the speech, Gemma 4 translates it with this prompt as its
    // instructions, Chatterbox speaks it in a voice cloned from the clip, InfiniteTalk matches the lips.
    // A run covers the first 30 seconds of the clip.
    inputs: [
      clip,
      { id: 'language', type: 'choice', label: 'Language', default: 'es', options: [
        ...speechLanguages.filter((l) => l.id !== 'en'), speechLanguages.find((l) => l.id === 'en'),
      ] },
    ],
    prompt: 'You translate the transcript of a spoken video clip into natural, conversational {language}, the way a native speaker would say it, at about the same length so it fits the original timing. Keep names, numbers and the speaker\'s tone. Output only the translated words, with no notes, labels, quotes or Markdown.',
    settings: { aspect: 'auto' },
    cover: covers.sun,
  }),
  open({
    id: 'add-sound', name: 'Add sound to video', kind: 'video', category: 'voice',
    blurb: 'Generate sound that matches what happens on screen.',
    runsOn: 'HunyuanVideo-Foley', workflow: 'hunyuan_foley',
    inputs: [
      clip,
      { id: 'sounds', type: 'text', label: 'Sounds', optional: true, placeholder: 'Waves, gulls and distant chatter' },
    ],
    prompt: 'Realistic sound effects and ambience that match the action on screen, in sync with every movement. {sounds}',
    settings: { aspect: 'auto' },
    cover: covers.mint,
  }),
  open({
    id: 'tts', name: 'Text to speech', kind: 'audio', category: 'voice', featured: true,
    blurb: 'Read any script aloud in a natural voice.',
    runsOn: 'Chatterbox Multilingual', workflow: 'chatterbox_tts',
    inputs: [
      { id: 'script', type: 'longtext', label: 'Script', placeholder: 'Every great trip starts with a single wrong turn.' },
      { id: 'voice', type: 'voice', label: 'Voice', optional: true },
      // Chatterbox steers delivery with exaggeration and cfg weight rather than an emotion tag.
      { id: 'emotion', type: 'choice', label: 'Emotion', default: 'neutral', options: [
        { id: 'neutral', label: 'Neutral', params: { exaggeration: 0.5, cfg_weight: 0.5 } },
        { id: 'warm', label: 'Warm', params: { exaggeration: 0.6, cfg_weight: 0.5 } },
        { id: 'excited', label: 'Excited', params: { exaggeration: 0.9, cfg_weight: 0.3 } },
        { id: 'calm', label: 'Calm', params: { exaggeration: 0.3, cfg_weight: 0.5 } },
        { id: 'serious', label: 'Serious', params: { exaggeration: 0.4, cfg_weight: 0.6 } },
      ] },
      { id: 'language', type: 'choice', label: 'Language', default: 'en', options: speechLanguages },
    ],
    prompt: '{script}',
    cover: covers.sky,
  }),
  open({
    id: 'voice-clone', name: 'Voice clone', kind: 'audio', category: 'voice', featured: true,
    blurb: 'Turn a short sample of your voice into a reusable voice.',
    runsOn: 'Chatterbox', workflow: 'chatterbox_clone',
    inputs: [
      { id: 'audio', type: 'audio', label: 'Sample, 10 to 30 seconds' },
      { id: 'name', type: 'text', label: 'Voice name', placeholder: 'My narrator voice' },
    ],
    // Chatterbox clones from the sample itself (its first 10 seconds count), so the run reads a short
    // preview line in the new voice.
    prompt: 'Hello, this is {name}. It is ready to read anything you write.',
    cover: covers.dusk,
  }),
  open({
    id: 'voice-change', name: 'Voice change', kind: 'audio', category: 'voice',
    blurb: 'Make a recording sound like another voice, same timing and emotion.',
    runsOn: 'Chatterbox', workflow: 'chatterbox_vc',
    inputs: [
      // The graph changes the first 27 seconds, as the Chatterbox template does.
      { id: 'audio', type: 'audio', label: 'Recording, up to 27 seconds' },
      { id: 'voice', type: 'voice', label: 'New voice' },
    ],
    cover: covers.rose,
  }),
  open({
    id: 'music', name: 'Music', kind: 'audio', category: 'sound', featured: true,
    blurb: 'Make a song or instrumental from a short brief.',
    runsOn: 'MiniMax Music 3', workflow: 'minimax_music3',
    inputs: [
      { id: 'brief', type: 'longtext', label: 'Describe the music', placeholder: 'Warm lo-fi hip hop, mellow keys, soft vinyl crackle, 80 bpm' },
      // MiniMax's own section tag stands for no lyrics.
      { id: 'lyrics', type: 'longtext', label: 'Lyrics', optional: true, blank: '[Instrumental]', placeholder: 'Leave empty for an instrumental' },
      { id: 'length', type: 'choice', label: 'Length', default: '30', options: [
        { id: '30', label: '30 seconds', params: { duration: 30 } },
        { id: '60', label: '1 minute', params: { duration: 60 } },
        { id: '120', label: '2 minutes', params: { duration: 120 } },
      ] },
    ],
    bindings: { lyrics: 'lyrics' },
    prompt: '{brief}',
    cover: covers.night,
  }),
  open({
    id: 'sound-effect', name: 'Sound effect', kind: 'audio', category: 'sound', featured: true,
    blurb: 'Describe a sound and hear it.',
    runsOn: 'Stable Audio 3 Medium', workflow: 'stable_audio3',
    inputs: [
      { id: 'sound', type: 'text', label: 'Sound', placeholder: 'A heavy wooden door creaks open in a stone hall' },
      { id: 'length', type: 'choice', label: 'Length', default: '5', options: [
        { id: '2', label: '2 seconds', params: { duration: 2 } },
        { id: '5', label: '5 seconds', params: { duration: 5 } },
        { id: '10', label: '10 seconds', params: { duration: 10 } },
      ] },
    ],
    prompt: '{sound}. Clean, isolated recording, no music.',
    cover: covers.peach,
  }),
]

export const people = [...characters, ...voice]
