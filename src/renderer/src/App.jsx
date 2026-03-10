import { useEffect } from 'react'
import { AnimatePresence, motion } from 'framer-motion'
import useStore from './store/useStore'
import Sidebar from './components/Sidebar'
import UpdateBanner from './components/UpdateBanner'
import Dashboard from './pages/Dashboard'
import MatkulDetail from './pages/MatkulDetail'

const pageVariants = {
  initial: { opacity: 0, y: 8 },
  animate: { opacity: 1, y: 0, transition: { duration: 0.18, ease: 'easeOut' } },
  exit:    { opacity: 0, y: -6, transition: { duration: 0.12, ease: 'easeIn' } }
}

export default function App() {
  const { darkMode, theme, init, selectedMatkul } = useStore()

  useEffect(() => { init() }, [])

  useEffect(() => {
    const unsub = window.api.backup.onTriggered(async () => {
      await window.api.backup.now()
    })
    return unsub
  }, [])

  return (
    <div className={darkMode ? 'dark' : ''} data-theme={theme || 'classic'} style={{ height: '100%' }}>
      <div className="flex flex-col h-full bg-white dark:bg-gray-950 text-gray-900 dark:text-gray-100 overflow-hidden">
        <UpdateBanner />
        <div className="flex flex-1 overflow-hidden">
          <Sidebar />
          <main className="flex-1 overflow-auto relative">
            <AnimatePresence mode="wait">
              {selectedMatkul ? (
                <motion.div
                  key={`matkul-${selectedMatkul}`}
                  variants={pageVariants}
                  initial="initial"
                  animate="animate"
                  exit="exit"
                  style={{ height: '100%' }}
                >
                  <MatkulDetail />
                </motion.div>
              ) : (
                <motion.div
                  key="dashboard"
                  variants={pageVariants}
                  initial="initial"
                  animate="animate"
                  exit="exit"
                  style={{ height: '100%' }}
                >
                  <Dashboard />
                </motion.div>
              )}
            </AnimatePresence>
          </main>
        </div>
      </div>
    </div>
  )
}
