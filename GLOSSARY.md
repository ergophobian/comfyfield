# ComfyField

An open-source, local-first creative studio that makes images, video and audio from any model with the user's own keys.

## Running generations

**Generation engine**:
The part of ComfyField that takes one run (a model and its inputs) and returns media files. The app, the CLI and the MCP server share it.
_Avoid_: engine (alone), runner, executor

**Backend**:
The place where a run executes: Comfy Cloud, a Pod, Comfy Router, fal, Google or ElevenLabs. Users never run ComfyUI on their own GPU.
_Avoid_: provider (for the execution place), target, host

**Pod**:
One RunPod GPU machine, started with the user's own RunPod key, that runs ComfyUI for ComfyField.
_Avoid_: GPU, instance, worker

**Pause**:
Turn a Pod's GPU off but keep its disk and downloaded models, so it can resume. The disk still costs money while paused.
_Avoid_: stop, suspend

**Terminate**:
Delete a Pod and its disk. All charges for it end. Every automatic guard terminates; only the user pauses.
_Avoid_: stop, kill, end

**Pod runtime**:
Software a Pod installs for nodes that need more than model files: a node pack, or FreeVideo, which runs MiniMax H3 in its own Python env. Comfy Cloud has no FreeVideo, so a run that needs it goes to a Pod.
_Avoid_: engine, add-on, plugin

**Node pack**:
A set of ComfyUI custom nodes from one repository, pinned by commit, that a Pod installs when a graph uses one of its nodes. Comfy Cloud preinstalls many packs; a graph that needs a pack Cloud lacks runs on a Pod.
_Avoid_: custom node (for the whole set), extension, plugin

**Pack file**:
A model file a node pack reads from its own folder under `ComfyUI/models` instead of through a loader, such as Chatterbox's weights. It is pinned by sha256 like any model file, downloads with its pack, and keeps its subfolder (`chatterbox/chatterbox_vc/s3gen.pt`). On a Pod the pack's folder is a link to the volume.
_Avoid_: pack model, bundled weights

**Service**:
Something a user generates with, as the Pods page groups it: a model in the picker, or the formats that run on the same model. A Pod gets ready for a service by downloading its files and installing its packs.
_Avoid_: tool (that is a page), provider

**Daily cap**:
The most the user lets Pods spend in one day. When today's spend reaches it, no new Pod starts; a running Pod is not touched.
_Avoid_: budget, limit (alone)

**Generation type**:
How the user's ComfyUI runs execute: Instant or Session, picked in the top bar.
_Avoid_: mode, backend (for the user's choice)

**Instant**:
The generation type that sends ComfyUI runs to Comfy Cloud at once. It runs only the models and LoRAs Cloud has installed. It never starts a Pod: a run Cloud cannot take fails until the user switches to Session.
_Avoid_: cloud mode

**Session**:
The generation type that sends ComfyUI runs to the user's Pod. A Session starts when the user approves a Session tier.
_Avoid_: pod mode, long session

**Session tier**:
Budget, Balanced or Performance: the rule that picks a Session's GPU from its estimated cost and time per job.
_Avoid_: size (that is GPU memory), plan

**Upscale**:
A second run that raises a finished clip's resolution with SeedVR2. In Create video it follows every take while its switch is on, and the take stays in the Library beside the upscaled copy.
_Avoid_: enhance (that is a format category), super resolution

**Source resolution**:
The resolution the video model makes before Upscale, named by its short side (720p is 1280 × 720 at 16:9). Auto picks the largest one under the target.
_Avoid_: input size, base resolution

**Target resolution**:
The resolution Upscale delivers: 1080p, 1440p or 4K. Auto picks 1080p, or 4K when the source is already 1080p.
_Avoid_: output size, final resolution

## Formats

**Format**:
A saved generation setup with a few typed inputs, such as Relight or Turn to sand. It compiles to a small flow. Every format belongs to one job.
_Avoid_: recipe, preset (for the whole set), template

**Job**:
What a person comes to make, from a fixed list: UGC, Ads from your link, AI influencer, Cinematic, Effects, Edit, Photo, Audio, 3D. Galleries show jobs first, then the formats for the picked job.
_Avoid_: category (a finer grouping inside a job), use case

## Flows

**Flows engine**:
The rules that decide which Flow nodes run and when: Approve gates, Send, Run and Regenerate all. Its nodes call the Generation engine for media.
_Avoid_: engine (alone), workflow engine

## Agents

**Skill**:
A named, multi-step job that an outside agent (Claude Code, Codex, Cursor) runs on ComfyField through the MCP server, such as a product review video from a brief. A skill chains formats; a format is one generation step.
_Avoid_: preset, recipe, workflow
