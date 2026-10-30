import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App.jsx'

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <App />
  </StrictMode>,
)

// ── Auto-update guard ────────────────────────────────────────────────────────
// A tab that was left open keeps the old JS bundle in memory, so a new deploy is
// never shown until a manual hard refresh. On tab focus (and every few minutes)
// we compare the deployed bundle hash and reload once when it changes.
if (import.meta.env.PROD) {
  const current = Array.from(document.querySelectorAll('script[src]'))
    .map((s) => s.getAttribute('src') || '')
    .find((src) => /\/assets\/index-[A-Za-z0-9_-]+\.js$/.test(src))

  const checkForUpdate = async () => {
    if (!current) return
    try {
      const res = await fetch('/', { cache: 'no-store' })
      const html = await res.text()
      const match = html.match(/\/assets\/index-[A-Za-z0-9_-]+\.js/)
      if (match && match[0] !== current) window.location.reload()
    } catch {
      /* offline or blocked: ignore */
    }
  }

  window.addEventListener('focus', checkForUpdate)
  document.addEventListener('visibilitychange', () => {
    if (document.visibilityState === 'visible') checkForUpdate()
  })
  setInterval(checkForUpdate, 5 * 60 * 1000)
}