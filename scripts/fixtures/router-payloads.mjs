// Independent native payload expectations; do not import the production mapper here.
export const prompt = 'A quiet field at sunrise'
export const expectedInputs = {
  'bfl/flux-2-pro': { prompt, width: 1024, height: 1024 },
  'bfl/flux-2-max': { prompt, width: 1024, height: 1024 },
  'bfl/flux-kontext-pro': { prompt, aspect_ratio: '1:1' },
  'luma/photon-flash-1': { prompt, aspect_ratio: '1:1' },
  'byteplus/seedream-5-0-flash-260915': { prompt, size: '1024x1024', response_format: 'url' },
  'byteplus/dreamina-seedance-2-5-260628': { content: [{ type: 'text', text: prompt }], duration: 5, resolution: '720p', ratio: '16:9' },
  'byteplus/seedance-1-0-pro-fast-251015': { content: [{ type: 'text', text: prompt }], duration: 5, resolution: '720p', ratio: '16:9' },
  'ltx/ltx-2-5-fast': { prompt, duration: 5, resolution: '1280x720', fps: 24 },
  'elevenlabs/eleven_v4_turbo': { inputs: [{ text: prompt, voice_id: '21m00Tcm4TlvDq8ikWAM' }] },
  'elevenlabs/eleven_sfx_v2': { text: prompt, duration_seconds: 5 },
}
