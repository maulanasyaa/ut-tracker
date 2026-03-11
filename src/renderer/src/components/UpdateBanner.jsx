import { useState, useEffect } from 'react'

const GITHUB_OWNER = 'maulanasyaa'
const GITHUB_REPO  = 'ut-tracker'
const CURRENT_VERSION = typeof __APP_VERSION__ !== 'undefined' ? __APP_VERSION__ : '1.0.0'

function semverGt(a, b) {
  // Returns true if version a > version b
  const pa = a.split('.').map(Number)
  const pb = b.split('.').map(Number)
  for (let i = 0; i < 3; i++) {
    if ((pa[i] || 0) > (pb[i] || 0)) return true
    if ((pa[i] || 0) < (pb[i] || 0)) return false
  }
  return false
}

export default function UpdateBanner() {
  const [state, setState] = useState('idle') // idle | checking | available | error | dismissed
  const [latestVersion, setLatestVersion] = useState(null)
  const [releaseUrl, setReleaseUrl]       = useState(null)

  useEffect(() => {
    // Check once on mount, after a short delay
    const timer = setTimeout(checkForUpdates, 4000)
    return () => clearTimeout(timer)
  }, [])

  const checkForUpdates = async () => {
    setState('checking')
    try {
      const res = await fetch(
        `https://api.github.com/repos/${GITHUB_OWNER}/${GITHUB_REPO}/releases/latest`,
        { headers: { Accept: 'application/vnd.github+json' } }
      )
      if (!res.ok) { setState('idle'); return }
      const data = await res.json()
      const latest = data.tag_name?.replace(/^v/, '') || '0.0.0'
      if (semverGt(latest, CURRENT_VERSION)) {
        setLatestVersion(latest)
        setReleaseUrl(data.html_url)
        setState('available')
      } else {
        setState('idle')
      }
    } catch {
      setState('idle') // Fail silently — no internet or API rate limit
    }
  }

  if (state !== 'available') return null

  return (
    <div className="flex items-center gap-3 px-4 py-2.5 bg-indigo-50 dark:bg-indigo-950/50 border-b border-indigo-200 dark:border-indigo-800 text-xs">
      {/* Update icon */}
      <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24"
        fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"
        className="text-indigo-500 dark:text-indigo-400 flex-shrink-0">
        <polyline points="23 4 23 10 17 10"/>
        <polyline points="1 20 1 14 7 14"/>
        <path d="M3.51 9a9 9 0 0 1 14.85-3.36L23 10M1 14l4.64 4.36A9 9 0 0 0 20.49 15"/>
      </svg>

      <span className="text-indigo-700 dark:text-indigo-300 flex-1">
        Versi baru tersedia —{' '}
        <span className="font-semibold">v{latestVersion}</span>
        {' '}(kamu pakai v{CURRENT_VERSION})
      </span>

      <a
        href={releaseUrl}
        target="_blank"
        rel="noreferrer"
        onClick={e => { e.stopPropagation(); window.open(releaseUrl, '_blank') }}
        className="flex-shrink-0 px-2.5 py-1 rounded-lg bg-indigo-500 hover:bg-indigo-600 text-white font-medium transition-colors"
      >
        Unduh
      </a>

      <button
        onClick={() => setState('dismissed')}
        className="flex-shrink-0 text-indigo-400 hover:text-indigo-600 dark:hover:text-indigo-300 transition-colors"
        title="Tutup"
      >
        <svg xmlns="http://www.w3.org/2000/svg" width="13" height="13" viewBox="0 0 24 24"
          fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/>
        </svg>
      </button>
    </div>
  )
}