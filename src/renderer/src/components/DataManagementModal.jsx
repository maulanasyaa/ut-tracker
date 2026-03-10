import { useState, useEffect } from 'react'
import { UploadIcon, DownloadIcon, FolderIcon, SaveIcon, AlertIcon, CheckIcon, XIcon, PartyIcon } from './ui/Icons'
import useStore from '../store/useStore'

// ---- Tab Button ----
function Tab({ label, icon, active, onClick }) {
  return (
    <button
      onClick={onClick}
      className={`flex items-center gap-2 px-4 py-2.5 text-sm font-medium rounded-xl transition-colors ${
        active
          ? 'bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 shadow-sm'
          : 'text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300'
      }`}
    >
      <span>{icon}</span> {label}
    </button>
  )
}

// ==================== EXPORT TAB ====================
function ExportTab() {
  const [loading, setLoading] = useState(false)
  const [result, setResult] = useState(null)

  const handleExport = async () => {
    setLoading(true)
    setResult(null)
    const res = await window.api.data.export()
    setResult(res)
    setLoading(false)
  }

  return (
    <div className="space-y-5">
      <div className="rounded-xl border border-gray-200 dark:border-gray-700 p-5 bg-gray-50 dark:bg-gray-800/50">
        <div className="flex items-start gap-3">
          <UploadIcon size={22} className="text-gray-500 dark:text-gray-400 mt-0.5 flex-shrink-0" />
          <div>
            <p className="text-sm font-semibold text-gray-800 dark:text-gray-200 mb-1">Ekspor Semua Data</p>
            <p className="text-xs text-gray-500 dark:text-gray-400 leading-relaxed">
              Simpan seluruh data semester, mata kuliah, tugas, diskusi, dan presensi ke dalam file <span className="font-mono bg-gray-200 dark:bg-gray-700 px-1 py-0.5 rounded text-xs">.json</span>. File ini bisa digunakan untuk backup manual atau dipindah ke komputer lain.
            </p>
          </div>
        </div>
      </div>

      {result && result.success && (
        <div className="flex items-center gap-2 px-4 py-3 rounded-xl bg-green-50 dark:bg-green-950/40 border border-green-200 dark:border-green-800 text-sm text-green-700 dark:text-green-400">
          <CheckIcon size={14} /> Data berhasil diekspor! Folder tujuan telah dibuka.
        </div>
      )}
      {result && !result.success && (
        <div className="flex items-center gap-2 px-4 py-3 rounded-xl bg-gray-100 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 text-sm text-gray-500">
          <span>—</span> Export dibatalkan.
        </div>
      )}

      <button
        onClick={handleExport}
        disabled={loading}
        className="w-full py-2.5 rounded-xl bg-indigo-500 hover:bg-indigo-600 disabled:opacity-50 text-white text-sm font-medium transition-colors flex items-center justify-center gap-2"
      >
        {!loading && <DownloadIcon size={15} />}
        {loading ? 'Menyimpan...' : 'Pilih Lokasi & Ekspor'}
      </button>
    </div>
  )
}

// ==================== IMPORT TAB ====================
function ImportTab({ onDone }) {
  const { loadSemesters } = useStore()
  const [step, setStep] = useState('pick') // pick | review | done
  const [fileData, setFileData] = useState(null)
  const [error, setError] = useState(null)
  const [mode, setMode] = useState('merge')
  const [loading, setLoading] = useState(false)

  const handleOpenFile = async () => {
    setError(null)
    const res = await window.api.data.importOpen()
    if (!res) return
    if (res.error) { setError(res.error); return }
    setFileData(res.data)
    setStep('review')
  }

  const handleImport = async () => {
    setLoading(true)
    await window.api.data.importExecute(mode, fileData)
    await loadSemesters()
    setStep('done')
    setLoading(false)
  }

  if (step === 'done') return (
    <div className="text-center py-8">
      <PartyIcon size={40} className="text-gray-400 dark:text-gray-500 mx-auto mb-3" />
      <p className="text-sm font-semibold text-gray-800 dark:text-gray-200 mb-1">Import berhasil!</p>
      <p className="text-xs text-gray-400 mb-5">Data sudah masuk ke aplikasi.</p>
      <button onClick={onDone} className="px-5 py-2 rounded-xl bg-indigo-500 hover:bg-indigo-600 text-white text-sm font-medium">Selesai</button>
    </div>
  )

  if (step === 'review') return (
    <div className="space-y-4">
      {/* Preview */}
      <div className="rounded-xl border border-gray-200 dark:border-gray-700 p-4 bg-gray-50 dark:bg-gray-800/50 space-y-2">
        <p className="text-xs font-semibold text-gray-600 dark:text-gray-400 uppercase tracking-wider">Isi File</p>
        <div className="grid grid-cols-3 gap-2">
          {[
            { label: 'Semester', val: fileData?.semesters?.length ?? 0, color: 'text-indigo-600 dark:text-indigo-400' },
            { label: 'Mata Kuliah', val: fileData?.mata_kuliah?.length ?? 0, color: 'text-green-600 dark:text-green-400' },
            { label: 'Tugas', val: fileData?.tugas?.length ?? 0, color: 'text-amber-600 dark:text-amber-400' },
          ].map(({ label, val, color }) => (
            <div key={label} className="text-center rounded-lg bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 py-2">
              <p className={`text-lg font-bold ${color}`}>{val}</p>
              <p className="text-xs text-gray-400">{label}</p>
            </div>
          ))}
        </div>
        {fileData?.exported_at && (
          <p className="text-xs text-gray-400">Diekspor: {new Date(fileData.exported_at).toLocaleString('id-ID')}</p>
        )}
      </div>

      {/* Mode selection */}
      <div className="space-y-2">
        <p className="text-xs font-semibold text-gray-600 dark:text-gray-400 uppercase tracking-wider">Mode Import</p>
        {[
          { val: 'merge', icon: '🔀', title: 'Gabung (Merge)', desc: 'Tambahkan data baru. Semester & matkul yang sudah ada akan dilewati.' },
          { val: 'replace', icon: '♻️', title: 'Ganti (Replace)', desc: 'Hapus semua data yang ada lalu ganti dengan isi file ini.' },
        ].map(opt => (
          <button
            key={opt.val}
            onClick={() => setMode(opt.val)}
            className={`w-full flex items-start gap-3 px-4 py-3 rounded-xl border text-left transition-colors ${
              mode === opt.val
                ? 'bg-indigo-50 dark:bg-indigo-950/50 border-indigo-300 dark:border-indigo-700'
                : 'border-gray-200 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-800'
            }`}
          >
            <div className={`w-4 h-4 mt-0.5 rounded-full border-2 flex-shrink-0 flex items-center justify-center ${mode === opt.val ? 'border-indigo-500 bg-indigo-500' : 'border-gray-300 dark:border-gray-600'}`}>
              {mode === opt.val && <span className="w-1.5 h-1.5 rounded-full bg-white block" />}
            </div>
            <div>
              <p className="text-sm font-medium text-gray-900 dark:text-gray-100">{opt.icon} {opt.title}</p>
              <p className="text-xs text-gray-500 dark:text-gray-400 mt-0.5">{opt.desc}</p>
            </div>
          </button>
        ))}
      </div>

      {mode === 'replace' && (
        <div className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-red-50 dark:bg-red-950/40 border border-red-200 dark:border-red-800 text-xs text-red-600 dark:text-red-400">
          <AlertIcon size={14} /> Semua data saat ini akan dihapus permanen. Pastikan sudah ekspor dulu!
        </div>
      )}

      <div className="flex gap-2">
        <button onClick={() => setStep('pick')} className="flex-1 py-2 text-sm text-gray-600 dark:text-gray-400 border border-gray-200 dark:border-gray-600 rounded-xl hover:bg-gray-50 dark:hover:bg-gray-700">
          Kembali
        </button>
        <button onClick={handleImport} disabled={loading} className="flex-1 py-2 text-sm text-white bg-indigo-500 hover:bg-indigo-600 disabled:opacity-50 rounded-xl font-medium transition-colors">
          {loading ? 'Mengimport...' : 'Import Sekarang'}
        </button>
      </div>
    </div>
  )

  return (
    <div className="space-y-5">
      <div className="rounded-xl border border-gray-200 dark:border-gray-700 p-5 bg-gray-50 dark:bg-gray-800/50">
        <div className="flex items-start gap-3">
          <FolderIcon size={22} className="text-gray-500 dark:text-gray-400 mt-0.5 flex-shrink-0" />
          <div>
            <p className="text-sm font-semibold text-gray-800 dark:text-gray-200 mb-1">Import dari File</p>
            <p className="text-xs text-gray-500 dark:text-gray-400 leading-relaxed">
              Pilih file <span className="font-mono bg-gray-200 dark:bg-gray-700 px-1 py-0.5 rounded text-xs">.json</span> hasil ekspor UT-Tracker sebelumnya. Kamu bisa memilih mode gabung atau ganti.
            </p>
          </div>
        </div>
      </div>

      {error && (
        <div className="flex items-center gap-2 px-4 py-3 rounded-xl bg-red-50 dark:bg-red-950/40 border border-red-200 dark:border-red-800 text-sm text-red-600 dark:text-red-400">
          <AlertIcon size={14} /> {error}
        </div>
      )}

      <button onClick={handleOpenFile} className="w-full py-2.5 rounded-xl bg-indigo-500 hover:bg-indigo-600 text-white text-sm font-medium transition-colors flex items-center justify-center gap-2">
        <FolderIcon size={15} />
        Pilih File JSON
      </button>
    </div>
  )
}

// ==================== BACKUP TAB ====================
function BackupTab() {
  const [enabled, setEnabled]   = useState(false)
  const [folder, setFolder]     = useState('')
  const [interval, setInterval_] = useState(24)
  const [maxFiles, setMaxFiles] = useState(10)
  const [saving, setSaving]     = useState(false)
  const [backingUp, setBackingUp] = useState(false)
  const [lastResult, setLastResult] = useState(null)
  const [loaded, setLoaded]     = useState(false)

  useEffect(() => {
    const load = async () => {
      const [en, fo, iv, mx] = await Promise.all([
        window.api.settings.get('backup_enabled'),
        window.api.settings.get('backup_path'),
        window.api.settings.get('backup_interval'),
        window.api.settings.get('backup_max'),
      ])
      if (en !== null) setEnabled(!!en)
      if (fo) setFolder(fo)
      if (iv) setInterval_(iv)
      if (mx) setMaxFiles(mx)
      setLoaded(true)
    }
    load()
  }, [])

  const handleChooseFolder = async () => {
    const p = await window.api.backup.chooseFolder()
    if (p) setFolder(p)
  }

  const handleOpenFolder = async () => {
    const res = await window.api.backup.openFolder()
    if (!res.success) setLastResult({ type: 'backup', success: false, error: res.error })
  }

  const handleSave = async () => {
    setSaving(true)
    await window.api.settings.set('backup_enabled', enabled)
    await window.api.settings.set('backup_path', folder)
    await window.api.settings.set('backup_interval', interval)
    await window.api.settings.set('backup_max', maxFiles)
    window.api.backup.settingsChanged()
    setSaving(false)
    setLastResult({ type: 'saved' })
  }

  const handleBackupNow = async () => {
    setBackingUp(true)
    setLastResult(null)
    const res = await window.api.backup.now()
    setLastResult({ type: 'backup', ...res })
    setBackingUp(false)
  }

  if (!loaded) return <div className="text-center py-8 text-sm text-gray-400">Memuat...</div>

  return (
    <div className="space-y-5">
      {/* Enable toggle */}
      <div className="flex items-center justify-between px-4 py-3 rounded-xl border border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800/50">
        <div>
          <p className="text-sm font-medium text-gray-800 dark:text-gray-200">Auto Backup</p>
          <p className="text-xs text-gray-400">Backup otomatis berjalan di background</p>
        </div>
        <button
          onClick={() => setEnabled(!enabled)}
          className={`relative w-11 h-6 rounded-full transition-colors flex-shrink-0 ${enabled ? 'bg-indigo-500' : 'bg-gray-300 dark:bg-gray-600'}`}
        >
          <span className={`absolute top-0.5 left-0.5 w-5 h-5 rounded-full bg-white shadow transition-transform ${enabled ? 'translate-x-5' : ''}`} />
        </button>
      </div>

      {/* Folder */}
      <div>
        <label className="text-xs font-semibold text-gray-600 dark:text-gray-400 uppercase tracking-wider block mb-2">Folder Backup</label>
        <div className="flex gap-2">
          <div className="flex-1 px-3 py-2 rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-900 text-sm text-gray-600 dark:text-gray-400 truncate">
            {folder || <span className="text-gray-400 italic">Belum dipilih</span>}
          </div>
          <button onClick={handleChooseFolder} className="px-3 py-2 rounded-xl border border-gray-200 dark:border-gray-700 text-sm text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-800 flex-shrink-0">
            Pilih
          </button>
          <button
            onClick={handleOpenFolder}
            disabled={!folder}
            title="Buka folder backup"
            className="w-9 h-9 rounded-xl border border-gray-200 dark:border-gray-700 flex items-center justify-center text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800 disabled:opacity-30 disabled:cursor-not-allowed flex-shrink-0 transition-colors"
          >
            <svg xmlns="http://www.w3.org/2000/svg" width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
              <path d="M22 19a2 2 0 0 1-2 2H4a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h5l2 3h9a2 2 0 0 1 2 2z"/>
              <polyline points="16 10 12 14 8 10"/>
              <line x1="12" y1="14" x2="12" y2="6"/>
            </svg>
          </button>
        </div>
      </div>

      {/* Interval + Max */}
      <div className="grid grid-cols-2 gap-3">
        <div>
          <label className="text-xs font-semibold text-gray-600 dark:text-gray-400 uppercase tracking-wider block mb-2">Interval</label>
          <select
            value={interval}
            onChange={e => setInterval_(Number(e.target.value))}
            className="w-full px-3 py-2 rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-900 text-sm text-gray-800 dark:text-gray-200 focus:outline-none focus:ring-2 focus:ring-indigo-500"
          >
            <option value={1}>Setiap 1 jam</option>
            <option value={6}>Setiap 6 jam</option>
            <option value={12}>Setiap 12 jam</option>
            <option value={24}>Setiap 24 jam</option>
          </select>
        </div>
        <div>
          <label className="text-xs font-semibold text-gray-600 dark:text-gray-400 uppercase tracking-wider block mb-2">Maks File</label>
          <select
            value={maxFiles}
            onChange={e => setMaxFiles(Number(e.target.value))}
            className="w-full px-3 py-2 rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-900 text-sm text-gray-800 dark:text-gray-200 focus:outline-none focus:ring-2 focus:ring-indigo-500"
          >
            {[5, 10, 20, 50].map(n => <option key={n} value={n}>{n} file</option>)}
          </select>
        </div>
      </div>

      {/* Feedback */}
      {lastResult?.type === 'saved' && (
        <div className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-green-50 dark:bg-green-950/40 border border-green-200 dark:border-green-800 text-xs text-green-700 dark:text-green-400">
          <CheckIcon size={14} /> Pengaturan tersimpan. Scheduler diperbarui.
        </div>
      )}
      {lastResult?.type === 'backup' && lastResult.success && (
        <div className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-green-50 dark:bg-green-950/40 border border-green-200 dark:border-green-800 text-xs text-green-700 dark:text-green-400">
          <CheckIcon size={14} /> Backup berhasil disimpan!
        </div>
      )}
      {lastResult?.type === 'backup' && !lastResult.success && (
        <div className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-red-50 dark:bg-red-950/40 border border-red-200 dark:border-red-800 text-xs text-red-600 dark:text-red-400">
          <AlertIcon size={14} /> {lastResult.error || 'Backup gagal.'}
        </div>
      )}

      {/* Actions */}
      <div className="flex gap-2">
        <button
          onClick={handleBackupNow}
          disabled={backingUp || !folder}
          className="flex-1 py-2.5 rounded-xl border border-gray-200 dark:border-gray-700 text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-800 disabled:opacity-50 transition-colors font-medium"
        >
          {backingUp ? 'Membackup...' : 'Backup Sekarang'}
        </button>
        <button
          onClick={handleSave}
          disabled={saving}
          className="flex-1 py-2.5 rounded-xl bg-indigo-500 hover:bg-indigo-600 disabled:opacity-50 text-white text-sm font-medium transition-colors"
        >
          {saving ? 'Menyimpan...' : 'Simpan Pengaturan'}
        </button>
      </div>
    </div>
  )
}

// ==================== MAIN MODAL ====================
export default function DataManagementModal({ onClose }) {
  const [tab, setTab] = useState('export')

  return (
    <div className="fixed inset-0 bg-black/40 backdrop-blur-sm flex items-center justify-center z-50"
      onClick={e => e.target === e.currentTarget && onClose()}>
      <div className="bg-white dark:bg-gray-900 rounded-2xl shadow-2xl w-full max-w-md mx-4 border border-gray-200 dark:border-gray-700 overflow-hidden">

        {/* Header */}
        <div className="flex items-center justify-between px-6 pt-5 pb-4 border-b border-gray-100 dark:border-gray-800">
          <h2 className="text-base font-semibold text-gray-900 dark:text-gray-100">Kelola Data</h2>
          <button onClick={onClose} className="w-7 h-7 rounded-lg flex items-center justify-center text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800"><XIcon size={14} /></button>
        </div>

        {/* Tabs */}
        <div className="flex gap-1 px-4 pt-3 pb-1 bg-gray-50 dark:bg-gray-800/50">
          <Tab label="Ekspor"  icon={<UploadIcon size={14} />} active={tab === 'export'}  onClick={() => setTab('export')} />
          <Tab label="Import"  icon={<FolderIcon size={14} />} active={tab === 'import'}  onClick={() => setTab('import')} />
          <Tab label="Backup"  icon={<SaveIcon size={14} />} active={tab === 'backup'}  onClick={() => setTab('backup')} />
        </div>

        {/* Content */}
        <div className="px-6 py-5">
          {tab === 'export' && <ExportTab />}
          {tab === 'import' && <ImportTab onDone={onClose} />}
          {tab === 'backup' && <BackupTab />}
        </div>
      </div>
    </div>
  )
}
