# ComfyField

An open-source, local-first creative studio that makes images, video and audio from any model with the user's own keys.

## Running generations

**Generation engine**:
The part of ComfyField that takes one run (a model and its inputs) and returns media files. The app, the CLI and the MCP server share it.
_Avoid_: engine (alone), runner, executor

**Backend**:
The place where a run executes: Local ComfyUI, Comfy Cloud, a Pod, Comfy Router, fal, Google or ElevenLabs.
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

**Daily cap**:
The most the user lets Pods spend in one day. When today's spend reaches it, no new Pod starts; a running Pod is not touched.
_Avoid_: budget, limit (alone)

## Flows

**Flows engine**:
The rules that decide which Flow nodes run and when: Approve gates, Send, Run and Regenerate all. Its nodes call the Generation engine for media.
_Avoid_: engine (alone), workflow engine
