# Third-party notices

## ffmpeg and ffmpeg-static

ComfyField optionally installs `ffmpeg-static` to run ffmpeg as a separate process for Stitch. The npm package is licensed under the GNU General Public License version 3 or later. Downloaded ffmpeg executables have their own build-specific licenses; builds with GPL components (including libx264 used by Stitch) are covered by the GNU General Public License. They are not covered by ComfyField's application license.

- Package source, download scripts and build origins: https://github.com/eugeneware/ffmpeg-static
- Binary releases and associated build information: https://github.com/eugeneware/ffmpeg-static/releases
- ffmpeg source: https://ffmpeg.org/download.html#get-sources
- ffmpeg licensing: https://ffmpeg.org/legal.html
- GNU General Public License version 3: https://www.gnu.org/licenses/gpl-3.0.html

The dependency downloads binaries from upstream releases during its install lifecycle script. Consult the downloaded build's license, readme and `ffmpeg -L` output for exact terms and corresponding source/build information. Anyone redistributing a binary must preserve those notices and satisfy its license's corresponding-source obligations; this notice alone is not a source offer. ComfyField does not modify the executable. You can skip this optional dependency with `npm ci --omit=optional` and install a compatible system ffmpeg instead.
