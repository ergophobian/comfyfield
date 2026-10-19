# Set up ComfyField

ComfyField runs the studio and its local API on your computer. Models run at your connected providers; you do not need your own GPU. Starting and browsing the studio do not spend credits. Generation uses your providers' credits.

## Install Node.js

Use Node.js 22 or newer, with npm. The [official download page](https://nodejs.org/en/download) has installers and Linux instructions; choose version 22 or the current long-term support release.

- macOS: download the macOS `.pkg` for your Mac (Apple silicon or Intel), run it, then reopen Terminal.
- Windows: download the Windows `.msi` for your processor, keep npm and “Add to path” enabled, then reopen PowerShell or Command Prompt. In PowerShell, use `npm.cmd` and `npx.cmd` if script execution is disabled; no policy change is needed.
- Linux: follow the Node.js download page's instructions for your distribution or version manager, selecting Node 22 or newer. Older distribution packages may install an unsupported version. On a desktop, install your distribution's `xdg-utils` package to enable automatic browser opening; on a server, open the printed address yourself on that computer.

Run `node --version` and `npm --version` (`npm.cmd --version` on restricted PowerShell) to confirm both are available.

## Start from source today

Install Git from [git-scm.com](https://git-scm.com/downloads), or download this repository as a zip and extract it. With Git:

```sh
git clone https://github.com/ergophobian/comfyfield.git
cd comfyfield
npm start
```

On restricted PowerShell, the last command is `npm.cmd start`.

`npm start` checks every required app dependency and repairs partial installs, tries to download optional bundled ffmpeg, builds the app on the first start, then opens your browser. With a lockfile, setup uses `npm ci` to preserve locked versions. Installs run dependency lifecycle scripts, including the optional ffmpeg binary download. A failed download or unsupported architecture does not prevent startup: a working system ffmpeg is used instead, or startup warns that Stitch features are disabled. The first start needs internet access and space for dependencies; later starts reuse the build. After updating source, run `npm run build` before restarting. Developers can use `npm run dev` for live reload.

## Start without cloning after publication

The npm package must be published by a maintainer before this route is available. Until then, use the source instructions above. Once published:

```sh
npx comfyfield
```

On restricted PowerShell, use `npx.cmd comfyfield`. npm downloads the package and its bundled build; the app starts without a separate build command. No global install is needed. Publishing packages is not part of setup.

## First run and data

The terminal prints the studio URL and the **Connections** link. The app also offers **Open Connections** when no providers are connected. Paste keys into Connections when ready; you can explore without them. Comfy Cloud workflows need a Comfy key and an eligible paid plan. The startup account check uses only a saved key and a read-only request. It never generates, reads provider keys from the environment for diagnostics, or proves paid-plan entitlement; check the plan in Comfy. See [Comfy's account-check reference](https://docs.comfy.org/api-reference/cloud/user/get-current-user-information).

Data, saved keys and local media live in:

- macOS and Linux: `~/.comfyfield`
- Windows: `%APPDATA%\comfyfield`

The same folder is used by the app, CLI and agent server. To use an existing checkout's data or another drive, set `COMFYFIELD_HOME` to a parent folder; data then lives in `<that folder>/.comfyfield`, matching the existing override convention. For example:

```sh
# macOS or Linux
COMFYFIELD_HOME=/path/to/my-studio npm start
```

```powershell
# Windows PowerShell
$env:COMFYFIELD_HOME = 'D:\my-studio'
npm.cmd start
```

The launcher loads `.env`, `.env.local`, `.env.production` and `.env.production.local` from the app folder with the same Vite loader used by the development server (development uses its corresponding mode files). Existing shell variables take precedence. Put `COMFYFIELD_HOME` in `.env` to select storage before provider code loads. The loader does not log `.env` contents or provider key values.

Your existing checkout data is not moved automatically. Keep keys private and do not commit or share the data folder. Both `npm start` and `npm run dev` bind to `127.0.0.1` by default. Only loopback Host headers and same-origin browser requests can use the local API. Setting `COMFYFIELD_HOST` explicitly opts into another listen address and prints a warning: anyone with access can use saved connections and spend credits. Use only a trusted network and firewall. A wildcard bind such as `0.0.0.0` does not allow arbitrary Host headers; use the exact configured hostname/address or localhost. Keep the terminal open while working; press Ctrl+C to stop it.

## Common fixes

| Message or symptom | Fix |
| --- | --- |
| Node.js is too old | Install Node 22 or newer, reopen the terminal and check `node --version`. |
| `npm` or `npx` is not found | Reinstall Node with npm and its path option enabled, then reopen the terminal. |
| PowerShell blocks `npm.ps1` | Use `npm.cmd start` or `npx.cmd comfyfield`. |
| Port is in use | ComfyField tries the next 20 ports and prints its choice. To choose another range, run `npm start -- --port 5300` or `npx comfyfield --port 5300`. |
| Browser did not open | Open the printed URL on the same computer. Use `npm start -- --no-open` to suppress opening. |
| No keys yet | Open the printed Connections link; add only the providers you want to use. |
| Comfy rejects the key or access | Replace the saved key in Connections, check account access and paid plan in Comfy, then use Test. |
| Comfy cannot be reached | Check internet or proxy settings, then use Test in Connections later. You can still browse the studio. |
| ffmpeg is missing or cannot run | In the installed app folder, run `npm rebuild ffmpeg-static` with install scripts enabled; check access to GitHub release downloads. Or install ffmpeg for your operating system and add it to your system path. If neither binary works, browsing remains available and Stitch features are disabled. |
| Low disk space | Free space or choose another drive with `COMFYFIELD_HOME`. Startup checks the data, checkout and npm-cache drives, warns below 5 GB and pauses below 200 MB; leave at least 1 GB for setup and more for media. Moving data does not move dependencies or npm cache. |
| Cannot write the data folder | Set `COMFYFIELD_HOME` to a writable parent folder. Avoid running the studio as administrator. |
| Installation or build did not finish | Check internet access, disk space and Node version, then retry `npm start`. Keep npm install scripts enabled so the bundled ffmpeg download can run. |
| Page looks old after changing source | Stop the app, run `npm run build`, then `npm start`. |

ffmpeg is supplied by `ffmpeg-static` for supported macOS, Windows and Linux architectures. The shared resolver prefers a working system ffmpeg and falls back to the npm binary. An unsupported architecture, including Windows arm64, can start without the optional binary; install a compatible system ffmpeg to enable Stitch. The downloaded executable may include GPL components such as libx264. See [third-party notices](../NOTICE.md) for package/binary licenses, upstream source and redistribution requirements. To avoid the optional download, run `npm ci --omit=optional` before starting.
