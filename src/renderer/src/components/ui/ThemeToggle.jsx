const Moon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24"
    fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
    <path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z" />
  </svg>
)

const Sun = () => (
  <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24"
    fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
    <circle cx="12" cy="12" r="5" />
    <line x1="12" y1="1" x2="12" y2="3" />
    <line x1="12" y1="21" x2="12" y2="23" />
    <line x1="4.22" y1="4.22" x2="5.64" y2="5.64" />
    <line x1="18.36" y1="18.36" x2="19.78" y2="19.78" />
    <line x1="1" y1="12" x2="3" y2="12" />
    <line x1="21" y1="12" x2="23" y2="12" />
    <line x1="4.22" y1="19.78" x2="5.64" y2="18.36" />
    <line x1="18.36" y1="5.64" x2="19.78" y2="4.22" />
  </svg>
)

export function ThemeToggle({ isDark, onToggle, className = '' }) {
  return (
    <div
      className={`flex w-16 h-8 p-1 rounded-full cursor-pointer transition-all duration-300 ${
        isDark
          ? 'bg-zinc-950 border border-zinc-800'
          : 'bg-white border border-zinc-200'
      } ${className}`}
      onClick={onToggle}
      role="button"
      tabIndex={0}
      onKeyDown={e => e.key === 'Enter' && onToggle()}
    >
      <div className="flex justify-between items-center w-full">
        {/* Left knob */}
        <div className={`flex justify-center items-center w-6 h-6 rounded-full transition-transform duration-300 ${
          isDark
            ? 'translate-x-0 bg-zinc-800 text-white'
            : 'translate-x-8 bg-gray-200 text-gray-700'
        }`}>
          {isDark ? <Moon /> : <Sun />}
        </div>
        {/* Right icon */}
        <div className={`flex justify-center items-center w-6 h-6 rounded-full transition-transform duration-300 ${
          isDark ? 'bg-transparent text-gray-500' : '-translate-x-8 text-black'
        }`}>
          {isDark ? <Sun /> : <Moon />}
        </div>
      </div>
    </div>
  )
}
