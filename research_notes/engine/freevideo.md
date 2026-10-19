# FreeVideo on the ComfyField Pod

Research date: 2026-10-18. Subject: https://github.com/FlashML-org/FreeVideo.

Every claim has a tag:

- [Verified: source] — read in a primary source today. Paths like `freevideo_engine/x.py` are in the FreeVideo repo at HEAD `fcd24fb`. PatchWork paths are in the local clone `patchwork-src` (HEAD `9a90879`, 2026-10-16). ComfyField paths are in this worktree.
- [Inference] — my conclusion from verified facts. Not tested on a GPU.

Nothing in this file was run on a GPU. No weights were downloaded. No installer was run.

Files in this folder:

- `freevideo.md` — this report
- `public/workflows/h3_freevideo_t2v.json` — API-format text-to-video graph (written here as `freevideo_t2v.json`)
- `public/workflows/h3_freevideo_i2v.json` — API-format image-to-video graph, start frame (written here as `freevideo_i2v.json`)
- `freevideo_t2v_lora.json` — text-to-video with one `FreeVideoLoRA`
- `freevideo_weights.json` — all 700 files that setup fetches, with repo, revision, size, sha256 and gated flag

---

## Blockers for ComfyField's Pod (short list)

1. **ComfyUI starts with `--disable-all-custom-nodes`** (`server/podBoot.js` line 119). FreeVideo is a custom node, so its nodes never load. Fix: add `--whitelist-custom-nodes FreeVideo`. The clone folder must be named `FreeVideo`. [Verified: ComfyUI v0.41.1 `nodes.py` lines 2381-2383 and `comfy/cli_args.py` line 217]
2. **The idle watchdog kills a Pod that installs.** `pod-statusd.py` `next_idle` counts idle time when GPU use is 0, the queue is 0 and no statusd download runs. FreeVideo's setup downloads and compiles with the GPU idle, so the Pod ends after `IDLE_AFTER` (13 min). The 900 s `BOOT_DEADLINE` also cannot hold the install. Fix: run setup in the background after "ready", and count it as busy. [Verified: `server/pod-statusd.py` lines 66-70, `server/podBoot.js` lines 26-36] [Inference: the install takes longer than 13 min]
3. **ComfyField sends a FreeVideo graph to Comfy Cloud.** `modelFilesOf` finds no loader nodes in the graph, so `notOnCloud` is empty and `comfyTarget` returns `cloud`. Comfy Cloud has no FreeVideo nodes. Fix: make graphs with `FreeVideo*` class types Pod-only. [Verified: `shared/modelFiles.js` lines 79-97, `server/core.js` lines 593-603; Comfy Cloud list in section 6]
4. **Disk.** A first install needs about 89 GiB free on the `--root` disk: 49.10 GiB of weights plus a 40 GiB preflight margin. `volumeFor` does not count any of it. [Verified: `freevideo_engine/bootstrap.py` lines 682 and 253-268; byte totals from the HF API]
5. **Nobody has run it on this stack.** FreeVideo tests its own ComfyUI pin `421a1c24` (2026-09-08). v0.41.1 is 241 commits newer. PatchWork never ran FreeVideo on a GPU. A static check found every ComfyUI API that FreeVideo calls in v0.41.1 (section 4). [Verified: `freevideo_engine/dependencies.json`; GitHub compare API; PatchWork `CHANGELOG.md` line 80]

Not blockers: VRAM (all three GPUs pass its 8 GB floor), Blackwell sm_120 (FreeVideo's own Linux test card is an RTX PRO 6000), Hugging Face access (every repo is public, no token), output parsing (the same as core `SaveVideo`).

Not technical, but flag it: the weights use the MiniMax H3 Community License, which excludes the USA, the EU, the UK and South Korea. Stock H3 (`Comfy-Org/MiniMax-H3`) has the same license, so this is not new for ComfyField. Per project memory, license review comes after submission.

---

## 1. What FreeVideo is

### Purpose and design

- FreeVideo is a local inference engine for MiniMax H3. It runs OpenVDN's 8-step VDN-H3 model with Video DeltaNet hybrid attention. It claims as little as 8 GB of VRAM and 16 GB of RAM. [Verified: `README.md`]
- It runs as a ComfyUI plugin. One ComfyUI node (`FreeVideoGenerate`) starts FreeVideo's own engine process in FreeVideo's own Python env. The node passes the request to `freevideo_engine.managed generate`. [Verified: `freevideo_engine/comfy_bridge.py` lines 1177-1300]
- The text encoder runs in a separate process. That process ends before the transformer loads. [Verified: `docs/execution-planning.md`]
- VDN-H3 is a different model from stock H3. It is H3 distilled to 8 steps (DMD, `stage-dmd-step-250`), with a linear-attention branch. It is not another precision of stock H3. [Verified: `freevideo_engine/model_files.json`; PatchWork `js/nodes/nodes.js` lines 2364-2380; t8star README "OpenVDN DMD8 ... 8 Euler/native-flow steps"]

### Repo state

| Fact | Value | Source |
|---|---|---|
| Repo created | 2026-09-13 | [Verified: GitHub API] |
| Stars / forks / open issues | 2,089 / 229 / 175 | [Verified: GitHub API] |
| HEAD | `fcd24fb730e7094565d13b663e92c264ed4d470c`, 2026-10-18T07:30:14Z, "Merge pull request #330 from FlashML-org/release/0.4.14-public" | [Verified: GitHub API, clone] |
| HEAD tag | `v0.4.14` (the tag points at the same commit) | [Verified: `git rev-list -n1 v0.4.14`] |
| PatchWork pin | `7e506f4b1d46806a722adf08861009b4eb46f08e`, 2026-10-12T14:35:30Z, `git describe` = `v0.3.25-4-g7e506f4` | [Verified: clone] |
| Pin to HEAD | 473 commits, 478 files, +81,026 / -3,094 lines | [Verified: GitHub compare API, `git diff --stat`] |
| Release pace | 15 tags from v0.4.0 to v0.4.14 in 6 days | [Verified: `git tag`] |

[Inference] The repo changes many times each day. Pin a commit. Do not track `main`.

### What changed since `7e506f4` that matters

1. **The quality levels changed.** At the pin, Medium was one pass of 12 steps, and High and Max had no step cache. At HEAD the levels are as follows. [Verified: `freevideo_engine/tiers.py` at HEAD; `git show 7e506f4:web/sampling_effort.js`; commits `f2c25e6`, `8f3af7e`, `1a814ba`]
   - Light: two passes, 8 + 3 steps, 2x upscale
   - Medium: two passes, 8 + 3 steps, 1.5x upscale (a larger first pass)
   - High: one pass of 16 steps, with `step_cache` `easycache-av`
   - Max: one pass of 20 steps, with `step_cache` `easycache-av`

   PatchWork's `FREEVIDEO_QUALITY` is out of date for HEAD.
2. **Two passes run only with 8 first-pass steps.** Any other step count runs one pass. [Verified: `freevideo_engine/two_pass.py` lines 25-35, commit `e8f6afe`]
3. **New optional inputs on `FreeVideoGenerate`:** `continue_from`, `frames`, `first_frame_reference`, `voice_reference`, `hide_tail`, `step_cache`, `upscale_factor`. All are optional, so the PatchWork graph shape still validates. A new `/prompt` hook rewrites a `frames` value that is not a frame count. [Verified: `git diff 7e506f4 HEAD -- freevideo_engine/comfy_nodes.py`]
4. **LoRA strength range** went from -4..4 to -100..100. There is now a LoRA compatibility pre-check. [Verified: `git show 7e506f4:freevideo_engine/comfy_nodes.py` line 293; HEAD `comfy_nodes.py` line 474; commits `172421a`, `f26eb4d`]
5. **Memory release:** video models are now released after each generation, unless the next part is queued. [Verified: commit `a96d115`; `comfy_nodes.py` lines 352-375]
6. **Background kernel compile** now starts about 5 s after ComfyUI opens. It still turns off with `FREEVIDEO_BACKGROUND_COMPILE=off`. [Verified: commit `fbe6aa5`; `comfy_nodes.py` lines 542-548]
7. **Long videos:** chained segments and `continue_from`. [Verified: `comfy_nodes.py`; `release_notes.json`]
8. **The weight list did not change.** `model_files.json` only added `download_sha256` to small files. `prepared_models.json` has no diff. `dependencies.json` changed only ModelScope mirror revisions. The download is still 52.72 GB. [Verified: `git diff --stat 7e506f4 HEAD`, `git diff` of `model_files.json` and `dependencies.json`]
9. **Linux bootstrap:** a slow-network retry round was added. [Verified: `git diff 7e506f4 HEAD -- scripts/bootstrap_linux.sh`]
10. **Every setup flag that PatchWork uses still exists at HEAD.** [Verified: `freevideo_engine/bootstrap.py` lines 2221-2276; `scripts/bootstrap_linux.sh` `freevideo_bootstrap_linux`]
11. New optional parts that ComfyField does not need: an image model (`--image-model`, about 16 GiB, off by default), a prompt-enhancement VLM (`Qwen/Qwen3-VL-4B-Instruct`, not downloaded by setup), an agent API and an editor. [Verified: `bootstrap.py` lines 2199-2216; `prompt_vlm/model.json`; `prompt_vlm/service.py` lines 94-100]

### Licenses

| Part | License | Source |
|---|---|---|
| FreeVideo code | Apache-2.0 | [Verified: `LICENSE`, `pyproject.toml`, GitHub API] |
| OpenVDN VDN code (`OpenVDN/vdn-minimax-h3` on GitHub, pinned commit `30b6b380`) | Apache-2.0 | [Verified: GitHub API; `dependencies.json`] |
| SageAttention (`thu-ml/SageAttention`, commit `d1a57a5`) | Apache-2.0 | [Verified: GitHub API] |
| VDN-H3 weights (`OpenVDN/vdn-minimax-h3`, `OpenVDN/vdn-minimax-h3-edge`) | MiniMax H3 Community License Agreement (HF `license: other`, `minimax-h3-community-license-agreement`) | [Verified: HF API cardData; `NOTICE`] |
| Text encoder (`t8star/Vdn-Minimax-H3-Comfy`) | MiniMax H3 Community License (card `license_name: minimax-h3-community-license`) | [Verified: HF API cardData] |
| Latent upscaler (`LBH-123-AI/Minimax_h3_latent_Upscaler`) | HF says `apache-2.0`. FreeVideo's `dependencies.json` says `MIT`. The two sources do not agree. | [Verified: HF API; `dependencies.json`] |

Terms of the MiniMax H3 Community License (the file at the pinned revision, sha256 `59b99642...0f44`, 17,604 bytes). [Verified: fetched `LICENSE` from `OpenVDN/vdn-minimax-h3` at `751739ee`]

- The Applicable Territory is worldwide except the "Excluded Territories": the European Union, the United Kingdom, the Republic of Korea and the United States of America (definitions 3 and 5).
- Use outside the Applicable Territory is not authorized (section V.4, and Acceptable Use item 1).
- Products with more than USD 20 million yearly revenue need written authorization from MiniMax (IV.1).
- A commercial product must show "MiniMax H3" prominently in its UI (IV.2).
- A hosted service must keep safeguards and a report mechanism for misuse (V.5).

**What `--accept-model-license` accepts.** `--yes` needs `--accept-model-license`, or setup stops with "Unattended installation requires --yes --accept-model-license." The flag accepts the plan's three license links. [Verified: `bootstrap.py` lines 791-793, 884-886, 984-986]

1. `https://huggingface.co/OpenVDN/vdn-minimax-h3/blob/751739ee5b9e3ac802dca5d5111075fdaeb47885/LICENSE` (the MiniMax H3 Community License)
2. `https://huggingface.co/t8star/Vdn-Minimax-H3-Comfy` (the text encoder)
3. `https://docs.nvidia.com/cuda/eula/index.html` (NVIDIA CUDA EULA, because setup downloads CUDA 13.0 redistributables)

---

## 2. Unattended install on a Pod

### Commands

PatchWork's boot step, in full. [Verified: PatchWork `js/runpod-bootscript.js` lines 1201-1212]

```bash
cd "$BASE/ComfyUI/custom_nodes"
pin_repo https://github.com/FlashML-org/FreeVideo.git FreeVideo ${fvCommit} || die "freevideo-clone: could not fetch FreeVideo"
FVH="$BASE/freevideo"; mkdir -p "$FVH"
( [ -n "${HF_TOKEN:+x}" ] || unset HF_TOKEN; cd FreeVideo && env -u VIRTUAL_ENV -u PYTHONHOME ./setup.sh \
    --root "$FVH" --yes --accept-model-license --no-launch --plain --network official \
    --prepared-format fp8 --environment unified --install-system-deps </dev/null ) \
  && [ -f "$FVH/machine.json" ] || die "freevideo-setup: FreeVideo's installer failed - its output is in the boot log"
```

Where `pin_repo` is:

```bash
pin_repo() {  # url dir sha
  [ -d "$2/.git" ] && [ "$(git -C "$2" rev-parse HEAD 2>/dev/null)" = "$3" ] && return 0
  [ -d "$2/.git" ] || git clone --filter=blob:none --no-checkout "$1" "$2" || return 1
  ( cd "$2" && git fetch --depth 1 origin "$3" && git checkout -q --force "$3" ) || return 1
}
```

[Verified: PatchWork `js/runpod-bootscript.js` lines 939-947]

Proposed version for ComfyField. [Inference: adapted from the two blocks above to `server/podBoot.js` paths]

```bash
C=/root/h3/ComfyUI
FVH=/workspace/freevideo          # on the volume, so a later Pod reuses weights, env and the Sage wheel
FV_COMMIT=fcd24fb730e7094565d13b663e92c264ed4d470c   # v0.4.14
cd "$C/custom_nodes" && pin_repo https://github.com/FlashML-org/FreeVideo.git FreeVideo $FV_COMMIT
mkdir -p "$FVH"
( unset HF_TOKEN; cd "$C/custom_nodes/FreeVideo" && env -u VIRTUAL_ENV -u PYTHONHOME ./setup.sh \
    --root "$FVH" --yes --accept-model-license --no-launch --plain --network official \
    --prepared-format fp8 --environment unified --install-system-deps </dev/null ) >> "$CF/freevideo.log" 2>&1 \
  && [ -f "$FVH/machine.json" ] && touch "$CF/.freevideo-ready"
```

ComfyUI launch line for ComfyField. [Inference: PatchWork's launch variables (`js/runpod-bootscript.js` lines 1895-1901) added to `server/podBoot.js` line 119]

```bash
FREEVIDEO_HOME=/workspace/freevideo FREEVIDEO_BACKGROUND_COMPILE=off CUDA_VISIBLE_DEVICES="${CUDA_VISIBLE_DEVICES:-0}" \
  "$V" main.py --listen 127.0.0.1 --port 8188 --disable-auto-launch \
  --disable-all-custom-nodes --whitelist-custom-nodes FreeVideo \
  --extra-model-paths-config "$CF/extra_model_paths.yaml"
```

### Why each flag

| Flag | Effect | Source |
|---|---|---|
| `--root PATH` | The engine and model install folder. It must be the same path as `FREEVIDEO_HOME` at run time, or the node refuses: "The FreeVideo installation was moved." | [Verified: `bootstrap_linux.sh`; `comfy_bridge.py` lines 819-856] |
| `--yes --accept-model-license` | The only non-interactive path. Without a TTY, setup stops with "No interactive input." | [Verified: `bootstrap.py` lines 984-989] |
| `--no-launch` | "Linux: finish after the engine instead of installing ComfyUI and opening FreeVideo." | [Verified: `bootstrap.py` line 2274; `comfy_service.py` lines 897-906] |
| `--plain` | Log lines instead of a live terminal UI. | [Verified: `bootstrap.py` line 2268] |
| `--network official` | Upstream sources only: huggingface.co, github.com, pypi.org, download.pytorch.org, developer.download.nvidia.com. No CN mirrors, no ModelScope. | [Verified: `network.py` lines 30-43, 130-140; `bootstrap_linux.sh` `fv_download_uv`] |
| `--prepared-format fp8` | The prepared FP8 model. On SM120 this picks the `per_tensor` variant. `auto` also picks FP8 on RTX PRO cards (int8 is only for GeForce Ada/Blackwell and Ampere). | [Verified: `prepared_model.py` lines 45-77; `bootstrap.py` lines 403-421] |
| `--environment unified` | One shared Python env for the engine and the encoder (the default for new installs). | [Verified: `bootstrap.py` lines 2223-2224; `environments.py` line 7] |
| `--install-system-deps` | Lets the bash bootstrap run `apt-get` for missing tools without a prompt. The bash script reads it; Python never sees it. | [Verified: `bootstrap_linux.sh` `fv_system_deps`, `freevideo_bootstrap_linux`] |
| `</dev/null` | No prompt can block. | [Verified: PatchWork comment, `js/runpod-bootscript.js` lines 159-161] |

### What `setup.sh` does

1. `setup.sh` sources `scripts/bootstrap_linux.sh`. That script checks for x86_64 Linux with glibc. It then checks for `git curl g++ make tar gzip sha256sum flock` and installs missing ones with `apt-get` (with `--install-system-deps`). [Verified: `bootstrap_linux.sh`]
2. It finds a Python 3.9+ to run the installer. The order is FreeVideo's own envs, its private bootstrap Python, then `python3`. If none is found, it downloads `uv` 0.9.0 (sha256-pinned) and installs CPython 3.12.3 from python-build-standalone into `<root>/.freevideo/bootstrap`. [Verified: `bootstrap_linux.sh` `fv_find_python`, `fv_install_python`]
3. It runs `python -m freevideo_engine.bootstrap` (stdlib only at import). [Verified: `setup.sh`; `bootstrap.py` lines 1-39]
4. It checks the GPU with `nvidia-smi`. It refuses compute capability below 8.0 and a driver below 580. [Verified: `hardware.py` `cuda_compatibility`; `bootstrap.py` lines 513-514]
5. It builds its **own Python env**: Python 3.12.3 at `<root>/envs/unified`, built with uv, with `torch==2.13.0+cu130`, `torchvision 0.28.0`, `torchaudio 2.11.0`, `triton 3.7.1`, `transformers 5.15.0` and more (`constraints/unified.txt`). ComfyUI's venv (torch 2.9.1+cu130) is not changed. [Verified: `environments.py` lines 7-9; `constraints/unified.txt`; `dependencies.json` `tested`]
6. It clones pinned sources: OpenVDN `vdn-minimax-h3` at `30b6b380`, `huggingface/diffusers` at `3a2f35d4` plus VDN's patches, a sparse ComfyUI at `421a1c24` (only for the native H3 text encoder), and SageAttention at `d1a57a5`. [Verified: `dependencies.json`; `bootstrap.py` plan `steps` lines 783-789]
7. It **compiles SageAttention 2.2.0 for the detected GPU only**. It downloads NVIDIA's CUDA 13.0 redistributables (nvcc 13.0.88, cudart, cccl, crt, libnvvm, all sha256-pinned) and builds with `TORCH_CUDA_ARCH_LIST=12.0` on SM120. The build runs `pip wheel --no-build-isolation`, with jobs limited by RAM (4 GiB per compiler). The wheel is cached under `<root>/wheels` by architecture and ABI. If `g++` or `make` is missing, it skips Sage and uses cuDNN or torch flash attention. [Verified: `bootstrap.py` lines 1690-1750, 1913-1935; `bootstrap_versions.json` `cuda_toolkits.13.0`; `install_tuning.py` lines 11-17]
8. It downloads and verifies the weights (next section). On a re-run, `--verify auto` reuses unchanged receipts. [Verified: `bootstrap.py` line 2253]
9. It runs small attention and linear kernel probes on the GPU ("roughly a minute on a consumer GPU"). It writes `kernel-capabilities.json`. [Verified: `bootstrap.py` lines 1958-1975]
10. It writes `<root>/machine.json` **last**, with `ready: true`, the GPU UUID, the paths and the prepared format. [Verified: `bootstrap.py` lines 1937-1956]

### Network hosts that setup reaches with `--network official`

github.com (uv, python-build-standalone, OpenVDN, diffusers, ComfyUI, SageAttention), pypi.org, download.pytorch.org (cu130 wheels), developer.download.nvidia.com (CUDA redist), huggingface.co (weights), and conda.anaconda.org (only when Git or GCC is missing or too new). [Verified: `network.py` SOURCES; `gcc_linux.json`; `git_linux.json`; `bootstrap_versions.json`] [Inference: the Pod image has Git and GCC 13, so conda is not needed]

### Time and disk

- **Disk the preflight requires on the `--root` disk (fresh install):** model bytes (52,724,638,908 B = 49.10 GiB) + 30 GiB for a new unified env + 10 GiB margin = **about 89.1 GiB free**. If space is short, setup refuses with "Insufficient disk space: need X GiB". [Verified: `bootstrap.py` lines 682 and 253-268; `install_disk.py` lines 30-36]
- **Disk after install:** PatchWork estimates 67.73 GB in total (52.73 GB weights + about 15 GB env, toolkit and caches; the 15 GB is an estimate) and sizes its container disk at 140 GB. [Verified: PatchWork `js/nodes/nodes.js` lines 2382-2400; `CHANGELOG.md` line 187]. FreeVideo's code says "a Linux unified environment is 5.3 GiB in all". [Verified: `bootstrap.py` lines 263-266]
- **Time:** nobody has measured it on a Pod. PatchWork adds 1,800 s to its boot deadline (720 + 900 + 1,800 = 3,420 s), and calls this "the generous end". [Verified: PatchWork `js/runpod-client.js` lines 1575-1592, 1630]. FreeVideo says that on a fresh Linux install "the compile ran about twice as long as the 21 GiB model download". [Verified: `bootstrap.py` lines 2094-2098]
- [Inference] First install: 15 to 40 minutes. The 52.7 GB download takes 1 to 4 minutes at the 260-830 MB/s that PatchWork measured from HF to RunPod. The rest is the torch env, the Sage compile (which depends on vCPUs and RAM), sha256 checks of 49 GiB, and kernel probes. A re-run on the same disk is short, because receipts and the Sage wheel are reused.

### Every weight file that setup fetches

Selection: `--prepared-format fp8` on SM120 (the `per_tensor` variant), with the default `--sampling-caches` (a new install gets every quality level). That is **700 files, 52,724,638,908 bytes (52.72 GB, 49.10 GiB)**. [Verified: computed from `model_files.json`, `prepared_models.json` and `sampling_assets.py` selection rules; `bootstrap.py` lines 390-399 and 587-591; `storage.py` `conversion_source`]

All 700 files were checked against the Hugging Face API (`/api/models/{repo}/revision/{rev}?blobs=true`):

- All 700 sizes match FreeVideo's manifests.
- All 557 LFS sha256 values match.
- The other 143 files are small non-LFS files. For those, HF gives only a git blob id, and the sha256 comes from FreeVideo's manifest.

[Verified: HF API, today]

Gated status: `gated: false` and `private: false` for all four repos. Anonymous HEAD requests on the resolve URLs returned 302/307, not 401. No HF token is needed. [Verified: HF API; curl HEAD]. Note: the `t8star/Vdn-Minimax-H3-Comfy` card has `extra_gated_*` fields (a territory confirmation form), but the API says `gated: false`. [Verified: HF API cardData]

The full list is in `freevideo_weights.json`. Summary:

| Repo @ revision | Group | Files | Bytes | GB |
|---|---|---:|---:|---:|
| `OpenVDN/vdn-minimax-h3` @ `751739ee` | source-model (decoders, configs, encoder, upscaler) | 21 | 11021260747 | 11.021 |
| `t8star/Vdn-Minimax-H3-Comfy` @ `d6aa5dfc` | source-model (decoders, configs, encoder, upscaler) | 1 | 15687142551 | 15.687 |
| `LBH-123-AI/Minimax_h3_latent_Upscaler` @ `3f941d5d` | source-model (decoders, configs, encoder, upscaler) | 1 | 690592672 | 0.691 |
| `OpenVDN/vdn-minimax-h3-edge` @ `5e6ecc39` | prepared FP8 per-tensor transformer | 277 | 22915543338 | 22.916 |
| `OpenVDN/vdn-minimax-h3-edge` @ `4bbe518a` | sampling tables: community-sigma3-v1-20261005 (3 steps, t2va) | 50 | 58095200 | 0.058 |
| `OpenVDN/vdn-minimax-h3-edge` @ `4bbe518a` | sampling tables: community-sigma3-v1-20261005 (3 steps, i2va) | 50 | 87125600 | 0.087 |
| `OpenVDN/vdn-minimax-h3-edge` @ `0cd66b30` | sampling tables: sampling-presets-v1-20261005 (12 steps, t2va) | 50 | 222635200 | 0.223 |
| `OpenVDN/vdn-minimax-h3-edge` @ `0cd66b30` | sampling tables: sampling-presets-v1-20261005 (12 steps, i2va) | 50 | 338757200 | 0.339 |
| `OpenVDN/vdn-minimax-h3-edge` @ `0cd66b30` | sampling tables: sampling-presets-v1-20261005 (16 steps, t2va) | 50 | 300065200 | 0.300 |
| `OpenVDN/vdn-minimax-h3-edge` @ `0cd66b30` | sampling tables: sampling-presets-v1-20261005 (16 steps, i2va) | 50 | 454894400 | 0.455 |
| `OpenVDN/vdn-minimax-h3-edge` @ `0cd66b30` | sampling tables: sampling-presets-v1-20261005 (20 steps, t2va) | 50 | 377495200 | 0.377 |
| `OpenVDN/vdn-minimax-h3-edge` @ `0cd66b30` | sampling tables: sampling-presets-v1-20261005 (20 steps, i2va) | 50 | 571031600 | 0.571 |

Large files (100 MB or more):

| Repo | Path | Bytes | sha256 (HF API, lfs) |
|---|---|---:|---|
| `OpenVDN/vdn-minimax-h3` | `h3-base/audio_vae/diffusion_pytorch_model.safetensors` | 605429340 | `52c59e67ba8de5477c81bfbced0327aabf500f1bfdeefd5ee754529241cb26cb` |
| `OpenVDN/vdn-minimax-h3` | `h3-base/vae/diffusion_pytorch_model-00001-of-00003.safetensors` | 5061033024 | `72f4c6be84ac0674f27398cde991dd9d719762f3952c4921aa66b2ce542f6374` |
| `OpenVDN/vdn-minimax-h3` | `h3-base/vae/diffusion_pytorch_model-00002-of-00003.safetensors` | 4955986528 | `2e05e8bc23fa4071043e17fd242be8acd0685e781a43987432b2eae925be4198` |
| `OpenVDN/vdn-minimax-h3` | `h3-base/vae/diffusion_pytorch_model-00003-of-00003.safetensors` | 398539336 | `c05d6ac4b1a33de372799d708531da6320f6a3ce6d1ce6d895e770988e004a39` |
| `t8star/Vdn-Minimax-H3-Comfy` | `text_encoders/qwen3vl_32b_minimax_h3_nvfp4_awq.safetensors` | 15687142551 | `35a88d51044231fe332301d7a62aa81e3f2cba62febeb446e2c1e3e0ef76f2c6` |
| `LBH-123-AI/Minimax_h3_latent_Upscaler` | `minimax_h3_latent_upscaler_3d_conv_v1/minimax_h3_latent_upscaler_3d_conv_v1_fp16.safetensors` | 690592672 | `043e5a48e161610ef6c3ea974645220354d06fa618abca15f76d084812eb55c2` |
| `OpenVDN/vdn-minimax-h3-edge` | `cache/blocks/00.safetensors` | 432433020 | `f27579555aec86044db84f8ac2157ecb25e3f29146d6013c44f3518f05e06702` |
| `OpenVDN/vdn-minimax-h3-edge` | `cache/blocks/01.safetensors` | 432433020 | `b649f5873b3da6a5af218993cdbe60ea108df8f2b1f4ca16eda0fdedd896c73a` |
| `OpenVDN/vdn-minimax-h3-edge` | `cache/blocks/02.safetensors` | 432433020 | `6c45758f2b7b32d7d6e2319902c34337d0727fda582f116fbb000c8d2efdec6c` |
| `OpenVDN/vdn-minimax-h3-edge` | `cache/blocks/03.safetensors` | 432433020 | `880779d9493bf25ace0957a225970da78060b1a9669f507c1a2ca6a93bf9c529` |
| `OpenVDN/vdn-minimax-h3-edge` | `cache/blocks/04.safetensors` | 432433020 | `b4e23bac7cd3327651f7f8d25fdbec1c71ce388cdedcb3ec07d71575539d0069` |
| `OpenVDN/vdn-minimax-h3-edge` | `cache/blocks/05.safetensors` | 432433020 | `d3a5922d26514df706f280c0e885700bcaeb0e2596a29de00920f62206cca726` |
| `OpenVDN/vdn-minimax-h3-edge` | `cache/blocks/06.safetensors` | 432433020 | `bee8100f80f9463bfa1c618db78250fa1c246fd7c024ede67270bd4c10621215` |
| `OpenVDN/vdn-minimax-h3-edge` | `cache/blocks/07.safetensors` | 432433020 | `1b1fca4bbadf7c0d97ed7bef37d85d9ba5b0316fb336b6c29e8f5947c1d80c49` |
| `OpenVDN/vdn-minimax-h3-edge` | `cache/blocks/08.safetensors` | 432433020 | `00b2e86852c6d5d0733eff269ad0013bdb672706b8a3c3847a39700bf2aa0d54` |
| `OpenVDN/vdn-minimax-h3-edge` | `cache/blocks/09.safetensors` | 432433020 | `8b9274d911f5b319e2a842fa58a4c629d19961b9785ac841d176dd71e6dfbb9c` |
| `OpenVDN/vdn-minimax-h3-edge` | `cache/blocks/10.safetensors` | 432433052 | `23eb6e5724584925385780d995130e06f3d7a56847950e54b2ab7d6d3e25b043` |
| `OpenVDN/vdn-minimax-h3-edge` | `cache/blocks/11.safetensors` | 432433052 | `edef0733f4be87d9606f04a6f2ad605d682c92f78da7c39bf926d059bdbb7991` |
| `OpenVDN/vdn-minimax-h3-edge` | `cache/blocks/12.safetensors` | 432433052 | `28230556a483530159904d8c164178d0b711886b0800c120602fcf190d50d50f` |
| `OpenVDN/vdn-minimax-h3-edge` | `cache/blocks/13.safetensors` | 432433052 | `2a87ec0ce9b3c929f57bec4e429ee2482468c24d4c5ea7e681ef05a0f5bd4acb` |
| `OpenVDN/vdn-minimax-h3-edge` | `cache/blocks/14.safetensors` | 432433052 | `753ed8b2bc78a85a017176b9b3893dd84318f81a994feff1cd68bfbcd33597bf` |
| `OpenVDN/vdn-minimax-h3-edge` | `cache/blocks/15.safetensors` | 432433052 | `f07f4dffad68abbc8fa080740cad96d3a5f8ed41748ca58895731ad507ea6b45` |
| `OpenVDN/vdn-minimax-h3-edge` | `cache/blocks/16.safetensors` | 432433052 | `d3ceee15b0a61360d9960b49f4f75fec9a18dd550301d5503a457dc8bbb55dab` |
| `OpenVDN/vdn-minimax-h3-edge` | `cache/blocks/17.safetensors` | 432433052 | `0e50643126416b79405d985f8c28fa343004f727c971caf913d6a1e62b1a8fdb` |
| `OpenVDN/vdn-minimax-h3-edge` | `cache/blocks/18.safetensors` | 432433052 | `d94d7e4749fbc57f78b0052b05e0b9edc698d98aaf323afeb335a6e54aaf4d75` |
| `OpenVDN/vdn-minimax-h3-edge` | `cache/blocks/19.safetensors` | 432433052 | `a7a4bc4355c8826f6fdc2f8f2186ac9adebec3796e7d6cc66a9a1041075794af` |
| `OpenVDN/vdn-minimax-h3-edge` | `cache/blocks/20.safetensors` | 432433052 | `58be531a579178f91581c43c869540eea7b93d77bcaf981e0edd6ea8500c0c7d` |
| `OpenVDN/vdn-minimax-h3-edge` | `cache/blocks/21.safetensors` | 432433052 | `212b3899a5fba7a52c37b5307a7b3cdafaf15b9f8481bc75faf9f3ebfa430cfa` |
| `OpenVDN/vdn-minimax-h3-edge` | `cache/blocks/22.safetensors` | 432433052 | `646d11ea3daf00c52c0eda558dc557b8b97a4baa4f8e97d267e9d354da42ec9c` |
| `OpenVDN/vdn-minimax-h3-edge` | `cache/blocks/23.safetensors` | 432433052 | `c0f7d3e287f27fee123414c53aba3cda96a4347fd2b2fe1edce6b5e01755d988` |
| `OpenVDN/vdn-minimax-h3-edge` | `cache/blocks/24.safetensors` | 432433052 | `045337814367e50bab107ca30f3ee4c343199e1e64e40af095822599095f21d1` |
| `OpenVDN/vdn-minimax-h3-edge` | `cache/blocks/25.safetensors` | 432433052 | `dcb426d4790c5ba428ad0db6518b0e2be0af927f4be368d191fcae850cfc4e14` |
| `OpenVDN/vdn-minimax-h3-edge` | `cache/blocks/26.safetensors` | 432433052 | `89e1aa6197993f6deca7b19632a8ec7a04ce9bb7729c83dbce3130ed1130ecd5` |
| `OpenVDN/vdn-minimax-h3-edge` | `cache/blocks/27.safetensors` | 432433052 | `f8735df68b94bc7b6fdaa5b4b5e22d6b6fa7162fcddb5197aa3b07f83e01f0b9` |
| `OpenVDN/vdn-minimax-h3-edge` | `cache/blocks/28.safetensors` | 432433052 | `5e7176e3bd5512ffc201800bc00eda6fab495370000eea2801ef7ce0ece9662d` |
| `OpenVDN/vdn-minimax-h3-edge` | `cache/blocks/29.safetensors` | 432433052 | `8e18b701af846a0a6f7289500bff14898694ff5b77ab0626eb0a1a8d6e7b3f2f` |
| `OpenVDN/vdn-minimax-h3-edge` | `cache/blocks/30.safetensors` | 432433052 | `ea0a644564d272b7d2737d0a3748ad9d2441ccab850856c539e5e355768111a4` |
| `OpenVDN/vdn-minimax-h3-edge` | `cache/blocks/31.safetensors` | 432433052 | `6f6d5b77dd5845eb40e197c8c8aac2890967ac8e10f6013851fb7c033e744065` |
| `OpenVDN/vdn-minimax-h3-edge` | `cache/blocks/32.safetensors` | 432433052 | `9a70c0095e155630d6cacf73dfb70bfa913417fe7b1b8508de5d82cdcf260b09` |
| `OpenVDN/vdn-minimax-h3-edge` | `cache/blocks/33.safetensors` | 432433052 | `03f5bdb472307d507549c5062b1f6011c5dd8ae442ecabf131d0cbdb6994b8b0` |
| `OpenVDN/vdn-minimax-h3-edge` | `cache/blocks/34.safetensors` | 432433052 | `12b328e282c7a348a8a7b8af68590cd9da87324227f813c5ec289fba09d6027d` |
| `OpenVDN/vdn-minimax-h3-edge` | `cache/blocks/35.safetensors` | 432433052 | `4e04c13ce4439b3ac7662022fe86710e7a8ad5701360278b23177f9e6705137c` |
| `OpenVDN/vdn-minimax-h3-edge` | `cache/blocks/36.safetensors` | 432433052 | `58d098da1caf31074b50a03067dda372628664ab46bc9b30c4fb6d65e20f378f` |
| `OpenVDN/vdn-minimax-h3-edge` | `cache/blocks/37.safetensors` | 432433052 | `907fb46ac61c46030e647f5e1926125c02f00f23b4534fd91043f6cf350378db` |
| `OpenVDN/vdn-minimax-h3-edge` | `cache/blocks/38.safetensors` | 432433052 | `dec9ccd22807dd8b011fab20c5c8dcc7710ce854fe293201a41c6cc17ab8a9ff` |
| `OpenVDN/vdn-minimax-h3-edge` | `cache/blocks/39.safetensors` | 432433052 | `1c86ce8d1ec6f4cfe8aa0d21a5d5944e9433468ce7bc7f33a85476e22e60559f` |
| `OpenVDN/vdn-minimax-h3-edge` | `cache/blocks/40.safetensors` | 432433052 | `9dcc34128a282bed2cf7a1195df698a31ef8e01f4f68d86d0e23215a853cac64` |
| `OpenVDN/vdn-minimax-h3-edge` | `cache/blocks/41.safetensors` | 432433052 | `471eca273bf5de3d45e882f2a41d7a2f99485d129fddbfb5c9b5ba0b464d7e9d` |
| `OpenVDN/vdn-minimax-h3-edge` | `cache/blocks/42.safetensors` | 432433052 | `8e644e63166bee0fa81d3316bf75cc29fa40352853f5ea8a42ec59508384d609` |
| `OpenVDN/vdn-minimax-h3-edge` | `cache/blocks/43.safetensors` | 432433052 | `703682d5756521aab6be654c9706624fb298990b904e4508741dba2858017729` |
| `OpenVDN/vdn-minimax-h3-edge` | `cache/blocks/44.safetensors` | 432433052 | `659ab9dd1571cc65d864cdbe94ea71e65633d59d35356c31cf4d0a91c3c06601` |
| `OpenVDN/vdn-minimax-h3-edge` | `cache/blocks/45.safetensors` | 432433052 | `599be1c8a6460120c939e769cf8136f4329bd2c56e3ded27119e9377b0f3bd22` |
| `OpenVDN/vdn-minimax-h3-edge` | `cache/blocks/46.safetensors` | 432433052 | `04da82ad84d8cde2bf31e4aa67ecfa6cf9f1acb55b53cec37b4898a2c3c1976d` |
| `OpenVDN/vdn-minimax-h3-edge` | `cache/blocks/47.safetensors` | 432433052 | `ae5b633c87441db4bc41cfaf5647953bdd0a8a58362357b161ec2772648cf8ae` |
| `OpenVDN/vdn-minimax-h3-edge` | `cache/blocks/48.safetensors` | 432433052 | `fc3c18b5ddd3364b4b428f0ec509fb31b1ff041f3164018a9e7a1cc045feb7e5` |
| `OpenVDN/vdn-minimax-h3-edge` | `cache/blocks/49.safetensors` | 432433052 | `f2857d4ae1b6266a8ad254daf0cdd182d93cd9799af15b5d1a1cfd125b953e25` |
| `OpenVDN/vdn-minimax-h3-edge` | `cache/root.safetensors` | 925027500 | `f7af27041076fa2a563d49f3e3c7bdc0cd81438f0302f21d6ca1763be5e1a67f` |

No level at HEAD uses the 12-step tables (0.56 GB), but setup still fetches them with "every quality level". `--no-sampling-caches` skips all 2.27 GB of preset tables. In that case, High and Max fetch their tables on first use. [Verified: `tiers.py`; `bootstrap.py` lines 2226-2228; `sampling_assets.py` `install_files`]

On-demand downloads: 122 more sampling tables (57.66 GB in all) are fetched only by a request that uses a step count outside the four levels, or a reference with audio. [Verified: `sampling_assets.py` `tables`, `required`, `preset`; computed from `prepared_models.json`]

Where files go under `--root`: `models/vdn/` (OpenVDN source files and the upscaler), `models/encoder/text_encoders/`, `prepared/edge-5e6ecc39f472f98c/cache/` (the FP8 transformer) and `models/vdn/sampling-cache/`. [Verified: `bootstrap.py` `model_target` lines 371-387; `prepared_model.select`]

---

## 3. ComfyUI nodes

The extension returns `[FreeVideoGenerate, FreeVideoMedia, FreeVideoReference, FreeVideoLoRA, FreeVideoLoRAStack, FreeVideoFrames]`. These are the same six classes as at the pin. They are ComfyUI V3 nodes (`comfy_api.latest`, `comfy_entrypoint`). [Verified: `freevideo_engine/comfy_nodes.py` line 576; `git show 7e506f4:...` line 387; `__init__.py`]

### `FreeVideoGenerate` ("FreeVideo · Video + Audio"), an output node

| Input | Type | Default / range | Notes |
|---|---|---|---|
| `text` | STRING | starter prompt | required |
| `width` | INT | 1344, 256..4096, step 32 | required |
| `height` | INT | 768, 256..4096, step 32 | required |
| `seconds` | FLOAT | 10, 1.625..60, step 0.1 | required. 24 fps, rounded up. More than 15 s is "experimental". |
| `seed` | INT | 2026090903, 0..2^53-1 | required |
| `first` | IMAGE | optional | "Center-cropped to the selected canvas; enables I2VA" |
| `last` | IMAGE | optional | with `first`: FL2VA; alone: L2VA |
| `references` | FREEVIDEO_REFERENCES | optional | "Experimental Ref2VA ... VDN is not reference-trained" |
| `loras` | FREEVIDEO_LORAS | optional | |
| `conditioning` | CONDITIONING | optional | native MiniMax-H3 conditioning from a compatible node. Overrides prompt and media. |
| `media` | FREEVIDEO_MEDIA | optional | from `FreeVideoMedia` |
| `two_pass` | BOOLEAN | true | |
| `base_steps` | INT | 8, 1..32 | two passes only with 8 |
| `refine_steps` | INT | 3, 1..31 | |
| `force_regenerate` | BOOLEAN | false | a cache hit returns the earlier mp4 |
| `preview` | BOOLEAN | false | stop after the first pass |
| `refine_from` | STRING | "" | advanced, socketless |
| `continue_from` | STRING | "" | advanced, long videos |
| `frames` | INT | 0 (0 = use `seconds`) | advanced. Must be 5 + 17n, at least 39. |
| `first_frame_reference`, `voice_reference`, `hide_tail` | BOOLEAN | false | advanced, continuation only |
| `step_cache` | COMBO | `none` / `easycache-av` / `fbcache` | advanced |
| `upscale_factor` | COMBO | `2` / `1.5` / `1.2` (strings) | advanced, two passes only |

Outputs: `video` (VIDEO) and `report` (STRING, "Report JSON"). The node saves the mp4 itself to `output/FreeVideo/<YYYY-MM-DD>/<uuid hex>/video.mp4`. It returns `ui.PreviewVideo`, so the history entry is `{"images": [{"filename": "video.mp4", "subfolder": "FreeVideo/...", "type": "output"}], "animated": [true], "freevideo_summary": [...]}`. Do not add a `SaveVideo` node. [Verified: `comfy_nodes.py` lines 64-131, 328-334, 394; `comfy_bridge.py` lines 1274-1276; `comfy_assets.py` `saved_video`; ComfyUI v0.41.1 `comfy_api/latest/_ui.py` lines 426-431]

`validate_inputs` calls `comfy_bridge.installation()`. So before `machine.json` exists, ComfyUI rejects the prompt with "FreeVideo setup is missing. ..." instead of failing during the run. [Verified: `comfy_nodes.py` lines 133-164; `comfy_bridge.py` lines 835-856]

### Other nodes

- `FreeVideoMedia` ("FreeVideo · Media"). Inputs: `assets` (STRING JSON, default `[]`), and optional `first`, `last`, `reference`, `reference_2`..`reference_8` (IMAGE), `reference_audio` (AUDIO, at most 15 s). Output: `media`. [Verified: `comfy_nodes.py` lines 397-440; `comfy_assets.py` line 29]
- `FreeVideoReference` ("FreeVideo · Reference (experimental)"). Inputs: exactly one of `image` (IMAGE), `video` (VIDEO) or `audio` (AUDIO), plus optional `previous`. Output: `references`. At most 32 in a chain. [Verified: `comfy_nodes.py` lines 443-463]
- `FreeVideoLoRA` ("FreeVideo · LoRA"). Inputs: `lora` (COMBO of `None` plus every `.safetensors` name in ComfyUI's `loras` folders), `strength` (FLOAT, default 1, -100..100, step 0.05), and optional `previous`. Output: `loras`. [Verified: `comfy_nodes.py` lines 466-486]
- `FreeVideoLoRAStack` ("FreeVideo · LoRAs"). Inputs: `adapters` (STRING JSON) and optional `previous`. Output: `loras`. [Verified: `comfy_nodes.py` lines 489-510]
- `FreeVideoFrames` ("FreeVideo · First / Last Frame"). Input: `video`. Outputs: `first`, `last` (IMAGE). [Verified: `comfy_nodes.py` lines 513-539]

### How a LoRA file is named

- The `lora` value is the name that ComfyUI's `folder_paths.get_filename_list('loras')` lists. On ComfyField's Pod that is a path relative to `/workspace/models/loras` (from `extra_model_paths.yaml`), for example `my_style.safetensors` or `sub/my_style.safetensors`. Only `.safetensors` files appear. [Verified: `comfy_nodes.py` line 470; `server/podBoot.js` lines 86-91]
- The node resolves the file with `folder_paths.get_full_path_or_raise('loras', name)`. When `strength != 0`, it checks the file header against the VDN-H3 layout (50 blocks, key names and shapes). A LoRA that does not fit fails with "This LoRA was not trained for the FreeVideo model and cannot be used." [Verified: `comfy_nodes.py` lines 478-486; `lora_check.py`]
- MiniMax H3 community LoRAs work, per FreeVideo's docs (VHS, Looping Sketch Anime, Male POV). [Verified: `docs/LoRA.md`]
- A LoRA that changes modulation (AdaLN) needs a one-time preparation on its first use. [Verified: `bootstrap.py` line 783 `first_generation_note`]
- The combo list is read again on each `INPUT_TYPES` call. So a LoRA that downloads after ComfyUI starts appears without a restart. [Verified: ComfyUI v0.41.1 `comfy_api/latest/_io.py` lines 2397-2408] [Inference: folder_paths refreshes its cache on a directory mtime change]
- The model needs no speed (Turbo) LoRA: "FreeVideo needs no acceleration LoRA." [Verified: `comfy_nodes.py` line 472]

### Graphs (API format)

Text to video: `freevideo_t2v.json`

```json
{
  "104": {
    "class_type": "FreeVideoGenerate",
    "inputs": {
      "text": "{{prompt}}", "width": "{{width}}", "height": "{{height}}",
      "seconds": "{{duration}}", "seed": "{{seed}}",
      "two_pass": true, "base_steps": 8, "refine_steps": 3,
      "step_cache": "none", "upscale_factor": "2",
      "force_regenerate": false, "preview": false
    }
  }
}
```

Image to video (start frame): `freevideo_i2v.json` adds `"700": {"class_type": "LoadImage", "inputs": {"image": "{{image}}"}}` and `"first": ["700", 0]` on node 104.

Text to video with a LoRA: `freevideo_t2v_lora.json` adds `"601": {"class_type": "FreeVideoLoRA", "inputs": {"lora": "{{lora}}", "strength": 1.0}}` and `"loras": ["601", 0]`. More LoRAs chain through `previous`, the same way PatchWork does (`601`, `602`, ... with `previous: [prev, 0]`). [Verified: PatchWork `_freeVideoGraph`, `combined-node.js` lines 4005-4015]

Notes on the graphs:

- Node ids 104 / 700 / 701 / 601+ follow PatchWork's run-log convention. [Verified: `combined-node.js` lines 3963-3975]
- Use `{{duration}}` in seconds, not `{{frames}}`. FreeVideo rounds the length itself. ComfyField's `comfyVars` sets `frames` as `duration*24+1` (the LTX rule). That value is usually not a 17n+5 count, so FreeVideo would ignore it. [Verified: `shared/mapping.js` line 26; `comfy_nodes.py` lines 18-34; `geometry.py`]
- `width` and `height` must be multiples of 32, at least 256. Pass FreeVideo's presets per aspect ratio (section 5) through `sizes`. [Verified: `geometry.py` line 8; `shared/mapping.js` lines 24-27]
- `fill` keeps the type of a whole-string placeholder, so numbers stay numbers. [Verified: `shared/mapping.js` lines 11-21]
- Quality levels change only `two_pass`, `base_steps`, `refine_steps`, `step_cache` and `upscale_factor` (section 5).
- End frame: add `"701": LoadImage` and `"last": ["701", 0]`. [Verified: `comfy_nodes.py` lines 83-84]

---

## 4. Compatibility

### ComfyUI v0.41.1 (`45bf90d1`, 2026-10-15)

- FreeVideo installs and tests its own ComfyUI at `421a1c245c682c04d4325ba365f40c834c66f5b0` (2026-09-08, "Fix MiniMax H3 denoise masks"). v0.41.1 is 241 commits ahead of it, 0 behind. [Verified: `dependencies.json`; GitHub commit and compare API]
- FreeVideo states no minimum ComfyUI version. Its README supports "Existing ComfyUI" as a plain `git clone` into `custom_nodes`. [Verified: grep of the repo; `README.md`]
- Static check at v0.41.1. Each of these exists:
  - `comfy_api.latest` with `ComfyExtension`, `InputImpl.VideoFromFile`, `io.Custom`, `advanced`, `socketless`, `search_aliases`, `is_experimental`, `not_idempotent`, `fingerprint_inputs`, `validate_inputs` and `ui.PreviewVideo`
  - `PromptServer.add_on_prompt_handler` and `send_progress_text`
  - `model_management.free_memory(memory_required, device, ...)`, `get_free_memory`, `unload_all_models`, `soft_empty_cache` and `throw_exception_if_processing_interrupted`
  - `PromptQueue.get_tasks_remaining` and `get_current_queue`

  [Verified: ComfyUI v0.41.1 `comfy_api/latest/__init__.py`, `_io.py`, `_ui.py`, `server.py` lines 1488-1581, `comfy/model_management.py` lines 893-2202, `execution.py` lines 1363-1396]
- In the ComfyUI process, FreeVideo imports `av`, `numpy`, `psutil` and the stdlib. ComfyUI v0.41.1's `requirements.txt` has `av>=17`, `numpy`, `psutil`, `Pillow` and `safetensors`. The repo has no `requirements.txt`, so nothing is pip-installed into ComfyUI's venv. [Verified: import scan of `comfy_*.py`; ComfyUI v0.41.1 `requirements.txt`; repo root listing]
- FreeVideo wraps `model_management.free_memory`. When a native ComfyUI model needs VRAM, FreeVideo releases its idle engine process. So FreeVideo and core graphs (LTX, FLUX) can share one Pod. [Verified: `comfy_residency.py` lines 21-38] [Inference: sharing is not tested]
- Governance (`app/governance.py`) refuses packs only when a signed org policy exists. The Pod has none. [Verified: v0.41.1 `app/governance.py` lines 125-170, 427-447]
- [Inference] Likely to work. It must still be proven with one run, because FreeVideo never tested v0.41.1.

### `--disable-all-custom-nodes`

- With this flag, ComfyUI skips every folder in `custom_nodes` that is not in `--whitelist-custom-nodes`. The match is on the folder name. [Verified: v0.41.1 `nodes.py` lines 2381-2383; `cli_args.py` lines 216-217]
- Change: start ComfyUI with `--disable-all-custom-nodes --whitelist-custom-nodes FreeVideo`. The other packs in the image (sol-attn, blockcache, Turbo loader) stay off. [Inference]
- PatchWork's ComfyUI line has no `--disable-all-custom-nodes`. [Verified: PatchWork `js/runpod-bootscript.js` lines 1903-1904]
- ComfyUI can start before setup ends. The node registers, and `validate_inputs` refuses runs until `machine.json` exists. The background compile checks `FREEVIDEO_BACKGROUND_COMPILE` before it reads the install. So no ComfyUI restart is needed after setup, provided that `FREEVIDEO_HOME` was set at launch. [Verified: `comfy_nodes.py` lines 133-164 and 542-548; `comfy_bridge.py` lines 819-856] [Inference: not run]

### The three GPUs

FreeVideo's floor is compute capability 8.0 and NVIDIA driver 580 or newer. It claims 8 GB VRAM and 16 GB RAM. [Verified: `hardware.py`; `bootstrap.py` lines 513-514; `README.md`; `docs/Linux.md`]

Blackwell sm_120 support:

- On SM120, FP8 GEMM uses per-tensor scales. [Verified: `docs/execution-planning.md`; `prepared_model.select` (capability >= 10 gives `per_tensor`)]
- Sage2 compiles for arch `12.0`. FreeVideo's tested scope is "SM120 kernel checks and full requests" with torch 2.13.0+cu130. [Verified: `bootstrap.py` line 1734; `dependencies.json` `tested`]
- FreeVideo's Linux test machine is an RTX PRO 6000 Blackwell. [Verified: `docs/community-results.md` line 91; `prepared_models.json` entries "NVIDIA RTX PRO 6000 Blackwell Server Edition"]
- [Inference] The RTX PRO 4000 and 4500 are also SM 12.0. FreeVideo's `hardware.py` maps any (12, x) except (12, 1) to `blackwell-rtx`. Because their names have no "GeForce", they get FP8.

Placement facts:

- Each of the 50 transformer blocks is 432.5 MB.
- At most 44 blocks stay in VRAM. The rest stay in pinned host RAM (up to 22 GB) and copy to the GPU at every step.
- When host RAM is short too, blocks stream from disk.
- Below a 20 GiB VRAM budget, the VAE decoder streams blocks.

[Verified: `docs/execution-planning.md`]

| GPU | VRAM | Fits? | Placement [Inference] | Speed prior (G, FreeVideo's unmeasured spec prior) |
|---|---|---|---|---|
| RTX PRO 4000 Blackwell | 24 GB | yes (floor 8 GB) | The FP8 transformer (22.9 GB) does not fit. Roughly 25-40 blocks resident, the rest from pinned RAM. The decoder streams. | 1.70 |
| RTX PRO 4500 Blackwell | 32 GB | yes | Most blocks resident. | 2.13 |
| RTX PRO 6000 Blackwell | 96 GB | yes | 44 blocks resident (the cap). This is FreeVideo's own test card. | 5.27 |
| (reference) RTX 5090 | 32 GB | | | 4.25 |

[Verified: G values from `freevideo_engine/stage_estimate_params.json` (provenance "architecture-derived nominal NVIDIA public-spec prior; no measured training requests")]

[Inference] Host RAM matters on the 24 GB card. Pick a Pod with at least 32 GB RAM, so that blocks do not stream from the volume at every step.

---

## 5. Quality, sizes, duration, speed

### Quality levels at HEAD

[Verified: `freevideo_engine/tiers.py` `TIERS`; `web/sampling_effort.js`]

| Level | `two_pass` | `base_steps` | `refine_steps` | `step_cache` | `upscale_factor` |
|---|---|---|---|---|---|
| Light (default) | true | 8 | 3 | `none` | `2` |
| Medium | true | 8 | 3 | `none` | `1.5` |
| High | false | 16 | 3 (not used) | `easycache-av` | `2` |
| Max | false | 20 | 3 (not used) | `easycache-av` | `2` |

At the PatchWork pin, the levels were: Light 8+3 two-pass, Medium 12 one-pass, High 16, Max 20, all with no cache. [Verified: `git show 7e506f4:web/sampling_effort.js`; PatchWork `nodes.js` lines 2427-2432]

### Canvas presets

The formula is `round(sqrt(MP·1024²·ratio)/32)·32` for the width, and the same with `/ratio` for the height. FreeVideo's panel offers 0.5 / 0.75 / 0.98 (labelled "Native") / 1.5 / 2 MP, for 16:9, 9:16 and 1:1. [Verified: `web/studio_size.js`, `web/frame_sizes.js`]. The 4:5 column is my computation from the same formula; FreeVideo's video panel has no 4:5 option. [Inference]

| MP | 16:9 | 9:16 | 1:1 | 4:5 [Inference] |
|---|---|---|---|---|
| 0.5 | 960x544 | 544x960 | 736x736 | 640x800 |
| 0.75 | 1184x672 | 672x1184 | 896x896 | 800x992 |
| **0.98 (native)** | **1344x768** | **768x1344** | **1024x1024** | 896x1120 |
| 1.5 | 1664x928 | 928x1664 | 1248x1248 | 1120x1408 |
| 2 | 1920x1088 | 1088x1920 | 1440x1440 | 1280x1632 |

The 16:9, 9:16 and 1:1 cells match PatchWork's `FREEVIDEO_SIZES`. [Verified: PatchWork `nodes.js` lines 2453-2459]

Small-canvas rules: a first pass below 138,240 px samples both passes at the target size. A target below 131,072 px renders larger and then scales down. [Verified: `two_pass.py` lines 38-50]

### Duration

- 1.625 s to 60 s at 24 fps. More than 15 s is "experimental". [Verified: `comfy_nodes.py` lines 77-79; `geometry.py`]
- The frame count is `ceil(seconds·24)`, rounded up to 17n+5. Examples: 5 s gives 124 frames (5.167 s), 10 s gives 243 (10.125 s), 15 s gives 362 (15.083 s). [Verified: `geometry.py`; PatchWork test `185-freevideo-engine` expects 124 and 243]
- Long videos can also run as chained segments (`continue_from`, `frames` = 5+17n, at least 39). [Verified: `comfy_nodes.py` lines 108-113]

### Measured speed (none on RTX PRO 4000 or 4500)

| Measurement | Value | Source |
|---|---|---|
| RTX 5090 32 GB + 64 GB, Windows, 1344x768, 10 s, two-pass | 122 s | [Verified: `docs/execution-planning.md`] |
| RTX 5090, 1344x768, 10 s, Light, end to end (community) | 249 s (v0.3.22); 400 s (v0.4.4, 96 GB RAM) | [Verified: `docs/community-results.md`] |
| RTX 5090, 1344x768, 10 s, Max (community) | 517 s (v0.4.4) | [Verified: `docs/community-results.md`] |
| RTX PRO 5000 72 GB, 768x1344, 10 s, High (community) | 552 s (v0.3.4) | [Verified: `docs/community-results.md`] |
| RTX PRO 6000, 864x1184, 5 s, 20 steps, sampling only | 238 s plain; 212 s with the guarded EasyCache-AV | [Verified: `tiers.py` comment] |
| RTX PRO 6000, decode of 1344x768x243 | 15.4 s (19.2 s without the FP16 linear cache) | [Verified: `policy.py` lines 1649-1651] |
| H200, 1344x768, 20 s, two-pass sampling | 177.8 s at 2x; 221.5 s at 1.5x (Medium) | [Verified: `tiers.py` comment] |

[Inference] Light, 10 s, 1344x768, from the G priors scaled to the 5090's 249-400 s:

- PRO 6000: about 200-300 s
- PRO 4500: about 500-800 s
- PRO 4000: about 600-1,000 s, plus streaming cost on 24 GB

These numbers are rough. Measure before you quote them.

---

## 6. Comfy Cloud

- FreeVideo is not on Comfy Cloud's supported-nodes list. `https://comfy.org/cloud/supported-nodes.md` lists 83 packs and none is FreeVideo or FlashML. The HTML page (1 MB) has no "FreeVideo" or "FlashML" string either. [Verified: fetched both today]
- [Inference] It cannot run on Comfy Cloud in its current form. The node needs a local `FREEVIDEO_HOME` with `machine.json`, its own Python env, a compiled Sage wheel and about 49 GiB of weights, and it starts subprocesses. Comfy Cloud runs only its preinstalled packs.
- Consequence for ComfyField: FreeVideo is a Pod-only engine (see blocker 3).
- Side note: the text-encoder repo's README points to a ComfyUI-native route for the same DMD8 weights: the T8 custom node `T8mars/comfyui-minimax-h3-audio-T8` with `minimax_h3_fl2va_(pruned_)int8_convrot.safetensors` from `t8star/Vdn-Minimax-H3-Comfy`. That node is also not on the Comfy Cloud list (no "T8" or "minimax-h3-audio" pack). [Verified: t8star README; Cloud list grep]. I did not research it further.

---

## 7. How PatchWork wires it, and what ComfyField should port

### PatchWork (pin `7e506f4`, local clone HEAD `9a90879`)

- **Setting:** GPU pods → Setup → Advanced → H3 engine: Stock / FreeVideo. The registry is `H3_ENGINES` / `h3Engine`. The default is Stock. [Verified: `js/nodes/nodes.js` lines 2395-2409; `CHANGELOG.md` line 186]
- **Pod plan:** `h3PodPlan` carries `engine`. On FreeVideo it empties `unets`, `clip`, `vaeVideo` and `vaeAudio`, keeps the stock build settings for a switch back, and sets `weightsGb: 67.73`. The engine entry has `diskExtraGb: 20`. Disk: `diskFor` adds both. The CHANGELOG says 140 GB. Boot deadline: `FREEVIDEO_BOOT_EXTRA_SEC = 1800`. [Verified: `nodes.js` lines 2597-2618; `runpod-client.js` lines 1140-1160, 1575-1592, 1630; `CHANGELOG.md` line 187]
- **Boot script:**
  - `const fv`: FreeVideo pods skip Comfy-Org's H3 downloads, the Turbo adapter, sol-attn, blockcache and the Sage flag (`h3Comfy = 0`). Style LoRAs still download. [Verified: `runpod-bootscript.js` lines 141-186, 247-249]
  - `STAGE freevideo`: the clone and `setup.sh` call shown in section 2. It runs on every boot (resumes reuse receipts and the Sage wheel, and re-record the GPU). A failure is fatal. [Verified: lines 150-175, 1201-1212]
  - Launch: `export FREEVIDEO_HOME="$BASE/freevideo"`, `CUDA_VISIBLE_DEVICES="${CUDA_VISIBLE_DEVICES:-0}"` (or the engine "pins the GPU by the UUID recorded at setup"), and `FREEVIDEO_BACKGROUND_COMPILE=off` (the idle compile holds the GPU and the engine lock, which the watchdog reads as work). No `--use-sage-attention`. [Verified: lines 176-180, 1895-1901]
  - The install lives on the container disk (`/root/h3/freevideo`), not on a volume. [Verified: lines 1207, 1897]
- **Readiness:** statusd reports `models.freevideo = ["vdn-h3"]` when `$BASE/freevideo/machine.json` exists, and `[]` when it does not. [Verified: `runpod-bootscript.js` lines 657-658]
- **Engine matching:** `_comfyMissingWeights` checks the engine first. A FreeVideo node on a stock Pod, or a stock node on a FreeVideo Pod, is refused with "... needs a new pod", and the message does not say that a download failed. Style LoRAs are then checked against `models.loras`. [Verified: `combined-node.js` lines 5038-5072]
- **Graph:** `_freeVideoGraph`:
  - node 104 is `FreeVideoGenerate` with `text`, `width`/`height` from `freeVideoSize(freeVideoPixels, aspect)`, `seconds` (the slider value, so FreeVideo rounds it once), `seed`, `two_pass`, `base_steps`, `refine_steps`, `force_regenerate: false` and `preview: false`
  - 700/701 are `LoadImage` for `first`/`last`
  - 601+ is a `FreeVideoLoRA` chain
  - 750+ is a `FreeVideoReference` chain, fed by 700+ `LoadImage`, 800+ `LoadVideo` and 900+ `LoadAudio`

  Turbo and the block cache are forced off. [Verified: `combined-node.js` lines 3719-3733, 3962-4058]
- **Controls:** `FREEVIDEO_QUALITY`, `FREEVIDEO_SIZES`, `FREEVIDEO_PIXELS`, `FREEVIDEO_SECONDS = [2, 60]`, `FREEVIDEO_STABLE_SECONDS = 15`, `freeVideoFrames`, `freeVideoActive`. [Verified: `nodes.js` lines 2412-2501]
- **Tests:** `tests/smoke/185-freevideo-engine.test.mjs` checks the registry, the boot-script gates and flags, the graph shape, engine matching, disk and deadline sizing, the run log, and the node and Studio controls. It does not run a GPU. [Verified: test file; `CHANGELOG.md` line 80 "Still not run on a GPU"]

### What ComfyField should port

1. **Pin FreeVideo `fcd24fb730e7094565d13b663e92c264ed4d470c` (v0.4.14)**, and re-read `comfy_nodes.py` and `tiers.py` when you change the pin. [Inference]
2. **Boot (`server/podBoot.js`):**
   - Keep "ready" fast. Start ComfyUI with `FREEVIDEO_HOME`, `FREEVIDEO_BACKGROUND_COMPILE=off`, `CUDA_VISIBLE_DEVICES` and `--whitelist-custom-nodes FreeVideo`.
   - Run `pin_repo` and `setup.sh` in a background subshell after the proxy is up. Write a log and a flag file when it ends. Run it on every boot.
   - Put `--root` on `/workspace` so a later Pod reuses weights, the env and the Sage wheel. A re-run re-records the GPU UUID.
   - Keep the start command under 64 KiB. [Inference]
3. **statusd (`server/pod-statusd.py`):**
   - Report `freevideo: {state: installing|ready|failed}`. Use "ready" only when `machine.json` has `ready: true` **and** this boot's setup has ended. On a re-run, an old `machine.json` already exists while setup holds its locks.
   - Count the install as busy in `next_idle`.
   - Raise `fatal` on failure only if the Pod was started for FreeVideo. [Inference; the busy rule is required by blocker 2]
4. **Routing (`server/core.js` / `shared/modelFiles.js`):**
   - Mark graphs with any `FreeVideo*` `class_type` as Pod-only, with a capability need of `freevideo` (like PatchWork's engine check).
   - Add `FreeVideoLoRA: { lora: 'loras' }` to `LOADERS`, so that a lease downloads the LoRA. [Verified: the gap in `modelFilesOf` `LOADERS`] [Inference: the fix]
5. **Pod sizing:** add FreeVideo's footprint to `volumeFor`: about 89 GiB free for the first install, about 60-68 GB kept after it. Set `minVramGb` to 8 for FreeVideo runs, so all three GPUs qualify. [Inference from section 2 and 4]
6. **Model entry (`src/lib/tools.js` open-weight list, `shared/mapping.js`):**
   - Use FreeVideo's 0.98 MP sizes per aspect through `sizes`. Pass `{{duration}}` in seconds.
   - Map ComfyField quality to the HEAD table in section 5, not PatchWork's stale one.
   - Durations 2-15 s are stable; 20-60 s are experimental.
   - Label the model as VDN-H3 (8-step distilled), not stock H3. [Inference]
7. **Outputs:** no change is needed. comfy-api-proxy 0.1.6 maps the `images` key to kind `image` with `content_type` from the filename (`video/mp4`). That is the same path as core `SaveVideo`, which ComfyField's H3 and LTX graphs already use. `mimeExt('video/mp4')` gives `mp4`. [Verified: comfy-api-proxy 0.1.6 `app.py` lines 58-65, 381-410; `server/core.js` lines 103-106, 642-645; `public/workflows/h3_open_t2v.json` ends in `SaveVideo`]
8. **Test first, before any UI:** start one PRO 6000 Pod. Install. Run `freevideo_t2v.json` at 1344x768, 5 s, Light. Record the install time, disk use and the first and second run times. Then try a PRO 4000 for the 24 GB case. The issue must say `needs-keys` with a budget. [Inference]
