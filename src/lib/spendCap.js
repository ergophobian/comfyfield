import { useEffect, useState } from 'react'

// An optional spend cap per session. The cap is a setting (localStorage); the spend is this tab's
// (sessionStorage), counted from each run's estimate as it starts. A run that would take the session
// past the cap asks first. Runs started in the same tick, like the takes of one Generate, ask once.
const CAP = 'comfyfield.spendCap'
const SPENT = 'comfyfield.sessionSpend'

const read = (store, key) => {
  try { const n = parseFloat(store.getItem(key)); return Number.isFinite(n) && n >= 0 ? n : null } catch { return null }
}
export const spendCap = () => read(localStorage, CAP) || null
export const sessionSpend = () => read(sessionStorage, SPENT) || 0

const listeners = new Set()
export const spendQuestion = () => question
const notify = () => listeners.forEach((fn) => fn())

export function setSpendCap(usd) {
  try {
    if (usd > 0) localStorage.setItem(CAP, String(Math.round(usd * 100) / 100))
    else localStorage.removeItem(CAP)
  } catch {}
  notify()
}
export function resetSessionSpend() {
  try { sessionStorage.removeItem(SPENT) } catch {}
  notify()
}
function spend(usd) {
  try { sessionStorage.setItem(SPENT, String(sessionSpend() + usd)) } catch {}
  notify()
}

let question = null
let batch = null
let queue = Promise.resolve()

// Resolves true to run, false when the user cancels. Unknown costs pass without counting.
export function checkSpend(usd) {
  if (!(usd > 0)) return Promise.resolve(true)
  if (!spendCap() && !batch && !question) {
    spend(usd)
    return Promise.resolve(true)
  }
  if (!batch) {
    const current = batch = { usd: 0, runs: 0 }
    current.answer = new Promise((resolve) => setTimeout(() => {
      batch = null
      queue = queue.then(() => decide(current)).then(resolve, () => resolve(false))
    }))
  }
  batch.usd += usd
  batch.runs++
  return batch.answer
}

async function decide({ usd, runs }) {
  const cap = spendCap()
  const spent = sessionSpend()
  const ok = !cap || spent + usd <= cap || await new Promise((resolve) => {
    question = { usd, runs, cap, spent, answer: (yes) => { question = null; notify(); resolve(yes) } }
    notify()
  })
  if (ok) spend(usd)
  return ok
}

// The cap, the session's spend and the open question, for Connections and the ask sheet.
export function useSpend() {
  const [, tick] = useState(0)
  useEffect(() => {
    const fn = () => tick((n) => n + 1)
    listeners.add(fn)
    return () => listeners.delete(fn)
  }, [])
  return { cap: spendCap(), spent: sessionSpend(), question }
}
