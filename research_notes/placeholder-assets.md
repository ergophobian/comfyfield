# Placeholder asset inventory

Inventory date: October 19, 2026. Branch: `placeholder-assets`.

## Scope and references

The current catalog contains 479 formats (450 gallery-valid). The original estimate of about 241 explicit gradient covers does not include generated effect entries. All format ids appear below, including planned formats.

The local Higgsfield audit describes result-led catalog thumbnails, app examples, before/after framing, contact sheets for shot tools, product campaign imagery, and cinematic studio promotions. Its linked screenshot files are absent from this checkout; no competitor art was copied. Sources: [Apps audit](Higgsfield%20feature%20audit/sections/03_apps.md), [Tools and studios audit](Higgsfield%20feature%20audit/sections/02_tools_and_studios.md), [Landing audit](Higgsfield%20feature%20audit/sections/01_overview.md).

## Priorities

- Priority a: all 8 app hubs, all 17 category lookup entries, all 39 tool cards, all 16 open model cards by medium, the 3 Explore slides, studio heroes, and the Library empty state. Text-only category rails remain text-only; their art lookup is ready for cards.
- Priority b: every explicitly featured format, the first four returned by `featuredFor` for each medium, the first entry in every `railFor` media/category, and the first five valid formats of every hub. This is a reproducible set of 62 unique formats.
- Priority c: the remaining Explore effect and motion rows first, then additional result-specific looks and effects.

## Art direction and implementation

Original fictional adults and original objects only. Premium editorial photography, warm ivory, indigo and lavender, soft dimensional light. Effects show the transformed result; camera moves show the resulting framing. Sound covers are conceptual sculptures rather than claims of generated audio. No text, logos, trademarks, celebrities, copyrighted characters or Higgsfield art.

Built-in Codex image generation only. No app provider calls or provider keys. Artwork is illustrative; it is never inserted into the user Library as saved generations. Existing uploaded faces, products, logos, user results, functional icons, upload targets and skeleton loading states remain user data or controls.

One lookup in `src/lib/formats/art.js` and one lazy image renderer in `src/components/Art.jsx` supply existing card and hero components. Original format `cover:` fields stay intact as fallbacks. Images declare dimensions; slots reserve their existing aspect ratios. Unmapped or failed images expose the original gradient.

## Coverage summary

Generated originals: 98. Optimized files: 123. Art bytes: 8,398,216. Format ids with generated covers: 103. Remaining format gradients: 376.

## Format inventory

| Format id | Feature | Priority | State | Expected visual |
| --- | --- | --- | --- | --- |
| cam-dolly-in | Dolly in | b | Generated | The camera glides slowly toward your subject. |
| cam-dolly-out | Dolly out | c | Generated | The camera pulls back to reveal the whole scene. |
| cam-pan-left | Pan left | c | Generated | The camera turns to sweep left across the scene. |
| cam-pan-right | Pan right | c | Generated | The camera turns to sweep right across the scene. |
| cam-tilt-up | Tilt up | c | Generated | The camera tilts up from your subject to what is above. |
| cam-tilt-down | Tilt down | c | Generated | The camera tilts down from above to land on your subject. |
| cam-tilt-reveal | Tilt reveal | c | Generated | The camera tilts up from the ground to reveal the subject. |
| cam-zoom-in | Zoom in | c | Generated | The lens zooms in slowly on your subject. |
| cam-zoom-out | Zoom out | c | Generated | The lens zooms out to show the wider scene. |
| cam-tracking | Tracking shot | c | Generated | The camera moves alongside your subject. |
| cam-handheld | Handheld | c | Generated | A loose camera that feels shot on the spot. |
| cam-static | Still camera | c | Generated | The camera holds still while the scene comes alive. |
| cam-crane-up | Crane up | c | Gradient fallback | The camera rises high above the scene. |
| cam-boom-down | Boom down | c | Gradient fallback | The camera drops from high above to eye level. |
| cam-fpv-dive | FPV dive | c | Gradient fallback | A drone dives down and races through the scene. |
| cam-drone-flyover | Drone flyover | c | Gradient fallback | A drone sweeps over the scene from high above. |
| cam-orbit | Orbit | c | Gradient fallback | The camera circles around your subject. |
| cam-bullet-time | Bullet time | c | Gradient fallback | Time freezes while the camera sweeps around. |
| cam-crash-zoom | Crash zoom | c | Gradient fallback | A sudden punch in on your subject. |
| cam-dolly-zoom | Dolly zoom | c | Gradient fallback | The background stretches while the subject stays put. |
| cam-robo-arm | Robo arm | c | Gradient fallback | A fast robotic sweep that stops dead on a new angle. |
| cam-spiral-up | Spiral up | c | Gradient fallback | The camera circles and rises above your subject. |
| cam-roll-360 | 360 roll | c | Gradient fallback | The frame rolls a full turn as the camera pushes in. |
| cam-sky-pullback | Sky pull back | c | Gradient fallback | The camera rockets back until your subject is a speck. |
| cam-whip-pan | Whip pan | c | Gradient fallback | A fast pan that streaks into the next moment. |
| cam-snorricam | Snorricam | c | Gradient fallback | The camera rides on your subject as the world sways. |
| cam-pov-walk | POV walk | c | Gradient fallback | See the scene through the eyes of someone walking in. |
| cam-car-mount | Car mount | c | Gradient fallback | A camera rigged to a car with the world streaming past. |
| cam-earthquake | Earthquake shake | c | Gradient fallback | The ground rumbles and the frame shakes hard. |
| cam-hyperlapse | Hyperlapse | c | Gradient fallback | The camera moves forward while time races past. |
| cam-rack-focus | Rack focus | c | Gradient fallback | Focus shifts from the foreground onto your subject. |
| cam-turntable | Turntable | c | Gradient fallback | Your subject turns in place as if on a lazy susan. |
| cam-window-push | Through the window | c | Gradient fallback | The camera pushes through a window into the scene. |
| cam-slow-shutter | Slow shutter | c | Gradient fallback | Motion smears into dreamy streaks around your subject. |
| cam-mix | Mix two moves | c | Gradient fallback | Chain two camera moves into one continuous shot. |
| turn-to-sand | Turn to sand | b | Generated | Your subject crumbles into drifting sand. |
| origami-fold | Origami fold | c | Generated | The scene folds itself into paper origami. |
| snow-globe | Snow globe | c | Generated | The scene shrinks into a snow globe. |
| time-lapse | Time lapse | c | Generated | Hours pass in seconds around your subject. |
| burst-into-petals | Burst into petals | c | Generated | The subject bursts into a swirl of flower petals. |
| paint-splash | Paint splash | c | Generated | Bright paint splashes across the frame. |
| floating-fall | Floating fall | c | Generated | Your subject drifts down through the sky like a feather. |
| high-flip | High flip | c | Generated | Your subject springs up into a high backflip. |
| studio-slide | Studio slide | c | Generated | The background slides away to reveal a photo studio. |
| eyes-in | Eyes in | c | Generated | The camera dives into an eye and out into another world. |
| street-giant | Street giant | c | Generated | Your subject towers over a busy street. |
| world-morph | World morph | c | Generated | The world around your subject changes again and again. |
| selfception | Selfception | c | Gradient fallback | The camera pulls back to find the photo inside itself. |
| roller-coaster | Roller coaster | b | Generated | Your subject rides the front car of a roller coaster. |
| glitch-out | Glitch out | c | Gradient fallback | The frame breaks into digital glitches. |
| turn-to-hologram | Hologram | c | Gradient fallback | Your subject flickers into a glowing hologram. |
| turn-to-ice | Turn to ice | c | Gradient fallback | Frost creeps over your subject until it freezes solid. |
| shatter | Shatter | c | Gradient fallback | The picture cracks like glass and bursts apart. |
| portal | Portal | c | Gradient fallback | A glowing portal opens and your subject steps through. |
| pixel-dissolve | Pixel dissolve | c | Gradient fallback | Your subject breaks apart into floating pixels. |
| balloon-lift | Balloon lift | c | Gradient fallback | A bunch of balloons lifts your subject into the sky. |
| cinema-shot | Cinema shot | b | Generated | Pick the camera, lens and move, then describe the scene. |
| first-last-frame | First and last frame | c | Gradient fallback | Set the first and last frame, get the shot in between. |
| draw-to-video | Draw to video | c | Gradient fallback | Draw arrows on a frame to show what moves where. |
| multi-shot | Multi-shot scene | c | Gradient fallback | Describe a scene and get one video cut into several shots. |
| storyboard | Storyboard | b | Generated | Turn a story idea into a set of consistent shots. |
| transition | Transition | b | Generated | Carry one shot into the next without a hard cut. |
| explainer | Explainer video | c | Generated | Type a topic and get a narrated explainer. |
| faceless | Faceless video | c | Generated | Turn a topic into a narrated short with no one on camera. |
| motion-graphics | Motion graphics | c | Gradient fallback | Describe animated titles, charts or shapes and get them rendered. |
| cam-arc-left | Arc left | c | Gradient fallback | The camera curves around your subject to the left. |
| cam-arc-right | Arc right | c | Gradient fallback | The camera curves around your subject to the right. |
| cam-dolly-left | Dolly left | c | Gradient fallback | The camera slides sideways to the left. |
| cam-dolly-right | Dolly right | c | Gradient fallback | The camera slides sideways to the right. |
| cam-overhead | Overhead | c | Gradient fallback | A top down camera that follows your subject. |
| cam-lazy-susan | Lazy susan | c | Gradient fallback | The camera turns around your subject while they hold still. |
| cam-orbit-360 | 360 orbit | c | Gradient fallback | The camera circles all the way around your subject. |
| cam-crash-zoom-out | Crash zoom out | c | Gradient fallback | A sudden snap back that reveals the whole scene. |
| cam-dolly-zoom-out | Dolly zoom out | c | Gradient fallback | Pull back while zooming in for a vertigo warp. |
| cam-earth-zoom-out | Zoom out to space | c | Gradient fallback | Pull back from your subject all the way out to the planet. |
| cam-glam | Glam sweep | c | Gradient fallback | A high speed sweep around your subject in slow motion. |
| cam-yoyo-zoom | Zoom bounce | c | Gradient fallback | A rapid zoom in and straight back out. |
| cam-glass-floor | Glass floor | c | Gradient fallback | Look up at your subject from beneath a glass floor. |
| cam-through-and-out | Through and out | c | Gradient fallback | The camera backs out through an object to reveal the scene. |
| cam-double-dolly | Double dolly | c | Gradient fallback | You and the camera travel together as the world slides by. |
| cam-car-chase | Car chase | c | Gradient fallback | Chase a speeding car from dynamic angles. |
| cam-object-pov | Object POV | c | Gradient fallback | See the scene from the point of view of an object. |
| cam-roll-transition | Roll transition | c | Gradient fallback | Roll from one frame into the next like a turning wheel. |
| cam-rap-flex | Rap video moves | c | Gradient fallback | Low angles, slides and slow zooms like a rap video. |
| cam-wiggle | Wiggle push | c | Gradient fallback | A playful little shake on a slow push in. |
| cam-mouth-in | Into the mouth | c | Gradient fallback | A quick zoom into the mouth for a comic beat. |
| cam-head-lock | Head lock | c | Gradient fallback | The camera locks onto the head while the world shifts. |
| cam-dutch-angle | Dutch angle | c | Gradient fallback | A tilted horizon that adds tension. |
| cam-incline | Tilted world | c | Gradient fallback | The world tilts steeply around your subject. |
| cam-dirty-lens | Dirty lens | c | Gradient fallback | Smudges, dust and water drops on the lens. |
| cam-lens-crack | Lens crack | c | Gradient fallback | The lens cracks across the shot. |
| cam-lens-flare | Lens flare | c | Gradient fallback | Bright streaks and flares sweep across the lens. |
| cam-fast-people | People in fast forward | c | Gradient fallback | People race by while the setting stays calm. |
| cam-downhill-pov | Downhill POV | c | Gradient fallback | Ride down a slope in first person. |
| cam-mix-fpv-timelapse | FPV over a time lapse | c | Gradient fallback | A drone races over the land as time speeds up. |
| cam-mix-snorricam-shutter | Snorricam slow shutter | c | Gradient fallback | You stay locked in frame while the world smears. |
| cam-mix-zoom-tentacles | Crash zoom tentacles | c | Gradient fallback | A fast zoom in as tentacles curl out of the eyes. |
| cam-mix-zoom-punch | Crash zoom punch | c | Gradient fallback | The camera punches in as a stage punch lands. |
| cam-mix-chrome-eyes | Chrome eyes in | c | Gradient fallback | Chrome spreads as the camera dives into mirror eyes. |
| cam-mix-run-fire | Run while on fire | c | Gradient fallback | Sprint through the scene wrapped in flames. |
| cam-mix-fly-fire | Fly while on fire | c | Gradient fallback | Soar through the sky like a comet. |
| cam-mix-chase-blast | Chase and blast | c | Gradient fallback | A car chase as a building explodes beside the road. |
| agent-reveal | Suited agent | c | Gradient fallback | Glitch, then morph into a sharp suited agent. |
| angel-wings | Angel wings | c | Gradient fallback | Feathered wings unfold behind your shoulders. |
| black-tears | Black tears | c | Gradient fallback | Dark ink streams from the eyes. |
| bloom-mouth | Flower mouth | c | Gradient fallback | Petals and flowers spill from an open mouth. |
| building-explosion | Building explosion | c | Gradient fallback | A building blows up in the scene. |
| car-explosion | Car explosion | c | Gradient fallback | A car bursts into flames and debris. |
| clone-burst | Clone burst | c | Gradient fallback | You split into copies that burst outward. |
| turn-to-diamond | Turn to diamond | c | Gradient fallback | Your body turns into faceted, sparkling diamond. |
| duplicate | Duplicate | c | Gradient fallback | You split into identical copies side by side. |
| fire-breath | Fire breath | c | Gradient fallback | Breathe out a blast of flame. |
| floating-fish | Air fish | c | Gradient fallback | A pale blue fish swims through the air around you. |
| flood | Flood | c | Gradient fallback | Water spreads and rises to fill the space. |
| floral-eyes | Flower face | c | Gradient fallback | Flowers blossom out of your face. |
| glowing-fish | Glow fish school | c | Gradient fallback | Glowing fish swim around you in the dark. |
| glowshift | Glow change | c | Gradient fallback | A soft glow surrounds you as you become someone new. |
| confetti-head | Confetti head | c | Gradient fallback | Your head pops into a burst of confetti. |
| floating-head | Floating head | c | Gradient fallback | Your head lifts off and floats away like a balloon. |
| inner-light | Light from within | c | Gradient fallback | Light builds and shines from inside you. |
| invisible | Invisible body | c | Gradient fallback | You vanish, leaving only your movement behind. |
| jelly-drift | Sky jellyfish | c | Gradient fallback | Glowing jellyfish float in the air around you. |
| stone-skin | Stone skin | c | Gradient fallback | Your skin hardens and cracks into grey stone. |
| melting | Melting | c | Gradient fallback | You soften and drip as if in great heat. |
| morph-skin | Ripple morph | c | Gradient fallback | Your skin ripples as you morph into someone new. |
| paparazzi | Paparazzi | c | Gradient fallback | Camera flashes burst all around you. |
| sandstorm | Sandstorm | c | Gradient fallback | Sand blasts through and engulfs the scene. |
| set-on-fire | Set on fire | c | Gradient fallback | You burst into stylized flames. |
| skin-surge | Under the skin | c | Gradient fallback | Shapes push out through the surface of your skin. |
| spirit-leap | Spirit leap | c | Gradient fallback | Your spirit leaps out of your body. |
| tentacle-eyes | Tentacles | c | Gradient fallback | Tentacles writhe out of the eyes. |
| lightning-eyes | Lightning eyes | c | Gradient fallback | Your eyes glow as lightning crackles around you. |
| turn-to-metal | Chrome body | c | Gradient fallback | Your skin turns into chrome, silver or gold. |
| wind-blast | Headwind | c | Gradient fallback | Fierce wind whips your hair and clothes. |
| garden-bloom | Overgrown | c | Gradient fallback | Flowers and greenery grow all over you. |
| levitation | Levitation | c | Gradient fallback | You rise slowly off the ground. |
| powder-burst | Powder burst | c | Gradient fallback | Colored powder erupts around you. |
| datamosh | Datamosh | c | Gradient fallback | Glitchy pixels smear and bleed between frames. |
| blast-to-dust | Blast to dust | c | Gradient fallback | A blast, then the building crumbles to dust. |
| invisible-float | Invisible float | c | Gradient fallback | You vanish and rise, leaving only your clothes floating. |
| storm-rise | Storm rise | c | Gradient fallback | Lift into the air amid crackling lightning. |
| storm-metal | Storm metal | c | Gradient fallback | Lightning strikes turn you to metal. |
| storm-wind | Storm wind | c | Gradient fallback | Lightning eyes while a gale blasts your face. |
| molten-metal | Molten metal | c | Gradient fallback | Turn to chrome, then melt into liquid metal. |
| action-run | Action run | c | Gradient fallback | Sprint through the scene with a shaky action camera. |
| high-kick | High kick | c | Gradient fallback | A powerful high kick with fast leg motion. |
| slam-dunk | Slam dunk | c | Gradient fallback | Leap and slam a basketball home. |
| boxing | Boxing combo | c | Gradient fallback | Quick jabs, hooks and head movement. |
| catwalk | Catwalk | c | Gradient fallback | Strut a confident runway walk. |
| stage-punch | Stage punch | c | Gradient fallback | A comic stage punch lands in slow motion. |
| kiss | Kiss | c | Gradient fallback | A tender kiss in soft focus and slow motion. |
| moonwalk-left | Moonwalk left | c | Gradient fallback | Glide backward to the left in a moonwalk. |
| moonwalk-right | Moonwalk right | c | Gradient fallback | Glide backward to the right in a moonwalk. |
| pressed-to-glass | Pressed to glass | c | Gradient fallback | Squashed against an invisible pane of glass. |
| skate-cruise | Skate cruise | c | Gradient fallback | Cruise down the street on a skateboard. |
| skate-glide | Skate glide | c | Gradient fallback | Roll along in one smooth skateboard glide. |
| skate-ollie | Skate ollie | c | Gradient fallback | Pop an ollie off the ground. |
| ski-carve | Ski carving | c | Gradient fallback | Carve clean, fast turns on skis. |
| ski-powder | Ski powder | c | Gradient fallback | Cut through deep powder on skis. |
| snowboard-carve | Snowboard carving | c | Gradient fallback | Deep snowboard turns that throw up spray. |
| snowboard-powder | Snowboard powder | c | Gradient fallback | Float through fresh powder on a snowboard. |
| burning-figure | Burning figure | c | Gradient fallback | Flames catch and spread until you glow like a living fire. |
| scrapbook | Scrapbook page | c | Gradient fallback | Your photo becomes a cut and paste scrapbook page. |
| pigeon-street | Pigeon street | c | Gradient fallback | An absurd crowd of pigeons takes over the street. |
| pearl-portrait | Pearl portrait | c | Gradient fallback | Become a Dutch golden age portrait, split with your photo. |
| act-natural | Straight face | c | Gradient fallback | Keep a straight face while chaos unfolds behind you. |
| monster-dab | Dab with a monster | c | Gradient fallback | A friendly monster pops in and dabs with you. |
| clones | Clones | c | Gradient fallback | You multiply into a row of copies. |
| cutout | Paper puppet | c | Gradient fallback | You become a flat paper cutout puppet. |
| mighty-fighter | Power up fighter | c | Gradient fallback | Power up into a fighting game hero. |
| moonwalk | Moonwalk | c | Gradient fallback | Moonwalk all the way across the frame. |
| architecture-wave | Rippling city | c | Gradient fallback | The buildings ripple like a wave. |
| out-of-the-screen | Out of the screen | c | Gradient fallback | Step out of a cinema screen as an ancient army follows. |
| one-eyed-giant | One-eyed giant | c | Gradient fallback | A gentle one-eyed giant peers at you in a dreamy painting. |
| blue-depth | Deep blue sink | c | Gradient fallback | Sink slowly into a deep blue ocean. |
| wild-ride | Breakneck ride | c | Gradient fallback | Hang on through a wild, breakneck ride. |
| infinite-clones | Endless clones | c | Gradient fallback | Endless copies of you stretch to the horizon. |
| superstar | Stadium star | c | Gradient fallback | Step into the spotlight to a roaring crowd. |
| skate-dog | Skateboarding dog | c | Gradient fallback | A little dog rolls past you on a skateboard. |
| smash-and-grab | Giant hand grab | c | Gradient fallback | A giant hand smashes in and whisks you away. |
| lacewalker | Lace body | c | Gradient fallback | You turn into delicate white lace. |
| boarding-pass | Boarding pass | c | Gradient fallback | Your photo becomes a boarding pass, then off you fly. |
| lidar-scan | Lidar scan | c | Gradient fallback | A point cloud scan sweeps through your scene. |
| fallen-angel | Winged painting | c | Gradient fallback | Become a brooding winged figure in a classical painting. |
| fairytale-castle | Castle at twilight | c | Gradient fallback | Arrive at a fairytale castle at twilight. |
| frozen-in-motion | Frozen moment | c | Gradient fallback | The moment freezes as the camera drifts through it. |
| vanish | Puff of smoke | c | Gradient fallback | You disappear from the shot in a puff of smoke. |
| stop-world | Everyone freezes | c | Gradient fallback | Time stops for everything but you. |
| look-phone-flash | Phone flash at night | b | Generated | Light a candid night shot with a harsh phone flash. |
| look-golden-hour | Golden hour editorial | c | Generated | Warm low sun and polished magazine framing. |
| look-studio-fashion | Studio fashion | c | Generated | Shoot on a clean backdrop with crisp fashion lighting. |
| look-street-style | Street style | c | Generated | Catch the subject mid stride on a busy sidewalk. |
| look-magazine-90s | 90s magazine | c | Gradient fallback | Put the subject on a glossy 1990s cover, masthead and all. |
| look-cctv | CCTV still | c | Gradient fallback | Turn the scene into a grainy security camera frame. |
| look-drone-top-down | Drone top down | c | Gradient fallback | Look straight down from high above. |
| look-tilt-shift | Tilt shift miniature | c | Gradient fallback | Make a real scene look like a tiny model. |
| look-disposable | Disposable camera | c | Gradient fallback | Add point and shoot flash and cheap film grain. |
| look-film-noir | Film noir | c | Generated | Hard shadows and smoky black and white. |
| look-film-70s | 70s film stock | c | Gradient fallback | Warm faded color and soft grain from the seventies. |
| look-instant | Instant photo | c | Gradient fallback | Print the moment as an instant photo with a white border. |
| look-fisheye-skate | Fisheye skate video | c | Gradient fallback | Get low, close and warped like an old skate tape. |
| look-watercolor | Watercolor | c | Generated | Paint in soft washes and blooms on textured paper. |
| look-oil-painting | Oil painting | c | Generated | Rich color and thick, visible brush strokes. |
| look-ink-sketch | Ink sketch | c | Generated | Draw it in loose pen lines and hatching. |
| look-anime-cel | Anime cel | c | Gradient fallback | A hand painted frame from a classic anime film. |
| look-comic-book | Comic book | c | Gradient fallback | Bold inks, halftone dots and a speech bubble. |
| look-claymation | Claymation still | c | Gradient fallback | Sculpt the scene as handmade clay figures on a tiny set. |
| look-pixel-art | Pixel art | c | Generated | Crisp pixels and a limited retro palette. |
| look-low-poly | Low poly | c | Gradient fallback | Build it from faceted 3D shapes with soft flat shading. |
| look-vaporwave | Vaporwave | c | Gradient fallback | Neon pink, teal sunsets and retro computer dreams. |
| moodboard | Match a moodboard | c | Generated | Borrow the look of your own reference images. |
| brand-colors | Brand colors | c | Gradient fallback | Put your brand palette into any picture. |
| expand | Expand | b | Generated | Extend the picture past its edges. |
| inpaint | Paint to change | c | Gradient fallback | Paint over part of a picture and say what it should become. |
| erase | Erase an object | c | Gradient fallback | Remove anything and fill the gap naturally. |
| replace | Replace an object | c | Gradient fallback | Swap one thing in a picture for another. |
| layers | Split into layers | c | Gradient fallback | Pull each object and the background onto its own layer. |
| try-on | Try on outfits | b | Generated | Dress the person in a photo in clothes from other photos. |
| restyle | Restyle | c | Gradient fallback | Redraw a picture in a new art style. |
| copy-style | Copy a style | c | Gradient fallback | Redraw your picture in the look of another one. |
| sketch-to-image | Sketch to image | b | Generated | Turn a rough drawing into a finished picture. |
| product-shot | Product shot | b | Generated | Put your product in a clean, styled scene. |
| place-product | Place a product | c | Gradient fallback | Drop your product into a photo you already have. |
| swap-element | Swap an element | b | Generated | Change one thing in a video and keep the rest. |
| motion-transfer | Motion transfer | c | Gradient fallback | Make the character in a photo copy the moves in a video. |
| face-swap-video | Video face swap | b | Generated | Swap the face in a video for your own face or a saved character. |
| restyle-video | Restyle video | c | Gradient fallback | Redraw a whole video in a new style. |
| video-relight | Relight video | c | Gradient fallback | Change the lighting of a video after it was shot. |
| color-grade | Color grade | c | Gradient fallback | Give a video a film look in one click. |
| clone-edit | Clone an edit | c | Gradient fallback | Copy the cuts and pacing of any edit with your own cast. |
| reshoot | Re-shoot from a new angle | c | Gradient fallback | See the same take from another camera position. |
| extend-video | Extend video | c | Gradient fallback | Keep a video going past its last frame. |
| video-upscale | Video upscale | b | Generated | More resolution and detail, same video. |
| slow-motion | Slow motion | c | Gradient fallback | Add in-between frames for smooth slow motion. |
| video-bg-remove | Video background remove | b | Generated | Cut the subject out of every frame of a video. |
| skin-retouch | Skin retouch | b | Generated | Even out skin and keep the face true to life. |
| character-sheet | Character sheet | b | Generated | Turn one photo into a sheet of angles and expressions. |
| character-scene | Character in any scene | b | Generated | Put your character anywhere and keep their face. |
| face-swap | Face swap | b | Generated | Swap the face in a photo for your own face or a saved character. |
| character-swap | Character swap | b | Generated | Replace the main person with your own face or a saved character, same pose and scene. |
| headshot | Professional headshot | b | Generated | Turn a casual photo of you into a polished headshot. |
| influencer-post | AI influencer post | c | Gradient fallback | A ready-to-post set of photos of your character. |
| ai-influencer-video | AI influencer video | c | Gradient fallback | Your character talks to camera in a ready-to-post video. |
| talking-head | Talking head | b | Generated | Make a face in a photo speak your script. |
| lipsync | Lipsync | c | Gradient fallback | Match the lips in a video to new audio. |
| dub | Dub into another language | c | Gradient fallback | Translate the speech, keep the voice and match the lips. |
| add-sound | Add sound to video | c | Gradient fallback | Generate sound that matches what happens on screen. |
| tts | Text to speech | b | Generated | Read any script aloud in a natural voice. |
| voice-clone | Voice clone | b | Generated | Turn a short sample of your voice into a reusable voice. |
| voice-change | Voice change | c | Gradient fallback | Make a recording sound like another voice, same timing and emotion. |
| music | Music | b | Generated | Make a song or instrumental from a short brief. |
| sound-effect | Sound effect | b | Generated | Describe a sound and hear it. |
| product-ad | Product to ad | b | Generated | Turn a product into a short vertical ad. |
| ugc-ad | UGC ad | c | Gradient fallback | Your character talks about your product to camera. |
| ad-variants | Ad variants | b | Generated | Spin one ad into many versions to test. |
| link-to-ads | Ads from a link | c | Gradient fallback | Paste a product page and get a set of ready ads. |
| recreate-ad | Recreate an ad | c | Gradient fallback | Remake an ad shot for shot with your own product. |
| product-spin | Product spin | c | Gradient fallback | A smooth 360 degree turn of your product. |
| packshot | Bullet time packshot | b | Generated | Freeze time and sweep the camera around your product. |
| billboard | Billboard mockup | b | Generated | See your ad out in the world before you print it. |
| truck-ad | Truck ad | b | Generated | Watch your ad roll down a city street on the side of a truck. |
| hook-check | Hook check | c | Gradient fallback | Score the first three seconds of your ad and learn how to fix them. |
| plush-toy | Plush toy | b | Generated | Turn anyone or anything into a soft plush toy. |
| figure-box | Boxed figure | b | Generated | Make your photo a collectible figure in its box. |
| sticker | Die-cut sticker | b | Generated | Turn your photo into a sticker with a white edge. |
| signboard | Signboard | c | Gradient fallback | Put your words on a sign in the picture. |
| game-style | Video game style | b | Generated | See your photo as a scene from a video game. |
| meme | Meme maker | b | Generated | Add top and bottom captions to any photo. |
| tiny-creature | Tiny creature | c | Gradient fallback | Shrink a pet or toy into a palm-sized creature. |
| behind-the-scenes | Behind the scenes | b | Generated | Pull back to reveal your photo was shot on a film set. |
| life-sim | Life sim game | b | Generated | Drop yourself into a cozy life simulation game. |
| game-show | Game show contestant | b | Generated | Put yourself behind a podium on a bright TV game show. |
| cloud-surfing | Cloud surfing | b | Generated | Surf across a sea of clouds high in the sky. |
| photocard | Idol photocard | c | Gradient fallback | Turn a portrait into a glossy pop idol photocard. |
| all-fine | Everything is fine | b | Generated | Sip calmly while the room goes up in cartoon flames. |
| brick-toy | Brick toy | c | Gradient fallback | Rebuild your photo out of plastic toy bricks. |
| coloring-page | Coloring book page | c | Gradient fallback | Turn your photo into line art ready to color in. |
| angles | Any angle | b | Generated | See your photo from any camera position, even from behind. |
| whats-next | What happens next | c | Gradient fallback | Eight ideas for the next moment of your scene. |
| shots | Shot grid | b | Generated | Nine cinematic angles of one scene on a single sheet. |
| zooms | Zoom grid | c | Generated | Nine framings of one image, from a tiny detail to a wide view. |
| photo-grade | Photo grade | c | Generated | Grade a photo with film looks, then fine tune it. |
| ai-stylist | Virtual stylist | b | Generated | Dress yourself in a full look or piece by piece, then set the pose and backdrop. |
| relight-photo | Move the light | b | Generated | Move a light around your photo and redraw the shadows. |
| style-snap | Ready-made outfits | c | Gradient fallback | Swap your outfit for a ready-made look, same pose and light. |
| outfit-vending | Vending machine outfit | c | Gradient fallback | Every piece you wear on display in a glowing vending machine. |
| outfit-shot | Garment photoshoot | c | Gradient fallback | Put up to three garments on a model for a quick photoshoot clip. |
| video-character-swap | Video character swap | b | Generated | Replace the person in a video with your character, same moves and timing. |
| likeness-record | Likeness consent | c | Gradient fallback | Record how your face may be used, saved with your character. |
| outfit-reel | Outfit reel | c | Gradient fallback | One selfie in, a beat-cut reel of different outfits out. |
| beat-cut-outfits | Beat cut outfits | c | Gradient fallback | A 10 second outfit video cut to the beat of a track. |
| sticker-match-cut | Sticker pop cuts | c | Gradient fallback | Turn the person in a clip into a glittering sticker that pops on each cut. |
| breakdown | Labeled flat lay | c | Gradient fallback | Lay out everything in a photo with labels, like a flat lay. |
| asmr-add-on | ASMR product whisper | c | Gradient fallback | Your character whispers your line about your product, ASMR style. |
| asmr-classic | ASMR moment | b | Generated | Bring a photo to life with soft whispers and tingly sounds, picture unchanged. |
| poster | Promo poster | c | Gradient fallback | Recast your product as a bold promo poster that comes alive. |
| bullet-time-scene | Frozen product scene | c | Gradient fallback | Freeze time and orbit your product in a scene built around it. |
| chameleon | Color match chameleon | c | Gradient fallback | A chameleon shifts its skin to match your product. |
| asmr-host | ASMR studio host | c | Gradient fallback | Turn a photo into a host whispering to camera in an ASMR studio. |
| macro-scene | Macro lifestyle set | c | Gradient fallback | Your product in macro detail inside a lifestyle set. |
| magic-button | Button press reveal | c | Gradient fallback | Drop your product into a whimsical commercial moment. |
| giant-product | Skyline giant | c | Gradient fallback | Your product towers over a city skyline. |
| kick-ad | Rival kick | c | Gradient fallback | Your product wins as a plain rival gets kicked out of frame. |
| graffiti-ad | Graffiti wall | c | Gradient fallback | Your product sprayed onto a city wall as graffiti. |
| bullet-time-splash | Product burst | c | Gradient fallback | Your product bursts apart in slow motion bullet time. |
| fridge-ad | Fridge grab | c | Gradient fallback | A fridge opens and a hand reaches for your product. |
| volcano-ad | Volcano hero | c | Gradient fallback | Your product stands firm before an erupting volcano. |
| macroshot-product | Extreme close up | c | Gradient fallback | Film your product in extreme close up. |
| asmr-promo | ASMR product scene | c | Gradient fallback | A scripted ASMR studio scene built around your product. |
| squad-strike | Squad strike | c | Gradient fallback | Turn up to five people into a tactical game squad. |
| open-world-hero | Open world hero | c | Gradient fallback | See yourself as the hero of an open world city game. |
| render-3d | 3D viewport render | c | Gradient fallback | Render your photo as a 3D object inside a modeling scene. |
| pixel-game | 8-bit runner | c | Gradient fallback | Your character runs through a retro 8-bit world. |
| paint-app | Retro paint program | b | Generated | Frame your photo inside an old paint program on a CRT. |
| mural | Wall mural | b | Generated | See your photo as a huge mural on a city wall. |
| micro-beasts | Tiny animal crowd | b | Generated | Surround yourself with tiny animals of your choice. |
| image-bg-remove | Cut out the background | b | Generated | Cut out a person, product or pet on a clean background. |
| surprise-kiss | Surprise kiss | b | Generated | Someone pops into frame and plants a quick kiss on your cheek. |
| glossy-vinyl | Glossy vinyl | b | Generated | Restyle your look in sleek, glossy black vinyl. |
| tokyo-cover | Tokyo magazine | c | Gradient fallback | Put yourself on the cover of a Japanese street fashion magazine. |
| cafe-60s | 1960s coffee shop | c | Gradient fallback | Step into a 1960s coffee shop. |
| victory-card | Winning card | c | Gradient fallback | Print yourself on the winning card of a poker hand. |
| sand-worm | Desert worms | c | Gradient fallback | Giant worms rise out of the dunes behind you. |
| toilet-pop | Toilet pop up | c | Gradient fallback | Your head pops up out of a toilet, meme style. |
| japanese-poster | Japanese poster | c | Gradient fallback | Turn your photo into a Japanese style poster with bold type. |
| mascot | Team mascot | c | Gradient fallback | Become the mascot of a made-up sports team. |
| storm-creature | Lightning monster | c | Gradient fallback | A huge creature looms behind you in a lightning storm. |
| burning-sunset | Ember sunset | c | Gradient fallback | Sit in a fiery sunset full of drifting sparks. |
| comic-story | Comic story | c | Gradient fallback | Star in a short comic story with panels and speech bubbles. |
| mukbang | Eating show | c | Gradient fallback | Eat on camera mukbang style with snappy crash zooms. |
| melting-doodle | Doodle melt | c | Gradient fallback | Your face melts away into hand-drawn doodle lines. |
| giallo-scene | 70s thriller | c | Gradient fallback | A 1970s Italian thriller scene with a mysterious figure behind you. |
| renaissance | Gallery masterpiece | c | Gradient fallback | Hang as a classical painting in a busy gallery. |
| rap-video | Rap video | c | Gradient fallback | Your photo performs a rap with fresh lyrics and a beat. |
| open-world | Open world run | c | Gradient fallback | Run, jump and drive through an open world game as yourself. |
| booking-photo | Booking photo | c | Gradient fallback | A tongue-in-cheek police booking photo, height chart and all. |
| ghoul-night | Ghoul night | c | Gradient fallback | Pale ghouls creep out of the dark around you. |
| social-icons | Notification swarm | c | Gradient fallback | Surround your photo with floating app-style icons. |
| idol-stage | Idol stage | c | Gradient fallback | Take the stage as a pop idol. |
| banana-snack | Banana break | c | Gradient fallback | Calmly eat a banana in a plain scene. |
| mm-acid | Acid | b | Generated | Psychedelic neon color that warps and bleeds. |
| mm-cold-vision | Icy neon | c | Gradient fallback | Cold neon light and deep shadow. |
| mm-lava | Lava | c | Gradient fallback | Molten lava color flowing through the shot. |
| mm-color-trip | Color trip | c | Gradient fallback | Waves of shifting rainbow color. |
| mm-noir | Noir | c | Gradient fallback | Hard, cinematic black and white. |
| mm-ocean | Ocean | c | Gradient fallback | Liquid sea color washing over the footage. |
| mm-overexposed | Overexposed | c | Gradient fallback | Blown out, extreme exposure. |
| mm-random-glow | Glow bursts | c | Gradient fallback | Bursts of glow pop across the frame. |
| mm-toxic | Toxic | c | Gradient fallback | Radioactive neon color blasts. |
| mm-two-color | Duotone | c | Gradient fallback | A bold, high contrast two-tone print. |
| mm-ultraviolet | Ultraviolet | c | Gradient fallback | A neon blacklight glow. |
| mm-acrylic | Acrylic blocks | c | Gradient fallback | Layered blocks of acrylic color. |
| mm-canvas | Canvas | c | Gradient fallback | Hand-drawn artwork on canvas. |
| mm-comic | Comic | c | Gradient fallback | An illustrated comic book look. |
| mm-flash-comic | Comic panels | c | Gradient fallback | Punchy, high energy comic panels. |
| mm-hand-paint | Gouache | c | Gradient fallback | Loose, freehand brushwork. |
| mm-palette | Palette knife | c | Gradient fallback | Hand-painted blocks of color. |
| mm-sketch | Sketch | c | Gradient fallback | Textured hand-drawn line work. |
| mm-vintage | Inked vintage | c | Gradient fallback | A hand-inked vintage illustration. |
| mm-broken-mirror | Shattered mirror | c | Gradient fallback | Shattered mirror reflections. |
| mm-bubbles | Bubbles | c | Gradient fallback | A dreamy soap bubble texture. |
| mm-fragments | Fragments | c | Gradient fallback | Abstract fragments layered over the footage. |
| mm-multiverse | Layered worlds | c | Gradient fallback | Layers of reality colliding. |
| mm-particles | Light particles | c | Gradient fallback | Glowing particles moving through the shot. |
| mm-tracking | Motion tracking | c | Gradient fallback | Tracking lines lock onto moving objects. |
| mm-windows | Pop-up windows | c | Gradient fallback | Overlapping computer interface windows. |
| mm-smoke-poster | Smoke poster | c | Gradient fallback | A smoky psychedelic poster look. |
| mm-collage | Layered collage | c | Gradient fallback | A stacked collage of mixed materials. |
| mm-magazine | Magazine | c | Gradient fallback | A printed magazine page. |
| mm-marble | Marble | c | Gradient fallback | A sculpted marble finish. |
| mm-modern | Swiss minimal | c | Gradient fallback | Clean, geometric minimalism. |
| mm-origami | Origami | c | Gradient fallback | Crisp folded paper geometry. |
| mm-paper | Paper | c | Gradient fallback | Handmade paper texture over the footage. |
| hairstyle | Hairstyle changer | c | Gradient fallback | Try a new cut, color or beard on your own photo. |
| age-progression | Age progression | c | Gradient fallback | See yourself younger or older, still clearly you. |
| remove-text | Remove text from a photo | c | Gradient fallback | Erase captions, signs, date stamps or your own watermark. |
| new-background | Background changer | c | Gradient fallback | Put your subject in a new place with matching light. |
| unblur | Unblur a photo | c | Gradient fallback | Sharpen a blurry photo and bring faces back into focus. |
| image-upscale | Image upscale | c | Gradient fallback | More resolution and detail, same picture. |
| photo-restore | Restore an old photo | c | Gradient fallback | Repair scratches and fading, and bring back the color. |
| logo | Logo | c | Gradient fallback | Turn a business name into a logo. |
| banner | Banner | c | Gradient fallback | Web banners, display ads and social covers with a headline. |
| thumbnail | Thumbnail | c | Gradient fallback | A video thumbnail with bold words and your face. |
| slide-visuals | Slide visuals | c | Gradient fallback | Title art and backgrounds for your slides. |
| design-graphic | Posters and social graphics | c | Gradient fallback | Posters, social posts and mockups from a short brief. |
| profile-picture | Profile picture | c | Gradient fallback | Turn a selfie into a profile picture in any style. |
| portrait | Portrait styles | c | Gradient fallback | Turn a selfie into a studio, editorial or painted portrait. |
| cartoon-me | Cartoon yourself | c | Gradient fallback | Turn selfies, family photos and pets into cartoon characters. |
| anime-me | Anime yourself | c | Gradient fallback | Redraw your photo as anime or a manga panel. |
| drawing | Drawing | c | Gradient fallback | Illustrations, comic pages and tattoo designs from a description. |
| sketch | Sketch | c | Gradient fallback | Pencil, charcoal, ink or marker sketches from a description. |
| wallpaper | Wallpaper | c | Gradient fallback | Phone and desktop wallpapers with room for the clock. |
| animal | Animal | c | Gradient fallback | Pets, wildlife and creatures that do not exist. |
| ai-human | AI human | c | Gradient fallback | Create a person who does not exist, ready to save as a character. |
| edit-video | Edit a video by text | b | Generated | Describe a change and get the same video with it made. |
| video-erase | Remove an object from a video | b | Generated | Name what to erase and the gap fills in on every frame. |
| video-remove-text | Remove text from a video | b | Generated | Erase subtitles, captions and your own logos from a clip. |
| video-bg-change | Video background changer | c | Gradient fallback | Put yourself somewhere new without a green screen. |
| add-text-video | Add text to a video | c | Gradient fallback | Captions, titles, lower thirds and calls to action. |
| human-video | AI human video | b | Generated | Lifelike people on camera with real sound. |
| brand-video | Brand film | c | Gradient fallback | Brand films, logo reveals and campaign spots. |
| url-to-video | Link to video ad | c | Gradient fallback | Paste a product page and get a short video ad. |
| story-video | Story video | c | Gradient fallback | An idea in, a written, illustrated and narrated story out. |
| script-to-video | Script to video | c | Gradient fallback | Paste a script and get scenes, a narrator and subtitles. |
| animation | Animation | c | Gradient fallback | 2D, 3D, anime or clay animation with a steady cast. |
| anime-video | Anime video | c | Gradient fallback | A prompt or a photo becomes an anime scene with voices and sound. |
| podcast-clips | Podcast to clips | c | Gradient fallback | Turn an episode into vertical clips, captions and a cover. |
| clip-to-shorts | Long video to shorts | c | Gradient fallback | Find the best moments of a long video and cut them into shorts. |
| event-video | Event video | c | Gradient fallback | A narrated birthday, wedding or holiday video from your photos. |
| anniversary-video | Anniversary video | c | Gradient fallback | Your years together as a narrated picture story. |
| invitation-video | Invitation video | c | Gradient fallback | An animated invite for a wedding, birthday or party. |
| animal-video | Pet video | c | Gradient fallback | Your pet photo becomes a cute or talking clip with sound. |
| car-video | Car video | c | Gradient fallback | One car photo becomes rolling shots, orbits or drifts. |
| nature-video | Nature scene | c | Gradient fallback | A landscape photo becomes a living scene with sound. |
| sketch-to-video | Sketch to video | c | Gradient fallback | Animate a drawing and keep its hand-drawn look. |
| loop-background | Looping background | c | Gradient fallback | Seamless motion backdrops for sites, streams and slides. |
| voice-over-video | Voice over a video | c | Gradient fallback | Narrate a video with your script, or let it write one. |
| image-to-3d | Photo to 3D model | b | Generated | Turn a photo of one object into a 3D model. |
| text-to-3d | Text to 3D model | b | Generated | Describe an object and get a 3D model of it. |
| character-to-3d | Character figure | b | Generated | Turn a saved character into a 3D figure. |
| turntable | 3D turntable video | b | Generated | Spin a product or object a full turn in 3D. |
| scene-3d | 3D scene | c | Gradient fallback | Describe a place and get a 3D scene you can edit. |
| game | Game from a prompt | c | Gradient fallback | Describe a game idea and play it in your browser. |
| world-3d | Explorable world | c | Gradient fallback | Describe a place and look around it in 360 degrees. |
| melt | Melt | c | Gradient fallback | Your subject slowly melts into liquid chrome. |
| zero-gravity | Zero gravity | c | Gradient fallback | Everything in the frame floats weightlessly upward. |
| city-giant | City giant | c | Gradient fallback | The subject grows into a giant towering over a city. |
| claymation | Claymation | c | Gradient fallback | The scene turns into handmade stop motion clay. |
| nine-shots | 9 shots from one image | c | Generated | A 3 by 3 contact sheet of cinematic angles of the same scene. |
| new-angle | New angle | c | Generated | See the same image from another camera position. |
| relight | Relight | c | Generated | Keep everything, change only the light. |
| outfit-swap | Outfit swap | c | Generated | Put a garment from one photo onto the person in another. |
| remove-background | Background remove | c | Generated | A clean cutout with a transparent background. |
| upscale | Upscale | c | Generated | More resolution and detail, same picture. |
| effect-airborne-belongings | Airborne belongings | c | Gradient fallback | Turn your references into airborne belongings. Review the prompt before rendering. |
| effect-studio-cross-wipe | Studio cross-wipe | c | Gradient fallback | Turn your references into studio cross-wipe. Review the prompt before rendering. |
| effect-dive-into-the-eye | Dive into the eye | c | Gradient fallback | Turn your references into dive into the eye. Review the prompt before rendering. |
| effect-intersection-drift | Intersection drift | c | Gradient fallback | Turn your references into intersection drift. Review the prompt before rendering. |
| effect-beer-thief-chase | Beer thief chase | c | Gradient fallback | Turn your references into beer thief chase. Review the prompt before rendering. |
| effect-calm-in-the-chaos | Calm in the chaos | c | Gradient fallback | Turn your references into calm in the chaos. Review the prompt before rendering. |
| effect-two-scenes-one-crane | Two scenes, one crane | c | Gradient fallback | Turn your references into two scenes, one crane. Review the prompt before rendering. |
| effect-giant-in-the-city | Giant in the city | c | Gradient fallback | Turn your references into giant in the city. Review the prompt before rendering. |
| effect-exploded-building | Exploded building | c | Gradient fallback | Turn your references into exploded building. Review the prompt before rendering. |
| effect-droste-hand | Droste hand | c | Gradient fallback | Turn your references into droste hand. Review the prompt before rendering. |
| effect-frozen-fashion-pose | Frozen fashion pose | c | Gradient fallback | Turn your references into frozen fashion pose. Review the prompt before rendering. |
| effect-folding-city | Folding city | c | Gradient fallback | Turn your references into folding city. Review the prompt before rendering. |
| effect-shoelace-tightrope | Shoelace tightrope | c | Gradient fallback | Turn your references into shoelace tightrope. Review the prompt before rendering. |
| effect-handshake-with-fire | Handshake with fire | c | Gradient fallback | Turn your references into handshake with fire. Review the prompt before rendering. |
| effect-wax-melt | Wax melt | c | Gradient fallback | Turn your references into wax melt. Review the prompt before rendering. |
| effect-ticket-carpet | Ticket carpet | c | Gradient fallback | Turn your references into ticket carpet. Review the prompt before rendering. |
| effect-titan-double | Titan double | c | Gradient fallback | Turn your references into titan double. Review the prompt before rendering. |
| effect-neon-scan-landing | Neon scan landing | c | Gradient fallback | Turn your references into neon scan landing. Review the prompt before rendering. |
| effect-building-becomes-a-wave | Building becomes a wave | c | Gradient fallback | Turn your references into building becomes a wave. Review the prompt before rendering. |
| effect-street-clones | Street clones | c | Gradient fallback | Turn your references into street clones. Review the prompt before rendering. |
| effect-paper-scrap-doodles | Paper scrap doodles | c | Gradient fallback | Turn your references into paper scrap doodles. Review the prompt before rendering. |
| effect-time-split-walk | Time-split walk | c | Gradient fallback | Turn your references into time-split walk. Review the prompt before rendering. |
| effect-screen-rip | Screen rip | c | Gradient fallback | Turn your references into screen rip. Review the prompt before rendering. |
| effect-orbit-to-street | Orbit to street | c | Gradient fallback | Turn your references into orbit to street. Review the prompt before rendering. |
| effect-painting-mirror | Painting mirror | c | Gradient fallback | Turn your references into painting mirror. Review the prompt before rendering. |
| effect-frozen-diner-orbit | Frozen diner orbit | c | Gradient fallback | Turn your references into frozen diner orbit. Review the prompt before rendering. |
| effect-comic-freefall | Comic freefall | c | Gradient fallback | Turn your references into comic freefall. Review the prompt before rendering. |
| effect-painting-to-cinema | Painting to cinema | c | Gradient fallback | Turn your references into painting to cinema. Review the prompt before rendering. |
| effect-car-clown-swarm | Car clown swarm | c | Gradient fallback | Turn your references into car clown swarm. Review the prompt before rendering. |
| effect-frozen-mid-leap | Frozen mid-leap | c | Gradient fallback | Turn your references into frozen mid-leap. Review the prompt before rendering. |
| effect-poof-only-clothes | Poof, only clothes | c | Gradient fallback | Turn your references into poof, only clothes. Review the prompt before rendering. |
| effect-sticker-doodle-sprint | Sticker doodle sprint | c | Gradient fallback | Turn your references into sticker doodle sprint. Review the prompt before rendering. |
| effect-detection-overlay | Detection overlay | c | Gradient fallback | Turn your references into detection overlay. Review the prompt before rendering. |
| effect-photocopy-glitch-aisle | Photocopy glitch aisle | c | Gradient fallback | Turn your references into photocopy glitch aisle. Review the prompt before rendering. |
| effect-error-storm-slurp | Error storm slurp | c | Gradient fallback | Turn your references into error storm slurp. Review the prompt before rendering. |
| effect-point-cloud-performance | Point-cloud performance | c | Gradient fallback | Turn your references into point-cloud performance. Review the prompt before rendering. |
| effect-oil-paint-barrel-roll | Oil paint barrel roll | c | Gradient fallback | Turn your references into oil paint barrel roll. Review the prompt before rendering. |
| effect-living-portrait | Living portrait | c | Gradient fallback | Turn your references into living portrait. Review the prompt before rendering. |
| effect-pigeon-skates | Pigeon skates | c | Gradient fallback | Turn your references into pigeon skates. Review the prompt before rendering. |
| effect-dachshund-surf | Dachshund surf | c | Gradient fallback | Turn your references into dachshund surf. Review the prompt before rendering. |
| effect-stadium-phone-cam | Stadium phone-cam | c | Gradient fallback | Turn your references into stadium phone-cam. Review the prompt before rendering. |
| effect-aquarium-turn | Aquarium turn | c | Gradient fallback | Turn your references into aquarium turn. Review the prompt before rendering. |
| effect-field-to-castle | Field to castle | c | Gradient fallback | Turn your references into field to castle. Review the prompt before rendering. |
| effect-knight-collapse | Knight collapse | c | Gradient fallback | Turn your references into knight collapse. Review the prompt before rendering. |
| effect-paper-stage-walk | Paper stage walk | c | Gradient fallback | Turn your references into paper stage walk. Review the prompt before rendering. |

### Generated originals by category

| Category | Originals |
| --- | --- |
| ads | 6 |
| camera | 12 |
| characters | 6 |
| cinema | 1 |
| effects | 14 |
| enhance | 4 |
| explainer | 2 |
| fun | 14 |
| hero illustration | 3 |
| image-edit | 7 |
| looks | 10 |
| mixed | 1 |
| models3d | 4 |
| sound | 2 |
| story | 3 |
| video-edit | 6 |
| voice | 3 |

## Hub and category slots

Hub cards use finished work representative of their group. Category images are registered centrally; the current rail is a text selector.

| Slot | Id | Expected output |
| --- | --- | --- |
| App hub | professional | Priority examples: transition, expand, behind-the-scenes, angles, shots |
| App hub | enhance | Priority examples: try-on, skin-retouch, sticker, ai-stylist, relight-photo |
| App hub | face | Priority examples: face-swap-video, face-swap, character-swap, headshot, video-character-swap |
| App hub | video-edit | Priority examples: video-bg-remove, game-show, edit-video, video-erase, video-remove-text |
| App hub | ads | Priority examples: product-shot, packshot, billboard, truck-ad, asmr-classic |
| App hub | games | Priority examples: sketch-to-image, plush-toy, figure-box, game-style, life-sim |
| App hub | extras | Priority examples: meme, paint-app, mural, micro-beasts, image-bg-remove |
| App hub | trending | Priority examples: roller-coaster, cloud-surfing, all-fine, surprise-kiss, glossy-vinyl |
| Category | ads | Result appropriate to this media category |
| Category | camera | Result appropriate to this media category |
| Category | characters | Result appropriate to this media category |
| Category | cinema | Result appropriate to this media category |
| Category | effects | Result appropriate to this media category |
| Category | enhance | Result appropriate to this media category |
| Category | fun | Result appropriate to this media category |
| Category | image-edit | Result appropriate to this media category |
| Category | looks | Result appropriate to this media category |
| Category | mixed | Result appropriate to this media category |
| Category | models3d | Result appropriate to this media category |
| Category | sound | Result appropriate to this media category |
| Category | story | Result appropriate to this media category |
| Category | video-edit | Result appropriate to this media category |
| Category | voice | Result appropriate to this media category |

## Tool and model slots

Every top-navigation tool uses a result image in the shared menu item; Explore tool cards use the same lookup. Model tiles use representative output art and do not claim a particular model generated it. Existing provider logos in the model picker are functional identity marks, not generated assets.

| Tool id | Route |
| --- | --- |
| create-image | `/image` |
| cinematic-cameras | `/cinema?mode=image` |
| canvas | `/flows` |
| moodboard | `/moodboard` |
| character | `/character` |
| influencer | `/influencer` |
| photodump | `/photodump` |
| relight | `/apps/relight` |
| inpaint | `/edit` |
| image-upscale | `/upscale` |
| face-swap | `/apps/face-swap` |
| character-swap | `/apps/character-swap` |
| fashion-factory | `/fashion` |
| create-video | `/video` |
| cinema-studio | `/cinema` |
| faceless | `/faceless` |
| 3d-studio | `/3d` |
| shorts | `/shorts` |
| explainer | `/explainer` |
| mixed-media | `/mixed-media` |
| edit-video | `/video/edit` |
| video-upscale | `/upscale?kind=video` |
| reframe | `/reframe` |
| click-to-ad | `/ads` |
| color-palette | `/apps/color-grade` |
| motion-control | `/video?tab=motion` |
| lipsync | `/lipsync` |
| text-to-speech | `/audio?mode=speech` |
| voice-change | `/audio?mode=change` |
| translate | `/audio?mode=translate` |
| explore | `/` |
| apps | `/apps` |
| effects | `/effects` |
| motion | `/motion` |
| marketing | `/marketing` |
| ads | `/ads` |
| assistant | `/assistant` |
| skills | `/skills` |
| assets | `/assets` |

Model ids: `flux-3-klein`, `qwen-image-2-1`, `qwen-image-edit-2511`, `z-image-turbo`, `hidream-o1`, `minimax-h3`, `ltx-2-5`, `wan-2-2`, `wan-animate-2`, `bernini-r`, `infinitetalk`, `chatterbox-multilingual`, `fish-drama-3`, `qwen3-tts`, `minimax-music-3`, `stable-audio-3`.

## Studio, example and empty-state slots

| Location | Slots and handling |
| --- | --- |
| Explore | Three rotating output heroes; eight initial tool cards and all expanded tools; effect, app, motion and model strips |
| Shared app page | Result example above inputs; original gradient underlay retained |
| Shared format sheet and preset picker | Format result art where mapped; General remains a neutral control |
| Character and moodboard | Existing fanned card topology; saved user photos take precedence |
| Image studio | Four generated output images in the existing fan |
| Cinema studio | Three genre poster cards, using cinematic, candid and playful output frames |
| Influencer | Five fictional portrait fan images; eight detailed preset silhouettes remain planned illustrations |
| Fashion factory | Eight template previews are inventoried; studio, street, catalog and campaign use matching art, other templates preserve gradients |
| Photodump | Nine named scene-set previews are inventoried; the header uses original fashion imagery, camera roll and surreal sets use matching art, other sets preserve gradients |
| Shared studio kit | Heroes on marketing, ads, faceless, explainer, shorts, 3d, lipsync, audio, edit, upscale, reframe and assistant surfaces; tiles preserve fallbacks if unmapped |
| Mixed media | Acid result art; unmapped looks keep their gradients |
| Library | Empty generations, character, product, brand and voice states get illustrative art; saved results remain untouched |
| Models | Shared Explore model tiles and catalog rows get representative output art; skeletons remain loading indicators |
| Instruction steps | Gradient numbered steps and functional instruction diagrams remain intentional UI; no fake screenshots or fake uploaded examples |

## Remaining static placeholder references

The following source locations exhaust the explicit gradient/cover/placeholder visual references outside format definitions. Some are functional controls or user-data fallbacks, as explained above.

| Source | Visual reference |
| --- | --- |
| `src/components/Recipes.jsx:28` | `<span className="recipe-cover" style={{ background: format.cover }}>` |
| `src/components/Recipes.jsx:96` | `<div className="sheet-cover" style={{ background: recipe.cover }}>` |
| `src/components/apps/AppCard.jsx:30` | `<span className="recipe-cover" style={{ background: format.cover }}>` |
| `src/components/formats/Fields.jsx:99` | `// Draw at the photo's own resolution so a mask lines up with the pixels it covers.` |
| `src/components/generate/Presets.jsx:12` | `export const general = { id: 'general', name: 'General', blurb: 'No preset. Your prompt drives the camera.', cover: covers.slate }` |
| `src/components/generate/Presets.jsx:34` | `<div className="gen-preset" style={{ background: preset.cover }}>` |
| `src/components/generate/Presets.jsx:49` | `<span className="recipe-cover" style={{ background: f.cover }}><ArtImage id={f.id} alt={${f.name} example} /></span>` |
| `src/components/generate/parts.jsx:111` | `<span className="gen-step-art" style={{ background: s.cover }}>{s.art}</span>` |
| `src/components/library/Assets.jsx:209` | `<div className="empty glass">` |
| `src/components/library/Generations.jsx:83` | `<div className="empty glass">` |
| `src/components/library/Generations.jsx:95` | `<div className="empty glass">` |
| `src/components/library/Voices.jsx:75` | `<div className="empty glass">` |
| `src/components/skills/Skill.jsx:33` | `<span className={skill-cover${big ? ' big' : ''}} style={{ background: skill.cover }}>` |
| `src/components/studio/Shell.jsx:37` | `<div className="sa-fan" aria-hidden="true">` |
| `src/components/studio/Shell.jsx:39` | `<span key={i} className={sa-fan-card${i === 2 ? ' round' : ''}} style={{ '--n': i, background: c.cover }}>` |
| `src/components/studio/presets.js:32` | `{ id: 'runner', name: 'Rooftop runner', cover: covers.sun, picks: { type: 'average', gender: 'woman', build: 'athletic', hair: 'high-ponytail', hairColor: 'black', style: 'athleisure', age: 'young-adult', accessories: ['headphones'] } },` |
| `src/components/studio/presets.js:33` | `{ id: 'chef', name: 'Silver fox chef', cover: covers.peach, picks: { type: 'average', gender: 'man', build: 'average', hair: 'slicked-back', hairColor: 'gray', style: 'business', age: 'senior', facialHair: 'short-beard', marks: ['laugh-lines'] } },` |
| `src/components/studio/presets.js:34` | `{ id: 'poet', name: 'Goth poet', cover: covers.night, picks: { type: 'bold', gender: 'non-binary', build: 'slim', hair: 'long-straight', hairColor: 'black', style: 'gothic', marks: ['nose-ring', 'tattoos'] } },` |
| `src/components/studio/presets.js:35` | `{ id: 'frog', name: 'Frog crooner', cover: covers.mint, picks: { type: 'frog', gender: 'man', build: 'heavy', style: 'preppy', accessories: ['hat'] } },` |
| `src/components/studio/presets.js:36` | `{ id: 'cat', name: 'Cat couture', cover: covers.rose, picks: { type: 'cat', gender: 'woman', build: 'slim', style: 'y2k', accessories: ['sunglasses', 'earrings'] } },` |
| `src/components/studio/presets.js:37` | `{ id: 'bird', name: 'Bird on the decks', cover: covers.sky, picks: { type: 'bird', gender: 'any', style: 'streetwear', accessories: ['headphones'] } },` |
| `src/components/studio/presets.js:38` | `{ id: 'lifter', name: 'Big lift energy', cover: covers.dusk, picks: { type: 'extreme', gender: 'man', build: 'muscular', hair: 'buzz-cut', style: 'athleisure', features: ['strong-jaw'] } },` |
| `src/components/studio/presets.js:39` | `{ id: 'gamer', name: 'Cozy streamer', cover: covers.lilac, picks: { type: 'average', gender: 'woman', build: 'average', hair: 'bob', hairColor: 'pink', style: 'minimal', accessories: ['glasses', 'headphones'], marks: ['freckles'] } },` |
| `src/components/studio/presets.js:50` | `{ id: 'nap', name: 'Nap anywhere', blurb: 'Fast asleep where nobody sleeps', cover: covers.sky,` |
| `src/components/studio/presets.js:52` | `{ id: 'calm', name: 'Calm everywhere', blurb: 'Cross-legged and serene in wild places', cover: covers.lilac,` |
| `src/components/studio/presets.js:54` | `{ id: 'glow', name: 'Golden candids', blurb: 'Warm, soft, caught in the moment', cover: covers.sun,` |
| `src/components/studio/presets.js:56` | `{ id: 'office', name: 'Office wear', blurb: 'Sharp workwear, everyday office scenes', cover: covers.slate,` |
| `src/components/studio/presets.js:58` | `{ id: 'surreal', name: 'Surreal me', blurb: 'Dream logic, played straight', cover: covers.indigo,` |
| `src/components/studio/presets.js:60` | `{ id: 'surreal-2', name: 'Surreal me, part two', blurb: 'More impossible rooms', cover: covers.dusk,` |
| `src/components/studio/presets.js:62` | `{ id: 'alter', name: 'Alter ego', blurb: 'You, living another life', cover: covers.peach,` |
| `src/components/studio/presets.js:64` | `{ id: 'roll', name: 'Cool camera roll', blurb: 'Easy shots for the feed', cover: covers.rose,` |
| `src/components/studio/presets.js:66` | `{ id: 'archive', name: 'Menswear archive', blurb: 'Classic menswear, editorial frames', cover: covers.night,` |
| `src/components/studio/presets.js:75` | `{ id: 'studio', name: 'Studio lookbook', note: 'Seamless backdrop, front and side', cover: covers.slate },` |
| `src/components/studio/presets.js:76` | `{ id: 'street', name: 'Street editorial', note: 'City sidewalks, candid stride', cover: covers.dusk },` |
| `src/components/studio/presets.js:77` | `{ id: 'runway', name: 'Runway', note: 'Catwalk lights and a crowd', cover: covers.night },` |
| `src/components/studio/presets.js:78` | `{ id: 'catalog', name: 'Catalog', note: 'Clean e-commerce frames', cover: covers.sky },` |
| `src/components/studio/presets.js:79` | `{ id: 'campaign', name: 'Campaign', note: 'Bold color, big attitude', cover: covers.rose },` |
| `src/components/studio/presets.js:80` | `{ id: 'mirror', name: 'Mirror selfie', note: 'Fitting room, phone in hand', cover: covers.lilac },` |
| `src/components/studio/presets.js:81` | `{ id: 'resort', name: 'Resort', note: 'Sun, pool and sea air', cover: covers.sun },` |
| `src/components/studio/presets.js:82` | `{ id: 'night', name: 'Night out', note: 'Flash, neon and a taxi', cover: covers.indigo },` |
| `src/components/studiob/Kit.jsx:176` | `style={{ ...stagger(i), background: t.image ? undefined : t.cover // coverAt(i) }} onClick={() => onChange(t.id)}>` |
| `src/components/studiob/Kit.jsx:191` | `<span className="sb-step-cover" style={{ background: s.cover // coverAt(i + 2) }}><b>{i + 1}</b></span>` |
| `src/components/studiob/Kit.jsx:226` | `<div className="sb-empty">` |
| `src/lib/skills.js:31` | `formats: ['ugc-ad', 'talking-head'], studio: 'marketing', cover: covers.peach,` |
| `src/lib/skills.js:41` | `formats: ['ugc-ad', 'human-video', 'macroshot-product'], studio: 'marketing', cover: covers.sun,` |
| `src/lib/skills.js:51` | `formats: ['ugc-ad', 'macroshot-product', 'packshot'], studio: 'marketing', cover: covers.rose,` |
| `src/lib/skills.js:61` | `formats: ['try-on', 'outfit-shot', 'ugc-ad'], studio: 'fashion-factory', cover: covers.lilac,` |
| `src/lib/skills.js:73` | `formats: ['recreate-ad', 'product-ad'], studio: 'ads', cover: covers.indigo,` |
| `src/lib/skills.js:83` | `formats: ['expand', 'ad-variants'], studio: 'ads', cover: covers.sky,` |
| `src/lib/skills.js:93` | `formats: ['link-to-ads', 'design-graphic'], studio: 'ads', cover: covers.dusk,` |
| `src/lib/skills.js:103` | `formats: ['ad-variants'], studio: 'ads', cover: covers.slate,` |
| `src/lib/skills.js:113` | `formats: ['ad-variants', 'design-graphic'], studio: 'ads', cover: covers.mint,` |
| `src/lib/skills.js:123` | `formats: ['ad-variants'], studio: 'ads', cover: covers.sun,` |
| `src/lib/skills.js:133` | `formats: ['hook-check', 'product-ad'], studio: 'edit-video', cover: covers.night,` |
| `src/lib/skills.js:143` | `formats: ['ad-variants', 'dub'], studio: 'translate', cover: covers.peach,` |
| `src/lib/skills.js:155` | `formats: ['explainer', 'motion-graphics', 'mm-magazine'], studio: 'explainer', cover: covers.slate,` |
| `src/lib/skills.js:165` | `formats: ['faceless', 'explainer'], studio: 'faceless', cover: covers.sky,` |
| `src/lib/skills.js:175` | `formats: ['story-video', 'faceless'], studio: 'faceless', cover: covers.lilac,` |
| `src/lib/skills.js:185` | `formats: ['story-video', 'mm-paper'], studio: 'faceless', cover: covers.sun,` |
| `src/lib/skills.js:195` | `formats: ['explainer', 'motion-graphics'], studio: 'explainer', cover: covers.mint,` |
| `src/lib/skills.js:205` | `formats: ['story-video', 'mm-sketch'], studio: 'faceless', cover: covers.slate,` |
| `src/lib/skills.js:215` | `formats: ['story-video', 'faceless'], studio: 'faceless', cover: covers.night,` |
| `src/lib/skills.js:227` | `formats: ['clone-edit', 'swap-element'], studio: 'edit-video', cover: covers.indigo,` |
| `src/lib/skills.js:237` | `formats: ['product-shot', 'place-product', 'banner'], studio: 'marketing', cover: covers.peach,` |
| `src/lib/skills.js:247` | `formats: ['thumbnail'], studio: 'create-image', cover: covers.rose,` |
| `src/lib/skills.js:257` | `formats: ['logo', 'brand-colors', 'design-graphic'], studio: 'create-image', cover: covers.mint,` |
| `src/lib/skills.js:267` | `formats: ['clip-to-shorts', 'podcast-clips'], studio: 'shorts', cover: covers.dusk,` |
| `src/lib/skills.js:280` | `formats: [], studio: 'ads', cover: covers.indigo,` |
| `src/pages/AdsStudio.jsx:34` | `].map((t, i) => ({ ...t, cover: coverAt(i + 2) }))` |
| `src/pages/AdsStudio.jsx:201` | `style={{ ...stagger(i + 1), background: coverAt(i ? 1 : 5) }} onClick={() => setTool(t.id)}>` |
| `src/pages/AppPage.jsx:41` | `<div className="empty glass rise">` |
| `src/pages/AppPage.jsx:117` | `<span className="app-cover" style={{ background: format.cover }}>` |
| `src/pages/Apps.jsx:69` | `<div className="empty glass rise">` |
| `src/pages/AudioStudio.jsx:44` | `{ title: 'Choose a voice', text: 'Start from a sample voice, or save your own in Library.', art: <IconMic />, cover: covers.sky },` |
| `src/pages/AudioStudio.jsx:45` | `{ title: 'Write it, then generate', text: 'Type the script, set the delivery and the language, and press Generate.', art: <IconWave />, cover: covers.lilac },` |
| `src/pages/AudioStudio.jsx:52` | `{ title: 'Add a recording', text: 'Drop in a voice clip, or a video with speech in it.', art: <IconWave />, cover: covers.rose },` |
| `src/pages/AudioStudio.jsx:53` | `{ title: 'Pick the new voice', text: 'Choose a sample voice or one you saved, then generate.', art: <IconMic />, cover: covers.mint },` |
| `src/pages/AudioStudio.jsx:60` | `{ title: 'Add a video', text: 'A clip with clear speech works best.', art: <IconVideo />, cover: covers.sun },` |
| `src/pages/AudioStudio.jsx:61` | `{ title: 'Pick a language', text: 'Choose the language to dub into, then generate.', art: <IconGlobe />, cover: covers.peach },` |
| `src/pages/Character.jsx:145` | `const art = ['average', 'bold', 'average', 'extreme'].map((k, i) => ({ cover: [covers.peach, covers.sky, covers.sun, covers.lilac][i], art: <TypeArt kind={k} /> }))` |
| `src/pages/Character.jsx:172` | `<div className="empty glass">` |
| `src/pages/CinemaStudio.jsx:22` | `{ genre: 'noir', cover: covers.night },` |
| `src/pages/CinemaStudio.jsx:23` | `{ genre: 'epic', cover: covers.dusk },` |
| `src/pages/CinemaStudio.jsx:24` | `{ genre: 'comedy', cover: covers.sun },` |
| `src/pages/CinemaStudio.jsx:33` | `<button key={s.genre} type="button" className={cs-poster${i === 1 ? ' mid' : ''}} style={{ background: s.cover, '--n': i }} onClick={() => onStart(s.genre)}>` |
| `src/pages/CinemaStudio.jsx:52` | `if (!items.length) return <div className="empty glass">{empty}</div>` |
| `src/pages/CinemaStudio.jsx:73` | `<div className="empty glass">` |
| `src/pages/CinemaStudio.jsx:188` | `<div className="empty glass">No shots yet. Generating is not wired yet, so this stays empty for now.</div>` |
| `src/pages/CinemaStudio.jsx:216` | `<div className="empty glass">` |
| `src/pages/Effects.jsx:37` | `<div className="empty glass rise">No effects yet.</div>` |
| `src/pages/Explainer.jsx:22` | `].map((s, i) => ({ ...s, cover: coverAt(i + 1) }))` |
| `src/pages/Explainer.jsx:176` | `<span className="sb-scene-cover" style={{ background: styleItem?.cover }}><b>{i + 1}</b><em>{clock(s.seconds)}</em></span>` |
| `src/pages/FacelessStudio.jsx:15` | `].map((c, i) => ({ ...c, cover: coverAt(i + 6) }))` |
| `src/pages/FacelessStudio.jsx:26` | `].map((s, i) => ({ ...s, cover: coverAt(i) }))` |
| `src/pages/FashionFactory.jsx:51` | `<span className="ff-template-cover" style={{ background: t.cover }}><ArtImage src={presetArt('fashion', t.id)} /></span>` |
| `src/pages/FashionFactory.jsx:91` | `<span style={{ background: t.cover }}><ArtImage src={presetArt('fashion', t.id)} /></span>` |
| `src/pages/ImageStudio.jsx:22` | `const fan = [covers.peach, covers.dusk, covers.sky, covers.rose]` |
| `src/pages/ImageStudio.jsx:110` | `<div className="gen-fan" aria-hidden="true">` |
| `src/pages/Influencer.jsx:125` | `<span key={i} className="inf-fan-card" style={{ '--n': i - 2, background: c.cover }}>` |
| `src/pages/Influencer.jsx:183` | `<span className="inf-card-cover" style={{ background: p.cover }}><TypeArt kind={p.picks.type} /><ArtImage id={p.art} /></span>` |
| `src/pages/LipsyncStudio.jsx:46` | `<div className="sb-preview short" style={{ background: talking?.cover }}>` |
| `src/pages/MarketingStudio.jsx:43` | `].map(([name, group, style, aspect], i) => ({ id: t${i}, label: name, group, style, aspect, note: groupOf(group).name, cover: coverAt(i + 1) }))` |
| `src/pages/MarketingStudio.jsx:129` | `<button key={id} type="button" className={sb-fan-card rise${filter === id ? ' on' : ''}} style={{ ...stagger(i), background: coverAt(i + 3) }}` |
| `src/pages/MarketingStudio.jsx:216` | `<span className="sb-scene-cover" style={{ background: coverAt(i + 4) }}><b>{i + 1}</b><em>{s.time}</em></span>` |
| `src/pages/MarketingStudio.jsx:223` | `<span className="sb-scene-cover" style={{ background: coverAt(i + 4) }}><b>{i + 1}</b><em>{aspect === 'auto' ? 'Auto' : aspect}</em></span>` |
| `src/pages/MixedMedia.jsx:58` | `style={{ background: f.cover, '--d': calc(${Math.min(i, 12)} * var(--stagger)) }}` |
| `src/pages/MixedMedia.jsx:68` | `<div className="empty glass rise">` |
| `src/pages/Moodboard.jsx:109` | `<div className="empty glass"><p>No moodboards yet. Build one from your own references and it shows up here.</p></div>` |
| `src/pages/Motion.jsx:45` | `<i style={{ background: f.cover }}><ArtImage id={f.id} alt={${f.name} example} /></i>` |
| `src/pages/Motion.jsx:95` | `<div className="empty glass rise">No motion presets yet.</div>` |
| `src/pages/Photodump.jsx:35` | `{set.scenes.slice(0, 4).map((s, k) => <span key={s} style={{ background: set.cover, '--k': k }}><ArtImage src={presetArt('photodump', set.id)} /><em>{s}</em></span>)}` |
| `src/pages/Photodump.jsx:61` | `{photodumpSets.slice(0, 4).map((s) => <i key={s.id} style={{ background: s.cover }}><ArtImage src={heroArt('photodump')} /></i>)}` |
| `src/pages/ShortsStudio.jsx:21` | `'Sport replay', 'Concert lights', 'Minimal grid'].map((label, i) => ({ id: slug(label), label, cover: tint(label) // coverAt(i) }))` |
| `src/pages/ShortsStudio.jsx:77` | `<div className="sb-preview" style={{ background: current?.image ? undefined : current?.cover }}>` |
| `src/pages/SkillPage.jsx:25` | `<div className="empty glass rise">` |
| `src/pages/Skills.jsx:78` | `<div className="empty glass rise">` |
| `src/pages/ThreeD.jsx:178` | `<span className="sb-launch-cover" style={{ background: f.cover }}><ArtImage id={f.id} alt={${f.name} example} /></span>` |
| `src/pages/VideoStudio.jsx:211` | `<div className="gen-preset" style={{ background: covers.rose }}>` |
| `src/pages/VideoStudio.jsx:278` | `{ title: 'Add a motion video', text: 'One clear subject, no camera cuts, 3 to 30 seconds.', art: <IconVideo />, cover: covers.rose },` |
| `src/pages/VideoStudio.jsx:279` | `{ title: 'Add your character', text: 'Arms and hands in view, with room around the body.', art: <IconImage />, cover: covers.lilac },` |
| `src/pages/VideoStudio.jsx:280` | `{ title: 'Get a video', text: 'Your character performs the same moves, timing and expressions.', art: <IconPlay />, cover: covers.sky },` |
| `src/pages/VideoStudio.jsx:291` | `{ title: 'Add an image', text: 'Drop in a start frame, or skip it and describe the shot.', art: <IconImage />, cover: covers.sky,` |
| `src/pages/VideoStudio.jsx:293` | `{ title: 'Choose a preset', text: 'Pick a camera move, or keep General.', art: <IconSpark />, cover: covers.lilac, onClick: () => setPicking(true) },` |
| `src/pages/VideoStudio.jsx:294` | `{ title: 'Get a video', text: 'Press Generate. Your clip lands in History.', art: <IconPlay />, cover: covers.peach },` |

## Generation prompts

Each id below identifies a generated master. WebP derivatives retain the same subject, without generative editing. Character fan cards crop one panel each from the character sheet in the renderer. All prompts are exact strings submitted to the built-in tool. `placeholder-assets-sources.json` records master paths and hero reuse; `placeholder-assets-sizes.json` records optimized dimensions, quality and byte counts.

### cinema-shot

Create a wide 16:9 cinematic editorial photograph for a local-first creative studio website hero. Finished film frame: a fictional adult woman explorer in a sculptural ivory coat standing on a pale coastal cliff, a distant indigo ocean, silver grasses, an enormous softly lit moon low in a lavender dawn sky. Elegant believable photographic detail, anamorphic composition, atmospheric depth, gentle grain, restrained warm ivory and cool indigo palette. Place subject near right third with spacious scenery. This depicts the finished output of cinema generation, not a camera or interface. No real person's likeness, no celebrities, no logos, no trademarks, no copyrighted characters, no text, no watermark. Render at 1600px or greater wide.

### character-sheet

Create a wide 16:9 finished-output image for a ComfyField feature card and studio hero, 1600px or greater wide. A clean contact sheet with four equal panels, the exact same fictional adult woman with short curly dark hair, freckles and an ivory shirt in front view, profile, three-quarter view and a smiling expression. Consistent identity, lavender studio backdrop, natural skin. House style: premium editorial photography or the specifically requested art medium, luminous warm ivory, restrained indigo and lavender accents, soft dimensional light, clear small-thumbnail silhouette, refined material detail and cinematic composition. The image must depict the feature's result. All people are fictional adults with no real person's likeness. No celebrities, brand logos, trademarks, copyrighted characters, typography, letters, numbers, captions or watermark. No Higgsfield art. No interface mockup.

### library

Create a wide 16:9 finished-output image for a ComfyField feature card and studio hero, 1600px or greater wide. An elegant still life of three small blank-edged photographic prints resting on an ivory sculptural shelf: a lavender coastal film scene, an original ceramic fox, and a cobalt bottle product photograph. A small indigo glass soundwave sculpture beside them, delicate shadows. No text, no interface, no fake user content. House style: premium editorial photography or the specifically requested art medium, luminous warm ivory, restrained indigo and lavender accents, soft dimensional light, clear small-thumbnail silhouette, refined material detail and cinematic composition. The image must depict the feature's result. All people are fictional adults with no real person's likeness. No celebrities, brand logos, trademarks, copyrighted characters, typography, letters, numbers, captions or watermark. No Higgsfield art. No interface mockup.

### moodboard

Create a wide 16:9 finished-output image for a ComfyField feature card and studio hero, 1600px or greater wide. A refined editorial flat lay of an actual creative moodboard: overlapping unlabelled photographic prints of lavender coast, ivory architecture, indigo silk and silver flowers with tactile paper swatches, no writing or interface. House style: premium editorial photography or the specifically requested art medium, luminous warm ivory, restrained indigo and lavender accents, soft dimensional light, clear small-thumbnail silhouette, refined material detail and cinematic composition. The image must depict the feature's result. All people are fictional adults with no real person's likeness. No celebrities, brand logos, trademarks, copyrighted characters, typography, letters, numbers, captions or watermark. No Higgsfield art. No interface mockup.

### fashion

Create a wide 16:9 finished-output image for a ComfyField feature card and studio hero, 1600px or greater wide. A high-fashion editorial triptych of the same fictional adult model with short curly dark hair wearing an ivory suit, an indigo dress and a lavender coat, three full-length images in a pale seamless studio, consistent identity and chic lighting. House style: premium editorial photography or the specifically requested art medium, luminous warm ivory, restrained indigo and lavender accents, soft dimensional light, clear small-thumbnail silhouette, refined material detail and cinematic composition. The image must depict the feature's result. All people are fictional adults with no real person's likeness. No celebrities, brand logos, trademarks, copyrighted characters, typography, letters, numbers, captions or watermark. No Higgsfield art. No interface mockup.

### expand

Create a wide 16:9 finished-output image for a ComfyField feature card and studio hero, 1600px or greater wide. An expansive panoramic photographic landscape of an ivory seaside villa among silver olive trees, distant lavender sea, realistic fine detail extending continuously to both edges, no borders or frame, serene editorial architecture. House style: premium editorial photography or the specifically requested art medium, luminous warm ivory, restrained indigo and lavender accents, soft dimensional light, clear small-thumbnail silhouette, refined material detail and cinematic composition. The image must depict the feature's result. All people are fictional adults with no real person's likeness. No celebrities, brand logos, trademarks, copyrighted characters, typography, letters, numbers, captions or watermark. No Higgsfield art. No interface mockup.

### product-shot

Create a wide 16:9 finished-output image for a ComfyField feature card and studio hero, 1600px or greater wide. A premium unbranded cobalt-blue glass perfume bottle with a simple blank ivory cap on a pale travertine plinth, water caustics, sculptural white orchid and soft lavender shadows, finished luxury product advertising photograph, no label. House style: premium editorial photography or the specifically requested art medium, luminous warm ivory, restrained indigo and lavender accents, soft dimensional light, clear small-thumbnail silhouette, refined material detail and cinematic composition. The image must depict the feature's result. All people are fictional adults with no real person's likeness. No celebrities, brand logos, trademarks, copyrighted characters, typography, letters, numbers, captions or watermark. No Higgsfield art. No interface mockup.

### character-scene

Create a wide 16:9 finished-output image for a ComfyField feature card and studio hero, 1600px or greater wide. A fictional adult woman with short curly dark hair, freckles and an ivory jacket sitting in a beautifully detailed lavender glass conservatory beside a flowering tree, consistent character editorial scene, medium-wide framing. House style: premium editorial photography or the specifically requested art medium, luminous warm ivory, restrained indigo and lavender accents, soft dimensional light, clear small-thumbnail silhouette, refined material detail and cinematic composition. The image must depict the feature's result. All people are fictional adults with no real person's likeness. No celebrities, brand logos, trademarks, copyrighted characters, typography, letters, numbers, captions or watermark. No Higgsfield art. No interface mockup.

### cam-tracking

Create a wide 16:9 finished-output image for a ComfyField feature card and studio hero, 1600px or greater wide. A dynamic cinematic side-profile photograph moving alongside a fictional adult woman cycling on an unbranded indigo bicycle along the coast, sharp rider, lateral motion blur in silver grasses and lavender sea. House style: premium editorial photography or the specifically requested art medium, luminous warm ivory, restrained indigo and lavender accents, soft dimensional light, clear small-thumbnail silhouette, refined material detail and cinematic composition. The image must depict the feature's result. All people are fictional adults with no real person's likeness. No celebrities, brand logos, trademarks, copyrighted characters, typography, letters, numbers, captions or watermark. No Higgsfield art. No interface mockup.

### ad-variants

Create a wide 16:9 finished-output image for a ComfyField feature card and studio hero, 1600px or greater wide. A precise three-panel advertising contact sheet of the same unbranded cobalt glass perfume bottle, each panel a distinct finished campaign: lavender flowers, white water splash, sunlit sand. Consistent product and premium editorial styling, no labels. House style: premium editorial photography or the specifically requested art medium, luminous warm ivory, restrained indigo and lavender accents, soft dimensional light, clear small-thumbnail silhouette, refined material detail and cinematic composition. The image must depict the feature's result. All people are fictional adults with no real person's likeness. No celebrities, brand logos, trademarks, copyrighted characters, typography, letters, numbers, captions or watermark. No Higgsfield art. No interface mockup.

### product-ad

Create a wide 16:9 finished-output image for a ComfyField feature card and studio hero, 1600px or greater wide. A finished premium beverage ad still: an unbranded translucent cobalt-blue bottle levitating among splashing water, sliced white peaches and mint leaves, warm ivory background, dynamic diagonal composition, crisp droplets, blank bottle with no label. House style: premium editorial photography or the specifically requested art medium, luminous warm ivory, restrained indigo and lavender accents, soft dimensional light, clear small-thumbnail silhouette, refined material detail and cinematic composition. The image must depict the feature's result. All people are fictional adults with no real person's likeness. No celebrities, brand logos, trademarks, copyrighted characters, typography, letters, numbers, captions or watermark. No Higgsfield art. No interface mockup.

### faceless

Create a wide 16:9 finished-output image for a ComfyField feature card and studio hero, 1600px or greater wide. A cinematic aerial documentary photograph of an otherworldly lavender volcanic island, silver ocean waves, winding ivory trail and soft mist, no people, atmospheric and story-rich faceless-channel footage. House style: premium editorial photography or the specifically requested art medium, luminous warm ivory, restrained indigo and lavender accents, soft dimensional light, clear small-thumbnail silhouette, refined material detail and cinematic composition. The image must depict the feature's result. All people are fictional adults with no real person's likeness. No celebrities, brand logos, trademarks, copyrighted characters, typography, letters, numbers, captions or watermark. No Higgsfield art. No interface mockup.

### short-sequence

Create a wide 16:9 finished-output image for a ComfyField feature card and studio hero, 1600px or greater wide. A clean triptych of three vertical cinematic frames of the same fictional adult dancer in an indigo jumpsuit on an ivory rooftop, wide opening pose, dynamic mid-turn, expressive close-up, a coherent ready-to-edit short sequence, no borders with text. House style: premium editorial photography or the specifically requested art medium, luminous warm ivory, restrained indigo and lavender accents, soft dimensional light, clear small-thumbnail silhouette, refined material detail and cinematic composition. The image must depict the feature's result. All people are fictional adults with no real person's likeness. No celebrities, brand logos, trademarks, copyrighted characters, typography, letters, numbers, captions or watermark. No Higgsfield art. No interface mockup.

### explainer

Create a wide 16:9 finished-output image for a ComfyField feature card and studio hero, 1600px or greater wide. An elegant original three-dimensional educational illustration of a cutaway lavender planet floating in ivory space, visible concentric layers and small orbiting moons, precise simple geometry, friendly tangible material, no labels or letters. House style: premium editorial photography or the specifically requested art medium, luminous warm ivory, restrained indigo and lavender accents, soft dimensional light, clear small-thumbnail silhouette, refined material detail and cinematic composition. The image must depict the feature's result. All people are fictional adults with no real person's likeness. No celebrities, brand logos, trademarks, copyrighted characters, typography, letters, numbers, captions or watermark. No Higgsfield art. No interface mockup.

### talking-head

Create a wide 16:9 finished-output image for a ComfyField feature card and studio hero, 1600px or greater wide. A photoreal fictional adult woman presenter with short curly dark hair wearing an ivory blouse, mid-sentence with subtly parted lips, friendly expressive face, shoulders and hands visible, bright home studio with indigo accents, no microphones or text. House style: premium editorial photography or the specifically requested art medium, luminous warm ivory, restrained indigo and lavender accents, soft dimensional light, clear small-thumbnail silhouette, refined material detail and cinematic composition. The image must depict the feature's result. All people are fictional adults with no real person's likeness. No celebrities, brand logos, trademarks, copyrighted characters, typography, letters, numbers, captions or watermark. No Higgsfield art. No interface mockup.

### music

Create a wide 16:9 finished-output image for a ComfyField feature card and studio hero, 1600px or greater wide. An expressive abstract album-art scene: flowing indigo and lavender silk ribbons curling in lyrical rhythmic loops around an ivory sculptural sphere, soft volumetric light and subtle gold reflections, evokes layered instrumental music without instruments or text. House style: premium editorial photography or the specifically requested art medium, luminous warm ivory, restrained indigo and lavender accents, soft dimensional light, clear small-thumbnail silhouette, refined material detail and cinematic composition. The image must depict the feature's result. All people are fictional adults with no real person's likeness. No celebrities, brand logos, trademarks, copyrighted characters, typography, letters, numbers, captions or watermark. No Higgsfield art. No interface mockup.

### text-to-3d

Create a wide 16:9 finished-output image for a ComfyField feature card and studio hero, 1600px or greater wide. A beautifully rendered original three-dimensional sculptural chair made from flowing ivory ceramic and translucent indigo glass, isolated on a pale lavender studio floor, precise geometry, soft shadows, product model render. House style: premium editorial photography or the specifically requested art medium, luminous warm ivory, restrained indigo and lavender accents, soft dimensional light, clear small-thumbnail silhouette, refined material detail and cinematic composition. The image must depict the feature's result. All people are fictional adults with no real person's likeness. No celebrities, brand logos, trademarks, copyrighted characters, typography, letters, numbers, captions or watermark. No Higgsfield art. No interface mockup.

### video-upscale

Create a wide 16:9 finished-output image for a ComfyField feature card and studio hero, 1600px or greater wide. A razor-sharp cinematic wildlife frame of a white egret lifting from shallow lavender-blue water, visible individual feathers and suspended droplets, natural optics, fine reeds and clear reflective ripples, detailed restored footage result. House style: premium editorial photography or the specifically requested art medium, luminous warm ivory, restrained indigo and lavender accents, soft dimensional light, clear small-thumbnail silhouette, refined material detail and cinematic composition. The image must depict the feature's result. All people are fictional adults with no real person's likeness. No celebrities, brand logos, trademarks, copyrighted characters, typography, letters, numbers, captions or watermark. No Higgsfield art. No interface mockup.

### edit-video

Create a wide 16:9 finished-output image for a ComfyField feature card and studio hero, 1600px or greater wide. A finished cinematic edited scene: a fictional adult woman in an ivory coat standing in a transformed lavender flower-filled train carriage, natural daylight through windows, convincing flowers and reflections, polished magical realism. House style: premium editorial photography or the specifically requested art medium, luminous warm ivory, restrained indigo and lavender accents, soft dimensional light, clear small-thumbnail silhouette, refined material detail and cinematic composition. The image must depict the feature's result. All people are fictional adults with no real person's likeness. No celebrities, brand logos, trademarks, copyrighted characters, typography, letters, numbers, captions or watermark. No Higgsfield art. No interface mockup.

### sketch-to-image

Create a wide 16:9 finished-output image for a ComfyField feature card and studio hero, 1600px or greater wide. One coherent still life transitioning organically from loose graphite pencil drawing on the left to a fully rendered photorealistic white ceramic teapot and purple irises on the right. The same objects align exactly across the transformation, pale paper surface. House style: premium editorial photography or the specifically requested art medium, luminous warm ivory, restrained indigo and lavender accents, soft dimensional light, clear small-thumbnail silhouette, refined material detail and cinematic composition. The image must depict the feature's result. All people are fictional adults with no real person's likeness. No celebrities, brand logos, trademarks, copyrighted characters, typography, letters, numbers, captions or watermark. No Higgsfield art. No interface mockup.

### mm-acid

Create a wide 16:9 finished-output image for a ComfyField feature card and studio hero, 1600px or greater wide. A surreal mixed-media cinematic portrait of a fictional adult woman surrounded by psychedelic indigo, electric lavender and peach marbled paint waves, analog color bleeding, warped paper textures and luminous outlines, clearly transformed art effect. House style: premium editorial photography or the specifically requested art medium, luminous warm ivory, restrained indigo and lavender accents, soft dimensional light, clear small-thumbnail silhouette, refined material detail and cinematic composition. The image must depict the feature's result. All people are fictional adults with no real person's likeness. No celebrities, brand logos, trademarks, copyrighted characters, typography, letters, numbers, captions or watermark. No Higgsfield art. No interface mockup.

### shots

Create a wide 16:9 finished-output image for a ComfyField feature card and studio hero, 1600px or greater wide. A nine-panel perfectly aligned photographic shot grid of one fictional adult woman in an ivory coat beside an indigo seaside doorway: wide, medium, close-up, profile, overhead, low angle, detail of hand, rear view and extreme close-up. Same person, consistent setting. House style: premium editorial photography or the specifically requested art medium, luminous warm ivory, restrained indigo and lavender accents, soft dimensional light, clear small-thumbnail silhouette, refined material detail and cinematic composition. The image must depict the feature's result. All people are fictional adults with no real person's likeness. No celebrities, brand logos, trademarks, copyrighted characters, typography, letters, numbers, captions or watermark. No Higgsfield art. No interface mockup.

### relight-photo

Create a wide 16:9 finished-output image for a ComfyField feature card and studio hero, 1600px or greater wide. A two-panel portrait study of the same fictional adult woman, identical framing and face, left lit by warm golden light from the side, right lit by cool lavender light from the opposite side, changed natural shadow direction clearly visible. House style: premium editorial photography or the specifically requested art medium, luminous warm ivory, restrained indigo and lavender accents, soft dimensional light, clear small-thumbnail silhouette, refined material detail and cinematic composition. The image must depict the feature's result. All people are fictional adults with no real person's likeness. No celebrities, brand logos, trademarks, copyrighted characters, typography, letters, numbers, captions or watermark. No Higgsfield art. No interface mockup.

### game-style

Create a wide 16:9 finished-output image for a ComfyField feature card and studio hero, 1600px or greater wide. An original stylized three-dimensional adventure game environment: a fictional adult explorer in an ivory coat crossing a floating lavender island with tiny silver trees and blue crystal ruins, isometric framing, polished game render, no interface or famous characters. House style: premium editorial photography or the specifically requested art medium, luminous warm ivory, restrained indigo and lavender accents, soft dimensional light, clear small-thumbnail silhouette, refined material detail and cinematic composition. The image must depict the feature's result. All people are fictional adults with no real person's likeness. No celebrities, brand logos, trademarks, copyrighted characters, typography, letters, numbers, captions or watermark. No Higgsfield art. No interface mockup.

### plush-toy

Create a wide 16:9 finished-output image for a ComfyField feature card and studio hero, 1600px or greater wide. A beautifully crafted original plush toy shaped like a round lavender fox with oversized soft ears, indigo stitched eyes and ivory belly, visible fabric fibers and seams, sitting on a pale studio plinth, original design. House style: premium editorial photography or the specifically requested art medium, luminous warm ivory, restrained indigo and lavender accents, soft dimensional light, clear small-thumbnail silhouette, refined material detail and cinematic composition. The image must depict the feature's result. All people are fictional adults with no real person's likeness. No celebrities, brand logos, trademarks, copyrighted characters, typography, letters, numbers, captions or watermark. No Higgsfield art. No interface mockup.

### cloud-surfing

Create a wide 16:9 finished-output image for a ComfyField feature card and studio hero, 1600px or greater wide. A fantastical cinematic frame of a fictional adult woman in a cream wetsuit surfing a sea of fluffy lavender clouds on a plain indigo surfboard, cloud spray curling behind her, sunlit sky and distant moon, graceful dynamic pose. House style: premium editorial photography or the specifically requested art medium, luminous warm ivory, restrained indigo and lavender accents, soft dimensional light, clear small-thumbnail silhouette, refined material detail and cinematic composition. The image must depict the feature's result. All people are fictional adults with no real person's likeness. No celebrities, brand logos, trademarks, copyrighted characters, typography, letters, numbers, captions or watermark. No Higgsfield art. No interface mockup.

### turn-to-sand

Create a wide 16:9 finished-output image for a ComfyField feature card and studio hero, 1600px or greater wide. A surreal photographic frame of a fictional adult woman in an ivory dress whose left shoulder and lower dress are visibly disintegrating into a sweeping cloud of fine golden sand grains. Face intact, sea-blue seamless backdrop, clear magical transformation in progress. House style: premium editorial photography or the specifically requested art medium, luminous warm ivory, restrained indigo and lavender accents, soft dimensional light, clear small-thumbnail silhouette, refined material detail and cinematic composition. The image must depict the feature's result. All people are fictional adults with no real person's likeness. No celebrities, brand logos, trademarks, copyrighted characters, typography, letters, numbers, captions or watermark. No Higgsfield art. No interface mockup.

### cam-dolly-out

Create a wide 16:9 finished-output image for a ComfyField feature card and studio hero, 1600px or greater wide. An expansive cinematic wide view revealing a lone fictional adult woman in an ivory coat as a small figure in a grand seaside colonnade, repeating pillars and lavender ocean, rich spatial depth, camera pull-back result. House style: premium editorial photography or the specifically requested art medium, luminous warm ivory, restrained indigo and lavender accents, soft dimensional light, clear small-thumbnail silhouette, refined material detail and cinematic composition. The image must depict the feature's result. All people are fictional adults with no real person's likeness. No celebrities, brand logos, trademarks, copyrighted characters, typography, letters, numbers, captions or watermark. No Higgsfield art. No interface mockup.

### storyboard

Create a wide 16:9 finished-output image for a ComfyField feature card and studio hero, 1600px or greater wide. A cinematic storyboard contact sheet with six precisely aligned image panels, no panel numbers: a fictional adult woman arriving at a quiet seaside greenhouse, wide exterior, medium at doorway, hand holding a flower, close portrait, interior wide, departure at sunset. Same person and outfit throughout. House style: premium editorial photography or the specifically requested art medium, luminous warm ivory, restrained indigo and lavender accents, soft dimensional light, clear small-thumbnail silhouette, refined material detail and cinematic composition. The image must depict the feature's result. All people are fictional adults with no real person's likeness. No celebrities, brand logos, trademarks, copyrighted characters, typography, letters, numbers, captions or watermark. No Higgsfield art. No interface mockup.

### look-phone-flash

Create a wide 16:9 finished-output image for a ComfyField feature card and studio hero, 1600px or greater wide. A candid fashion photograph lit by harsh on-camera phone flash at night, fictional adult woman with wavy dark hair in an oversized ivory blazer on a rain-slick city street, crisp face, deep indigo shadows, slight flash falloff, raw spontaneous energy. House style: premium editorial photography or the specifically requested art medium, luminous warm ivory, restrained indigo and lavender accents, soft dimensional light, clear small-thumbnail silhouette, refined material detail and cinematic composition. The image must depict the feature's result. All people are fictional adults with no real person's likeness. No celebrities, brand logos, trademarks, copyrighted characters, typography, letters, numbers, captions or watermark. No Higgsfield art. No interface mockup.

### tts

Create a wide 16:9 finished-output image for a ComfyField feature card and studio hero, 1600px or greater wide. A poetic three-dimensional visualization of natural speech: a smooth flowing indigo sound ribbon forming a gentle waveform across warm ivory space, delicate translucent glass ripples, elegant physical sculpture with clear rhythmic variation, no letters or interface. House style: premium editorial photography or the specifically requested art medium, luminous warm ivory, restrained indigo and lavender accents, soft dimensional light, clear small-thumbnail silhouette, refined material detail and cinematic composition. The image must depict the feature's result. All people are fictional adults with no real person's likeness. No celebrities, brand logos, trademarks, copyrighted characters, typography, letters, numbers, captions or watermark. No Higgsfield art. No interface mockup.

### voice-clone

Create a wide 16:9 finished-output image for a ComfyField feature card and studio hero, 1600px or greater wide. A conceptual sculpture of two identical indigo soundwave ribbons mirrored parallel to one another in warm ivory space, distinct matching peaks and soft glass material, expressive natural speech visualized, no letters, no interface. House style: premium editorial photography or the specifically requested art medium, luminous warm ivory, restrained indigo and lavender accents, soft dimensional light, clear small-thumbnail silhouette, refined material detail and cinematic composition. The image must depict the feature's result. All people are fictional adults with no real person's likeness. No celebrities, brand logos, trademarks, copyrighted characters, typography, letters, numbers, captions or watermark. No Higgsfield art. No interface mockup.

### sound-effect

Create a wide 16:9 finished-output image for a ComfyField feature card and studio hero, 1600px or greater wide. A hyperreal macro photograph of a single clear water droplet striking a lavender-blue pool, frozen crown splash and concentric ripples, tiny airborne droplets, tactile cinematic sound effect imagery, ivory highlights. House style: premium editorial photography or the specifically requested art medium, luminous warm ivory, restrained indigo and lavender accents, soft dimensional light, clear small-thumbnail silhouette, refined material detail and cinematic composition. The image must depict the feature's result. All people are fictional adults with no real person's likeness. No celebrities, brand logos, trademarks, copyrighted characters, typography, letters, numbers, captions or watermark. No Higgsfield art. No interface mockup.

### cam-dolly-in

Create a wide 16:9 finished-output image for a ComfyField feature card and studio hero, 1600px or greater wide. A cinematic medium-close frame of a fictional adult woman in an ivory coat at the end of a colonnade, foreground pillars enlarged and softly blurred on both sides, strong perspective converging toward her sharp face, showing an intimate camera push-in result. House style: premium editorial photography or the specifically requested art medium, luminous warm ivory, restrained indigo and lavender accents, soft dimensional light, clear small-thumbnail silhouette, refined material detail and cinematic composition. The image must depict the feature's result. All people are fictional adults with no real person's likeness. No celebrities, brand logos, trademarks, copyrighted characters, typography, letters, numbers, captions or watermark. No Higgsfield art. No interface mockup.

### roller-coaster

Create a wide 16:9 finished-output image for a ComfyField feature card and studio hero, 1600px or greater wide. A dynamic wide-angle front-facing photograph of two fictional adults laughing in the front car of a roller coaster high above the coast, pale blue track plunging behind them, hair blowing, believable safety harnesses, bright lavender-blue sky. House style: premium editorial photography or the specifically requested art medium, luminous warm ivory, restrained indigo and lavender accents, soft dimensional light, clear small-thumbnail silhouette, refined material detail and cinematic composition. The image must depict the feature's result. All people are fictional adults with no real person's likeness. No celebrities, brand logos, trademarks, copyrighted characters, typography, letters, numbers, captions or watermark. No Higgsfield art. No interface mockup.

### transition

Create a wide 16:9 finished-output image for a ComfyField feature card and studio hero, 1600px or greater wide. A cinematic match transition frozen mid-morph: a sunlit white archway opening seamlessly into a deep indigo ocean wave, curved architecture blending physically with curved water, a fictional adult woman walking through, polished surreal film frame. House style: premium editorial photography or the specifically requested art medium, luminous warm ivory, restrained indigo and lavender accents, soft dimensional light, clear small-thumbnail silhouette, refined material detail and cinematic composition. The image must depict the feature's result. All people are fictional adults with no real person's likeness. No celebrities, brand logos, trademarks, copyrighted characters, typography, letters, numbers, captions or watermark. No Higgsfield art. No interface mockup.

### try-on

Create a wide 16:9 finished-output image for a ComfyField feature card and studio hero, 1600px or greater wide. A three-panel fashion try-on contact sheet, the same fictional adult woman in the same standing pose on a pale gray seamless background, wearing an ivory tailored suit, an indigo flowing dress, and a warm sand trench coat respectively. Full outfits visible, consistent face and body. House style: premium editorial photography or the specifically requested art medium, luminous warm ivory, restrained indigo and lavender accents, soft dimensional light, clear small-thumbnail silhouette, refined material detail and cinematic composition. The image must depict the feature's result. All people are fictional adults with no real person's likeness. No celebrities, brand logos, trademarks, copyrighted characters, typography, letters, numbers, captions or watermark. No Higgsfield art. No interface mockup.

### swap-element

Create a wide 16:9 finished-output image for a ComfyField feature card and studio hero, 1600px or greater wide. A finished cinematic video edit result: a lavender vintage bicycle standing where a vehicle might stand in a sunlit ivory courtyard, fictional adult woman walking past, convincing bicycle shadows and reflections, detailed location, no vehicle logos. House style: premium editorial photography or the specifically requested art medium, luminous warm ivory, restrained indigo and lavender accents, soft dimensional light, clear small-thumbnail silhouette, refined material detail and cinematic composition. The image must depict the feature's result. All people are fictional adults with no real person's likeness. No celebrities, brand logos, trademarks, copyrighted characters, typography, letters, numbers, captions or watermark. No Higgsfield art. No interface mockup.

### face-swap-video

Create a wide 16:9 finished-output image for a ComfyField feature card and studio hero, 1600px or greater wide. A lifelike cinematic close-up of a fictional adult man with warm brown skin, short curls and a small natural smile, wearing an ivory jacket inside a softly lit train carriage, indigo dusk outside, natural facial anatomy and fine skin detail. House style: premium editorial photography or the specifically requested art medium, luminous warm ivory, restrained indigo and lavender accents, soft dimensional light, clear small-thumbnail silhouette, refined material detail and cinematic composition. The image must depict the feature's result. All people are fictional adults with no real person's likeness. No celebrities, brand logos, trademarks, copyrighted characters, typography, letters, numbers, captions or watermark. No Higgsfield art. No interface mockup.

### video-bg-remove

Create a wide 16:9 finished-output image for a ComfyField feature card and studio hero, 1600px or greater wide. A clean isolated full-body fictional adult dancer in an indigo flowing jumpsuit, one graceful leg extended, hair in motion, precisely defined silhouette on a plain warm ivory seamless background, no checkerboard pattern. House style: premium editorial photography or the specifically requested art medium, luminous warm ivory, restrained indigo and lavender accents, soft dimensional light, clear small-thumbnail silhouette, refined material detail and cinematic composition. The image must depict the feature's result. All people are fictional adults with no real person's likeness. No celebrities, brand logos, trademarks, copyrighted characters, typography, letters, numbers, captions or watermark. No Higgsfield art. No interface mockup.

### skin-retouch

Create a wide 16:9 finished-output image for a ComfyField feature card and studio hero, 1600px or greater wide. A gentle beauty close-up of a fictional adult woman with medium brown skin, natural freckles, visibly realistic pores and even softly lit complexion, no plastic smoothing, ivory background, subtle lavender edge light, calm expression. House style: premium editorial photography or the specifically requested art medium, luminous warm ivory, restrained indigo and lavender accents, soft dimensional light, clear small-thumbnail silhouette, refined material detail and cinematic composition. The image must depict the feature's result. All people are fictional adults with no real person's likeness. No celebrities, brand logos, trademarks, copyrighted characters, typography, letters, numbers, captions or watermark. No Higgsfield art. No interface mockup.

### face-swap

Create a wide 16:9 finished-output image for a ComfyField feature card and studio hero, 1600px or greater wide. A polished portrait of a fictional adult woman with warm olive skin and short dark curls in a tailored ivory suit, natural face blending with neck and hands, elegant indigo studio backdrop, direct friendly gaze, realistic editorial portrait. House style: premium editorial photography or the specifically requested art medium, luminous warm ivory, restrained indigo and lavender accents, soft dimensional light, clear small-thumbnail silhouette, refined material detail and cinematic composition. The image must depict the feature's result. All people are fictional adults with no real person's likeness. No celebrities, brand logos, trademarks, copyrighted characters, typography, letters, numbers, captions or watermark. No Higgsfield art. No interface mockup.

### headshot

Create a wide 16:9 finished-output image for a ComfyField feature card and studio hero, 1600px or greater wide. A professional head-and-shoulders photograph of a fictional adult man with warm brown skin and short salt-and-pepper curls, ivory open-collar shirt and navy blazer, approachable expression, soft studio light, neutral lavender-gray backdrop. House style: premium editorial photography or the specifically requested art medium, luminous warm ivory, restrained indigo and lavender accents, soft dimensional light, clear small-thumbnail silhouette, refined material detail and cinematic composition. The image must depict the feature's result. All people are fictional adults with no real person's likeness. No celebrities, brand logos, trademarks, copyrighted characters, typography, letters, numbers, captions or watermark. No Higgsfield art. No interface mockup.

### character-swap

Create a wide 16:9 finished-output image for a ComfyField feature card and studio hero, 1600px or greater wide. A fictional adult woman with copper curls, freckles and an indigo jacket leaning on the rail of a pale coastal ferry, natural anatomy, convincing sunlight and shadows, candid full-scene portrait with identity clearly visible. House style: premium editorial photography or the specifically requested art medium, luminous warm ivory, restrained indigo and lavender accents, soft dimensional light, clear small-thumbnail silhouette, refined material detail and cinematic composition. The image must depict the feature's result. All people are fictional adults with no real person's likeness. No celebrities, brand logos, trademarks, copyrighted characters, typography, letters, numbers, captions or watermark. No Higgsfield art. No interface mockup.

### truck-ad

Create a wide 16:9 finished-output image for a ComfyField feature card and studio hero, 1600px or greater wide. A cinematic street photograph of a clean delivery truck driving along pale modern architecture, its side fully wrapped in a tasteful photographic cobalt bottle and lavender flower campaign with no text, subtle background motion blur, unbranded vehicle. House style: premium editorial photography or the specifically requested art medium, luminous warm ivory, restrained indigo and lavender accents, soft dimensional light, clear small-thumbnail silhouette, refined material detail and cinematic composition. The image must depict the feature's result. All people are fictional adults with no real person's likeness. No celebrities, brand logos, trademarks, copyrighted characters, typography, letters, numbers, captions or watermark. No Higgsfield art. No interface mockup.

### billboard

Create a wide 16:9 finished-output image for a ComfyField feature card and studio hero, 1600px or greater wide. An architectural photograph of a large outdoor billboard beside a modern ivory building, billboard displays only a beautiful cobalt-blue perfume bottle on lavender flowers, absolutely no typography or labels, believable perspective and golden morning light. House style: premium editorial photography or the specifically requested art medium, luminous warm ivory, restrained indigo and lavender accents, soft dimensional light, clear small-thumbnail silhouette, refined material detail and cinematic composition. The image must depict the feature's result. All people are fictional adults with no real person's likeness. No celebrities, brand logos, trademarks, copyrighted characters, typography, letters, numbers, captions or watermark. No Higgsfield art. No interface mockup.

### packshot

Create a wide 16:9 finished-output image for a ComfyField feature card and studio hero, 1600px or greater wide. A frozen bullet-time product frame of an unbranded cobalt-blue perfume bottle suspended horizontally in an arcing ring of water droplets, sculptural ivory backdrop, dynamic perspective and perfectly sharp droplets, no label. House style: premium editorial photography or the specifically requested art medium, luminous warm ivory, restrained indigo and lavender accents, soft dimensional light, clear small-thumbnail silhouette, refined material detail and cinematic composition. The image must depict the feature's result. All people are fictional adults with no real person's likeness. No celebrities, brand logos, trademarks, copyrighted characters, typography, letters, numbers, captions or watermark. No Higgsfield art. No interface mockup.

### meme

Create a wide 16:9 finished-output image for a ComfyField feature card and studio hero, 1600px or greater wide. A funny original photograph of a very fluffy lavender-gray cat with an astonished wide-eyed expression beside an empty ceramic treat bowl, generous plain ivory space above and below for users to add their own captions, absolutely no existing text. House style: premium editorial photography or the specifically requested art medium, luminous warm ivory, restrained indigo and lavender accents, soft dimensional light, clear small-thumbnail silhouette, refined material detail and cinematic composition. The image must depict the feature's result. All people are fictional adults with no real person's likeness. No celebrities, brand logos, trademarks, copyrighted characters, typography, letters, numbers, captions or watermark. No Higgsfield art. No interface mockup.

### sticker

Create a wide 16:9 finished-output image for a ComfyField feature card and studio hero, 1600px or greater wide. A glossy die-cut sticker of an original lavender fox curled around a white flower, thick clean ivory border visible, photographed slightly raised above pale lavender paper with a soft shadow, playful premium illustration. House style: premium editorial photography or the specifically requested art medium, luminous warm ivory, restrained indigo and lavender accents, soft dimensional light, clear small-thumbnail silhouette, refined material detail and cinematic composition. The image must depict the feature's result. All people are fictional adults with no real person's likeness. No celebrities, brand logos, trademarks, copyrighted characters, typography, letters, numbers, captions or watermark. No Higgsfield art. No interface mockup.

### figure-box

Create a wide 16:9 finished-output image for a ComfyField feature card and studio hero, 1600px or greater wide. An original collectible miniature of a fictional adult woman explorer wearing an ivory coat, sculpted toy proportions, inside an entirely blank lavender presentation box with clear display window and molded accessory slots, no lettering anywhere. House style: premium editorial photography or the specifically requested art medium, luminous warm ivory, restrained indigo and lavender accents, soft dimensional light, clear small-thumbnail silhouette, refined material detail and cinematic composition. The image must depict the feature's result. All people are fictional adults with no real person's likeness. No celebrities, brand logos, trademarks, copyrighted characters, typography, letters, numbers, captions or watermark. No Higgsfield art. No interface mockup.

### behind-the-scenes

Create a wide 16:9 finished-output image for a ComfyField feature card and studio hero, 1600px or greater wide. A wide editorial photograph revealing a fictional coastal movie scene on an indoor soundstage: ivory archway and artificial lavender ocean backdrop, fictional adult performer, practical lights, boom and crew visible at edges, no labels or logos. House style: premium editorial photography or the specifically requested art medium, luminous warm ivory, restrained indigo and lavender accents, soft dimensional light, clear small-thumbnail silhouette, refined material detail and cinematic composition. The image must depict the feature's result. All people are fictional adults with no real person's likeness. No celebrities, brand logos, trademarks, copyrighted characters, typography, letters, numbers, captions or watermark. No Higgsfield art. No interface mockup.

### all-fine

Create a wide 16:9 finished-output image for a ComfyField feature card and studio hero, 1600px or greater wide. A humorous original clay-animation scene of a small lavender fox calmly sipping tea at an ivory kitchen table while harmless stylized orange paper flames curl around the room, relaxed face, handcrafted textures, no familiar characters. House style: premium editorial photography or the specifically requested art medium, luminous warm ivory, restrained indigo and lavender accents, soft dimensional light, clear small-thumbnail silhouette, refined material detail and cinematic composition. The image must depict the feature's result. All people are fictional adults with no real person's likeness. No celebrities, brand logos, trademarks, copyrighted characters, typography, letters, numbers, captions or watermark. No Higgsfield art. No interface mockup.

### life-sim

Create a wide 16:9 finished-output image for a ComfyField feature card and studio hero, 1600px or greater wide. An original cozy isometric life-simulation game scene, a small cutaway ivory apartment with lavender sofa, plants, miniature fictional adult character preparing tea, charming refined three-dimensional render, no interface or familiar game symbols. House style: premium editorial photography or the specifically requested art medium, luminous warm ivory, restrained indigo and lavender accents, soft dimensional light, clear small-thumbnail silhouette, refined material detail and cinematic composition. The image must depict the feature's result. All people are fictional adults with no real person's likeness. No celebrities, brand logos, trademarks, copyrighted characters, typography, letters, numbers, captions or watermark. No Higgsfield art. No interface mockup.

### game-show

Create a wide 16:9 finished-output image for a ComfyField feature card and studio hero, 1600px or greater wide. A bright fictional adult female contestant smiling behind a blank sculptural indigo game-show podium, circular lavender stage lighting, studio audience softly out of focus, celebratory polished television frame, no scores or text. House style: premium editorial photography or the specifically requested art medium, luminous warm ivory, restrained indigo and lavender accents, soft dimensional light, clear small-thumbnail silhouette, refined material detail and cinematic composition. The image must depict the feature's result. All people are fictional adults with no real person's likeness. No celebrities, brand logos, trademarks, copyrighted characters, typography, letters, numbers, captions or watermark. No Higgsfield art. No interface mockup.

### video-character-swap

Create a wide 16:9 finished-output image for a ComfyField feature card and studio hero, 1600px or greater wide. A cinematic action frame of a fictional adult woman with short copper curls in a flowing indigo coat turning gracefully on an ivory rooftop, natural cloth motion and expressive face, believable daylight and anatomy. House style: premium editorial photography or the specifically requested art medium, luminous warm ivory, restrained indigo and lavender accents, soft dimensional light, clear small-thumbnail silhouette, refined material detail and cinematic composition. The image must depict the feature's result. All people are fictional adults with no real person's likeness. No celebrities, brand logos, trademarks, copyrighted characters, typography, letters, numbers, captions or watermark. No Higgsfield art. No interface mockup.

### angles

Create a wide 16:9 finished-output image for a ComfyField feature card and studio hero, 1600px or greater wide. A three-panel cinematic contact sheet showing the same fictional adult woman in an ivory coat in the same seaside colonnade from front, side and rear camera positions, consistent geometry and lighting, clear change of viewpoint. House style: premium editorial photography or the specifically requested art medium, luminous warm ivory, restrained indigo and lavender accents, soft dimensional light, clear small-thumbnail silhouette, refined material detail and cinematic composition. The image must depict the feature's result. All people are fictional adults with no real person's likeness. No celebrities, brand logos, trademarks, copyrighted characters, typography, letters, numbers, captions or watermark. No Higgsfield art. No interface mockup.

### ai-stylist

Create a wide 16:9 finished-output image for a ComfyField feature card and studio hero, 1600px or greater wide. A high-fashion editorial full-body portrait of a fictional adult woman in a coordinated indigo linen suit, ivory top, sculptural silver earrings and pale leather shoes, clean lavender studio backdrop, finished styled outfit, no logos. House style: premium editorial photography or the specifically requested art medium, luminous warm ivory, restrained indigo and lavender accents, soft dimensional light, clear small-thumbnail silhouette, refined material detail and cinematic composition. The image must depict the feature's result. All people are fictional adults with no real person's likeness. No celebrities, brand logos, trademarks, copyrighted characters, typography, letters, numbers, captions or watermark. No Higgsfield art. No interface mockup.

### asmr-classic

Create a wide 16:9 finished-output image for a ComfyField feature card and studio hero, 1600px or greater wide. An intimate tactile macro editorial frame of fictional adult hands slowly pressing a pearl-colored soap sphere into a shallow bowl of lavender foam, tiny bubbles and soft textures, calm diffuse light, evokes gentle ASMR sounds, no writing. House style: premium editorial photography or the specifically requested art medium, luminous warm ivory, restrained indigo and lavender accents, soft dimensional light, clear small-thumbnail silhouette, refined material detail and cinematic composition. The image must depict the feature's result. All people are fictional adults with no real person's likeness. No celebrities, brand logos, trademarks, copyrighted characters, typography, letters, numbers, captions or watermark. No Higgsfield art. No interface mockup.

### paint-app

Create a wide 16:9 finished-output image for a ComfyField feature card and studio hero, 1600px or greater wide. A retro beige CRT monitor displaying only a pixel-art lavender coastal landscape and tiny simple color swatches, absolutely no menus, letters or numbers, warm ivory desk, playful nostalgic photograph of a finished pixel painting. House style: premium editorial photography or the specifically requested art medium, luminous warm ivory, restrained indigo and lavender accents, soft dimensional light, clear small-thumbnail silhouette, refined material detail and cinematic composition. The image must depict the feature's result. All people are fictional adults with no real person's likeness. No celebrities, brand logos, trademarks, copyrighted characters, typography, letters, numbers, captions or watermark. No Higgsfield art. No interface mockup.

### mural

Create a wide 16:9 finished-output image for a ComfyField feature card and studio hero, 1600px or greater wide. A huge beautifully painted wall mural of an original lavender fox with flowing indigo flowers on a sunlit ivory city wall, fictional adult pedestrian provides scale, realistic wall texture and cast shadows, no writing or signature. House style: premium editorial photography or the specifically requested art medium, luminous warm ivory, restrained indigo and lavender accents, soft dimensional light, clear small-thumbnail silhouette, refined material detail and cinematic composition. The image must depict the feature's result. All people are fictional adults with no real person's likeness. No celebrities, brand logos, trademarks, copyrighted characters, typography, letters, numbers, captions or watermark. No Higgsfield art. No interface mockup.

### micro-beasts

Create a wide 16:9 finished-output image for a ComfyField feature card and studio hero, 1600px or greater wide. A whimsical photoreal scene of a fictional adult woman in an ivory dress sitting on pale stone steps surrounded by dozens of tiny miniature lavender-gray kittens, playful varied poses and believable size contrast, soft daylight. House style: premium editorial photography or the specifically requested art medium, luminous warm ivory, restrained indigo and lavender accents, soft dimensional light, clear small-thumbnail silhouette, refined material detail and cinematic composition. The image must depict the feature's result. All people are fictional adults with no real person's likeness. No celebrities, brand logos, trademarks, copyrighted characters, typography, letters, numbers, captions or watermark. No Higgsfield art. No interface mockup.

### image-bg-remove

Create a wide 16:9 finished-output image for a ComfyField feature card and studio hero, 1600px or greater wide. A crisp isolated unbranded cobalt-blue glass perfume bottle and a small white orchid branch on a completely plain warm ivory background, clean defined edges and subtle grounding shadow, no label or checkerboard pattern. House style: premium editorial photography or the specifically requested art medium, luminous warm ivory, restrained indigo and lavender accents, soft dimensional light, clear small-thumbnail silhouette, refined material detail and cinematic composition. The image must depict the feature's result. All people are fictional adults with no real person's likeness. No celebrities, brand logos, trademarks, copyrighted characters, typography, letters, numbers, captions or watermark. No Higgsfield art. No interface mockup.

### surprise-kiss

Create a wide 16:9 finished-output image for a ComfyField feature card and studio hero, 1600px or greater wide. A candid affectionate editorial photograph of two fictional adults: a woman with dark curls laughing as her adult partner leans into frame and gently kisses her cheek, ivory knitwear, sunny lavender garden background, wholesome natural expressions. House style: premium editorial photography or the specifically requested art medium, luminous warm ivory, restrained indigo and lavender accents, soft dimensional light, clear small-thumbnail silhouette, refined material detail and cinematic composition. The image must depict the feature's result. All people are fictional adults with no real person's likeness. No celebrities, brand logos, trademarks, copyrighted characters, typography, letters, numbers, captions or watermark. No Higgsfield art. No interface mockup.

### glossy-vinyl

Create a wide 16:9 finished-output image for a ComfyField feature card and studio hero, 1600px or greater wide. A high-fashion editorial full-body fictional adult model wearing a sleek glossy black vinyl trench coat over a tasteful indigo outfit, reflective sculptural material, pale lavender studio backdrop, soft cinematic highlights, fully clothed. House style: premium editorial photography or the specifically requested art medium, luminous warm ivory, restrained indigo and lavender accents, soft dimensional light, clear small-thumbnail silhouette, refined material detail and cinematic composition. The image must depict the feature's result. All people are fictional adults with no real person's likeness. No celebrities, brand logos, trademarks, copyrighted characters, typography, letters, numbers, captions or watermark. No Higgsfield art. No interface mockup.

### video-erase

Create a wide 16:9 finished-output image for a ComfyField feature card and studio hero, 1600px or greater wide. A pristine cinematic wide shot of an empty ivory coastal plaza with seamless paving, a single elegant silver olive tree and lavender ocean horizon, believable continuous ground texture where objects have been removed. House style: premium editorial photography or the specifically requested art medium, luminous warm ivory, restrained indigo and lavender accents, soft dimensional light, clear small-thumbnail silhouette, refined material detail and cinematic composition. The image must depict the feature's result. All people are fictional adults with no real person's likeness. No celebrities, brand logos, trademarks, copyrighted characters, typography, letters, numbers, captions or watermark. No Higgsfield art. No interface mockup.

### video-remove-text

Create a wide 16:9 finished-output image for a ComfyField feature card and studio hero, 1600px or greater wide. A clean restored cinematic frame of a fictional adult man in an ivory shirt standing by a rain-streaked window, continuous unobstructed image across entire lower third, beautifully detailed indigo city bokeh outside, no captions or typography anywhere. House style: premium editorial photography or the specifically requested art medium, luminous warm ivory, restrained indigo and lavender accents, soft dimensional light, clear small-thumbnail silhouette, refined material detail and cinematic composition. The image must depict the feature's result. All people are fictional adults with no real person's likeness. No celebrities, brand logos, trademarks, copyrighted characters, typography, letters, numbers, captions or watermark. No Higgsfield art. No interface mockup.

### image-to-3d

Create a wide 16:9 finished-output image for a ComfyField feature card and studio hero, 1600px or greater wide. An original sculptural three-dimensional model of a lavender ceramic fox, smooth physically based surface, three-quarter perspective on an ivory circular turntable plinth, soft contact shadow, studio model render. House style: premium editorial photography or the specifically requested art medium, luminous warm ivory, restrained indigo and lavender accents, soft dimensional light, clear small-thumbnail silhouette, refined material detail and cinematic composition. The image must depict the feature's result. All people are fictional adults with no real person's likeness. No celebrities, brand logos, trademarks, copyrighted characters, typography, letters, numbers, captions or watermark. No Higgsfield art. No interface mockup.

### character-to-3d

Create a wide 16:9 finished-output image for a ComfyField feature card and studio hero, 1600px or greater wide. An original three-dimensional character figure of a fictional adult woman explorer with short curly dark hair and an ivory coat, tasteful stylized proportions, full body standing on a simple lavender base, clean model render. House style: premium editorial photography or the specifically requested art medium, luminous warm ivory, restrained indigo and lavender accents, soft dimensional light, clear small-thumbnail silhouette, refined material detail and cinematic composition. The image must depict the feature's result. All people are fictional adults with no real person's likeness. No celebrities, brand logos, trademarks, copyrighted characters, typography, letters, numbers, captions or watermark. No Higgsfield art. No interface mockup.

### human-video

Create a wide 16:9 finished-output image for a ComfyField feature card and studio hero, 1600px or greater wide. A lifelike cinematic documentary frame of a fictional adult woman with deep brown skin and short natural curls speaking warmly in a bright ceramic workshop, ivory apron, expressive hands, believable mouth and eyes, lavender ceramics in background. House style: premium editorial photography or the specifically requested art medium, luminous warm ivory, restrained indigo and lavender accents, soft dimensional light, clear small-thumbnail silhouette, refined material detail and cinematic composition. The image must depict the feature's result. All people are fictional adults with no real person's likeness. No celebrities, brand logos, trademarks, copyrighted characters, typography, letters, numbers, captions or watermark. No Higgsfield art. No interface mockup.

### origami-fold

Create a wide 16:9 finished-output image for a ComfyField feature card and studio hero, 1600px or greater wide. A surreal sculptural coastal landscape folding itself into crisp lavender origami paper: tiny ivory house, folded indigo ocean waves and angular paper trees. One corner visibly lifting and folding, tactile paper creases and shadows. House style: premium editorial photography or the specifically requested art medium, luminous warm ivory, restrained indigo and lavender accents, soft dimensional light, clear small-thumbnail silhouette, refined material detail and cinematic composition. The image must depict the feature's result. All people are fictional adults with no real person's likeness. No celebrities, brand logos, trademarks, copyrighted characters, typography, letters, numbers, captions or watermark. No Higgsfield art. No interface mockup.

### turntable

Create a wide 16:9 finished-output image for a ComfyField feature card and studio hero, 1600px or greater wide. A three-panel product turntable contact sheet showing the same original lavender ceramic fox sculpture from front, three-quarter and rear angles on an ivory rotating plinth, consistent dimensions and lighting, no arrows or text. House style: premium editorial photography or the specifically requested art medium, luminous warm ivory, restrained indigo and lavender accents, soft dimensional light, clear small-thumbnail silhouette, refined material detail and cinematic composition. The image must depict the feature's result. All people are fictional adults with no real person's likeness. No celebrities, brand logos, trademarks, copyrighted characters, typography, letters, numbers, captions or watermark. No Higgsfield art. No interface mockup.

### snow-globe

Create a wide 16:9 finished-output image for a ComfyField feature card and studio hero, 1600px or greater wide. A tiny intricate coastal village with an ivory lighthouse and silver trees enclosed in a clear glass snow globe, swirling lavender snow flecks, plain ivory circular base, magical miniature photography, no words. House style: premium editorial photography or the specifically requested art medium, luminous warm ivory, restrained indigo and lavender accents, soft dimensional light, clear small-thumbnail silhouette, refined material detail and cinematic composition. The image must depict the feature's result. All people are fictional adults with no real person's likeness. No celebrities, brand logos, trademarks, copyrighted characters, typography, letters, numbers, captions or watermark. No Higgsfield art. No interface mockup.

### paint-splash

Create a wide 16:9 finished-output image for a ComfyField feature card and studio hero, 1600px or greater wide. A dynamic photographic frame of thick lavender, indigo and peach paint splashing around a white ceramic bust, liquid arcs and sharp droplets frozen in air, ivory studio background, bold tactile visual effect. House style: premium editorial photography or the specifically requested art medium, luminous warm ivory, restrained indigo and lavender accents, soft dimensional light, clear small-thumbnail silhouette, refined material detail and cinematic composition. The image must depict the feature's result. All people are fictional adults with no real person's likeness. No celebrities, brand logos, trademarks, copyrighted characters, typography, letters, numbers, captions or watermark. No Higgsfield art. No interface mockup.

### burst-into-petals

Create a wide 16:9 finished-output image for a ComfyField feature card and studio hero, 1600px or greater wide. A magical cinematic portrait of a fictional adult woman in an ivory dress whose skirt and one arm burst into hundreds of lavender flower petals swirling through the air, face intact, pale blue studio sky, clear transformation. House style: premium editorial photography or the specifically requested art medium, luminous warm ivory, restrained indigo and lavender accents, soft dimensional light, clear small-thumbnail silhouette, refined material detail and cinematic composition. The image must depict the feature's result. All people are fictional adults with no real person's likeness. No celebrities, brand logos, trademarks, copyrighted characters, typography, letters, numbers, captions or watermark. No Higgsfield art. No interface mockup.

### time-lapse

Create a wide 16:9 finished-output image for a ComfyField feature card and studio hero, 1600px or greater wide. A cinematic long-exposure frame of an ivory coastal observatory at twilight, luminous lavender star trails sweeping across the sky, subtly blurred clouds and sharp architecture, depicts time passing in a single photographic frame. House style: premium editorial photography or the specifically requested art medium, luminous warm ivory, restrained indigo and lavender accents, soft dimensional light, clear small-thumbnail silhouette, refined material detail and cinematic composition. The image must depict the feature's result. All people are fictional adults with no real person's likeness. No celebrities, brand logos, trademarks, copyrighted characters, typography, letters, numbers, captions or watermark. No Higgsfield art. No interface mockup.

### floating-fall

Create a wide 16:9 finished-output image for a ComfyField feature card and studio hero, 1600px or greater wide. A dreamlike cinematic frame of a fictional adult woman in an ivory flowing dress drifting gently downward through towering lavender clouds, horizontal graceful pose, loose fabric trailing upward, soft sunlight, clear floating sensation. House style: premium editorial photography or the specifically requested art medium, luminous warm ivory, restrained indigo and lavender accents, soft dimensional light, clear small-thumbnail silhouette, refined material detail and cinematic composition. The image must depict the feature's result. All people are fictional adults with no real person's likeness. No celebrities, brand logos, trademarks, copyrighted characters, typography, letters, numbers, captions or watermark. No Higgsfield art. No interface mockup.

### high-flip

Create a wide 16:9 finished-output image for a ComfyField feature card and studio hero, 1600px or greater wide. A dynamic cinematic sports photograph of a fictional adult acrobat in an indigo jumpsuit midway through a high backflip over an ivory sand dune, believable body anatomy and tucked pose, vast pale lavender sky. House style: premium editorial photography or the specifically requested art medium, luminous warm ivory, restrained indigo and lavender accents, soft dimensional light, clear small-thumbnail silhouette, refined material detail and cinematic composition. The image must depict the feature's result. All people are fictional adults with no real person's likeness. No celebrities, brand logos, trademarks, copyrighted characters, typography, letters, numbers, captions or watermark. No Higgsfield art. No interface mockup.

### studio-slide

Create a wide 16:9 finished-output image for a ComfyField feature card and studio hero, 1600px or greater wide. A surreal cinematic frame where a lavender coastal landscape backdrop visibly slides sideways on a track revealing a clean ivory photography studio with a fictional adult woman in an indigo dress standing between both settings. House style: premium editorial photography or the specifically requested art medium, luminous warm ivory, restrained indigo and lavender accents, soft dimensional light, clear small-thumbnail silhouette, refined material detail and cinematic composition. The image must depict the feature's result. All people are fictional adults with no real person's likeness. No celebrities, brand logos, trademarks, copyrighted characters, typography, letters, numbers, captions or watermark. No Higgsfield art. No interface mockup.

### street-giant

Create a wide 16:9 finished-output image for a ComfyField feature card and studio hero, 1600px or greater wide. A cinematic surreal photograph of a giant fictional adult woman in an ivory coat towering over a modern coastal street of tiny pale buildings and miniature cars, convincing low-angle perspective and sunlight, playful scale effect. House style: premium editorial photography or the specifically requested art medium, luminous warm ivory, restrained indigo and lavender accents, soft dimensional light, clear small-thumbnail silhouette, refined material detail and cinematic composition. The image must depict the feature's result. All people are fictional adults with no real person's likeness. No celebrities, brand logos, trademarks, copyrighted characters, typography, letters, numbers, captions or watermark. No Higgsfield art. No interface mockup.

### eyes-in

Create a wide 16:9 finished-output image for a ComfyField feature card and studio hero, 1600px or greater wide. An extreme cinematic macro of a fictional adult woman's eye with a lavender-blue iris whose pupil opens into a tiny detailed indigo ocean world, surreal eye-to-world portal effect, natural skin and eyelashes, elegant realistic lighting. House style: premium editorial photography or the specifically requested art medium, luminous warm ivory, restrained indigo and lavender accents, soft dimensional light, clear small-thumbnail silhouette, refined material detail and cinematic composition. The image must depict the feature's result. All people are fictional adults with no real person's likeness. No celebrities, brand logos, trademarks, copyrighted characters, typography, letters, numbers, captions or watermark. No Higgsfield art. No interface mockup.

### world-morph

Create a wide 16:9 finished-output image for a ComfyField feature card and studio hero, 1600px or greater wide. A cinematic surreal scene of a fictional adult woman in an ivory dress standing still as the surrounding lavender city street organically transforms into lush silver forest on one side and indigo sea on the other, seamless physical morph. House style: premium editorial photography or the specifically requested art medium, luminous warm ivory, restrained indigo and lavender accents, soft dimensional light, clear small-thumbnail silhouette, refined material detail and cinematic composition. The image must depict the feature's result. All people are fictional adults with no real person's likeness. No celebrities, brand logos, trademarks, copyrighted characters, typography, letters, numbers, captions or watermark. No Higgsfield art. No interface mockup.

### cam-tilt-up

Create a wide 16:9 finished-output image for a ComfyField feature card and studio hero, 1600px or greater wide. A dramatic low-angle cinematic view from near the base of a tall ivory lighthouse up to its lantern and vast lavender sky, converging architecture and soft clouds, upward camera tilt result. House style: premium editorial photography or the specifically requested art medium, luminous warm ivory, restrained indigo and lavender accents, soft dimensional light, clear small-thumbnail silhouette, refined material detail and cinematic composition. The image must depict the feature's result. All people are fictional adults with no real person's likeness. No celebrities, brand logos, trademarks, copyrighted characters, typography, letters, numbers, captions or watermark. No Higgsfield art. No interface mockup.

### cam-pan-left

Create a wide 16:9 finished-output image for a ComfyField feature card and studio hero, 1600px or greater wide. A cinematic landscape frame sweeping left along an ivory coastal promenade, a fictional adult cyclist entering from the right, subtle horizontal motion streaks in near foreground, lavender sea and clear horizon, directional lateral composition. House style: premium editorial photography or the specifically requested art medium, luminous warm ivory, restrained indigo and lavender accents, soft dimensional light, clear small-thumbnail silhouette, refined material detail and cinematic composition. The image must depict the feature's result. All people are fictional adults with no real person's likeness. No celebrities, brand logos, trademarks, copyrighted characters, typography, letters, numbers, captions or watermark. No Higgsfield art. No interface mockup.

### cam-pan-right

Create a wide 16:9 finished-output image for a ComfyField feature card and studio hero, 1600px or greater wide. A cinematic landscape frame sweeping right along an ivory coastal promenade, a fictional adult runner entering from the left, subtle horizontal motion streaks in foreground grasses, indigo sea and warm low sun. House style: premium editorial photography or the specifically requested art medium, luminous warm ivory, restrained indigo and lavender accents, soft dimensional light, clear small-thumbnail silhouette, refined material detail and cinematic composition. The image must depict the feature's result. All people are fictional adults with no real person's likeness. No celebrities, brand logos, trademarks, copyrighted characters, typography, letters, numbers, captions or watermark. No Higgsfield art. No interface mockup.

### cam-tilt-reveal

Create a wide 16:9 finished-output image for a ComfyField feature card and studio hero, 1600px or greater wide. A low cinematic frame with detailed silver grass and pale stones in the foreground revealing a fictional adult woman in an ivory coat standing against an enormous lavender moon, ground-to-subject reveal composition. House style: premium editorial photography or the specifically requested art medium, luminous warm ivory, restrained indigo and lavender accents, soft dimensional light, clear small-thumbnail silhouette, refined material detail and cinematic composition. The image must depict the feature's result. All people are fictional adults with no real person's likeness. No celebrities, brand logos, trademarks, copyrighted characters, typography, letters, numbers, captions or watermark. No Higgsfield art. No interface mockup.

### cam-tilt-down

Create a wide 16:9 finished-output image for a ComfyField feature card and studio hero, 1600px or greater wide. A steep elevated cinematic view looking downward from an ivory lighthouse balcony toward a fictional adult woman on a lavender seaside path, strong depth and graceful curved architecture, downward camera tilt result. House style: premium editorial photography or the specifically requested art medium, luminous warm ivory, restrained indigo and lavender accents, soft dimensional light, clear small-thumbnail silhouette, refined material detail and cinematic composition. The image must depict the feature's result. All people are fictional adults with no real person's likeness. No celebrities, brand logos, trademarks, copyrighted characters, typography, letters, numbers, captions or watermark. No Higgsfield art. No interface mockup.

### cam-zoom-in

Create a wide 16:9 finished-output image for a ComfyField feature card and studio hero, 1600px or greater wide. An intimate cinematic close-up of a fictional adult woman with dark curls and an ivory collar, compressed distant lavender coastal lights turned to large soft bokeh, fine eye detail, telephoto zoom result. House style: premium editorial photography or the specifically requested art medium, luminous warm ivory, restrained indigo and lavender accents, soft dimensional light, clear small-thumbnail silhouette, refined material detail and cinematic composition. The image must depict the feature's result. All people are fictional adults with no real person's likeness. No celebrities, brand logos, trademarks, copyrighted characters, typography, letters, numbers, captions or watermark. No Higgsfield art. No interface mockup.

### cam-static

Create a wide 16:9 finished-output image for a ComfyField feature card and studio hero, 1600px or greater wide. A perfectly composed locked-off cinematic wide shot of an ivory archway framing lavender ocean, translucent curtains drifting in the breeze and a tiny white bird in flight, serene balanced perspective. House style: premium editorial photography or the specifically requested art medium, luminous warm ivory, restrained indigo and lavender accents, soft dimensional light, clear small-thumbnail silhouette, refined material detail and cinematic composition. The image must depict the feature's result. All people are fictional adults with no real person's likeness. No celebrities, brand logos, trademarks, copyrighted characters, typography, letters, numbers, captions or watermark. No Higgsfield art. No interface mockup.

### cam-zoom-out

Create a wide 16:9 finished-output image for a ComfyField feature card and studio hero, 1600px or greater wide. An ultra-wide cinematic frame of a grand ivory coastal greenhouse surrounded by lavender ocean and silver meadow, tiny fictional adult person beside the doorway, broad optical field and sweeping scenery. House style: premium editorial photography or the specifically requested art medium, luminous warm ivory, restrained indigo and lavender accents, soft dimensional light, clear small-thumbnail silhouette, refined material detail and cinematic composition. The image must depict the feature's result. All people are fictional adults with no real person's likeness. No celebrities, brand logos, trademarks, copyrighted characters, typography, letters, numbers, captions or watermark. No Higgsfield art. No interface mockup.

### cam-handheld

Create a wide 16:9 finished-output image for a ComfyField feature card and studio hero, 1600px or greater wide. A candid documentary-style cinematic frame of a fictional adult woman laughing in a sunlit coastal market, slightly imperfect off-center framing and subtle motion in foreground cloth, ivory and indigo fabrics, no signs. House style: premium editorial photography or the specifically requested art medium, luminous warm ivory, restrained indigo and lavender accents, soft dimensional light, clear small-thumbnail silhouette, refined material detail and cinematic composition. The image must depict the feature's result. All people are fictional adults with no real person's likeness. No celebrities, brand logos, trademarks, copyrighted characters, typography, letters, numbers, captions or watermark. No Higgsfield art. No interface mockup.

### look-studio-fashion

Create a wide 16:9 finished-output image for a ComfyField feature card and studio hero, 1600px or greater wide. A full-length studio fashion editorial of a fictional adult man with short dark curls wearing a sculptural indigo tailored suit and ivory shoes on a seamless pale lavender backdrop. Crisp professional fashion lighting, visible fabric texture, relaxed confident pose. House style: premium editorial photography or the specifically requested art medium, luminous warm ivory, restrained indigo and lavender accents, soft dimensional light, clear small-thumbnail silhouette, refined material detail and cinematic composition. The image must depict the feature's result. All people are fictional adults with no real person's likeness. No celebrities, brand logos, trademarks, copyrighted characters, typography, letters, numbers, captions or watermark. No Higgsfield art. No interface mockup.

### look-golden-hour

Create a wide 16:9 finished-output image for a ComfyField feature card and studio hero, 1600px or greater wide. A warm golden-hour editorial portrait of a fictional adult Black woman in an ivory linen coat standing beside silver olive trees above a lavender-blue sea. Low sun, refined magazine composition, authentic glowing skin, soft cinematic flare. House style: premium editorial photography or the specifically requested art medium, luminous warm ivory, restrained indigo and lavender accents, soft dimensional light, clear small-thumbnail silhouette, refined material detail and cinematic composition. The image must depict the feature's result. All people are fictional adults with no real person's likeness. No celebrities, brand logos, trademarks, copyrighted characters, typography, letters, numbers, captions or watermark. No Higgsfield art. No interface mockup.

### look-street-style

Create a wide 16:9 finished-output image for a ComfyField feature card and studio hero, 1600px or greater wide. A candid street-style editorial photograph of a fictional adult woman with short copper curls striding along a modern ivory city sidewalk in an oversized indigo coat and pale trousers. Natural motion, architectural perspective, no signs or vehicles with logos. House style: premium editorial photography or the specifically requested art medium, luminous warm ivory, restrained indigo and lavender accents, soft dimensional light, clear small-thumbnail silhouette, refined material detail and cinematic composition. The image must depict the feature's result. All people are fictional adults with no real person's likeness. No celebrities, brand logos, trademarks, copyrighted characters, typography, letters, numbers, captions or watermark. No Higgsfield art. No interface mockup.

### look-watercolor

Create a wide 16:9 finished-output image for a ComfyField feature card and studio hero, 1600px or greater wide. An original watercolor painting of an ivory coastal village above a lavender-indigo sea, loose transparent washes, wet-on-wet blooms, subtle pencil underdrawing, visible textured cold-pressed paper, soft dissolving edges. The entire image is painted, not a photo of a painting. House style: premium editorial photography or the specifically requested art medium, luminous warm ivory, restrained indigo and lavender accents, soft dimensional light, clear small-thumbnail silhouette, refined material detail and cinematic composition. The image must depict the feature's result. All people are fictional adults with no real person's likeness. No celebrities, brand logos, trademarks, copyrighted characters, typography, letters, numbers, captions or watermark. No Higgsfield art. No interface mockup.

### look-oil-painting

Create a wide 16:9 finished-output image for a ComfyField feature card and studio hero, 1600px or greater wide. An original oil painting of white irises, lavender pears and an ivory ceramic pitcher on folded indigo cloth, thick visible impasto brush strokes, luminous ivory highlights and rich lavender shadows, tactile expressive paint. Entire image is the painting, no frame. House style: premium editorial photography or the specifically requested art medium, luminous warm ivory, restrained indigo and lavender accents, soft dimensional light, clear small-thumbnail silhouette, refined material detail and cinematic composition. The image must depict the feature's result. All people are fictional adults with no real person's likeness. No celebrities, brand logos, trademarks, copyrighted characters, typography, letters, numbers, captions or watermark. No Higgsfield art. No interface mockup.

### look-film-noir

Create a wide 16:9 finished-output image for a ComfyField feature card and studio hero, 1600px or greater wide. A classic original black-and-white film noir still of a fictional adult woman with short curls in a tailored coat beside a rain-streaked window. Hard Venetian-blind shadows across her face and ivory room, smoky atmosphere, rich silver-grain monochrome, no color. House style: premium editorial photography or the specifically requested art medium, luminous warm ivory, restrained indigo and lavender accents, soft dimensional light, clear small-thumbnail silhouette, refined material detail and cinematic composition. The image must depict the feature's result. All people are fictional adults with no real person's likeness. No celebrities, brand logos, trademarks, copyrighted characters, typography, letters, numbers, captions or watermark. No Higgsfield art. No interface mockup.

### look-ink-sketch

Create a wide 16:9 finished-output image for a ComfyField feature card and studio hero, 1600px or greater wide. An original loose ink sketch of ivory coastal architecture and silver olive trees overlooking the sea, expressive indigo-black pen lines, cross hatching, sparse lavender wash, generous warm paper negative space. Entire image is the drawing, no signatures or annotations. House style: premium editorial photography or the specifically requested art medium, luminous warm ivory, restrained indigo and lavender accents, soft dimensional light, clear small-thumbnail silhouette, refined material detail and cinematic composition. The image must depict the feature's result. All people are fictional adults with no real person's likeness. No celebrities, brand logos, trademarks, copyrighted characters, typography, letters, numbers, captions or watermark. No Higgsfield art. No interface mockup.

### look-pixel-art

Create a wide 16:9 finished-output image for a ComfyField feature card and studio hero, 1600px or greater wide. An original crisp low-resolution pixel-art landscape of a small ivory lighthouse above an indigo sea, lavender clouds and silver flowers, visible square pixels, a restricted tasteful palette, clean deliberate clusters with no smoothing. Not a photo of a screen and no interface. House style: premium editorial photography or the specifically requested art medium, luminous warm ivory, restrained indigo and lavender accents, soft dimensional light, clear small-thumbnail silhouette, refined material detail and cinematic composition. The image must depict the feature's result. All people are fictional adults with no real person's likeness. No celebrities, brand logos, trademarks, copyrighted characters, typography, letters, numbers, captions or watermark. No Higgsfield art. No interface mockup.

## Validation and evidence

Windows scratch clone: `C:/Users/User/comfyfield-art-20261019`. Builds, checks, image optimization and headless Chrome run there, sequentially. No source `.env` or `.comfyfield` directory is transferred.

Before/after screenshots: `research_notes/screenshots/placeholder-assets/` at 1440px and 390px, for Explore, the Professional app hub, Character studio, and the empty Library. Capture uses an isolated mock API and empty browser profile; it does not generate or seed Library results.

The baseline Library tab row overflowed to 446px at 390px; the art lane contains that tab row. Baseline console exceptions, if any, are recorded separately from final validation. Final check logs are stored beside the screenshots. The full Windows verification initially picked the WindowsApps WSL bash shim and failed its existing Pod fixtures on Windows paths. Putting the installed Git Bash first on the validation process path made all 17 check scripts pass; no Pod files changed. The process-only path selection was `C:/Program Files/Git/bin;C:/Program Files/Git/usr/bin`. The first verification log is retained as `verify-first-attempt.txt`. The two queued image requests stopped during batch reconciliation produced no saved master; those prompts were reconciled and completed in the following batch, as recorded in `placeholder-assets-generation-notes.json`.

### Final check output

| Command | Result | Seconds |
| --- | --- | --- |
| `npx vite build` | Passed | 3.148 |
| `node scripts/theme-check.mjs` | Passed | 0.083 |
| `node scripts/verify.mjs` | Passed | 49.733 |
| `node scripts/placeholder-assets-capture.mjs after` | Passed | 15.945 |

Verification result: 17/17 check scripts passed. Final screenshots have no JavaScript exceptions or broken art images. All tested mobile routes fit the 390px viewport. Windows validation left no lane-owned Node, Python or Chrome process running.
