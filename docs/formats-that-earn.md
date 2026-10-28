# Formats that earn

People rarely make short videos for fun. They make them to grow a channel or sell something. Formats that earn
are short-form structures that already work on TikTok, Reels and Shorts, packaged so anyone can use them:
add your product, topic or character, pick a format, and get posts.

They sit first on Explore and first on Apps (`/apps?hub=earn`), split into five families. The data lives in
`src/lib/formats/earn.js`.

## How a format runs

You type one line. A writer step turns it into the format's beats: the format's own instructions are the
prompt on top of your prompt. You review and edit that plan before anything is generated.

Then each video format makes a cheap still first (Flux 2 Pro on Comfy Router) and waits at an approval gate.
Only when you approve the frame does the paid clip render (Seedance 2.5 on Comfy Router, with sound). Series
formats do this per beat, keep later frames matched to the first, and join the clips in order. Carousels make
images only, so they have no gate.

Every format is vertical (9:16). Every output is saved to the Library.

## The families

### Product ads

| Format | Shape | What it does |
| --- | --- | --- |
| Chaotic product story | 3 beats, joined | Real people play an absurd setup straight; it escalates; the product resolves it and the ending calls back to the opening. Pick an interruption, a glow-up comeback, an unlikely mentor or an awkward pitch. |
| Problem mascot | 1 clip | The problem is a cute, annoying creature. The product arrives and sends it packing. |
| Before and after reveal | 1 clip | A specific before, the product in use, and an honest after from the same angle. Split screen, hand wipe or day by day. |
| Ingredient parade | 1 clip | Each ingredient or part is a character that marches in, says its name and jumps into the product. |
| Unboxing hook | 1 clip | A tactile close-up unboxing that makes the viewer wait for the reveal. |
| Price knockout | 1 clip | The pricey generic alternative and your product in a boxing ring. The underdog wins on the real reason it is better. |
| Rated carousel | 5 slides | "I rated 4 ways to..." Fair ratings for the usual fixes, your product last and highest. |

### Faceless series

| Format | Shape | What it does |
| --- | --- | --- |
| What if | 3 beats, joined | A loss-aversion question that escalates over time, ending on what to do instead. |
| Countdown list | 6 slides | A saveable countdown from 5 to 1 on one topic. |
| Science narrator | 1 clip | One question, one visual metaphor the camera follows, one takeaway. |
| Timeline transformation | 1 clip | Day 1 to day 100 of one subject from a locked camera. |
| Big question | 1 clip | A question nobody thinks about, three reveals that make it bigger, a quiet ending. |

### Drama shorts

| Format | Shape | What it does |
| --- | --- | --- |
| Object drama | 4 beats, joined | Fruit, food or objects in a soap opera: a visible violation, a public reaction, a turn, and a late payoff where the product is the answer. |
| Challenge vlog | 3 beats, joined | A classic challenge vlog with one host and one impossible detail per beat, played straight. |
| Hero and villains | 3 beats, joined | The problems are villains with personality; the product is the hero who says its name and wins. |

### AI influencer

| Format | Shape | What it does |
| --- | --- | --- |
| Influencer character sheet | 1 image | A fictional adult on white: front, three-quarter, back and face. Save it to Assets as a character. |
| Put them in a trend | picture, gate, clip | A clean full-body picture of your character to approve, then Seedance 2.5 replaces the person in a trend clip with them, using the clip as a reference video. |
| Influencer from scratch | picture, gate, clip | Describe a character, approve them on white, and put them straight into a trend clip. |
| Influencer product post | 1 clip | Your character films a casual selfie video with your product. |

Use footage you own or have permission to use. The swap formats ask you to confirm that before they run.
Trend clips go to Seedance 2.5 as a reference video. Keep them short; the length you pick sets the output length.

### 3D explainers

| Format | Shape | What it does |
| --- | --- | --- |
| Body part explainer | 1 clip | A cute 3D body part speaks in first person about a general wellness topic. Entertainment, not medical advice. |
| Object explainer | 1 clip | The object (or your product) explains what people get wrong about it. |
| Tiny worker | 3 beats, joined | A tiny rounded worker does its job inside a machine, a product or a place. |

## Rules every writer follows

Writers use only the facts you give. They never invent prices, discounts, results, reviews, testimonials,
certifications or health claims, never mention doses, and never name real people or other brands. Spoken
lines are short and casual. If a claim matters, put it in your one line yourself.

## Add your own

Formats are plain data, so you, or an agent working in this repo, can add one in a few lines. Use the
helpers in `src/lib/formats/earn.js`:

```js
clip({
  id: 'earn-my-format', name: 'My format', group: 'Product ads',
  blurb: 'One line for the card.',
  job: 'What the user gets',
  inputs: [idea('What you sell', 'A placeholder example'), product],
  writer: 'The format\'s beats, in plain words: what shot 1 shows, how it escalates, where the product lands.',
  cover: covers.sun,
})
```

- `clip` makes a plan, an opening frame, an approval and one clip. `series({ beats })` makes a frame,
  an approval and a clip per beat, then joins them. `carousel({ count })` makes slides.
- The writer's plan uses `Look:` for the shared cast and style, then `Shot 1:`, `Beat 1:` or `Slide 1:`.
  A step with `beat: n` receives the look plus its own part; `wrap` puts fixed text around it.
- A choice with `toWriter: true` tells the writer which option the user picked.
- Put a style reference before the product photo: a later frame takes the first picture slot, so the
  product stays with every frame and clip.

Then run `node scripts/format-check.mjs` and `node scripts/format-runner-checks.mjs`. A format that does not
validate stays hidden, with the reason printed. You can also share a single format as a file or gist from its
page, and import one on Apps.
