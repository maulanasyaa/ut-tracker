import { useState } from 'react'
import useStore from '../store/useStore'
import SemesterModal from './SemesterModal'
import { ThemeToggle } from './ui/ThemeToggle'
import ThemeSelector from './ui/ThemeSelector'
import { BookIcon, BarChartIcon, SettingsIcon, XIcon, AlertIcon } from './ui/Icons'
import DataManagementModal from './DataManagementModal'
import AboutModal from './AboutModal'

function DeleteConfirmModal({ semester, onConfirm, onClose }) {
  return (
    <div className="fixed inset-0 bg-black/40 backdrop-blur-sm flex items-center justify-center z-50" onClick={e => e.target === e.currentTarget && onClose()}>
      <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-2xl p-6 w-full max-w-sm mx-4 border border-gray-200 dark:border-gray-700">
        <div className="flex items-center gap-3 mb-3">
          <div className="w-9 h-9 rounded-full bg-red-100 dark:bg-red-950 flex items-center justify-center flex-shrink-0">
            <AlertIcon size={16} className="text-red-500" />
          </div>
          <h3 className="font-semibold text-gray-900 dark:text-gray-100">Hapus Semester?</h3>
        </div>
        <p className="text-sm text-gray-500 dark:text-gray-400 mb-1">
          <span className="font-medium text-gray-700 dark:text-gray-300">{semester.nama} {semester.tahun}</span> beserta semua mata kuliah dan data aktivitasnya akan dihapus permanen.
        </p>
        <p className="text-xs text-red-500 mb-6">Tindakan ini tidak bisa dibatalkan.</p>
        <div className="flex gap-2">
          <button onClick={onClose} className="flex-1 py-2 text-sm text-gray-600 dark:text-gray-400 border border-gray-200 dark:border-gray-600 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 font-medium">
            Batal
          </button>
          <button onClick={onConfirm} className="flex-1 py-2 text-sm text-white bg-red-500 hover:bg-red-600 rounded-lg font-medium transition-colors">
            Hapus
          </button>
        </div>
      </div>
    </div>
  )
}

export default function Sidebar() {
  const {
    darkMode, toggleDarkMode,
    semesters, activeSemester, setActiveSemester, deleteSemester,
    matkulList, selectedMatkul, selectMatkul
  } = useStore()

  const [showSemesterModal, setShowSemesterModal] = useState(false)
  const [confirmDelete, setConfirmDelete] = useState(null)
  const [showDataModal, setShowDataModal] = useState(false)
  const [showAbout, setShowAbout] = useState(false)

  const handleDeleteConfirmed = async () => {
    await deleteSemester(confirmDelete.id)
    setConfirmDelete(null)
  }

  return (
    <aside className="w-60 flex-shrink-0 flex flex-col bg-gray-50 dark:bg-gray-900 border-r border-gray-200 dark:border-gray-800">

      {/* App Header */}
      <div className="px-5 pt-6 pb-4">
        <button
          onClick={() => setShowAbout(true)}
          className="flex items-center gap-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 px-2 py-1.5 -mx-2 transition-colors w-full text-left"
          title="Tentang UT-Tracker"
        >
          <BookIcon size={18} className="text-gray-600 dark:text-gray-400 flex-shrink-0" />
          <div>
            <h1 className="text-sm font-bold text-gray-900 dark:text-gray-100 leading-tight">UT-Tracker</h1>
            <p className="text-xs text-gray-400">Universitas Terbuka</p>
          </div>
        </button>
      </div>

      {/* Semester Section */}
      <div className="px-3 mb-1">
        <div className="flex items-center justify-between px-2 mb-1">
          <span className="text-xs font-semibold text-gray-400 uppercase tracking-wider">Semester</span>
          <button
            onClick={() => setShowSemesterModal(true)}
            className="text-xs text-indigo-500 hover:text-indigo-600 dark:text-indigo-400 dark:hover:text-indigo-300 font-medium"
          >
            + Tambah
          </button>
        </div>

        {semesters.length === 0 && (
          <p className="text-xs text-gray-400 px-2 py-1">Belum ada semester</p>
        )}

        {semesters.map(sem => (
          <button
            key={sem.id}
            onClick={() => setActiveSemester(sem.id)}
            className={`w-full text-left px-3 py-2 rounded-lg text-sm mb-0.5 flex items-center justify-between group transition-colors ${
              sem.id === activeSemester?.id
                ? 'bg-indigo-50 dark:bg-indigo-950 text-indigo-700 dark:text-indigo-300 font-medium'
                : 'text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-800'
            }`}
          >
            <span className="truncate">{sem.nama} {sem.tahun}</span>
            {sem.id !== activeSemester?.id && (
              <span
                onClick={e => { e.stopPropagation(); setConfirmDelete(sem) }}
                className="opacity-0 group-hover:opacity-100 ml-1 text-red-400 hover:text-red-500 flex-shrink-0 flex items-center"
              ><XIcon size={12} /></span>
            )}
          </button>
        ))}
      </div>

      {/* Divider */}
      <div className="mx-4 my-2 border-t border-gray-200 dark:border-gray-800" />

      {/* Mata Kuliah Section */}
      <div className="px-3 flex-1 overflow-y-auto">
        <div className="px-2 mb-1">
          <span className="text-xs font-semibold text-gray-400 uppercase tracking-wider">Mata Kuliah</span>
        </div>

        {/* Dashboard link */}
        <button
          onClick={() => selectMatkul(null)}
          className={`w-full text-left px-3 py-2 rounded-lg text-sm mb-0.5 flex items-center gap-2 transition-colors ${
            !selectedMatkul
              ? 'bg-indigo-50 dark:bg-indigo-950 text-indigo-700 dark:text-indigo-300 font-medium'
              : 'text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-800'
          }`}
        >
          <BarChartIcon size={15} className="flex-shrink-0" />
          <span>Dashboard</span>
        </button>

        {/* Matkul list */}
        {matkulList.length === 0 && (
          <p className="text-xs text-gray-400 px-2 py-1">Belum ada mata kuliah</p>
        )}

        {matkulList.map(mk => (
          <button
            key={mk.id}
            onClick={() => selectMatkul(mk)}
            className={`w-full text-left px-3 py-2 rounded-lg text-sm mb-0.5 transition-colors ${
              selectedMatkul?.id === mk.id
                ? 'bg-indigo-50 dark:bg-indigo-950 text-indigo-700 dark:text-indigo-300 font-medium'
                : 'text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-800'
            }`}
          >
            <div className="flex items-center justify-between">
              <span className="truncate">{mk.nama}</span>
              <span className="text-xs text-gray-400 ml-1 flex-shrink-0">{mk.progress ? Math.round(((mk.progress.tugas.done + mk.progress.diskusi.done + mk.progress.presensi.done) / 19) * 100) : 0}%</span>
            </div>
            <div className="mt-1 h-0.5 bg-gray-200 dark:bg-gray-700 rounded-full overflow-hidden">
              <div
                className="h-full bg-indigo-400 rounded-full transition-all"
                style={{ width: `${mk.progress ? Math.round(((mk.progress.tugas.done + mk.progress.diskusi.done + mk.progress.presensi.done) / 19) * 100) : 0}%` }}
              />
            </div>
          </button>
        ))}
      </div>

      {/* Footer */}
      <div className="px-5 pt-2 pb-0">
        <button
          onClick={() => setShowAbout(true)}
          className="text-[10px] text-gray-300 dark:text-gray-600 hover:text-gray-400 dark:hover:text-gray-500 transition-colors"
        >
          by Maulana Syarip Abdurahman
        </button>
      </div>
      <div className="px-4 py-3 border-t border-gray-200 dark:border-gray-800 flex items-center gap-1">
        <button
          onClick={() => setShowDataModal(true)}
          title="Kelola Data"
          className="w-8 h-8 rounded-lg flex items-center justify-center text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors flex-shrink-0"
        >
          <SettingsIcon size={16} />
        </button>
        <ThemeSelector />
        <div className="ml-auto flex-shrink-0">
          <ThemeToggle isDark={darkMode} onToggle={toggleDarkMode} />
        </div>
      </div>

      {showAbout && <AboutModal onClose={() => setShowAbout(false)} />}
      {showSemesterModal && <SemesterModal onClose={() => setShowSemesterModal(false)} />}
      {showDataModal && <DataManagementModal onClose={() => setShowDataModal(false)} />}
      {confirmDelete && (
        <DeleteConfirmModal
          semester={confirmDelete}
          onConfirm={handleDeleteConfirmed}
          onClose={() => setConfirmDelete(null)}
        />
      )}
    </aside>
  )
}
