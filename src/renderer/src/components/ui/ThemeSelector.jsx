import { useState, useRef, useEffect } from 'react'
import useStore from '../../store/useStore'
import { THEMES } from '../../themes'

export default function ThemeSelector() {
  const { theme, darkMode, setTheme } = useStore()
  const [open, setOpen] = useState(false)
  const ref = useRef(null)

  const current = THEMES.find(t => t.id === theme) || THEMES[0]

  useEffect(() => {
    const handler = (e) => { if (ref.current && !ref.current.contains(e.target)) setOpen(false) }
    document.addEventListener('mousedown', handler)
    return () => document.removeEventListener('mousedown', handler)
  }, [])

  const handleSelect = (id) => {
    setTheme(id)
    setOpen(false)
  }

  return (
    <div ref={ref} className="relative">
      {/* Trigger button */}
      <button
        onClick={() => setOpen(!open)}
        title="Ganti tema"
        className="flex items-center gap-1.5 h-8 px-2 rounded-lg text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors text-xs font-medium"
      >
        {/* Color swatch dot */}
        <span
          className="w-3 h-3 rounded-full flex-shrink-0 ring-1 ring-black/10"
          style={{ backgroundColor: darkMode ? current.swatch.dark : current.swatch.light }}
        />
        <span className="max-w-[52px] truncate">{current.name}</span>
        {/* Chevron */}
        <svg xmlns="http://www.w3.org/2000/svg" width="10" height="10" viewBox="0 0 24 24" fill="none"
          stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"
          className={`transition-transform flex-shrink-0 ${open ? 'rotate-180' : ''}`}>
          <polyline points="6 9 12 15 18 9"/>
        </svg>
      </button>

      {/* Dropdown */}
      {open && (
        <div className="absolute bottom-full left-0 mb-2 w-48 bg-white dark:bg-gray-900 rounded-xl border border-gray-200 dark:border-gray-700 shadow-lg overflow-hidden z-50">
          <div className="px-3 pt-2.5 pb-1">
            <p className="text-[10px] font-semibold text-gray-400 uppercase tracking-wider">Tema</p>
          </div>
          <div className="pb-1.5">
            {THEMES.map(t => {
              const isActive = t.id === theme
              return (
                <button
                  key={t.id}
                  onClick={() => handleSelect(t.id)}
                  className={`w-full flex items-center gap-3 px-3 py-2 text-left transition-colors ${
                    isActive
                      ? 'bg-gray-100 dark:bg-gray-800'
                      : 'hover:bg-gray-50 dark:hover:bg-gray-800'
                  }`}
                >
                  {/* Dual swatch (light + dark) */}
                  <div className="flex flex-shrink-0">
                    <span
                      className="w-3.5 h-3.5 rounded-full ring-1 ring-black/10"
                      style={{ backgroundColor: t.swatch.light }}
                    />
                    <span
                      className="w-3.5 h-3.5 rounded-full ring-1 ring-black/10 -ml-1.5"
                      style={{ backgroundColor: t.swatch.dark }}
                    />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-xs font-medium text-gray-800 dark:text-gray-200 leading-tight">{t.name}</p>
                    <p className="text-[10px] text-gray-400 leading-tight">{t.description}</p>
                  </div>
                  {isActive && (
                    <svg xmlns="http://www.w3.org/2000/svg" width="13" height="13" viewBox="0 0 24 24" fill="none"
                      stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"
                      className="text-gray-500 dark:text-gray-400 flex-shrink-0">
                      <polyline points="20 6 9 17 4 12"/>
                    </svg>
                  )}
                </button>
              )
            })}
          </div>
        </div>
      )}
    </div>
  )
}
