// Skills: named, multi-step jobs an agent runs on ComfyField through the MCP server. The /skills page and
// /skills/:id read from here. Mirrors Higgsfield's skill library (feature audit, "Agent: MCP skills"), minus the
// skills that drive desktop apps. Plain JS with no JSX so server/mcp.js can import it.
//   id, name, command (slash command once wired), kind (image | video, for the icon), groups (skillGroups ids)
//   blurb (one line on cards), about (the page paragraph), steps (what the agent does, in order)
//   bring (what to prepare), prompt (the example to copy), output (what you get)
//   formats (format ids the skill chains), studio (a tool id from tools.js to do it by hand), cover, badge
//   bundle (skill ids a bundle picks from)
import { covers } from './formats/parts.js'

export const skillGroups = [
  { id: 'popular', name: 'Popular', glyph: 'spark' },
  { id: 'paid-ads', name: 'Paid ads', glyph: 'ad' },
  { id: 'motion', name: 'Motion design', glyph: 'layers' },
  { id: 'marketing', name: 'Marketing', glyph: 'megaphone' },
  { id: 'production', name: 'Production', glyph: 'film' },
  { id: 'ugc', name: 'UGC', glyph: 'person' },
  { id: 'faceless', name: 'Faceless', glyph: 'play' },
]

export const skills = [
  // UGC
  {
    id: 'ugc-review', name: 'Product review UGC', command: 'ugc-review', kind: 'video', groups: ['popular', 'ugc', 'marketing'], badge: 'Top',
    blurb: 'A creator reviews your product to camera, from angle to finished vertical video.',
    about: 'Give it your product and a creator. The agent picks the angle that sells it, writes a short script with a strong hook, films the creator talking to camera and cuts it with captions.',
    steps: ['Read the brief and pick 3 angles', 'Write a 20 second script for the best one', 'Film the creator with the product in hand', 'Cut to 9:16 and burn in captions'],
    bring: ['Product photos and one line on what it does', 'A creator photo or a saved character', 'Who the ad is for'],
    prompt: 'Make a product review UGC video for this insulated tumbler with the attached creator. Give me 3 hook ideas first, then make the best one as a 20 second 9:16 video with captions.',
    output: 'A 15 to 30 second 9:16 video with captions',
    formats: ['ugc-ad', 'talking-head'], studio: 'marketing', cover: covers.peach,
  },
  {
    id: 'ugc-demo', name: 'Product demo UGC', command: 'ugc-demo', kind: 'video', groups: ['ugc', 'marketing'],
    blurb: 'A creator shows how your product works, one clear step at a time.',
    about: 'For products that make more sense in use. The agent plans each step of the demo, films the creator doing it with close ups on the product, and narrates over the top.',
    steps: ['Turn your steps into a shot list', 'Film each step with a close up on the product', 'Record the creator explaining it', 'Cut it together with captions'],
    bring: ['Product photos', 'A presenter photo or a saved character', 'The steps to show, in order'],
    prompt: 'Make a product demo video for this pour-over coffee kettle with the attached presenter. Show filling, heating and pouring in 3 steps, each with a close up, in 9:16 with captions.',
    output: 'A 20 to 40 second 9:16 video with captions',
    formats: ['ugc-ad', 'human-video', 'macroshot-product'], studio: 'marketing', cover: covers.sun,
  },
  {
    id: 'ugc-unboxing', name: 'Unboxing UGC', command: 'ugc-unboxing', kind: 'video', groups: ['ugc', 'marketing'],
    blurb: 'A first-person unboxing with the reveal, the details and a first reaction.',
    about: 'The agent stages the box, the opening and the first look, then lingers on the details you care about and ends on an honest first reaction.',
    steps: ['Plan the reveal and 3 detail shots', 'Film the box opening from the creator’s point of view', 'Film the close ups', 'Add the creator’s reaction and captions'],
    bring: ['Product and packaging photos', 'The 3 features to show off', 'A creator photo, optional'],
    prompt: 'Make an unboxing video for these wireless earbuds. Start on the closed box, reveal the case, then show the fit, the charging light and the case click. 9:16, about 20 seconds.',
    output: 'A 15 to 30 second 9:16 video',
    formats: ['ugc-ad', 'macroshot-product', 'packshot'], studio: 'marketing', cover: covers.rose,
  },
  {
    id: 'ugc-try-on', name: 'Try-on UGC', command: 'ugc-try-on', kind: 'video', groups: ['ugc', 'marketing'],
    blurb: 'A creator tries on your piece and shows the fit, the fabric and how to style it.',
    about: 'The agent dresses the creator in your garment, films a mirror try-on with a turn and a fabric close up, and ends with one styling tip.',
    steps: ['Fit the garment on the creator', 'Film the try-on and a full turn', 'Add a close up of the fabric', 'Cut with a styling tip as the last line'],
    bring: ['Flat or on-model photos of the garment', 'A presenter photo or a saved character', 'Styling notes, optional'],
    prompt: 'Make a try-on video of this linen shirt on the attached creator. Mirror try-on, one full turn, a close up of the fabric, and end with how to style it for summer. 9:16.',
    output: 'A 15 to 30 second 9:16 video',
    formats: ['try-on', 'outfit-shot', 'ugc-ad'], studio: 'fashion-factory', cover: covers.lilac,
  },

  // Paid ads
  {
    id: 'ad-remake', name: 'Remake a winning ad', command: 'remake-ad', kind: 'video', groups: ['popular', 'paid-ads'],
    blurb: 'Keep the structure of an ad that works and rebuild it around your product.',
    about: 'Bring an ad you know performs. The agent breaks it into beats, keeps the timing and the sales logic, and makes a new, original ad for your product on the same frame.',
    steps: ['Break the reference into beats and timings', 'Map each beat to your product and offer', 'Make the new shots', 'Cut to the reference’s pacing'],
    bring: ['The reference ad as a video file', 'Your product photos', 'Your offer'],
    prompt: 'Here is an ad that works for a competitor. Keep its structure and pacing, but make an original version for my sparkling water brand using the attached product photos. Same length and aspect ratio.',
    output: 'A video ad at the reference’s length and shape',
    formats: ['recreate-ad', 'product-ad'], studio: 'ads', cover: covers.indigo,
  },
  {
    id: 'ad-resize', name: 'Resize ads', command: 'resize-ads', kind: 'image', groups: ['paid-ads'],
    blurb: 'One static ad, rebuilt for 1:1, 4:5 and 9:16 instead of cropped.',
    about: 'Cropping cuts off your headline. The agent extends the scene and moves the type so each placement gets a layout that fits it.',
    steps: ['Read the layout of the source ad', 'Extend the scene for each shape', 'Place the headline and logo for each one', 'Check nothing important is cut'],
    bring: ['One static ad', 'The placements you need'],
    prompt: 'Resize this static ad for Instagram feed (4:5), Stories (9:16) and a square post (1:1). Extend the background, do not crop the headline.',
    output: '3 static ads, one per placement',
    formats: ['expand', 'ad-variants'], studio: 'ads', cover: covers.sky,
  },
  {
    id: 'ad-research', name: 'Research to ads', command: 'research-to-ads', kind: 'image', groups: ['paid-ads', 'marketing'],
    blurb: 'Study your product and its rivals, find the open angles, make an ad for each.',
    about: 'The agent reads your product page and your competitors’ pages, lists the angles no one owns yet, and makes one static ad per angle so you can test them side by side.',
    steps: ['Read your page and 3 competitor pages', 'List the angles nobody owns', 'Write a headline per angle', 'Make one static ad per angle'],
    bring: ['Your product page link', 'Up to 3 competitor names or links', 'Who you sell to'],
    prompt: 'Read our product page and these 3 competitor pages. Find 4 angles they do not use, then make one static 4:5 ad per angle with our product photo.',
    output: '4 static ads, one per angle, with the reasoning',
    formats: ['link-to-ads', 'design-graphic'], studio: 'ads', cover: covers.dusk,
  },
  {
    id: 'ad-review', name: 'Campaign review', command: 'review-campaign', kind: 'image', groups: ['paid-ads'],
    blurb: 'Read your results, decide what to scale, pause and test, then make the tests.',
    about: 'Paste or attach your campaign export. The agent ranks the ads, says what to scale and what to pause, and makes new variants for the tests it suggests.',
    steps: ['Read the export and rank each ad', 'Say what to scale, pause and test', 'Make variants for each test', 'Sum it up in a short table'],
    bring: ['A campaign export (CSV) for 7 to 30 days', 'Your goal: sales, leads or installs'],
    prompt: 'Here are the last 14 days of our campaign. Tell me what to scale, what to pause and what to test next, then make 3 new variants for the best test.',
    output: 'A short plan and 3 new ad variants',
    formats: ['ad-variants'], studio: 'ads', cover: covers.slate,
  },
  {
    id: 'ad-reviews', name: 'Ads from customer reviews', command: 'reviews-to-ads', kind: 'image', groups: ['paid-ads', 'marketing'],
    blurb: 'Turn the words your customers use into headlines and static ads.',
    about: 'Customers say it better than copywriters. The agent pulls the phrases that come up again and again in your reviews and builds ads around them.',
    steps: ['Read the reviews and group what people say', 'Pick the 5 strongest phrases', 'Write a headline from each', 'Make a static ad per headline'],
    bring: ['Reviews as text, a file or a link', 'A product photo'],
    prompt: 'Read these 200 reviews of our running socks, find the 5 phrases people repeat most, and make a 4:5 static ad around each one with the attached product photo.',
    output: '5 static ads and the phrases behind them',
    formats: ['ad-variants', 'design-graphic'], studio: 'ads', cover: covers.mint,
  },
  {
    id: 'ad-headlines', name: 'Headline variants', command: 'headline-variants', kind: 'image', groups: ['paid-ads'],
    blurb: 'Same ad, new headline, for a clean A/B test.',
    about: 'Change one thing at a time. The agent keeps every pixel of your ad except the headline and writes variants that each try a different reason to buy.',
    steps: ['Read the ad and the offer', 'Write headlines that each try a different reason', 'Swap only the headline', 'Name each file by its idea'],
    bring: ['One static ad', 'How many variants you want'],
    prompt: 'Make 6 versions of this ad with only the headline changed. Try price, speed, quality, social proof, a question and a bold claim.',
    output: 'Up to 10 static ads that differ only in the headline',
    formats: ['ad-variants'], studio: 'ads', cover: covers.sun,
  },
  {
    id: 'ad-hooks', name: 'Hook variants', command: 'hook-variants', kind: 'video', groups: ['paid-ads', 'production'],
    blurb: 'New openings for a video ad, each cut onto the same body.',
    about: 'The first 3 seconds decide the rest. The agent scores your current hook, writes new ones, films them and joins each to your existing ad.',
    steps: ['Score the current opening', 'Write 5 new hooks', 'Film each hook', 'Join each one to the rest of the ad'],
    bring: ['One video ad', 'How many hooks you want'],
    prompt: 'Score the first 3 seconds of this ad, then make 5 new hooks and join each one to the rest of the video. Keep the same voice and captions.',
    output: 'Full edits of the ad, one per hook',
    formats: ['hook-check', 'product-ad'], studio: 'edit-video', cover: covers.night,
  },
  {
    id: 'ad-localize', name: 'Localize ads', command: 'localize-ads', kind: 'image', groups: ['paid-ads', 'marketing'],
    blurb: 'Translate the copy on your ads and keep the offer, tone and layout.',
    about: 'The agent translates the words on each ad, adapts idioms instead of copying them, and refits the layout where a language runs longer. Video ads get a dubbed voice with matched lips.',
    steps: ['Read the copy on each ad', 'Translate and adapt it per market', 'Refit the layout', 'Dub video ads with matched lips'],
    bring: ['Static or video ads', 'The languages you need'],
    prompt: 'Localize these 3 ads into Spanish, German and Japanese. Keep the offer and the tone, and fix the layout where the text runs longer.',
    output: 'Each ad in each language',
    formats: ['ad-variants', 'dub'], studio: 'translate', cover: covers.peach,
  },

  // Faceless
  {
    id: 'faceless-editorial', name: 'Editorial explainer', command: 'editorial-explainer', kind: 'video', groups: ['popular', 'faceless', 'motion'], badge: 'New',
    blurb: 'A researched explainer in a magazine style: cut-out photos, paper and bold type.',
    about: 'The agent researches your subject, writes a script that keeps people watching, and builds each scene from layered photos, paper textures and moving headlines, with a narrator.',
    steps: ['Research the subject and check the facts', 'Write the script, hook first', 'Build each scene as a layered collage', 'Add narration, music and captions'],
    bring: ['A subject', 'Sources or facts to use, optional'],
    prompt: 'Make a 2 minute editorial explainer on why container ships got so big. Magazine collage style, a calm narrator, captions on, 16:9.',
    output: 'A 1 to 5 minute narrated video',
    formats: ['explainer', 'motion-graphics', 'mm-magazine'], studio: 'explainer', cover: covers.slate,
  },
  {
    id: 'faceless-stick', name: 'Stick figure explainer', command: 'stick-explainer', kind: 'video', groups: ['popular', 'faceless'],
    blurb: 'A topic told with simple, funny stick figures and a narrator.',
    about: 'Simple drawings keep the focus on the idea. The agent splits your topic into beats, draws each one with stick figures, and times the drawings to the narration.',
    steps: ['Split the topic into short beats', 'Write a line for each beat', 'Draw each beat with stick figures', 'Time it to the narration'],
    bring: ['A topic', 'The key points, optional'],
    prompt: 'Make a 60 second stick figure explainer on how compound interest works. Funny but clear, one idea per scene, 9:16 with captions.',
    output: 'A 30 second to 3 minute narrated video',
    formats: ['faceless', 'explainer'], studio: 'faceless', cover: covers.sky,
  },
  {
    id: 'faceless-myth', name: 'Myths and fairy tales', command: 'myth-story', kind: 'video', groups: ['faceless'],
    blurb: 'A narrated folk tale or myth in a painted storybook look.',
    about: 'The agent retells the story in scenes, paints each one in a soft storybook style with the same characters throughout, and reads it in a warm voice.',
    steps: ['Retell the story in scenes', 'Design the characters once', 'Paint each scene with them', 'Narrate it with music'],
    bring: ['A myth, tale or your own story'],
    prompt: 'Tell the myth of Orpheus and Eurydice in 3 minutes. Painted storybook style, the same two characters in every scene, a warm narrator, 16:9.',
    output: 'A 1 to 5 minute narrated video',
    formats: ['story-video', 'faceless'], studio: 'faceless', cover: covers.lilac,
  },
  {
    id: 'faceless-diorama', name: 'Paper diorama story', command: 'paper-diorama', kind: 'video', groups: ['faceless'],
    blurb: 'Tiny layered paper sets, lit like a stage, for history and stories.',
    about: 'Each scene is a small paper set with depth between its layers. The camera drifts through them while the narrator tells the story.',
    steps: ['Pick the key events', 'Build a paper set for each', 'Move the camera through the layers', 'Narrate with music and captions'],
    bring: ['A topic or story', 'The key events, optional'],
    prompt: 'Make a 90 second paper diorama video on the first flight at Kitty Hawk. Layered paper sets, slow camera drifts, a documentary narrator, 16:9.',
    output: 'A 1 to 3 minute narrated video',
    formats: ['story-video', 'mm-paper'], studio: 'faceless', cover: covers.sun,
  },
  {
    id: 'faceless-flat', name: 'Flat pastel explainer', command: 'flat-explainer', kind: 'video', groups: ['faceless', 'motion'],
    blurb: 'Soft flat 2D art in pastel colors for calm, clear explainers.',
    about: 'Clean shapes and soft colors make dense topics easy to follow. The agent animates icons, simple charts and characters in flat 2D to match the script.',
    steps: ['Write the script in short beats', 'Pick icons and charts for each beat', 'Animate them in flat 2D', 'Add narration and captions'],
    bring: ['A topic', 'The main points'],
    prompt: 'Make a 90 second flat pastel explainer on how a heat pump works. Simple diagrams, soft colors, a calm narrator, 16:9 with captions.',
    output: 'A 1 to 3 minute narrated video',
    formats: ['explainer', 'motion-graphics'], studio: 'explainer', cover: covers.mint,
  },
  {
    id: 'faceless-sketch', name: 'Sketchbook story', command: 'sketchbook-story', kind: 'video', groups: ['faceless'],
    blurb: 'Pencil and ink drawings that build up on the page as the narrator talks.',
    about: 'The agent draws each scene in a sketchbook style, line by line, so the picture grows with the story.',
    steps: ['Write the story in scenes', 'Sketch each scene', 'Animate the lines drawing in', 'Narrate it'],
    bring: ['A topic or a short script'],
    prompt: 'Turn this short script about my grandmother’s bakery into a 2 minute sketchbook story. Pencil and ink, drawings that build up line by line, a gentle narrator.',
    output: 'A 1 to 3 minute narrated video',
    formats: ['story-video', 'mm-sketch'], studio: 'faceless', cover: covers.slate,
  },
  {
    id: 'faceless-mannequin', name: 'Mannequin story', command: 'mannequin-story', kind: 'video', groups: ['faceless'],
    blurb: 'Faceless mannequin figures act out a true story or a how-to.',
    about: 'Mannequins keep the story about the events, not the people. The agent poses them in each scene and films them like a documentary.',
    steps: ['Pick the key moments', 'Pose the mannequins for each', 'Film each scene', 'Narrate with captions'],
    bring: ['A topic', 'The key moments, optional'],
    prompt: 'Make a 2 minute mannequin story about the night the Titanic sank. Mannequin figures in period sets, documentary lighting, a low steady narrator.',
    output: 'A 1 to 3 minute narrated video',
    formats: ['story-video', 'faceless'], studio: 'faceless', cover: covers.night,
  },

  // Production and motion
  {
    id: 'edit-remix', name: 'Remix an edit', command: 'remix-edit', kind: 'video', groups: ['popular', 'production', 'motion'], badge: 'New',
    blurb: 'Keep the cuts, pacing and music of an edit, recast it with your own people and products.',
    about: 'Bring an edit you love. The agent maps every cut, keeps the timing and the beat, and swaps in your characters, products or outfits shot by shot.',
    steps: ['Map every cut and its length', 'Match each shot to one of your photos', 'Remake each shot with your cast', 'Cut to the original beat'],
    bring: ['The reference edit as a video file', 'Up to 5 photos of people, products or outfits'],
    prompt: 'Recreate this edit with the attached photos of me and my sneakers. Keep every cut on the beat, the same length and the same aspect ratio.',
    output: 'A video at the reference’s length and shape',
    formats: ['clone-edit', 'swap-element'], studio: 'edit-video', cover: covers.indigo,
  },
  {
    id: 'product-photoshoot', name: 'Product photoshoot', command: 'product-photoshoot', kind: 'image', groups: ['popular', 'marketing', 'production'],
    blurb: 'One product, a whole shoot: studio shots, lifestyle scenes, banners and carousels.',
    about: 'Say what you need and the agent picks the right kind of shot for it: clean studio, in use, a hand holding it, a wide banner, a carousel or a surreal hero image.',
    steps: ['Pick the shot types from your request', 'Plan a scene for each', 'Shoot each one with your product', 'Return them grouped by use'],
    bring: ['Product photos or a product page link', 'Where the images will go'],
    prompt: 'Do a photoshoot for this ceramic mug: 2 clean studio shots, 2 lifestyle shots on a kitchen counter, one wide website banner and a 5 slide Instagram carousel.',
    output: 'A set of images sized for each use',
    formats: ['product-shot', 'place-product', 'banner'], studio: 'marketing', cover: covers.peach,
  },
  {
    id: 'thumbnail-maker', name: 'Thumbnail maker', command: 'thumbnail', kind: 'image', groups: ['production', 'marketing'],
    blurb: 'Three thumbnail ideas for a video, with bold words and your face.',
    about: 'The agent reads your title, sketches 3 different ideas, and makes each one with large readable text and your face where it helps.',
    steps: ['Read the title and the topic', 'Sketch 3 different ideas', 'Make each one at 16:9', 'Check the text reads at small sizes'],
    bring: ['The video title', 'A photo of you, optional'],
    prompt: 'Make 3 thumbnail ideas for my video "I tried every budget espresso machine". Use the attached photo of me, big readable words, 16:9.',
    output: '3 thumbnails at 1280 by 720',
    formats: ['thumbnail'], studio: 'create-image', cover: covers.rose,
  },
  {
    id: 'brand-kit', name: 'Brand kit', command: 'brand-kit', kind: 'image', groups: ['marketing', 'motion'],
    blurb: 'Logo, colors, type and mockups from a short brief, saved for every format.',
    about: 'The agent asks a few questions, proposes 3 directions, and builds the one you pick into a logo, a palette, type choices and mockups you can reuse.',
    steps: ['Ask about the brand in 4 questions', 'Show 3 directions', 'Build the chosen one', 'Make mockups and save it as a brand'],
    bring: ['The brand name and what it does', 'Brands you like, optional'],
    prompt: 'Make a brand kit for "Low Tide", a small surf coffee shop. Show me 3 directions first, then build the one I pick into a logo, palette, type and 3 mockups.',
    output: 'A logo, a palette, type choices and mockups',
    formats: ['logo', 'brand-colors', 'design-graphic'], studio: 'create-image', cover: covers.mint,
  },
  {
    id: 'shorts-maker', name: 'Shorts from a long video', command: 'shorts-maker', kind: 'video', groups: ['production'],
    blurb: 'Find the best moments of a long video and cut them into captioned shorts.',
    about: 'The agent reads the transcript, picks the moments that stand on their own, and cuts each into a vertical short with a title and captions.',
    steps: ['Transcribe the video', 'Pick the moments that stand alone', 'Reframe each to 9:16', 'Add a title and captions'],
    bring: ['A long video or podcast episode', 'How many shorts you want'],
    prompt: 'Find the 5 best moments in this 40 minute podcast and cut each into a 30 to 60 second 9:16 short with captions and a title card.',
    output: 'Up to 10 vertical shorts',
    formats: ['clip-to-shorts', 'podcast-clips'], studio: 'shorts', cover: covers.dusk,
  },

  // Bundles
  {
    id: 'paid-ads-bundle', name: 'Paid ads bundle', command: 'paid-ads', kind: 'image', groups: ['paid-ads', 'marketing'],
    blurb: 'Describe the job and it picks the right paid ads skill for it.',
    about: 'Not sure which skill you need? Give the bundle your brief and your assets. It picks from the 8 paid ads skills and runs the one that fits.',
    steps: ['Read the brief and the assets', 'Pick the paid ads skill that fits', 'Run it', 'Suggest the next one to try'],
    bring: ['Your product, audience and goal', 'Any ads or results you already have'],
    prompt: 'I sell refillable deodorant to people who care about plastic waste. Here are our 3 best ads and last month’s results. Pick the skill that helps most and run it.',
    output: 'Whatever the chosen skill returns',
    bundle: ['ad-remake', 'ad-resize', 'ad-research', 'ad-review', 'ad-reviews', 'ad-headlines', 'ad-hooks', 'ad-localize'],
    formats: [], studio: 'ads', cover: covers.indigo,
  },
]

export const skillById = (id) => skills.find((s) => s.id === id)
export const groupById = (id) => skillGroups.find((g) => g.id === id)
export const skillsIn = (group) => skills.filter((s) => s.groups.includes(group))
export const bundles = skills.filter((s) => s.bundle)

export const matchesSkill = (s, q) => !q || `${s.name} ${s.blurb} ${s.command} ${s.groups.map((g) => groupById(g)?.name).join(' ')}`
  .toLowerCase().includes(q)

// Skills that share the most groups with this one, for "More skills like this".
export function relatedSkills(skill, n = 3) {
  const shared = (s) => s.groups.filter((g) => skill.groups.includes(g) && g !== 'popular').length
  return skills.filter((s) => s.id !== skill.id && shared(s))
    .sort((a, b) => shared(b) - shared(a))
    .slice(0, n)
}

// How to add the ComfyField MCP server to each agent. Commands follow the README's "Use from your agent".
const server = { command: 'npx', args: ['comfyfield', 'mcp'], env: { COMFYFIELD_HOME: '/path/to/your/comfyfield' } }
const json = JSON.stringify({ mcpServers: { comfyfield: server } }, null, 2)

export const agents = [
  { id: 'claude-code', name: 'Claude Code', where: 'Run this in your ComfyField folder.', code: 'claude mcp add comfyfield -- npx comfyfield mcp' },
  {
    id: 'codex', name: 'Codex', where: 'Add this to ~/.codex/config.toml.',
    code: '[mcp_servers.comfyfield]\ncommand = "npx"\nargs = ["comfyfield", "mcp"]\nenv = { COMFYFIELD_HOME = "/path/to/your/comfyfield" }',
  },
  { id: 'cursor', name: 'Cursor', where: 'Add this to ~/.cursor/mcp.json.', code: json },
  { id: 'claude-desktop', name: 'Claude Desktop', where: 'In Settings, Developer, open Edit config and add this to claude_desktop_config.json.', code: json },
  { id: 'other', name: 'Other', where: 'ChatGPT desktop and any MCP client that starts a local server take the same command.', code: 'npx comfyfield mcp' },
  {
    id: 'cli', name: 'CLI', where: 'Agents that run shell commands can call the CLI directly. Skill files for the CLI are not wired yet.',
    code: 'npx comfyfield balance\nnpx comfyfield models --kind video',
  },
]

// Answered by the read-only balance tool, so checking the connection spends nothing.
export const checkPrompt = 'What is my balance on each ComfyField provider?'
