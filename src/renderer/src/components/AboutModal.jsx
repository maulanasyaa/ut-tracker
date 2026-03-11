const APP_VERSION = typeof __APP_VERSION__ !== 'undefined' ? __APP_VERSION__ : '1.0.0'
const AUTHOR_NAME = 'Maulana Syarip Abdurahman'
const AUTHOR_URL   = 'https://github.com/maulanasyaa'
const SAWERIA_URL  = 'https://saweria.co/maulanasa'

export default function AboutModal({ onClose }) {
  const handleLink = (e) => {
    e.preventDefault()
    window.open(AUTHOR_URL, '_blank')
  }

  const handleSaweria = (e) => {
    e.preventDefault()
    window.open(SAWERIA_URL, '_blank')
  }

  return (
    <div
      className="fixed inset-0 bg-black/40 backdrop-blur-sm flex items-center justify-center z-50"
      onClick={e => e.target === e.currentTarget && onClose()}
    >
      <div className="bg-white dark:bg-gray-900 rounded-2xl shadow-2xl w-80 mx-4 border border-gray-200 dark:border-gray-700 overflow-hidden">

        {/* Header — icon + name */}
        <div className="flex flex-col items-center pt-8 pb-6 px-6 border-b border-gray-100 dark:border-gray-800">
          {/* App icon placeholder — uses actual icon if bundled */}
          <div className="w-16 h-16 rounded-2xl bg-indigo-500 flex items-center justify-center mb-4 shadow-lg">
            <svg xmlns="http://www.w3.org/2000/svg" width="32" height="32" viewBox="0 0 24 24"
              fill="none" stroke="white" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
              <path d="M4 19.5A2.5 2.5 0 0 1 6.5 17H20"/>
              <path d="M6.5 2H20v20H6.5A2.5 2.5 0 0 1 4 19.5v-15A2.5 2.5 0 0 1 6.5 2z"/>
            </svg>
          </div>
          <h2 className="text-base font-bold text-gray-900 dark:text-gray-100">UT-Tracker</h2>
          <p className="text-xs text-gray-400 mt-0.5">Versi {APP_VERSION}</p>
        </div>

        {/* Body — author info */}
        <div className="px-6 py-5 space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-xs text-gray-400">Dibuat oleh</span>
            <span className="text-xs font-medium text-gray-800 dark:text-gray-200">{AUTHOR_NAME}</span>
          </div>
          <div className="flex items-center justify-between">
            <span className="text-xs text-gray-400">GitHub</span>
            <button
              onClick={handleLink}
              className="text-xs font-medium text-indigo-500 dark:text-indigo-400 hover:underline"
            >
              @maulanasyaa
            </button>
          </div>
        </div>

        {/* Footer */}
        <div className="px-6 pb-5 flex flex-col gap-2">
          <button
            onClick={handleSaweria}
            className="w-full py-2 rounded-xl bg-amber-400 hover:bg-amber-500 text-sm text-white font-semibold transition-colors flex items-center justify-center gap-2"
          >
            <span>☕</span>
            <span>Traktir Kopi di Saweria</span>
          </button>
          <button
            onClick={onClose}
            className="w-full py-2 rounded-xl bg-gray-100 dark:bg-gray-800 hover:bg-gray-200 dark:hover:bg-gray-700 text-sm text-gray-600 dark:text-gray-400 font-medium transition-colors"
          >
            Tutup
          </button>
        </div>
      </div>
    </div>
  )
}