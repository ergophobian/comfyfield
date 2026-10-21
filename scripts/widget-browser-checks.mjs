import assert from 'node:assert/strict'
import fs from 'node:fs'
import path from 'node:path'
import { createServer } from 'vite'
import react from '@vitejs/plugin-react'
import { startBrowser, chromeExecutable, uiTimeout } from './browser.mjs'
import api from '../server/plugin.js'

const dir = path.resolve('outputs/widget-browser')
fs.mkdirSync(dir, { recursive: true })
process.env.COMFYFIELD_HOME = fs.mkdtempSync(path.join(dir, 'storage-'))
const fixtureImage = '/widget-fixture.png'
const mock = {
  name: 'widget-check-fixtures',
  configureServer(server) {
    server.middlewares.use(async (req, res, next) => {
      if (req.url === '/widget-fixture.png') {
        res.setHeader('Content-Type', 'image/png')
        return res.end(fs.readFileSync(path.join(dir, 'people.png')))
      }
      if (req.url === '/widget-checks') {
        res.setHeader('Content-Type', 'text/html')
        return res.end(await server.transformIndexHtml('/widget-checks', '<html><head><meta name="viewport" content="width=device-width, initial-scale=1"></head><body><div id="root"></div><script type="module" src="/scripts/widget-fixture.jsx"></script></body></html>'))
      }
      if (req.url.startsWith('/api/') && req.url !== '/api/upload' && !req.url.startsWith('/api/flows') && req.url !== '/api/agents/events') {
        res.setHeader('Content-Type', 'application/json')
        const out = ['/api/stitch/exports', '/api/agents', '/api/agents/setup'].includes(req.url) ? [] : req.url === '/api/library/characters' ? [{ id: 'test-character', name: 'Studio character', images: [fixtureImage] }] : req.url.startsWith('/api/library/') ? [] : {}
        return res.end(JSON.stringify(out))
      }
      next()
    })
  },
}
const vite = await createServer({ configFile: false, envFile: false, cacheDir: 'node_modules/.cache/widget-vite', plugins: [mock, react(), api()], server: { host: '127.0.0.1', port: 0, watch: { ignored: ['**/outputs/**'] } } })
await vite.listen()
const base = `http://127.0.0.1:${vite.httpServer.address().port}`
const delay = (ms) => new Promise((resolve) => setTimeout(resolve, ms))
let browser
try {
  browser = await startBrowser('widget-browser', {
    executable: process.env.WIDGET_CHROME || chromeExecutable(),
    args: ['--autoplay-policy=no-user-gesture-required'],
  })
  const cdp = browser.send
  const js = async (expression) => {
    const result = await cdp('Runtime.evaluate', { expression, awaitPromise: true, returnByValue: true })
    if (result.exceptionDetails) throw new Error(result.exceptionDetails.exception.description)
    return result.result.value
  }
  const wait = async (expression) => {
    for (const deadline = Date.now() + uiTimeout; Date.now() < deadline;) { if (await js(`Boolean(${expression})`)) return; await delay(100) }
    throw new Error(`Timed out: ${expression}`)
  }
  const click = async (selector) => {
    await js(`document.querySelector(${JSON.stringify(selector)}).scrollIntoView({block:'center'})`)
    const rect = await js(`(()=>{const r=document.querySelector(${JSON.stringify(selector)}).getBoundingClientRect();return {x:r.x+r.width/2,y:r.y+r.height/2}})()`)
    await cdp('Input.dispatchMouseEvent', { type: 'mousePressed', ...rect, button: 'left', clickCount: 1 })
    await cdp('Input.dispatchMouseEvent', { type: 'mouseReleased', ...rect, button: 'left', clickCount: 1 })
  }
  const button = async (widget, text) => {
    // Resolve by text before sending real pointer events, including buttons in nested toolbars.
    await js(`(()=>{const b=[...document.querySelectorAll('[data-widget="${widget}"] button')].find(b=>b.textContent===${JSON.stringify(text)});if(!b)throw Error('Missing button');b.dataset.clickTarget='yes'})()`)
    await click('[data-click-target=yes]')
    await js(`document.querySelector('[data-click-target=yes]').removeAttribute('data-click-target')`)
  }
  const values = () => js(`JSON.parse(document.querySelector('[data-values]').textContent)`)
  const upload = async (widget, file) => {
    const { root } = await cdp('DOM.getDocument')
    const { nodeId } = await cdp('DOM.querySelector', { nodeId: root.nodeId, selector: `[data-widget=${widget}] input[type=file]` })
    await cdp('DOM.setFileInputFiles', { nodeId, files: [file] })
    await wait(`JSON.parse(document.querySelector('[data-values]').textContent).${widget}?.url`)
  }
  const screenshot = async (name) => {
    const image = await cdp('Page.captureScreenshot', { format: 'png', captureBeyondViewport: true })
    fs.writeFileSync(path.join(dir, name), Buffer.from(image.data, 'base64'))
  }
  await cdp('Page.enable')
  await cdp('Emulation.setEmulatedMedia', { features: [{ name: 'prefers-reduced-motion', value: 'reduce' }] })
  await cdp('Emulation.setDeviceMetricsOverride', { width: 1280, height: 1000, deviceScaleFactor: 1, mobile: false })
  await cdp('Page.navigate', { url: `${base}/widget-checks` })
  await wait(`document.querySelectorAll('[data-widget]').length===4`)
  const png = await js(`(()=>{const c=document.createElement('canvas');c.width=800;c.height=500;const x=c.getContext('2d');x.fillStyle='#dce7ff';x.fillRect(0,0,800,500);x.fillStyle='#94b8be';x.beginPath();x.moveTo(0,500);x.lineTo(250,100);x.lineTo(500,500);x.fill();x.fillStyle='#748fc5';x.beginPath();x.moveTo(250,500);x.lineTo(600,70);x.lineTo(800,500);x.fill();for(const [cx,color] of [[280,'#e9b79c'],[530,'#c58f70']]){x.fillStyle=color;x.beginPath();x.arc(cx,210,55,0,Math.PI*2);x.fill();x.fillStyle='#384e89';x.fillRect(cx-65,270,130,160)}return c.toDataURL('image/png').split(',')[1]})()`)
  const imagePath = path.join(dir, 'people.png')
  fs.writeFileSync(imagePath, Buffer.from(png, 'base64'))
  await upload('mask', imagePath)
  await wait(`document.querySelector('[data-widget=mask] canvas')?.width===800`)
  await click('[data-widget=mask] canvas')
  await cdp('Input.dispatchKeyEvent', { type: 'keyDown', key: 'ArrowRight', code: 'ArrowRight', windowsVirtualKeyCode: 39 })
  await cdp('Input.dispatchKeyEvent', { type: 'keyDown', key: ' ', code: 'Space', windowsVirtualKeyCode: 32 })
  await button('mask', 'Save mask')
  await wait(`JSON.parse(document.querySelector('[data-values]').textContent).mask?.maskUrl`)
  let state = await values()
  assert.match(state.mask.maskUrl, /^\/media\/.*\.png$/)
  const pixels = await js(`(async()=>{const i=new Image();i.src=${JSON.stringify(state.mask.maskUrl)};await i.decode();const c=document.createElement('canvas');c.width=i.width;c.height=i.height;const x=c.getContext('2d');x.drawImage(i,0,0);return [Array.from(x.getImageData(0,0,1,1).data),Array.from(x.getImageData(408,250,1,1).data)]})()`)
  assert.deepEqual(pixels, [[0, 0, 0, 255], [255, 255, 255, 255]])
  await button('mask', 'Erase')
  await click('[data-widget=mask] canvas')
  assert.equal((await values()).mask.maskUrl, null)
  assert.equal(await js(`document.querySelector('[data-widget=mask] canvas').getContext('2d').getImageData(400,250,1,1).data[3]`), 0)
  await button('mask', 'Invert')
  assert.equal(await js(`document.querySelector('[data-widget=mask] canvas').getContext('2d').getImageData(0,0,1,1).data[3]`), 255)
  await button('mask', 'Clear')
  assert.equal(await js(`document.querySelector('[data-widget=mask] canvas').getContext('2d').getImageData(0,0,1,1).data[3]`), 0)
  await button('mask', 'Brush')
  await click('[data-widget=mask] canvas')
  await button('mask', 'Save mask')
  await wait(`JSON.parse(document.querySelector('[data-values]').textContent).mask?.maskUrl`)
  await upload('face', imagePath)
  await wait(`JSON.parse(document.querySelector('[data-values]').textContent).face?.box`)
  await button('face', 'Use this face')
  await wait(`JSON.parse(document.querySelector('[data-values]').textContent).face?.faceUrl`)
  assert.match((await values()).face.faceUrl, /^\/media\/.*\.png$/)
  await button('face', 'Library character')
  await wait(`document.querySelector('[data-widget=face] .pick')`)
  await click('[data-widget=face] .pick')
  assert.equal((await values()).face.characterId, 'test-character')
  await upload('crop', imagePath)
  await wait(`JSON.parse(document.querySelector('[data-values]').textContent).crop?.box`)
  await button('crop', '9:16')
  state = await values()
  assert.ok(Math.abs((state.crop.box.width * 800) / (state.crop.box.height * 500) - 9 / 16) < 0.0001)
  await click('[data-widget=crop] .widget-box')
  await cdp('Input.dispatchKeyEvent', { type: 'keyDown', key: 'ArrowRight', code: 'ArrowRight', windowsVirtualKeyCode: 39 })
  assert.ok((await values()).crop.box.x > state.crop.box.x)
  const webm = await js(`(async()=>{const c=document.createElement('canvas');c.width=320;c.height=180;const x=c.getContext('2d');const stream=c.captureStream(15);const r=new MediaRecorder(stream,{mimeType:'video/webm'});const chunks=[];r.ondataavailable=e=>chunks.push(e.data);const done=new Promise(resolve=>r.onstop=resolve);r.start();for(let i=0;i<30;i++){x.fillStyle=i%2?'#748fc5':'#dce7ff';x.fillRect(0,0,320,180);await new Promise(r=>setTimeout(r,70))}r.stop();await done;stream.getTracks().forEach(t=>t.stop());return await new Promise(resolve=>{const f=new FileReader();f.onload=()=>resolve(f.result.split(',')[1]);f.readAsDataURL(new Blob(chunks,{type:'video/webm'}))})})()`)
  const videoPath = path.join(dir, 'clip.webm')
  fs.writeFileSync(videoPath, Buffer.from(webm, 'base64'))
  await upload('video', videoPath)
  await wait(`JSON.parse(document.querySelector('[data-values]').textContent).video?.duration>0`)
  await js(`(()=>{const e=document.querySelector('[data-widget=video] input[type=number]');Object.getOwnPropertyDescriptor(HTMLInputElement.prototype,'value').set.call(e,'0.5');e.dispatchEvent(new Event('input',{bubbles:true}))})()`)
  assert.equal((await values()).video.trim.start, 0.5)
  await wait(`document.querySelector('[data-widget=video] video').readyState>=2&&!document.querySelector('[data-widget=video] video').seeking`)
  await button('video', 'Use this frame as poster')
  await wait(`JSON.parse(document.querySelector('[data-values]').textContent).video?.posterUrl`)
  assert.match((await values()).video.posterUrl, /^\/media\/.*\.png$/)
  await js(`(()=>{const v=document.querySelector('[data-widget=video] video');v.currentTime=0.5})()`)
  await wait(`!document.querySelector('[data-widget=video] video').seeking`)
  await delay(300)
  await js('window.scrollTo(0,0)')
  await screenshot('widgets-desktop.png')
  await cdp('Emulation.setDeviceMetricsOverride', { width: 390, height: 844, deviceScaleFactor: 1, mobile: true })
  await delay(200)
  assert.ok(await js('document.documentElement.scrollWidth<=390'), '390px page has no horizontal overflow')
  await screenshot('widgets-mobile.png')
  await js(`document.querySelector('[data-widget=crop] .widget-stage').scrollIntoView({block:'center'})`)
  const rect = await js(`(()=>{const r=document.querySelector('[data-widget=crop] .widget-stage').getBoundingClientRect();return {x:r.x+r.width/2,y:r.y+r.height/2}})()`)
  const before = (await values()).crop.box.x
  await cdp('Input.dispatchTouchEvent', { type: 'touchStart', touchPoints: [{ ...rect, id: 1 }] })
  await cdp('Input.dispatchTouchEvent', { type: 'touchMove', touchPoints: [{ x: rect.x + 15, y: rect.y, id: 1 }] })
  await cdp('Input.dispatchTouchEvent', { type: 'touchEnd', touchPoints: [] })
  assert.ok((await values()).crop.box.x > before, 'touch drag moves crop')
  await cdp('Page.navigate', { url: `${base}/flows` })
  await wait(`document.querySelector('.flows') && document.querySelector('.react-flow__renderer') && !document.querySelector('.agent-flow-status')`)
  for (const type of ['mask', 'face', 'video', 'crop']) {
    await js(`(()=>{const b=[...document.querySelectorAll('.ftool button')].find(b=>b.textContent==='Add');b.click()})()`)
    await wait(`[...document.querySelectorAll('.fpop .menu button')].some(b=>b.textContent.startsWith('Mask painter'))`)
    await js(`(()=>{const b=[...document.querySelectorAll('.fpop .menu button')].find(b=>b.textContent.startsWith(${JSON.stringify({ mask: 'Mask painter', face: 'Face picker', video: 'Video input', crop: 'Crop and reframe' }[type])}));b.click()})()`)
    await wait(`document.querySelector('.f-${type}')&&document.querySelector('.fpanel .widget-upload,.fpanel .widget')`)
  }
  await delay(400)
  await screenshot('widgets-flow-mobile.png')
  await cdp('Emulation.setDeviceMetricsOverride', { width: 1280, height: 1000, deviceScaleFactor: 1, mobile: false })
  await cdp('Page.navigate', { url: `${base}/apps/inpaint` })
  await wait(`document.querySelector('.app-main .widget-upload input[type=file]')`)
  const { root: appRoot } = await cdp('DOM.getDocument')
  const { nodeId: appFile } = await cdp('DOM.querySelector', { nodeId: appRoot.nodeId, selector: '.app-main input[type=file]' })
  await cdp('DOM.setFileInputFiles', { nodeId: appFile, files: [imagePath] })
  await wait(`document.querySelector('.app-main canvas')?.width===800`)
  await click('.app-main canvas')
  await js(`(()=>{const b=[...document.querySelectorAll('.app-main button')].find(b=>b.textContent==='Save mask');b.click()})()`)
  await wait(`[...document.querySelectorAll('.app-main button')].some(b=>b.textContent==='Mask saved')`)
  await js('window.scrollTo(0,0)')
  await screenshot('inpaint-desktop.png')
  await cdp('Emulation.setDeviceMetricsOverride', { width: 390, height: 844, deviceScaleFactor: 1, mobile: true })
  await delay(200)
  assert.ok(await js('document.documentElement.scrollWidth<=390'), 'inpaint app has no horizontal overflow')
  await screenshot('inpaint-mobile.png')
  console.log('Browser checks passed: PNG mask pixels, face crop and Library pick, aspect ratio, keyboard, touch, video trim/poster, four Flow nodes, 390px layout')
} catch (error) {
  const shot = await browser?.send('Page.captureScreenshot', { format: 'png', captureBeyondViewport: true }, 3000).catch(() => null)
  if (shot) fs.writeFileSync(path.join(dir, 'failure.png'), Buffer.from(shot.data, 'base64'))
  throw error
} finally {
  await browser?.close()
  await vite.close()
}
