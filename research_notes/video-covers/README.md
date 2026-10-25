# Video cover prompts

Use real-camera texture: motivated light, imperfect surfaces, tactile detail and natural skin where people appear. Give every clip a specific visual hook that reads immediately at card size and shows the feature's result.

Target fal `blackforestlabs/flux-3/text-to-video`: five seconds, 16:9 at 720p. The manifest retains aspect and duration metadata; the render configuration supplies resolution. The encoder handles loop seams with a crossfade, so action and camera movement do not need to reset.

The render script appends shared real-camera and no-text guards. Keep scene prompts free of repeated guard boilerplate. Use original fictional adults and objects; avoid readable text, screens with interfaces, signage, logos, brands and celebrities.

The 60 todo prompts were rewritten in round 2. The three done entries remain unchanged, including `influencer` targeting `ai-influencer.mp4`. See [the round 2 review](round-2-review.md) for validation, subject counts and a one-line hook for every id.
