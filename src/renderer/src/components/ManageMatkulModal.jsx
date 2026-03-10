import { useState } from 'react'
import { XIcon } from './ui/Icons'
import useStore from '../store/useStore'

export default function ManageMatkulModal({ onClose }) {
  const { activeSemester, matkulList, deleteMatkul, createMatkul } = useStore()

  const [newRows, setNewRows] = useState([])
  const [loading, setLoading] = useState(false)
  const [confirmDelete, setConfirmDelete] = useState(null)
  const [rowErrors, setRowErrors] = useState({})

  const addRow = () => setNewRows(prev => [...prev, { nama: '', kode: '', type: 'umum' }])
  const removeNewRow = (i) => {
    setNewRows(prev => prev.filter((_, idx) => idx !== i))
    setRowErrors(prev => { const n = { ...prev }; delete n[i]; return n })
  }
  const updateRow = (i, field, value) => {
    setNewRows(prev => prev.map((m, idx) => idx === i ? { ...m, [field]: value } : m))
    setRowErrors(prev => { const n = { ...prev }; delete n[i]; return n })
  }

  const validNew = newRows.filter(m => m.nama.trim())

  const handleSave = async () => {
    if (validNew.length === 0) { onClose(); return }

    const existingNames = matkulList.map(m => m.nama.trim().toLowerCase())
    const newNames = validNew.map(m => m.nama.trim().toLowerCase())
    const errors = {}

    newRows.forEach((m, i) => {
      if (!m.nama.trim()) return
      const lower = m.nama.trim().toLowerCase()
      if (existingNames.includes(lower)) {
        errors[i] = 'Sudah ada di semester ini'
      } else if (newNames.filter(n => n === lower).length > 1) {
        errors[i] = 'Nama duplikat'
      }
    })

    if (Object.keys(errors).length > 0) {
      setRowErrors(errors)
      return
    }

    setLoading(true)
    for (const m of validNew) {
      await createMatkul({
        semester_id: activeSemester.id,
        nama: m.nama.trim(),
        kode: m.kode.trim(),
        type: m.type
      })
    }
    setLoading(false)
    onClose()
  }

  const handleDelete = async (id) => {
    await deleteMatkul(id)
    setConfirmDelete(null)
  }

  return (
    <div className="fixed inset-0 bg-black/40 backdrop-blur-sm flex items-center justify-center z-50">
      <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-2xl p-6 w-full max-w-lg mx-4 border border-gray-200 dark:border-gray-700 overflow-visible">
        <h3 className="font-semibold text-gray-900 dark:text-gray-100 mb-1">Kelola Mata Kuliah</h3>
        <p className="text-xs text-gray-400 mb-5">{activeSemester?.nama} {activeSemester?.tahun}</p>

        {/* Existing matkul */}
        {matkulList.length > 0 && (
          <div className="mb-4">
            <p className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-2">Terdaftar</p>
            <div className="space-y-1.5">
              {matkulList.map(mk => (
                <div key={mk.id} className="flex items-center justify-between px-3 py-2 rounded-lg bg-gray-50 dark:bg-gray-700/50 border border-gray-100 dark:border-gray-700">
                  <div>
                    <span className="text-sm text-gray-800 dark:text-gray-200 font-medium">{mk.nama}</span>
                    {mk.kode && <span className="text-xs text-gray-400 ml-2">{mk.kode}</span>}
                  </div>
                  {confirmDelete === mk.id ? (
                    <div className="flex items-center gap-2">
                      <span className="text-xs text-red-500">Hapus?</span>
                      <button onClick={() => handleDelete(mk.id)} className="text-xs text-red-500 font-semibold hover:text-red-600">Ya</button>
                      <button onClick={() => setConfirmDelete(null)} className="text-xs text-gray-400 hover:text-gray-600">Tidak</button>
                    </div>
                  ) : (
                    <button
                      onClick={() => setConfirmDelete(mk.id)}
                      className="text-xs text-gray-300 hover:text-red-400 dark:text-gray-600 dark:hover:text-red-400 transition-colors"
                    >
                      Hapus
                    </button>
                  )}
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Add new */}
        {newRows.length > 0 && (
          <div className="mb-3">
            <p className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-2">Tambah Baru</p>
            <div className="space-y-2 max-h-48 overflow-y-auto py-1 px-1 -mx-1">
              {newRows.map((m, i) => (
                <div key={i}>
                  <div className="flex gap-2 items-center">
                    <input
                      type="text" value={m.nama}
                      onChange={e => updateRow(i, 'nama', e.target.value)}
                      placeholder="Nama matkul"
                      autoFocus={i === 0}
                      className={`flex-1 px-3 py-2 rounded-lg border bg-white dark:bg-gray-700 text-sm text-gray-900 dark:text-gray-100 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent ${rowErrors[i] ? 'border-red-400' : 'border-gray-200 dark:border-gray-600'}`}
                    />
                    <input
                      type="text" value={m.kode}
                      onChange={e => updateRow(i, 'kode', e.target.value)}
                      placeholder="Kode (opsional)"
                      className="w-32 px-3 py-2 rounded-lg border border-gray-200 dark:border-gray-600 bg-white dark:bg-gray-700 text-sm text-gray-900 dark:text-gray-100 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                    />
                    <select
                      value={m.type} onChange={e => updateRow(i, 'type', e.target.value)}
                      className="w-28 px-2 py-2 rounded-lg border border-gray-200 dark:border-gray-600 bg-white dark:bg-gray-700 text-sm text-gray-900 dark:text-gray-100 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                    >
                      <option value="umum">Umum</option>
                      <option value="berpraktik">Berpraktik</option>
                    </select>
                    <button onClick={() => removeNewRow(i)} className="text-red-400 hover:text-red-500 flex items-center"><XIcon size={14} /></button>
                  </div>
                  {rowErrors[i] && (
                    <p className="text-xs text-red-500 mt-0.5 ml-1">⚠ {rowErrors[i]}</p>
                  )}
                </div>
              ))}
            </div>
          </div>
        )}

        <button onClick={addRow} className="text-xs text-indigo-500 hover:text-indigo-600 dark:text-indigo-400 mb-5 block">
          + Tambah mata kuliah
        </button>

        <div className="flex gap-2">
          <button onClick={onClose} className="flex-1 py-2 text-sm text-gray-600 dark:text-gray-400 border border-gray-200 dark:border-gray-600 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700">
            Tutup
          </button>
          {validNew.length > 0 && (
            <button
              onClick={handleSave}
              disabled={loading}
              className="flex-1 py-2 text-sm text-white bg-indigo-500 hover:bg-indigo-600 rounded-lg font-medium disabled:opacity-50"
            >
              {loading ? 'Menyimpan...' : `Simpan (${validNew.length})`}
            </button>
          )}
        </div>
      </div>
    </div>
  )
}
